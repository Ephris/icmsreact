<?php
namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\HomeContent;
use Illuminate\Http\Request;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Inertia\Response;

class AuthenticatedSessionController extends Controller
{
    public function create(): Response
    {
        $homeContent = HomeContent::first();

        // If no HomeContent exists, create a default one
        if (!$homeContent) {
            $homeContent = HomeContent::create([
                'title' => 'Welcome to ICMS',
                'description' => 'Internship and Career Management System',
                'about_title' => 'About Us',
                'about_description' => 'Your gateway to internships and career opportunities',
            ]);
        }

        return Inertia::render('auth/login', [
            'status' => session('status'),
            'homeContent' => $homeContent,
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $request->validate([
            'email' => 'required|string|email',
            'password' => 'required|string',
        ]);

        if (Auth::attempt($request->only('email', 'password'), $request->boolean('remember'))) {
            $user = Auth::user();
            
            // Check if user is active
            if ($user->status === 'inactive') {
                // Allow deactivated students to view analytics page only
                if ($user->role === 'student') {
                    $student = \App\Models\Student::where('user_id', $user->user_id)->first();
                    $latestAnalytics = $student
                        ? \App\Models\InternshipAnalytics::where('student_id', $student->student_id)
                            ->whereNotNull('final_score')
                            ->orderByDesc('submitted_at')
                            ->first()
                        : null;
                    if ($latestAnalytics) {
                        return redirect()->route('student.analytics.view', ['analytics_id' => $latestAnalytics->analytics_id])
                            ->withErrors(['email' => 'Your account is deactivated. You can still view your analytics.']);
                    }
                }

                Auth::logout();
                $request->session()->invalidate();
                $request->session()->regenerateToken();
                
                return back()->withErrors([
                    'email' => 'Your account has been deactivated. Please contact your administrator for assistance.',
                ])->onlyInput('email');
            }
            
            $request->session()->regenerate();

            // Role-based post-login redirect
            switch ($user->role) {
                case 'student':
                    return redirect()->intended(route('student.index'));
                case 'company_admin':
                    return redirect()->intended(route('companyadmin.index'));
                case 'supervisor':
                    return redirect()->intended(route('company-supervisor.index'));
                case 'dept_head':
                    return redirect()->intended(route('department-head.index'));
                case 'advisor':
                    return redirect()->intended(route('faculty-advisor.index'));
                default:
                    return redirect()->intended(route('dashboard'));
            }
        }

        return back()->withErrors([
            'email' => 'The provided credentials do not match our records.',
        ])->onlyInput('email');
    }

    public function destroy(Request $request): RedirectResponse
    {
        Auth::logout();
        $request->session()->invalidate();
        $request->session()->regenerateToken();
        return redirect('/');
    }
}