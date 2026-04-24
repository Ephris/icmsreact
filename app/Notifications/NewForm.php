<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\BroadcastMessage;
use Illuminate\Notifications\Messages\DatabaseMessage;
use Illuminate\Notifications\Notification;

class NewForm extends Notification implements ShouldQueue
{
    use Queueable;

    protected $form;
    protected $student;

    /**
     * Create a new notification instance.
     */
    public function __construct($form, $student)
    {
        $this->form = $form;
        $this->student = $student;
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
            'title' => 'New Form Received',
            'message' => "New form received for student {$this->student->name}",
            'action_url' => "/company-supervisor/forms/{$this->form->form_id}",
            'action_text' => 'View Form',
            'icon' => 'form',
            'student_name' => $this->student->name,
            'form_id' => $this->form->form_id,
            'form_title' => $this->form->title,
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
            'title' => 'New Form Received',
            'message' => "New form received for student {$this->student->name}",
            'timestamp' => now()->toISOString(),
            'read' => false,
            'action_url' => "/company-supervisor/forms/{$this->form->form_id}",
            'action_text' => 'View Form',
            'icon' => 'form',
            'data' => [
                'student_name' => $this->student->name,
                'form_id' => $this->form->form_id,
                'form_title' => $this->form->title,
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
            'student_name' => $this->student->name,
            'form_id' => $this->form->form_id,
            'form_title' => $this->form->title,
        ];
    }
}
