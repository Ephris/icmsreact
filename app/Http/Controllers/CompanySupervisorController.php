<?php

namespace App\Http\Controllers;

use App\Models\SupervisorAssignment;
use App\Models\Form;
use App\Models\Posting;
use App\Models\Application;
use App\Models\Student;
use App\Models\User;
use App\Models\InternshipAnalytics;
use App\Models\ApplicationLetter;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use App\Services\NotificationService;

class CompanySupervisorController extends Controller
{
    public function index()
    {
        $supervisor = Auth::user();

        // Get company information
        $company = $supervisor->assignedCompaniesAsSupervisor->first();

        // Get assigned students with their applications
        $assignedStudents = SupervisorAssignment::where('supervisor_id', $supervisor->user_id)
            ->with(['student.user', 'student.department', 'posting', 'student.applications' => fn($q) => $q->where('status', 'accepted')])
            ->get()
            ->map(fn($assignment) => [
                'assignment_id' => $assignment->assignment_id,
                'student_name' => $assignment->student->name,
                'student_email' => $assignment->student->user->email,
                'student_gender' => $assignment->student->user->gender,
                'student_university_id' => $assignment->student->university_id,
                'department_name' => $assignment->student->department->name,
                'posting_title' => $assignment->posting->title,
                'posting_type' => $assignment->posting->type,
                'status' => $assignment->status,
                'assigned_at' => $assignment->assigned_at->toDateTimeString(),
                'applications' => $assignment->student->applications->where('posting_id', $assignment->posting_id)->map(fn($app) => [
                    'application_id' => $app->application_id,
                    'status' => $app->status,
                    'submitted_at' => $app->submitted_at->toDateTimeString(),
                ]),
            ]);

        // Get pending forms
        $pendingForms = Form::where('supervisor_id', $supervisor->user_id)
            ->where('status', 'pending')
            ->with(['student.user', 'advisor'])
            ->get()
            ->map(fn($form) => [
                'form_id' => $form->form_id,
                'title' => $form->title,
                'type' => $form->type,
                'student_name' => $form->student->name,
                'advisor_name' => $form->advisor->name,
                'created_at' => $form->created_at->toDateTimeString(),
            ]);

        // Get postings
        $postings = Posting::where('supervisor_id', $supervisor->user_id)
            ->get()
            ->map(fn($posting) => [
                'posting_id' => $posting->posting_id,
                'title' => $posting->title,
                'type' => $posting->type,
                'status' => $posting->status,
                'application_deadline' => $posting->application_deadline->toDateString(),
                'applications_count' => $posting->applications()->count(),
            ]);

        // Get students with ending internships (5 days or less remaining)
        $endingStudents = SupervisorAssignment::where('supervisor_id', $supervisor->user_id)
            ->where('status', 'active')
            ->with(['student.user', 'student.applicationLetter', 'posting'])
            ->get()
            ->filter(function($assignment) {
                if (!$assignment->student->applicationLetter) return false;
                $daysRemaining = now()->diffInDays($assignment->student->applicationLetter->end_date, false);
                return $daysRemaining <= 5 && $daysRemaining >= 0;
            })
            ->map(function($assignment) {
                $letter = $assignment->student->applicationLetter;
                $daysRemaining = now()->diffInDays($letter->end_date, false);
                return [
                    'assignment_id' => $assignment->assignment_id,
                    'student_id' => $assignment->student_id,
                    'student_name' => $assignment->student->name,
                    'end_date' => $letter->end_date->toDateString(),
                    'days_remaining' => $daysRemaining,
                    'is_expired' => $daysRemaining < 0,
                ];
            });

        // Get students with completed internships (0 days or past end date)
        $completedStudents = SupervisorAssignment::where('supervisor_id', $supervisor->user_id)
            ->where('status', 'active')
            ->with(['student.user', 'student.applicationLetter'])
            ->get()
            ->filter(function($assignment) {
                if (!$assignment->student->applicationLetter) return false;
                $daysRemaining = now()->diffInDays($assignment->student->applicationLetter->end_date, false);
                return $daysRemaining <= 0;
            })
            ->count();

        return Inertia::render('company-supervisor/index', [
            'company' => $company ? [
                'company_id' => $company->company_id,
                'name' => $company->name,
                'industry' => $company->industry,
                'location' => $company->location,
                'website' => $company->website,
                'description' => $company->description,
            ] : null,
            'assignedStudents' => $assignedStudents,
            'pendingForms' => $pendingForms,
            'postings' => $postings,
            'endingStudents' => $endingStudents,
            'completedStudentsCount' => $completedStudents,
            'success' => session('success'),
            'error' => session('error'),
        ]);
    }

    public function students(Request $request)
    {
        $supervisor = Auth::user();

        // Separate queries for active students and completed students
        $activeQuery = SupervisorAssignment::where('supervisor_id', $supervisor->user_id)
            ->where('status', 'active')
            ->whereDoesntHave('student.applications', fn($q) => $q->where('status', 'completed'))
            ->with(['student.user', 'student.department', 'posting']);

        $completedQuery = SupervisorAssignment::where('supervisor_id', $supervisor->user_id)
            ->whereHas('student.applications', fn($q) => $q->where('status', 'completed'))
            ->with(['student.user', 'student.department', 'posting', 'student.applications' => fn($q) => $q->where('status', 'completed')]);

        if ($request->search) {
            $activeQuery->whereHas('student.user', fn($q) => $q->where('name', 'like', "%{$request->search}%")
                ->orWhere('email', 'like', "%{$request->search}%"));
            $completedQuery->whereHas('student.user', fn($q) => $q->where('name', 'like', "%{$request->search}%")
                ->orWhere('email', 'like', "%{$request->search}%"));
        }

        if ($request->year && $request->year !== 'all') {
            $activeQuery->whereHas('student', fn($q) => $q->where('year_of_study', $request->year));
            $completedQuery->whereHas('student', fn($q) => $q->where('year_of_study', $request->year));
        }

        $sortBy = $request->sort_by ?? 'assigned_at';
        $sortDir = $request->sort_dir ?? 'desc';

        // Handle different sort fields for active students
        if ($sortBy === 'name') {
            $activeQuery->join('students', 'supervisor_assignments.student_id', '=', 'students.student_id')
                  ->join('users', 'students.user_id', '=', 'users.user_id')
                  ->orderBy('users.name', $sortDir)
                  ->select('supervisor_assignments.*');
        } elseif ($sortBy === 'year_of_study') {
            $activeQuery->join('students', 'supervisor_assignments.student_id', '=', 'students.student_id')
                  ->orderBy('students.year_of_study', $sortDir)
                  ->select('supervisor_assignments.*');
        } elseif ($sortBy === 'gpa') {
            $activeQuery->join('students', 'supervisor_assignments.student_id', '=', 'students.student_id')
                  ->orderBy('students.cgpa', $sortDir)
                  ->select('supervisor_assignments.*');
        } else {
            $activeQuery->orderBy($sortBy, $sortDir);
        }

        // Same for completed
        if ($sortBy === 'name') {
            $completedQuery->join('students', 'supervisor_assignments.student_id', '=', 'students.student_id')
                  ->join('users', 'students.user_id', '=', 'users.user_id')
                  ->orderBy('users.name', $sortDir)
                  ->select('supervisor_assignments.*');
        } elseif ($sortBy === 'year_of_study') {
            $completedQuery->join('students', 'supervisor_assignments.student_id', '=', 'students.student_id')
                  ->orderBy('students.year_of_study', $sortDir)
                  ->select('supervisor_assignments.*');
        } elseif ($sortBy === 'gpa') {
            $completedQuery->join('students', 'supervisor_assignments.student_id', '=', 'students.student_id')
                  ->orderBy('students.cgpa', $sortDir)
                  ->select('supervisor_assignments.*');
        } else {
            $completedQuery->orderBy($sortBy, $sortDir);
        }

        $activeStudents = $activeQuery->paginate(10)->withQueryString()->through(fn($assignment) => [
            'assignment_id' => $assignment->assignment_id,
            'student_id' => $assignment->student->student_id,
            'student_name' => $assignment->student->name,
            'student_email' => $assignment->student->user->email,
            'student_phone' => $assignment->student->user->phone,
            'student_gender' => $assignment->student->user->gender,
            'student_university_id' => $assignment->student->university_id,
            'department_name' => $assignment->student->department->name,
            'year_of_study' => $assignment->student->year_of_study,
            'cgpa' => $assignment->student->cgpa,
            'posting_title' => $assignment->posting->title,
            'posting_type' => $assignment->posting->type,
            'status' => $assignment->status,
            'assigned_at' => $assignment->assigned_at->toDateTimeString(),
        ]);

        $completedStudents = $completedQuery->paginate(10)->withQueryString()->through(fn($assignment) => [
            'assignment_id' => $assignment->assignment_id,
            'student_id' => $assignment->student->student_id,
            'student_name' => $assignment->student->name,
            'student_email' => $assignment->student->user->email,
            'student_phone' => $assignment->student->user->phone,
            'student_gender' => $assignment->student->user->gender,
            'student_university_id' => $assignment->student->university_id,
            'department_name' => $assignment->student->department->name,
            'year_of_study' => $assignment->student->year_of_study,
            'cgpa' => $assignment->student->cgpa,
            'posting_title' => $assignment->posting->title,
            'posting_type' => $assignment->posting->type,
            'status' => $assignment->status,
            'assigned_at' => $assignment->assigned_at->toDateTimeString(),
        ]);

        return Inertia::render('company-supervisor/students', [
            'activeStudents' => $activeStudents,
            'completedStudents' => $completedStudents,
            'filters' => $request->only(['search', 'status', 'year', 'sort_by', 'sort_dir']),
            'success' => session('success'),
            'error' => session('error'),
        ]);
    }

    public function viewStudent($student_id)
    {
        $supervisor = Auth::user();

        // Check if the supervisor is assigned to this student
        $assignment = SupervisorAssignment::where('supervisor_id', $supervisor->user_id)
            ->where('student_id', $student_id)
            ->with(['student.user', 'student.department', 'posting'])
            ->firstOrFail();

        $student = $assignment->student;

        return Inertia::render('company-supervisor/student-view', [
            'student' => [
                'student_id' => $student->student_id,
                'name' => $student->name,
                'email' => $student->user->email,
                'phone' => $student->user->phone,
                'department_name' => $student->department->name,
                'year_of_study' => $student->year_of_study,
                'cgpa' => $student->cgpa,
                'skills' => is_array($student->skills) ? $student->skills : ($student->skills ? json_decode($student->skills, true) : []),
                'certifications' => is_array($student->certifications) ? $student->certifications : ($student->certifications ? json_decode($student->certifications, true) : []),
                'portfolio' => $student->portfolio,
                'resume' => $student->resume ? Storage::url($student->resume) : null,
                'preferred_locations' => $student->preferred_locations,
                'graduation_year' => $student->graduation_year,
                'expected_salary' => $student->expected_salary,
                'notice_period' => $student->notice_period,
            ],
            'assignment' => [
                'posting_title' => $assignment->posting->title,
                'posting_type' => $assignment->posting->type,
                'status' => $assignment->status,
                'assigned_at' => $assignment->assigned_at->toDateTimeString(),
            ],
            'success' => session('success'),
            'error' => session('error'),
        ]);
    }

    public function forms(Request $request)
    {
        $supervisor = Auth::user();

        $query = Form::where('supervisor_id', $supervisor->user_id)
            ->with(['student.user', 'advisor']);

        if ($request->search) {
            $query->where(function($q) use ($request) {
                $q->where('title', 'like', "%{$request->search}%")
                  ->orWhereHas('student.user', fn($sq) => $sq->where('name', 'like', "%{$request->search}%"));
            });
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
            'student_name' => $form->student->name,
            'student_email' => $form->student->user->email,
            'advisor_name' => $form->advisor ? $form->advisor->name : 'N/A',
            'status' => $form->status,
            'comments' => $form->comments,
            'submitted_at' => $form->created_at->toDateTimeString(),
            'created_at' => $form->created_at->toDateTimeString(),
        ]);

        return Inertia::render('company-supervisor/forms', [
            'forms' => $forms,
            'filters' => $request->only(['search', 'type', 'status', 'sort_by', 'sort_dir']),
            'success' => session('success'),
            'error' => session('error'),
        ]);
    }

    public function resendFormPage($form_id)
    {
        if (Auth::user()->role !== 'supervisor') {
            abort(403, 'Unauthorized');
        }

        $supervisor = Auth::user();
        $form = Form::where('supervisor_id', $supervisor->user_id)
            ->with(['student.user', 'advisor'])
            ->findOrFail($form_id);

        return Inertia::render('company-supervisor/forms-resend', [
            'form' => [
                'form_id' => $form->form_id,
                'title' => $form->title,
                'type' => $form->type,
                'student_name' => $form->student->name,
                'student_email' => $form->student->user->email,
                'advisor_name' => $form->advisor ? $form->advisor->name : 'N/A',
                'comments' => $form->comments,
                'file_path' => Storage::url($form->file_path),
                'filename' => basename($form->file_path),
            ],
            'success' => session('success'),
            'error' => session('error'),
        ]);
    }

    public function resendForm(Request $request, $form_id)
    {
        if (Auth::user()->role !== 'supervisor') {
            abort(403, 'Unauthorized');
        }

        $supervisor = Auth::user();
        $formId = (int)$form_id;
        $originalForm = null;

        try {
            $originalForm = Form::where('supervisor_id', $supervisor->user_id)
                ->with(['student.user', 'advisor'])
                ->findOrFail($formId);

            $validated = $request->validate([
                'file' => 'required|file|mimes:pdf,doc,docx|max:10240',
            ]);

            DB::transaction(function () use ($validated, $originalForm, $supervisor, $request) {
                // Create new form with updated file
                $filePath = $request->file('file')->store('forms', 'public');

                $newForm = Form::create([
                    'advisor_id' => $originalForm->advisor_id,
                    'student_id' => $originalForm->student_id,
                    'supervisor_id' => $originalForm->supervisor_id,
                    'title' => $originalForm->title,
                    'file_path' => $filePath,
                    'type' => $originalForm->type,
                    'status' => 'pending',
                    'comments' => $originalForm->comments,
                ]);

                // Notify advisor about the new form
                if ($originalForm->advisor) {
                    NotificationService::notifySupervisorNewForm($originalForm->advisor, $originalForm->student->user, $newForm->form_id);
                }

                // Notify student about the new form
                if ($originalForm->student && $originalForm->student->user) {
                    NotificationService::notifyStudentFormStatus(
                        $originalForm->student->user,
                        $newForm->title,
                        'pending',
                        route('student.forms.show', $newForm->form_id)
                    );
                }
            });

            return redirect()->route('company-supervisor.forms')->with('success', 'Form re-sent successfully with new attachment.');
        } catch (\Exception $e) {
            $logFormId = $originalForm ? $originalForm->form_id : $formId;
            Log::error('Failed to resend form', ['form_id' => $logFormId, 'error' => $e->getMessage()]);
            return redirect()->back()->with('error', 'Failed to resend form: ' . $e->getMessage());
        }
    }

    public function showForm($form_id)
    {
        $supervisor = Auth::user();

        $form = Form::where('supervisor_id', $supervisor->user_id)
            ->with(['student.user', 'advisor'])
            ->findOrFail($form_id);

        return Inertia::render('company-supervisor/forms-show', [
            'form' => [
                'form_id' => $form->form_id,
                'title' => $form->title,
                'type' => $form->type,
                'file_path' => Storage::url($form->file_path),
                'filename' => basename($form->file_path),
                'student_name' => $form->student->name,
                'student_email' => $form->student->user->email,
                'advisor_name' => $form->advisor ? $form->advisor->name : 'N/A',
                'status' => $form->status,
                'comments' => $form->comments,
                'created_at' => $form->created_at->toDateTimeString(),
            ],
            'success' => session('success'),
            'error' => session('error'),
        ]);
    }

    public function approveForm(Request $request, $form_id)
    {
        $supervisor = Auth::user();

        $form = Form::where('supervisor_id', $supervisor->user_id)->findOrFail($form_id);

        $validated = $request->validate([
            'status' => 'required|in:approved,rejected',
            'comments' => 'nullable|string|max:1000',
        ]);

        $form->update([
            'status' => $validated['status'],
            'comments' => $validated['comments'] ?? null,
        ]);

        // Notify student about form status change
        $student = Student::find($form->student_id);
        if ($student) {
            NotificationService::notifyStudentFormStatus($student->user, $form->title, $validated['status'], route('student.forms.show', $form->form_id));

            // Notify advisor about form status change
            $advisor = User::find($form->advisor_id);
            if ($advisor) {
                NotificationService::notifyAdvisorFormStatus($advisor, $student->user->name, $form->title, $validated['status'], $form->form_id);
            }
        }

        Log::info('Form approved/rejected', ['form_id' => $form_id, 'supervisor_id' => $supervisor->user_id, 'status' => $validated['status']]);

        return redirect()->route('company-supervisor.forms')->with('success', 'Form status updated successfully.');
    }

    public function sendBackForm(Request $request, $form_id)
    {
        if (Auth::user()->role !== 'supervisor') {
            abort(403, 'Unauthorized');
        }

        $supervisor = Auth::user();
        $form = Form::where('supervisor_id', $supervisor->user_id)->findOrFail($form_id);

        try {
            // Update form status to indicate it needs to be sent back to advisor
            $form->update([
                'status' => 'sent_back',
                'comments' => $request->input('comments', 'Form sent back for revision'),
            ]);

            // Notify advisor about the form being sent back
            $advisor = User::find($form->advisor_id);
            if ($advisor) {
                NotificationService::notifyAdvisorFormSentBack($advisor, $form->student->name, $form->title, $form->form_id);
            }

            // Notify student about the form being sent back
            $student = Student::find($form->student_id);
            if ($student && $student->user) {
                NotificationService::notifyStudentFormSentBack($student->user, $form->title, route('student.forms.show', $form->form_id));
            }

            Log::info('Form sent back to advisor', ['form_id' => $form_id, 'supervisor_id' => $supervisor->user_id]);

            return redirect()->route('company-supervisor.forms')->with('success', 'Form sent back to advisor successfully.');
        } catch (\Exception $e) {
            Log::error('Failed to send back form', ['form_id' => $form_id, 'error' => $e->getMessage()]);
            return redirect()->back()->with('error', 'Failed to send back form: ' . $e->getMessage());
        }
    }

    public function postings(Request $request)
    {
        $supervisor = Auth::user();
        $company = $supervisor->assignedCompaniesAsSupervisor->first();
        $query = Posting::where('company_id', optional($company)->company_id);

        if ($request->search) {
            $query->where('title', 'like', "%{$request->search}%");
        }

        $sortBy = $request->sort_by ?? 'title';
        $sortDir = $request->sort_dir ?? 'asc';
        $query->orderBy($sortBy, $sortDir);

        $postings = $query->paginate(10)->withQueryString()->through(fn($posting) => [
            'posting_id' => $posting->posting_id,
            'title' => $posting->title,
            'type' => $posting->type,
            'status' => $posting->status,
            'industry' => $posting->industry,
            'location' => $posting->location,
            'application_deadline' => $posting->application_deadline->toDateString(),
            'created_at' => $posting->created_at->toDateTimeString(),
            'min_gpa' => $posting->min_gpa,
            'skills_required' => $posting->skills_required ?? [],
            'experience_level' => $posting->experience_level,
            'work_type' => $posting->work_type,
            'posted_by' => $posting->supervisor_id ? 'Supervisor' : 'Company Admin',
        ]);
        return Inertia::render('company-supervisor/postings', [
            'postings' => $postings,
            'filters' => $request->only(['search', 'sort_by', 'sort_dir']),
            'success' => session('success'),
            'error' => session('error'),
        ]);
    }

    public function createPosting()
    {
        $supervisor = Auth::user();
        $company = $supervisor->assignedCompaniesAsSupervisor->first();

        return Inertia::render('company-supervisor/postings-create', [
            'company' => $company,
        ]);
    }

    public function storePosting(Request $request)
    {
        $supervisor = Auth::user();
        $company = $supervisor->assignedCompaniesAsSupervisor->first();

        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'required|string',
            'type' => 'required|in:internship,career',
            'industry' => 'required|string|max:255',
            'location' => 'required|string|max:255',
            'salary_range' => 'nullable|string|max:255',
            'start_date' => 'required|date|after:today',
            'end_date' => 'nullable|date|after:start_date',
            'application_deadline' => 'required|date|after:today',
            'requirements' => 'required|string',
            'skills_required' => 'nullable|array',
            'application_instructions' => 'nullable|string',
            'work_type' => 'required|in:remote,onsite,hybrid',
            'benefits' => 'nullable|string',
            'experience_level' => 'required|in:entry,mid,senior',
            'min_gpa' => 'nullable|numeric|min:0|max:4',
        ]);

        Posting::create([
            'company_id' => $company->company_id,
            'supervisor_id' => $supervisor->user_id,
            'title' => $validated['title'],
            'description' => $validated['description'],
            'type' => $validated['type'],
            'industry' => $validated['industry'],
            'location' => $validated['location'],
            'salary_range' => $validated['salary_range'],
            'start_date' => $validated['start_date'],
            'end_date' => $validated['end_date'],
            'application_deadline' => $validated['application_deadline'],
            'requirements' => $validated['requirements'],
            'skills_required' => $validated['skills_required'] ?? [],
            'application_instructions' => $validated['application_instructions'],
            'work_type' => $validated['work_type'],
            'benefits' => $validated['benefits'],
            'experience_level' => $validated['experience_level'],
            'min_gpa' => $validated['min_gpa'],
            'status' => 'open',
        ]);

        return redirect()->route('company-supervisor.postings')->with('success', 'Posting created successfully.');
    }

    public function showPosting($posting_id)
    {
        $supervisor = Auth::user();
        $company = $supervisor->assignedCompaniesAsSupervisor->first();
        $posting = Posting::where('company_id', optional($company)->company_id)->findOrFail($posting_id);

        return Inertia::render('company-supervisor/postings-show', [
            'posting' => $posting,
            'success' => session('success'),
            'error' => session('error'),
        ]);
    }

    public function editPosting($posting_id)
    {
        $supervisor = Auth::user();
        $company = $supervisor->assignedCompaniesAsSupervisor->first();
        $posting = Posting::where('company_id', optional($company)->company_id)->findOrFail($posting_id);

        return Inertia::render('company-supervisor/postings-edit', [
            'posting' => $posting,
            'success' => session('success'),
            'error' => session('error'),
        ]);
    }

    public function updatePosting(Request $request, $posting_id)
    {
        $supervisor = Auth::user();
        $company = $supervisor->assignedCompaniesAsSupervisor->first();
        $posting = Posting::where('company_id', optional($company)->company_id)->findOrFail($posting_id);

        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'required|string',
            'type' => 'required|in:internship,career',
            'industry' => 'required|string|max:255',
            'location' => 'required|string|max:255',
            'salary_range' => 'nullable|string|max:255',
            'start_date' => 'required|date|after:today',
            'end_date' => 'nullable|date|after:start_date',
            'application_deadline' => 'required|date|after:today',
            'requirements' => 'required|string',
            'skills_required' => 'nullable|array',
            'skills_required.*' => 'string|max:255',
            'application_instructions' => 'nullable|string',
            'work_type' => 'required|in:remote,onsite,hybrid',
            'benefits' => 'nullable|string',
            'experience_level' => 'required|in:entry,mid,senior',
            'min_gpa' => 'nullable|numeric|min:0|max:4',
        ]);

        $updateData = $validated;

        $posting->update($updateData);

        return redirect()->route('company-supervisor.postings')->with('success', 'Posting updated successfully.');
    }

    public function deletePosting($posting_id)
    {
        $supervisor = Auth::user();
        $company = $supervisor->assignedCompaniesAsSupervisor->first();
        $posting = Posting::where('company_id', optional($company)->company_id)->findOrFail($posting_id);
        $posting->delete();

        return redirect()->route('company-supervisor.postings')->with('success', 'Posting deleted successfully.');
    }

    public function trashedPostings(Request $request)
    {
        $supervisor = Auth::user();
        $company = $supervisor->assignedCompaniesAsSupervisor->first();
        $query = Posting::onlyTrashed()->where('company_id', optional($company)->company_id);

        if ($request->search) {
            $query->where('title', 'like', "%{$request->search}%");
        }

        $sortBy = $request->sort_by ?? 'deleted_at';
        $sortDir = $request->sort_dir ?? 'desc';
        $query->orderBy($sortBy, $sortDir);

        $trashedPostings = $query->paginate(10)->withQueryString()->through(fn($posting) => [
            'posting_id' => $posting->posting_id,
            'title' => $posting->title,
            'type' => $posting->type,
            'industry' => $posting->industry,
            'location' => $posting->location,
            'benefits' => $posting->benefits,
            'min_gpa' => $posting->min_gpa,
            'skills_required' => $posting->skills_required ?? [],
            'deleted_at' => $posting->deleted_at->toDateTimeString(),
        ]);

        return Inertia::render('company-supervisor/postings-trashed', [
            'company' => $company ? [
                'company_id' => $company->company_id,
                'name' => $company->name,
            ] : null,
            'trashedPostings' => $trashedPostings,
            'filters' => $request->only(['search', 'sort_by', 'sort_dir']),
            'success' => session('success'),
            'error' => session('error'),
        ]);
    }

    public function restorePosting($posting_id)
    {
        $supervisor = Auth::user();
        $company = $supervisor->assignedCompaniesAsSupervisor->first();
        $posting = Posting::onlyTrashed()->where('company_id', optional($company)->company_id)->findOrFail($posting_id);
        $posting->restore();

        return redirect()->route('company-supervisor.postings')->with('success', 'Posting restored successfully.');
    }

    public function profileIndex(Request $request)
    {
        if (Auth::user()->role !== 'supervisor') {
            abort(403, 'Unauthorized');
        }

        $user = Auth::user();
        $company = $user->assignedCompaniesAsSupervisor->first();

        return Inertia::render('company-supervisor/profile-index', [
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
            'company' => $company ? [
                'company_id' => $company->company_id,
                'name' => $company->name,
                'industry' => $company->industry,
                'location' => $company->location,
                'website' => $company->website,
                'description' => $company->description,
            ] : null,
            'success' => session('success'),
            'error' => session('error'),
        ]);
    }

    public function profile(Request $request)
    {
        if (Auth::user()->role !== 'supervisor') {
            abort(403, 'Unauthorized');
        }

        $user = Auth::user();
        $company = $user->assignedCompaniesAsSupervisor->first();

        return Inertia::render('company-supervisor/profile', [
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
            'company' => $company ? [
                'company_id' => $company->company_id,
                'name' => $company->name,
                'industry' => $company->industry,
                'location' => $company->location,
                'website' => $company->website,
                'description' => $company->description,
            ] : null,
            'success' => session('success'),
            'error' => session('error'),
        ]);
    }

    public function updateProfile(Request $request)
    {
        if (Auth::user()->role !== 'supervisor') {
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
            'profile_image' => 'nullable|image|max:2048',
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
                $avatarPath = $request->file('profile_image')->store('avatars', 'public');
                if (!empty($user->avatar)) {
                    Storage::disk('public')->delete($user->avatar);
                }
                $updateData['avatar'] = $avatarPath;
            }

            DB::table('users')->where('user_id', $user->user_id)->update($updateData);

            Log::info('Company supervisor profile updated', ['user_id' => $user->user_id]);

            return redirect()->route('company-supervisor.profile.index')->with('success', 'Profile updated successfully.');
        } catch (\Exception $e) {
            Log::error('Failed to update company supervisor profile:', [
                'user_id' => $user->user_id,
                'error' => $e->getMessage(),
            ]);
            return redirect()->back()->with('error', 'Failed to update profile: ' . $e->getMessage())->withInput();
        }
    }

    public function analyticsIndex()
    {
        $supervisor = Auth::user();

        // Get students with completed internships (0 days or past end date) - pending analytics
        $completedStudents = SupervisorAssignment::where('supervisor_id', $supervisor->user_id)
            ->where('status', 'active')
            ->with(['student.user', 'student.applicationLetter', 'posting.company', 'student.applications' => fn($q) => $q->where('status', 'accepted')])
            ->get()
            ->filter(function($assignment) {
                if (!$assignment->student->applicationLetter) return false;
                $daysRemaining = now()->diffInDays($assignment->student->applicationLetter->end_date, false);
                return $daysRemaining <= 0;
            })
            ->map(function($assignment) {
                $letter = $assignment->student->applicationLetter;
                $application = $assignment->student->applications->first();
                $hasAnalytics = InternshipAnalytics::where('student_id', $assignment->student_id)
                    ->where('application_id', $application->application_id ?? null)
                    ->exists();

                return [
                    'assignment_id' => $assignment->assignment_id,
                    'student_id' => $assignment->student_id,
                    'student_name' => $assignment->student->name,
                    'student_email' => $assignment->student->user->email,
                    'posting_title' => $assignment->posting->title,
                    'company_name' => $assignment->posting->company->name,
                    'end_date' => $letter->end_date->toDateString(),
                    'days_past' => abs(now()->diffInDays($letter->end_date, false)),
                    'has_analytics' => $hasAnalytics,
                    'application_id' => $application->application_id ?? null,
                ];
            });

        // Get submitted analytics with details
        $submittedAnalytics = InternshipAnalytics::where('supervisor_id', $supervisor->user_id)
            ->with(['student.user', 'posting.company', 'form'])
            ->orderBy('submitted_at', 'desc')
            ->get()
            ->map(function($analytics) {
                return [
                    'analytics_id' => $analytics->analytics_id,
                    'student_id' => $analytics->student_id,
                    'student_name' => $analytics->student->name,
                    'student_email' => $analytics->student->user->email,
                    'posting_title' => $analytics->posting_title,
                    'company_name' => $analytics->company_name,
                    'form_type' => $analytics->form_type,
                    'form_title' => $analytics->form_title,
                    'submitted_at' => $analytics->submitted_at->toDateTimeString(),
                    'advisor_score' => $analytics->advisor_score,
                    'advisor_score_out_of' => $analytics->advisor_score_out_of,
                    'dept_head_score' => $analytics->dept_head_score,
                    'dept_head_score_out_of' => $analytics->dept_head_score_out_of,
                    'final_score' => $analytics->final_score,
                ];
            });

        return Inertia::render('company-supervisor/analytics-index', [
            'completedStudents' => $completedStudents,
            'submittedAnalytics' => $submittedAnalytics,
            'success' => session('success'),
            'error' => session('error'),
        ]);
    }

    public function createAnalytics($student_id)
    {
        $supervisor = Auth::user();
        $student = Student::with(['user', 'applicationLetter', 'applications' => fn($q) => $q->where('status', 'accepted')->with('posting.company'), 'advisorAssignments.advisor'])
            ->findOrFail($student_id);

        // Verify supervisor has assignment
        $assignment = SupervisorAssignment::where('supervisor_id', $supervisor->user_id)
            ->where('student_id', $student_id)
            ->where('status', 'active')
            ->firstOrFail();

        $application = $student->applications->first();
        $letter = $student->applicationLetter;

        if (!$letter || !$application) {
            return redirect()->back()->with('error', 'Student missing application letter or accepted application.');
        }

        // Check if analytics already exists
        $existingAnalytics = InternshipAnalytics::where('student_id', $student_id)
            ->where('application_id', $application->application_id)
            ->first();

        if ($existingAnalytics) {
            return redirect()->route('company-supervisor.analytics.index')
                ->with('error', 'Analytics already submitted for this student.');
        }

        // Get advisor
        $advisor = $student->advisorAssignments->first()->advisor ?? null;

        return Inertia::render('company-supervisor/analytics-create', [
            'student' => [
                'student_id' => $student->student_id,
                'name' => $student->name,
                'email' => $student->user->email,
            ],
            'posting' => [
                'posting_id' => $application->posting->posting_id,
                'title' => $application->posting->title,
                'company_name' => $application->posting->company->name,
                'location' => $application->posting->location,
                'industry' => $application->posting->industry,
                'work_type' => $application->posting->work_type,
            ],
            'applicationLetter' => [
                'start_date' => $letter->start_date->toDateString(),
                'end_date' => $letter->end_date->toDateString(),
                'duration_days' => $letter->start_date->diffInDays($letter->end_date),
            ],
            'advisor' => $advisor ? [
                'user_id' => $advisor->user_id,
                'name' => $advisor->name,
            ] : null,
            'formTypes' => ['evaluation', 'performance', 'final_report'],
        ]);
    }

    public function storeAnalytics(Request $request, $student_id)
    {
        $supervisor = Auth::user();

        $validated = $request->validate([
            'form_type' => 'required|string|in:evaluation,performance,final_report',
            'form_title' => 'required|string|max:255',
            'form_file' => 'required|file|mimes:pdf,doc,docx|max:5120',
            'supervisor_comments' => 'nullable|string|max:2000',
        ]);

        $student = Student::with(['applicationLetter', 'applications' => fn($q) => $q->where('status', 'accepted')->with('posting.company'), 'advisorAssignments.advisor', 'department.deptHead'])
            ->findOrFail($student_id);

        $application = $student->applications->first();
        $letter = $student->applicationLetter;
        $advisor = $student->advisorAssignments->first()->advisor ?? null;

        if (!$letter || !$application) {
            return redirect()->back()->with('error', 'Student missing application letter or accepted application.');
        }

        // Check if analytics already exists
        $existingAnalytics = InternshipAnalytics::where('student_id', $student_id)
            ->where('application_id', $application->application_id)
            ->first();

        if ($existingAnalytics) {
            return redirect()->route('company-supervisor.analytics.index')
                ->with('error', 'Analytics already submitted for this student.');
        }

        try {
            DB::transaction(function () use ($validated, $request, $student, $application, $letter, $supervisor, $advisor) {
                // Store form file
                $formPath = $request->file('form_file')->store('analytics_forms', 'public');

                // Create form record (similar to advisor forms)
                $form = Form::create([
                    'advisor_id' => $advisor->user_id ?? null,
                    'student_id' => $student->student_id,
                    'supervisor_id' => $supervisor->user_id,
                    'title' => $validated['form_title'],
                    'type' => $validated['form_type'],
                    'file_path' => $formPath,
                    'status' => 'submitted',
                ]);

                // Create analytics record
                $analytics = InternshipAnalytics::create([
                    'student_id' => $student->student_id,
                    'application_id' => $application->application_id,
                    'supervisor_id' => $supervisor->user_id,
                    'posting_id' => $application->posting_id,
                    'posting_title' => $application->posting->title,
                    'company_name' => $application->posting->company->name,
                    'location' => $application->posting->location,
                    'industry' => $application->posting->industry,
                    'work_type' => $application->posting->work_type,
                    'start_date' => $letter->start_date,
                    'end_date' => $letter->end_date,
                    'duration_days' => $letter->start_date->diffInDays($letter->end_date),
                    'form_id' => $form->form_id,
                    'form_type' => $validated['form_type'],
                    'form_title' => $validated['form_title'],
                    'supervisor_comments' => $validated['supervisor_comments'],
                    'status' => 'submitted',
                    'submitted_at' => now(),
                ]);

                // Update application status to 'completed'
                $application->update(['status' => 'completed']);

                // Update supervisor assignment status to 'completed'
                SupervisorAssignment::where('supervisor_id', $supervisor->user_id)
                    ->where('student_id', $student->student_id)
                    ->update(['status' => 'completed']);

                // Note: Deactivation date will be set when final score is available (after advisor and dept_head set scores)

                // Send notifications to all stakeholders
                NotificationService::notifyStudentAnalyticsSubmitted($student->user, $analytics->analytics_id);
                
                if ($advisor) {
                    NotificationService::notifyAdvisorAnalyticsSubmitted($advisor, $student->name, $analytics->analytics_id);
                }

                // Notify company admin
                $companyAdmin = $application->posting->company->admin ?? null;
                if ($companyAdmin) {
                    NotificationService::notifyCompanyAdminAnalyticsSubmitted($companyAdmin, $student->name, $analytics->analytics_id);
                }

                // Notify department head
                $deptHead = $student->department->deptHead ?? null;
                if ($deptHead) {
                    NotificationService::notifyDeptHeadAnalyticsSubmitted($deptHead, $student->name, $analytics->analytics_id);
                }

                // Notify coordinator
                $coordinator = User::where('role', 'coordinator')->first();
                if ($coordinator) {
                    NotificationService::notifyCoordinatorAnalyticsSubmitted($coordinator, $student->name, $analytics->analytics_id);
                }
            });

            Log::info('Analytics submitted', ['student_id' => $student->student_id, 'supervisor_id' => $supervisor->user_id]);

            return redirect()->route('company-supervisor.analytics.index')
                ->with('success', 'Analytics submitted successfully. All stakeholders have been notified.');
        } catch (\Exception $e) {
            Log::error('Failed to submit analytics', [
                'student_id' => $student_id ?? null,
                'supervisor_id' => $supervisor->user_id,
                'error' => $e->getMessage(),
            ]);
            return redirect()->back()->with('error', 'Failed to submit analytics: ' . $e->getMessage())->withInput();
        }
    }
}
