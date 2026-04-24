<?php

namespace App\Console\Commands;

use App\Models\Application;
use App\Models\ApplicationLetter;
use App\Models\InternshipAnalytics;
use App\Models\Student;
use App\Models\User;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class DeactivateCompletedStudents extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'students:deactivate-completed';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Deactivate student accounts 30 days after final score is available';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $this->info('Starting deactivation of completed students...');

        // Deactivate students 30 days after final score is available
        $today = now()->toDateString();

        $completedApplications = Application::where('status', 'completed')
            ->with(['student.user', 'analytics'])
            ->get()
            ->filter(function($app) use ($today) {
                $student = $app->student ?? null;
                $user = $student->user ?? null;
                $analytics = $app->analytics ?? null;
                
                if (!$user || !$analytics || $user->status === 'inactive') {
                    return false;
                }
                
                // Check if final score is available (both advisor_score and dept_head_score are set)
                if (is_null($analytics->advisor_score) || is_null($analytics->dept_head_score)) {
                    return false;
                }
                
                // Check if deactivation date is set and has arrived
                if (!$user->account_deactivation_date) {
                    return false;
                }
                
                return $user->account_deactivation_date <= $today;
            });

        $deactivatedCount = 0;

        foreach ($completedApplications as $application) {
            $student = $application->student;
            $user = $student->user;

            // Skip if already deactivated
            if ($user->status === 'inactive') {
                continue;
            }

            try {
                DB::transaction(function () use ($user, $student) {
                    // Set deactivation date
                    $user->update([
                        'status' => 'inactive',
                        'account_deactivation_date' => now(),
                    ]);

                    // Deactivate all related assignments
                    \App\Models\SupervisorAssignment::where('student_id', $student->student_id)
                        ->update(['status' => 'inactive']);

                    \App\Models\AdvisorAssignment::where('student_id', $student->student_id)
                        ->update(['status' => 'inactive']);
                });

                $deactivatedCount++;
                $this->info("Deactivated student: {$user->name} (ID: {$user->user_id})");

                Log::info('Student account deactivated', [
                    'user_id' => $user->user_id,
                    'student_id' => $student->student_id,
                    'deactivation_date' => now()->toDateString(),
                ]);
            } catch (\Exception $e) {
                $this->error("Failed to deactivate student {$user->name}: {$e->getMessage()}");
                Log::error('Failed to deactivate student', [
                    'user_id' => $user->user_id,
                    'error' => $e->getMessage(),
                ]);
            }
        }

        $this->info("Deactivation complete. {$deactivatedCount} student(s) deactivated.");

        return Command::SUCCESS;
    }
}
