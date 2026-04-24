<?php

namespace App\Http\Controllers;

use App\Models\Application;
use App\Models\ApplicationLetter;
use App\Models\AdvisorAssignment;
use App\Models\Department;
use App\Models\Form;
use App\Models\Student;
use App\Models\User;
use App\Models\InternshipAnalytics;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Carbon\Carbon;
use App\Services\NotificationService;

class DepartmentHeadController extends Controller
{
    public function index()
    {
        if (Auth::user()->role !== 'dept_head') {
            abort(403, 'Unauthorized');
        }

        $department = Auth::user()->assignedDepartment;
        if (!$department) {
            return Inertia::render('department-head/index', ['error' => 'No department assigned.']);
        }

        $payload = $this->buildDashboardPayload($department);

        Log::debug('Department head dashboard loaded:', [
            'department' => $department->only('department_id', 'name'),
            'students_count' => count($payload['students']),
            'advisors_count' => count($payload['advisors']),
        ]);

        return Inertia::render('department-head/index', array_merge(
            [
                'department' => $department->only('department_id', 'name', 'description', 'status'),
                'success' => session('success'),
                'error' => session('error'),
            ],
            $payload
        ));
    }

    public function show()
    {
        if (Auth::user()->role !== 'dept_head') {
            abort(403, 'Unauthorized');
        }

        $department = Auth::user()->assignedDepartment;
        if (!$department) {
            return Inertia::render('department-head/show', ['error' => 'No department assigned.']);
        }

        return Inertia::render('department-head/show', array_merge(
            [
                'department' => $department->only('department_id', 'name', 'description', 'status'),
                'success' => session('success'),
                'error' => session('error'),
            ],
            $this->buildDashboardPayload($department)
        ));
    }

    public function createStudent()
    {
        if (Auth::user()->role !== 'dept_head') {
            abort(403, 'Unauthorized');
        }

        $department = Auth::user()->assignedDepartment;
        if (!$department) {
            return Inertia::render('department-head/studentscreate', ['error' => 'No department assigned.']);
        }

        return Inertia::render('department-head/studentscreate', [
            'department' => $department->only('department_id', 'name'),
            'success' => session('success'),
            'error' => session('error'),
        ]);
    }

    public function storeStudent(Request $request)
    {
        if (Auth::user()->role !== 'dept_head') {
            abort(403, 'Unauthorized');
        }

        $department = Auth::user()->assignedDepartment;
        if (!$department) {
            return Inertia::render('department-head/studentscreate', ['error' => 'No department assigned.']);
        }

        $validated = $request->validate([
            'username' => 'required|string|max:255|unique:users,username',
            'email' => 'required|email|max:255|unique:users,email',
            'password' => 'required|string|min:8|confirmed',
            'first_name' => 'required|string|max:100',
            'last_name' => 'required|string|max:100',
            'phone' => 'nullable|string|max:20',
            'gender' => 'required|in:male,female',
            'cgpa' => 'nullable|numeric|min:0|max:4',
            'year_of_study' => 'nullable|string|max:50',
            'university_id' => ['required', 'string', 'regex:/^(UGR|UGP|TUGR)\/\d{5}\/\d{2}$/', 'unique:students,university_id'],
            'status' => 'required|in:active,inactive',
        ], [
            'university_id.regex' => 'University ID must be in format: UGR/12345/12, UGP/12345/12, or TUGR/12345/12',
        ]);

        try {
            DB::transaction(function () use ($validated, $department) {
                $user = User::create([
                    'username' => $validated['username'],
                    'email' => $validated['email'],
                    'password' => Hash::make($validated['password']),
                    'name' => $validated['first_name'] . ' ' . $validated['last_name'],
                    'first_name' => $validated['first_name'],
                    'last_name' => $validated['last_name'],
                    'phone' => $validated['phone'],
                    'gender' => $validated['gender'],
                    'role' => 'student',
                    'department_id' => $department->department_id,
                    'status' => $validated['status'],
                    'created_by' => Auth::id(),
                ]);

                Student::create([
                    'user_id' => $user->user_id,
                    'department_id' => $department->department_id,
                    'first_name' => $validated['first_name'],
                    'last_name' => $validated['last_name'],
                    'cgpa' => $validated['cgpa'],
                    'year_of_study' => $validated['year_of_study'],
                    'university_id' => $validated['university_id'],
                ]);
            });

            return redirect()->route('department-head.departments')->with('success', 'Student created successfully.');
        } catch (\Illuminate\Validation\ValidationException $e) {
            Log::error('Validation failed when creating student:', ['error' => $e->getMessage(), 'errors' => $e->errors()]);
            return redirect()->back()->withErrors($e->errors())->withInput();
        } catch (\Exception $e) {
            Log::error('Failed to create student:', ['error' => $e->getMessage()]);
            return redirect()->back()->with('error', 'Failed to create student: ' . $e->getMessage())->withInput();
        }
    }

    public function viewStudent($student_id)
    {
        if (Auth::user()->role !== 'dept_head') {
            abort(403, 'Unauthorized');
        }

        $department = Auth::user()->assignedDepartment;
        if (!$department) {
            return Inertia::render('department-head/studentsview', ['error' => 'No department assigned.']);
        }

        $student = Student::with(['user', 'advisors'])
            ->where('department_id', $department->department_id)
            ->findOrFail($student_id);

        return Inertia::render('department-head/studentsview', [
            'department' => $department->only('department_id', 'name'),
            'student' => [
                'student_id' => $student->student_id,
                'name' => $student->user->getNameAttribute(),
                'email' => $student->user->email,
                'phone' => $student->user->phone,
                'gender' => $student->user->gender,
                'cgpa' => $student->cgpa,
                'year_of_study' => $student->year_of_study,
                'university_id' => $student->university_id,
                'status' => $student->user->status,
                'advisors' => $student->advisors->map(fn($advisor) => [
                    'user_id' => $advisor->user_id,
                    'name' => $advisor->getNameAttribute(),
                ]),
                'applications' => $student->applications()->with('posting.company')->get()->map(fn($app) => [
                    'application_id' => $app->application_id,
                    'posting_title' => $app->posting->title,
                    'company_name' => $app->posting->company->name,
                    'status' => $app->status,
                    'applied_at' => $app->created_at->toDateTimeString(),
                ]),
            ],
            'success' => session('success'),
            'error' => session('error'),
        ]);
    }

    public function editStudent($student_id)
    {
        if (Auth::user()->role !== 'dept_head') {
            abort(403, 'Unauthorized');
        }

        $department = Auth::user()->assignedDepartment;
        if (!$department) {
            return Inertia::render('department-head/studentsedit', ['error' => 'No department assigned.']);
        }

        $student = Student::with('user')
            ->where('department_id', $department->department_id)
            ->findOrFail($student_id);

        return Inertia::render('department-head/studentsedit', [
            'department' => $department->only('department_id', 'name'),
            'student' => [
                'student_id' => $student->student_id,
                'username' => $student->user->username,
                'email' => $student->user->email,
                'first_name' => $student->first_name,
                'last_name' => $student->last_name,
                'phone' => $student->user->phone,
                'gender' => $student->user->gender,
                'cgpa' => $student->cgpa,
                'year_of_study' => $student->year_of_study,
                'university_id' => $student->university_id,
                'status' => $student->user->status,
            ],
            'success' => session('success'),
            'error' => session('error'),
        ]);
    }

    public function updateStudent(Request $request, $student_id)
    {
        if (Auth::user()->role !== 'dept_head') {
            abort(403, 'Unauthorized');
        }

        $department = Auth::user()->assignedDepartment;
        if (!$department) {
            return Inertia::render('department-head/studentsedit', ['error' => 'No department assigned.']);
        }

        $student = Student::where('department_id', $department->department_id)->findOrFail($student_id);

        $validated = $request->validate([
            'username' => 'required|string|max:255|unique:users,username,' . $student->user_id . ',user_id',
            'email' => 'required|email|max:255|unique:users,email,' . $student->user_id . ',user_id',
            'first_name' => 'required|string|max:100',
            'last_name' => 'required|string|max:100',
            'phone' => 'nullable|string|max:20',
            'gender' => 'nullable|in:male,female',
            'cgpa' => 'nullable|numeric|min:0|max:4',
            'university_id' => ['required', 'string', 'regex:/^(UGR|UGP|TUGR)\/\d{5}\/\d{2}$/', 'unique:students,university_id,' . $student->student_id . ',student_id'],
            'status' => 'required|in:active,inactive',
        ], [
            'university_id.regex' => 'University ID must be in format: UGR/12345/12, UGP/12345/12, or TUGR/12345/12',
        ]);

        try {
            $oldStatus = $student->user->status;
            DB::transaction(function () use ($validated, $student) {
                $updateData = [
                    'username' => $validated['username'],
                    'email' => $validated['email'],
                    'name' => $validated['first_name'] . ' ' . $validated['last_name'],
                    'first_name' => $validated['first_name'],
                    'last_name' => $validated['last_name'],
                    'phone' => $validated['phone'],
                    'status' => $validated['status'],
                ];
                
                if (isset($validated['gender'])) {
                    $updateData['gender'] = $validated['gender'];
                }
                
                $student->user->update($updateData);

                $student->update([
                    'first_name' => $validated['first_name'],
                    'last_name' => $validated['last_name'],
                    'cgpa' => $validated['cgpa'],
                    'university_id' => $validated['university_id'],
                ]);
            });

            // Notify student about status change
            if ($oldStatus !== $validated['status']) {
                NotificationService::notifyUserStatusChange($student->user, $oldStatus, $validated['status']);
            }

            return redirect()->route('department-head.departments')->with('success', 'Student updated successfully.');
        } catch (\Illuminate\Validation\ValidationException $e) {
            Log::error('Validation failed when updating student:', ['error' => $e->getMessage(), 'errors' => $e->errors()]);
            return redirect()->back()->withErrors($e->errors())->withInput();
        } catch (\Exception $e) {
            Log::error('Failed to update student:', ['error' => $e->getMessage()]);
            // Refresh student data and redirect back with error
            $student->refresh();
            return redirect()->route('department-head.editstudent', $student_id)
                ->with('error', 'Failed to update student: ' . $e->getMessage());
        }
    }

    public function destroyStudent($student_id)
    {
        if (Auth::user()->role !== 'dept_head') {
            abort(403, 'Unauthorized');
        }

        $department = Auth::user()->assignedDepartment;
        if (!$department) {
            return redirect()->route('department-head.show')->with('error', 'No department assigned.');
        }

        $student = Student::where('department_id', $department->department_id)->findOrFail($student_id);

        try {
            DB::transaction(function () use ($student) {
                AdvisorAssignment::where('student_id', $student->student_id)->delete();
                $student->user->delete();
                $student->delete();
            });

            return redirect()->route('department-head.show')->with('success', 'Student deleted successfully.');
        } catch (\Exception $e) {
            Log::error('Failed to delete student:', ['error' => $e->getMessage()]);
            return redirect()->route('department-head.show')->with('error', 'Failed to delete student: ' . $e->getMessage());
        }
    }

    public function createAdvisor()
    {
        if (Auth::user()->role !== 'dept_head') {
            abort(403, 'Unauthorized');
        }

        $department = Auth::user()->assignedDepartment;
        if (!$department) {
            return Inertia::render('department-head/advisorscreate', ['error' => 'No department assigned.']);
        }

        return Inertia::render('department-head/advisorscreate', [
            'department' => $department->only('department_id', 'name'),
            'success' => session('success'),
            'error' => session('error'),
        ]);
    }

    public function storeAdvisor(Request $request)
    {
        if (Auth::user()->role !== 'dept_head') {
            abort(403, 'Unauthorized');
        }

        $department = Auth::user()->assignedDepartment;
        if (!$department) {
            return Inertia::render('department-head/advisorscreate', ['error' => 'No department assigned.']);
        }

        $validated = $request->validate([
            'username' => 'required|string|max:255|unique:users,username',
            'email' => 'required|email|max:255|unique:users,email',
            'password' => 'required|string|min:8|confirmed',
            'first_name' => 'required|string|max:100',
            'last_name' => 'required|string|max:100',
            'phone' => 'nullable|string|max:20',
            'specialization' => 'nullable|string|max:255',
            'gender' => 'required|in:male,female',
            'status' => 'required|in:active,inactive',
        ]);

        try {
            $user = User::create([
                'username' => $validated['username'],
                'email' => $validated['email'],
                'password' => Hash::make($validated['password']),
                'name' => $validated['first_name'] . ' ' . $validated['last_name'],
                'first_name' => $validated['first_name'],
                'last_name' => $validated['last_name'],
                'phone' => $validated['phone'],
                'specialization' => $validated['specialization'],
                'gender' => $validated['gender'],
                'role' => 'advisor',
                'department_id' => $department->department_id,
                'status' => $validated['status'],
            ]);

            return Inertia::render('department-head/index', array_merge(
                [
                    'success' => 'Advisor created successfully.',
                    'department' => $department->only('department_id', 'name', 'description', 'status'),
                ],
                $this->buildDashboardPayload($department)
            ));
        } catch (\Exception $e) {
            Log::error('Failed to create advisor:', ['error' => $e->getMessage()]);
            return Inertia::render('department-head/advisorscreate', [
                'error' => 'Failed to create advisor: ' . $e->getMessage(),
                'department' => $department->only('department_id', 'name'),
            ])->withInput();
        }
    }

    public function viewAdvisor($advisor_id)
    {
        if (Auth::user()->role !== 'dept_head') {
            abort(403, 'Unauthorized');
        }

        $department = Auth::user()->assignedDepartment;
        if (!$department) {
            return Inertia::render('department-head/advisorsview', ['error' => 'No department assigned.']);
        }

        $advisor = User::where('role', 'advisor')
            ->where('department_id', $department->department_id)
            ->with('assignedStudents')
            ->findOrFail($advisor_id);

        return Inertia::render('department-head/advisorsview', [
            'department' => $department->only('department_id', 'name'),
            'advisor' => [
                'user_id' => $advisor->user_id,
                'name' => $advisor->getNameAttribute(),
                'email' => $advisor->email,
                'phone' => $advisor->phone,
                'gender' => $advisor->gender,
                'specialization' => $advisor->specialization,
                'status' => $advisor->status,
                'students' => $advisor->assignedStudents->map(fn($student) => [
                    'student_id' => $student->student_id,
                    'name' => $student->user->getNameAttribute(),
                ]),
            ],
            'success' => session('success'),
            'error' => session('error'),
        ]);
    }

    public function editAdvisor($advisor_id)
    {
        if (Auth::user()->role !== 'dept_head') {
            abort(403, 'Unauthorized');
        }

        $department = Auth::user()->assignedDepartment;
        if (!$department) {
            return Inertia::render('department-head/advisorsedit', ['error' => 'No department assigned.']);
        }

        $advisor = User::where('role', 'advisor')
            ->where('department_id', $department->department_id)
            ->findOrFail($advisor_id);

        return Inertia::render('department-head/advisorsedit', [
            'department' => $department->only('department_id', 'name'),
            'advisor' => [
                'user_id' => $advisor->user_id,
                'username' => $advisor->username,
                'email' => $advisor->email,
                'first_name' => $advisor->first_name,
                'last_name' => $advisor->last_name,
                'phone' => $advisor->phone,
                'specialization' => $advisor->specialization,
                'status' => $advisor->status,
            ],
            'success' => session('success'),
            'error' => session('error'),
        ]);
    }

    public function updateAdvisor(Request $request, $advisor_id)
    {
        if (Auth::user()->role !== 'dept_head') {
            abort(403, 'Unauthorized');
        }

        $department = Auth::user()->assignedDepartment;
        if (!$department) {
            return Inertia::render('department-head/advisorsedit', ['error' => 'No department assigned.']);
        }

        $advisor = User::where('role', 'advisor')
            ->where('department_id', $department->department_id)
            ->findOrFail($advisor_id);

        $validated = $request->validate([
            'username' => 'required|string|max:255|unique:users,username,' . $advisor->user_id . ',user_id',
            'email' => 'required|email|max:255|unique:users,email,' . $advisor->user_id . ',user_id',
            'first_name' => 'required|string|max:100',
            'last_name' => 'required|string|max:100',
            'phone' => 'nullable|string|max:20',
            'specialization' => 'nullable|string|max:255',
            'gender' => 'required|in:male,female',
            'status' => 'required|in:active,inactive',
        ]);

        try {
            $advisor->update([
                'username' => $validated['username'],
                'email' => $validated['email'],
                'name' => $validated['first_name'] . ' ' . $validated['last_name'],
                'first_name' => $validated['first_name'],
                'last_name' => $validated['last_name'],
                'phone' => $validated['phone'],
                'specialization' => $validated['specialization'],
                'gender' => $validated['gender'],
                'status' => $validated['status'],
            ]);

            return Inertia::render('department-head/index', array_merge(
                [
                    'success' => 'Advisor updated successfully.',
                    'department' => $department->only('department_id', 'name', 'description', 'status'),
                ],
                $this->buildDashboardPayload($department)
            ));
        } catch (\Exception $e) {
            Log::error('Failed to update advisor:', ['error' => $e->getMessage()]);
            return Inertia::render('department-head/advisorsedit', [
                'error' => 'Failed to update advisor: ' . $e->getMessage(),
                'department' => $department->only('department_id', 'name'),
                'advisor' => [
                    'user_id' => $advisor->user_id,
                    'username' => $advisor->username,
                    'email' => $advisor->email,
                    'first_name' => $advisor->first_name,
                    'last_name' => $advisor->last_name,
                    'phone' => $advisor->phone,
                    'specialization' => $advisor->specialization,
                    'status' => $advisor->status,
                ],
            ])->withInput();
        }
    }

    public function destroyAdvisor($advisor_id)
    {
        if (Auth::user()->role !== 'dept_head') {
            abort(403, 'Unauthorized');
        }

        $department = Auth::user()->assignedDepartment;
        if (!$department) {
            return redirect()->route('department-head.show')->with('error', 'No department assigned.');
        }

        $advisor = User::where('role', 'advisor')
            ->where('department_id', $department->department_id)
            ->findOrFail($advisor_id);

        // Check if advisor has created forms and sent to supervisor
        $hasFormsSentToSupervisor = \App\Models\Form::where('advisor_id', $advisor->user_id)
            ->whereNotNull('supervisor_id')
            ->exists();

        if ($hasFormsSentToSupervisor) {
            return redirect()->route('department-head.show')->with('error', 'Cannot delete advisor: advisor has created forms and sent them to supervisors.');
        }

        try {
            DB::transaction(function () use ($advisor) {
                AdvisorAssignment::where('advisor_id', $advisor->user_id)->delete();
                $advisor->delete();
            });

            return redirect()->route('department-head.show')->with('success', 'Advisor deleted successfully.');
        } catch (\Exception $e) {
            Log::error('Failed to delete advisor:', ['error' => $e->getMessage()]);
            return redirect()->route('department-head.show')->with('error', 'Failed to delete advisor: ' . $e->getMessage());
        }
    }

    public function assignAdvisor()
    {
        try {
            if (Auth::user()->role !== 'dept_head') {
                Log::error('Unauthorized access attempt to assignAdvisor', ['user_id' => Auth::id()]);
                abort(403, 'Unauthorized');
            }

            $user = Auth::user();
            $department = null;

            try {
                $department = $user->assignedDepartment;
            } catch (\Exception $e) {
                Log::error('Failed to fetch assignedDepartment', [
                    'user_id' => $user->user_id,
                    'error' => $e->getMessage(),
                    'trace' => $e->getTraceAsString(),
                ]);
            }

            if (!$department) {
                Log::warning('No department assigned for user in assignAdvisor', [
                    'user_id' => $user->user_id,
                    'department_head_assignments' => \App\Models\DepartmentHeadAssignment::where('user_id', $user->user_id)->get()->toArray(),
                ]);
                return Inertia::render('department-head/advisorsassign', [
                    'error' => 'No department assigned.',
                    'department' => null,
                    'students' => [],
                    'advisors' => [],
                    'assignments' => [],
                    'success' => null,
                ]);
            }

            // Fetch unassigned students only
            $students = Student::where('department_id', $department->department_id)
                ->whereNull('deleted_at')
                ->whereNotExists(function ($query) {
                    $query->select(DB::raw(1))
                          ->from('advisor_assignments')
                          ->whereColumn('advisor_assignments.student_id', 'students.student_id');
                })
                ->with(['user' => function ($query) {
                    $query->select('user_id', 'first_name', 'last_name');
                }])
                ->select('student_id', 'user_id')
                ->get()
                ->map(function ($student) {
                    $name = isset($student->user->first_name, $student->user->last_name)
                        ? $student->user->first_name . ' ' . $student->user->last_name
                        : 'Unknown';
                    return [
                        'student_id' => $student->student_id,
                        'name' => $name,
                    ];
                })->toArray();

            $advisors = User::where('role', 'advisor')
                ->where('department_id', $department->department_id)
                ->whereNull('deleted_at')
                ->select('user_id', 'first_name', 'last_name')
                ->get()
                ->map(function ($advisor) {
                    $name = isset($advisor->first_name, $advisor->last_name)
                        ? $advisor->first_name . ' ' . $advisor->last_name
                        : 'Unknown';
                    return [
                        'user_id' => $advisor->user_id,
                        'name' => $name,
                    ];
                })->toArray();

            $assignments = AdvisorAssignment::where('department_id', $department->department_id)
                ->with([
                    'student.user' => function ($query) {
                        $query->select('user_id', 'first_name', 'last_name');
                    },
                    'advisor' => function ($query) {
                        $query->select('user_id', 'first_name', 'last_name');
                    }
                ])
                ->get()
                ->map(function ($assignment) {
                    $studentName = isset($assignment->student->user->first_name, $assignment->student->user->last_name)
                        ? $assignment->student->user->first_name . ' ' . $assignment->student->user->last_name
                        : 'Unknown';
                    $advisorName = isset($assignment->advisor->first_name, $assignment->advisor->last_name)
                        ? $assignment->advisor->first_name . ' ' . $assignment->advisor->last_name
                        : 'Unknown';
                    return [
                        'assignment_id' => $assignment->assignment_id,
                        'student_id' => $assignment->student_id,
                        'student_name' => $studentName,
                        'advisor_id' => $assignment->advisor_id,
                        'advisor_name' => $advisorName,
                        'status' => $assignment->status,
                        'assigned_at' => $assignment->assigned_at->toDateTimeString(),
                    ];
                })->toArray();

            $response = [
                'department' => [
                    'department_id' => $department->department_id,
                    'name' => $department->name,
                ],
                'students' => $students,
                'advisors' => $advisors,
                'assignments' => $assignments,
                'success' => session('success'),
                'error' => session('error'),
            ];

            Log::info('assignAdvisor response prepared', [
                'user_id' => $user->user_id,
                'department_id' => $department->department_id,
                'student_count' => count($students),
                'advisor_count' => count($advisors),
                'assignment_count' => count($assignments),
            ]);

            return Inertia::render('department-head/advisorsassign', $response);
        } catch (\Exception $e) {
            Log::error('Error in assignAdvisor', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
                'user_id' => Auth::id(),
            ]);
            return Inertia::render('department-head/advisorsassign', [
                'error' => 'An error occurred while loading the page.',
                'department' => null,
                'students' => [],
                'advisors' => [],
                'assignments' => [],
                'success' => null,
            ]);
        }
    }

    public function storeAdvisorAssignment(Request $request)
    {
        try {
            if (Auth::user()->role !== 'dept_head') {
                Log::error('Unauthorized access attempt to storeAdvisorAssignment', ['user_id' => Auth::id()]);
                abort(403, 'Unauthorized');
            }

            $department = Auth::user()->assignedDepartment;

            if (!$department) {
                Log::warning('No department assigned for user in storeAdvisorAssignment', [
                    'user_id' => Auth::user()->user_id,
                    'department_head_assignments' => \App\Models\DepartmentHeadAssignment::where('user_id', Auth::user()->user_id)->get()->toArray(),
                ]);
                return Inertia::render('department-head/advisorsassign', [
                    'error' => 'No department assigned.',
                    'department' => null,
                    'students' => [],
                    'advisors' => [],
                    'assignments' => [],
                    'success' => null,
                ]);
            }

            $validated = $request->validate([
                'advisor_id' => 'required|exists:users,user_id,role,advisor,department_id,' . $department->department_id . ',deleted_at,NULL',
                'student_ids' => 'required|array|min:1',
                'student_ids.*' => 'exists:students,student_id,department_id,' . $department->department_id . ',deleted_at,NULL',
                'status' => 'required|in:active,inactive',
            ]);

            DB::transaction(function () use ($validated, $department) {
                foreach ($validated['student_ids'] as $student_id) {
                    AdvisorAssignment::create([
                        'advisor_id' => $validated['advisor_id'],
                        'student_id' => $student_id,
                        'department_id' => $department->department_id,
                        'status' => $validated['status'],
                        'assigned_at' => now(),
                    ]);
                }
            });

            // Notify students about advisor assignment
            $advisor = User::find($validated['advisor_id']);
            foreach ($validated['student_ids'] as $student_id) {
                $student = Student::find($student_id);
                if ($student && $advisor) {
                    NotificationService::notifyAdvisorStudentAssigned($student->user, Auth::user());
                }
            }

            // Notify advisors about new student assignments
            NotificationService::notifyAdvisorNewStudentAssignments($advisor, $validated['student_ids']);

            Log::info('Advisors assigned successfully', [
                'advisor_id' => $validated['advisor_id'],
                'student_ids' => $validated['student_ids'],
                'department_id' => $department->department_id,
                'user_id' => Auth::user()->user_id,
            ]);

            return redirect()->route('department-head.advisorsassign')->with('success', 'Advisor assigned to students successfully.');
        } catch (\Exception $e) {
            Log::error('Error in storeAdvisorAssignment', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
                'user_id' => Auth::id(),
                'advisor_id' => $request->input('advisor_id'),
                'student_ids' => $request->input('student_ids'),
            ]);
            return Inertia::render('department-head/advisorsassign', [
                'error' => 'Failed to assign advisor: ' . $e->getMessage(),
                'department' => $department ? [
                    'department_id' => $department->department_id,
                    'name' => $department->name,
                ] : null,
                'students' => $department ? Student::where('department_id', $department->department_id)
                    ->whereNull('deleted_at')
                    ->whereNotExists(function ($query) {
                        $query->select(DB::raw(1))
                              ->from('advisor_assignments')
                              ->whereColumn('advisor_assignments.student_id', 'students.student_id');
                    })
                    ->with(['user' => function ($query) {
                        $query->select('user_id', 'first_name', 'last_name');
                    }])
                    ->select('student_id', 'user_id')
                    ->get()
                    ->map(function ($student) {
                        $name = isset($student->user->first_name, $student->user->last_name)
                            ? $student->user->first_name . ' ' . $student->user->last_name
                            : 'Unknown';
                        return [
                            'student_id' => $student->student_id,
                            'name' => $name,
                        ];
                    })->toArray() : [],
                'advisors' => $department ? User::where('role', 'advisor')
                    ->where('department_id', $department->department_id)
                    ->whereNull('deleted_at')
                    ->select('user_id', 'first_name', 'last_name')
                    ->get()
                    ->map(function ($advisor) {
                        $name = isset($advisor->first_name, $advisor->last_name)
                            ? $advisor->first_name . ' ' . $advisor->last_name
                            : 'Unknown';
                        return [
                            'user_id' => $advisor->user_id,
                            'name' => $name,
                        ];
                    })->toArray() : [],
                'assignments' => $department ? AdvisorAssignment::where('department_id', $department->department_id)
                    ->with([
                        'student.user' => function ($query) {
                            $query->select('user_id', 'first_name', 'last_name');
                        },
                        'advisor' => function ($query) {
                            $query->select('user_id', 'first_name', 'last_name');
                        }
                    ])
                    ->get()
                    ->map(function ($assignment) {
                        $studentName = isset($assignment->student->user->first_name, $assignment->student->user->last_name)
                            ? $assignment->student->user->first_name . ' ' . $assignment->student->user->last_name
                            : 'Unknown';
                        $advisorName = isset($assignment->advisor->first_name, $assignment->advisor->last_name)
                            ? $assignment->advisor->first_name . ' ' . $assignment->advisor->last_name
                            : 'Unknown';
                        return [
                            'assignment_id' => $assignment->assignment_id,
                            'student_id' => $assignment->student_id,
                            'student_name' => $studentName,
                            'advisor_id' => $assignment->advisor_id,
                            'advisor_name' => $advisorName,
                            'status' => $assignment->status,
                            'assigned_at' => $assignment->assigned_at->toDateTimeString(),
                        ];
                    })->toArray() : [],
                'success' => null,
            ]);
        }
    }

    public function destroyAdvisorAssignment($assignment_id)
    {
        try {
            if (Auth::user()->role !== 'dept_head') {
                Log::error('Unauthorized access attempt to destroyAdvisorAssignment', ['user_id' => Auth::id()]);
                abort(403, 'Unauthorized');
            }

            $department = Auth::user()->assignedDepartment;
            if (!$department) {
                return response()->json(['error' => 'No department assigned.'], 400);
            }

            $assignment = AdvisorAssignment::where('department_id', $department->department_id)
                ->findOrFail($assignment_id);

            // Block deletion if advisor already submitted forms for this student
            $hasForms = \App\Models\Form::where('student_id', $assignment->student_id)
                ->where('advisor_id', $assignment->advisor_id)
                ->exists();
            if ($hasForms) {
                return redirect()->route('department-head.advisorsassign')
                    ->with('error', 'Cannot delete assignment: advisor has submitted forms for this student.');
            }

            $assignment->delete();

            Log::info('Advisor assignment deleted successfully', [
                'assignment_id' => $assignment_id,
                'user_id' => Auth::user()->user_id,
            ]);

            return redirect()->route('department-head.advisorsassign')->with('success', 'Assignment deleted successfully.');
        } catch (\Exception $e) {
            Log::error('Error in destroyAdvisorAssignment', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
                'user_id' => Auth::id(),
            ]);
            return redirect()->route('department-head.advisorsassign')->with('error', 'Failed to delete assignment: ' . $e->getMessage());
        }
    }

    public function trashed()
    {
        if (Auth::user()->role !== 'dept_head') {
            abort(403, 'Unauthorized');
        }

        $department = Auth::user()->assignedDepartment;
        if (!$department) {
            return Inertia::render('department-head/trashedusers', ['error' => 'No department assigned.']);
        }

        $trashedUsers = User::onlyTrashed()
            ->where('department_id', $department->department_id)
            ->whereIn('role', ['student', 'advisor'])
            ->get(['user_id', 'first_name', 'last_name', 'role', 'email', 'phone', 'gender', 'deleted_at']);

        return Inertia::render('department-head/trashedusers', [
            'department' => $department->only('department_id', 'name'),
            'trashedUsers' => $trashedUsers->map(fn($user) => [
                'user_id' => $user->user_id,
                'name' => $user->getNameAttribute(),
                'role' => $user->role,
                'email' => $user->email,
                'phone' => $user->phone,
                'gender' => $user->gender,
                'deleted_at' => $user->deleted_at ? $user->deleted_at->toDateTimeString() : null,
            ])->toArray(),
            'success' => session('success'),
            'error' => session('error'),
        ]);
    }

    public function acceptedApplications(Request $request)
    {
        if (Auth::user()->role !== 'dept_head') {
            abort(403, 'Unauthorized');
        }

        $department = Auth::user()->assignedDepartment;
        if (!$department) {
            return Inertia::render('department-head/accepted-applications', ['error' => 'No department assigned.']);
        }

        $query = \App\Models\Application::whereHas('student', function($q) use ($department) {
            $q->where('department_id', $department->department_id);
        })
        ->where('status', 'accepted') // Exclude completed applications (they have status 'completed')
        ->with([
            'student.user',
            'posting.company',
            'posting.supervisor',
            'feedbacks' => function($q) {
                $q->with('advisor');
            }
        ]);

        if ($request->search) {
            $query->whereHas('student.user', function($q) use ($request) {
                $q->where('name', 'like', "%{$request->search}%");
            })->orWhereHas('posting', function($q) use ($request) {
                $q->where('title', 'like', "%{$request->search}%");
            });
        }

        $sortBy = $request->sort_by ?? 'accepted_at';
        $sortDir = $request->sort_dir ?? 'desc';
        $query->orderBy($sortBy, $sortDir);

        $applications = $query->paginate(10)->withQueryString()->through(function($app) {
            return [
                'application_id' => $app->application_id,
                'student_name' => $app->student->user->name,
                'student_email' => $app->student->user->email,
                'posting_title' => $app->posting->title,
                'posting_type' => $app->posting->type,
                'company_name' => $app->posting->company->name,
                'company_email' => $app->posting->company->email,
                'supervisor_name' => $app->posting->supervisor ? $app->posting->supervisor->name : 'N/A',
                'supervisor_email' => $app->posting->supervisor ? $app->posting->supervisor->email : 'N/A',
                'advisor_feedback' => $app->feedbacks->first() ? [
                    'content' => $app->feedbacks->first()->content,
                    'rating' => $app->feedbacks->first()->rating,
                    'advisor_name' => $app->feedbacks->first()->advisor->name,
                    'created_at' => $app->feedbacks->first()->created_at->toDateTimeString(),
                ] : null,
                'accepted_at' => $app->accepted_at?->toDateTimeString(),
                'offer_expiration' => $app->offer_expiration?->toDateTimeString(),
            ];
        });

        return Inertia::render('department-head/accepted-applications', [
            'applications' => $applications,
            'filters' => $request->only(['search', 'sort_by', 'sort_dir']),
            'success' => session('success'),
            'error' => session('error'),
        ]);
    }

    public function restore($user_id)
    {
        if (Auth::user()->role !== 'dept_head') {
            abort(403, 'Unauthorized');
        }

        $department = Auth::user()->assignedDepartment;
        if (!$department) {
            return redirect()->route('department-head.trashedusers')->with('error', 'No department assigned.');
        }

        $user = User::onlyTrashed()
            ->where('department_id', $department->department_id)
            ->whereIn('role', ['student', 'advisor'])
            ->findOrFail($user_id);

        try {
            DB::transaction(function () use ($user) {
                $user->restore();
                if ($user->role === 'student') {
                    $student = Student::onlyTrashed()->where('user_id', $user->user_id)->first();
                    if ($student) {
                        $student->restore();
                    }
                }
            });

            return redirect()->route('department-head.trashedusers')->with('success', 'User restored successfully.');
        } catch (\Exception $e) {
            Log::error('Failed to restore user:', ['error' => $e->getMessage()]);
            return redirect()->route('department-head.trashedusers')->with('error', 'Failed to restore user: ' . $e->getMessage());
        }
    }

    public function deletePermanently($user_id)
    {
        if (Auth::user()->role !== 'dept_head') {
            abort(403, 'Unauthorized');
        }

        $department = Auth::user()->assignedDepartment;
        if (!$department) {
            return redirect()->route('department-head.trashedusers')->with('error', 'No department assigned.');
        }

        $user = User::onlyTrashed()
            ->where('department_id', $department->department_id)
            ->whereIn('role', ['student', 'advisor'])
            ->findOrFail($user_id);

        try {
            DB::transaction(function () use ($user) {
                if ($user->role === 'student') {
                    $student = Student::onlyTrashed()->where('user_id', $user->user_id)->first();
                    if ($student) {
                        $student->forceDelete();
                    }
                }
                $user->forceDelete();
            });

            return redirect()->route('department-head.trashedusers')->with('success', 'User deleted permanently.');
        } catch (\Exception $e) {
            Log::error('Failed to delete user permanently:', ['error' => $e->getMessage()]);
            return redirect()->route('department-head.trashedusers')->with('error', 'Failed to delete user permanently: ' . $e->getMessage());
        }
    }

    public function profileIndex(Request $request)
    {
        if (Auth::user()->role !== 'dept_head') {
            abort(403, 'Unauthorized');
        }

        $user = Auth::user();
        $department = $user->assignedDepartment;

        return Inertia::render('department-head/profile-index', [
            'user' => [
                'user_id' => $user->user_id,
                'first_name' => $user->first_name,
                'last_name' => $user->last_name,
                'email' => $user->email,
                'phone' => $user->phone,
                'username' => $user->username,
                'avatar' => $user->avatar,
                'gender' => $user->gender,
            ],
            'department' => $department ? [
                'department_id' => $department->department_id,
                'name' => $department->name,
                'description' => $department->description,
            ] : null,
            'success' => session('success'),
            'error' => session('error'),
        ]);
    }

    public function profile(Request $request)
    {
        if (Auth::user()->role !== 'dept_head') {
            abort(403, 'Unauthorized');
        }

        $user = Auth::user();
        $department = $user->assignedDepartment;

        return Inertia::render('department-head/profile', [
            'user' => [
                'user_id' => $user->user_id,
                'first_name' => $user->first_name,
                'last_name' => $user->last_name,
                'email' => $user->email,
                'phone' => $user->phone,
                'username' => $user->username,
                'avatar' => $user->avatar,
                'gender' => $user->gender,
            ],
            'department' => $department ? [
                'department_id' => $department->department_id,
                'name' => $department->name,
                'description' => $department->description,
            ] : null,
            'success' => session('success'),
            'error' => session('error'),
        ]);
    }

    public function updateProfile(Request $request)
    {
        if (Auth::user()->role !== 'dept_head') {
            abort(403, 'Unauthorized');
        }

        $user = Auth::user();

        $validated = $request->validate([
            'first_name' => 'required|string|max:100',
            'last_name' => 'required|string|max:100',
            'email' => 'required|string|email|max:255|unique:users,email,' . $user->user_id . ',user_id',
            'phone' => 'nullable|string|max:20',
            'username' => 'required|string|max:100|unique:users,username,' . $user->user_id . ',user_id',
            'profile_image' => 'nullable|image|max:2048',
        ]);

        try {
            $updateData = [
                'first_name' => $validated['first_name'],
                'last_name' => $validated['last_name'],
                'email' => $validated['email'],
                'phone' => $validated['phone'],
                'username' => $validated['username'],
            ];

            // Accept student-like key 'profile_image' and store into users.avatar
            if ($request->hasFile('profile_image')) {
                $avatarPath = $request->file('profile_image')->store('avatars', 'public');
                if (!empty($user->avatar)) {
                    Storage::disk('public')->delete($user->avatar);
                }
                $updateData['avatar'] = $avatarPath;
            }

            // Use query update to satisfy static analyzers and ensure persistence
            \App\Models\User::where('user_id', $user->user_id)->update($updateData);

            // Notify admin about profile update
            \App\Services\NotificationService::notifyAdminProfileUpdate($user, 'dept_head');

            Log::info('Department head profile updated', ['user_id' => $user->user_id]);

            return redirect()->route('department-head.profile.index')->with('success', 'Profile updated successfully.');
        } catch (\Exception $e) {
            Log::error('Failed to update department head profile:', [
                'user_id' => $user->user_id,
                'error' => $e->getMessage(),
            ]);
            return redirect()->back()->with('error', 'Failed to update profile: ' . $e->getMessage())->withInput();
        }
    }

    protected function buildDashboardPayload(Department $department): array
    {
        $students = Student::where('department_id', $department->department_id)
            ->with(['user', 'advisors'])
            ->get();

        $advisors = User::where('role', 'advisor')
            ->where('department_id', $department->department_id)
            ->with('assignedStudents')
            ->get();

        $studentStatusCounts = [
            'active' => $students->filter(fn ($student) => $student->user && $student->user->status === 'active')->count(),
            'inactive' => $students->filter(fn ($student) => $student->user && $student->user->status !== 'active')->count(),
        ];

        $studentsByYear = $students
            ->groupBy(fn ($student) => $student->year_of_study ?: 'Not set')
            ->map(fn ($group, $year) => [
                'year' => (string) $year,
                'count' => $group->count(),
            ])
            ->sortBy('year')
            ->values();

        $advisorStatusCounts = [
            'active' => $advisors->where('status', 'active')->count(),
            'inactive' => $advisors->where('status', '!=', 'active')->count(),
        ];

        $advisorLoad = $advisors
            ->map(fn ($advisor) => [
                'name' => $advisor->getNameAttribute(),
                'student_count' => $advisor->assignedStudents->count(),
            ])
            ->sortByDesc('student_count')
            ->values();

        $applicationQuery = Application::whereHas('student', function ($query) use ($department) {
            $query->where('department_id', $department->department_id);
        });

        $applicationStatuses = (clone $applicationQuery)
            ->select('status', DB::raw('COUNT(*) as total'))
            ->groupBy('status')
            ->pluck('total', 'status');

        $startPeriod = Carbon::now()->subMonths(5)->startOfMonth();
        $rawApplicationTrend = (clone $applicationQuery)
            ->where('created_at', '>=', $startPeriod)
            ->selectRaw("DATE_FORMAT(created_at, '%Y-%m') as period, status, COUNT(*) as total")
            ->groupBy('period', 'status')
            ->orderBy('period')
            ->get();

        $applicationTrend = collect(range(0, 5))->map(function ($index) use ($startPeriod, $rawApplicationTrend) {
            $period = $startPeriod->copy()->addMonths($index);
            $key = $period->format('Y-m');
            $dataset = $rawApplicationTrend->where('period', $key);

            return [
                'period' => $period->format('M'),
                'accepted' => (int) ($dataset->firstWhere('status', 'accepted')->total ?? 0),
                'pending' => (int) ($dataset->firstWhere('status', 'pending')->total ?? 0),
                'approved' => (int) ($dataset->firstWhere('status', 'approved')->total ?? 0),
                'rejected' => (int) ($dataset->firstWhere('status', 'rejected')->total ?? 0),
            ];
        });

        $studentIds = $students->pluck('student_id');

        $applicationLetters = ApplicationLetter::whereIn('student_id', $studentIds)
            ->select('status', DB::raw('COUNT(*) as total'))
            ->groupBy('status')
            ->pluck('total', 'status');

        $forms = Form::whereIn('student_id', $studentIds)
            ->select('status', DB::raw('COUNT(*) as total'))
            ->groupBy('status')
            ->pluck('total', 'status');

        $studentsWithLetters = ApplicationLetter::whereIn('student_id', $studentIds)
            ->distinct('student_id')
            ->count('student_id');

        $recentStudentActivity = $students
            ->sortByDesc(fn ($student) => $student->updated_at ?? $student->created_at)
            ->take(3)
            ->map(fn ($student) => [
                'type' => 'student',
                'title' => $student->getNameAttribute(),
                'description' => 'Student record updated',
                'timestamp' => optional($student->updated_at ?? $student->created_at)->toDateTimeString(),
            ]);

        $recentAdvisorActivity = $advisors
            ->sortByDesc(fn ($advisor) => $advisor->updated_at ?? $advisor->created_at)
            ->take(3)
            ->map(fn ($advisor) => [
                'type' => 'advisor',
                'title' => $advisor->getNameAttribute(),
                'description' => $advisor->assignedStudents->count() . ' assigned students',
                'timestamp' => optional($advisor->updated_at ?? $advisor->created_at)->toDateTimeString(),
            ]);

        $recentActivity = $recentStudentActivity
            ->concat($recentAdvisorActivity)
            ->filter(fn ($activity) => !empty($activity['timestamp']))
            ->sortByDesc('timestamp')
            ->values();

        return [
            'students' => $students->map(function ($student) {
                return [
                    'student_id' => $student->student_id,
                    'name' => $student->user->getNameAttribute(),
                    'cgpa' => $student->cgpa,
                    'year_of_study' => $student->year_of_study,
                    'university_id' => $student->university_id,
                    'advisors' => $student->advisors->map(fn($advisor) => [
                        'user_id' => $advisor->user_id,
                        'name' => $advisor->getNameAttribute(),
                    ]),
                    'status' => $student->user->status,
                    'gender' => $student->user->gender,
                ];
            })->toArray(),
            'advisors' => $advisors->map(function ($advisor) {
                return [
                    'user_id' => $advisor->user_id,
                    'name' => $advisor->getNameAttribute(),
                    'email' => $advisor->email,
                    'phone' => $advisor->phone,
                    'specialization' => $advisor->specialization,
                    'status' => $advisor->status,
                    'gender' => $advisor->gender,
                    'student_count' => $advisor->assignedStudents->count(),
                ];
            })->toArray(),
            'analytics' => [
                'students' => [
                    'total' => $students->count(),
                    'active' => $studentStatusCounts['active'],
                    'inactive' => $studentStatusCounts['inactive'],
                    'with_letters' => $studentsWithLetters,
                    'by_year' => $studentsByYear,
                ],
                'advisors' => [
                    'total' => $advisors->count(),
                    'active' => $advisorStatusCounts['active'],
                    'inactive' => $advisorStatusCounts['inactive'],
                    'load' => $advisorLoad,
                ],
                'applications' => [
                    'by_status' => collect(['pending', 'approved', 'accepted', 'rejected'])
                        ->map(fn ($status) => [
                            'status' => $status,
                            'count' => (int) ($applicationStatuses[$status] ?? 0),
                        ])->values(),
                    'trend' => $applicationTrend,
                ],
                'letters' => collect(['generated', 'sent', 'viewed', 'accepted'])
                    ->map(fn ($status) => [
                        'status' => $status,
                        'count' => (int) ($applicationLetters[$status] ?? 0),
                    ])->values(),
                'forms' => collect(['pending', 'submitted', 'reviewed', 'approved', 'rejected'])
                    ->map(fn ($status) => [
                        'status' => $status,
                        'count' => (int) ($forms[$status] ?? 0),
                    ])->values(),
                'recent_activity' => $recentActivity,
            ],
        ];
    }

    public function completedApplications(Request $request)
    {
        if (Auth::user()->role !== 'dept_head') {
            abort(403, 'Unauthorized');
        }

        $department = Auth::user()->assignedDepartment;
        if (!$department) {
            return Inertia::render('department-head/completed-applications', ['error' => 'No department assigned.']);
        }

        $query = Application::whereHas('student', fn($q) => $q->where('department_id', $department->department_id))
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
            'student_university_id' => $app->student->university_id,
            'posting_title' => $app->posting->title,
            'accepted_at' => $app->accepted_at ? $app->accepted_at->toDateTimeString() : null,
            'analytics_id' => $app->analytics ? $app->analytics->analytics_id : null,
            'analytics_submitted_at' => $app->analytics ? $app->analytics->submitted_at->toDateTimeString() : null,
            'advisor_score' => $app->analytics?->advisor_score,
            'advisor_score_out_of' => $app->analytics?->advisor_score_out_of,
            'dept_head_score' => $app->analytics?->dept_head_score,
            'dept_head_score_out_of' => $app->analytics?->dept_head_score_out_of,
            'dept_head_evaluation' => $app->analytics?->dept_head_evaluation,
            'final_score' => $app->analytics?->final_score,
        ]);

        return Inertia::render('department-head/completed-applications', [
            'applications' => $applications,
            'filters' => $request->only(['search', 'sort_by', 'sort_dir']),
            'success' => session('success'),
            'error' => session('error'),
        ]);
    }

    public function setDeptHeadScore(Request $request, $analytics_id)
    {
        if (Auth::user()->role !== 'dept_head') {
            abort(403, 'Unauthorized');
        }

        $validated = $request->validate([
            'score' => 'required|numeric|min:0',
            'score_out_of' => 'required|integer|min:1|max:100',
            'evaluation' => 'nullable|string|max:2000',
        ]);

        $department = Auth::user()->assignedDepartment;
        if (!$department) {
            return redirect()->back()->with('error', 'No department assigned.');
        }

        $analytics = InternshipAnalytics::where('analytics_id', $analytics_id)
            ->whereHas('student', fn($q) => $q->where('department_id', $department->department_id))
            ->with(['student.user'])
            ->firstOrFail();

        $deptScore = (float) $validated['score'];
        $deptScoreOutOf = (int) $validated['score_out_of'];
        
        // Validate score doesn't exceed out_of
        if ($deptScore > $deptScoreOutOf) {
            return redirect()->back()->with('error', 'Score cannot exceed the maximum value.');
        }

        $advisorScore = $analytics->advisor_score ?? 0;
        $advisorScoreOutOf = $analytics->advisor_score_out_of ?? 0;

        // Validate that out_of values sum to 100
        if ($advisorScoreOutOf > 0 && ($advisorScoreOutOf + $deptScoreOutOf) != 100) {
            return redirect()->back()->with('error', 'The sum of advisor and department head "out of" values must equal 100.');
        }

        // Final score is the sum of advisor + dept scores (their out_of values must total 100)
        $final = min(100, $advisorScore + $deptScore);

        $analytics->update([
            'dept_head_score' => $deptScore,
            'dept_head_score_out_of' => $deptScoreOutOf,
            'dept_head_evaluation' => $validated['evaluation'] ?? null,
            'final_score' => $final,
        ]);

        // Schedule student deactivation 30 days after final score is available (both scores are now set)
        if ($analytics->student && $analytics->student->user && $analytics->student->user->status === 'active') {
            $user = $analytics->student->user;
            // Final score is now complete since dept_head just set their score
            if (empty($user->account_deactivation_date)) {
                $deactivationDate = Carbon::now()->addDays(30)->toDateString();
                $user->account_deactivation_date = $deactivationDate;
                $user->save();
                NotificationService::notifyStudentAccountDeactivationWarning($user);
            }
        }

        return redirect()->back()->with('success', 'Jury evaluation saved.');
    }

    public function viewAnalytics($analytics_id)
    {
        if (Auth::user()->role !== 'dept_head') {
            abort(403, 'Unauthorized');
        }

        $department = Auth::user()->assignedDepartment;
        if (!$department) {
            abort(403, 'No department assigned.');
        }

        $analytics = InternshipAnalytics::where('analytics_id', $analytics_id)
            ->whereHas('student', fn($q) => $q->where('department_id', $department->department_id))
            ->with(['student.user', 'supervisor', 'posting', 'form'])
            ->firstOrFail();

        return Inertia::render('department-head/analytics-view', [
            'analytics' => [
                'analytics_id' => $analytics->analytics_id,
                'student_name' => $analytics->student->name,
                'student_email' => $analytics->student->user->email,
                'student_university_id' => $analytics->student->university_id,
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
}