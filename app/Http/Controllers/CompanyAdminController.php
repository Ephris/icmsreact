<?php

namespace App\Http\Controllers;

use App\Models\Posting;
use App\Models\Application;
use App\Models\SupervisorAssignment;
use App\Models\Student;
use App\Models\User;
use App\Models\Company;
use App\Models\InternshipAnalytics;
use App\Models\CompanySupervisorAssignment;
use App\Models\Department;
use App\Models\AdvisorAssignment;
use App\Models\DepartmentHeadAssignment;
use App\Models\ApplicationLetter;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use App\Services\NotificationService;

class CompanyAdminController extends Controller
{
    public function index(Request $request)
    {
        if (Auth::user()->role !== 'company_admin') {
            abort(403, 'Unauthorized');
        }

        $company = Auth::user()->assignedCompany;
        if (!$company) {
            return Inertia::render('company-admin/index', ['error' => 'No company assigned.']);
        }

        $perPage = 10;
        $supervisors = $company->supervisors()
            ->paginate($perPage)
            ->through(fn($user) => [
                'user_id' => $user->user_id,
                'name' => trim("{$user->first_name} {$user->last_name}"),
                'email' => $user->email,
                'phone' => $user->phone,
                'specialization' => $user->specialization,
                'status' => $user->status,
                'gender' => $user->gender,
            ]);

        $postings = Posting::where('company_id', $company->company_id)
            ->selectRaw("
                SUM(CASE WHEN type = 'internship' AND status != 'draft' THEN 1 ELSE 0 END) as internships,
                SUM(CASE WHEN type = 'career' AND status != 'draft' THEN 1 ELSE 0 END) as careers,
                SUM(CASE WHEN status = 'draft' THEN 1 ELSE 0 END) as drafts,
                COUNT(*) as total
            ")->first();

        $applications = Application::whereHas('posting', fn($q) => $q->where('company_id', $company->company_id))
            ->selectRaw("
                COUNT(*) as pending,
                SUM(CASE WHEN status = 'approved' THEN 1 ELSE 0 END) as approved,
                SUM(CASE WHEN status = 'rejected' THEN 1 ELSE 0 END) as rejected
            ")->first();

        // Ensure we have default values if queries return null
        $postings = $postings ?: (object)['internships' => 0, 'careers' => 0, 'drafts' => 0, 'total' => 0];
        $applications = $applications ?: (object)['pending' => 0, 'approved' => 0, 'rejected' => 0];

        return Inertia::render('company-admin/index', [
            'company' => $company->only('company_id', 'name', 'industry', 'location'),
            'supervisors' => $supervisors,
            'postings' => [
                'internships' => (int) $postings->internships,
                'careers' => (int) $postings->careers,
                'drafts' => (int) $postings->drafts,
                'total' => (int) $postings->total,
            ],
            'applications' => [
                'pending' => (int) $applications->pending,
                'approved' => (int) $applications->approved,
                'rejected' => (int) $applications->rejected,
            ],
            'success' => session('success'),
            'error' => session('error'),
        ]);
    }

    public function supervisorsindex(Request $request)
    {
        if (Auth::user()->role !== 'company_admin') {
            abort(403, 'Unauthorized');
        }

        $company = Auth::user()->assignedCompany;
        if (!$company) {
            return Inertia::render('company-admin/supervisorsindex', ['error' => 'No company assigned.']);
        }

        $query = $company->supervisors();
        if ($request->search) {
            $query->where(function ($q) use ($request) {
                $q->where('first_name', 'like', "%{$request->search}%")
                  ->orWhere('last_name', 'like', "%{$request->search}%")
                  ->orWhere('email', 'like', "%{$request->search}%")
                  ->orWhere('specialization', 'like', "%{$request->search}%");
            });
        }
        if ($request->status && $request->status !== 'all') {
            $query->where('status', $request->status);
        }
        $sortBy = $request->sort_by ?? 'name';
        $sortDir = $request->sort_dir ?? 'asc';
        $query->orderBy($sortBy, $sortDir);

        $supervisors = $query->paginate(10)->withQueryString()->through(fn($user) => [
            'user_id' => $user->user_id,
            'name' => trim("{$user->first_name} {$user->last_name}"),
            'email' => $user->email,
            'phone' => $user->phone,
            'specialization' => $user->specialization,
            'status' => $user->status,
            'gender' => $user->gender,
        ]);

        return Inertia::render('company-admin/supervisorsindex', [
            'company' => $company->only('company_id', 'name'),
            'supervisors' => $supervisors,
            'filters' => $request->only(['search', 'status', 'sort_by', 'sort_dir']),
            'success' => session('success'),
            'error' => session('error'),
        ]);
    }

    public function supervisorscreate()
    {
        if (Auth::user()->role !== 'company_admin') {
            abort(403, 'Unauthorized');
        }

        return Inertia::render('company-admin/supervisorscreate');
    }

    public function supervisorsstore(Request $request)
    {
        if (Auth::user()->role !== 'company_admin') {
            abort(403, 'Unauthorized');
        }

        $company = Auth::user()->assignedCompany;
        if (!$company) {
            return redirect()->route('companyadmin.index')->with('error', 'No company assigned.');
        }

        $request->validate([
            'first_name' => 'required|string|max:100',
            'last_name' => 'required|string|max:100',
            'email' => 'required|string|email|max:255|unique:users,email',
            'username' => 'required|string|max:100|unique:users,username',
            'password' => 'required|string|min:8',
            'phone' => 'nullable|string|max:20',
            'specialization' => 'nullable|string|max:255',
            'status' => 'required|in:active,inactive',
        ]);

        try {
            DB::transaction(function () use ($request, $company) {
                $user = User::create([
                    'first_name' => $request->first_name,
                    'last_name' => $request->last_name,
                    'name' => trim("{$request->first_name} {$request->last_name}"),
                    'email' => $request->email,
                    'username' => $request->username,
                    'password' => Hash::make($request->password),
                    'role' => 'supervisor',
                    'phone' => $request->phone,
                    'specialization' => $request->specialization,
                    'status' => $request->status,
                    'created_by' => Auth::id(),
                ]);

                CompanySupervisorAssignment::create([
                    'supervisor_id' => $user->user_id,
                    'company_id' => $company->company_id,
                    'status' => $request->status,
                ]);
            });

            return redirect()->route('companyadmin.supervisorsindex')->with('success', 'Supervisor created successfully.');
        } catch (\Exception $e) {
            Log::error('Failed to create supervisor:', ['error' => $e->getMessage()]);
            return redirect()->back()->with('error', 'Failed to create supervisor: ' . $e->getMessage())->withInput();
        }
    }

    public function supervisorsview($user_id)
    {
        if (Auth::user()->role !== 'company_admin') {
            abort(403, 'Unauthorized');
        }

        $company = Auth::user()->assignedCompany;
        if (!$company) {
            return redirect()->route('companyadmin.index')->with('error', 'No company assigned.');
        }

        $supervisor = User::where('role', 'supervisor')
            ->whereHas('supervisorAssignments', fn($q) => $q->where('company_id', $company->company_id))
            ->findOrFail($user_id);

        return Inertia::render('company-admin/supervisorsview', [
            'supervisor' => [
                'user_id' => $supervisor->user_id,
                'name' => trim("{$supervisor->first_name} {$supervisor->last_name}"),
                'email' => $supervisor->email,
                'phone' => $supervisor->phone,
                'specialization' => $supervisor->specialization,
                'status' => $supervisor->status,
                'created_at' => $supervisor->created_at->toDateTimeString(),
            ],
            'company' => [
                'company_id' => $company->company_id,
                'name' => $company->name,
                'industry' => $company->industry,
                'location' => $company->location,
                'website' => $company->website,
                'description' => $company->description,
            ],
        ]);
    }

    public function supervisorsedit($user_id)
    {
        if (Auth::user()->role !== 'company_admin') {
            abort(403, 'Unauthorized');
        }

        $company = Auth::user()->assignedCompany;
        if (!$company) {
            return redirect()->route('companyadmin.index')->with('error', 'No company assigned.');
        }

        $supervisor = User::where('role', 'supervisor')
            ->whereHas('supervisorAssignments', fn($q) => $q->where('company_id', $company->company_id))
            ->findOrFail($user_id);

        return Inertia::render('company-admin/supervisorsedit', [
            'supervisor' => [
                'user_id' => $supervisor->user_id,
                'first_name' => $supervisor->first_name,
                'last_name' => $supervisor->last_name,
                'name' => trim("{$supervisor->first_name} {$supervisor->last_name}"),
                'email' => $supervisor->email,
                'username' => $supervisor->username,
                'phone' => $supervisor->phone,
                'specialization' => $supervisor->specialization,
                'status' => $supervisor->status,
            ],
            'company' => $company->only('company_id', 'name'),
        ]);
    }

    public function supervisorsupdate(Request $request, $user_id)
    {
        if (Auth::user()->role !== 'company_admin') {
            abort(403, 'Unauthorized');
        }

        $company = Auth::user()->assignedCompany;
        if (!$company) {
            return redirect()->route('companyadmin.index')->with('error', 'No company assigned.');
        }

        $supervisor = User::where('role', 'supervisor')
            ->whereHas('supervisorAssignments', fn($q) => $q->where('company_id', $company->company_id))
            ->findOrFail($user_id);

        $request->validate([
            'first_name' => 'required|string|max:100',
            'last_name' => 'required|string|max:100',
            'email' => 'required|string|email|max:255|unique:users,email,' . $supervisor->user_id . ',user_id',
            'username' => 'required|string|max:100|unique:users,username,' . $supervisor->user_id . ',user_id',
            'phone' => 'nullable|string|max:20',
            'specialization' => 'nullable|string|max:255',
            'status' => 'required|in:active,inactive',
        ]);

        try {
            $oldStatus = $supervisor->status;
            DB::transaction(function () use ($request, $supervisor, $company) {
                $supervisor->update([
                    'first_name' => $request->first_name,
                    'last_name' => $request->last_name,
                    'name' => trim("{$request->first_name} {$request->last_name}"),
                    'email' => $request->email,
                    'username' => $request->username,
                    'phone' => $request->phone,
                    'specialization' => $request->specialization,
                    'status' => $request->status,
                ]);

                CompanySupervisorAssignment::where('supervisor_id', $supervisor->user_id)
                    ->where('company_id', $company->company_id)
                    ->update(['status' => $request->status]);
            });

            // Notify supervisor about status change
            if ($oldStatus !== $request->status) {
                NotificationService::notifyUserStatusChange($supervisor, $oldStatus, $request->status);
            }

            return redirect()->route('companyadmin.supervisorsindex')->with('success', 'Supervisor updated successfully.');
        } catch (\Exception $e) {
            Log::error('Failed to update supervisor:', ['error' => $e->getMessage()]);
            return redirect()->back()->with('error', 'Failed to update supervisor: ' . $e->getMessage())->withInput();
        }
    }

    public function supervisorsdestroy($user_id)
    {
        if (Auth::user()->role !== 'company_admin') {
            abort(403, 'Unauthorized');
        }

        $company = Auth::user()->assignedCompany;
        if (!$company) {
            return redirect()->route('companyadmin.index')->with('error', 'No company assigned.');
        }

        $supervisor = User::where('role', 'supervisor')
            ->whereHas('supervisorAssignments', fn($q) => $q->where('company_id', $company->company_id))
            ->findOrFail($user_id);

        try {
            DB::transaction(function () use ($supervisor, $company) {
                CompanySupervisorAssignment::where('supervisor_id', $supervisor->user_id)
                    ->where('company_id', $company->company_id)
                    ->delete();
                $supervisor->delete();
            });

            return redirect()->route('companyadmin.supervisorsindex')->with('success', 'Supervisor deleted successfully.');
        } catch (\Exception $e) {
            Log::error('Failed to delete supervisor:', ['error' => $e->getMessage()]);
            return redirect()->back()->with('error', 'Failed to delete supervisor: ' . $e->getMessage());
        }
    }

    public function supervisorstrashed(Request $request)
    {
        if (Auth::user()->role !== 'company_admin') {
            abort(403, 'Unauthorized');
        }

        $company = Auth::user()->assignedCompany;
        if (!$company) {
            return Inertia::render('company-admin/supervisorstrashed', ['error' => 'No company assigned.']);
        }

        $perPage = 10;
        $trashedSupervisors = User::onlyTrashed()
            ->where('role', 'supervisor')
            ->whereHas('supervisorAssignments', fn($q) => $q->onlyTrashed()->where('company_id', $company->company_id))
            ->paginate($perPage)
            ->through(fn($user) => [
                'user_id' => $user->user_id,
                'name' => trim("{$user->first_name} {$user->last_name}"),
                'email' => $user->email,
                'status' => $user->status,
                'deleted_at' => $user->deleted_at ? $user->deleted_at->toDateTimeString() : null,
            ]);

        return Inertia::render('company-admin/supervisorstrashed', [
            'company' => $company->only('company_id', 'name'),
            'trashedSupervisors' => $trashedSupervisors,
            'success' => session('success'),
            'error' => session('error'),
        ]);
    }

    public function supervisorsrestore($user_id)
    {
        if (Auth::user()->role !== 'company_admin') {
            abort(403, 'Unauthorized');
        }

        $company = Auth::user()->assignedCompany;
        if (!$company) {
            return redirect()->route('companyadmin.supervisorstrashed')->with('error', 'No company assigned.');
        }

        $supervisor = User::onlyTrashed()
            ->where('role', 'supervisor')
            ->whereHas('supervisorAssignments', fn($q) => $q->onlyTrashed()->where('company_id', $company->company_id))
            ->findOrFail($user_id);

        try {
            DB::transaction(function () use ($supervisor, $company) {
                $supervisor->restore();
                CompanySupervisorAssignment::onlyTrashed()
                    ->where('supervisor_id', $supervisor->user_id)
                    ->where('company_id', $company->company_id)
                    ->restore();
            });

            return redirect()->route('companyadmin.supervisorstrashed')->with('success', 'Supervisor restored successfully.');
        } catch (\Exception $e) {
            Log::error('Failed to restore supervisor:', ['error' => $e->getMessage()]);
            return redirect()->route('companyadmin.supervisorstrashed')->with('error', 'Failed to restore supervisor: ' . $e->getMessage());
        }
    }

    public function postingsindex(Request $request)
    {
        if (Auth::user()->role !== 'company_admin') {
            abort(403, 'Unauthorized');
        }

        $company = Auth::user()->assignedCompany;
        if (!$company) {
            return redirect()->route('companyadmin.index')->with('error', 'No company assigned.');
        }

        $query = Posting::where('company_id', $company->company_id)
            ->with(['supervisor' => fn($q) => $q->select('user_id', 'first_name', 'last_name')]);

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

        if ($request->status && $request->status !== 'all') {
            $query->where('status', $request->status);
        }

        if ($request->min_gpa) {
            $query->where('min_gpa', '>=', $request->min_gpa);
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
            'benefits' => $posting->benefits,
            'min_gpa' => $posting->min_gpa,
            'experience_level' => $posting->experience_level,
            'skills_required' => $posting->skills_required ?? [],
            'supervisor_name' => $posting->supervisor ? trim("{$posting->supervisor->first_name} {$posting->supervisor->last_name}") : 'None',
            'application_deadline' => $posting->application_deadline->toDateString(),
            'work_type' => $posting->work_type,
            'created_at' => $posting->created_at->toDateTimeString(),
        ]);

        return Inertia::render('company-admin/postingsindex', [
            'company' => $company->only('company_id', 'name'),
            'postings' => $postings,
            'filters' => $request->only(['search', 'type', 'status', 'min_gpa', 'sort_by', 'sort_dir']),
            'success' => session('success'),
            'error' => session('error'),
        ]);
    }

    public function postingscreate()
    {
        if (Auth::user()->role !== 'company_admin') {
            abort(403, 'Unauthorized');
        }

        $company = Auth::user()->assignedCompany;
        if (!$company) {
            return redirect()->route('companyadmin.index')->with('error', 'No company assigned.');
        }

        $supervisors = User::where('role', 'supervisor')
            ->whereHas('supervisorAssignments', fn($q) => $q->where('company_id', $company->company_id))
            ->get(['user_id', 'first_name', 'last_name'])
            ->map(fn($user) => [
                'user_id' => $user->user_id,
                'name' => trim("{$user->first_name} {$user->last_name}"),
            ]);

        return Inertia::render('company-admin/postingscreate', [
            'company' => $company->only('company_id', 'name'),
            'supervisors' => $supervisors,
        ]);
    }

    public function postingsstore(Request $request)
    {
        if (Auth::user()->role !== 'company_admin') {
            abort(403, 'Unauthorized');
        }

        $company = Auth::user()->assignedCompany;
        if (!$company) {
            return redirect()->route('companyadmin.index')->with('error', 'No company assigned.');
        }

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
            'supervisor_id' => 'nullable|string',
        ]);

        try {
            DB::transaction(function () use ($validated, $company) {
                Posting::create([
                    'company_id' => $company->company_id,
                    'supervisor_id' => $validated['supervisor_id'] === 'none' || $validated['supervisor_id'] === '' ? null : $validated['supervisor_id'],
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
                    'skills_required' => $validated['skills_required'],
                    'application_instructions' => $validated['application_instructions'],
                    'work_type' => $validated['work_type'],
                    'benefits' => $validated['benefits'],
                    'experience_level' => $validated['experience_level'],
                    'min_gpa' => $validated['min_gpa'],
                    'status' => 'open',
                ]);
            });

            // Notify students about new posting using NotificationService
            $posting = Posting::latest()->first();
            NotificationService::notifyStudentNewPosting($posting->title, $posting->posting_id, $posting->type);

            return redirect()->route('companyadmin.postingsindex')->with('success', 'Posting created successfully.');
        } catch (\Exception $e) {
            Log::error('Failed to create posting:', ['error' => $e->getMessage()]);
            return redirect()->route('companyadmin.postingscreate')->with('error', 'Failed to create posting: ' . $e->getMessage());
        }
    }

    public function postingsview($posting_id)
    {
        if (Auth::user()->role !== 'company_admin') {
            abort(403, 'Unauthorized');
        }

        $company = Auth::user()->assignedCompany;
        if (!$company) {
            return redirect()->route('companyadmin.index')->with('error', 'No company assigned.');
        }

        $posting = Posting::where('company_id', $company->company_id)
            ->with(['supervisor' => fn($q) => $q->select('user_id', 'first_name', 'last_name')])
            ->findOrFail($posting_id);

        return Inertia::render('company-admin/postingsview', [
            'posting' => [
                'posting_id' => $posting->posting_id,
                'title' => $posting->title,
                'description' => $posting->description,
                'type' => $posting->type,
                'industry' => $posting->industry,
                'location' => $posting->location,
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
                'status' => $posting->status,
                'supervisor_name' => $posting->supervisor ? trim("{$posting->supervisor->first_name} {$posting->supervisor->last_name}") : 'None',
                'created_at' => $posting->created_at->toDateTimeString(),
            ],
            'company' => $company->only('company_id', 'name'),
        ]);
    }

    public function postingsedit($posting_id)
    {
        if (Auth::user()->role !== 'company_admin') {
            abort(403, 'Unauthorized');
        }

        $company = Auth::user()->assignedCompany;
        if (!$company) {
            return redirect()->route('companyadmin.index')->with('error', 'No company assigned.');
        }

        $posting = Posting::where('company_id', $company->company_id)->findOrFail($posting_id);

        $supervisors = User::where('role', 'supervisor')
            ->whereHas('supervisorAssignments', fn($q) => $q->where('company_id', $company->company_id))
            ->get(['user_id', 'first_name', 'last_name'])
            ->map(fn($user) => [
                'user_id' => $user->user_id,
                'name' => trim("{$user->first_name} {$user->last_name}"),
            ]);

        return Inertia::render('company-admin/postingsedit', [
            'posting' => [
                'posting_id' => $posting->posting_id,
                'title' => $posting->title,
                'description' => $posting->description,
                'type' => $posting->type,
                'industry' => $posting->industry,
                'location' => $posting->location,
                'salary_range' => $posting->salary_range,
                'start_date' => $posting->start_date->toDateString(),
                'end_date' => $posting->end_date ? $posting->end_date->toDateString() : '',
                'application_deadline' => $posting->application_deadline->toDateString(),
                'requirements' => $posting->requirements,
                'skills_required' => $posting->skills_required ?? [],
                'application_instructions' => $posting->application_instructions,
                'work_type' => $posting->work_type,
                'benefits' => $posting->benefits,
                'experience_level' => $posting->experience_level,
                'min_gpa' => $posting->min_gpa,
                'status' => $posting->status,
                'supervisor_id' => $posting->supervisor_id ? (string) $posting->supervisor_id : 'none',
            ],
            'supervisors' => $supervisors,
            'company' => $company->only('company_id', 'name'),
        ]);
    }

    public function postingsupdate(Request $request, $posting_id)
    {
        if (Auth::user()->role !== 'company_admin') {
            abort(403, 'Unauthorized');
        }

        $company = Auth::user()->assignedCompany;
        if (!$company) {
            return redirect()->route('companyadmin.index')->with('error', 'No company assigned.');
        }

        $posting = Posting::where('company_id', $company->company_id)->findOrFail($posting_id);

        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'required|string',
            'type' => 'required|in:internship,career',
            'industry' => 'required|string|max:255',
            'location' => 'required|string|max:255',
            'salary_range' => 'nullable|string|max:255',
            'start_date' => 'required|date',
            'end_date' => 'nullable|date',
            'application_deadline' => 'required|date',
            'requirements' => 'required|string',
            'skills_required' => 'nullable|array',
            'skills_required.*' => 'string|max:255',
            'application_instructions' => 'nullable|string',
            'work_type' => 'required|in:remote,onsite,hybrid',
            'benefits' => 'nullable|string',
            'experience_level' => 'required|in:entry,mid,senior',
            'min_gpa' => 'nullable|numeric|min:0|max:4',
            'supervisor_id' => 'nullable|string',
            'status' => 'required|in:open,closed,draft',
        ]);

        try {
            $oldStatus = $posting->status;
            DB::transaction(function () use ($validated, $posting) {
                $posting->update([
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
                    'skills_required' => $validated['skills_required'],
                    'application_instructions' => $validated['application_instructions'],
                    'work_type' => $validated['work_type'],
                    'benefits' => $validated['benefits'],
                    'experience_level' => $validated['experience_level'],
                    'min_gpa' => $validated['min_gpa'],
                    'supervisor_id' => $validated['supervisor_id'] === 'none' || $validated['supervisor_id'] === '' ? null : $validated['supervisor_id'],
                    'status' => $validated['status'],
                ]);
            });

            // Notify about posting status change
            if ($oldStatus !== $validated['status']) {
                NotificationService::notifyPostingStatusChange(Auth::user(), $posting->title, $oldStatus, $validated['status']);
                NotificationService::notifyStudentsPostingStatusChange($posting->title, $oldStatus, $validated['status'], $posting->posting_id);
            }

            return redirect()->route('companyadmin.postingsindex')->with('success', 'Posting updated successfully.');
        } catch (\Exception $e) {
            Log::error('Failed to update posting:', ['error' => $e->getMessage()]);
            return redirect()->route('companyadmin.postingsedit', $posting->posting_id)->with('error', 'Failed to update posting: ' . $e->getMessage());
        }
    }

    public function postingsdestroy($posting_id)
    {
        if (Auth::user()->role !== 'company_admin') {
            abort(403, 'Unauthorized');
        }

        $company = Auth::user()->assignedCompany;
        if (!$company) {
            return redirect()->route('companyadmin.index')->with('error', 'No company assigned.');
        }

        $posting = Posting::where('company_id', $company->company_id)->findOrFail($posting_id);

        try {
            DB::transaction(function () use ($posting) {
                $posting->delete();
            });

            return redirect()->route('companyadmin.postingsindex')->with('success', 'Posting deleted successfully.');
        } catch (\Exception $e) {
            Log::error('Failed to delete posting:', ['error' => $e->getMessage()]);
            return redirect()->route('companyadmin.postingsindex')->with('error', 'Failed to delete posting: ' . $e->getMessage());
        }
    }

    public function postingstrashed(Request $request)
    {
        if (Auth::user()->role !== 'company_admin') {
            Log::warning('Unauthorized access attempt to postingstrashed', ['user_id' => Auth::id()]);
            abort(403, 'Unauthorized');
        }

        $company = Auth::user()->assignedCompany;
        if (!$company) {
            Log::error('No company assigned for user', ['user_id' => Auth::id()]);
            return redirect()->route('companyadmin.index')->with('error', 'No company assigned.');
        }

        $query = Posting::onlyTrashed()->where('company_id', $company->company_id);
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
        $sortBy = $request->sort_by ?? 'title';
        $sortDir = $request->sort_dir ?? 'asc';
        $query->orderBy($sortBy, $sortDir);

        $trashedPostings = $query->paginate(10)->withQueryString()->through(fn($posting) => [
            'posting_id' => $posting->posting_id,
            'title' => $posting->title,
            'type' => $posting->type,
            'industry' => $posting->industry,
            'location' => $posting->location,
            'min_gpa' => $posting->min_gpa,
            'skills_required' => $posting->skills_required ?? [],
            'deleted_at' => $posting->deleted_at->toDateTimeString(),
        ]);

        Log::info('Postings trashed data', [
            'company_id' => $company->company_id,
            'postings_count' => $trashedPostings->total(),
            'filters' => $request->only(['search', 'type', 'sort_by', 'sort_dir']),
        ]);

        return Inertia::render('company-admin/postingstrashed', [
            'company' => $company->only('company_id', 'name'),
            'trashedPostings' => $trashedPostings,
            'filters' => $request->only(['search', 'type', 'sort_by', 'sort_dir']),
            'success' => session('success'),
            'error' => session('error'),
        ]);
    }

    public function postingsrestore($posting_id)
    {
        if (Auth::user()->role !== 'company_admin') {
            abort(403, 'Unauthorized');
        }

        $company = Auth::user()->assignedCompany;
        if (!$company) {
            return redirect()->route('companyadmin.index')->with('error', 'No company assigned.');
        }

        $posting = Posting::onlyTrashed()->where('company_id', $company->company_id)->findOrFail($posting_id);

        try {
            DB::transaction(function () use ($posting) {
                $posting->restore();
            });

            return redirect()->route('companyadmin.postingstrashed')->with('success', 'Posting restored successfully.');
        } catch (\Exception $e) {
            Log::error('Failed to restore posting:', ['error' => $e->getMessage()]);
            return redirect()->route('companyadmin.postingstrashed')->with('error', 'Failed to restore posting: ' . $e->getMessage());
        }
    }

   public function supervisorsassign(Request $request)
    {
        if (Auth::user()->role !== 'company_admin') {
            abort(403, 'Unauthorized');
        }

        $company = Auth::user()->assignedCompany;
        if (!$company) {
            return redirect()->route('companyadmin.index')->with('error', 'No company assigned.');
        }

        $supervisors = User::where('role', 'supervisor')
            ->whereHas('supervisorAssignments', fn($q) => $q->where('company_id', $company->company_id))
            ->get(['user_id', 'first_name', 'last_name'])
            ->map(fn($user) => [
                'user_id' => $user->user_id,
                'name' => trim("{$user->first_name} {$user->last_name}"),
            ]);

        // Get students who already have assignments
        $assignedStudentIds = SupervisorAssignment::whereHas('posting', fn($q) => $q->where('company_id', $company->company_id))
            ->pluck('student_id')
            ->toArray();
        
        $existingAssignments = array_fill_keys($assignedStudentIds, true);

        $acceptedApplications = Application::whereHas('posting', fn($q) => $q->where('company_id', $company->company_id))
            ->where('status', 'accepted')
            ->with([
                'student.user' => fn($q) => $q->select('user_id', 'first_name', 'last_name'),
                'posting' => fn($q) => $q->select('posting_id', 'title', 'supervisor_id')
            ])
            ->get()
            ->map(fn($app) => [
                'application_id' => $app->application_id,
                'student' => [
                    'student_id' => $app->student->student_id,
                    'name' => trim("{$app->student->user->first_name} {$app->student->user->last_name}"),
                ],
                'posting' => [
                    'posting_id' => $app->posting->posting_id,
                    'title' => $app->posting->title,
                    'supervisor_id' => $app->posting->supervisor_id,
                ],
            ]);

        return Inertia::render('company-admin/supervisorsassign', [
            'company' => $company->only('company_id', 'name'),
            'supervisors' => $supervisors,
            'acceptedApplications' => $acceptedApplications,
            'existingAssignments' => $existingAssignments,
        ]);
    }

    public function storeSupervisorAssignment(Request $request)
    {
        if (Auth::user()->role !== 'company_admin') {
            abort(403, 'Unauthorized');
        }

        $company = Auth::user()->assignedCompany;
        if (!$company) {
            return redirect()->route('companyadmin.index')->with('error', 'No company assigned.');
        }

        $validated = $request->validate([
            'supervisor_id' => 'required|exists:users,user_id',
            'student_id' => 'required|exists:students,student_id',
            'posting_id' => 'required|exists:postings,posting_id',
        ]);

        // Check if student already has an assignment
        $existingAssignment = SupervisorAssignment::where('student_id', $validated['student_id'])
            ->whereHas('posting', fn($q) => $q->where('company_id', $company->company_id))
            ->first();

        if ($existingAssignment) {
            return redirect()->route('companyadmin.supervisorsassign')->with('error', 'This student already has a supervisor assignment. Please edit the existing assignment instead.');
        }

        try {
            DB::transaction(function () use ($validated, $company) {
                SupervisorAssignment::create([
                    'supervisor_id' => $validated['supervisor_id'],
                    'student_id' => $validated['student_id'],
                    'posting_id' => $validated['posting_id'],
                    'status' => 'active',
                ]);
            });

            // Notify supervisor about new assignment
            $student = Student::find($validated['student_id']);
            $supervisor = User::find($validated['supervisor_id']);
            $assignment = SupervisorAssignment::where('student_id', $validated['student_id'])
                ->where('supervisor_id', $validated['supervisor_id'])
                ->latest()
                ->first();

            if ($student && $supervisor && $assignment) {
                NotificationService::notifySupervisorNewAssignment($supervisor, $student, $assignment->assignment_id);
            }

            return redirect()->route('companyadmin.supervisorassignmentsindex')->with('success', 'Supervisor assigned successfully.');
        } catch (\Exception $e) {
            Log::error('Failed to assign supervisor:', ['error' => $e->getMessage()]);
            return redirect()->route('companyadmin.supervisorsassign')->with('error', 'Failed to assign supervisor: ' . $e->getMessage());
        }
    }

    public function applicationsindex(Request $request)
    {
        if (Auth::user()->role !== 'company_admin') {
            Log::warning('Unauthorized access attempt to applicationsindex', ['user_id' => Auth::id()]);
            abort(403, 'Unauthorized');
        }

        $company = Auth::user()->assignedCompany;
        if (!$company) {
            Log::error('No company assigned for user', ['user_id' => Auth::id()]);
            return redirect()->route('companyadmin.index')->with('error', 'No company assigned.');
        }

        // Separate query for non-completed applications
        $query = Application::whereHas('posting', fn($q) => $q->where('company_id', $company->company_id))
            ->where('status', '!=', 'completed')
            ->with([
                'student.user' => fn($q) => $q->select('user_id', 'first_name', 'last_name', 'gender'),
                'student' => fn($q) => $q->select('student_id', 'user_id', 'department_id', 'cgpa', 'year_of_study', 'university_id'),
                'student.department' => fn($q) => $q->select('department_id', 'name'),
                'student.advisors' => fn($q) => $q->select('users.user_id', 'users.first_name', 'users.last_name'),
                'posting' => fn($q) => $q->select('posting_id', 'title', 'type', 'industry'),
                'lastUpdatedBy' => fn($q) => $q->select('user_id', 'first_name', 'last_name')
            ]);

        // Filtering
        if ($request->search) {
            $query->where(function ($q) use ($request) {
                $q->whereHas('student.user', fn($q) => $q->where('first_name', 'like', "%{$request->search}%")
                    ->orWhere('last_name', 'like', "%{$request->search}%"))
                  ->orWhereHas('posting', fn($q) => $q->where('title', 'like', "%{$request->search}%")
                    ->orWhere('industry', 'like', "%{$request->search}%"));
            });
        }

        if ($request->status && $request->status !== 'all') {
            $query->where('status', $request->status);
        }

        if ($request->department_id) {
            $query->whereHas('student', fn($q) => $q->where('department_id', $request->department_id));
        }

        if ($request->min_gpa) {
            $query->whereHas('student', fn($q) => $q->where('cgpa', '>=', $request->min_gpa));
        }

        if ($request->posting_type && $request->posting_type !== 'all') {
            $query->whereHas('posting', fn($q) => $q->where('type', $request->posting_type));
        }

        $sortBy = $request->sort_by ?? 'submitted_at';
        $sortDir = $request->sort_dir ?? 'desc';
        $query->orderBy($sortBy, $sortDir);

        $applications = $query->paginate(10)->withQueryString()->through(function($app) {
            // Check if student already has an accepted application
            $hasAcceptedApplication = Application::where('student_id', $app->student_id)
                ->where('status', 'accepted')
                ->where('application_id', '!=', $app->application_id)
                ->exists();
            
            return [
            'application_id' => $app->application_id,
                'student_id' => $app->student_id,
            'student_name' => trim("{$app->student->user->first_name} {$app->student->user->last_name}"),
                'student_gender' => $app->student->user->gender,
                'student_university_id' => $app->student->university_id,
            'posting_title' => $app->posting->title,
            'posting_type' => $app->posting->type,
            'status' => $app->status,
            'department' => $app->student->department ? $app->student->department->name : 'N/A',
            'advisors' => $app->student->advisors->map(fn($advisor) => trim("{$advisor->first_name} {$advisor->last_name}"))->toArray(),
            'cgpa' => $app->student->cgpa,
            'year_of_study' => $app->student->year_of_study,
            'submitted_at' => $app->submitted_at ? $app->submitted_at->toDateTimeString() : null,
            'source' => $app->source,
            'last_updated_by' => $app->lastUpdatedBy ? trim("{$app->lastUpdatedBy->first_name} {$app->lastUpdatedBy->last_name}") : 'N/A',
                'has_accepted_application' => $hasAcceptedApplication,
            ];
        });

        // Separate query for completed applications
        $completedQuery = Application::whereHas('posting', fn($q) => $q->where('company_id', $company->company_id))
            ->where('status', 'completed')
            ->with([
                'student.user' => fn($q) => $q->select('user_id', 'first_name', 'last_name', 'gender'),
                'student' => fn($q) => $q->select('student_id', 'user_id', 'department_id', 'cgpa', 'year_of_study', 'university_id'),
                'student.department' => fn($q) => $q->select('department_id', 'name'),
                'posting' => fn($q) => $q->select('posting_id', 'title', 'type', 'industry'),
                'analytics'
            ]);

        if ($request->search) {
            $completedQuery->where(function ($q) use ($request) {
                $q->whereHas('student.user', fn($q) => $q->where('first_name', 'like', "%{$request->search}%")
                    ->orWhere('last_name', 'like', "%{$request->search}%"))
                  ->orWhereHas('posting', fn($q) => $q->where('title', 'like', "%{$request->search}%"));
            });
        }

        $completedApplications = $completedQuery->orderBy('accepted_at', 'desc')
            ->paginate(10)
            ->withQueryString()
            ->through(fn($app) => [
                'application_id' => $app->application_id,
                'student_id' => $app->student_id,
                'student_name' => trim("{$app->student->user->first_name} {$app->student->user->last_name}"),
                'student_gender' => $app->student->user->gender,
                'student_university_id' => $app->student->university_id,
                'posting_title' => $app->posting->title,
                'posting_type' => $app->posting->type,
                'status' => $app->status,
                'department' => $app->student->department ? $app->student->department->name : 'N/A',
                'accepted_at' => $app->accepted_at ? $app->accepted_at->toDateTimeString() : null,
                'analytics_id' => $app->analytics ? $app->analytics->analytics_id : null,
            ]);

        $departments = Department::select('department_id', 'name')->get();

        Log::info('Applications index data', [
            'company_id' => $company->company_id,
            'applications_count' => $applications->total(),
            'completed_count' => $completedApplications->total(),
            'filters' => $request->only(['search', 'status', 'department_id', 'min_gpa', 'posting_type', 'sort_by', 'sort_dir']),
        ]);

        return Inertia::render('company-admin/applicationsindex', [
            'company' => $company->only('company_id', 'name'),
            'applications' => $applications,
            'completedApplications' => $completedApplications,
            'departments' => $departments,
            'filters' => $request->only(['search', 'status', 'department_id', 'min_gpa', 'posting_type', 'sort_by', 'sort_dir']),
            'success' => session('success'),
            'error' => session('error'),
        ]);
    }

    public function applicationsview($application_id)
    {
        if (Auth::user()->role !== 'company_admin') {
            Log::warning('Unauthorized access attempt to applicationsview', ['user_id' => Auth::id()]);
            abort(403, 'Unauthorized');
        }

        $company = Auth::user()->assignedCompany;
        if (!$company) {
            Log::error('No company assigned for user', ['user_id' => Auth::id()]);
            return redirect()->route('companyadmin.index')->with('error', 'No company assigned.');
        }

        $application = Application::whereHas('posting', fn($q) => $q->where('company_id', $company->company_id))
            ->with([
                'student.user' => fn($q) => $q->select('user_id', 'first_name', 'last_name', 'email', 'phone'),
                'student.department' => fn($q) => $q->select('department_id', 'name'),
                'student.advisors' => fn($q) => $q->select('users.user_id', 'users.first_name', 'users.last_name'),
                'student.applicationLetter' => fn($q) => $q->select('letter_id', 'student_id', 'ref_number', 'start_date', 'end_date', 'file_path', 'status'),
                'posting' => fn($q) => $q->select('posting_id', 'title', 'min_gpa', 'skills_required', 'type', 'industry'),
                'lastUpdatedBy' => fn($q) => $q->select('user_id', 'first_name', 'last_name')
            ])
            ->findOrFail($application_id);

        $department_head = DepartmentHeadAssignment::where('department_id', $application->student->department_id)
            ->with(['user' => fn($q) => $q->select('user_id', 'first_name', 'last_name')])
            ->first();

        $resume_url = $application->resume ? '/media/' . $application->resume : null;
        $cover_letter_url = $application->cover_letter_path ? '/media/' . $application->cover_letter_path : null;

        return Inertia::render('company-admin/applicationsview', [
            'application' => [
                'application_id' => $application->application_id,
                'student_name' => trim("{$application->student->user->first_name} {$application->student->user->last_name}"),
                'student_email' => $application->student->user->email,
                'student_phone' => $application->student->user->phone,
                'department' => $application->student->department ? $application->student->department->name : 'N/A',
                'department_head' => $department_head ? trim("{$department_head->user->first_name} {$department_head->user->last_name}") : 'N/A',
                'advisors' => $application->student->advisors->map(fn($advisor) => [
                    'user_id' => $advisor->user_id,
                    'name' => trim("{$advisor->first_name} {$advisor->last_name}"),
                ])->toArray(),
                'cgpa' => $application->student->cgpa,
                'year_of_study' => $application->student->year_of_study,
                'resume_path' => $resume_url,
                'cover_letter_path' => $cover_letter_url,
                'portfolio' => $application->portfolio,
                'skills' => $application->skills ? json_decode($application->skills, true) : [],
                'certifications' => $application->certifications ? json_decode($application->certifications, true) : [],
                'posting_title' => $application->posting->title,
                'posting_type' => $application->posting->type,
                'posting_industry' => $application->posting->industry,
                'posting_min_gpa' => $application->posting->min_gpa,
                'posting_skills_required' => $application->posting->skills_required ?? [],
                'status' => $application->status,
                'submitted_at' => $application->submitted_at ? $application->submitted_at->toDateTimeString() : null,
                'source' => $application->source,
                'accepted_at' => $application->accepted_at ? $application->accepted_at->toDateTimeString() : null,
                'offer_expiration' => $application->offer_expiration ? $application->offer_expiration->toDateTimeString() : null,
                'feedback' => $application->feedback,
                'last_updated_by' => $application->lastUpdatedBy ? trim("{$application->lastUpdatedBy->first_name} {$application->lastUpdatedBy->last_name}") : 'N/A',
                'application_letter' => $application->student->applicationLetter ? [
                    'letter_id' => $application->student->applicationLetter->letter_id,
                    'ref_number' => $application->student->applicationLetter->ref_number,
                    'start_date' => $application->student->applicationLetter->start_date->toDateString(),
                    'end_date' => $application->student->applicationLetter->end_date->toDateString(),
                    'file_path' => Storage::url($application->student->applicationLetter->file_path),
                    'status' => $application->student->applicationLetter->status,
                ] : null,
            ],
            'company' => $company->only('company_id', 'name'),
            'success' => session('success'),
            'error' => session('error'),
        ]);
    }

    public function applicationsupdate(Request $request, $application_id)
    {
        if (Auth::user()->role !== 'company_admin') {
            Log::warning('Unauthorized access attempt to applicationsupdate', ['user_id' => Auth::id()]);
            abort(403, 'Unauthorized');
        }

        $company = Auth::user()->assignedCompany;
        if (!$company) {
            Log::error('No company assigned for user', ['user_id' => Auth::id()]);
            return redirect()->route('companyadmin.index')->with('error', 'No company assigned.');
        }

        $appId = (int)$application_id;
        $application = null;

        try {
        $application = Application::whereHas('posting', fn($q) => $q->where('company_id', $company->company_id))
                ->findOrFail($appId);

        $validated = $request->validate([
            'status' => 'required|in:pending,approved,rejected,accepted,inactive',
            'feedback' => 'nullable|string|max:1000',
            'offer_expiration' => 'nullable|date|after:today',
        ]);
            DB::transaction(function () use ($application, $validated, $company) {
                if (in_array($validated['status'], ['accepted', 'approved'])) {
                    if ($application->status === 'approved') {
                        throw new \Exception('Application already approved—cannot change.');
                    }
                    $application->accepted_at = now();
                    $application->offer_expiration = now()->addHours(120);
                }
                $application->update([
                    'status' => $validated['status'],
                    'feedback' => $validated['feedback'],
                    'last_updated_by' => Auth::id(),
                ]);
            });

            // Notify student about application status change (real-time + deep link)
            \App\Services\NotificationService::notifyStudentApplicationStatus(
                $application->student->user,
                $application->posting->title ?? 'Application',
                $validated['status'],
                (string)$application->application_id
            );

            Log::info('Application updated', [
                'application_id' => $application->application_id,
                'status' => $validated['status'],
                'updated_by' => Auth::id(),
            ]);

            return redirect()->route('companyadmin.applicationsindex')->with('success', 'Application updated successfully.');
        } catch (\Exception $e) {
            $logAppId = isset($application) && $application ? $application->application_id : $appId;
            Log::error('Failed to update application:', [
                'application_id' => $logAppId,
                'error' => $e->getMessage(),
                'user_id' => Auth::id(),
            ]);
            return redirect()->route('companyadmin.applicationsindex')->with('error', 'Failed to update application: ' . $e->getMessage());
        }
    }

    public function acceptedApplications(Request $request)
    {
        if (Auth::user()->role !== 'company_admin') {
            Log::warning('Unauthorized access attempt to acceptedApplications', ['user_id' => Auth::id()]);
            abort(403, 'Unauthorized');
        }

        $company = Auth::user()->assignedCompany;
        if (!$company) {
            Log::error('No company assigned for user', ['user_id' => Auth::id()]);
            return redirect()->route('companyadmin.index')->with('error', 'No company assigned.');
        }

        $query = Application::whereHas('posting', fn($q) => $q->where('company_id', $company->company_id))
            ->whereIn('status', ['accepted', 'approved'])
            ->with([
                'student.user' => fn($q) => $q->select('user_id', 'first_name', 'last_name'),
                'student.department' => fn($q) => $q->select('department_id', 'name'),
                'student.advisors' => fn($q) => $q->select('users.user_id', 'users.first_name', 'users.last_name'),
                'posting' => fn($q) => $q->select('posting_id', 'title', 'type', 'industry'),
                'lastUpdatedBy' => fn($q) => $q->select('user_id', 'first_name', 'last_name')
            ]);

        if ($request->search) {
            $query->where(function ($q) use ($request) {
                $q->whereHas('student.user', fn($q) => $q->where('first_name', 'like', "%{$request->search}%")
                    ->orWhere('last_name', 'like', "%{$request->search}%"))
                  ->orWhereHas('posting', fn($q) => $q->where('title', 'like', "%{$request->search}%")
                    ->orWhere('industry', 'like', "%{$request->search}%"));
            });
        }

        if ($request->status && $request->status !== 'all') {
            $query->where('status', $request->status);
        }

        if ($request->department_id) {
            $query->whereHas('student', fn($q) => $q->where('department_id', $request->department_id));
        }

        if ($request->min_gpa) {
            $query->whereHas('student', fn($q) => $q->where('cgpa', '>=', $request->min_gpa));
        }

        if ($request->posting_type && $request->posting_type !== 'all') {
            $query->whereHas('posting', fn($q) => $q->where('type', $request->posting_type));
        }

        $sortBy = $request->sort_by ?? 'submitted_at';
        $sortDir = $request->sort_dir ?? 'desc';
        $query->orderBy($sortBy, $sortDir);

        $applications = $query->paginate(10)->withQueryString()->through(fn($app) => [
            'application_id' => $app->application_id,
            'student_name' => trim("{$app->student->user->first_name} {$app->student->user->last_name}"),
            'posting_title' => $app->posting->title,
            'posting_type' => $app->posting->type,
            'status' => $app->status,
            'department' => $app->student->department ? $app->student->department->name : 'N/A',
            'advisors' => $app->student->advisors->map(fn($advisor) => trim("{$advisor->first_name} {$advisor->last_name}"))->toArray(),
            'cgpa' => $app->student->cgpa,
            'year_of_study' => $app->student->year_of_study,
            'submitted_at' => $app->submitted_at ? $app->submitted_at->toDateTimeString() : null,
            'source' => $app->source,
            'last_updated_by' => $app->lastUpdatedBy ? trim("{$app->lastUpdatedBy->first_name} {$app->lastUpdatedBy->last_name}") : 'N/A',
        ]);

        $departments = Department::select('department_id', 'name')->get();

        Log::info('Accepted applications data', [
            'company_id' => $company->company_id,
            'applications_count' => $applications->total(),
            'filters' => $request->only(['search', 'status', 'department_id', 'min_gpa', 'posting_type', 'sort_by', 'sort_dir']),
        ]);

        return Inertia::render('company-admin/acceptedapplications', [
            'company' => $company->only('company_id', 'name'),
            'applications' => $applications,
            'departments' => $departments,
            'filters' => $request->only(['search', 'status', 'department_id', 'min_gpa', 'posting_type', 'sort_by', 'sort_dir']),
            'success' => session('success'),
            'error' => session('error'),
        ]);
    }

    public function supervisorAssignmentsIndex(Request $request)
    {
        if (Auth::user()->role !== 'company_admin') {
            Log::warning('Unauthorized access attempt to supervisor assignments index', ['user_id' => Auth::id()]);
            abort(403, 'Unauthorized');
        }

        $company = Auth::user()->assignedCompany;
        if (!$company) {
            Log::error('No company assigned for user', ['user_id' => Auth::id()]);
            return redirect()->route('companyadmin.index')->with('error', 'No company assigned.');
        }

        $query = SupervisorAssignment::with([
            'supervisor' => fn($q) => $q->select('user_id', 'first_name', 'last_name'),
            'student' => fn($q) => $q->select('student_id', 'first_name', 'last_name'),
            'posting' => fn($q) => $q->select('posting_id', 'title')
        ])->whereHas('posting', fn($q) => $q->where('company_id', $company->company_id));

        $sortBy = $request->sort_by ?? 'assigned_at';
        $sortDir = $request->sort_dir ?? 'desc';
        $query->orderBy($sortBy, $sortDir);

        $assignments = $query->paginate(10)->withQueryString()->through(fn($assignment) => [
            'assignment_id' => $assignment->assignment_id,
            'supervisor_name' => trim("{$assignment->supervisor->first_name} {$assignment->supervisor->last_name}"),
            'student_name' => trim("{$assignment->student->first_name} {$assignment->student->last_name}"),
            'posting_title' => $assignment->posting->title,
            'status' => $assignment->status,
            'assigned_at' => $assignment->assigned_at->toDateTimeString(),
        ]);

        Log::info('Supervisor assignments index data', [
            'company_id' => $company->company_id,
            'assignments_count' => $assignments->total(),
            'filters' => $request->only(['sort_by', 'sort_dir']),
        ]);

        return Inertia::render('company-admin/supervisorassignmentsindex', [
            'company' => $company->only('company_id', 'name'),
            'assignments' => $assignments,
            'filters' => $request->only(['sort_by', 'sort_dir']),
            'success' => session('success'),
            'error' => session('error'),
        ]);
    }

    public function supervisorAssignmentsView($assignment_id)
    {
        if (Auth::user()->role !== 'company_admin') {
            Log::warning('Unauthorized access attempt to supervisor assignments view', ['user_id' => Auth::id()]);
            abort(403, 'Unauthorized');
        }

        $company = Auth::user()->assignedCompany;
        if (!$company) {
            Log::error('No company assigned for user', ['user_id' => Auth::id()]);
            return redirect()->route('companyadmin.index')->with('error', 'No company assigned.');
        }

        $assignment = SupervisorAssignment::with([
            'supervisor' => fn($q) => $q->select('user_id', 'first_name', 'last_name', 'email', 'phone', 'specialization'),
            'student' => fn($q) => $q->select('student_id', 'first_name', 'last_name', 'cgpa'),
            'posting' => fn($q) => $q->select('posting_id', 'title', 'type')
        ])->whereHas('posting', fn($q) => $q->where('company_id', $company->company_id))
            ->findOrFail($assignment_id);

        Log::info('Supervisor assignment viewed', [
            'assignment_id' => $assignment_id,
            'company_id' => $company->company_id,
        ]);

        return Inertia::render('company-admin/supervisorassignmentsview', [
            'assignment' => [
                'assignment_id' => $assignment->assignment_id,
                'supervisor_id' => $assignment->supervisor_id,
                'supervisor_name' => trim("{$assignment->supervisor->first_name} {$assignment->supervisor->last_name}"),
                'supervisor_email' => $assignment->supervisor->email,
                'supervisor_phone' => $assignment->supervisor->phone,
                'supervisor_specialization' => $assignment->supervisor->specialization,
                'student_id' => $assignment->student_id,
                'student_name' => trim("{$assignment->student->first_name} {$assignment->student->last_name}"),
                'student_cgpa' => $assignment->student->cgpa,
                'posting_id' => $assignment->posting_id,
                'posting_title' => $assignment->posting->title,
                'posting_type' => $assignment->posting->type,
                'status' => $assignment->status,
                'assigned_at' => $assignment->assigned_at->toDateTimeString(),
            ],
            'company' => $company->only('company_id', 'name'),
            'success' => session('success'),
            'error' => session('error'),
        ]);
    }

    public function supervisorAssignmentsEdit($assignment_id)
    {
        if (Auth::user()->role !== 'company_admin') {
            abort(403, 'Unauthorized');
        }

        $company = Auth::user()->assignedCompany;
        if (!$company) {
            return redirect()->route('companyadmin.index')->with('error', 'No company assigned.');
        }

        $assignment = SupervisorAssignment::with([
            'supervisor' => fn($q) => $q->select('user_id', 'first_name', 'last_name'),
            'student.user' => fn($q) => $q->select('user_id', 'first_name', 'last_name'),
            'posting' => fn($q) => $q->select('posting_id', 'title', 'supervisor_id')
        ])->whereHas('posting', fn($q) => $q->where('company_id', $company->company_id))
            ->findOrFail($assignment_id);

        // Check if there are forms sent from advisor to current supervisor for this student
        $hasForms = \App\Models\Form::where('student_id', $assignment->student_id)
            ->where('supervisor_id', $assignment->supervisor_id)
            ->exists();

        $supervisors = User::where('role', 'supervisor')
            ->whereHas('supervisorAssignments', fn($q) => $q->where('company_id', $company->company_id))
            ->get(['user_id', 'first_name', 'last_name'])
            ->map(fn($user) => [
                'user_id' => $user->user_id,
                'name' => trim("{$user->first_name} {$user->last_name}"),
            ]);

        return Inertia::render('company-admin/supervisorassignmentsedit', [
            'assignment' => [
                'assignment_id' => $assignment->assignment_id,
                'supervisor_id' => $assignment->supervisor_id,
                'student_id' => $assignment->student_id,
                'posting_id' => $assignment->posting_id,
                'status' => $assignment->status,
                'student_name' => trim("{$assignment->student->user->first_name} {$assignment->student->user->last_name}"),
                'posting_title' => $assignment->posting->title,
            ],
            'supervisors' => $supervisors,
            'company' => $company->only('company_id', 'name'),
            'has_forms' => $hasForms,
            'success' => session('success'),
            'error' => session('error'),
        ]);
    }

    public function updateSupervisorAssignment(Request $request, $assignment_id)
    {
        if (Auth::user()->role !== 'company_admin') {
            abort(403, 'Unauthorized');
        }

        $company = Auth::user()->assignedCompany;
        if (!$company) {
            return redirect()->route('companyadmin.index')->with('error', 'No company assigned.');
        }

        $assignment = SupervisorAssignment::whereHas('posting', fn($q) => $q->where('company_id', $company->company_id))
            ->findOrFail($assignment_id);

        $validated = $request->validate([
            'supervisor_id' => 'required|exists:users,user_id',
            'status' => 'required|in:active,inactive,completed',
        ]);

        try {
            $oldSupervisorId = $assignment->supervisor_id;
            $student = Student::with('user')->find($assignment->student_id);
            
            DB::transaction(function () use ($assignment, $validated, $oldSupervisorId, $student) {
                // If supervisor is being changed, check for and delete forms
                if ($oldSupervisorId != $validated['supervisor_id']) {
                    // Get all forms sent to old supervisor for this student
                    $formsToDelete = \App\Models\Form::where('student_id', $assignment->student_id)
                        ->where('supervisor_id', $oldSupervisorId)
                        ->with(['advisor', 'supervisor'])
                        ->get();
                    
                    // Notify advisor, student, and old supervisor about form deletion
                    foreach ($formsToDelete as $form) {
                        if ($form->advisor) {
                            NotificationService::createNotification([
                                'type' => 'form_deleted',
                                'title' => 'Form Deleted',
                                'message' => "The form '{$form->title}' sent to supervisor has been deleted due to supervisor assignment change for student {$student->user->getNameAttribute()}.",
                                'user_id' => $form->advisor->user_id,
                                'action_url' => route('faculty-advisor.forms'),
                                'action_text' => 'View Forms',
                                'icon' => 'file-text',
                            ]);
                        }
                        if ($student && $student->user) {
                            NotificationService::createNotification([
                                'type' => 'form_deleted',
                                'title' => 'Form Deleted',
                                'message' => "The form '{$form->title}' has been deleted due to supervisor assignment change. Your advisor will send a new form to the new supervisor.",
                                'user_id' => $student->user->user_id,
                                'action_url' => route('student.forms.index'),
                                'action_text' => 'View Forms',
                                'icon' => 'file-text',
                            ]);
                        }
                        if ($form->supervisor) {
                            NotificationService::createNotification([
                                'type' => 'form_deleted',
                                'title' => 'Form Deleted',
                                'message' => "The form '{$form->title}' for student {$student->user->getNameAttribute()} has been deleted due to supervisor assignment change.",
                                'user_id' => $form->supervisor->user_id,
                                'action_url' => route('company-supervisor.forms'),
                                'action_text' => 'View Forms',
                                'icon' => 'file-text',
                            ]);
                        }
                    }
                    
                    // Delete the forms
                    \App\Models\Form::where('student_id', $assignment->student_id)
                        ->where('supervisor_id', $oldSupervisorId)
                        ->delete();
                }
                
                // Update the assignment
                $assignment->update([
                    'supervisor_id' => $validated['supervisor_id'],
                    'status' => $validated['status'],
                ]);

                // Notify new supervisor if changed
                if ($oldSupervisorId != $validated['supervisor_id']) {
                    $newSupervisor = User::find($validated['supervisor_id']);
                    if ($student && $newSupervisor) {
                        NotificationService::notifySupervisorNewAssignment($newSupervisor, $student, $assignment->assignment_id);
                    }
                }
            });

            return redirect()->route('companyadmin.supervisorassignmentsindex')->with('success', 'Assignment updated successfully.');
        } catch (\Exception $e) {
            Log::error('Failed to update assignment:', ['error' => $e->getMessage()]);
            return redirect()->back()->with('error', 'Failed to update assignment: ' . $e->getMessage());
        }
    }

    public function deleteSupervisorAssignment($assignment_id)
    {
        if (Auth::user()->role !== 'company_admin') {
            abort(403, 'Unauthorized');
        }

        $company = Auth::user()->assignedCompany;
        if (!$company) {
            return redirect()->route('companyadmin.index')->with('error', 'No company assigned.');
        }

        $assignment = SupervisorAssignment::whereHas('posting', fn($q) => $q->where('company_id', $company->company_id))
            ->findOrFail($assignment_id);

        try {
            $assignment->delete();
            return redirect()->route('companyadmin.supervisorassignmentsindex')->with('success', 'Assignment deleted successfully.');
        } catch (\Exception $e) {
            Log::error('Failed to delete assignment:', ['error' => $e->getMessage()]);
            return redirect()->back()->with('error', 'Failed to delete assignment: ' . $e->getMessage());
        }
    }

    public function profileIndex(Request $request)
    {
        if (Auth::user()->role !== 'company_admin') {
            abort(403, 'Unauthorized');
        }

        $user = Auth::user();
        $company = $user->assignedCompany;

        return Inertia::render('company-admin/profile-index', [
            'user' => [
                'user_id' => $user->user_id,
                'first_name' => $user->first_name,
                'last_name' => $user->last_name,
                'email' => $user->email,
                'phone' => $user->phone,
                'username' => $user->username,
                'avatar' => $user->avatar ? Storage::url($user->avatar) : null,
            ],
            'company' => $company ? [
                'company_id' => $company->company_id,
                'name' => $company->name,
                'industry' => $company->industry,
                'location' => $company->location,
                'website' => $company->website,
                'description' => $company->description,
                'logo' => $company->logo ? Storage::url($company->logo) : null,
            ] : null,
            'success' => session('success'),
            'error' => session('error'),
        ]);
    }

    public function profile(Request $request)
    {
        if (Auth::user()->role !== 'company_admin') {
            abort(403, 'Unauthorized');
        }

        $user = Auth::user();
        $company = $user->assignedCompany;

        return Inertia::render('company-admin/profile', [
            'user' => [
                'user_id' => $user->user_id,
                'first_name' => $user->first_name,
                'last_name' => $user->last_name,
                'email' => $user->email,
                'phone' => $user->phone,
                'username' => $user->username,
                'avatar' => $user->avatar ? Storage::url($user->avatar) : null,
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
        if (Auth::user()->role !== 'company_admin') {
            abort(403, 'Unauthorized');
        }

        $user = Auth::user();

        $validated = $request->validate([
            'first_name' => 'required|string|max:100',
            'last_name' => 'required|string|max:100',
            'email' => 'required|string|email|max:255|unique:users,email,' . $user->user_id . ',user_id',
            'phone' => 'nullable|string|max:20',
            'username' => 'required|string|max:100|unique:users,username,' . $user->user_id . ',user_id',
            'profile_picture' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:2048',
        ]);

        try {
            DB::transaction(function () use ($user, $validated, $request) {
                $updateData = [
                    'first_name' => $validated['first_name'],
                    'last_name' => $validated['last_name'],
                    'email' => $validated['email'],
                    'phone' => $validated['phone'],
                    'username' => $validated['username'],
                ];

                // Handle profile picture upload
                if ($request->hasFile('profile_picture')) {
                    // Delete old avatar if exists
                    if ($user->avatar && Storage::disk('public')->exists($user->avatar)) {
                        Storage::disk('public')->delete($user->avatar);
                    }

                    // Store new avatar
                    $avatarPath = $request->file('profile_picture')->store('avatars', 'public');
                    $updateData['avatar'] = $avatarPath;
                }

                DB::table('users')->where('user_id', $user->user_id)->update($updateData);
            });

            // Notify admin about profile update
            \App\Services\NotificationService::notifyAdminProfileUpdate($user, 'company_admin');

            Log::info('Company admin profile updated', ['user_id' => $user->user_id]);

            return redirect()->route('companyadmin.profile.index')->with('success', 'Profile updated successfully.');
        } catch (\Exception $e) {
            Log::error('Failed to update company admin profile:', [
                'user_id' => $user->user_id,
                'error' => $e->getMessage(),
            ]);
            return redirect()->back()->with('error', 'Failed to update profile: ' . $e->getMessage())->withInput();
        }
    }

    public function editCompany(Request $request)
    {
        if (Auth::user()->role !== 'company_admin') {
            abort(403, 'Unauthorized');
        }

        $user = Auth::user();
        $company = $user->assignedCompany;

        if (!$company) {
            return redirect()->route('companyadmin.index')->with('error', 'No company assigned.');
        }

        return Inertia::render('company-admin/company-edit', [
            'company' => [
                'company_id' => $company->company_id,
                'name' => $company->name,
                'industry' => $company->industry,
                'location' => $company->location,
                'website' => $company->website,
                'description' => $company->description,
                'logo' => $company->logo ? Storage::url($company->logo) : null,
            ],
            'success' => session('success'),
            'error' => session('error'),
        ]);
    }

    public function updateCompany(Request $request)
    {
        if (Auth::user()->role !== 'company_admin') {
            abort(403, 'Unauthorized');
        }

        $user = Auth::user();
        $company = $user->assignedCompany;

        if (!$company) {
            return redirect()->route('companyadmin.index')->with('error', 'No company assigned.');
        }

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'industry' => 'nullable|string|max:255',
            'location' => 'nullable|string|max:255',
            'website' => 'nullable|url|max:255',
            'description' => 'nullable|string|max:1000',
            'logo' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:2048',
        ]);

        try {
            DB::transaction(function () use ($company, $validated, $request) {
                $updateData = [
                    'name' => $validated['name'],
                    'industry' => $validated['industry'],
                    'location' => $validated['location'],
                    'website' => $validated['website'],
                    'description' => $validated['description'],
                ];

                // Handle logo upload
                if ($request->hasFile('logo')) {
                    // Delete old logo if exists
                    if ($company->logo && Storage::disk('public')->exists($company->logo)) {
                        Storage::disk('public')->delete($company->logo);
                    }

                    // Store new logo
                    $logoPath = $request->file('logo')->store('company_logos', 'public');
                    $updateData['logo'] = $logoPath;
                }

                $company->update($updateData);
            });

            // Update trusted_logos in home content after logo upload
            if ($request->hasFile('logo')) {
                $homeContent = \App\Models\HomeContent::first();
                if ($homeContent) {
                    $companies = \App\Models\Company::where('status', 'active')
                        ->whereNotNull('logo')
                        ->select('logo')
                        ->pluck('logo')
                        ->filter()
                        ->values()
                        ->toArray();

                    $homeContent->update(['trusted_logos' => $companies]);
                }
            }

            Log::info('Company information updated', [
                'company_id' => $company->company_id,
                'updated_by' => $user->user_id,
            ]);

            return redirect()->route('companyadmin.profile.index')->with('success', 'Company information updated successfully.');
        } catch (\Exception $e) {
            Log::error('Failed to update company information:', [
                'company_id' => $company->company_id,
                'error' => $e->getMessage(),
            ]);
            return response()->json([
                'success' => false,
                'errors' => ['general' => 'Failed to update company information: ' . $e->getMessage()]
            ], 422);
        }
    }

    public function completedApplications(Request $request)
    {
        if (Auth::user()->role !== 'company_admin') {
            abort(403, 'Unauthorized');
        }

        $company = Auth::user()->assignedCompany;
        if (!$company) {
            return Inertia::render('company-admin/completed-applications', ['error' => 'No company assigned.']);
        }

        $query = Application::whereHas('posting', fn($q) => $q->where('company_id', $company->company_id))
            ->where('status', 'completed')
            ->with(['student.user', 'posting', 'analytics']);

        if ($request->search) {
            $query->whereHas('student.user', fn($q) => $q->where('name', 'like', "%{$request->search}%")
                ->orWhere('email', 'like', "%{$request->search}%"));
        }

        $sortBy = $request->sort_by ?? 'accepted_at';
        $sortDir = $request->sort_dir ?? 'desc';
        $query->orderBy($sortBy, $sortDir);

        $applications = $query->paginate(10)->withQueryString()->through(fn($app) => [
            'application_id' => $app->application_id,
            'student_name' => $app->student->name,
            'student_email' => $app->student->user->email,
            'posting_title' => $app->posting->title,
            'accepted_at' => $app->accepted_at ? $app->accepted_at->toDateTimeString() : null,
            'analytics_id' => $app->analytics ? $app->analytics->analytics_id : null,
            'analytics_submitted_at' => $app->analytics ? $app->analytics->submitted_at->toDateTimeString() : null,
        ]);

        return Inertia::render('company-admin/completed-applications', [
            'applications' => $applications,
            'filters' => $request->only(['search', 'sort_by', 'sort_dir']),
            'success' => session('success'),
            'error' => session('error'),
        ]);
    }

    public function viewAnalytics($analytics_id)
    {
        if (Auth::user()->role !== 'company_admin') {
            abort(403, 'Unauthorized');
        }

        $company = Auth::user()->assignedCompany;
        if (!$company) {
            abort(403, 'No company assigned.');
        }

        $analytics = InternshipAnalytics::where('analytics_id', $analytics_id)
            ->whereHas('posting', fn($q) => $q->where('company_id', $company->company_id))
            ->with(['student.user', 'supervisor', 'posting', 'form'])
            ->firstOrFail();

        return Inertia::render('company-admin/analytics-view', [
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
                'form_file' => $analytics->form ? Storage::url($analytics->form->file_path) : null,
            ],
            'success' => session('success'),
            'error' => session('error'),
        ]);
    }

    public function viewApplicationLetter($letterId)
    {
        if (Auth::user()->role !== 'company_admin') {
            Log::warning('Unauthorized access attempt to view application letter', ['user_id' => Auth::id()]);
            abort(403, 'Unauthorized');
        }

        $company = Auth::user()->assignedCompany;
        if (!$company) {
            Log::error('No company assigned for user', ['user_id' => Auth::id()]);
            abort(403, 'No company assigned.');
        }

        // Find the application letter and verify it belongs to a student who applied to this company
        $letter = ApplicationLetter::with(['student.applications.posting'])
            ->findOrFail($letterId);

        // Check if the student has an application to a posting from this company
        $hasAccess = $letter->student->applications()
            ->whereHas('posting', function ($query) use ($company) {
                $query->where('company_id', $company->company_id);
            })
            ->exists();

        if (!$hasAccess) {
            Log::warning('Company admin attempted to access application letter without authorization', [
                'user_id' => Auth::id(),
                'company_id' => $company->company_id,
                'letter_id' => $letterId,
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
        if (Auth::user()->role !== 'company_admin') {
            Log::warning('Unauthorized access attempt to download application letter', ['user_id' => Auth::id()]);
            abort(403, 'Unauthorized');
        }

        $company = Auth::user()->assignedCompany;
        if (!$company) {
            Log::error('No company assigned for user', ['user_id' => Auth::id()]);
            abort(403, 'No company assigned.');
        }

        // Find the application letter and verify it belongs to a student who applied to this company
        $letter = ApplicationLetter::with(['student.applications.posting'])
            ->findOrFail($letterId);

        // Check if the student has an application to a posting from this company
        $hasAccess = $letter->student->applications()
            ->whereHas('posting', function ($query) use ($company) {
                $query->where('company_id', $company->company_id);
            })
            ->exists();

        if (!$hasAccess) {
            Log::warning('Company admin attempted to download application letter without authorization', [
                'user_id' => Auth::id(),
                'company_id' => $company->company_id,
                'letter_id' => $letterId,
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