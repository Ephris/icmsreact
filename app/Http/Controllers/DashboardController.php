<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\Department;
use App\Models\Company;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class DashboardController extends Controller
{
    public function index(Request $request)
    {
        $user = $request->user();

        switch ($user->role) {
            case 'admin':
                $analytics = [
                    'users' => User::count(),
                    'departments' => Department::count(),
                    'companies' => Company::count(),
                ];
                // Build 30-day trend series for charts
                $days = collect(range(0, 29))->map(fn ($i) => now()->subDays(29 - $i)->startOfDay());
                $trend = $days->map(function ($day) {
                    $end = (clone $day)->endOfDay();
                    return [
                        'day' => $day->format('D'),
                        'users' => User::whereBetween('created_at', [$day, $end])->count(),
                        'departments' => Department::whereBetween('created_at', [$day, $end])->count(),
                        'companies' => Company::whereBetween('created_at', [$day, $end])->count(),
                    ];
                })->values();

                return Inertia::render('admin/dashboard', [
                    'analytics' => $analytics,
                    'trend' => $trend,
                ]);
            case 'coordinator':
                // Get coordinator statistics
                $departments = \App\Models\Department::count();
                $totalStudents = \App\Models\Student::count();
                $studentsByDepartment = \App\Models\Student::select('department_id', DB::raw('count(*) as count'))
                    ->groupBy('department_id')
                    ->with('department')
                    ->get()
                    ->map(function($item) {
                        return [
                            'department_name' => $item->department->name ?? 'Unknown',
                            'count' => $item->count,
                        ];
                    });
                
                $applicationLetters = \App\Models\ApplicationLetter::count();
                $applicationLettersByStatus = \App\Models\ApplicationLetter::select('status', DB::raw('count(*) as count'))
                    ->groupBy('status')
                    ->get()
                    ->pluck('count', 'status');
                
                $acceptedApplications = \App\Models\Application::where('status', 'accepted')->count();
                $pendingApplications = \App\Models\Application::where('status', 'pending')->count();
                
                // Build 30-day trend for application letters
                $days = collect(range(0, 29))->map(fn ($i) => now()->subDays(29 - $i)->startOfDay());
                $letterTrend = $days->map(function ($day) {
                    $end = (clone $day)->endOfDay();
                    return [
                        'day' => $day->format('D'),
                        'letters' => \App\Models\ApplicationLetter::whereBetween('created_at', [$day, $end])->count(),
                    ];
                })->values();
                
                $analytics = [
                    'departments' => $departments,
                    'total_students' => $totalStudents,
                    'students_by_department' => $studentsByDepartment,
                    'application_letters' => $applicationLetters,
                    'application_letters_by_status' => $applicationLettersByStatus,
                    'accepted_applications' => $acceptedApplications,
                    'pending_applications' => $pendingApplications,
                    'letter_trend' => $letterTrend,
                ];
                
                return Inertia::render('coordinator/dashboard', compact('analytics'));
            case 'dept_head':
                return redirect()->route('department-head.index');
            case 'company_admin':
                return redirect()->route('companyadmin.index');
            case 'advisor':
                return redirect()->route('faculty-advisor.index');
            case 'supervisor':
                return redirect()->route('company-supervisor.index');
            case 'student':
                return redirect()->route('student.index');
            default:
                return Inertia::render('dashboard'); // fallback
        }
    }
}