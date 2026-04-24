<?php
namespace App\Http\Controllers;

use App\Models\User;
use App\Models\Department;
use App\Models\DepartmentHeadAssignment;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Inertia\Inertia;

class UserController extends Controller
{
    
public function index(Request $request)
    {
        if (Auth::user()->role !== 'admin') {
            abort(403, 'Unauthorized');
        }

        $query = User::whereIn('role', ['coordinator', 'dept_head', 'company_admin']);

        // Search
        if ($request->search) {
            $query->where(function ($q) use ($request) {
                $q->where('name', 'like', "%{$request->search}%")
                  ->orWhere('email', 'like', "%{$request->search}%")
                  ->orWhere('username', 'like', "%{$request->search}%")
                  ->orWhere('role', 'like', "%{$request->search}%")
                  ->orWhere('status', 'like', "%{$request->search}%");
            });
        }

        // Filtering
        if ($request->status && $request->status !== 'all') {
            $query->where('status', $request->status);
        }
        if ($request->role_filter && $request->role_filter !== 'all') {
            $query->where('role', $request->role_filter);
        }

        // Sorting
        $sortBy = $request->sort_by ?? 'name';
        $sortDir = $request->sort_dir ?? 'asc';
        $query->orderBy($sortBy, $sortDir);

        return Inertia::render('users/index', [
            'users' => $query->paginate(10)->withQueryString(),
            'filters' => $request->only(['search', 'status', 'role_filter', 'sort_by', 'sort_dir']),
            'success' => session('success'),
            'error' => session('error'),
        ]);
    }
    public function create()
    {
        if (Auth::user()->role !== 'admin') {
            abort(403, 'Unauthorized');
        }
        $coordinatorExists = User::where('role', 'coordinator')->exists();
        return Inertia::render('users/create', [
            'coordinatorExists' => $coordinatorExists,
        ]);
    }

   
    public function store(Request $request)
    {
        if (Auth::user()->role !== 'admin') {
            abort(403, 'Unauthorized');
        }
        
        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users,email',
            'username' => 'required|string|max:100|unique:users,username',
            'password' => 'required|string|min:8',
            'role' => [
                'required',
                'in:coordinator,dept_head,company_admin',
                function ($attribute, $value, $fail) {
                    if ($value === 'coordinator' && User::where('role', 'coordinator')->exists()) {
                        $fail('Only one coordinator can exist in the system. Please delete the existing coordinator before creating a new one.');
                    }
                },
            ],
            'phone' => 'nullable|string|max:20',
            'gender' => 'nullable|in:male,female',
            'status' => 'required|in:active,inactive',
            'avatar' => 'nullable|string|max:255',
        ]);

        User::create([
            'name' => $request->name,
            'email' => $request->email,
            'username' => $request->username,
            'password' => Hash::make($request->password),
            'role' => $request->role,
            'phone' => $request->phone,
            'gender' => $request->gender,
            'status' => $request->status,
            'avatar' => $request->avatar,
            'created_by' => Auth::id(),
        ]);

        return redirect()->route('users.index')->with('success', 'User created successfully.');
    }

    public function edit(User $user)
    {
        if (Auth::user()->role !== 'admin') {
            abort(403, 'Unauthorized');
        }

        // Check if user can be edited
        $canEdit = true;
        $errorMessage = null;

        if ($user->role === 'dept_head') {
            // Check if department has students or advisors
            $department = \App\Models\Department::where('dept_head_id', $user->user_id)->first();
            if ($department) {
                $hasStudents = \App\Models\Student::where('department_id', $department->department_id)->exists();
                $hasAdvisors = \App\Models\User::where('role', 'advisor')
                    ->whereHas('advisorAssignments', fn($q) => $q->where('department_id', $department->department_id))
                    ->exists();
                
                if ($hasStudents || $hasAdvisors) {
                    $canEdit = false;
                    $errorMessage = 'Cannot edit department head: Department has students or advisors assigned.';
                }
            }
        } elseif ($user->role === 'company_admin') {
            // Check if company admin has supervisors
            $company = $user->assignedCompany;
            if ($company) {
                $hasSupervisors = \App\Models\User::where('role', 'supervisor')
                    ->whereHas('supervisorAssignments', fn($q) => $q->where('company_id', $company->company_id))
                    ->exists();
                
                if ($hasSupervisors) {
                    $canEdit = false;
                    $errorMessage = 'Cannot edit company admin: Company has supervisors assigned.';
                }
            }
        }

        if (!$canEdit) {
            return redirect()->route('users.index')->with('error', $errorMessage);
        }

        return Inertia::render('users/edit', [
            'user' => $user->only('user_id', 'name', 'email', 'username', 'role', 'phone', 'gender', 'status', 'avatar', 'email_verified_at', 'created_at', 'updated_at'),
        ]);
    }

   
    public function update(Request $request, User $user)
    {
        if (Auth::user()->role !== 'admin') {
            abort(403, 'Unauthorized');
        }

        // Check if user can be edited
        if ($user->role === 'dept_head') {
            $department = \App\Models\Department::where('dept_head_id', $user->user_id)->first();
            if ($department) {
                $hasStudents = \App\Models\Student::where('department_id', $department->department_id)->exists();
                $hasAdvisors = \App\Models\User::where('role', 'advisor')
                    ->whereHas('advisorAssignments', fn($q) => $q->where('department_id', $department->department_id))
                    ->exists();
                
                if ($hasStudents || $hasAdvisors) {
                    return redirect()->back()->with('error', 'Cannot edit department head: Department has students or advisors assigned.');
                }
            }
        } elseif ($user->role === 'company_admin') {
            $company = $user->assignedCompany;
            if ($company) {
                $hasSupervisors = \App\Models\User::where('role', 'supervisor')
                    ->whereHas('supervisorAssignments', fn($q) => $q->where('company_id', $company->company_id))
                    ->exists();
                
                if ($hasSupervisors) {
                    return redirect()->back()->with('error', 'Cannot edit company admin: Company has supervisors assigned.');
                }
            }
        }

        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users,email,' . $user->user_id . ',user_id',
            'username' => 'required|string|max:100|unique:users,username,' . $user->user_id . ',user_id',
            'password' => 'nullable|string|min:8',
            'role' => 'required|in:student,coordinator,dept_head,advisor,company_admin,supervisor,admin',
            'phone' => 'nullable|string|max:20',
            'gender' => 'nullable|in:male,female',
            'status' => 'required|in:active,inactive',
            'avatar' => 'nullable|string|max:255',
        ]);

        $oldRole = $user->role;
        $oldStatus = $user->status;
        $user->update([
            'name' => $request->name,
            'email' => $request->email,
            'username' => $request->username,
            'password' => $request->password ? Hash::make($request->password) : $user->password,
            'role' => $request->role,
            'phone' => $request->phone,
            'gender' => $request->gender,
            'status' => $request->status,
            'avatar' => $request->avatar,
        ]);

        // Notify user about status change
        if ($oldStatus !== $request->status) {
            \App\Services\NotificationService::notifyUserStatusChange($user, $oldStatus, $request->status);
        }

        // Notify user about role change
        if ($oldRole !== $request->role) {
            \App\Services\NotificationService::notifyUserRoleChange($user, $oldRole, $request->role);
        }

        if ($oldRole === 'dept_head' && $request->role !== 'dept_head') {
            DepartmentHeadAssignment::where('user_id', $user->user_id)->delete();
            Department::where('dept_head_id', $user->user_id)->update(['dept_head_id' => null]);
        } elseif ($request->role === 'dept_head' && $oldRole !== 'dept_head') {
            if (DepartmentHeadAssignment::where('user_id', $user->user_id)->exists()) {
                return redirect()->back()->with('error', 'This user is already assigned as a department head.');
            }
        }

        return redirect()->route('users.index')->with('success', 'User updated successfully.');
    }

   
public function destroy(User $user)
    {
        if (Auth::user()->role !== 'admin') {
            abort(403, 'Unauthorized');
        }
        if ($user->user_id === Auth::id()) {
            return redirect()->route('users.index')->with('error', 'Cannot delete your own account.');
        }

        // Check if user can be deleted based on role and related records
        if ($user->role === 'dept_head') {
            $department = Department::where('dept_head_id', $user->user_id)->first();
            if ($department) {
                $hasStudents = \App\Models\Student::where('department_id', $department->department_id)->exists();
                $hasAdvisors = \App\Models\User::where('role', 'advisor')
                    ->whereHas('advisorAssignments', fn($q) => $q->where('department_id', $department->department_id))
                    ->exists();
                
                if ($hasStudents || $hasAdvisors) {
                    return redirect()->route('users.index')->with('error', 'Cannot delete department head: Department has students or advisors assigned.');
                }
            }
            DepartmentHeadAssignment::where('user_id', $user->user_id)->delete();
            Department::where('dept_head_id', $user->user_id)->update(['dept_head_id' => null]);
        } elseif ($user->role === 'company_admin') {
            $company = $user->assignedCompany;
            if ($company) {
                $hasSupervisors = \App\Models\User::where('role', 'supervisor')
                    ->whereHas('supervisorAssignments', fn($q) => $q->where('company_id', $company->company_id))
                    ->exists();
                $hasPostings = \App\Models\Posting::where('company_id', $company->company_id)->exists();
                
                if ($hasSupervisors || $hasPostings) {
                    return redirect()->route('users.index')->with('error', 'Cannot delete company admin: Company has supervisors or postings assigned.');
                }
            }
        } elseif ($user->role === 'coordinator') {
            $hasGeneratedLetters = \App\Models\ApplicationLetter::where('generated_by', $user->user_id)->exists();
            $hasDeptHead = \App\Models\User::where('role', 'dept_head')->exists();
            if ($hasGeneratedLetters) {
                return redirect()->route('users.index')->with('error', 'Cannot delete coordinator: Coordinator has generated application letters.');
            }
            if ($hasDeptHead) {
                return redirect()->route('users.index')->with('error', 'Cannot delete coordinator while department heads exist in the system.');
            }
        }

        $user->delete();

        return redirect()->route('users.index')->with('success', 'User deleted successfully.');
    }
    
    public function trashed(Request $request)
    {
        if (Auth::user()->role !== 'admin') {
            abort(403, 'Unauthorized');
        }
        $query = User::onlyTrashed()->whereIn('role', ['coordinator', 'dept_head', 'company_admin']);

        // Search
        if ($request->search) {
            $query->where(function ($q) use ($request) {
                $q->where('name', 'like', "%{$request->search}%")
                  ->orWhere('email', 'like', "%{$request->search}%")
                  ->orWhere('username', 'like', "%{$request->search}%")
                  ->orWhere('role', 'like', "%{$request->search}%")
                  ->orWhere('status', 'like', "%{$request->search}%");
            });
        }

        return Inertia::render('users/trashed', [
            'trashedUsers' => $query->paginate(10)->withQueryString(),
            'filters' => $request->only(['search']),
            'success' => session('success'),
            'error' => session('error'),
        ]);
    }

    public function show(User $user)
    {
        if (Auth::user()->role !== 'admin') {
            abort(403, 'Unauthorized');
        }
        return Inertia::render('users/show', [
            'user' => $user->only('user_id', 'name', 'email', 'username', 'role', 'phone', 'status', 'avatar', 'email_verified_at', 'created_at', 'updated_at'),
        ]);
    }

    public function restore(Request $request, $userId)
    {
        if (Auth::user()->role !== 'admin') {
            abort(403, 'Unauthorized');
        }
        $user = User::onlyTrashed()->findOrFail($userId);
        if ($user->role === 'dept_head' && Department::where('dept_head_id', $user->user_id)->exists()) {
            return redirect()->route('users.trashed')->with('error', 'Cannot restore: User is already assigned as a department head.');
        }
        $user->restore();

        return redirect()->route('users.trashed')->with('success', 'User restored successfully.');
    }
}