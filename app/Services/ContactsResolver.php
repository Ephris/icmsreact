<?php

namespace App\Services;

use App\Models\User;
use App\Models\Application;
use App\Models\SupervisorAssignment;
use App\Models\CompanySupervisorAssignment;
use App\Models\AdvisorAssignment;
use App\Models\CompanyAdminAssignment;
use App\Models\DepartmentHeadAssignment;
use Illuminate\Support\Facades\DB;

class ContactsResolver
{
	/**
	 * Return allowed user IDs current user can chat with, respecting role pairs and relationships.
	 */
	public function getAllowedUserIds(User $currentUser): array
	{
		$role = $currentUser->role;
		$userId = $currentUser->user_id;

		switch ($role) {
			case 'admin':
				return $this->getAdminContacts();
			
			case 'dept_head':
				return $this->getDeptHeadContacts($userId);
			
			case 'company_admin':
				return $this->getCompanyAdminContacts($userId);
			
			case 'student':
				return $this->getStudentContacts($userId);
			
			case 'advisor':
				return $this->getAdvisorContacts($userId);
			
			case 'supervisor':
				return $this->getSupervisorContacts($userId);
			
			case 'coordinator':
				return $this->getCoordinatorContacts();
			
			default:
				return [];
		}
	}

	private function getAdminContacts(): array
	{
		return User::whereIn('role', ['company_admin', 'coordinator', 'dept_head'])
			->whereNull('deleted_at')
			->pluck('user_id')
			->all();
	}

	private function getDeptHeadContacts(int $deptHeadId): array
	{
		try {
			$userIds = collect();

			// Get assigned department
			$deptHeadAssignment = DepartmentHeadAssignment::where('user_id', $deptHeadId)->first();
			if (!$deptHeadAssignment) {
				return [];
			}

			$departmentId = $deptHeadAssignment->department_id;

			// Supervisors assigned to students with accepted applications in this department
			$supervisorIds = SupervisorAssignment::whereHas('student', function ($query) use ($departmentId) {
				$query->where('department_id', $departmentId);
			})
			->whereHas('student.applications', function ($query) {
				$query->where('status', 'accepted');
			})
			->pluck('supervisor_id')
			->unique();

			// Company admins of companies that have accepted applications from students in this department
			$companyAdminIds = CompanyAdminAssignment::whereHas('company', function ($query) use ($departmentId) {
				$query->whereExists(function ($subQuery) use ($departmentId) {
					$subQuery->select(DB::raw(1))
						->from('postings')
						->whereColumn('postings.company_id', 'companies.company_id')
						->whereExists(function ($appQuery) use ($departmentId) {
							$appQuery->select(DB::raw(1))
								->from('applications')
								->whereColumn('applications.posting_id', 'postings.posting_id')
								->where('applications.status', 'accepted')
								->whereExists(function ($studentQuery) use ($departmentId) {
									$studentQuery->select(DB::raw(1))
										->from('students')
										->whereColumn('students.student_id', 'applications.student_id')
										->where('students.department_id', $departmentId);
								});
						});
				});
			})->pluck('user_id')->unique();

			// Advisors in this department
			$advisorIds = User::where('role', 'advisor')
				->where('department_id', $departmentId)
				->pluck('user_id');

			// Students in this department
			$studentIds = User::where('role', 'student')
				->where('department_id', $departmentId)
				->pluck('user_id');

			// Coordinator and admin
			$otherIds = User::whereIn('role', ['coordinator', 'admin'])
				->pluck('user_id');

			$userIds = $userIds->merge($supervisorIds)
				->merge($companyAdminIds)
				->merge($advisorIds)
				->merge($studentIds)
				->merge($otherIds);

			return $userIds->unique()->values()->all();
		} catch (\Throwable $e) {
			return [];
		}
	}

	private function getCompanyAdminContacts(int $companyAdminId): array
	{
		$userIds = collect();

		// Get assigned company
		$companyAssignment = CompanyAdminAssignment::where('user_id', $companyAdminId)->first();
		if (!$companyAssignment) {
			return [];
		}

		$companyId = $companyAssignment->company_id;

		// Supervisors under this company with assigned students
		$supervisorIds = SupervisorAssignment::whereHas('posting', function ($query) use ($companyId) {
			$query->where('company_id', $companyId);
		})
		->pluck('supervisor_id')
		->unique();

		// Students with accepted applications from this company
		$studentIds = User::where('role', 'student')
			->whereHas('student.applications', function ($query) use ($companyId) {
				$query->where('status', 'accepted')
					->whereHas('posting', function ($q) use ($companyId) {
						$q->where('company_id', $companyId);
					});
			})
			->pluck('user_id');

		// Advisors of students with accepted applications from this company
		$advisorIds = User::where('role', 'advisor')
			->whereHas('advisorAssignments', function ($query) use ($companyId) {
				$query->whereHas('student.applications', function ($q) use ($companyId) {
					$q->where('status', 'accepted')
						->whereHas('posting', function ($postingQuery) use ($companyId) {
							$postingQuery->where('company_id', $companyId);
						});
				});
			})
			->pluck('user_id');

		// Department heads of students with accepted applications from this company
		$deptHeadIds = User::where('role', 'dept_head')
			->whereHas('assignedDepartment.students.applications', function ($query) use ($companyId) {
				$query->where('status', 'accepted')
					->whereHas('posting', function ($q) use ($companyId) {
						$q->where('company_id', $companyId);
					});
			})
			->pluck('user_id');

		// Admin
		$adminIds = User::where('role', 'admin')->pluck('user_id');

		$userIds = $userIds->merge($supervisorIds)
			->merge($studentIds)
			->merge($advisorIds)
			->merge($deptHeadIds)
			->merge($adminIds);

		return $userIds->unique()->values()->all();
	}

	private function getStudentContacts(int $studentId): array
	{
        // Strict rules for student contacts:
        // 1) Coordinators (all)
        // 2) Department head assigned to student's department
        // 3) Advisor assigned to student
        // 4) Company admin for the student's accepted application
        // 5) Supervisor assigned to student

        $student = User::with(['student', 'student.acceptedApplication.posting'])->find($studentId);
        if (!$student || !$student->student) {
            return [];
        }

        $studentRecord = $student->student;

        // (1) Coordinators
        $coordinatorIds = User::where('role', 'coordinator')->pluck('user_id');

        // (2) Department head for student's department
        $deptHeadIds = DepartmentHeadAssignment::where('department_id', $student->department_id)
            ->pluck('user_id');

        // (3) Advisor assigned to student
        $advisorIds = AdvisorAssignment::where('student_id', $studentRecord->student_id)
            ->pluck('advisor_id');

        // (4) Company admin for accepted application (if exists)
        $companyAdminIds = collect();
        try {
            $acceptedApp = Application::where('student_id', $studentRecord->student_id)
                ->where('status', 'accepted')
                ->latest('application_id')
                ->with('posting')
                ->first();
            if ($acceptedApp && $acceptedApp->posting && $acceptedApp->posting->company_id) {
                $companyAdminIds = CompanyAdminAssignment::where('company_id', $acceptedApp->posting->company_id)
                    ->pluck('user_id');
            }
        } catch (\Throwable $e) {
            // ignore accepted application lookup failures
        }

        // (5) Supervisor assigned to student
        $supervisorIds = SupervisorAssignment::where('student_id', $studentRecord->student_id)
            ->pluck('supervisor_id');

        return collect()
            ->merge($coordinatorIds)
            ->merge($deptHeadIds)
            ->merge($advisorIds)
            ->merge($companyAdminIds)
            ->merge($supervisorIds)
            ->filter()
            ->unique()
            ->values()
            ->all();
	}

	private function getAdvisorContacts(int $advisorId): array
	{
		try {
			$userIds = collect();

			// Supervisors assigned to advisor's students with accepted applications
			$supervisorIds = SupervisorAssignment::whereHas('student.advisorAssignments', function ($query) use ($advisorId) {
				$query->where('advisor_id', $advisorId);
			})
			->whereHas('student.applications', function ($query) {
				$query->where('status', 'accepted');
			})
			->pluck('supervisor_id')
			->unique();


			// Department head of advisor's department (guard if advisor record missing)
			$advisor = User::find($advisorId);
			if (!$advisor) {
				return [];
			}
			$deptHeadIds = DepartmentHeadAssignment::where('department_id', $advisor->department_id)
				->pluck('user_id');

			// Assigned students
			$studentIds = AdvisorAssignment::where('advisor_id', $advisorId)
				->pluck('student_id')
				->map(function ($studentId) {
					return User::whereHas('student', function ($query) use ($studentId) {
						$query->where('student_id', $studentId);
					})->value('user_id');
				})
				->filter();

			// Coordinator
			$coordinatorIds = User::where('role', 'coordinator')->pluck('user_id');

			// Admin
			$adminIds = User::where('role', 'admin')->pluck('user_id');

			$userIds = $userIds->merge($supervisorIds)
				->merge($deptHeadIds)
				->merge($studentIds)
				->merge($coordinatorIds);

			return $userIds->unique()->values()->all();
		} catch (\Throwable $e) {
			// Fallback: return all users except self
			return User::where('user_id', '!=', $advisorId)->pluck('user_id')->all();
		}
	}

	private function getSupervisorContacts(int $supervisorId): array
	{
		try {
			$userIds = collect();

			// Company admin of supervisor's company
			$companyAdminIds = CompanyAdminAssignment::whereExists(function ($query) use ($supervisorId) {
				$query->select(DB::raw(1))
					->from('companies')
					->whereColumn('companies.company_id', 'company_admin_assignments.company_id')
					->whereExists(function ($subQuery) use ($supervisorId) {
						$subQuery->select(DB::raw(1))
							->from('postings')
							->whereColumn('postings.company_id', 'companies.company_id')
							->whereExists(function ($assignmentQuery) use ($supervisorId) {
								$assignmentQuery->select(DB::raw(1))
									->from('supervisor_assignments')
									->whereColumn('supervisor_assignments.posting_id', 'postings.posting_id')
									->where('supervisor_assignments.supervisor_id', $supervisorId);
							});
					});
			})->pluck('user_id');

			// Advisors of students assigned to this supervisor with accepted applications
			$advisorIds = AdvisorAssignment::whereExists(function ($query) use ($supervisorId) {
				$query->select(DB::raw(1))
					->from('students')
					->whereColumn('students.student_id', 'advisor_assignments.student_id')
					->whereExists(function ($subQuery) use ($supervisorId) {
						$subQuery->select(DB::raw(1))
							->from('supervisor_assignments')
							->whereColumn('supervisor_assignments.student_id', 'students.student_id')
							->where('supervisor_assignments.supervisor_id', $supervisorId);
					})
					->whereExists(function ($appQuery) {
						$appQuery->select(DB::raw(1))
							->from('applications')
							->whereColumn('applications.student_id', 'students.student_id')
							->where('applications.status', 'accepted');
					});
			})
			->pluck('advisor_id')
			->unique();

			// Department heads of students assigned to this supervisor with accepted applications
			$deptHeadIds = DepartmentHeadAssignment::whereExists(function ($query) use ($supervisorId) {
				$query->select(DB::raw(1))
					->from('departments')
					->whereColumn('departments.department_id', 'department_head_assignments.department_id')
					->whereExists(function ($subQuery) use ($supervisorId) {
						$subQuery->select(DB::raw(1))
							->from('students')
							->whereColumn('students.department_id', 'departments.department_id')
							->whereExists(function ($assignmentQuery) use ($supervisorId) {
								$assignmentQuery->select(DB::raw(1))
									->from('supervisor_assignments')
									->whereColumn('supervisor_assignments.student_id', 'students.student_id')
									->where('supervisor_assignments.supervisor_id', $supervisorId);
							});
					})
					->whereExists(function ($appQuery) {
						$appQuery->select(DB::raw(1))
							->from('students')
							->whereColumn('students.department_id', 'departments.department_id')
							->whereExists(function ($studentAppQuery) {
								$studentAppQuery->select(DB::raw(1))
									->from('applications')
									->whereColumn('applications.student_id', 'students.student_id')
									->where('applications.status', 'accepted');
							});
					});
			})
			->pluck('user_id')
			->unique();

			// Students assigned to this supervisor with accepted applications
			$studentIds = SupervisorAssignment::where('supervisor_id', $supervisorId)
				->whereExists(function ($query) {
					$query->select(DB::raw(1))
						->from('applications')
						->whereColumn('applications.student_id', 'supervisor_assignments.student_id')
						->where('applications.status', 'accepted');
				})
				->pluck('student_id')
				->map(function ($studentId) {
					return User::whereHas('student', function ($query) use ($studentId) {
						$query->where('student_id', $studentId);
					})->value('user_id');
				})
				->filter();

			$userIds = $userIds->merge($companyAdminIds)
				->merge($advisorIds)
				->merge($deptHeadIds)
				->merge($studentIds);

			return $userIds->unique()->values()->all();
		} catch (\Throwable $e) {
			return [];
		}
	}

	private function getCoordinatorContacts(): array
	{
		$userIds = collect();

		// Department heads
		$deptHeadIds = User::where('role', 'dept_head')->pluck('user_id');

		// Students
		$studentIds = User::where('role', 'student')->pluck('user_id');

		// Advisors
		$advisorIds = User::where('role', 'advisor')->pluck('user_id');

		// Admin
		$adminIds = User::where('role', 'admin')->pluck('user_id');

		$userIds = $userIds->merge($deptHeadIds)
			->merge($studentIds)
			->merge($advisorIds)
			->merge($adminIds);

		return $userIds->unique()->values()->all();
	}
}


