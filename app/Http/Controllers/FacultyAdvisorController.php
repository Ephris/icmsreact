<?php

namespace App\Http\Controllers;

use App\Models\AdvisorAssignment;
use App\Models\Application;
use App\Models\Department;
use App\Models\Feedback;
use App\Models\Form;
use App\Models\Student;
use App\Models\User;
use App\Models\InternshipAnalytics;
use App\Models\ApplicationLetter;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use App\Services\NotificationService;
use Carbon\Carbon;

class FacultyAdvisorController extends Controller
{
    public function index()
    {
        $advisor = Auth::user();

        // Get assigned students with their details and accepted applications
        $assignedStudents = Student::whereHas('advisorAssignments', fn($q) => $q->where('advisor_id', $advisor->user_id))
            ->with(['user', 'department', 'applications' => fn($q) => $q->where('status', 'accepted')->with('posting')])
            ->get()
            ->map(fn($student) => [
                'student_id' => $student->student_id,
                'name' => $student->name,
                'email' => $student->user->email,
                'department_name' => $student->department->name,
                'cgpa' => $student->cgpa,
                'year_of_study' => $student->year_of_study,
                'university_id' => $student->university_id,
                'gender' => $student->user->gender,
                'accepted_applications' => $student->applications->count(),
                'applications' => $student->applications->map(fn($app) => [
                    'application_id' => $app->application_id,
                    'posting_title' => $app->posting->title,
                    'posting_type' => $app->posting->type,
                    'status' => $app->status,
                    'submitted_at' => $app->submitted_at->toDateTimeString(),
                ]),
            ]);

        // Get department information
        $department = Department::whereHas('advisorAssignments', fn($q) => $q->where('advisor_id', $advisor->user_id))->with('deptHead')->first();

        // Get statistics
        $stats = [
            'assignedStudents' => $assignedStudents->count(),
            'forms' => Form::where('advisor_id', $advisor->user_id)->count(),
            'trashedForms' => Form::where('advisor_id', $advisor->user_id)->onlyTrashed()->count(),
            'acceptedApplications' => $assignedStudents->sum('accepted_applications'),
        ];

        // Get students with ending internships (5 days or less remaining)
        $endingStudents = Student::whereHas('advisorAssignments', fn($q) => $q->where('advisor_id', $advisor->user_id))
            ->with(['applicationLetter', 'applications' => fn($q) => $q->where('status', 'accepted')])
            ->get()
            ->filter(function($student) {
                if (!$student->applicationLetter) return false;
                $daysRemaining = now()->diffInDays($student->applicationLetter->end_date, false);
                return $daysRemaining <= 5 && $daysRemaining >= 0;
            })
            ->map(function($student) {
                $letter = $student->applicationLetter;
                $daysRemaining = now()->diffInDays($letter->end_date, false);
                return [
                    'student_id' => $student->student_id,
                    'student_name' => $student->name,
                    'end_date' => $letter->end_date->toDateString(),
                    'days_remaining' => $daysRemaining,
                ];
            });

        // Get completed students count
        $completedStudentsCount = Student::whereHas('advisorAssignments', fn($q) => $q->where('advisor_id', $advisor->user_id))
            ->whereHas('applications', fn($q) => $q->where('status', 'completed'))
            ->count();

        return Inertia::render('faculty-advisor/index', [
            'department' => $department ? [
                'department_id' => $department->department_id,
                'name' => $department->name,
                'description' => $department->description,
                'head_name' => $department->deptHead ? $department->deptHead->name : 'N/A',
            ] : null,
            'assignedStudents' => $assignedStudents,
            'stats' => $stats,
            'endingStudents' => $endingStudents,
            'completedStudentsCount' => $completedStudentsCount,
            'success' => session('success'),
            'error' => session('error'),
        ]);
    }

    public function students(Request $request)
    {
        $advisor = Auth::user();

        $query = Student::whereHas('advisorAssignments', fn($q) => $q->where('advisor_id', $advisor->user_id))
            ->with(['applications' => fn($q) => $q->where('status', 'accepted')]);

        if ($request->search) {
            $query->where(fn($q) => $q->where('first_name', 'like', "%{$request->search}%")
                                      ->orWhere('last_name', 'like', "%{$request->search}%"));
        }

        $sortBy = $request->sort_by ?? 'first_name';
        $sortDir = $request->sort_dir ?? 'asc';
        $query->orderBy($sortBy, $sortDir);

        $students = $query->paginate(10)->withQueryString()->through(fn($student) => [
            'student_id' => $student->student_id,
            'name' => $student->name,
            'university_id' => $student->university_id,
            'gender' => $student->user->gender,
            'cgpa' => $student->cgpa,
            'year_of_study' => $student->year_of_study,
            'accepted_applications' => $student->applications->where('status', 'accepted')->count(),
            'has_completed_application' => $student->applications->where('status', 'completed')->count() > 0,
            'applications' => $student->applications->where('status', 'accepted')->map(fn($app) => [
                'application_id' => $app->application_id,
                'posting_title' => $app->posting->title,
                'posting_type' => $app->posting->type,
                'status' => $app->status,
                'submitted_at' => $app->submitted_at->toDateTimeString(),
            ]),
        ]);

        return Inertia::render('faculty-advisor/students', [
            'students' => $students,
            'filters' => $request->only(['search', 'sort_by', 'sort_dir']),
            'success' => session('success'),
            'error' => session('error'),
        ]);
    }

    public function applications(Request $request)
    {
        $advisor = Auth::user();

        $query = Application::whereHas('student.advisorAssignments', fn($q) => $q->where('advisor_id', $advisor->user_id))
            ->where('status', 'accepted')
            ->with(['student.user', 'student' => fn($q) => $q->select('student_id', 'user_id', 'university_id'), 'posting', 'feedbacks' => fn($q) => $q->where('advisor_id', $advisor->user_id)]);

        if ($request->search) {
            $query->whereHas('student.user', fn($q) => $q->where('name', 'like', "%{$request->search}%"));
        }

        $sortBy = $request->sort_by ?? 'submitted_at';
        $sortDir = $request->sort_dir ?? 'desc';
        $query->orderBy($sortBy, $sortDir);

        $applications = $query->paginate(10)->withQueryString()->through(fn($app) => [
            'application_id' => $app->application_id,
            'student_id' => $app->student_id,
            'student_name' => $app->student->name,
            'student_gender' => $app->student->user->gender,
            'student_university_id' => $app->student->university_id,
            'posting_title' => $app->posting->title,
            'posting_type' => $app->posting->type,
            'status' => $app->status,
            'feedback' => $app->feedbacks->first() ? [
                'feedback_id' => $app->feedbacks->first()->feedback_id,
                'content' => $app->feedbacks->first()->content,
                'rating' => $app->feedbacks->first()->rating,
                'created_at' => $app->feedbacks->first()->created_at->toDateTimeString(),
            ] : null,
            'submitted_at' => $app->submitted_at->toDateTimeString(),
        ]);

        return Inertia::render('faculty-advisor/applications', [
            'applications' => $applications,
            'filters' => $request->only(['search', 'sort_by', 'sort_dir']),
            'success' => session('success'),
            'error' => session('error'),
        ]);
    }

    public function provideFeedback(Request $request, $application_id)
    {
        $advisor = Auth::user();

        $application = Application::whereHas('student.advisorAssignments', fn($q) => $q->where('advisor_id', $advisor->user_id))
            ->where('status', 'accepted')
            ->findOrFail($application_id);

        $validated = $request->validate([
            'content' => 'required|string|max:1000',
            'rating' => 'required|integer|min:1|max:5',
        ]);

        Feedback::updateOrCreate(
            [
                'advisor_id' => $advisor->user_id,
                'student_id' => $application->student_id,
            ],
            [
                'content' => $validated['content'],
                'rating' => $validated['rating'],
            ]
        );

        // Notify student about feedback
        NotificationService::notifyAdvisorStudentFeedback($advisor, $application->student->user, $application->application_id);

        Log::info('Feedback provided', ['application_id' => $application_id, 'advisor_id' => $advisor->user_id]);

        return redirect()->route('faculty-advisor.applications')->with('success', 'Feedback provided successfully.');
    }

    public function editFeedback(Request $request, $feedback_id)
    {
        $advisor = Auth::user();

        $feedback = Feedback::where('advisor_id', $advisor->user_id)->findOrFail($feedback_id);

        $validated = $request->validate([
            'content' => 'required|string|max:1000',
            'rating' => 'required|integer|min:1|max:5',
        ]);

        $feedback->update([
            'content' => $validated['content'],
            'rating' => $validated['rating'],
        ]);

        return redirect()->route('faculty-advisor.applications')->with('success', 'Feedback updated successfully.');
    }

    public function deleteFeedback($feedback_id)
    {
        $advisor = Auth::user();

        $feedback = Feedback::where('advisor_id', $advisor->user_id)->findOrFail($feedback_id);
        $feedback->delete();

        return redirect()->route('faculty-advisor.applications')->with('success', 'Feedback deleted successfully.');
    }

    public function forms(Request $request)
    {
        $advisor = Auth::user();

        $query = Form::where('advisor_id', $advisor->user_id)
            ->with(['student.user' => fn($q) => $q->select('user_id', 'first_name', 'last_name'), 'supervisor']);

        if ($request->search) {
            $query->where('title', 'like', "%{$request->search}%");
        }

        if ($request->type && $request->type !== 'all') {
            $query->where('type', $request->type);
        }

        if ($request->status && $request->status !== 'all') {
            $query->where('status', $request->status);
        }

        $sortBy = $request->sort_by ?? 'created_at';
        $sortDir = $request->sort_dir ?? 'desc';
        $query->orderBy($sortBy, $sortDir);

        $forms = $query->paginate(10)->withQueryString()->through(fn($form) => [
            'form_id' => $form->form_id,
            'title' => $form->title,
            'type' => $form->type,
            'file_path' => Storage::url($form->file_path),
            'filename' => basename($form->file_path),
            'student_name' => trim("{$form->student->user->first_name} {$form->student->user->last_name}"),
            'supervisor_name' => $form->supervisor ? trim("{$form->supervisor->first_name} {$form->supervisor->last_name}") : 'N/A',
            'status' => $form->status,
            'comments' => $form->comments,
            'created_at' => $form->created_at->toDateTimeString(),
        ]);

        return Inertia::render('faculty-advisor/forms', [
            'forms' => $forms,
            'filters' => $request->only(['search', 'type', 'status', 'sort_by', 'sort_dir']),
            'success' => session('success'),
            'error' => session('error'),
        ]);
    }

    public function createForm()
    {
        $advisor = Auth::user();

        $assignedStudents = Application::whereHas('student.advisorAssignments', fn($q) => $q->where('advisor_id', $advisor->user_id))
            ->where('status', 'accepted')
            ->with(['student.user', 'posting.supervisor'])
            ->get()
            ->filter(function($app) {
                // Exclude students with completed applications
                return !Application::where('student_id', $app->student->student_id)
                    ->where('status', 'completed')
                    ->exists();
            })
            ->map(fn($app) => [
                'student_id' => (string) $app->student->student_id,
                'student_name' => trim("{$app->student->user->first_name} {$app->student->user->last_name}"),
                'supervisor_id' => (string) $app->posting->supervisor_id,
                'supervisor_name' => $app->posting->supervisor ? trim("{$app->posting->supervisor->first_name} {$app->posting->supervisor->last_name}") : 'N/A',
            ])
            ->unique('student_id')
            ->values();

        $supervisors = User::where('role', 'supervisor')
            ->select('user_id', 'first_name', 'last_name')
            ->get()
            ->map(fn($user) => [
                'user_id' => (string) $user->user_id,
                'name' => trim("{$user->first_name} {$user->last_name}"),
            ]);

        return Inertia::render('faculty-advisor/forms-create', [
            'assignedStudents' => $assignedStudents,
            'supervisors' => $supervisors,
        ]);
    }

    public function storeForm(Request $request)
    {
        $validated = $request->validate([
            'student_id' => 'required|exists:students,student_id',
            'supervisor_id' => 'required|exists:users,user_id',
            'title' => 'required|string|max:255',
            'type' => 'required|in:progress_report,final_report,midterm_evaluation',
            'file' => 'required|file|mimes:pdf,doc,docx|max:10240',
            'description' => 'nullable|string|max:1000',
        ]);

        // Check if student has completed application
        $student = Student::find($validated['student_id']);
        if ($student) {
            $hasCompletedApplication = Application::where('student_id', $student->student_id)
                ->where('status', 'completed')
                ->exists();
            
            if ($hasCompletedApplication) {
                return redirect()->back()->with('error', 'Cannot create form for student with completed internship.')->withInput();
            }
        }

        $advisor = Auth::user();
        $filePath = $request->file('file')->store('forms', 'public');

        Form::create([
            'advisor_id' => $advisor->user_id,
            'student_id' => $validated['student_id'],
            'supervisor_id' => $validated['supervisor_id'],
            'title' => $validated['title'],
            'file_path' => $filePath,
            'type' => $validated['type'],
            'status' => 'pending',
            'comments' => $validated['description'] ?? null,
        ]);

        // Notify supervisor about new form
        $student = Student::find($validated['student_id']);
        $supervisor = User::find($validated['supervisor_id']);
        $form = Form::latest()->first();

        if ($student && $supervisor && $form) {
            NotificationService::notifySupervisorNewForm($supervisor, $student->user, $form->form_id);

            // Also notify the student about the new form
            NotificationService::notifyStudentFormStatus($student->user, $form->title, 'pending', route('student.forms.show', $form->form_id));
        }

        return redirect()->route('faculty-advisor.forms')->with('success', 'Form created and shared with supervisor successfully.');
    }

    public function editForm($form_id)
    {
        $advisor = Auth::user();

        $form = Form::where('advisor_id', $advisor->user_id)
            ->with(['student.user', 'supervisor'])
            ->findOrFail($form_id);

        $assignedStudents = Student::whereHas('advisorAssignments', fn($q) => $q->where('advisor_id', $advisor->user_id))
            ->with(['user' => fn($q) => $q->select('user_id', 'first_name', 'last_name')])
            ->get()
            ->map(fn($student) => [
                'student_id' => (string) $student->student_id,
                'name' => trim("{$student->user->first_name} {$student->user->last_name}"),
            ]);

        return Inertia::render('faculty-advisor/forms-edit', [
            'form' => [
                'form_id' => $form->form_id,
                'title' => $form->title,
                'type' => $form->type,
                'student_id' => (string) $form->student_id,
                'student_name' => trim("{$form->student->user->first_name} {$form->student->user->last_name}"),
                'supervisor_name' => $form->supervisor ? trim("{$form->supervisor->first_name} {$form->supervisor->last_name}") : 'Not assigned',
                'description' => $form->comments,
                'file_path' => Storage::url($form->file_path),
            ],
            'success' => session('success'),
            'error' => session('error'),
        ]);
    }

    public function showForm($form_id)
    {
        $advisor = Auth::user();

        $form = Form::where('advisor_id', $advisor->user_id)
            ->with(['student.user', 'supervisor'])
            ->findOrFail($form_id);

        return Inertia::render('faculty-advisor/forms-show', [
            'form' => [
                'form_id' => $form->form_id,
                'title' => $form->title,
                'type' => $form->type,
                'file_path' => Storage::url($form->file_path),
                'filename' => basename($form->file_path),
                'student_name' => trim("{$form->student->user->first_name} {$form->student->user->last_name}"),
                'supervisor_name' => $form->supervisor ? trim("{$form->supervisor->first_name} {$form->supervisor->last_name}") : 'N/A',
                'status' => $form->status,
                'comments' => $form->comments,
                'created_at' => $form->created_at->toDateTimeString(),
            ],
            'success' => session('success'),
            'error' => session('error'),
        ]);
    }


    public function updateForm(Request $request, $form_id)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'type' => 'required|in:progress_report,final_report,midterm_evaluation',
            'file' => 'nullable|file|mimes:pdf,doc,docx|max:10240',
            'description' => 'nullable|string|max:1000',
        ]);

        $advisor = Auth::user();

        $form = Form::where('advisor_id', $advisor->user_id)->findOrFail($form_id);

        $filePath = $form->file_path;
        if ($request->hasFile('file')) {
            Storage::disk('public')->delete($filePath);
            $filePath = $request->file('file')->store('forms', 'public');
        }

        $form->update([
            'title' => $validated['title'],
            'type' => $validated['type'],
            'file_path' => $filePath,
            'comments' => $validated['description'] ?? null,
        ]);

        return redirect()->route('faculty-advisor.forms')->with('success', 'Form updated successfully.');
    }

    public function destroyForm($form_id)
    {
        $advisor = Auth::user();

        $form = Form::where('advisor_id', $advisor->user_id)->findOrFail($form_id);
        $form->delete();

        return redirect()->route('faculty-advisor.forms')->with('success', 'Form deleted successfully.');
    }

    public function trashedForms(Request $request)
    {
        $advisor = Auth::user();

        $query = Form::where('advisor_id', $advisor->user_id)->onlyTrashed()
            ->with(['student.user' => fn($q) => $q->select('user_id', 'first_name', 'last_name')]);

        if ($request->search) {
            $query->where('title', 'like', "%{$request->search}%");
        }

        $sortBy = $request->sort_by ?? 'deleted_at';
        $sortDir = $request->sort_dir ?? 'desc';
        $query->orderBy($sortBy, $sortDir);

        $trashedForms = $query->paginate(10)->withQueryString()->through(fn($form) => [
            'form_id' => $form->form_id,
            'title' => $form->title,
            'type' => $form->type,
            'file_path' => Storage::url($form->file_path),
            'filename' => basename($form->file_path),
            'student_name' => trim("{$form->student->user->first_name} {$form->student->user->last_name}"),
            'supervisor_name' => $form->supervisor ? trim("{$form->supervisor->first_name} {$form->supervisor->last_name}") : 'N/A',
            'deleted_at' => $form->deleted_at->toDateTimeString(),
        ]);

        return Inertia::render('faculty-advisor/forms-trashed', [
            'trashedForms' => $trashedForms,
            'filters' => $request->only(['search', 'sort_by', 'sort_dir']),
            'success' => session('success'),
            'error' => session('error'),
        ]);
    }

    public function restoreForm($form_id)
    {
        $advisor = Auth::user();

        $form = Form::where('advisor_id', $advisor->user_id)->onlyTrashed()->findOrFail($form_id);
        $form->restore();

        return redirect()->route('faculty-advisor.forms')->with('success', 'Form restored successfully.');
    }

    public function forceDeleteForm($form_id)
    {
        $advisor = Auth::user();

        $form = Form::where('advisor_id', $advisor->user_id)->onlyTrashed()->findOrFail($form_id);

        // Delete the file from storage
        Storage::disk('public')->delete($form->file_path);

        $form->forceDelete();

        return redirect()->route('faculty-advisor.forms.trashed')->with('success', 'Form permanently deleted successfully.');
    }

    public function profileIndex(Request $request)
    {
        if (Auth::user()->role !== 'advisor') {
            abort(403, 'Unauthorized');
        }

        $user = Auth::user();
        $department = Department::whereHas('advisorAssignments', fn($q) => $q->where('advisor_id', $user->user_id))->with('deptHead')->first();

        return Inertia::render('faculty-advisor/profile-index', [
            'user' => [
                'user_id' => $user->user_id,
                'first_name' => $user->first_name,
                'last_name' => $user->last_name,
                'email' => $user->email,
                'phone' => $user->phone,
                'username' => $user->username,
                'specialization' => $user->specialization,
                'profile_image' => $user->avatar ? Storage::url($user->avatar) : null,
            ],
            'department' => $department ? [
                'department_id' => $department->department_id,
                'name' => $department->name,
                'description' => $department->description,
                'head_name' => $department->deptHead ? $department->deptHead->name : 'N/A',
            ] : null,
            'success' => session('success'),
            'error' => session('error'),
        ]);
    }

    public function profile(Request $request)
    {
        if (Auth::user()->role !== 'advisor') {
            abort(403, 'Unauthorized');
        }

        $user = Auth::user();
        $department = Department::whereHas('advisorAssignments', fn($q) => $q->where('advisor_id', $user->user_id))->with('deptHead')->first();

        return Inertia::render('faculty-advisor/profile', [
            'user' => [
                'user_id' => $user->user_id,
                'first_name' => $user->first_name,
                'last_name' => $user->last_name,
                'email' => $user->email,
                'phone' => $user->phone,
                'username' => $user->username,
                'specialization' => $user->specialization,
                'profile_image' => $user->avatar ? Storage::url($user->avatar) : null,
            ],
            'department' => $department ? [
                'department_id' => $department->department_id,
                'name' => $department->name,
                'description' => $department->description,
                'head_name' => $department->deptHead ? $department->deptHead->name : 'N/A',
            ] : null,
            'success' => session('success'),
            'error' => session('error'),
        ]);
    }

    public function updateProfile(Request $request)
    {
        if (Auth::user()->role !== 'advisor') {
            abort(403, 'Unauthorized');
        }

        $user = Auth::user();

        $validated = $request->validate([
            'first_name' => 'required|string|max:100',
            'last_name' => 'required|string|max:100',
            'email' => 'required|string|email|max:255|unique:users,email,' . $user->user_id . ',user_id',
            'phone' => 'nullable|string|max:20',
            'username' => 'required|string|max:100|unique:users,username,' . $user->user_id . ',user_id',
            'specialization' => 'nullable|string|max:255',
            'profile_image' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:2048',
        ]);

        try {
            $updateData = [
                'first_name' => $validated['first_name'],
                'last_name' => $validated['last_name'],
                'email' => $validated['email'],
                'phone' => $validated['phone'],
                'username' => $validated['username'],
                'specialization' => $validated['specialization'],
            ];

            // Handle profile image upload
            if ($request->hasFile('profile_image')) {
                // Delete old avatar if exists
                if ($user->avatar && Storage::disk('public')->exists($user->avatar)) {
                    Storage::disk('public')->delete($user->avatar);
                }
                $avatarPath = $request->file('profile_image')->store('avatars', 'public');
                $updateData['avatar'] = $avatarPath;
            }

            DB::table('users')->where('user_id', $user->user_id)->update($updateData);

            Log::info('Faculty advisor profile updated', ['user_id' => $user->user_id]);

            return redirect()->route('faculty-advisor.profile.index')->with('success', 'Profile updated successfully.');
        } catch (\Exception $e) {
            Log::error('Failed to update faculty advisor profile:', [
                'user_id' => $user->user_id,
                'error' => $e->getMessage(),
            ]);
            return redirect()->back()->with('error', 'Failed to update profile: ' . $e->getMessage())->withInput();
        }
    }

    public function analyticsIndex()
    {
        $advisor = Auth::user();

        $analytics = InternshipAnalytics::whereHas('student.advisorAssignments', fn($q) => $q->where('advisor_id', $advisor->user_id))
            ->with(['student.user', 'supervisor', 'posting', 'form'])
            ->orderBy('submitted_at', 'desc')
            ->paginate(10)
            ->through(fn($analytics) => [
                'analytics_id' => $analytics->analytics_id,
                'student_name' => $analytics->student->name,
                'student_email' => $analytics->student->user->email,
                'posting_title' => $analytics->posting_title,
                'company_name' => $analytics->company_name,
                'supervisor_name' => $analytics->supervisor->name,
                'submitted_at' => $analytics->submitted_at->toDateTimeString(),
                'form_title' => $analytics->form_title,
                'advisor_score' => $analytics->advisor_score,
                'advisor_score_out_of' => $analytics->advisor_score_out_of,
                'advisor_evaluation' => $analytics->advisor_evaluation,
                'dept_head_score' => $analytics->dept_head_score,
                'dept_head_score_out_of' => $analytics->dept_head_score_out_of,
                'final_score' => $analytics->final_score,
            ]);

        return Inertia::render('faculty-advisor/analytics-index', [
            'analytics' => $analytics,
            'success' => session('success'),
            'error' => session('error'),
        ]);
    }

    public function viewAnalytics($analytics_id)
    {
        $advisor = Auth::user();

        $analytics = InternshipAnalytics::where('analytics_id', $analytics_id)
            ->whereHas('student.advisorAssignments', fn($q) => $q->where('advisor_id', $advisor->user_id))
            ->with(['student.user', 'supervisor', 'posting', 'form'])
            ->firstOrFail();

        return Inertia::render('faculty-advisor/analytics-view', [
            'analytics' => [
                'analytics_id' => $analytics->analytics_id,
                'student_name' => $analytics->student->name,
                'student_email' => $analytics->student->user->email,
                'posting_title' => $analytics->posting_title,
                'company_name' => $analytics->company_name,
                'location' => $analytics->location,
                'industry' => $analytics->industry,
                'work_type' => $analytics->work_type,
                'start_date' => $analytics->start_date->toDateString(),
                'end_date' => $analytics->end_date->toDateString(),
                'duration_days' => $analytics->duration_days,
                'form_type' => $analytics->form_type,
                'form_title' => $analytics->form_title,
                'supervisor_comments' => $analytics->supervisor_comments,
                'supervisor_name' => $analytics->supervisor->name,
                'submitted_at' => $analytics->submitted_at->toDateTimeString(),
                'form_file' => $analytics->form && $analytics->form->file_path && Storage::disk('public')->exists($analytics->form->file_path) 
                    ? '/download/form/' . basename($analytics->form->file_path)
                    : null,
            ],
            'success' => session('success'),
            'error' => session('error'),
        ]);
    }

    public function setAdvisorScore(Request $request, $analytics_id)
    {
        $advisor = Auth::user();

        $validated = $request->validate([
            'score' => 'required|numeric|min:0',
            'score_out_of' => 'required|integer|min:1|max:100',
            'evaluation' => 'nullable|string|max:2000',
        ]);

        $analytics = InternshipAnalytics::where('analytics_id', $analytics_id)
            ->whereHas('student.advisorAssignments', fn($q) => $q->where('advisor_id', $advisor->user_id))
            ->with(['student.user'])
            ->firstOrFail();

        $advisorScore = (float) $validated['score'];
        $advisorScoreOutOf = (int) $validated['score_out_of'];
        
        // Validate score doesn't exceed out_of
        if ($advisorScore > $advisorScoreOutOf) {
            return redirect()->back()->with('error', 'Score cannot exceed the maximum value.');
        }

        $deptScore = $analytics->dept_head_score ?? 0;
        $deptScoreOutOf = $analytics->dept_head_score_out_of ?? 0;

        // Validate that out_of values sum to 100 when both are set
        if ($deptScoreOutOf > 0 && ($advisorScoreOutOf + $deptScoreOutOf) != 100) {
            return redirect()->back()->with('error', 'The sum of advisor and department head "out of" values must equal 100.');
        }

        // Final score is the sum of advisor + dept scores (their out_of values must total 100)
        $final = min(100, $advisorScore + $deptScore);

        $analytics->update([
            'advisor_score' => $advisorScore,
            'advisor_score_out_of' => $advisorScoreOutOf,
            'advisor_evaluation' => $validated['evaluation'] ?? null,
            'final_score' => $final,
        ]);

        // Schedule student deactivation 30 days after final score is available (when both scores are set)
        if ($analytics->student && $analytics->student->user && $analytics->student->user->status === 'active') {
            $user = $analytics->student->user;
            // Check if final score is complete (both advisor_score and dept_head_score are set)
            $analytics->refresh();
            if (!is_null($analytics->advisor_score) && !is_null($analytics->dept_head_score) && empty($user->account_deactivation_date)) {
                $deactivationDate = Carbon::now()->addDays(30)->toDateString();
                $user->account_deactivation_date = $deactivationDate;
                $user->save();
                NotificationService::notifyStudentAccountDeactivationWarning($user);
            }
        }

        return redirect()->back()->with('success', 'Advisor evaluation saved.');
    }
}

