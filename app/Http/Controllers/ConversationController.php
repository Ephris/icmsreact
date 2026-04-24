<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Conversation;
use App\Models\ConversationParticipant;
use App\Models\User;
use Illuminate\Support\Facades\Auth;
use App\Services\ContactsResolver;
use App\Services\AuditLogger;

class ConversationController extends Controller
{
    public function __construct(
        private AuditLogger $auditLogger
    ) {}
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $userId = Auth::user()->user_id ?? Auth::id();
        $currentUser = Auth::user();
        $conversations = Conversation::query()
            ->whereHas('participants', function ($q) use ($userId) {
                $q->where('user_id', $userId);
            })
            ->with(['participants.user', 'messages' => function ($q) {
                $q->latest()->limit(1);
            }, 'pinned' => function ($q) {
                $q->select('id','body','user_id');
            }])
            ->latest('updated_at')
            ->get()
            ->map(function ($conversation) use ($currentUser) {
                try {
                    $participantIds = $conversation->participants->pluck('user_id')->unique()->values()->all();
                    $type = ($conversation->is_group ?? false) ? 'group' : ((count($participantIds) > 2) ? 'group' : 'direct');
                    // For direct chats, always compute a per-view title so each user sees the counterpart name
                    if ($type === 'direct') {
                        $conversation->title = $this->generateTitle($participantIds, $currentUser, 'direct');
                    } else {
                        $title = (string) ($conversation->title ?? '');
                        if (trim($title) === '') {
                            $conversation->title = $this->generateTitle($participantIds, $currentUser, $type);
                        }
                    }
                    // compute unread count for current user
                    try {
                        $selfId = $currentUser->user_id ?? $currentUser->id;
                        $lastReadId = \App\Models\ConversationParticipant::where('conversation_id', $conversation->id)
                            ->where('user_id', $selfId)
                            ->value('last_read_message_id') ?? 0;
                        $unread = \App\Models\Message::where('conversation_id', $conversation->id)
                            ->when($lastReadId, fn($q) => $q->where('id', '>', (int) $lastReadId))
                            ->count();
                        $conversation->unread_count = $unread;
                    } catch (\Throwable $e) {
                        $conversation->unread_count = 0;
                    }
                } catch (\Throwable $e) {
                    // leave title as-is on failure
                }
                return $conversation;
            })
            // Server-side de-duplication of 1:1 conversations by participant pair (keep most recent)
            ->sortByDesc('updated_at')
            ->unique(function ($conversation) {
                try {
                    $ids = $conversation->participants->pluck('user_id')->filter()->unique()->sort()->values()->all();
                    if (count($ids) === 2 && !($conversation->is_group ?? false)) {
                        return 'pair:' . implode('-', $ids);
                    }
                    return 'id:' . $conversation->id;
                } catch (\Throwable $e) {
                    return 'id:' . $conversation->id;
                }
            })
            ->values();

        return response()->json($conversations);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $data = $request->validate([
            'participant_ids' => 'required|array|min:1',
            'participant_ids.*' => 'integer',
            'title' => 'nullable|string|max:255',
            'is_group' => 'boolean',
        ]);

        $currentUser = Auth::user();
        $userId = $currentUser->user_id ?? Auth::id();

        // Enforce allowed role pairs
        $allowedIds = app(ContactsResolver::class)->getAllowedUserIds($currentUser);
        $requested = collect($data['participant_ids'])->unique()->values();
        $disallowed = $requested->reject(fn ($pid) => in_array($pid, $allowedIds, true));
        if ($disallowed->isNotEmpty()) {
            return response()->json([
                'message' => 'One or more participants are not allowed for your role.',
                'disallowed' => $disallowed->values(),
            ], 403);
        }

        $participantIds = array_unique(array_merge($requested->all(), [$userId]));

        // Prevent self-conversations
        if (count($participantIds) <= 1) {
            return response()->json(['message' => 'Cannot create conversation with yourself or no valid participants'], 400);
        }

        // Check for existing 1:1 conversation (non-group) with exactly these two participants
        if (count($participantIds) === 2) {
            $existing = Conversation::query()
                ->where('is_group', false)
                ->whereHas('participants', function ($q) use ($participantIds) {
                    $q->where('user_id', $participantIds[0]);
                })
                ->whereHas('participants', function ($q) use ($participantIds) {
                    $q->where('user_id', $participantIds[1]);
                })
                ->withCount('participants')
                ->having('participants_count', '=', 2)
                ->with('participants.user')
                ->first();
            if ($existing) {
                // For direct chats, compute per-view title before returning
                try {
                    $ids = $existing->participants->pluck('user_id')->unique()->values()->all();
                    $existing->title = $this->generateTitle($ids, $currentUser, 'direct');
                } catch (\Throwable $e) {}
                return response()->json($existing, 200);
            }
        }

        $participantCount = count($participantIds);
        $isGroup = $participantCount > 2;
        $type = $isGroup ? 'group' : 'direct';

        // For direct chats, avoid persisting a title so each viewer gets a personalized title
        $conversation = Conversation::create([
            'is_group' => $isGroup,
            'type' => $type,
            'title' => $isGroup ? ($data['title'] ?? $this->generateTitle($participantIds, $currentUser, $type)) : null,
            'created_by_id' => $userId,
        ]);

        foreach ($participantIds as $pid) {
            ConversationParticipant::create([
                'conversation_id' => $conversation->id,
                'user_id' => $pid,
                'role' => '',
            ]);
        }

        // Log conversation creation for audit
        $this->auditLogger->logConversationCreated($currentUser, $conversation->id, $participantIds);

        return response()->json($conversation->load('participants'), 201);
    }

    /**
     * Get users that the current user can chat with based on role permissions.
     */
    public function getChatUsers()
    {
        try {
            $currentUser = Auth::user();
            try {
                $allowedIds = app(ContactsResolver::class)->getAllowedUserIds($currentUser);
            } catch (\Throwable $e) {
                $allowedIds = [];
            }

            $users = \App\Models\User::whereIn('user_id', !empty($allowedIds) ? $allowedIds : [-1])
                ->where('user_id', '!=', $currentUser->user_id ?? $currentUser->id)
                ->with([
                    // Avoid selecting columns explicitly because PKs are not named `id` in these tables
                    'department',
                    'assignedCompany',
                    'student:student_id,user_id,first_name,last_name',
                    'advisorAssignments'
                ])
                ->get()
                ->map(function ($user) use ($currentUser) {
                    try {
                        $first = $user->first_name ?? optional($user->student)->first_name;
                        $last = $user->last_name ?? optional($user->student)->last_name;
                        $fallback = trim(((string) ($first ?? '')) . ' ' . ((string) ($last ?? '')));
                        $displayName = $user->name ?: ($fallback !== '' ? $fallback : 'User');
                        $userData = [
                            'id' => $user->user_id,
                            'name' => $displayName,
                            'role' => $user->role,
                            'email' => $user->email ?? null,
                            'department' => $user->department ? ['name' => ($user->department->name ?? '')] : null,
                            'company' => $user->assignedCompany ? ['name' => ($user->assignedCompany->name ?? '')] : null,
                            'references' => []
                        ];

                        // Add role-specific references safely
                        switch ($user->role) {
                            case 'supervisor':
                                try {
                                    $supervisorAssignments = \App\Models\SupervisorAssignment::where('supervisor_id', $user->user_id)
                                        ->with(['posting.company:id,name'])
                                        ->get();
                                    if ($supervisorAssignments && $supervisorAssignments->isNotEmpty()) {
                                        $userData['references'] = [['type' => 'supervisor', 'assigned_students' => $supervisorAssignments->count()]];
                                    }
                                } catch (\Throwable $e) {
                                    // ignore per-user enrichment errors
                                }
                                break;

                            case 'advisor':
                                try {
                                    if (!empty($user->advisorAssignments) && $user->advisorAssignments->isNotEmpty()) {
                                        $userData['references'] = [['type' => 'advisor', 'assigned_students' => $user->advisorAssignments->count()]];
                                    }
                                } catch (\Throwable $e) {
                                    // ignore
                                }
                                break;

                            case 'dept_head':
                                if (!empty($user->department)) {
                                    $deptName = $user->department->name ?? null;
                                    if ($deptName) {
                                        $userData['references'] = [[
                                            'type' => 'department_head',
                                            'department_name' => $deptName,
                                        ]];
                                    }
                                }
                                break;

                            case 'company_admin':
                                if (!empty($user->assignedCompany)) {
                                    $compName = $user->assignedCompany->name ?? null;
                                    if ($compName) {
                                        $userData['references'] = [[
                                            'type' => 'company_admin',
                                            'company_name' => $compName,
                                        ]];
                                    }
                                }
                                break;
                        }

                        return $userData;
                    } catch (\Throwable $e) {
                        return [
                            'id' => $user->user_id,
                            'name' => $user->name ?? 'User',
                            'role' => $user->role ?? 'user',
                            'email' => $user->email ?? null,
                            'department' => null,
                            'company' => null,
                            'references' => [],
                        ];
                    }
                });

            return response()->json(['users' => $users]);
        } catch (\Throwable $e) {
            return response()->json(['users' => []]);
        }
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        $currentUser = Auth::user();
        $userId = $currentUser->user_id ?? Auth::id();
        $conversation = Conversation::with(['participants.user', 'pinned'])
            ->where('id', $id)
            ->whereHas('participants', fn($q) => $q->where('user_id', $userId))
            ->firstOrFail();

        // Ensure a human-friendly, per-view title is always present in the response
        try {
            $participantIds = $conversation->participants->pluck('user_id')->unique()->values()->all();
            $type = ($conversation->is_group ?? false) ? 'group' : ((count($participantIds) > 2) ? 'group' : 'direct');
            if ($type === 'direct') {
                $conversation->title = $this->generateTitle($participantIds, $currentUser, 'direct');
            } else {
                $title = (string) ($conversation->title ?? '');
                if (trim($title) === '') {
                    $conversation->title = $this->generateTitle($participantIds, $currentUser, $type);
                }
            }
        } catch (\Throwable $e) {
            // ignore
        }

        // Attach pinned summary for convenient UI rendering
        try {
            if ($conversation->pinned) {
                $message = $conversation->pinned;
                $user = \App\Models\User::select('user_id','name','first_name','last_name','role')->find($message->user_id);
                $name = $user?->name ?: trim(((string) ($user->first_name ?? '')) . ' ' . ((string) ($user->last_name ?? '')));
                if ($name === '') { $name = 'User'; }
                $conversation->pinned_summary = [
                    'id' => $message->id,
                    'body' => mb_strimwidth((string) $message->body, 0, 160, '…'),
                    'user_name' => $name,
                    'user_role' => $user?->role,
                ];
            }
        } catch (\Throwable $e) { /* ignore */ }

        return response()->json($conversation);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
        //
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        $userId = Auth::id();
        $conversation = Conversation::where('id', $id)
            ->where('created_by_id', $userId)
            ->firstOrFail();
        
        // Log conversation deletion for audit
        $this->auditLogger->logConversationDeleted(Auth::user(), $conversation->id);
        
        $conversation->delete();
        return response()->noContent();
    }

    /**
     * Pin a message to the conversation
     */
    public function pinMessage(Request $request, int $conversationId, int $messageId)
    {
        // If migration not applied yet, avoid 500 and return a helpful error
        try {
            if (!\Illuminate\Support\Facades\Schema::hasColumn('conversations', 'pinned_message_id')) {
                return response()->json(['message' => 'Pinning is not available yet. Please run migrations to add pinned_message_id.'], 409);
            }
        } catch (\Throwable $e) {
            // If schema check fails, return a safe response instead of 500
            return response()->json(['message' => 'Pinning currently unavailable.'], 409);
        }
        $userId = Auth::user()->user_id ?? Auth::id();
        // Ensure user is participant
        ConversationParticipant::where('conversation_id', $conversationId)
            ->where('user_id', $userId)
            ->firstOrFail();
        $message = \App\Models\Message::where('conversation_id', $conversationId)->findOrFail($messageId);
        $conversation = Conversation::findOrFail($conversationId);
        $conversation->pinned_message_id = $message->id;
        $conversation->save();
        return response()->json($conversation->load('pinned'));
    }

    /**
     * Unpin message from conversation
     */
    public function unpinMessage(Request $request, int $conversationId)
    {
        // If migration not applied yet, avoid 500 and return a helpful error
        try {
            if (!\Illuminate\Support\Facades\Schema::hasColumn('conversations', 'pinned_message_id')) {
                return response()->json(['message' => 'Unpin is not available yet. Please run migrations to add pinned_message_id.'], 409);
            }
        } catch (\Throwable $e) {
            return response()->json(['message' => 'Unpin currently unavailable.'], 409);
        }
        $userId = Auth::user()->user_id ?? Auth::id();
        ConversationParticipant::where('conversation_id', $conversationId)
            ->where('user_id', $userId)
            ->firstOrFail();
        $conversation = Conversation::findOrFail($conversationId);
        $conversation->pinned_message_id = null;
        $conversation->save();
        return response()->noContent();
    }

    /**
     * Generate a contextual title for the conversation based on participant relationships
     */
    private function generateTitle(array $participantIds, User $currentUser, string $type): string
    {
        if ($type === 'direct') {
            // For 1:1 chats, find the other participant (guard both id and user_id cases)
            $selfIds = collect([
                $currentUser->user_id ?? null,
                $currentUser->id ?? null,
            ])->filter()->map(fn($v) => (int) $v)->unique()->values()->all();

            $otherId = collect($participantIds)
                ->map(fn($v) => (int) $v)
                ->first(fn($id) => !in_array($id, $selfIds, true));
            $otherUser = User::find($otherId);

            if ($otherUser) {
                $roleDisplay = $this->getRoleDisplayName($otherUser->role);
                return trim("{$otherUser->name} ({$roleDisplay})");
            }
        }

        if ($type === 'group') {
            // Try to find common relationship context
            $participants = User::whereIn('user_id', $participantIds)->get();

            // Check if all are from same department
            $departments = $participants->pluck('department_id')->unique()->filter();
            if ($departments->count() === 1) {
                $dept = \App\Models\Department::find($departments->first());
                if ($dept) {
                    return "Department: {$dept->name}";
                }
            }

            // Check if all are from same company (for supervisors/company admins)
            $companyAssignments = \App\Models\CompanySupervisorAssignment::whereIn('supervisor_id', $participantIds)->pluck('company_id')->unique();
            if ($companyAssignments->count() === 1) {
                $company = \App\Models\Company::find($companyAssignments->first());
                if ($company) {
                    return "Company: {$company->name}";
                }
            }

            // Check if it's a supervisor-student group
            $supervisors = $participants->where('role', 'supervisor');
            $students = $participants->where('role', 'student');
            if ($supervisors->isNotEmpty() && $students->isNotEmpty()) {
                return "Supervisor-Student Discussion";
            }

            // Default group title
            return "Group Chat ({$participants->count()} members)";
        }

        return "Conversation";
    }

    /**
     * Get display name for role
     */
    private function getRoleDisplayName(string $role): string
    {
        return match($role) {
            'admin' => 'Admin',
            'company_admin' => 'Company Admin',
            'coordinator' => 'Coordinator',
            'dept_head' => 'Department Head',
            'supervisor' => 'Supervisor',
            'advisor' => 'Advisor',
            'student' => 'Student',
            default => ucfirst(str_replace('_', ' ', $role))
        };
    }
}
