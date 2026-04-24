import { Head, Link } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, FileText, Trash2, CheckCircle, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';

interface AssignedStudent {
  student_id: string;
  name: string;
  email: string;
  department_name: string;
  cgpa: number;
  year_of_study: number;
  university_id?: string | null;
  gender?: 'male' | 'female';
  accepted_applications: number;
  applications: {
    application_id: string;
    posting_title: string;
    posting_type: string;
    status: string;
    submitted_at: string;
  }[];
}

interface Department {
  department_id: string;
  name: string;
  description?: string;
  head_name: string;
}

interface Stats {
  assignedStudents: number;
  forms: number;
  trashedForms: number;
  acceptedApplications: number;
}

interface EndingStudent {
  student_id: string;
  student_name: string;
  end_date: string;
  days_remaining: number;
}

interface FacultyAdvisorDashboardProps {
  department: Department | null;
  assignedStudents?: AssignedStudent[];
  stats?: Stats;
  endingStudents?: EndingStudent[];
  completedStudentsCount?: number;
  success?: string;
  error?: string;
}

export default function FacultyAdvisorDashboard({
  department,
  assignedStudents = [],
  stats,
  endingStudents = [],
  completedStudentsCount = 0,
  success,
  error,
}: FacultyAdvisorDashboardProps) {

  return (
    <AppLayout>
      <Head title="Faculty Advisor Dashboard" />

      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Faculty Advisor Dashboard</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Manage your assigned students, forms, and applications
          </p>
        </div>

        {success && (
          <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
            <p className="text-green-800 dark:text-green-200">{success}</p>
          </div>
        )}

        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
            <p className="text-red-800 dark:text-red-200">{error}</p>
          </div>
        )}

        {/* Ending Internships Warning */}
        {endingStudents && endingStudents.length > 0 && (
          <Alert className="bg-yellow-50 dark:bg-yellow-900/50 border-yellow-200 dark:border-yellow-800">
            <AlertCircle className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
            <AlertTitle className="text-yellow-800 dark:text-yellow-200 font-semibold">
              Student Internships Ending Soon
            </AlertTitle>
            <AlertDescription className="text-yellow-700 dark:text-yellow-300">
              <div className="space-y-2">
                <p>You have {endingStudents.length} student(s) with internships ending in 5 days or less:</p>
                <ul className="list-disc list-inside space-y-1">
                  {endingStudents.map((student) => (
                    <li key={student.student_id}>
                      {student.student_name} - {student.days_remaining} day(s) remaining (ends {new Date(student.end_date).toLocaleDateString('en-US', { 
                        year: 'numeric', 
                        month: 'short', 
                        day: 'numeric' 
                      })})
                    </li>
                  ))}
                </ul>
              </div>
            </AlertDescription>
          </Alert>
        )}

        {/* Completed Students Count */}
        {completedStudentsCount > 0 && (
          <Alert className="bg-blue-50 dark:bg-blue-900/50 border-blue-200 dark:border-blue-800">
            <CheckCircle className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            <AlertTitle className="text-blue-800 dark:text-blue-200 font-semibold">
              Completed Internships
            </AlertTitle>
            <AlertDescription className="text-blue-700 dark:text-blue-300 flex justify-between items-center">
              <span>You have {completedStudentsCount} student(s) with completed internships. View analytics to see their performance evaluations.</span>
              <Link href={route('faculty-advisor.analytics.index')}>
                <Button size="sm" className="ml-4">
                  View Analytics
                </Button>
              </Link>
            </AlertDescription>
          </Alert>
        )}

        {/* Department Information */}
        {department && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5 text-blue-500" />
                Department Information
              </CardTitle>
              <CardDescription>
                Details about your department
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white">{department.name}</h3>
                  <div className="space-y-2 mt-2">
                    <div className="text-gray-600 dark:text-gray-400">
                      Head: {department.head_name}
                    </div>
                  </div>
                </div>
                {department.description && (
                  <div>
                    <h4 className="font-medium text-gray-900 dark:text-white mb-2">Description</h4>
                    <p className="text-gray-600 dark:text-gray-400">{department.description}</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Link href="/faculty-advisor/students" className="block">
            <Card className="cursor-pointer hover:shadow-xl transition-all duration-300 transform hover:scale-105 group">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                  Assigned Students
                </CardTitle>
                <div className="p-2 rounded-lg bg-blue-50 dark:bg-blue-900/20 group-hover:scale-110 transition-transform">
                  <Users className="h-4 w-4 text-blue-500" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-gray-900 dark:text-white group-hover:scale-110 transition-transform">
                  {stats?.assignedStudents || 0}
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Students under your guidance
                </p>
              </CardContent>
            </Card>
          </Link>

          <Link href="/faculty-advisor/forms" className="block">
            <Card className="cursor-pointer hover:shadow-xl transition-all duration-300 transform hover:scale-105 group">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400 group-hover:text-green-600 dark:group-hover:text-green-400 transition-colors">
                  Forms
                </CardTitle>
                <div className="p-2 rounded-lg bg-green-50 dark:bg-green-900/20 group-hover:scale-110 transition-transform">
                  <FileText className="h-4 w-4 text-green-500" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-gray-900 dark:text-white group-hover:scale-110 transition-transform">
                  {stats?.forms || 0}
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Total forms created
                </p>
              </CardContent>
            </Card>
          </Link>

          <Link href="/faculty-advisor/forms/trashed" className="block">
            <Card className="cursor-pointer hover:shadow-xl transition-all duration-300 transform hover:scale-105 group">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400 group-hover:text-red-600 dark:group-hover:text-red-400 transition-colors">
                  Trashed Forms
                </CardTitle>
                <div className="p-2 rounded-lg bg-red-50 dark:bg-red-900/20 group-hover:scale-110 transition-transform">
                  <Trash2 className="h-4 w-4 text-red-500" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-gray-900 dark:text-white group-hover:scale-110 transition-transform">
                  {stats?.trashedForms || 0}
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Deleted forms
                </p>
              </CardContent>
            </Card>
          </Link>

          <Link href="/faculty-advisor/applications" className="block">
            <Card className="cursor-pointer hover:shadow-xl transition-all duration-300 transform hover:scale-105 group">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
                  Accepted Applications
                </CardTitle>
                <div className="p-2 rounded-lg bg-purple-50 dark:bg-purple-900/20 group-hover:scale-110 transition-transform">
                  <CheckCircle className="h-4 w-4 text-purple-500" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-gray-900 dark:text-white group-hover:scale-110 transition-transform">
                  {stats?.acceptedApplications || 0}
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Student applications accepted
                </p>
              </CardContent>
            </Card>
          </Link>
        </div>

        {/* Assigned Students with Applications */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5 text-blue-500" />
              Assigned Students & Their Applications
            </CardTitle>
            <CardDescription>
              Students under your guidance with their accepted applications
            </CardDescription>
          </CardHeader>
          <CardContent>
            {assignedStudents.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                No students assigned yet
              </div>
            ) : (
              <div className="space-y-6">
                {assignedStudents.map((student) => (
                  <div key={student.student_id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-full bg-blue-100 dark:bg-blue-900/20">
                          <Users className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                        </div>
                        <div>
                          <div className="font-medium text-gray-900 dark:text-white flex items-center gap-2">
                            <span>{student.name}</span>
                            {student.gender && (
                              <span className="text-xs text-gray-500 dark:text-gray-400 capitalize">({student.gender})</span>
                            )}
                          </div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">{student.email}</div>
                          {student.university_id && (
                            <div className="text-xs text-gray-500 dark:text-gray-400">UNid: {student.university_id}</div>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-gray-600 dark:text-gray-400">
                          Year {student.year_of_study} | CGPA: {student.cgpa?.toFixed(2) || 'N/A'}
                        </span>
                      </div>
                    </div>

                    <div className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                      Department: {student.department_name}
                    </div>

                    {student.applications.length > 0 ? (
                      <div>
                        <h4 className="font-medium text-gray-900 dark:text-white mb-2">
                          Accepted Applications ({student.accepted_applications})
                        </h4>
                        <div className="space-y-2">
                          {student.applications.map((app) => (
                            <div key={app.application_id} className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-800 rounded">
                              <div className="flex items-center gap-2">
                                <FileText className="h-4 w-4 text-gray-500" />
                                <span className="font-medium text-gray-900 dark:text-white">{app.posting_title}</span>
                                <span className="text-sm text-gray-500 dark:text-gray-400">({app.posting_type})</span>
                              </div>
                              <div className="text-sm text-gray-500 dark:text-gray-400">
                                {new Date(app.submitted_at).toLocaleDateString()}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        No accepted applications yet
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5 text-blue-500" />
                Quick Actions
              </CardTitle>
              <CardDescription>
                Common tasks for faculty advisors
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <a
                href="/faculty-advisor/students"
                className="block p-3 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
              >
                <div className="font-medium text-gray-900 dark:text-white">Monitor Students</div>
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  View and monitor your assigned students with their applications in detail
                </div>
              </a>
              <a
                href="/faculty-advisor/forms/create"
                className="block p-3 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
              >
                <div className="font-medium text-gray-900 dark:text-white">Share Forms</div>
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  Upload and share evaluation forms with students
                </div>
              </a>
              <a
                href="/faculty-advisor/applications"
                className="block p-3 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
              >
                <div className="font-medium text-gray-900 dark:text-white">Provide Feedback</div>
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  Review applications and provide feedback to students
                </div>
              </a>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-green-500" />
                Recent Activity
              </CardTitle>
              <CardDescription>
                Latest updates and notifications
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  No recent activity to display
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AppLayout>
  );
}
