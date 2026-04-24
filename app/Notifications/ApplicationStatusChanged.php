<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\BroadcastMessage;
use Illuminate\Notifications\Messages\DatabaseMessage;
use Illuminate\Notifications\Notification;

class ApplicationStatusChanged extends Notification implements ShouldQueue
{
    use Queueable;

    protected $posting;
    protected $status;
    protected $application;

    /**
     * Create a new notification instance.
     */
    public function __construct($posting, $status, $application)
    {
        $this->posting = $posting;
        $this->status = $status;
        $this->application = $application;
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
            'title' => 'Application Status Update',
            'message' => "Your application for {$this->posting->title} is now {$this->status}",
            'action_url' => "/student/applications/{$this->application->application_id}",
            'action_text' => 'View Application',
            'icon' => 'application',
            'posting_title' => $this->posting->title,
            'status' => $this->status,
            'application_id' => $this->application->application_id,
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
            'title' => 'Application Status Update',
            'message' => "Your application for {$this->posting->title} is now {$this->status}",
            'timestamp' => now()->toISOString(),
            'read' => false,
            'action_url' => "/student/applications/{$this->application->application_id}",
            'action_text' => 'View Application',
            'icon' => 'application',
            'data' => [
                'posting_title' => $this->posting->title,
                'status' => $this->status,
                'application_id' => $this->application->application_id,
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
            'posting_title' => $this->posting->title,
            'status' => $this->status,
            'application_id' => $this->application->application_id,
        ];
    }
}
