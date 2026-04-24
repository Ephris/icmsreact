<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\BroadcastMessage;
use Illuminate\Notifications\Messages\DatabaseMessage;
use Illuminate\Notifications\Notification;

class NewMessage extends Notification implements ShouldQueue
{
    use Queueable;

    protected $sender;
    protected $chatId;

    /**
     * Create a new notification instance.
     */
    public function __construct($sender, $chatId)
    {
        $this->sender = $sender;
        $this->chatId = $chatId;
    }

    /**
     * Get the notification's delivery channels.
     *
     * @return array<int, string>
     */
    public function via(object $notifiable): array
    {
        return ['database', 'broadcast'];
    }

    /**
     * Get the database representation of the notification.
     */
    public function toDatabase(object $notifiable): array
    {
        return [
            'type' => 'info',
            'title' => 'New Message',
            'message' => "You have a new message from {$this->sender->name}",
            'action_url' => "/chat/{$this->chatId}",
            'action_text' => 'View Chat',
            'icon' => 'chat',
            'chat_id' => $this->chatId,
            'sender_name' => $this->sender->name,
            'sender_id' => $this->sender->user_id,
        ];
    }

    /**
     * Get the broadcast representation of the notification.
     */
    public function toBroadcast(object $notifiable): BroadcastMessage
    {
        return new BroadcastMessage([
            'id' => $this->id,
            'type' => 'info',
            'title' => 'New Message',
            'message' => "You have a new message from {$this->sender->name}",
            'timestamp' => now()->toISOString(),
            'read' => false,
            'action_url' => "/chat/{$this->chatId}",
            'action_text' => 'View Chat',
            'icon' => 'chat',
            'data' => [
                'chat_id' => $this->chatId,
                'sender_name' => $this->sender->name,
                'sender_id' => $this->sender->user_id,
            ],
        ]);
    }

    /**
     * Get the array representation of the notification.
     *
     * @return array<string, mixed>
     */
    public function toArray(object $notifiable): array
    {
        return [
            'chat_id' => $this->chatId,
            'sender_name' => $this->sender->name,
            'sender_id' => $this->sender->user_id,
        ];
    }
}
