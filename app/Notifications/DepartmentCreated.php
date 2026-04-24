<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\BroadcastMessage;
use Illuminate\Notifications\Messages\DatabaseMessage;
use Illuminate\Notifications\Notification;

class DepartmentCreated extends Notification implements ShouldQueue
{
    use Queueable;

    protected $department;
    protected $creator;

    /**
     * Create a new notification instance.
     */
    public function __construct($department, $creator)
    {
        $this->department = $department;
        $this->creator = $creator;
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
            'type' => 'success',
            'title' => 'Department Created',
            'message' => "{$this->department->name} department created successfully.",
            'action_url' => route('departments.show', $this->department->department_id),
            'action_text' => 'View Department',
            'icon' => 'assignment',
            'department_name' => $this->department->name,
            'department_id' => $this->department->department_id,
            'creator_id' => $this->creator->user_id,
            'creator_name' => $this->creator->name,
        ];
    }

    /**
     * Get the broadcast representation of the notification.
     */
    public function toBroadcast(object $notifiable): BroadcastMessage
    {
        return new BroadcastMessage([
            'id' => $this->id,
            'type' => 'success',
            'title' => 'Department Created',
            'message' => "{$this->department->name} department created successfully.",
            'timestamp' => now()->toISOString(),
            'read' => false,
            'action_url' => route('departments.show', $this->department->department_id),
            'action_text' => 'View Department',
            'icon' => 'assignment',
            'data' => [
                'department_name' => $this->department->name,
                'department_id' => $this->department->department_id,
                'creator_id' => $this->creator->user_id,
                'creator_name' => $this->creator->name,
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
            'department_id' => $this->department->department_id,
            'department_name' => $this->department->name,
            'creator_id' => $this->creator->user_id,
            'creator_name' => $this->creator->name,
        ];
    }
}
