<?php

use Illuminate\Support\Facades\Broadcast;
use App\Models\ConversationParticipant;
use App\Models\User;

Broadcast::channel('App.Models.User.{id}', function ($user, $id) {
    return (int) ($user->user_id ?? $user->id) === (int) $id;
});

// Notification channels for user-specific broadcasting
Broadcast::channel('notifications.user.{userId}', function (User $user, int $userId) {
    return (int) $user->user_id === (int) $userId;
});

// Private message stream for a conversation
Broadcast::channel('conversation.{conversationId}', function (User $user, int $conversationId) {
    return ConversationParticipant::where('conversation_id', $conversationId)
        ->where('user_id', $user->user_id ?? $user->id)
        ->exists();
});

// Presence channel for a conversation (online + typing)
Broadcast::channel('presence-conversation.{conversationId}', function (User $user, int $conversationId) {
    $userId = $user->user_id ?? $user->id;
    $isParticipant = ConversationParticipant::where('conversation_id', $conversationId)
        ->where('user_id', $userId)
        ->exists();

    if (! $isParticipant) {
        return false;
    }

    return [
        'id' => $userId,
        'name' => $user->name,
        'avatar' => method_exists($user, 'getAvatarUrl') ? $user->getAvatarUrl() : null,
        'role' => $user->role ?? null,
    ];
});
