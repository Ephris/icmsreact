<?php

use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;
use App\Models\User;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote');

/**
 * Interactive command to create or update an admin user.
 * Usage: php artisan make:admin
 *
 * This command will prompt for email, username, name and password.
 * If password is left blank, a cryptographically secure random password is generated and shown once.
 */
Artisan::command('make:admin', function () {
    $this->comment('Interactive admin creation');

    // Email
    $email = $this->ask('Email (will be used as login)');
    while (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
        $email = $this->ask('Invalid email. Please enter a valid email');
    }

    // Username
    $username = $this->ask('Username (unique)');
    while (empty($username)) {
        $username = $this->ask('Username cannot be empty. Enter username');
    }

    // Name
    $name = $this->ask('Full name (optional)');

    // Password (secret)
    $password = $this->secret('Password (leave blank to generate a random secure password)');
    $generated = false;
    if (empty($password)) {
        $password = Str::random(16);
        $generated = true;
    } else {
        $confirm = $this->secret('Confirm Password');
        if ($confirm !== $password) {
            $this->error('Passwords do not match. Aborting.');
            return;
        }
    }

    if (! $this->confirm("Create admin user for {$email} with username {$username}?")) {
        $this->info('Aborted. No changes were made.');
        return;
    }

    // Create or update the user
    try {
        $user = User::updateOrCreate(
            ['email' => $email],
            [
                'username' => $username,
                'name' => $name ?: $email,
                'role' => 'admin',
                'email_verified_at' => now(),
                'password' => Hash::make($password),
            ]
        );

        $this->info("Admin user " . ($user->user_id ?? $user->id ?? '?') . " created/updated successfully.");
        if ($generated) {
            $this->line('Generated password: ' . $password);
            $this->line('Please copy it now; it will not be shown again.');
        }
    } catch (\Exception $e) {
        $this->error('Failed to create admin: ' . $e->getMessage());
    }
})->purpose('Create an administrator user interactively');
