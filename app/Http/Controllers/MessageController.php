<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use App\Models\Message;
use App\Models\Conversation;
use App\Models\ConversationParticipant;
use App\Events\MessageSent;
use App\Events\MessageReadEvent;
use App\Events\Typing;
use App\Services\AuditLogger;
use App\Services\FileValidator;
use App\Policies\MessagePolicy;
use App\Models\MessageAttachment;
use Illuminate\Support\Facades\Storage;

class MessageController extends Controller
{
	public function __construct(
		private AuditLogger $auditLogger,
		private FileValidator $fileValidator
	) {}
	/**
	 * Display a listing of the resource.
	 */
	public function index()
	{
		$conversationId = request('conversation_id');
        $userId = Auth::user()->user_id ?? Auth::id();

		ConversationParticipant::where('conversation_id', $conversationId)
			->where('user_id', $userId)
			->firstOrFail();

        $messages = Message::where('conversation_id', $conversationId)
            ->with(['user', 'attachments'])
            ->orderBy('created_at')
            ->paginate(50);

        // Ensure each message has a sender name for reliable display on all roles
        try {
            $messages->getCollection()->transform(function ($msg) {
                $name = optional($msg->user)->name;
                if (!$name) {
                    $first = optional($msg->user)->first_name;
                    $last = optional($msg->user)->last_name;
                    $full = trim(($first ? (string) $first : '') . ' ' . ($last ? (string) $last : ''));
                    $name = $full !== '' ? $full : 'User';
                }
                $msg->user_name = $name;
                // Provide reply preview for easy UI rendering
                if (!empty($msg->reply_to_message_id)) {
                    try {
                        $parent = Message::select('id','body','user_id')->find($msg->reply_to_message_id);
                        if ($parent) {
                            $parentUser = \App\Models\User::select('user_id','name','first_name','last_name')->find($parent->user_id);
                            $parentName = $parentUser?->name ?: trim(((string) ($parentUser->first_name ?? '')) . ' ' . ((string) ($parentUser->last_name ?? '')));
                            if ($parentName === '') { $parentName = 'User'; }
                            $msg->reply_preview = [
                                'id' => $parent->id,
                                'body' => mb_strimwidth((string) $parent->body, 0, 120, '…'),
                                'user_id' => $parent->user_id,
                                'user_name' => $parentName,
                            ];
                        }
                    } catch (\Throwable $e) { /* ignore */ }
                }
                return $msg;
            });
        } catch (\Throwable $e) {
            // ignore transformation errors
        }

		return response()->json($messages);
	}

	/**
	 * Store a newly created resource in storage.
	 */
	public function store(Request $request)
	{
        $data = $request->validate([
            'conversation_id' => 'required|integer|exists:conversations,id',
            'body' => 'nullable|string',
            'reply_to_message_id' => 'nullable|integer|exists:messages,id',
            'pin' => 'sometimes|boolean',
        ]);
        $userId = Auth::user()->user_id ?? Auth::id();

		ConversationParticipant::where('conversation_id', $data['conversation_id'])
			->where('user_id', $userId)
			->firstOrFail();

        $message = Message::create([
            'conversation_id' => $data['conversation_id'],
            'user_id' => $userId,
            'body' => $data['body'] ?? '',
            'reply_to_message_id' => $data['reply_to_message_id'] ?? null,
            'metadata' => !empty($data['pin']) ? ['pinned' => true, 'pinned_at' => now()->toISOString()] : null,
        ]);

		// Update conversation's updated_at and last_message_id
		$conversation = Conversation::find($data['conversation_id']);
		$conversation->update([
			'last_message_id' => $message->id,
			'updated_at' => now(),
		]);

        $message->load(['user:user_id,name,first_name,last_name', 'attachments']);

        // Derive a stable display name for realtime payloads
        $displayName = $message->user->name ?? trim(((string) ($message->user->first_name ?? '')) . ' ' . ((string) ($message->user->last_name ?? '')));
        if ($displayName === '') {
            $displayName = 'User';
        }

        $payload = [
			'id' => $message->id,
			'conversation_id' => $message->conversation_id,
			'user_id' => $message->user_id,
			'user' => $message->user,
            'user_name' => $displayName,
			'body' => $message->body,
            'reply_to_message_id' => $message->reply_to_message_id,
            'metadata' => $message->metadata,
			'created_at' => $message->created_at?->toISOString(),
		];
		event(new MessageSent($message->conversation_id, $payload));

		// Notify other participants about new message
		$conversation = Conversation::with('participants.user')->find($message->conversation_id);
		foreach ($conversation->participants as $participant) {
			if ($participant->user_id !== $userId) {
				\App\Services\NotificationService::notifyNewChatMessage(
					$participant->user,
					Auth::user(),
					$message->body,
					$message->conversation_id
				);
			}
		}

		// Log message creation for audit
		$this->auditLogger->logMessageSent(Auth::user(), $message->conversation_id, $message->id);

        // Also attach user_name in the response for immediate UI consistency
        $message->user_name = $displayName;
        return response()->json($message->load(['user','attachments']), 201);
	}

	public function markRead(Request $request)
	{
		$data = $request->validate([
			'message_id' => 'required|integer|exists:messages,id',
		]);
        try {
            $userId = Auth::user()->user_id ?? Auth::id();
            $message = Message::with('conversation')->findOrFail($data['message_id']);

            $participant = ConversationParticipant::where('conversation_id', $message->conversation_id)
                ->where('user_id', $userId)
                ->first();

            // If the user is not a participant, silently ignore to avoid noisy errors on clients
            if (!$participant) {
                return response()->noContent();
            }

            // Only update if newer
            if (empty($participant->last_read_message_id) || (int) $participant->last_read_message_id < (int) $message->id) {
                $participant->last_read_message_id = $message->id;
                $participant->save();
            }

            event(new MessageReadEvent($message->conversation_id, $message->id, $userId));
            return response()->noContent();
        } catch (\Throwable $e) {
            // Be permissive: clients should not be blocked by read-receipt errors
            return response()->noContent();
        }
	}

	public function typing(Request $request, int $conversationId)
	{
		$data = $request->validate([
			'typing' => 'required|boolean',
		]);
		$userId = Auth::user()->user_id ?? Auth::id();
		ConversationParticipant::where('conversation_id', $conversationId)
			->where('user_id', $userId)
			->firstOrFail();

		event(new Typing($conversationId, $userId, $data['typing']));
		return response()->noContent();
	}

	/**
	 * Display the specified resource.
	 */
	public function show(string $id)
	{
		//
	}

	/**
	 * Update the specified resource in storage.
	 */
	public function update(Request $request, string $id)
	{
        $data = $request->validate([
            'body' => 'required|string',
            'reply_to_message_id' => 'nullable|integer|exists:messages,id',
            'pin' => 'sometimes|boolean',
        ]);
        $userId = Auth::user()->user_id ?? Auth::id();
        $message = Message::findOrFail($id);
        // Only author can edit their message
        if ((int) $message->user_id !== (int) $userId) {
            return response()->json(['message' => 'Forbidden'], 403);
        }
        $message->body = $data['body'];
        if (array_key_exists('reply_to_message_id', $data)) {
            $message->reply_to_message_id = $data['reply_to_message_id'];
        }
        if (!empty($data['pin'])) {
            $meta = (array) ($message->metadata ?? []);
            $meta['pinned'] = true;
            $meta['pinned_at'] = now()->toISOString();
            $message->metadata = $meta;
        }
        $message->save();
        $message->load(['user:user_id,name,first_name,last_name', 'attachments']);
        // Broadcast edited payload (reuse MessageSent channel with a different event name if needed)
        try {
            event(new \App\Events\MessageEdited($message->conversation_id, [
                'id' => $message->id,
                'body' => $message->body,
                'attachments' => $message->attachments,
            ]));
        } catch (\Throwable $e) { /* ignore broadcast failures */ }
        return response()->json($message);
	}

	/**
	 * Remove the specified resource from storage.
	 */
	public function destroy(string $id)
	{
        $userId = Auth::user()->user_id ?? Auth::id();
        $message = Message::findOrFail($id);
        // Only author can delete their message
        if ((int) $message->user_id !== (int) $userId) {
            return response()->json(['message' => 'Forbidden'], 403);
        }
        $conversationId = $message->conversation_id;
        $message->delete();
        try {
            event(new \App\Events\MessageDeleted($conversationId, (int) $id));
        } catch (\Throwable $e) { /* ignore broadcast failures */ }
        return response()->noContent();
	}

	/**
	 * Upload a file attachment to a message.
	 */
	public function uploadFile(Request $request, int $messageId)
	{
		$request->validate([
			'file' => 'required|file',
		]);

		$userId = Auth::user()->user_id ?? Auth::id();
		$message = Message::with('conversation')->findOrFail($messageId);

		// Check if user can access this message
		ConversationParticipant::where('conversation_id', $message->conversation_id)
			->where('user_id', $userId)
			->firstOrFail();

		$file = $request->file('file');
		$validation = $this->fileValidator->validate($file);

		if (!$validation['valid']) {
			return response()->json([
				'message' => 'File validation failed',
				'errors' => $validation['errors'],
			], 422);
		}

		// Store the file
		$path = $file->store('chat-attachments', 'public');
		$filename = $file->getClientOriginalName();

		// Create attachment record
        $attachment = MessageAttachment::create([
			'message_id' => $messageId,
			'disk' => 'public',
			'path' => $path,
			'filename' => $filename,
			'mime' => $file->getMimeType(),
			'size' => $file->getSize(),
		]);

		// Log file upload for audit
		$this->auditLogger->logFileUpload(Auth::user(), $message->conversation_id, $messageId, $filename, $file->getSize());

        // Broadcast a lightweight attachment-added event so UIs can refresh message
        try {
            event(new \App\Events\MessageEdited($message->conversation_id, [
                'id' => $messageId,
                'body' => $message->body,
                'attachments' => $message->attachments,
            ]));
        } catch (\Throwable $e) { /* ignore */ }

        return response()->json([
			'message' => 'File uploaded successfully',
			'attachment' => $attachment,
		], 201);
	}

	/**
	 * Download a file attachment.
	 */
	public function downloadFile(int $messageId, string $filename)
	{
		$userId = Auth::user()->user_id ?? Auth::id();
		$message = Message::with('conversation')->findOrFail($messageId);

		// Check if user can access this message
		ConversationParticipant::where('conversation_id', $message->conversation_id)
			->where('user_id', $userId)
			->firstOrFail();

		$attachment = MessageAttachment::where('message_id', $messageId)
			->where('filename', $filename)
			->firstOrFail();

		// Log file download for audit
		$this->auditLogger->logFileDownload(Auth::user(), $message->conversation_id, $messageId, $filename);

		$filePath = Storage::disk($attachment->disk)->path($attachment->path);
		
		if (!file_exists($filePath)) {
			abort(404, 'File not found');
		}
		
		return response()->download($filePath, $attachment->filename);
	}
}
