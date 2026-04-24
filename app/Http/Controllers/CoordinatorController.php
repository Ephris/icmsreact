<?php

namespace App\Http\Controllers;

use App\Models\Department;
use App\Models\User;
use App\Models\Application;
use App\Models\ApplicationLetter;
use App\Models\Student;
use App\Models\InternshipAnalytics;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;
use Barryvdh\DomPDF\Facade\Pdf;
use App\Services\NotificationService;

class CoordinatorController extends Controller
{
    public function departments()
    {
        $departments = Department::all()->map(function ($dept) {
            $studentsCount = \App\Models\Student::where('department_id', $dept->department_id)->count();
            $activeStudents = Application::whereHas('student', function ($q) use ($dept) {
                $q->where('department_id', $dept->department_id);
            })->where('status', 'accepted')->count();
            $pendingApplications = Application::whereHas('student', function ($q) use ($dept) {
                $q->where('department_id', $dept->department_id);
            })->where('status', 'pending')->count();
            
            // Get advisors count for this department
            $advisorsCount = User::where('role', 'advisor')
                ->where('department_id', $dept->department_id)
                ->count();

            return [
                'department_id' => $dept->department_id,
                'name' => $dept->name,
                'code' => $dept->code,
                'students_count' => $studentsCount,
                'active_students' => $activeStudents,
                'pending_applications' => $pendingApplications,
                'advisors_count' => $advisorsCount,
            ];
        });

        return Inertia::render('coordinator/departments', compact('departments'));
    }

    public function letters()
    {
        $students = \App\Models\Student::with('user')->get();
        return Inertia::render('coordinator/letters', compact('students'));
    }

    public function departmentStudents($departmentId)
    {
        $department = Department::findOrFail($departmentId);
        
        // Get advisors for this department
        $advisors = User::where('role', 'advisor')
            ->where('department_id', $departmentId)
            ->with(['assignedStudents' => function($query) {
                $query->with('user');
            }])
            ->get()
            ->map(function($advisor) {
                $acceptedAppsCount = Application::whereHas('student', function($q) use ($advisor) {
                    $q->whereHas('advisorAssignments', function($aq) use ($advisor) {
                        $aq->where('advisor_id', $advisor->user_id);
                    });
                })->where('status', 'accepted')->count();
                
                return [
                    'user_id' => $advisor->user_id,
                    'name' => $advisor->getNameAttribute(),
                    'email' => $advisor->email,
                    'phone' => $advisor->phone,
                    'specialization' => $advisor->specialization,
                    'assigned_students_count' => $advisor->assignedStudents->count(),
                    'accepted_applications_count' => $acceptedAppsCount,
                    'assigned_students' => $advisor->assignedStudents->map(function($student) {
                        return [
                            'student_id' => $student->student_id,
                            'name' => $student->user->getNameAttribute(),
                        ];
                    }),
                ];
            });
        
        $students = \App\Models\Student::with([
            'user',
            'applications' => function ($query) {
                // Include both accepted and completed applications so coordinator sees completed status correctly
                $query->whereIn('status', ['accepted', 'completed'])
                    ->with(['posting.company', 'posting.supervisor']);
            },
        ])->where('department_id', $departmentId)->get()->map(function($student) {
            // Get application letter directly from the student, not from application
            $applicationLetter = ApplicationLetter::where('student_id', $student->student_id)->first();
            
            return [
                'student_id' => $student->student_id,
                'user' => [
                    'first_name' => $student->user->first_name,
                    'last_name' => $student->user->last_name,
                    'email' => $student->user->email,
                ],
                'year_of_study' => $student->year_of_study,
                'cgpa' => $student->cgpa,
                'applications' => $student->applications->map(function($app) use ($applicationLetter) {
                    return [
                        'application_id' => $app->application_id,
                        'status' => $app->status,
                        'posting' => [
                            'title' => $app->posting->title,
                            'company' => [
                                'name' => $app->posting->company->name,
                                'location' => $app->posting->company->location ?? 'N/A',
                            ],
                        ],
                        'application_letter' => $applicationLetter ? [
                            'letter_id' => $applicationLetter->letter_id,
                            'ref_number' => $applicationLetter->ref_number,
                            'status' => $applicationLetter->status,
                            'file_path' => $applicationLetter->file_path,
                            'start_date' => $applicationLetter->start_date->toDateString(),
                            'end_date' => $applicationLetter->end_date->toDateString(),
                        ] : null,
                    ];
                }),
            ];
        });

        return Inertia::render('coordinator/department-students', compact('department', 'students', 'advisors'));
    }

    public function applicationLettersIndex()
    {
        $letters = ApplicationLetter::with(['department', 'student.user', 'generatedBy'])
            ->orderBy('created_at', 'desc')
            ->get()
            ->map(function ($letter) {
                return [
                    'letter_id' => $letter->letter_id,
                    'department_id' => $letter->department_id,
                    'department_name' => $letter->department->name,
                    'ref_number' => $letter->ref_number,
                    'start_date' => $letter->start_date->toDateString(),
                    'end_date' => $letter->end_date->toDateString(),
                    'status' => $letter->status,
                    'sent_at' => $letter->sent_at ? $letter->sent_at->toDateTimeString() : null,
                    'viewed_at' => $letter->viewed_at ? $letter->viewed_at->toDateTimeString() : null,
                    'created_at' => $letter->created_at->toDateTimeString(),
                    'student' => [
                        'student_id' => $letter->student->student_id,
                        'user' => [
                            'first_name' => $letter->student->user->first_name,
                            'last_name' => $letter->student->user->last_name,
                        ],
                    ],
                    'generatedBy' => [
                        'first_name' => $letter->generatedBy->first_name,
                        'last_name' => $letter->generatedBy->last_name,
                    ],
                ];
            })
            ->groupBy('department_name');

        return Inertia::render('coordinator/application-letters-index', [
            'lettersByDepartment' => $letters,
        ]);
    }

    public function applicationLettersGenerate()
    {
        $departments = Department::with(['students' => function($query) {
            $query->with('user')->with(['applicationLetter' => function($q) {
                $q->select('letter_id', 'student_id', 'status');
            }]);
        }])->get()->map(function($dept) {
            // Separate students with and without letters
            $studentsWithoutLetters = $dept->students->filter(function($student) {
                return !$student->applicationLetter;
            });
            $studentsWithLetters = $dept->students->filter(function($student) {
                return $student->applicationLetter;
            });
            
            return [
                'department_id' => $dept->department_id,
                'name' => $dept->name,
                'code' => $dept->code,
                'students' => $studentsWithoutLetters->map(function($student) {
                    return [
                        'student_id' => $student->student_id,
                        'user' => [
                            'first_name' => $student->user->first_name,
                            'last_name' => $student->user->last_name,
                        ],
                        'year_of_study' => $student->year_of_study,
                    ];
                })->values(),
                'has_existing_letters' => $studentsWithLetters->count() > 0,
                'students_with_letters_count' => $studentsWithLetters->count(),
            ];
        });

        return Inertia::render('coordinator/application-letters-generate', [
            'departments' => $departments,
        ]);
    }

    public function generateApplicationLetters(Request $request)
    {
        $request->validate([
            'department_id' => 'required|exists:departments,department_id',
            'start_date' => 'required|date',
            'end_date' => 'required|date|after:start_date',
            'student_ids' => 'nullable|array',
            'student_ids.*' => 'exists:students,student_id',
        ]);

        $department = Department::findOrFail($request->department_id);

        // Get students to process
        $query = Student::with('user')->where('department_id', $request->department_id);
        
        // If specific student IDs provided, only process those
        if ($request->has('student_ids') && is_array($request->student_ids) && count($request->student_ids) > 0) {
            $query->whereIn('student_id', $request->student_ids);
        }
        
        $students = $query->get();
        
        // Filter out students who already have letters
        $students = $students->filter(function($student) {
            return !ApplicationLetter::where('student_id', $student->student_id)->exists();
        });

        if ($students->isEmpty()) {
            return redirect()->back()->with('error', 'No students found without application letters in the selected department.');
        }

        try {
            DB::transaction(function () use ($students, $department, $request) {
                foreach ($students as $student) {
                    // Check if student already has a letter (double-check)
                    if (ApplicationLetter::where('student_id', $student->student_id)->exists()) {
                        continue; // Skip if letter already exists
                    }
                    
                    // Generate unique reference number
                    $refNumber = 'UIL/' . str_pad(rand(1, 9999), 4, '0', STR_PAD_LEFT) . '/' . date('y');

                    // Generate PDF
                    $pdf = $this->generateApplicationLetterPDF($student, $department, $request->start_date, $request->end_date, $refNumber);

                    // Save PDF to storage
                    $filename = 'application_letter_' . $student->student_id . '_' . time() . '.pdf';
                    $filePath = 'application_letters/' . $filename;
                    Storage::disk('public')->put($filePath, $pdf->output());

                    // Create database record
                    ApplicationLetter::create([
                        'department_id' => $department->department_id,
                        'student_id' => $student->student_id,
                        'ref_number' => $refNumber,
                        'start_date' => $request->start_date,
                        'end_date' => $request->end_date,
                        'file_path' => $filePath,
                        'status' => 'generated',
                        'generated_by' => Auth::id(),
                    ]);
                }
            });

            return redirect()->route('coordinator.application-letters.index')
                ->with('success', 'Application letters generated successfully for ' . $students->count() . ' student(s).');
        } catch (\Exception $e) {
            Log::error('Failed to generate application letters:', [
                'department_id' => $request->department_id,
                'error' => $e->getMessage(),
            ]);
            return redirect()->back()->with('error', 'Failed to generate application letters: ' . $e->getMessage());
        }
    }

    public function sendApplicationLetters(Request $request)
    {
        $request->validate([
            'department_id' => 'required|exists:departments,department_id',
        ]);

        $department = Department::findOrFail($request->department_id);
        $letters = ApplicationLetter::where('department_id', $request->department_id)
            ->where('status', 'generated')
            ->with('student.user')
            ->get();

        if ($letters->isEmpty()) {
            return redirect()->back()->with('error', 'No generated letters found for this department.');
        }

        try {
            DB::transaction(function () use ($letters) {
                foreach ($letters as $letter) {
                    $letter->update([
                        'status' => 'sent',
                        'sent_at' => now(),
                    ]);
                    // Notify student about sent letter
                    if ($letter->student && $letter->student->user) {
                        \App\Services\NotificationService::notifyStudentApplicationLetterStatus(
                            $letter->student->user,
                            'sent',
                            $letter->ref_number
                        );
                    }
                }
            });

            return redirect()->route('coordinator.application-letters.index')
                ->with('success', 'Application letters sent successfully to ' . $letters->count() . ' students.');
        } catch (\Exception $e) {
            Log::error('Failed to send application letters:', [
                'department_id' => $request->department_id,
                'error' => $e->getMessage(),
            ]);
            return redirect()->back()->with('error', 'Failed to send application letters: ' . $e->getMessage());
        }
    }

    public function sendSingleApplicationLetter($letterId)
    {
        $letter = ApplicationLetter::with('student.user')->findOrFail($letterId);

        if ($letter->status !== 'generated') {
            return redirect()->back()->with('error', 'Only generated letters can be sent.');
        }

        try {
            DB::transaction(function () use ($letter) {
                $letter->update([
                    'status' => 'sent',
                    'sent_at' => now(),
                ]);

                // Notify student about sent letter
                if ($letter->student && $letter->student->user) {
                    NotificationService::notifyStudentApplicationLetterStatus(
                        $letter->student->user,
                        'sent',
                        $letter->ref_number
                    );
                }
            });

            return redirect()->back()->with('success', 'Application letter sent successfully.');
        } catch (\Exception $e) {
            Log::error('Failed to send single application letter:', [
                'letter_id' => $letterId,
                'error' => $e->getMessage(),
            ]);
            return redirect()->back()->with('error', 'Failed to send application letter: ' . $e->getMessage());
        }
    }

    public function viewApplicationLetter($letterId)
    {
        $letter = ApplicationLetter::with(['department', 'student.user', 'generatedBy'])
            ->findOrFail($letterId);

        return response()->file(Storage::disk('public')->path($letter->file_path));
    }

    public function downloadApplicationLetter($letterId)
    {
        $letter = ApplicationLetter::with(['student.user'])
            ->findOrFail($letterId);

        return response()->download(Storage::disk('public')->path($letter->file_path));
    }

    public function approveApplicationLetter(Request $request, $letterId)
    {
        $request->validate([
            'status' => 'required|in:approved,rejected',
        ]);

        $letter = ApplicationLetter::findOrFail($letterId);

        try {
            $letter->update([
                'status' => $request->status,
            ]);

            // Notify student about letter approval/rejection
            $student = Student::find($letter->student_id);
            if ($student) {
                NotificationService::notifyStudentApplicationLetterStatus($student->user, $request->status, $letter->ref_number);

                // Notify coordinators about approved letters by company admin
                if ($request->status === 'approved') {
                    NotificationService::notifyCoordinatorLetterApproved(
                        $student->user->name,
                        $letter->ref_number,
                        (string) $letter->letter_id
                    );
                }
            }

            Log::info('Application letter status updated', [
                'letter_id' => $letterId,
                'status' => $request->status,
                'coordinator_id' => Auth::id(),
            ]);

            return redirect()->back()->with('success', 'Application letter ' . $request->status . ' successfully.');
        } catch (\Exception $e) {
            Log::error('Failed to update application letter status:', [
                'letter_id' => $letterId,
                'error' => $e->getMessage(),
            ]);
            return redirect()->back()->with('error', 'Failed to update letter status: ' . $e->getMessage());
        }
    }

    private function generateApplicationLetterPDF($student, $department, $startDate, $endDate, $refNumber)
    {
        $data = [
            'student' => $student,
            'department' => $department,
            'startDate' => $startDate,
            'endDate' => $endDate,
            'refNumber' => $refNumber,
            'currentDate' => now()->format('d/m/Y'),
            'universityName' => 'Ambo University',
            'campusName' => 'Hachaalu Hundessa Campus',
            'officeName' => 'Office of University Industry Linkage Coordinator',
            'poBox' => 'P.O. Box 19',
            'city' => 'Ambo, Ethiopia',
            'phone' => '+251-011-8-76-62-14',
            'website' => 'www.ambou.edu.et',
        ];

        return Pdf::loadView('pdf.application-letter', $data)
            ->setPaper('A4', 'portrait');
    }

    public function generateLetter(Request $request)
    {
        $request->validate([
            'type' => 'required|string|in:acceptance,completion',
            'student_id' => 'required|integer',
        ]);

        // Find student and application
        $student = \App\Models\Student::with('user')->findOrFail($request->student_id);
        $application = Application::where('student_id', $request->student_id)->first();

        // For now, return a simple text response since DomPDF may not be installed
        $content = "Letter Type: " . ucfirst($request->type) . "\n";
        $content .= "Student: " . $student->user->name . "\n";
        $content .= "Date: " . now()->format('Y-m-d') . "\n";

        if ($request->type === 'acceptance') {
            $content .= "Congratulations! Your application has been accepted.\n";
        } else {
            $content .= "Congratulations on completing your internship.\n";
        }

        return response($content, 200, [
            'Content-Type' => 'text/plain',
            'Content-Disposition' => 'attachment; filename="letter_' . $request->type . '_' . $student->user->name . '.txt"',
        ]);
    }

    public function profileIndex(Request $request)
    {
        if (Auth::user()->role !== 'coordinator') {
            abort(403, 'Unauthorized');
        }

        $user = Auth::user();

        return Inertia::render('coordinator/profile-index', [
            'user' => [
                'user_id' => $user->user_id,
                'first_name' => $user->first_name,
                'last_name' => $user->last_name,
                'email' => $user->email,
                'phone' => $user->phone,
                'username' => $user->username,
                'avatar' => $user->avatar,
            ],
            'success' => session('success'),
            'error' => session('error'),
        ]);
    }

    public function profile(Request $request)
    {
        if (Auth::user()->role !== 'coordinator') {
            abort(403, 'Unauthorized');
        }

        $user = Auth::user();

        return Inertia::render('coordinator/profile', [
            'user' => [
                'user_id' => $user->user_id,
                'first_name' => $user->first_name,
                'last_name' => $user->last_name,
                'email' => $user->email,
                'phone' => $user->phone,
                'username' => $user->username,
                'avatar' => $user->avatar,
            ],
            'success' => session('success'),
            'error' => session('error'),
        ]);
    }

    public function updateProfile(Request $request)
    {
        if (Auth::user()->role !== 'coordinator') {
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

            // Handle profile image upload
            if ($request->hasFile('profile_image')) {
                $avatarPath = $request->file('profile_image')->store('avatars', 'public');
                if (!empty($user->avatar)) {
                    Storage::disk('public')->delete($user->avatar);
                }
                $updateData['avatar'] = $avatarPath;
            }

            DB::table('users')->where('user_id', $user->user_id)->update($updateData);

            // Notify admin about profile update
            \App\Services\NotificationService::notifyAdminProfileUpdate($user, 'coordinator');

            Log::info('Coordinator profile updated', ['user_id' => $user->user_id]);

            return redirect()->route('coordinator.profile.index')->with('success', 'Profile updated successfully.');
        } catch (\Exception $e) {
            Log::error('Failed to update coordinator profile:', [
                'user_id' => $user->user_id,
                'error' => $e->getMessage(),
            ]);
            return redirect()->back()->with('error', 'Failed to update profile: ' . $e->getMessage())->withInput();
        }
    }

    public function completedStudents(Request $request)
    {
        if (Auth::user()->role !== 'coordinator') {
            abort(403, 'Unauthorized');
        }

        $query = Application::where('status', 'completed')
            ->with(['student.user', 'student.department', 'posting', 'analytics']);

        if ($request->department_id) {
            $query->whereHas('student', fn($q) => $q->where('department_id', $request->department_id));
        }

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
            'year_of_study' => $app->student->year_of_study,
            'department_name' => $app->student->department->name,
            'posting_title' => $app->posting->title,
            'company_name' => $app->posting->company->name ?? 'N/A',
            'accepted_at' => $app->accepted_at ? $app->accepted_at->toDateTimeString() : null,
            'analytics_id' => $app->analytics ? $app->analytics->analytics_id : null,
            'analytics_submitted_at' => $app->analytics ? $app->analytics->submitted_at->toDateTimeString() : null,
            'advisor_score' => $app->analytics?->advisor_score,
            'dept_head_score' => $app->analytics?->dept_head_score,
            'final_score' => $app->analytics?->final_score,
        ]);

        $departments = Department::all()->map(fn($dept) => [
            'department_id' => $dept->department_id,
            'name' => $dept->name,
        ]);

        return Inertia::render('coordinator/completed-students', [
            'applications' => $applications,
            'departments' => $departments,
            'filters' => $request->only(['department_id', 'search', 'sort_by', 'sort_dir']),
            'success' => session('success'),
            'error' => session('error'),
        ]);
    }
}
