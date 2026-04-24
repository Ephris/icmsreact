<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Support\Facades\Hash;
// use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // Create or update a super admin account. Change the email/password after seeding in production.
        User::updateOrCreate(
            ['username' => 'amboicmsadmin'],
            [
                'username' => 'amboicmsadmin',
                'name' => 'amboicmsadmin',
                'first_name' => null,
                'last_name' => null,
                'role' => 'admin',
                'email' => 'amboicmsadmin@gmail.com', // placeholder email
                'email_verified_at' => now(),
                'password' => Hash::make('password'), // specified password
            ]
        );

        // Seed completed application data for analytics demo
        $this->call(CompletedApplicationSeeder::class);
    }
}
