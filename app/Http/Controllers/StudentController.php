<?php

namespace App\Http\Controllers;

use App\Models\Application;
use App\Models\Form;
use App\Models\Posting;
use App\Models\Student;
use App\Models\Department;
use App\Models\User;
use App\Models\InternshipAnalytics;
use App\Models\ApplicationLetter;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;
use App\Services\NotificationService;

class StudentController extends Controller
{
    public function index(Request $request)
    {
        if (trim(Auth::user()->role) !== 'student') {
            Log::warning('Unauthorized access attempt to student dashboard', ['user_id' => Auth::id()]);
            abort(403, 'Unauthorized');
        }

        $student = Student::where('user_id', Auth::id())
            ->with(['user' => fn($q) => $q->select('user_id', 'first_name', 'last_name', 'email', 'account_deactivation_date'), 'applicationLetter', 'applications' => fn($q) => $q->where('status', 'accepted')])
            ->firstOrFail();
        $department = Department::where('department_id', $student->department_id)
            ->select('department_id', 'name')
            ->first();

        $applications = Application::where('student_id', $student->student_id)
            ->with(['posting' => fn($q) => $q->select('posting_id', 'title', 'type')])
            ->selectRaw("
                COUNT(*) as total,
                SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) as pending,
                SUM(CASE WHEN status = 'accepted' THEN 1 ELSE 0 END) as accepted,
                SUM(CASE WHEN status = 'rejected' THEN 1 ELSE 0 END) as rejected,
                SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) as completed
            ")->first() ?? (object) ['total' => 0, 'pending' => 0, 'accepted' => 0, 'rejected' => 0, 'completed' => 0];

        $postings = Posting::where('status', 'open')
            ->selectRaw("
                COUNT(*) as total,
                SUM(CASE WHEN type = 'internship' THEN 1 ELSE 0 END) as internships,
                SUM(CASE WHEN type = 'career' THEN 1 ELSE 0 END) as careers
            ")->first() ?? (object) ['total' => 0, 'internships' => 0, 'careers' => 0];

        // Check for internship ending warnings
        $warningMessage = null;
        $daysRemaining = null;
        $hasCompletedApplication = Application::where('student_id', $student->student_id)
            ->where('status', 'completed')
            ->exists();
        $analytics = null;

        if ($student->applicationLetter) {
            $daysRemaining = now()->diffInDays($student->applicationLetter->end_date, false);
            $endDateTime = $student->applicationLetter->end_date->format('M j, Y \a\t g:i A');
            if ($daysRemaining <= 5 && $daysRemaining >= 0) {
                $warningMessage = "Your internship ends in {$daysRemaining} day(s) on {$endDateTime}. Please prepare for completion.";
            } elseif ($daysRemaining < 0) {
                $warningMessage = "Your internship ended on {$endDateTime}. Waiting for supervisor analytics.";
            }
        }

        if ($hasCompletedApplication) {
            $application = Application::where('student_id', $student->student_id)
                ->where('status', 'completed')
                ->first();
            $analytics = InternshipAnalytics::where('application_id', $application->application_id)
                ->first();
        }

        return Inertia::render('student/index', [
            'student' => [
                'student_id' => $student->student_id,
                'name' => trim($student->user->first_name . ' ' . $student->user->last_name),
                'email' => $student->user->email,
                'department' => $department ? $department->name : 'N/A',
                'cgpa' => $student->cgpa,
                'year_of_study' => $student->year_of_study,
                'profile_image' => $student->profile_image,
            ],
            'applications' => [
                'total' => (int) $applications->total,
                'pending' => (int) $applications->pending,
                'accepted' => (int) $applications->accepted,
                'rejected' => (int) $applications->rejected,
                'completed' => (int) $applications->completed,
            ],
            'postings' => [
                'total' => (int) $postings->total,
                'internships' => (int) $postings->internships,
                'careers' => (int) $postings->careers,
            ],
            'warningMessage' => $warningMessage,
            'daysRemaining' => $daysRemaining,
            'hasCompletedApplication' => $hasCompletedApplication,
            'analyticsId' => $analytics ? $analytics->analytics_id : null,
            'success' => session('success'),
            'error' => session('error'),
        ]);
    }

    public function profileIndex(Request $request)
    {
        if (trim(Auth::user()->role) !== 'student') {
            Log::warning('Unauthorized access attempt to student profile', ['user_id' => Auth::id()]);
            abort(403, 'Unauthorized');
        }

        $student = Student::where('user_id', Auth::id())
            ->with(['user' => fn($q) => $q->select('user_id', 'first_name', 'last_name', 'email', 'phone'), 'department'])
            ->firstOrFail();

        return Inertia::render('student/profile-index', [
            'student' => [
                'student_id' => $student->student_id,
                'first_name' => $student->user->first_name,
                'last_name' => $student->user->last_name,
                'email' => $student->user->email,
                'phone' => $student->user->phone,
                'department_id' => $student->department_id,
                'department_name' => $student->department ? $student->department->name : 'N/A',
                'cgpa' => $student->cgpa,
                'year_of_study' => $student->year_of_study,
                'gender' => $student->user->gender,
                'university_id' => $student->university_id,
                'skills' => $student->skills ?? [],
                'certifications' => $student->certifications ?? [],
                'portfolio' => $student->portfolio_url,
                'resume' => $student->resume_path ? Storage::url($student->resume_path) : null,
                'profile_image' => $student->profile_image,
            ],
            'success' => session('success'),
            'error' => session('error'),
        ]);
    }

    public function profile(Request $request)
    {
        if (trim(Auth::user()->role) !== 'student') {
            Log::warning('Unauthorized access attempt to student profile', ['user_id' => Auth::id()]);
            abort(403, 'Unauthorized');
        }

        $student = Student::where('user_id', Auth::id())
            ->with(['user' => fn($q) => $q->select('user_id', 'first_name', 'last_name', 'email', 'phone'), 'department'])
            ->firstOrFail();

        $departments = Department::select('department_id', 'name')->get();

        return Inertia::render('student/profile', [
            'student' => [
                'student_id' => $student->student_id,
                'first_name' => $student->user->first_name,
                'last_name' => $student->user->last_name,
                'email' => $student->user->email,
                'phone' => $student->user->phone,
                'department_id' => $student->department_id,
                'department_name' => $student->department ? $student->department->name : 'N/A',
                'cgpa' => $student->cgpa,
                'year_of_study' => $student->year_of_study,
                'gender' => $student->user->gender,
                'university_id' => $student->university_id,
                'skills' => $student->skills ?? [],
                'certifications' => $student->certifications ?? [],
                'portfolio' => $student->portfolio_url,
                'resume' => $student->resume_path ? Storage::url($student->resume_path) : null,
                'profile_image' => $student->profile_image ? Storage::url($student->profile_image) : null,
            ],
            'departments' => $departments,
            'success' => session('success'),
            'error' => session('error'),
        ]);
    }

    public function updateProfile(Request $request)
    {
        if (Auth::user()->role !== 'student') {
            Log::warning('Unauthorized access attempt to update student profile', ['user_id' => Auth::id()]);
            abort(403, 'Unauthorized');
        }

        $student = Student::where('user_id', Auth::id())->firstOrFail();

        $validated = $request->validate([
            'first_name' => 'required|string|max:100',
            'last_name' => 'required|string|max:100',
            'email' => 'required|string|email|max:255|unique:users,email,' . $student->user_id . ',user_id',
            'phone' => 'nullable|string|max:20',
            // Do not allow students to change department, gender, year_of_study, or university_id here
            'cgpa' => 'nullable|numeric|min:0|max:4',
            'skills' => 'nullable|array',
            'skills.*' => 'string|max:255',
            'certifications' => 'nullable|array',
            'certifications.*' => 'string|max:255',
            'portfolio' => 'nullable|string|max:255',
            'preferred_locations' => 'nullable|string|max:255',
            'graduation_year' => 'nullable|string|max:4',
            'expected_salary' => 'nullable|string|max:20',
            'notice_period' => 'nullable|string|max:10',
            'resume' => 'nullable|file|mimes:pdf|max:2048',
            'profile_image' => 'nullable|file|mimes:jpeg,png,jpg,gif|max:2048',
        ]);

        try {
            DB::transaction(function () use ($student, $validated, $request) {
                $student->user->update([
                    'first_name' => $validated['first_name'],
                    'last_name' => $validated['last_name'],
                    'name' => trim("{$validated['first_name']} {$validated['last_name']}"),
                    'email' => $validated['email'],
                    'phone' => $validated['phone'],
                ]);

                $resumePath = $student->resume_path;
                if ($request->hasFile('resume')) {
                    if ($student->resume_path) {
                        Storage::disk('public')->delete($student->resume_path);
                    }
                    $resumePath = $request->file('resume')->store('resumes', 'public');
                }

                $profileImagePath = $student->profile_image;
                if ($request->hasFile('profile_image')) {
                    if ($student->profile_image) {
                        Storage::disk('public')->delete($student->profile_image);
                    }
                    $profileImagePath = $request->file('profile_image')->store('profile_images', 'public');
                }

                $student->update([
                    'cgpa' => $validated['cgpa'],
                    'skills' => $validated['skills'],
                    'certifications' => $validated['certifications'],
                    'portfolio_url' => $validated['portfolio'],
                    'preferred_locations' => $validated['preferred_locations'],
                    'graduation_year' => $validated['graduation_year'],
                    'expected_salary' => $validated['expected_salary'],
                    'notice_period' => $validated['notice_period'],
                    'resume_path' => $resumePath,
                    'profile_image' => $profileImagePath,
                ]);
            });

            Log::info('Student profile updated', ['student_id' => $student->student_id, 'user_id' => Auth::id()]);

            return redirect()->route('student.profile.index')->with('success', 'Profile updated successfully.');
        } catch (\Exception $e) {
            Log::error('Failed to update student profile:', [
                'student_id' => $student->student_id,
                'error' => $e->getMessage(),
            ]);
            return redirect()->back()->with('error', 'Failed to update profile: ' . $e->getMessage())->withInput();
        }
    }

    public function postings(Request $request)
    {
        if (Auth::user()->role !== 'student') {
            Log::warning('Unauthorized access attempt to postings', ['user_id' => Auth::id()]);
            abort(403, 'Unauthorized');
        }

        $student = Student::where('user_id', Auth::id())->firstOrFail();

        // Check if student has completed application
        $hasCompletedApplication = Application::where('student_id', $student->student_id)
            ->where('status', 'completed')
            ->exists();

        if ($hasCompletedApplication) {
            return Inertia::render('student/postings', [
                'postings' => [],
                'hasCompletedApplication' => true,
                'message' => 'You have completed your internship. View your analytics to see your performance evaluation.',
                'filters' => $request->only(['search', 'type', 'min_gpa', 'work_type', 'sort_by', 'sort_dir']),
                'success' => session('success'),
                'error' => session('error'),
            ]);
        }

        $query = Posting::where('status', 'open')
            ->with(['company' => fn($q) => $q->select('company_id', 'name'), 'supervisor' => fn($q) => $q->select('user_id', 'first_name', 'last_name')]);

        if ($request->search) {
            $query->where(function ($q) use ($request) {
                $q->where('title', 'like', "%{$request->search}%")
                  ->orWhere('industry', 'like', "%{$request->search}%")
                  ->orWhere('location', 'like', "%{$request->search}%")
                  ->orWhere('skills_required', 'like', "%{$request->search}%");
            });
        }

        if ($request->type && $request->type !== 'all') {
            $query->where('type', $request->type);
        }

        if ($request->min_gpa) {
            $query->where('min_gpa', '<=', $request->min_gpa);
        }

        if ($request->work_type && $request->work_type !== 'all') {
            $query->where('work_type', $request->work_type);
        }

        $sortBy = $request->sort_by ?? 'title';
        $sortDir = $request->sort_dir ?? 'asc';
        $query->orderBy($sortBy, $sortDir);

        $postings = $query->paginate(10)->withQueryString()->through(fn($posting) => [
            'posting_id' => $posting->posting_id,
            'title' => $posting->title,
            'type' => $posting->type,
            'industry' => $posting->industry,
            'location' => $posting->location,
            'company_name' => $posting->company->name,
            'company_logo' => $posting->company->logo ? Storage::url($posting->company->logo) : null,
            'min_gpa' => $posting->min_gpa,
            'skills_required' => $posting->skills_required ?? [],
            'work_type' => $posting->work_type,
            'application_deadline' => $posting->application_deadline->toDateString(),
            'start_date' => $posting->start_date->toDateString(),
            'end_date' => $posting->end_date ? $posting->end_date->toDateString() : null,
            'supervisor_name' => $posting->supervisor ? trim("{$posting->supervisor->first_name} {$posting->supervisor->last_name}") : 'N/A',
            'salary_range' => $posting->salary_range,
            'experience_level' => $posting->experience_level,
            'description' => $posting->description,
            'has_applied' => Application::where('student_id', $student->student_id)
                ->where('posting_id', $posting->posting_id)
                ->exists(),
        ]);

        return Inertia::render('student/postings', [
            'postings' => $postings,
            'filters' => $request->only(['search', 'type', 'min_gpa', 'work_type', 'sort_by', 'sort_dir']),
            'success' => session('success'),
            'error' => session('error'),
        ]);
    }

    public function postingView($posting_id)
    {
        if (Auth::user()->role !== 'student') {
            Log::warning('Unauthorized access attempt to posting view', ['user_id' => Auth::id()]);
            abort(403, 'Unauthorized');
        }

        $student = Student::where('user_id', Auth::id())->firstOrFail();
        $posting = Posting::where('status', 'open')
            ->with(['company' => fn($q) => $q->select('company_id', 'name'), 'supervisor' => fn($q) => $q->select('user_id', 'first_name', 'last_name')])
            ->findOrFail($posting_id);

        $hasApplied = Application::where('student_id', $student->student_id)
            ->where('posting_id', $posting->posting_id)
            ->exists();

        // Check if student has application letter
        $applicationLetter = \App\Models\ApplicationLetter::where('student_id', $student->student_id)
            ->where('status', 'sent')
            ->first();

        return Inertia::render('student/posting-view', [
            'posting' => [
                'posting_id' => $posting->posting_id,
                'title' => $posting->title,
                'description' => $posting->description,
                'type' => $posting->type,
                'industry' => $posting->industry,
                'location' => $posting->location,
                'company_name' => $posting->company->name,
                'salary_range' => $posting->salary_range,
                'start_date' => $posting->start_date->toDateString(),
                'end_date' => $posting->end_date ? $posting->end_date->toDateString() : null,
                'application_deadline' => $posting->application_deadline->toDateString(),
                'requirements' => $posting->requirements,
                'skills_required' => $posting->skills_required ?? [],
                'application_instructions' => $posting->application_instructions,
                'work_type' => $posting->work_type,
                'benefits' => $posting->benefits,
                'experience_level' => $posting->experience_level,
                'min_gpa' => $posting->min_gpa,
                'supervisor_name' => $posting->supervisor ? trim("{$posting->supervisor->first_name} {$posting->supervisor->last_name}") : 'N/A',
                'has_applied' => $hasApplied,
            ],
            'applicationLetter' => $applicationLetter ? [
                'letter_id' => $applicationLetter->letter_id,
                'ref_number' => $applicationLetter->ref_number,
                'start_date' => $applicationLetter->start_date->toDateString(),
                'end_date' => $applicationLetter->end_date->toDateString(),
                'file_path' => Storage::url($applicationLetter->file_path),
                'status' => $applicationLetter->status,
            ] : null,
            'success' => session('success'),
            'error' => session('error'),
        ]);
    }

   public function applyPosting(Request $request)
{
    if (Auth::user()->role !== 'student') {
        Log::warning('Unauthorized access attempt to apply posting', ['user_id' => Auth::id()]);
        abort(403, 'Unauthorized');
    }

    $student = Student::where('user_id', Auth::id())->firstOrFail();

    // Check if student has application letter
    $applicationLetter = \App\Models\ApplicationLetter::where('student_id', $student->student_id)
        ->where('status', 'sent')
        ->first();

    if (!$applicationLetter) {
        Log::warning('Student attempted to apply without application letter', [
            'student_id' => $student->student_id,
        ]);
        return redirect()->back()->with('error', 'You must have an application letter from your university coordinator before applying for internships. Please contact your department head or university coordinator to obtain your application letter.');
    }

    $validated = $request->validate([
        'posting_id' => 'required|exists:postings,posting_id',
        'resume' => 'required|file|mimes:pdf|max:2048', // 2MB = 2048KB
        'cover_letter' => 'nullable|file|mimes:pdf|max:2048',
        'portfolio' => 'nullable|string|max:255|url',
        'skills' => 'nullable|array|max:10',
        'skills.*' => 'string|max:255',
        'certifications' => 'nullable|array|max:10',
        'certifications.*' => 'string|max:255',
    ]);

    $posting = Posting::where('status', 'open')->findOrFail($validated['posting_id']);

    if ($posting->application_deadline && now()->greaterThan($posting->application_deadline)) {
        Log::warning('Attempt to apply after deadline', [
            'student_id' => $student->student_id,
            'posting_id' => $posting->posting_id,
            'deadline' => $posting->application_deadline,
        ]);
        return redirect()->back()->with('error', 'The application deadline for this posting has passed.');
    }

    if (Application::where('student_id', $student->student_id)->where('posting_id', $posting->posting_id)->exists()) {
        Log::warning('Duplicate application attempt', [
            'student_id' => $student->student_id,
            'posting_id' => $posting->posting_id,
        ]);
        return redirect()->back()->with('error', 'You have already applied to this posting.');
    }

    if ($posting->min_gpa && $student->cgpa < $posting->min_gpa) {
        Log::warning('CGPA requirement not met', [
            'student_id' => $student->student_id,
            'posting_id' => $posting->posting_id,
            'student_cgpa' => $student->cgpa,
            'required_gpa' => $posting->min_gpa,
        ]);
        return redirect()->back()->with('error', 'Your CGPA does not meet the minimum requirement for this posting.');
    }

    try {
        DB::transaction(function () use ($validated, $student, $posting) {
            $resumePath = $validated['resume']->store('resumes', 'public');
            $coverLetterPath = isset($validated['cover_letter']) ? $validated['cover_letter']->store('cover_letters', 'public') : null;

            Application::create([
                'student_id' => $student->student_id,
                'posting_id' => $posting->posting_id,
                'resume' => $resumePath,
                'cover_letter_path' => $coverLetterPath,
                'portfolio' => $validated['portfolio'],
                'skills' => $validated['skills'] ? json_encode($validated['skills']) : null,
                'certifications' => $validated['certifications'] ? json_encode($validated['certifications']) : null,
                'status' => 'pending',
                'submitted_at' => now(),
                'source' => 'student_portal',
                'last_updated_by' => Auth::id(),
            ]);
        });

        // Notify company admin about new application
        $application = Application::where('student_id', $student->student_id)
            ->where('posting_id', $posting->posting_id)
            ->latest()
            ->first();

        NotificationService::notifyCompanyAdminNewApplication(
            $student->user,
            $posting->title,
            (string) $application->application_id
        );

        Log::info('Application submitted successfully', [
            'student_id' => $student->student_id,
            'posting_id' => $posting->posting_id,
            'resume_path' => $validated['resume'] ? 'stored' : 'none',
            'cover_letter_path' => isset($validated['cover_letter']) ? 'stored' : 'none',
        ]);

        return redirect()->route('student.applications')->with('success', 'Application submitted successfully.');
    } catch (\Exception $e) {
        Log::error('Failed to submit application:', [
            'student_id' => $student->student_id,
            'posting_id' => $validated['posting_id'],
            'error' => $e->getMessage(),
            'trace' => $e->getTraceAsString(),
        ]);
        return redirect()->back()->with('error', 'Failed to submit application: ' . $e->getMessage())->withInput();
    }
}

   public function applications(Request $request)
{
    if (Auth::user()->role !== 'student') {
        Log::warning('Unauthorized access attempt to applications', ['user_id' => Auth::id()]);
        abort(403, 'Unauthorized');
    }

    $student = Student::where('user_id', Auth::id())->firstOrFail();

    // Check if student has completed application - if yes, show only that
    $completedApplication = Application::where('student_id', $student->student_id)
        ->where('status', 'completed')
        ->with(['analytics', 'posting.company' => fn($q) => $q->select('company_id', 'name'),
            'posting' => fn($q) => $q->select('posting_id', 'title', 'type', 'industry', 'company_id'),
            'lastUpdatedBy' => fn($q) => $q->select('user_id', 'first_name', 'last_name'),
            'feedbacks' => fn($q) => $q->with('advisor')])
        ->first();

    if ($completedApplication) {
        // Show only the completed application
        $applications = collect([$completedApplication])->map(fn($app) => [
            'application_id' => $app->application_id,
            'posting_title' => $app->posting ? $app->posting->title : 'N/A',
            'company_name' => $app->posting && $app->posting->company? $app->posting->company->name : 'N/A',
            'posting_type' => $app->posting ? $app->posting->type : 'N/A',
            'industry' => $app->posting ? $app->posting->industry : 'N/A',
            'status' => $app->status,
            'submitted_at' => $app->submitted_at ? $app->submitted_at->toDateTimeString() : null,
            'accepted_at' => $app->accepted_at ? $app->accepted_at->toDateTimeString() : null,
            'offer_expiration' => $app->offer_expiration ? $app->offer_expiration->toDateTimeString() : null,
            'source' => $app->source,
            'last_updated_by' => $app->lastUpdatedBy ? trim("{$app->lastUpdatedBy->first_name} {$app->lastUpdatedBy->last_name}") : 'N/A',
            'feedback' => $app->feedbacks->first() ? [
                'feedback_id' => $app->feedbacks->first()->feedback_id,
                'content' => $app->feedbacks->first()->content,
                'rating' => $app->feedbacks->first()->rating,
                'advisor_name' => $app->feedbacks->first()->advisor->name,
                'created_at' => $app->feedbacks->first()->created_at->toDateTimeString(),
            ] : null,
            'analytics_id' => $app->analytics ? $app->analytics->analytics_id : null,
        ]);

        return Inertia::render('student/applications', [
            'applications' => new \Illuminate\Pagination\LengthAwarePaginator(
                $applications,
                $applications->count(),
                10,
                1,
                ['path' => $request->url(), 'query' => $request->query()]
            ),
            'completedApplication' => [
                'application_id' => $completedApplication->application_id,
                'posting_title' => $completedApplication->posting ? $completedApplication->posting->title : 'N/A',
                'analytics_id' => $completedApplication->analytics ? $completedApplication->analytics->analytics_id : null,
            ],
            'filters' => $request->only(['search', 'status', 'sort_by', 'sort_dir']),
            'success' => session('success'),
            'error' => session('error'),
        ]);
    }

    // Normal flow - show all applications
    $query = Application::where('student_id', $student->student_id)
        ->with([
            'posting.company' => fn($q) => $q->select('company_id', 'name'),
            'posting' => fn($q) => $q->select('posting_id', 'title', 'type', 'industry', 'company_id'),
            'lastUpdatedBy' => fn($q) => $q->select('user_id', 'first_name', 'last_name'),
            'feedbacks' => fn($q) => $q->with('advisor'),
            'analytics'
        ]);

    if ($request->search) {
        $query->whereHas('posting', fn($q) => $q->where('title', 'like', "%{$request->search}%")
            ->orWhere('industry', 'like', "%{$request->search}%"));
    }

    if ($request->status && $request->status !== 'all') {
        $query->where('status', $request->status);
    }

    $sortBy = $request->sort_by ?? 'submitted_at';
    $sortDir = $request->sort_dir ?? 'desc';
    $query->orderBy($sortBy, $sortDir);

    $applications = $query->paginate(10)->withQueryString()->through(fn($app) => [
        'application_id' => $app->application_id,
        'posting_title' => $app->posting ? $app->posting->title : 'N/A',
        'company_name' => $app->posting && $app->posting->company? $app->posting->company->name : 'N/A',
        'posting_type' => $app->posting ? $app->posting->type : 'N/A',
        'industry' => $app->posting ? $app->posting->industry : 'N/A',
        'status' => $app->status,
        'submitted_at' => $app->submitted_at ? $app->submitted_at->toDateTimeString() : null,
        'accepted_at' => $app->accepted_at ? $app->accepted_at->toDateTimeString() : null,
        'offer_expiration' => $app->offer_expiration ? $app->offer_expiration->toDateTimeString() : null,
        'source' => $app->source,
        'last_updated_by' => $app->lastUpdatedBy ? trim("{$app->lastUpdatedBy->first_name} {$app->lastUpdatedBy->last_name}") : 'N/A',
        'feedback' => $app->feedbacks->first() ? [
            'feedback_id' => $app->feedbacks->first()->feedback_id,
            'content' => $app->feedbacks->first()->content,
            'rating' => $app->feedbacks->first()->rating,
            'advisor_name' => $app->feedbacks->first()->advisor->name,
            'created_at' => $app->feedbacks->first()->created_at->toDateTimeString(),
        ] : null,
        'analytics_id' => $app->status === 'completed' && $app->analytics ? $app->analytics->analytics_id : null,
        ]);

    Log::info('Student applications loaded', [
        'student_id' => $student->student_id,
        'applications_count' => $applications->total(),
        'filters' => $request->only(['search', 'status', 'posting_type', 'sort_by', 'sort_dir']),
    ]);
    return Inertia::render('student/applications', [
        'applications' => $applications,
        'completedApplication' => null,
        'filters' => $request->only(['search', 'status', 'sort_by', 'sort_dir']),
        'success' => session('success'),
        'error' => session('error'),
    ]);
}

    public function applicationView(Request $request, $application_id)
{
    if (Auth::user()->role !== 'student') {
        Log::warning('Unauthorized access attempt to application view', [
            'user_id' => Auth::id(),
            'application_id' => $application_id,
        ]);
        abort(403, 'Unauthorized');
    }

    $student = Student::where('user_id', Auth::id())->firstOrFail();

    $application = Application::where('student_id', $student->student_id)
        ->where('application_id', $application_id)
        ->with([
            'posting.company' => fn($q) => $q->select('company_id', 'name'),
            'posting' => fn($q) => $q->select('posting_id', 'title', 'type', 'industry', 'company_id'),
            'lastUpdatedBy' => fn($q) => $q->select('user_id', 'first_name', 'last_name'),
            'feedbacks' => fn($q) => $q->with('advisor'),
            'student' => fn($q) => $q->select('student_id', 'skills', 'certifications')
        ])
        ->firstOrFail();

    $resume_url = $application->resume ? Storage::url($application->resume) : null;
    $cover_letter_url = $application->cover_letter_path ? Storage::url($application->cover_letter_path) : null;

    return Inertia::render('student/application-view', [
        'application' => [
            'application_id' => $application->application_id,
            'posting_title' => $application->posting ? $application->posting->title : 'N/A',
            'posting_type' => $application->posting ? $application->posting->type : 'N/A',
            'industry' => $application->posting ? $application->posting->industry : 'N/A',
            'company_name' => $application->posting && $application->posting->company ? $application->posting->company->name : 'N/A',
            'min_gpa' => $application->posting ? $application->posting->min_gpa : null,
            'skills_required' => $application->posting ? $application->posting->skills_required ?? [] : [],
            'description' => $application->posting ? $application->posting->description : 'N/A',
            'status' => $application->status,
            'submitted_at' => $application->submitted_at ? $application->submitted_at->toDateTimeString() : null,
            'accepted_at' => $application->accepted_at ? $application->accepted_at->toDateTimeString() : null,
            'offer_expiration' => $application->offer_expiration ? $application->offer_expiration->toDateTimeString() : null,
            'resume_path' => $resume_url,
            'cover_letter_path' => $cover_letter_url,
            'portfolio' => $application->portfolio,
            'skills' => $application->student->skills ?? [],
            'certifications' => $application->student->certifications ?? [],
            'feedback' => $application->feedbacks->first() ? [
                'feedback_id' => $application->feedbacks->first()->feedback_id,
                'content' => $application->feedbacks->first()->content,
                'rating' => $application->feedbacks->first()->rating,
                'advisor_name' => $application->feedbacks->first()->advisor->name,
                'created_at' => $application->feedbacks->first()->created_at->toDateTimeString(),
            ] : null,
            'last_updated_by' => $application->lastUpdatedBy ? trim("{$application->lastUpdatedBy->first_name} {$application->lastUpdatedBy->last_name}") : 'N/A',
        ],
        'success' => session('success'),
        'error' => session('error'),
    ]);
    }

    public function acceptApplication(Request $request, $application_id)
    {
        if (Auth::user()->role !== 'student') {
            Log::warning('Unauthorized access attempt to accept application', ['user_id' => Auth::id()]);
            abort(403, 'Unauthorized');
        }

        $student = Student::where('user_id', Auth::id())->firstOrFail();
        $studentId = $student->student_id;
        $appId = $application_id; // Store parameter in local variable for catch block

        // Check if student already has an accepted application
        if ($student->hasApprovedApplication()) {
            return redirect()->back()->with('error', 'You can only accept one application. You already have an accepted application.');
        }

        $application = Application::where('student_id', $studentId)
            ->where('status', 'approved')
            ->findOrFail($application_id);

        if ($application->offer_expiration && now()->greaterThan($application->offer_expiration)) {
            return redirect()->back()->with('error', 'The offer has expired.');
        }

        try {
            DB::transaction(function () use ($application, $student) {
                $application->update([
                    'status' => 'accepted',
                    'accepted_at' => now(),
                    'last_updated_by' => Auth::id(),
                ]);

                // Update student's accepted application ID
                $student->accepted_application_id = $application->application_id;
                $student->save();

                // Note: Application letter status remains as 'sent' or 'viewed' - it doesn't change to 'accepted'
                // The application letter status enum only allows: 'generated', 'sent', 'viewed'
            });

            // Notify coordinator about accepted application
            NotificationService::notifyCoordinatorNewAcceptedApplication(
                $student->user,
                $application->posting->title,
                $application->application_id,
                $student->department_id
            );

            // Notify department head about accepted application
            NotificationService::notifyDeptHeadAcceptedApplication(
                $student->user,
                $application->posting->title,
                $application->application_id
            );

            // Notify company admin about accepted application
            NotificationService::notifyCompanyAdminAcceptedApplication(
                $student->user,
                $application->posting->title,
                $application->application_id
            );

            Log::info('Application accepted', [
                'application_id' => $application->application_id,
                'student_id' => $student->student_id,
            ]);

            return redirect()->route('student.applications')->with('success', 'Application accepted successfully.');
        } catch (\Exception $e) {
            Log::error('Failed to accept application:', [
                'application_id' => $appId ?? null,
                'student_id' => $studentId ?? null,
                'error' => $e->getMessage(),
            ]);
            return redirect()->back()->with('error', 'Failed to accept application: ' . $e->getMessage());
        }
    }

    public function withdrawApplication(Request $request, $application_id)
    {
        if (Auth::user()->role !== 'student') {
            Log::warning('Unauthorized access attempt to withdraw application', ['user_id' => Auth::id()]);
            abort(403, 'Unauthorized');
        }

        $student = Student::where('user_id', Auth::id())->firstOrFail();
        $application = Application::where('student_id', $student->student_id)
            ->whereIn('status', ['pending', 'approved'])
            ->findOrFail($application_id);

        try {
            DB::transaction(function () use ($application) {
                $application->update([
                    'status' => 'inactive',
                    'last_updated_by' => Auth::id(),
                ]);
            });

            Log::info('Application withdrawn', [
                'application_id' => $application->application_id,
                'student_id' => $student->student_id,
            ]);

            return redirect()->route('student.applications')->with('success', 'Application withdrawn successfully.');
        } catch (\Exception $e) {
            Log::error('Failed to withdraw application:', [
                'application_id' => $application_id,
                'student_id' => $student->student_id,
                'error' => $e->getMessage(),
            ]);
            return redirect()->back()->with('error', 'Failed to withdraw application: ' . $e->getMessage());
        }
    }

    public function forms(Request $request)
    {
        if (Auth::user()->role !== 'student') {
            Log::warning('Unauthorized access attempt to forms', ['user_id' => Auth::id()]);
            abort(403, 'Unauthorized');
        }

        $student = Student::where('user_id', Auth::id())->firstOrFail();

        $query = Form::where('student_id', $student->student_id)
            ->with(['advisor' => fn($q) => $q->select('user_id', 'first_name', 'last_name'), 'student.user' => fn($q) => $q->select('user_id', 'first_name', 'last_name')]);

        if ($request->search) {
            $query->where('title', 'like', "%{$request->search}%");
        }

        if ($request->type && $request->type !== 'all') {
            $query->where('type', $request->type);
        }

        $sortBy = $request->sort_by ?? 'created_at';
        $sortDir = $request->sort_dir ?? 'desc';
        $query->orderBy($sortBy, $sortDir);

        $forms = $query->paginate(10)->withQueryString()->through(fn($form) => [
            'form_id' => $form->form_id,
            'title' => $form->title,
            'type' => $form->type,
            'file_path' => Storage::url($form->file_path),
            'advisor_name' => $form->advisor ? trim("{$form->advisor->first_name} {$form->advisor->last_name}") : 'N/A',
            'student_name' => $form->student && $form->student->user ? trim("{$form->student->user->first_name} {$form->student->user->last_name}") : 'N/A',
            'status' => $form->status,
            'comments' => $form->comments,
            'created_at' => $form->created_at->toDateTimeString(),
        ]);

        return Inertia::render('student/forms', [
            'forms' => $forms,
            'filters' => $request->only(['search', 'type', 'sort_by', 'sort_dir']),
            'success' => session('success'),
            'error' => session('error'),
        ]);
    }

    public function showForm($form_id)
    {
        if (Auth::user()->role !== 'student') {
            Log::warning('Unauthorized access attempt to form view', ['user_id' => Auth::id()]);
            abort(403, 'Unauthorized');
        }

        $student = Student::where('user_id', Auth::id())->firstOrFail();

        $form = Form::where('student_id', $student->student_id)
            ->with(['advisor' => fn($q) => $q->select('user_id', 'first_name', 'last_name'), 'student.user' => fn($q) => $q->select('user_id', 'first_name', 'last_name')])
            ->findOrFail($form_id);

        return Inertia::render('student/forms-show', [
            'form' => [
                'form_id' => $form->form_id,
                'title' => $form->title,
                'type' => $form->type,
                'file_path' => Storage::url($form->file_path),
                'filename' => basename($form->file_path),
                'advisor_name' => $form->advisor ? trim("{$form->advisor->first_name} {$form->advisor->last_name}") : 'N/A',
                'student_name' => $form->student && $form->student->user ? trim("{$form->student->user->first_name} {$form->student->user->last_name}") : 'N/A',
                'status' => $form->status,
                'comments' => $form->comments,
                'created_at' => $form->created_at->toDateTimeString(),
            ],
            'success' => session('success'),
            'error' => session('error'),
        ]);
    }

    public function applicationLetter()
    {
        if (Auth::user()->role !== 'student') {
            Log::warning('Unauthorized access attempt to application letter', ['user_id' => Auth::id()]);
            abort(403, 'Unauthorized');
        }

        $student = Student::where('user_id', Auth::id())
            ->with(['user' => fn($q) => $q->select('user_id', 'first_name', 'last_name', 'email'), 'department'])
            ->firstOrFail();

        $applicationLetter = \App\Models\ApplicationLetter::where('student_id', $student->student_id)
            ->with(['department', 'generatedBy'])
            ->first();

        return Inertia::render('student/application-letter', [
            'student' => [
                'student_id' => $student->student_id,
                'first_name' => $student->user->first_name,
                'last_name' => $student->user->last_name,
                'email' => $student->user->email,
                'department_name' => $student->department ? $student->department->name : 'N/A',
                'year_of_study' => $student->year_of_study,
                'cgpa' => $student->cgpa,
            ],
            'applicationLetter' => $applicationLetter ? [
                'letter_id' => $applicationLetter->letter_id,
                'ref_number' => $applicationLetter->ref_number,
                'start_date' => $applicationLetter->start_date->toDateString(),
                'end_date' => $applicationLetter->end_date->toDateString(),
                'status' => $applicationLetter->status,
                'sent_at' => $applicationLetter->sent_at ? $applicationLetter->sent_at->toDateTimeString() : null,
                'viewed_at' => $applicationLetter->viewed_at ? $applicationLetter->viewed_at->toDateTimeString() : null,
                'created_at' => $applicationLetter->created_at->toDateTimeString(),
                'department' => [
                    'name' => $applicationLetter->department->name,
                ],
                'generatedBy' => [
                    'first_name' => $applicationLetter->generatedBy->first_name,
                    'last_name' => $applicationLetter->generatedBy->last_name,
                ],
            ] : null,
            'success' => session('success'),
            'error' => session('error'),
        ]);
    }

    public function successStoryIndex(Request $request)
    {
        if (Auth::user()->role !== 'student') {
            Log::warning('Unauthorized access attempt to success story', ['user_id' => Auth::id()]);
            abort(403, 'Unauthorized');
        }

        $student = Student::where('user_id', Auth::id())
            ->with(['user' => fn($q) => $q->select('user_id', 'first_name', 'last_name', 'email')])
            ->firstOrFail();

        // If the user specifically requests the create form route, render the form page
        // Kept separate method for clarity; route will call successStoryForm()

        // Get student's submitted success stories
        $storiesFile = storage_path('app/success_stories.json');
        $allStories = [];
        if (file_exists($storiesFile)) {
            $allStories = json_decode(file_get_contents($storiesFile), true) ?: [];
        }

        // Filter stories by current student and preserve original indices
        $studentStoriesWithIndices = [];
        foreach ($allStories as $index => $story) {
            if ($story['student_id'] === $student->student_id) {
                $studentStoriesWithIndices[] = array_merge($story, ['story_index' => $index]);
            }
        }

        // Sort by created_at desc
        usort($studentStoriesWithIndices, function($a, $b) {
            return strtotime($b['created_at']) - strtotime($a['created_at']);
        });

        return Inertia::render('student/success-stories-index', [
            'student' => [
                'student_id' => $student->student_id,
                'name' => trim($student->user->first_name . ' ' . $student->user->last_name),
                'email' => $student->user->email,
                'profile_image' => $student->profile_image ? Storage::url($student->profile_image) : null,
            ],
            'stories' => array_map(function($story) {
                return [
                    'story_id' => $story['story_index'],
                    'student_id' => $story['student_id'],
                    'student_name' => $story['student_name'],
                    'title' => $story['title'],
                    'story' => $story['story'],
                    'company_name' => $story['company_name'],
                    'role' => $story['role'],
                    'outcome' => $story['outcome'],
                    'image' => $story['image'] ? Storage::url($story['image']) : null,
                    'status' => $story['status'],
                    'created_at' => $story['created_at'],
                ];
            }, $studentStoriesWithIndices),
            'success' => session('success'),
            'error' => session('error'),
        ]);
    }

    public function successStoryForm(Request $request)
    {
        if (Auth::user()->role !== 'student') {
            Log::warning('Unauthorized access attempt to success story form', ['user_id' => Auth::id()]);
            abort(403, 'Unauthorized');
        }

        $student = Student::where('user_id', Auth::id())
            ->with(['user' => fn($q) => $q->select('user_id', 'first_name', 'last_name', 'email')])
            ->firstOrFail();

        return Inertia::render('student/success-story', [
            'student' => [
                'student_id' => $student->student_id,
                'name' => trim($student->user->first_name . ' ' . $student->user->last_name),
                'email' => $student->user->email,
                'profile_image' => $student->profile_image ? Storage::url($student->profile_image) : null,
            ],
            'success' => session('success'),
            'error' => session('error'),
        ]);
    }

    public function storeSuccessStory(Request $request)
    {
        if (Auth::user()->role !== 'student') {
            Log::warning('Unauthorized access attempt to store success story', ['user_id' => Auth::id()]);
            abort(403, 'Unauthorized');
        }

        $student = Student::where('user_id', Auth::id())->firstOrFail();

        // Require at least one completed application before allowing a success story
        $hasCompletedApplication = Application::where('student_id', $student->student_id)
            ->where('status', 'completed')
            ->exists();
        if (!$hasCompletedApplication) {
            return redirect()->route('student.success-story')->with('error', 'You need a completed application before posting a success story.');
        }

        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'story' => 'required|string|min:100',
            'company_name' => 'required|string|max:255',
            'role' => 'required|string|max:255',
            'outcome' => 'required|string|max:500',
            'image' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:2048',
        ]);

        try {
            DB::transaction(function () use ($student, $validated, $request) {
                $imagePath = null;
                if ($request->hasFile('image')) {
                    $imagePath = $request->file('image')->store('success_stories', 'public');
                }

                $successStory = [
                    'student_id' => $student->student_id,
                    'student_name' => trim($student->user->first_name . ' ' . $student->user->last_name),
                    'student_role' => 'Student',
                    'title' => $validated['title'],
                    'story' => $validated['story'],
                    'company_name' => $validated['company_name'],
                    'role' => $validated['role'],
                    'outcome' => $validated['outcome'],
                    'image' => $imagePath,
                    'status' => 'pending',
                    'created_at' => now(),
                ];

                // Store in a temporary file or database table for admin review
                $storiesFile = storage_path('app/success_stories.json');
                $stories = [];
                if (file_exists($storiesFile)) {
                    $stories = json_decode(file_get_contents($storiesFile), true) ?: [];
                }
                $stories[] = $successStory;
                file_put_contents($storiesFile, json_encode($stories, JSON_PRETTY_PRINT));

                Log::info('Success story submitted', [
                    'student_id' => $student->student_id,
                    'title' => $validated['title'],
                ]);
            });

            // Notify admin about new success story
            \App\Services\NotificationService::notifyAdminSuccessStoryPosted($student->user, $validated['title']);

            return redirect()->route('student.success-stories.index')->with('success', 'Success story submitted for review. It will be published on the homepage once approved by admin.');
        } catch (\Exception $e) {
            Log::error('Failed to store success story', [
                'student_id' => $student->student_id,
                'error' => $e->getMessage(),
            ]);

            return redirect()->back()->with('error', 'Failed to submit success story. Please try again.');
        }
    }

    public function editSuccessStory(Request $request, $story_id)
    {
        if (Auth::user()->role !== 'student') {
            Log::warning('Unauthorized access attempt to edit success story', ['user_id' => Auth::id()]);
            abort(403, 'Unauthorized');
        }

        $student = Student::where('user_id', Auth::id())
            ->with(['user' => fn($q) => $q->select('user_id', 'first_name', 'last_name', 'email')])
            ->firstOrFail();

        // Get the story from JSON file
        $storiesFile = storage_path('app/success_stories.json');
        $allStories = [];
        if (file_exists($storiesFile)) {
            $allStories = json_decode(file_get_contents($storiesFile), true) ?: [];
        }

        // Find the story by index (story_id is the array index)
        $storyIndex = (int) $story_id;
        if (!isset($allStories[$storyIndex]) || $allStories[$storyIndex]['student_id'] !== $student->student_id) {
            abort(404, 'Story not found');
        }

        $story = $allStories[$storyIndex];

        // Only allow editing if status is pending
        if ($story['status'] !== 'pending') {
            return redirect()->route('student.success-stories.index')->with('error', 'You can only edit stories that are still pending review.');
        }

        return Inertia::render('student/success-story-edit', [
            'student' => [
                'student_id' => $student->student_id,
                'name' => trim($student->user->first_name . ' ' . $student->user->last_name),
                'email' => $student->user->email,
                'profile_image' => $student->profile_image ? Storage::url($student->profile_image) : null,
            ],
            'story' => [
                'story_id' => $storyIndex,
                'title' => $story['title'],
                'story' => $story['story'],
                'company_name' => $story['company_name'],
                'role' => $story['role'],
                'outcome' => $story['outcome'],
                'image' => $story['image'] ? Storage::url($story['image']) : null,
                'status' => $story['status'],
                'created_at' => $story['created_at'],
            ],
            'success' => session('success'),
            'error' => session('error'),
        ]);
    }

    public function updateSuccessStory(Request $request, $story_id)
    {
        if (Auth::user()->role !== 'student') {
            Log::warning('Unauthorized access attempt to update success story', ['user_id' => Auth::id()]);
            abort(403, 'Unauthorized');
        }

        $student = Student::where('user_id', Auth::id())->firstOrFail();

        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'story' => 'required|string|min:100',
            'company_name' => 'required|string|max:255',
            'role' => 'required|string|max:255',
            'outcome' => 'required|string|max:500',
            'image' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:2048',
        ]);

        try {
            DB::transaction(function () use ($student, $validated, $request, $story_id) {
                // Get the story from JSON file
                $storiesFile = storage_path('app/success_stories.json');
                $allStories = [];
                if (file_exists($storiesFile)) {
                    $allStories = json_decode(file_get_contents($storiesFile), true) ?: [];
                }

                $storyIndex = (int) $story_id;
                if (!isset($allStories[$storyIndex]) || $allStories[$storyIndex]['student_id'] !== $student->student_id) {
                    throw new \Exception('Story not found');
                }

                $story = &$allStories[$storyIndex];

                // Only allow updating if status is pending
                if ($story['status'] !== 'pending') {
                    throw new \Exception('You can only edit stories that are still pending review.');
                }

                // Handle image upload
                $imagePath = $story['image'];
                if ($request->hasFile('image')) {
                    // Delete old image if exists
                    if ($story['image']) {
                        Storage::disk('public')->delete($story['image']);
                    }
                    $imagePath = $request->file('image')->store('success_stories', 'public');
                }

                // Update story
                $story['title'] = $validated['title'];
                $story['story'] = $validated['story'];
                $story['company_name'] = $validated['company_name'];
                $story['role'] = $validated['role'];
                $story['outcome'] = $validated['outcome'];
                $story['image'] = $imagePath;

                // Save back to file
                file_put_contents($storiesFile, json_encode($allStories, JSON_PRETTY_PRINT));

                Log::info('Success story updated', [
                    'student_id' => $student->student_id,
                    'story_id' => $story_id,
                    'title' => $validated['title'],
                ]);
            });

            return redirect()->route('student.success-stories.index')->with('success', 'Success story updated successfully.');
        } catch (\Exception $e) {
            Log::error('Failed to update success story', [
                'student_id' => $student->student_id,
                'story_id' => $story_id,
                'error' => $e->getMessage(),
            ]);

            return redirect()->back()->with('error', 'Failed to update success story: ' . $e->getMessage())->withInput();
        }
    }

    public function viewAnalytics($analytics_id)
    {
        if (Auth::user()->role !== 'student') {
            abort(403, 'Unauthorized');
        }

        $student = Student::where('user_id', Auth::id())->firstOrFail();
        $analytics = InternshipAnalytics::where('analytics_id', $analytics_id)
            ->where('student_id', $student->student_id)
            ->with(['supervisor', 'posting', 'form'])
            ->firstOrFail();

        return Inertia::render('student/analytics-view', [
            'analytics' => [
                'analytics_id' => $analytics->analytics_id,
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
                'submitted_at' => $analytics->submitted_at->toDateTimeString(),
                'supervisor_name' => $analytics->supervisor->name,
                // Note: form_file intentionally not exposed to students - only visible to advisor/dept_head
                'advisor_score' => $analytics->advisor_score,
                'dept_head_score' => $analytics->dept_head_score,
                'final_score' => $analytics->final_score,
                'advisor_evaluation' => $analytics->advisor_evaluation,
                'dept_head_evaluation' => $analytics->dept_head_evaluation,
            ],
            'success' => session('success'),
            'error' => session('error'),
        ]);
    }

    public function viewApplicationLetter($letterId)
    {
        if (Auth::user()->role !== 'student') {
            Log::warning('Unauthorized access attempt to view application letter', ['user_id' => Auth::id()]);
            abort(403, 'Unauthorized');
        }

        $student = Student::where('user_id', Auth::id())->firstOrFail();

        // Find the application letter and verify it belongs to the authenticated student
        $letter = ApplicationLetter::findOrFail($letterId);

        // Check if the letter belongs to the authenticated student
        if ($letter->student_id !== $student->student_id) {
            Log::warning('Student attempted to access application letter without authorization', [
                'user_id' => Auth::id(),
                'student_id' => $student->student_id,
                'letter_id' => $letterId,
                'letter_student_id' => $letter->student_id,
            ]);
            abort(403, 'You do not have permission to view this application letter.');
        }

        if (!Storage::disk('public')->exists($letter->file_path)) {
            Log::error('Application letter file not found', [
                'letter_id' => $letterId,
                'file_path' => $letter->file_path,
            ]);
            abort(404, 'Application letter file not found.');
        }

        return response()->file(Storage::disk('public')->path($letter->file_path));
    }

    public function downloadApplicationLetter($letterId)
    {
        if (Auth::user()->role !== 'student') {
            Log::warning('Unauthorized access attempt to download application letter', ['user_id' => Auth::id()]);
            abort(403, 'Unauthorized');
        }

        $student = Student::where('user_id', Auth::id())->firstOrFail();

        // Find the application letter and verify it belongs to the authenticated student
        $letter = ApplicationLetter::findOrFail($letterId);

        // Check if the letter belongs to the authenticated student
        if ($letter->student_id !== $student->student_id) {
            Log::warning('Student attempted to download application letter without authorization', [
                'user_id' => Auth::id(),
                'student_id' => $student->student_id,
                'letter_id' => $letterId,
                'letter_student_id' => $letter->student_id,
            ]);
            abort(403, 'You do not have permission to download this application letter.');
        }

        if (!Storage::disk('public')->exists($letter->file_path)) {
            Log::error('Application letter file not found', [
                'letter_id' => $letterId,
                'file_path' => $letter->file_path,
            ]);
            abort(404, 'Application letter file not found.');
        }

        return response()->download(Storage::disk('public')->path($letter->file_path));
    }
}