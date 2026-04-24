<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Notifications\DatabaseNotification;
use App\Models\Notification;

class NotificationController extends Controller
{
    /**
     * Get notifications for the authenticated user
     */
    public function index(Request $request)
    {
        /** @var \App\Models\User $user */
        $user = Auth::user();

        $notifications = Notification::where('user_id', $user->user_id)
            ->orderBy('created_at', 'desc')
            ->get()
            ->map(function ($notification) {
                return [
                    'id' => $notification->notification_id,
                    'type' => $notification->type,
                    'title' => $notification->title,
                    'message' => $notification->message,
                    'timestamp' => $notification->created_at->toISOString(),
                    'read' => $notification->read,
                    'action_url' => $notification->action_url,
                    'action_text' => $notification->action_text,
                    'icon' => $notification->icon,
                ];
            });

        $unreadCount = Notification::where('user_id', $user->user_id)
            ->where('read', false)
            ->count();

        return response()->json([
            'notifications' => $notifications,
            'unreadCount' => $unreadCount
        ]);
    }

    /**
     * Mark a notification as read
     */
    public function markAsRead(Request $request, $notificationId)
    {
        /** @var \App\Models\User $user */
        $user = Auth::user();

        $notification = Notification::where('notification_id', $notificationId)
            ->where('user_id', $user->user_id)
            ->first();

        if (!$notification) {
            return response()->json(['message' => 'Notification not found'], 404);
        }

        $notification->markAsRead();

        // Broadcast the read event
        broadcast(new \App\Events\NotificationRead($notificationId, $user->user_id))->toOthers();

        return response()->json(['message' => 'Notification marked as read']);
    }

    /**
     * Mark all notifications as read
     */
    public function markAllAsRead(Request $request)
    {
        /** @var \App\Models\User $user */
        $user = Auth::user();

        Notification::where('user_id', $user->user_id)
            ->where('read', false)
            ->update(['read' => true, 'read_at' => now()]);

        return response()->json(['message' => 'All notifications marked as read']);
    }
}