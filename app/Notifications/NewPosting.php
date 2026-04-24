<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\BroadcastMessage;
use Illuminate\Notifications\Messages\DatabaseMessage;
use Illuminate\Notifications\Notification;

class NewPosting extends Notification implements ShouldQueue
{
    use Queueable;

    protected $posting;

    /**
     * Create a new notification instance.
     */
    public function __construct($posting)
    {
        $this->posting = $posting;
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
            'title' => 'New Job Posting',
            'message' => "New {$this->posting->type} opportunity: {$this->posting->title}",
            'action_url' => "/student/postings/{$this->posting->posting_id}",
            'action_text' => 'View Posting',
            'icon' => 'posting',
            'posting_id' => $this->posting->posting_id,
            'posting_title' => $this->posting->title,
            'posting_type' => $this->posting->type,
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
            'title' => 'New Job Posting',
            'message' => "New {$this->posting->type} opportunity: {$this->posting->title}",
            'timestamp' => now()->toISOString(),
            'read' => false,
            'action_url' => "/student/postings/{$this->posting->posting_id}",
            'action_text' => 'View Posting',
            'icon' => 'posting',
            'data' => [
                'posting_id' => $this->posting->posting_id,
                'posting_title' => $this->posting->title,
                'posting_type' => $this->posting->type,
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
            'posting_id' => $this->posting->posting_id,
            'posting_title' => $this->posting->title,
            'posting_type' => $this->posting->type,
        ];
    }
}
