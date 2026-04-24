<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Symfony\Component\HttpFoundation\Response;

class CheckUserStatus
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        if (Auth::check()) {
            $user = Auth::user();
            
            // Check if user is inactive
            if ($user->status === 'inactive') {
                // Allow deactivated students to view analytics-only pages
                if ($user->role === 'student') {
                    $path = trim($request->path(), '/');
                    $isAnalyticsView = str_starts_with($path, 'student/analytics');
                    if ($isAnalyticsView) {
                        return $next($request);
                    }
                }

                Auth::logout();
                $request->session()->invalidate();
                $request->session()->regenerateToken();
                
                return redirect()->route('login')->withErrors([
                    'email' => 'Your account has been deactivated. Please contact your administrator for assistance. If you are a student, you can still view your analytics.',
                ]);
            }
        }

        return $next($request);
    }
}