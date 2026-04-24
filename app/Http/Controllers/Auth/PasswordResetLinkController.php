<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\HomeContent;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Password;
use Inertia\Inertia;
use Inertia\Response;

class PasswordResetLinkController extends Controller
{
    /**
     * Show the password reset link request page.
     */
    public function create(Request $request): Response
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

        return Inertia::render('auth/forgot-password', [
            'status' => $request->session()->get('status'),
            'homeContent' => $homeContent,
        ]);
    }

    /**
     * Handle an incoming password reset link request.
     *
     * @throws \Illuminate\Validation\ValidationException
     */
    public function store(Request $request): RedirectResponse
    {
        $request->validate([
            'email' => 'required|email',
        ]);

        // Check if email exists in the database
        $user = User::where('email', $request->email)->first();

        if (!$user) {
            return back()->withErrors(['email' => 'No account found with this email address.']);
        }

        Password::sendResetLink(
            $request->only('email')
        );

        return back()->with('status', __('A reset link has been sent to your email address.'));
    }
}
