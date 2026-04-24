<?php

namespace App\Services;

use App\Models\Notification;
use App\Models\User;
use App\Models\Student;
use Illuminate\Support\Facades\Log;

class NotificationService
{
    /**
     * Create a notification
     */
    public static function createNotification(array $data): Notification
    {
        $notification = Notification::create($data);

        // Broadcast the notification
        broadcast(new \App\Events\NotificationReceived($notification))->toOthers();

        return $notification;
    }

    /**
     * Notify admin about new message
     */
    public static function notifyAdminNewMessage(User $sender, string $chatId): void
    {
        $admins = User::where('role', 'admin')->get();
        foreach ($admins as $admin) {
            self::createNotification([
                'type' => 'new_chat',
                'title' => 'New Message',
                'message' => "You have a new message from {$sender->name}",
                'user_id' => $admin->user_id,
                'sender_id' => $sender->user_id,
                'data' => ['chat_id' => $chatId, 'sender_name' => $sender->name],
                'action_url' => '/admin/chat',
                'action_text' => 'View Chat',
                'icon' => 'chat',
            ]);
        }
    }

    /**
     * Notify coordinator about new message
     */
    public static function notifyCoordinatorNewMessage(User $sender, string $chatId): void
    {
        $coordinators = User::where('role', 'coordinator')->get();
        foreach ($coordinators as $coordinator) {
            self::createNotification([
                'type' => 'new_chat',
                'title' => 'New Message',
                'message' => "You have a new message from {$sender->name}",
                'user_id' => $coordinator->user_id,
                'sender_id' => $sender->user_id,
                'data' => ['chat_id' => $chatId, 'sender_name' => $sender->name],
                'action_url' => '/coordinator/chat',
                'action_text' => 'View Chat',
                'icon' => 'chat',
            ]);
        }
    }

    /**
     * Notify department head about new message
     */
    public static function notifyDeptHeadNewMessage(User $sender, string $chatId): void
    {
        $deptHeads = User::where('role', 'dept_head')->get();
        foreach ($deptHeads as $deptHead) {
            self::createNotification([
                'type' => 'new_chat',
                'title' => 'New Message',
                'message' => "You have a new message from {$sender->name}",
                'user_id' => $deptHead->user_id,
                'sender_id' => $sender->user_id,
                'data' => ['chat_id' => $chatId, 'sender_name' => $sender->name],
                'action_url' => '/department-head/chat',
                'action_text' => 'View Chat',
                'icon' => 'chat',
            ]);
        }
    }

    /**
     * Notify company admin about new message
     */
    public static function notifyCompanyAdminNewMessage(User $sender, string $chatId): void
    {
        $companyAdmins = User::where('role', 'company_admin')->get();
        foreach ($companyAdmins as $companyAdmin) {
            self::createNotification([
                'type' => 'new_chat',
                'title' => 'New Message',
                'message' => "You have a new message from {$sender->name}",
                'user_id' => $companyAdmin->user_id,
                'sender_id' => $sender->user_id,
                'data' => ['chat_id' => $chatId, 'sender_name' => $sender->name],
                'action_url' => '/company-admin/chat',
                'action_text' => 'View Chat',
                'icon' => 'chat',
            ]);
        }
    }

    /**
     * Notify supervisor about new message
     */
    public static function notifySupervisorNewMessage(User $sender, string $chatId): void
    {
        $supervisors = User::where('role', 'supervisor')->get();
        foreach ($supervisors as $supervisor) {
            self::createNotification([
                'type' => 'new_chat',
                'title' => 'New Message',
                'message' => "You have a new message from {$sender->name}",
                'user_id' => $supervisor->user_id,
                'sender_id' => $sender->user_id,
                'data' => ['chat_id' => $chatId, 'sender_name' => $sender->name],
                'action_url' => '/company-admin/chat',
                'action_text' => 'View Chat',
                'icon' => 'chat',
            ]);
        }
    }

    /**
     * Notify student about new message
     */
    public static function notifyStudentNewMessage(User $sender, string $chatId): void
    {
        $students = User::where('role', 'student')->get();
        foreach ($students as $student) {
            self::createNotification([
                'type' => 'new_chat',
                'title' => 'New Message',
                'message' => "You have a new message from {$sender->name}",
                'user_id' => $student->user_id,
                'sender_id' => $sender->user_id,
                'data' => ['chat_id' => $chatId, 'sender_name' => $sender->name],
                'action_url' => '/company-admin/chat',
                'action_text' => 'View Chat',
                'icon' => 'chat',
            ]);
        }
    }

    /**
     * Notify advisor about new message
     */
    public static function notifyAdvisorNewMessage(User $sender, string $chatId): void
    {
        $advisors = User::where('role', 'advisor')->get();
        foreach ($advisors as $advisor) {
            self::createNotification([
                'type' => 'new_chat',
                'title' => 'New Message',
                'message' => "You have a new message from {$sender->name}",
                'user_id' => $advisor->user_id,
                'sender_id' => $sender->user_id,
                'data' => ['chat_id' => $chatId, 'sender_name' => $sender->name],
                'action_url' => '/company-admin/chat',
                'action_text' => 'View Chat',
                'icon' => 'chat',
            ]);
        }
    }

    /**
     * Notify students about new posting
     */
    public static function notifyStudentNewPosting(string $title, string $postingId, string $type): void
    {
        $students = User::where('role', 'student')->get();
        foreach ($students as $student) {
            self::createNotification([
                'type' => 'new_posting',
                'title' => 'New Job Posting',
                'message' => "New {$type} opportunity: {$title}",
                'user_id' => $student->user_id,
                'data' => ['posting_id' => $postingId, 'posting_title' => $title, 'posting_type' => $type],
                'action_url' => "/student/postings/{$postingId}",
                'action_text' => 'View Posting',
                'icon' => 'posting',
            ]);
        }
    }

    /**
     * Notify specific student about new posting
     */
    public static function notifySpecificStudentNewPosting(User $student, string $title, string $postingId, string $type): void
    {
        self::createNotification([
            'type' => 'new_posting',
            'title' => 'New Job Posting',
            'message' => "New {$type} opportunity: {$title}",
            'user_id' => $student->user_id,
            'data' => ['posting_id' => $postingId, 'posting_title' => $title, 'posting_type' => $type],
            'action_url' => "/student/postings/{$postingId}",
            'action_text' => 'View Posting',
            'icon' => 'posting',
        ]);
    }

    /**
     * Notify company admin about new application
     */
    public static function notifyCompanyAdminNewApplication(User $student, string $postingTitle, string $applicationId): void
    {
        $companyAdmins = User::where('role', 'company_admin')->get();
        foreach ($companyAdmins as $companyAdmin) {
            self::createNotification([
                'type' => 'new_application',
                'title' => 'New Application',
                'message' => "{$student->first_name} {$student->last_name} applied for {$postingTitle}",
                'user_id' => $companyAdmin->user_id,
                'sender_id' => $student->user_id,
                'data' => ['student_name' => "{$student->first_name} {$student->last_name}", 'posting_title' => $postingTitle, 'application_id' => $applicationId],
                'action_url' => "/company-admin/applications/{$applicationId}",
                'action_text' => 'Review Application',
                'icon' => 'application',
            ]);
        }
    }

    /**
     * Notify company admin about accepted application
     */
    public static function notifyCompanyAdminAcceptedApplication(User $student, string $postingTitle, string $applicationId): void
    {
        $companyAdmins = User::where('role', 'company_admin')->get();
        foreach ($companyAdmins as $companyAdmin) {
            self::createNotification([
                'type' => 'accepted_application_by_student',
                'title' => 'Application Accepted',
                'message' => "{$student->first_name} {$student->last_name} accepted your offer for {$postingTitle}",
                'user_id' => $companyAdmin->user_id,
                'sender_id' => $student->user_id,
                'data' => ['student_name' => "{$student->first_name} {$student->last_name}", 'posting_title' => $postingTitle, 'application_id' => $applicationId],
                'action_url' => "/company-admin/applications/{$applicationId}",
                'action_text' => 'View Details',
                'icon' => 'application',
            ]);
        }
    }

    /**
     * Notify student about application status change
     */
    public static function notifyStudentApplicationStatus(User $student, string $postingTitle, string $status, string $applicationId): void
    {
        self::createNotification([
            'type' => 'application_status_changed',
            'title' => 'Application Status Update',
            'message' => "Your application for {$postingTitle} is now {$status}",
            'user_id' => $student->user_id,
            'data' => ['posting_title' => $postingTitle, 'status' => $status, 'application_id' => $applicationId],
            'action_url' => "/student/applications/{$applicationId}",
            'action_text' => 'View Application',
            'icon' => 'application',
        ]);
    }

    /**
     * Notify coordinator about accepted application
     */
    public static function notifyCoordinatorAcceptedApplication(User $student, string $postingTitle): void
    {
        $coordinators = User::where('role', 'coordinator')->get();
        foreach ($coordinators as $coordinator) {
            self::createNotification([
                'type' => 'accepted_application_by_student',
                'title' => 'Application Accepted',
                'message' => "{$student->name} accepted their application for {$postingTitle}",
                'user_id' => $coordinator->user_id,
                'sender_id' => $student->user_id,
                'data' => ['student_name' => $student->name, 'posting_title' => $postingTitle],
                'action_url' => '/coordinator/departments',
                'action_text' => 'View Student',
                'icon' => 'application',
            ]);
        }
    }

    /**
     * Notify supervisor about new assignment
     */
    public static function notifySupervisorNewAssignment(User $supervisor, Student $student, string $assignmentId): void
    {
        self::createNotification([
            'type' => 'new_assignment',
            'title' => 'New Assignment',
            'message' => "You have been assigned to supervise {$student->user->first_name} {$student->user->last_name}",
            'user_id' => $supervisor->user_id,
            'data' => ['student_name' => "{$student->user->first_name} {$student->user->last_name}", 'assignment_id' => $assignmentId],
            'action_url' => "/company-admin/supervisor-assignments/{$assignmentId}",
            'action_text' => 'View Assignment',
            'icon' => 'assignment',
        ]);
    }

    /**
     * Notify student about advisor assignment
     */
    public static function notifyAdvisorStudentAssigned(User $student, User $deptHead): void
    {
        self::createNotification([
            'type' => 'assigned_students',
            'title' => 'Advisor Assigned',
            'message' => "You have been assigned an advisor by {$deptHead->name}",
            'user_id' => $student->user_id,
            'sender_id' => $deptHead->user_id,
            'data' => ['advisor_name' => $deptHead->name],
            'action_url' => "/student/profile",
            'action_text' => 'View Profile',
            'icon' => 'assignment',
        ]);
    }

    /**
     * Notify supervisor about new form
     */
    public static function notifySupervisorNewForm(User $supervisor, User $student, string $formId): void
    {
        self::createNotification([
            'type' => 'new_form',
            'title' => 'New Form Received',
            'message' => "New form received for student {$student->name}",
            'user_id' => $supervisor->user_id,
            'sender_id' => $student->user_id,
            'data' => ['student_name' => $student->name, 'form_id' => $formId],
            'action_url' => "/company-supervisor/forms/{$formId}",
            'action_text' => 'View Form',
            'icon' => 'form',
        ]);
    }

    /**
     * Notify student about form status change
     */
    public static function notifyStudentFormStatus(User $student, string $formName, string $status, string $formUrl): void
    {
        self::createNotification([
            'type' => 'forms_status_changed',
            'title' => 'Form Status Update',
            'message' => "Form \"{$formName}\" status changed to {$status}",
            'user_id' => $student->user_id,
            'data' => ['form_name' => $formName, 'status' => $status],
            'action_url' => $formUrl,
            'action_text' => 'View Form',
            'icon' => 'form',
        ]);
    }

    /**
     * Notify advisor about student feedback
     */
    public static function notifyAdvisorStudentFeedback(User $advisor, User $student, string $applicationId): void
    {
        self::createNotification([
            'type' => 'student_application_changes',
            'title' => 'Student Feedback Provided',
            'message' => "{$student->first_name} {$student->last_name} has provided feedback on their application",
            'user_id' => $advisor->user_id,
            'sender_id' => $student->user_id,
            'data' => ['student_name' => "{$student->first_name} {$student->last_name}", 'application_id' => $applicationId],
            'action_url' => "/faculty-advisor/applications/{$applicationId}",
            'action_text' => 'View Feedback',
            'icon' => 'feedback',
        ]);
    }

    /**
     * Notify advisor about new student assignments
     */
    public static function notifyAdvisorNewStudentAssignments(User $advisor, array $studentIds): void
    {
        $studentCount = count($studentIds);
        $message = $studentCount === 1
            ? "You have been assigned 1 new student"
            : "You have been assigned {$studentCount} new students";

        self::createNotification([
            'type' => 'assigned_students',
            'title' => 'New Student Assignment',
            'message' => $message,
            'user_id' => $advisor->user_id,
            'data' => ['student_count' => $studentCount],
            'action_url' => "/faculty-advisor/students",
            'action_text' => 'View Students',
            'icon' => 'assignment',
        ]);
    }

    /**
     * Notify user about status change
     */
    public static function notifyUserStatusChange(User $user, string $oldStatus, string $newStatus): void
    {
        $statusText = $newStatus === 'active' ? 'activated' : 'deactivated';
        $message = "Your account has been {$statusText}";
        
        if ($newStatus === 'inactive') {
            $message .= ". Please contact your administrator for assistance.";
        }

        self::createNotification([
            'type' => 'user_status_changed',
            'title' => 'Account Status Update',
            'message' => $message,
            'user_id' => $user->user_id,
            'data' => ['old_status' => $oldStatus, 'new_status' => $newStatus],
            'action_url' => "/profile",
            'action_text' => 'View Profile',
            'icon' => 'info',
        ]);
    }

    /**
     * Notify admin about user status change
     */
    public static function notifyAdminUserStatusChange(User $admin, User $changedUser, string $oldStatus, string $newStatus): void
    {
        $statusText = $newStatus === 'active' ? 'activated' : 'deactivated';
        
        self::createNotification([
            'type' => 'user_status_changed',
            'title' => 'User Status Updated',
            'message' => "User {$changedUser->name} has been {$statusText}",
            'user_id' => $admin->user_id,
            'sender_id' => $changedUser->user_id,
            'data' => [
                'user_name' => $changedUser->name,
                'old_status' => $oldStatus,
                'new_status' => $newStatus
            ],
            'action_url' => "/users/{$changedUser->user_id}",
            'action_text' => 'View User',
            'icon' => 'user',
        ]);
    }

    /**
     * Notify about posting status change
     */
    public static function notifyPostingStatusChange(User $creator, string $postingTitle, string $oldStatus, string $newStatus): void
    {
        self::createNotification([
            'type' => 'posting_status_changed',
            'title' => 'Posting Status Update',
            'message' => "Posting '{$postingTitle}' status changed from {$oldStatus} to {$newStatus}",
            'user_id' => $creator->user_id,
            'data' => [
                'posting_title' => $postingTitle,
                'old_status' => $oldStatus,
                'new_status' => $newStatus
            ],
            'action_url' => "/company-admin/postings",
            'action_text' => 'View Postings',
            'icon' => 'posting',
        ]);
    }

    /**
     * Notify students about posting status change
     */
    public static function notifyStudentsPostingStatusChange(string $postingTitle, string $oldStatus, string $newStatus, string $postingId): void
    {
        $students = User::where('role', 'student')->get();
        foreach ($students as $student) {
            self::createNotification([
                'type' => 'posting_status_changed',
                'title' => 'Posting Status Update',
                'message' => "Posting '{$postingTitle}' is now {$newStatus}",
                'user_id' => $student->user_id,
                'data' => [
                    'posting_title' => $postingTitle,
                    'old_status' => $oldStatus,
                    'new_status' => $newStatus,
                    'posting_id' => $postingId
                ],
                'action_url' => "/student/postings/{$postingId}",
                'action_text' => 'View Posting',
                'icon' => 'posting',
            ]);
        }
    }

    /**
     * Notify about assignment status change
     */
    public static function notifyAssignmentStatusChange(User $supervisor, User $student, string $oldStatus, string $newStatus, string $assignmentId): void
    {
        self::createNotification([
            'type' => 'assignment_status_changed',
            'title' => 'Assignment Status Update',
            'message' => "Assignment with {$student->name} status changed to {$newStatus}",
            'user_id' => $supervisor->user_id,
            'sender_id' => $student->user_id,
            'data' => [
                'student_name' => $student->name,
                'old_status' => $oldStatus,
                'new_status' => $newStatus,
                'assignment_id' => $assignmentId
            ],
            'action_url' => "/company-supervisor/students/{$student->user_id}",
            'action_text' => 'View Student',
            'icon' => 'assignment',
        ]);
    }

    /**
     * Notify student about assignment status change
     */
    public static function notifyStudentAssignmentStatusChange(User $student, User $supervisor, string $oldStatus, string $newStatus, string $assignmentId): void
    {
        self::createNotification([
            'type' => 'assignment_status_changed',
            'title' => 'Assignment Status Update',
            'message' => "Your assignment status has changed to {$newStatus}",
            'user_id' => $student->user_id,
            'sender_id' => $supervisor->user_id,
            'data' => [
                'supervisor_name' => $supervisor->name,
                'old_status' => $oldStatus,
                'new_status' => $newStatus,
                'assignment_id' => $assignmentId
            ],
            'action_url' => "/student/assignments",
            'action_text' => 'View Assignments',
            'icon' => 'assignment',
        ]);
    }

    /**
     * Notify about new chat message
     */
    public static function notifyNewChatMessage(User $recipient, User $sender, string $message, string $chatId): void
    {
        self::createNotification([
            'type' => 'new_chat',
            'title' => 'New Message',
            'message' => "You have a new message from {$sender->name}",
            'user_id' => $recipient->user_id,
            'sender_id' => $sender->user_id,
            'data' => [
                'sender_name' => $sender->name,
                'message_preview' => substr($message, 0, 100),
                'chat_id' => $chatId
            ],
            'action_url' => "/chat/{$chatId}",
            'action_text' => 'View Chat',
            'icon' => 'chat',
        ]);
    }

    /**
     * Notify about user role change
     */
    public static function notifyUserRoleChange(User $user, string $oldRole, string $newRole): void
    {
        self::createNotification([
            'type' => 'role_changed',
            'title' => 'Role Updated',
            'message' => "Your role has been changed from {$oldRole} to {$newRole}",
            'user_id' => $user->user_id,
            'data' => [
                'old_role' => $oldRole,
                'new_role' => $newRole
            ],
            'action_url' => "/profile",
            'action_text' => 'View Profile',
            'icon' => 'user',
        ]);
    }

    /**
     * Notify about new feedback
     */
    public static function notifyNewFeedback(User $recipient, User $sender, string $feedbackType, string $relatedItem): void
    {
        self::createNotification([
            'type' => 'new_feedback',
            'title' => 'New Feedback',
            'message' => "You have received new {$feedbackType} feedback",
            'user_id' => $recipient->user_id,
            'sender_id' => $sender->user_id,
            'data' => [
                'sender_name' => $sender->name,
                'feedback_type' => $feedbackType,
                'related_item' => $relatedItem
            ],
            'action_url' => "/feedback",
            'action_text' => 'View Feedback',
            'icon' => 'feedback',
        ]);
    }

    /**
     * Notify about system maintenance
     */
    public static function notifySystemMaintenance(array $userIds, string $message, string $startTime, string $endTime): void
    {
        foreach ($userIds as $userId) {
            self::createNotification([
                'type' => 'system_maintenance',
                'title' => 'System Maintenance',
                'message' => $message,
                'user_id' => $userId,
                'data' => [
                    'start_time' => $startTime,
                    'end_time' => $endTime
                ],
                'action_url' => "/dashboard",
                'action_text' => 'View Dashboard',
                'icon' => 'info',
            ]);
        }
    }

    /**
     * Notify about deadline approaching
     */
    public static function notifyDeadlineApproaching(User $user, string $itemType, string $itemName, string $deadline): void
    {
        self::createNotification([
            'type' => 'deadline_approaching',
            'title' => 'Deadline Approaching',
            'message' => "{$itemType} '{$itemName}' deadline is approaching: {$deadline}",
            'user_id' => $user->user_id,
            'data' => [
                'item_type' => $itemType,
                'item_name' => $itemName,
                'deadline' => $deadline
            ],
            'action_url' => "/deadlines",
            'action_text' => 'View Deadlines',
            'icon' => 'clock',
        ]);
    }

    /**
     * Notify about new announcement
     */
    public static function notifyNewAnnouncement(array $userIds, string $title, string $message): void
    {
        foreach ($userIds as $userId) {
            self::createNotification([
                'type' => 'new_announcement',
                'title' => 'New Announcement',
                'message' => $message,
                'user_id' => $userId,
                'data' => ['announcement_title' => $title],
                'action_url' => "/announcements",
                'action_text' => 'View Announcements',
                'icon' => 'announcement',
            ]);
        }
    }

    /**
     * Notify student about application letter status
     */
    public static function notifyStudentApplicationLetterStatus(User $student, string $status, string $refNumber): void
    {
        $message = $status === 'approved'
            ? "Your application letter (Ref: {$refNumber}) has been approved by the coordinator"
            : "Your application letter (Ref: {$refNumber}) has been rejected by the coordinator";

        self::createNotification([
            'type' => 'application_letter_status',
            'title' => 'Application Letter ' . ucfirst($status),
            'message' => $message,
            'user_id' => $student->user_id,
            'data' => ['status' => $status, 'ref_number' => $refNumber],
            'action_url' => "/student/application-letter",
            'action_text' => 'View Letter',
            'icon' => 'document',
        ]);
    }

    /**
     * Notify admin about department creation
     */
    public static function notifyAdminDepartmentCreated(string $departmentName, int $departmentId, User $creator): void
    {
        $admins = User::where('role', 'admin')->get();
        foreach ($admins as $admin) {
            self::createNotification([
                'type' => 'success',
                'title' => 'Department Created',
                'message' => "{$departmentName} department created successfully.",
                'user_id' => $admin->user_id,
                'sender_id' => $creator->user_id,
                'data' => ['department_name' => $departmentName, 'department_id' => $departmentId],
                'action_url' => route('departments.show', $departmentId),
                'action_text' => 'View Department',
                'icon' => 'assignment',
            ]);
        }
    }

    /**
     * Notify coordinators about a newly created department
     */
    public static function notifyCoordinatorsDepartmentCreated(string $departmentName, int $departmentId, User $creator): void
    {
        $coordinators = User::where('role', 'coordinator')->get();

        foreach ($coordinators as $coordinator) {
            self::createNotification([
                'type' => 'department_created',
                'title' => 'New Department Created',
                'message' => "{$departmentName} department has been created.",
                'user_id' => $coordinator->user_id,
                'sender_id' => $creator->user_id,
                'data' => [
                    'department_name' => $departmentName,
                    'department_id' => $departmentId,
                ],
                'action_url' => '/coordinator/departments',
                'action_text' => 'View Department',
                'icon' => 'building',
            ]);
        }
    }

    /**
     * Notify coordinator about new accepted application
     */
    public static function notifyCoordinatorNewAcceptedApplication(User $student, string $postingTitle, string $applicationId, ?int $departmentId = null): void
    {
        $coordinators = User::where('role', 'coordinator')->get();
        foreach ($coordinators as $coordinator) {
            self::createNotification([
                'type' => 'accepted_application_by_student',
                'title' => 'Application Accepted',
                'message' => "{$student->name} accepted their application for {$postingTitle}",
                'user_id' => $coordinator->user_id,
                'sender_id' => $student->user_id,
                'data' => [
                    'student_name' => $student->name,
                    'posting_title' => $postingTitle,
                    'application_id' => $applicationId,
                    'department_id' => $departmentId,
                ],
                'action_url' => $departmentId ? "/coordinator/departments/{$departmentId}/students" : '/coordinator/departments',
                'action_text' => 'View Student',
                'icon' => 'application',
            ]);
        }
    }

    /**
     * Notify coordinator about approved letters by company admin
     */
    public static function notifyCoordinatorLetterApproved(string $studentName, string $refNumber, string $letterId): void
    {
        $coordinators = User::where('role', 'coordinator')->get();
        foreach ($coordinators as $coordinator) {
            self::createNotification([
                'type' => 'letter_approved',
                'title' => 'Letter Approved',
                'message' => "Application letter for {$studentName} (Ref: {$refNumber}) has been approved",
                'user_id' => $coordinator->user_id,
                'data' => ['student_name' => $studentName, 'ref_number' => $refNumber, 'letter_id' => $letterId],
                'action_url' => "/coordinator/application-letters/{$letterId}/view",
                'action_text' => 'View Letter',
                'icon' => 'document',
            ]);
        }
    }

    /**
     * Notify department head about accepted applications
     */
    public static function notifyDeptHeadAcceptedApplication(User $student, string $postingTitle, string $applicationId): void
    {
        $deptHeads = User::where('role', 'dept_head')->get();
        foreach ($deptHeads as $deptHead) {
            self::createNotification([
                'type' => 'accepted_application_by_student',
                'title' => 'Application Accepted',
                'message' => "{$student->name} accepted their application for {$postingTitle}",
                'user_id' => $deptHead->user_id,
                'sender_id' => $student->user_id,
                'data' => ['student_name' => $student->name, 'posting_title' => $postingTitle, 'application_id' => $applicationId],
                'action_url' => "/department-head/accepted-applications",
                'action_text' => 'View Applications',
                'icon' => 'application',
            ]);
        }
    }

    /**
     * Notify advisor about form status changes
     */
    public static function notifyAdvisorFormStatus(User $advisor, string $studentName, string $formName, string $status, string $formId): void
    {
        self::createNotification([
            'type' => 'forms_status_changed',
            'title' => 'Form Status Update',
            'message' => "Form \"{$formName}\" for {$studentName} status changed to {$status}",
            'user_id' => $advisor->user_id,
            'data' => ['student_name' => $studentName, 'form_name' => $formName, 'status' => $status, 'form_id' => $formId],
            'action_url' => "/faculty-advisor/forms/{$formId}",
            'action_text' => 'View Form',
            'icon' => 'form',
        ]);
    }

    /**
     * Notify supervisor about form status changes
     */
    public static function notifySupervisorFormStatus(User $supervisor, string $studentName, string $formName, string $status, string $formId): void
    {
        self::createNotification([
            'type' => 'forms_status_changed',
            'title' => 'Form Status Update',
            'message' => "Form \"{$formName}\" for {$studentName} status changed to {$status}",
            'user_id' => $supervisor->user_id,
            'data' => ['student_name' => $studentName, 'form_name' => $formName, 'status' => $status, 'form_id' => $formId],
            'action_url' => "/company-supervisor/forms/{$formId}",
            'action_text' => 'View Form',
            'icon' => 'form',
        ]);
    }

    /**
     * Notify admin when coordinator, dept_head, or company_admin updates their profile
     */
    public static function notifyAdminProfileUpdate(User $user, string $role): void
    {
        if (!in_array($role, ['coordinator', 'dept_head', 'company_admin'])) {
            return;
        }

        $admins = User::where('role', 'admin')->get();
        $roleDisplay = match($role) {
            'coordinator' => 'Coordinator',
            'dept_head' => 'Department Head',
            'company_admin' => 'Company Admin',
            default => $role,
        };

        foreach ($admins as $admin) {
            self::createNotification([
                'type' => 'profile_updated',
                'title' => 'Profile Updated',
                'message' => "{$roleDisplay} {$user->name} has updated their profile",
                'user_id' => $admin->user_id,
                'sender_id' => $user->user_id,
                'data' => ['user_name' => $user->name, 'role' => $role],
                'action_url' => "/users/{$user->user_id}",
                'action_text' => 'View User',
                'icon' => 'user',
            ]);
        }
    }

    /**
     * Notify admin when student posts a success story
     */
    public static function notifyAdminSuccessStoryPosted(User $student, string $storyTitle): void
    {
        $admins = User::where('role', 'admin')->get();
        foreach ($admins as $admin) {
            self::createNotification([
                'type' => 'success_story_posted',
                'title' => 'New Success Story',
                'message' => "{$student->name} has submitted a new success story: {$storyTitle}",
                'user_id' => $admin->user_id,
                'sender_id' => $student->user_id,
                'data' => ['student_name' => $student->name, 'story_title' => $storyTitle],
                'action_url' => "/admin/approved-success-stories",
                'action_text' => 'Review Stories',
                'icon' => 'story',
            ]);
        }
    }

    /**
     * Notify student when their success story is approved or rejected
     */
    public static function notifyStudentSuccessStoryStatus(User $student, string $storyTitle, string $status): void
    {
        $statusText = $status === 'approved' ? 'approved' : 'rejected';
        $message = $status === 'approved'
            ? "Your success story '{$storyTitle}' has been approved and is now visible on the homepage"
            : "Your success story '{$storyTitle}' has been rejected. Please review and resubmit if needed.";

        self::createNotification([
            'type' => 'success_story_status',
            'title' => 'Success Story ' . ucfirst($statusText),
            'message' => $message,
            'user_id' => $student->user_id,
            'data' => ['story_title' => $storyTitle, 'status' => $status],
            'action_url' => "/student/success-stories",
            'action_text' => 'View Stories',
            'icon' => 'story',
        ]);
    }

    /**
     * Notify advisor when form is sent back by supervisor
     */
    public static function notifyAdvisorFormSentBack(User $advisor, string $studentName, string $formName, string $formId): void
    {
        self::createNotification([
            'type' => 'form_sent_back',
            'title' => 'Form Sent Back',
            'message' => "Form \"{$formName}\" for {$studentName} has been sent back by supervisor for revision",
            'user_id' => $advisor->user_id,
            'data' => ['student_name' => $studentName, 'form_name' => $formName, 'form_id' => $formId],
            'action_url' => "/faculty-advisor/forms/{$formId}",
            'action_text' => 'Review Form',
            'icon' => 'form',
        ]);
    }

    /**
     * Notify student when form is sent back by supervisor
     */
    public static function notifyStudentFormSentBack(User $student, string $formName, string $formUrl): void
    {
        self::createNotification([
            'type' => 'form_sent_back',
            'title' => 'Form Sent Back',
            'message' => "Form \"{$formName}\" has been sent back by supervisor for revision",
            'user_id' => $student->user_id,
            'data' => ['form_name' => $formName],
            'action_url' => $formUrl,
            'action_text' => 'Review Form',
            'icon' => 'form',
        ]);
    }

    /**
     * Notify student about analytics submission
     */
    public static function notifyStudentAnalyticsSubmitted(User $student, int $analyticsId): void
    {
        self::createNotification([
            'type' => 'analytics_submitted',
            'title' => 'Internship Analytics Available',
            'message' => "Your internship analytics have been submitted by your supervisor. View your completion details.",
            'user_id' => $student->user_id,
            'data' => ['analytics_id' => $analyticsId],
            'action_url' => "/student/analytics/{$analyticsId}",
            'action_text' => 'View Analytics',
            'icon' => 'analytics',
        ]);
    }

    /**
     * Notify advisor about analytics submission
     */
    public static function notifyAdvisorAnalyticsSubmitted(User $advisor, string $studentName, int $analyticsId): void
    {
        self::createNotification([
            'type' => 'analytics_submitted',
            'title' => 'Student Analytics Submitted',
            'message' => "Analytics for {$studentName} have been submitted by supervisor. You can download the evaluation form.",
            'user_id' => $advisor->user_id,
            'data' => ['student_name' => $studentName, 'analytics_id' => $analyticsId],
            'action_url' => "/faculty-advisor/analytics/{$analyticsId}",
            'action_text' => 'View Analytics',
            'icon' => 'analytics',
        ]);
    }

    /**
     * Notify company admin about analytics submission
     */
    public static function notifyCompanyAdminAnalyticsSubmitted(User $companyAdmin, string $studentName, int $analyticsId): void
    {
        self::createNotification([
            'type' => 'analytics_submitted',
            'title' => 'Internship Completed',
            'message' => "Student {$studentName} has completed their internship. Analytics have been submitted.",
            'user_id' => $companyAdmin->user_id,
            'data' => ['student_name' => $studentName, 'analytics_id' => $analyticsId],
            'action_url' => "/company-admin/analytics/{$analyticsId}",
            'action_text' => 'View Analytics',
            'icon' => 'analytics',
        ]);
    }

    /**
     * Notify department head about analytics submission
     */
    public static function notifyDeptHeadAnalyticsSubmitted(User $deptHead, string $studentName, int $analyticsId): void
    {
        self::createNotification([
            'type' => 'analytics_submitted',
            'title' => 'Student Internship Completed',
            'message' => "Student {$studentName} has completed their internship. Analytics have been submitted.",
            'user_id' => $deptHead->user_id,
            'data' => ['student_name' => $studentName, 'analytics_id' => $analyticsId],
            'action_url' => "/department-head/analytics/{$analyticsId}",
            'action_text' => 'View Analytics',
            'icon' => 'analytics',
        ]);
    }

    /**
     * Notify coordinator about analytics submission
     */
    public static function notifyCoordinatorAnalyticsSubmitted(User $coordinator, string $studentName, int $analyticsId): void
    {
        self::createNotification([
            'type' => 'analytics_submitted',
            'title' => 'Student Internship Completed',
            'message' => "Student {$studentName} has completed their internship. Analytics have been submitted.",
            'user_id' => $coordinator->user_id,
            'data' => ['student_name' => $studentName, 'analytics_id' => $analyticsId],
            'action_url' => "/coordinator/completed-students",
            'action_text' => 'View Completed Students',
            'icon' => 'analytics',
        ]);
    }

    /**
     * Notify supervisor about internship ending soon (5 days before)
     */
    public static function notifySupervisorInternshipEnding(User $supervisor, string $studentName, int $daysRemaining): void
    {
        self::createNotification([
            'type' => 'internship_ending',
            'title' => 'Internship Ending Soon',
            'message' => "Internship for {$studentName} ends in {$daysRemaining} day(s). Please prepare analytics.",
            'user_id' => $supervisor->user_id,
            'data' => ['student_name' => $studentName, 'days_remaining' => $daysRemaining],
            'action_url' => "/company-supervisor/analytics",
            'action_text' => 'View Analytics',
            'icon' => 'clock',
        ]);
    }

    /**
     * Notify advisor about internship ending soon (5 days before)
     */
    public static function notifyAdvisorInternshipEnding(User $advisor, string $studentName, int $daysRemaining): void
    {
        self::createNotification([
            'type' => 'internship_ending',
            'title' => 'Student Internship Ending Soon',
            'message' => "Internship for {$studentName} ends in {$daysRemaining} day(s).",
            'user_id' => $advisor->user_id,
            'data' => ['student_name' => $studentName, 'days_remaining' => $daysRemaining],
            'action_url' => "/faculty-advisor/students",
            'action_text' => 'View Students',
            'icon' => 'clock',
        ]);
    }

    /**
     * Notify student about account deactivation warning
     */
    public static function notifyStudentAccountDeactivationWarning(User $student): void
    {
        self::createNotification([
            'type' => 'account_deactivation_warning',
            'title' => 'Account Deactivation Warning',
            'message' => "Your account will be deactivated soon. Please submit your success story before your account is deactivated.",
            'user_id' => $student->user_id,
            'data' => ['deactivation_date' => $student->account_deactivation_date?->toDateString()],
            'action_url' => "/student/success-stories/create",
            'action_text' => 'Submit Success Story',
            'icon' => 'warning',
        ]);
    }
}