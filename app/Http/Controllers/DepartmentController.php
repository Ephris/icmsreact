<?php

namespace App\Http\Controllers;

use App\Models\Department;
use App\Models\User;
use App\Models\DepartmentHeadAssignment;
use App\Services\NotificationService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;

class DepartmentController extends Controller
{
    public function index(Request $request)
    {
        if (Auth::user()->role !== 'admin') {
            abort(403, 'Unauthorized: Only Super Admins can access this page.');
        }

        $search = $request->input('search', '');

        $departments = Department::query()
            ->when($search, function ($query, $search) {
                $query->where('name', 'like', "%{$search}%")
                    ->orWhere('code', 'like', "%{$search}%")
                    ->orWhere('faculty', 'like', "%{$search}%")
                    ->orWhereHas('deptHead', function ($query) use ($search) {
                        $query->where('name', 'like', "%{$search}%");
                    });
            })
            ->with(['deptHead' => function ($query) {
                $query->select('user_id', 'name');
            }])
            ->paginate(6, ['department_id', 'name', 'code', 'faculty', 'dept_head_id', 'description'])
            ->appends(['search' => $search]);

        Log::debug('Departments loaded for index:', [
            'departments' => $departments->map(function ($dept) {
                return [
                    'department_id' => $dept->department_id,
                    'name' => $dept->name,
                    'dept_head_id' => $dept->dept_head_id,
                    'deptHead' => $dept->deptHead ? ['user_id' => $dept->deptHead->user_id, 'name' => $dept->deptHead->name] : null,
                    'user_exists' => $dept->dept_head_id ? DB::table('users')->where('user_id', $dept->dept_head_id)->exists() : false,
                    'user_role' => $dept->dept_head_id ? DB::table('users')->where('user_id', $dept->dept_head_id)->value('role') : null,
                    'assignment_exists' => DB::table('department_head_assignments')
                        ->where('department_id', $dept->department_id)
                        ->where('user_id', $dept->dept_head_id)
                        ->exists(),
                ];
            })->toArray(),
            'pagination' => [
                'current_page' => $departments->currentPage(),
                'per_page' => $departments->perPage(),
                'total' => $departments->total(),
                'last_page' => $departments->lastPage(),
            ],
        ]);

        $links = [];
        for ($i = 1; $i <= $departments->lastPage(); $i++) {
            $links[] = [
                'url' => $departments->url($i),
                'label' => (string) $i,
                'active' => $i === $departments->currentPage(),
            ];
        }

        return Inertia::render('departments/index', [
            'departments' => [
                'data' => $departments->map(function ($dept) {
                    return [
                        'department_id' => $dept->department_id,
                        'name' => $dept->name,
                        'code' => $dept->code,
                        'faculty' => $dept->faculty,
                        'dept_head_id' => $dept->dept_head_id,
                        'description' => $dept->description,
                        'deptHead' => $dept->deptHead ? ['user_id' => $dept->deptHead->user_id, 'name' => $dept->deptHead->name] : null,
                    ];
                })->toArray(),
                'current_page' => $departments->currentPage(),
                'per_page' => $departments->perPage(),
                'total' => $departments->total(),
                'last_page' => $departments->lastPage(),
                'links' => $links,
            ],
            'search' => $search,
            'success' => session('success'),
            'error' => session('error'),
        ]);
    }

    public function create()
    {
        if (Auth::user()->role !== 'admin') {
            abort(403, 'Unauthorized: Only Super Admins can access this page.');
        }
        return Inertia::render('departments/create', [
            'deptHeads' => User::where('role', 'dept_head')
                ->whereNotExists(function ($query) {
                    $query->select(DB::raw(1))
                        ->from('department_head_assignments')
                        ->whereColumn('department_head_assignments.user_id', 'users.user_id');
                })
                ->get(['user_id', 'name']),
            'success' => session('success'),
            'error' => session('error'),
        ]);
    }

    public function store(Request $request)
    {
        if (Auth::user()->role !== 'admin') {
            abort(403, 'Unauthorized: Only Super Admins can perform this action.');
        }
        $validated = $request->validate([
            'name' => 'required|string|max:100',
            'description' => 'nullable|string',
            'code' => 'nullable|string|max:50|unique:departments,code',
            'faculty' => 'nullable|string|max:100',
            'dept_head_id' => [
                'nullable',
                'exists:users,user_id,role,dept_head',
                function ($attribute, $value, $fail) {
                    if ($value && DepartmentHeadAssignment::where('user_id', $value)->exists()) {
                        $fail('This user is already assigned as a department head.');
                    }
                },
            ],
        ]);

        try {
            $department = null;
            DB::transaction(function () use ($validated, &$department) {
                $department = Department::create($validated);
                if ($validated['dept_head_id']) {
                    DepartmentHeadAssignment::create([
                        'department_id' => $department->department_id,
                        'user_id' => $validated['dept_head_id'],
                    ]);
                }
            });

            if ($department) {
                NotificationService::notifyAdminDepartmentCreated($department->name, $department->department_id, Auth::user());
                NotificationService::notifyCoordinatorsDepartmentCreated($department->name, $department->department_id, Auth::user());
            }

            return redirect()->route('departments.index')->with('success', 'Department created successfully.');
        } catch (\Exception $e) {
            Log::error('Failed to create department:', ['error' => $e->getMessage()]);
            return redirect()->back()->with('error', 'Failed to create department: ' . $e->getMessage())->withInput();
        }
    }

    public function edit(Department $department)
    {
        if (Auth::user()->role !== 'admin') {
            abort(403, 'Unauthorized: Only Super Admins can access this page.');
        }
        $department->load(['deptHead' => function ($query) {
            $query->select('user_id', 'name');
        }]);
        return Inertia::render('departments/edit', [
            'department' => $department->only('department_id', 'name', 'description', 'code', 'faculty', 'dept_head_id', 'deptHead'),
            'deptHeads' => User::where('role', 'dept_head')
                ->whereNotExists(function ($query) use ($department) {
                    $query->select(DB::raw(1))
                        ->from('department_head_assignments')
                        ->whereColumn('department_head_assignments.user_id', 'users.user_id')
                        ->where('department_head_assignments.department_id', '!=', $department->department_id);
                })
                ->get(['user_id', 'name']),
            'success' => session('success'),
            'error' => session('error'),
        ]);
    }

    public function update(Request $request, Department $department)
    {
        if (Auth::user()->role !== 'admin') {
            abort(403, 'Unauthorized: Only Super Admins can perform this action.');
        }
        $validated = $request->validate([
            'name' => 'required|string|max:100',
            'description' => 'nullable|string',
            'code' => 'nullable|string|max:50|unique:departments,code,' . $department->department_id . ',department_id',
            'faculty' => 'nullable|string|max:100',
            'dept_head_id' => [
                'nullable',
                'exists:users,user_id,role,dept_head',
                function ($attribute, $value, $fail) use ($department) {
                    if ($value && DepartmentHeadAssignment::where('user_id', $value)
                        ->where('department_id', '!=', $department->department_id)
                        ->exists()) {
                        $fail('This user is already assigned as a department head.');
                    }
                },
            ],
        ]);

        try {
            DB::transaction(function () use ($validated, $department) {
                $department->update($validated);
                $assignment = DepartmentHeadAssignment::where('department_id', $department->department_id)->first();
                if ($assignment) {
                    if ($validated['dept_head_id']) {
                        $assignment->update(['user_id' => $validated['dept_head_id']]);
                    } else {
                        $assignment->delete();
                    }
                } elseif ($validated['dept_head_id']) {
                    DepartmentHeadAssignment::create([
                        'department_id' => $department->department_id,
                        'user_id' => $validated['dept_head_id'],
                    ]);
                }
            });
            return redirect()->route('departments.index')->with('success', 'Department updated successfully.');
        } catch (\Exception $e) {
            Log::error('Failed to update department:', ['error' => $e->getMessage()]);
            return redirect()->back()->with('error', 'Failed to update department: ' . $e->getMessage())->withInput();
        }
    }


    public function destroy(Department $department)
    {
        if (Auth::user()->role !== 'admin') {
            abort(403, 'Unauthorized: Only Super Admins can perform this action.');
        }

        // Block deletion if department has a dept_head assigned
        if ($department->dept_head_id) {
            return redirect()->route('departments.index')->with('error', 'Cannot delete department: Department has a department head assigned.');
        }

        DepartmentHeadAssignment::where('department_id', $department->department_id)->delete();
        $department->dept_head_id = null;
        $department->save();
        $department->delete();
        return redirect()->route('departments.index')->with('success', 'Department deleted successfully.');
    }

    public function trashed()
    {
        if (Auth::user()->role !== 'admin') {
            abort(403, 'Unauthorized: Only Super Admins can access this page.');
        }
        $trashedDepartments = Department::onlyTrashed()->with(['deptHead' => function ($query) {
            $query->select('user_id', 'name');
        }])->get(['department_id', 'name', 'code', 'faculty', 'dept_head_id', 'description', 'deleted_at']);
        return Inertia::render('departments/trashed', [
            'trashedDepartments' => $trashedDepartments,
            'success' => session('success'),
            'error' => session('error'),
        ]);
    }

    public function restore($departmentId)
    {
        if (Auth::user()->role !== 'admin') {
            abort(403, 'Unauthorized: Only Super Admins can perform this action.');
        }
        try {
            $department = Department::onlyTrashed()->findOrFail($departmentId);
            $department->restore();
            return redirect()->route('departments.trashed')->with('success', 'Department restored successfully.');
        } catch (\Exception $e) {
            Log::error('Failed to restore department:', ['error' => $e->getMessage()]);
            return redirect()->route('departments.trashed')->with('error', 'Failed to restore department: ' . $e->getMessage());
        }
    }

    public function show(Department $department)
    {
        if (Auth::user()->role !== 'admin') {
            abort(403, 'Unauthorized: Only Super Admins can access this page.');
        }
        $department->load(['deptHead' => function ($query) {
            $query->select('user_id', 'name');
        }]);
        return Inertia::render('departments/show', [
            'department' => $department->only('department_id', 'name', 'description', 'code', 'faculty', 'dept_head_id', 'deptHead'),
            'success' => session('success'),
            'error' => session('error'),
        ]);
    }
}