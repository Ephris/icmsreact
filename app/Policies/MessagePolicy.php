<?php

namespace App\Policies;

use App\Models\Message;
use App\Models\User;

class MessagePolicy
{
    /**
     * Determine whether the user can view the message.
     */
    public function view(User $user, Message $message): bool
    {
        return $message->conversation->participants()
            ->where('user_id', $user->user_id ?? $user->id)
            ->exists();
    }

    /**
     * Determine whether the user can update the message.
     */
    public function update(User $user, Message $message): bool
    {
        return $message->user_id === ($user->user_id ?? $user->id);
    }

    /**
     * Determine whether the user can delete the message.
     */
    public function delete(User $user, Message $message): bool
    {
        return $message->user_id === ($user->user_id ?? $user->id);
    }

    /**
     * Determine whether the user can mark the message as read.
     */
    public function markAsRead(User $user, Message $message): bool
    {
        return $message->conversation->participants()
            ->where('user_id', $user->user_id ?? $user->id)
            ->exists();
    }
}
