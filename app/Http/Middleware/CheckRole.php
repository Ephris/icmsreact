<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Symfony\Component\HttpFoundation\Response;

class CheckRole
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     * @param  string  $role
     */
    public function handle(Request $request, Closure $next, string $role): Response
    {
        if (!Auth::check()) {
            return redirect()->route('login');
        }

        $user = Auth::user();
        
        // Map route prefixes to roles
        $roleMap = [
            'admin' => 'admin',
            'department-head' => 'dept_head',
            'faculty-advisor' => 'advisor',
            'company-admin' => 'company_admin',
            'student' => 'student',
            'company-supervisor' => 'supervisor',
            'coordinator' => 'coordinator',
        ];

        $expectedRole = $roleMap[$role] ?? $role;

        if ($user->role !== $expectedRole) {
            abort(403, 'Unauthorized access. You do not have permission to access this page.');
        }

        return $next($request);
    }
}
