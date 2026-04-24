<?php

namespace App\Policies;

use App\Models\Conversation;
use App\Models\User;
use App\Services\ContactsResolver;

class ConversationPolicy
{
    public function __construct(
        private ContactsResolver $contactsResolver
    ) {}

    /**
     * Determine whether the user can view the conversation.
     */
    public function view(User $user, Conversation $conversation): bool
    {
        return $conversation->participants()
            ->where('user_id', $user->user_id ?? $user->id)
            ->exists();
    }

    /**
     * Determine whether the user can create conversations.
     */
    public function create(User $user): bool
    {
        return true; // All authenticated users can create conversations
    }

    /**
     * Determine whether the user can update the conversation.
     */
    public function update(User $user, Conversation $conversation): bool
    {
        return $conversation->created_by_id === ($user->user_id ?? $user->id);
    }

    /**
     * Determine whether the user can delete the conversation.
     */
    public function delete(User $user, Conversation $conversation): bool
    {
        return $conversation->created_by_id === ($user->user_id ?? $user->id);
    }

    /**
     * Determine whether the user can add participants to the conversation.
     */
    public function addParticipant(User $user, Conversation $conversation, User $participant): bool
    {
        // Check if user is conversation creator
        if ($conversation->created_by_id !== ($user->user_id ?? $user->id)) {
            return false;
        }

        // Check if participant is allowed based on role rules
        $allowedIds = $this->contactsResolver->getAllowedUserIds($user);
        return in_array($participant->user_id ?? $participant->id, $allowedIds, true);
    }

    /**
     * Determine whether the user can send messages in the conversation.
     */
    public function sendMessage(User $user, Conversation $conversation): bool
    {
        return $conversation->participants()
            ->where('user_id', $user->user_id ?? $user->id)
            ->exists();
    }
}
