<?php

namespace App\Services;

use App\Models\User;
use Illuminate\Support\Facades\Log;

class AuditLogger
{
    /**
     * Log chat-related actions for audit purposes.
     */
    public function logChatAction(User $user, string $action, array $data = []): void
    {
        $logData = [
            'user_id' => $user->user_id ?? $user->id,
            'user_name' => $user->name,
            'user_role' => $user->role,
            'action' => $action,
            'data' => $data,
            'ip_address' => request()->ip(),
            'user_agent' => request()->userAgent(),
            'timestamp' => now()->toISOString(),
        ];

        Log::channel('audit')->info('Chat action', $logData);
    }

    /**
     * Log message creation.
     */
    public function logMessageSent(User $user, int $conversationId, int $messageId): void
    {
        $this->logChatAction($user, 'message_sent', [
            'conversation_id' => $conversationId,
            'message_id' => $messageId,
        ]);
    }

    /**
     * Log message deletion.
     */
    public function logMessageDeleted(User $user, int $conversationId, int $messageId): void
    {
        $this->logChatAction($user, 'message_deleted', [
            'conversation_id' => $conversationId,
            'message_id' => $messageId,
        ]);
    }

    /**
     * Log message edit.
     */
    public function logMessageEdited(User $user, int $conversationId, int $messageId, string $oldBody, string $newBody): void
    {
        $this->logChatAction($user, 'message_edited', [
            'conversation_id' => $conversationId,
            'message_id' => $messageId,
            'old_body' => $oldBody,
            'new_body' => $newBody,
        ]);
    }

    /**
     * Log conversation creation.
     */
    public function logConversationCreated(User $user, int $conversationId, array $participantIds): void
    {
        $this->logChatAction($user, 'conversation_created', [
            'conversation_id' => $conversationId,
            'participant_ids' => $participantIds,
        ]);
    }

    /**
     * Log conversation deletion.
     */
    public function logConversationDeleted(User $user, int $conversationId): void
    {
        $this->logChatAction($user, 'conversation_deleted', [
            'conversation_id' => $conversationId,
        ]);
    }

    /**
     * Log file upload.
     */
    public function logFileUpload(User $user, int $conversationId, int $messageId, string $filename, int $fileSize): void
    {
        $this->logChatAction($user, 'file_uploaded', [
            'conversation_id' => $conversationId,
            'message_id' => $messageId,
            'filename' => $filename,
            'file_size' => $fileSize,
        ]);
    }

    /**
     * Log file download.
     */
    public function logFileDownload(User $user, int $conversationId, int $messageId, string $filename): void
    {
        $this->logChatAction($user, 'file_downloaded', [
            'conversation_id' => $conversationId,
            'message_id' => $messageId,
            'filename' => $filename,
        ]);
    }
}
