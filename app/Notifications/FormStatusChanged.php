<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\BroadcastMessage;
use Illuminate\Notifications\Messages\DatabaseMessage;
use Illuminate\Notifications\Notification;

class FormStatusChanged extends Notification implements ShouldQueue
{
    use Queueable;

    protected $form;
    protected $status;
    protected $student;

    /**
     * Create a new notification instance.
     */
    public function __construct($form, $status, $student = null)
    {
        $this->form = $form;
        $this->status = $status;
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
        $message = $this->student
            ? "Form \"{$this->form->title}\" for {$this->student->name} status changed to {$this->status}"
            : "Form \"{$this->form->title}\" status changed to {$this->status}";

        $actionUrl = $this->student
            ? "/student/forms/{$this->form->form_id}"
            : "/faculty-advisor/forms/{$this->form->form_id}";

        return [
            'type' => 'info',
            'title' => 'Form Status Update',
            'message' => $message,
            'action_url' => $actionUrl,
            'action_text' => 'View Form',
            'icon' => 'form',
            'form_name' => $this->form->title,
            'status' => $this->status,
            'form_id' => $this->form->form_id,
            'student_name' => $this->student ? $this->student->name : null,
        ];
    }

    /**
     * Get the broadcast representation of the notification.
     */
    public function toBroadcast(object $notifiable): BroadcastMessage
    {
        $message = $this->student
            ? "Form \"{$this->form->title}\" for {$this->student->name} status changed to {$this->status}"
            : "Form \"{$this->form->title}\" status changed to {$this->status}";

        $actionUrl = $this->student
            ? "/student/forms/{$this->form->form_id}"
            : "/faculty-advisor/forms/{$this->form->form_id}";

        return new BroadcastMessage([
            'id' => $this->id,
            'type' => 'info',
            'title' => 'Form Status Update',
            'message' => $message,
            'timestamp' => now()->toISOString(),
            'read' => false,
            'action_url' => $actionUrl,
            'action_text' => 'View Form',
            'icon' => 'form',
            'data' => [
                'form_name' => $this->form->title,
                'status' => $this->status,
                'form_id' => $this->form->form_id,
                'student_name' => $this->student ? $this->student->name : null,
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
            'form_name' => $this->form->title,
            'status' => $this->status,
            'form_id' => $this->form->form_id,
            'student_name' => $this->student ? $this->student->name : null,
        ];
    }
}
