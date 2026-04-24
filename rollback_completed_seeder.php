<?php

require __DIR__.'/vendor/autoload.php';

$app = require_once __DIR__.'/bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

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
use Illuminate\Support\Facades\DB;

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

    echo "Completed application seeder data rolled back successfully!\n";
});
