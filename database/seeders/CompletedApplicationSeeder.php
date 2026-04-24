<?php

namespace Database\Seeders;

use App\Models\AdvisorAssignment;
use App\Models\Application;
use App\Models\ApplicationLetter;
use App\Models\Company;
use App\Models\CompanyAdminAssignment;
use App\Models\CompanySupervisorAssignment;
use App\Models\Department;
use App\Models\DepartmentHeadAssignment;
use App\Models\Posting;
use App\Models\Student;
use App\Models\SupervisorAssignment;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;

class CompletedApplicationSeeder extends Seeder
{
    /**
     * Rollback the seeded data by deleting records created by this seeder.
     */
    public function rollback(): void
    {
        DB::transaction(function () {
            // Find the student user by email
            $studentUser = User::where('email', 'student.math@gmail.com')->first();
            if ($studentUser) {
                $student = Student::where('user_id', $studentUser->user_id)->first();
                
                if ($student) {
                    // Delete related records
                    Application::where('student_id', $student->student_id)->delete();
                    ApplicationLetter::where('student_id', $student->student_id)->delete();
                    SupervisorAssignment::where('student_id', $student->student_id)->delete();
                    AdvisorAssignment::where('student_id', $student->student_id)->delete();
                    
                    // Reset accepted_application_id
                    $student->update(['accepted_application_id' => null]);
                    $student->delete();
                }
                
                $studentUser->delete();
            }

            // Delete company admin
            $companyAdmin = User::where('email', 'companyadmin.demo@gmail.com')->first();
            if ($companyAdmin) {
                CompanyAdminAssignment::where('user_id', $companyAdmin->user_id)->delete();
                $companyAdmin->delete();
            }

            // Delete supervisor
            $supervisor = User::where('email', 'supervisor.demo@gmail.com')->first();
            if ($supervisor) {
                CompanySupervisorAssignment::where('supervisor_id', $supervisor->user_id)->delete();
                $supervisor->delete();
            }

            // Delete advisor
            $advisor = User::where('email', 'advisor.math@gmail.com')->first();
            if ($advisor) {
                AdvisorAssignment::where('advisor_id', $advisor->user_id)->delete();
                $advisor->delete();
            }

            // Delete department head
            $deptHead = User::where('email', 'depthead.math@gmail.com')->first();
            if ($deptHead) {
                DepartmentHeadAssignment::where('user_id', $deptHead->user_id)->delete();
                $deptHead->delete();
            }

            // Delete company and its postings
            $company = Company::where('name', 'Demo Tech Company')->first();
            if ($company) {
                Posting::where('company_id', $company->company_id)->delete();
                $company->delete();
            }

            // Delete department (only if no other records depend on it)
            $department = Department::where('code', 'MATH')->first();
            if ($department) {
                // Check if department has other users/students
                $hasOtherRecords = User::where('department_id', $department->department_id)
                    ->orWhereHas('student', function($q) use ($department) {
                        $q->where('department_id', $department->department_id);
                    })
                    ->exists();
                
                if (!$hasOtherRecords) {
                    $department->delete();
                }
            }

            if (method_exists($this, 'command') && $this->command) {
                $this->command->info('Completed application seeder data rolled back successfully!');
            }
        });
    }

    /**
     * Seed the application's database with completed application data for analytics demo.
     */
    public function run(): void
    {
        DB::transaction(function () {
            // Calculate dates
            $startDate = now()->subDays(30); // 30 days before today
            $endDate = now(); // Today
            $applicationDeadline = now()->subDays(60); // 60 days ago
            $acceptedAt = now()->subDays(25); // 25 days ago
            $submittedAt = now()->subDays(30); // 30 days ago
            $assignedAt = now()->subDays(25); // 25 days ago
            $advisorAssignedAt = now()->subDays(30); // 30 days ago

            // Step 1: Find existing coordinator
            $coordinator = User::where('role', 'coordinator')->first();
            if (!$coordinator) {
                throw new \Exception('No coordinator found in the system. System must have at least one coordinator.');
            }

            // Step 2: Create or get Mathematics Department
            $department = Department::updateOrCreate(
                ['code' => 'MATH'],
                [
                    'name' => 'Mathematics',
                    'code' => 'MATH',
                    'faculty' => 'Science',
                ]
            );

            // Step 3: Create Department Head User
            $deptHead = User::updateOrCreate(
                ['email' => 'depthead.math@gmail.com'],
                [
                    'username' => 'dept_head_math',
                    'name' => 'Department Head',
                    'first_name' => 'Department',
                    'last_name' => 'Head',
                    'email' => 'depthead.math@gmail.com',
                    'role' => 'dept_head',
                    'department_id' => $department->department_id,
                    'password' => Hash::make('password'),
                    'email_verified_at' => now(),
                    'status' => 'active',
                ]
            );

            // Step 4: Create DepartmentHeadAssignment
            DepartmentHeadAssignment::updateOrCreate(
                [
                    'department_id' => $department->department_id,
                    'user_id' => $deptHead->user_id,
                ],
                [
                    'department_id' => $department->department_id,
                    'user_id' => $deptHead->user_id,
                ]
            );

            // Step 5: Create Student User
            $studentUser = User::updateOrCreate(
                ['email' => 'student.math@gmail.com'],
                [
                    'username' => 'student_math_001',
                    'name' => 'Demo Student',
                    'first_name' => 'Demo',
                    'last_name' => 'Student',
                    'email' => 'student.math@gmail.com',
                    'role' => 'student',
                    'department_id' => $department->department_id,
                    'password' => Hash::make('password'),
                    'email_verified_at' => now(),
                    'status' => 'active',
                ]
            );

            // Step 6: Create Student Record
            $student = Student::updateOrCreate(
                ['user_id' => $studentUser->user_id],
                [
                    'user_id' => $studentUser->user_id,
                    'department_id' => $department->department_id,
                    'first_name' => 'Demo',
                    'last_name' => 'Student',
                    'university_id' => 'UGR/12345/11',
                    'cgpa' => 3.5,
                    'year_of_study' => 4,
                ]
            );

            // Step 7: Create Company Admin User
            $companyAdmin = User::updateOrCreate(
                ['email' => 'companyadmin.demo@gmail.com'],
                [
                    'username' => 'company_admin_demo',
                    'name' => 'Company Admin',
                    'first_name' => 'Company',
                    'last_name' => 'Admin',
                    'email' => 'companyadmin.demo@gmail.com',
                    'role' => 'company_admin',
                    'password' => Hash::make('password'),
                    'email_verified_at' => now(),
                    'status' => 'active',
                ]
            );

            // Step 8: Create Supervisor User
            $supervisor = User::updateOrCreate(
                ['email' => 'supervisor.demo@gmail.com'],
                [
                    'username' => 'supervisor_demo',
                    'name' => 'Company Supervisor',
                    'first_name' => 'Company',
                    'last_name' => 'Supervisor',
                    'email' => 'supervisor.demo@gmail.com',
                    'role' => 'supervisor',
                    'password' => Hash::make('password'),
                    'email_verified_at' => now(),
                    'status' => 'active',
                ]
            );

            // Step 9: Create Advisor User
            $advisor = User::updateOrCreate(
                ['email' => 'advisor.math@gmail.com'],
                [
                    'username' => 'advisor_math_001',
                    'name' => 'Faculty Advisor',
                    'first_name' => 'Faculty',
                    'last_name' => 'Advisor',
                    'email' => 'advisor.math@gmail.com',
                    'role' => 'advisor',
                    'department_id' => $department->department_id,
                    'password' => Hash::make('password'),
                    'email_verified_at' => now(),
                    'status' => 'active',
                ]
            );

            // Step 10: Create Company
            $company = Company::updateOrCreate(
                ['name' => 'Demo Tech Company'],
                [
                    'name' => 'Demo Tech Company',
                    'industry' => 'Technology',
                    'location' => 'Addis Ababa',
                    'status' => 'approved',
                ]
            );

            // Step 11: Create Company Assignments
            CompanyAdminAssignment::updateOrCreate(
                [
                    'company_id' => $company->company_id,
                    'user_id' => $companyAdmin->user_id,
                ],
                [
                    'company_id' => $company->company_id,
                    'user_id' => $companyAdmin->user_id,
                ]
            );

            CompanySupervisorAssignment::updateOrCreate(
                [
                    'company_id' => $company->company_id,
                    'supervisor_id' => $supervisor->user_id,
                ],
                [
                    'company_id' => $company->company_id,
                    'supervisor_id' => $supervisor->user_id,
                    'assigned_at' => $assignedAt,
                    'status' => 'active',
                ]
            );

            // Step 12: Create Posting
            $posting = Posting::updateOrCreate(
                [
                    'company_id' => $company->company_id,
                    'title' => 'Software Development Internship',
                ],
                [
                    'company_id' => $company->company_id,
                    'supervisor_id' => $supervisor->user_id,
                    'title' => 'Software Development Internship',
                    'description' => 'A comprehensive software development internship program.',
                    'type' => 'internship',
                    'industry' => 'Technology',
                    'location' => 'Addis Ababa',
                    'salary_range' => 'Competitive',
                    'start_date' => $startDate,
                    'end_date' => $endDate,
                    'application_deadline' => $applicationDeadline,
                    'requirements' => 'Strong programming skills, good communication.',
                    'work_type' => 'hybrid',
                    'benefits' => 'Learning opportunities, mentorship',
                    'experience_level' => 'entry',
                    'status' => 'open',
                ]
            );

            // Step 13: Create Application
            // Note: Status is 'accepted' (not 'completed') so supervisor can see it for analytics submission
            // After supervisor submits analytics, it will become 'completed'
            $application = Application::updateOrCreate(
                [
                    'student_id' => $student->student_id,
                    'posting_id' => $posting->posting_id,
                ],
                [
                    'student_id' => $student->student_id,
                    'posting_id' => $posting->posting_id,
                    'resume' => 'Demo resume content',
                    'cover_letter' => 'Demo cover letter content',
                    'status' => 'accepted',
                    'accepted_at' => $acceptedAt,
                    'submitted_at' => $submittedAt,
                ]
            );

            // Step 14: Create ApplicationLetter
            $applicationLetter = ApplicationLetter::updateOrCreate(
                [
                    'student_id' => $student->student_id,
                    'ref_number' => 'UIL/0001/24',
                ],
                [
                    'department_id' => $department->department_id,
                    'student_id' => $student->student_id,
                    'ref_number' => 'UIL/0001/24',
                    'start_date' => $startDate,
                    'end_date' => $endDate,
                    'file_path' => 'application_letters/demo_letter.pdf',
                    'status' => 'generated',
                    'generated_by' => $coordinator->user_id,
                ]
            );

            // Step 15: Create SupervisorAssignment
            // Note: Status is 'active' (not 'completed') so supervisor can see it for analytics submission
            // After supervisor submits analytics, it will become 'completed'
            SupervisorAssignment::updateOrCreate(
                [
                    'supervisor_id' => $supervisor->user_id,
                    'student_id' => $student->student_id,
                    'posting_id' => $posting->posting_id,
                ],
                [
                    'supervisor_id' => $supervisor->user_id,
                    'student_id' => $student->student_id,
                    'posting_id' => $posting->posting_id,
                    'assigned_at' => $assignedAt,
                    'status' => 'active',
                ]
            );

            // Step 16: Create AdvisorAssignment
            AdvisorAssignment::updateOrCreate(
                [
                    'advisor_id' => $advisor->user_id,
                    'student_id' => $student->student_id,
                    'department_id' => $department->department_id,
                ],
                [
                    'advisor_id' => $advisor->user_id,
                    'student_id' => $student->student_id,
                    'department_id' => $department->department_id,
                    'assigned_at' => $advisorAssignedAt,
                    'status' => 'active',
                ]
            );

            // Step 17: Update Student with accepted_application_id
            $student->update([
                'accepted_application_id' => $application->application_id,
            ]);

            $this->command->info('Completed application data seeded successfully!');
            $this->command->info('Student: ' . $studentUser->email);
            $this->command->info('Application ID: ' . $application->application_id);
            $this->command->info('Application Status: ' . $application->status);
        });
    }
}
