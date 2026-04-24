<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\BroadcastMessage;
use Illuminate\Notifications\Messages\DatabaseMessage;
use Illuminate\Notifications\Notification;

class NewApplication extends Notification implements ShouldQueue
{
    use Queueable;

    protected $student;
    protected $posting;
    protected $application;

    /**
     * Create a new notification instance.
     */
    public function __construct($student, $posting, $application)
    {
        $this->student = $student;
        $this->posting = $posting;
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
            'title' => 'New Application',
            'message' => "{$this->student->first_name} {$this->student->last_name} applied for {$this->posting->title}",
            'action_url' => "/company-admin/applications/{$this->application->application_id}",
            'action_text' => 'Review Application',
            'icon' => 'application',
            'student_name' => "{$this->student->first_name} {$this->student->last_name}",
            'posting_title' => $this->posting->title,
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
            'title' => 'New Application',
            'message' => "{$this->student->first_name} {$this->student->last_name} applied for {$this->posting->title}",
            'timestamp' => now()->toISOString(),
            'read' => false,
            'action_url' => "/company-admin/applications/{$this->application->application_id}",
            'action_text' => 'Review Application',
            'icon' => 'application',
            'data' => [
                'student_name' => "{$this->student->first_name} {$this->student->last_name}",
                'posting_title' => $this->posting->title,
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
            'student_name' => "{$this->student->first_name} {$this->student->last_name}",
            'posting_title' => $this->posting->title,
            'application_id' => $this->application->application_id,
        ];
    }
}
