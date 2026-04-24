import React from 'react';
import AppLayout from '@/layouts/app-layout';
import { Head, Link } from '@inertiajs/react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Users, FileText, Briefcase, Building2, MapPin, Globe, User, Clock, CheckCircle } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

interface AssignedStudent {
  assignment_id: string;
  student_name: string;
  student_email: string;
  student_gender?: 'male' | 'female';
  student_university_id?: string | null;
  department_name: string;
  posting_title: string;
  posting_type: string;
  status: string;
  assigned_at: string;
  applications: {
    application_id: string;
    status: string;
    submitted_at: string;
  }[];
}

interface PendingForm {
  form_id: string;
  title: string;
  type: string;
  student_name: string;
  advisor_name: string;
  created_at: string;
}

interface Posting {
  posting_id: string;
  title: string;
  type: string;
  status: string;
  application_deadline: string;
  applications_count: number;
}

interface Company {
  company_id: string;
  name: string;
  industry: string;
  location: string;
  website?: string;
  description?: string;
}

interface EndingStudent {
  assignment_id: string;
  student_id: string;
  student_name: string;
  end_date: string;
  days_remaining: number;
  is_expired: boolean;
}

interface CompanySupervisorDashboardProps {
  company: Company | null;
  assignedStudents: AssignedStudent[];
  pendingForms: PendingForm[];
  postings: Posting[];
  endingStudents?: EndingStudent[];
  completedStudentsCount?: number;
  success?: string;
  error?: string;
}

const CompanySupervisorDashboard: React.FC<CompanySupervisorDashboardProps> = ({
  company,
  assignedStudents = [],
  pendingForms = [],
  postings = [],
  endingStudents = [],
  completedStudentsCount = 0,
  success,
  error
}) => {

  const getTypeBadgeColor = (type: string) => {
    switch (type.toLowerCase()) {
      case 'internship':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300';
      case 'career':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-300';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-300';
    }
  };

    return (
        <AppLayout>
      <Head title="Company Supervisor Dashboard" />
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Company Supervisor Dashboard</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Manage your assigned students and company activities
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
            <Clock className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
            <AlertTitle className="text-yellow-800 dark:text-yellow-200 font-semibold">
              Internships Ending Soon
            </AlertTitle>
            <AlertDescription className="text-yellow-700 dark:text-yellow-300">
              <div className="space-y-2">
                <p>You have {endingStudents.length} student(s) with internships ending in 5 days or less:</p>
                <ul className="list-disc list-inside space-y-1">
                  {endingStudents.map((student) => (
                    <li key={student.assignment_id}>
                      {student.student_name} - {student.days_remaining} day(s) remaining (ends {new Date(student.end_date).toLocaleDateString('en-US', { 
                        year: 'numeric', 
                        month: 'short', 
                        day: 'numeric' 
                      })})
                    </li>
                  ))}
                </ul>
                <Link href={route('company-supervisor.analytics.index')}>
                  <Button size="sm" className="mt-2">
                    Submit Analytics
                  </Button>
                </Link>
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
              <span>You have {completedStudentsCount} student(s) with completed internships. Submit analytics to complete the process.</span>
              <Link href={route('company-supervisor.analytics.index')}>
                <Button size="sm" className="ml-4">
                  View Analytics
                </Button>
              </Link>
            </AlertDescription>
          </Alert>
        )}

        {/* Company Information */}
        {company && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="h-5 w-5 text-blue-500" />
                Company Information
              </CardTitle>
              <CardDescription>
                Details about your assigned company
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white">{company.name}</h3>
                  <div className="space-y-2 mt-2">
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-gray-500" />
                      <span className="text-gray-600 dark:text-gray-400">{company.location}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Briefcase className="h-4 w-4 text-gray-500" />
                      <span className="text-gray-600 dark:text-gray-400">{company.industry}</span>
                    </div>
                    {company.website && (
                      <div className="flex items-center gap-2">
                        <Globe className="h-4 w-4 text-gray-500" />
                        <a href={company.website} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800">
                          {company.website}
                        </a>
                      </div>
                    )}
                  </div>
                </div>
                {company.description && (
                  <div>
                    <h4 className="font-medium text-gray-900 dark:text-white mb-2">Description</h4>
                    <p className="text-gray-600 dark:text-gray-400">{company.description}</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Assigned Students */}
        <Link href="/company-supervisor/students" className="block">
          <Card className="cursor-pointer hover:shadow-xl transition-all duration-300 transform hover:scale-[1.01] group">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                <Users className="h-5 w-5 text-blue-500" />
                Assigned Students ({assignedStudents.length})
              </CardTitle>
              <CardDescription>
                Students under your supervision with their applications
              </CardDescription>
            </CardHeader>
            <CardContent>
              {assignedStudents.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  No students assigned yet
                </div>
              ) : (
                <div className="space-y-4">
                  {assignedStudents.slice(0, 3).map((student) => (
                    <div key={student.assignment_id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div className="p-2 rounded-full bg-blue-100 dark:bg-blue-900/20">
                            <User className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                          </div>
                          <div>
                            <div className="font-medium text-gray-900 dark:text-white flex items-center gap-2">
                              <span>{student.student_name}</span>
                              {student.student_gender && (
                                <span className="text-xs text-gray-500 dark:text-gray-400 capitalize">({student.student_gender})</span>
                              )}
                            </div>
                            <div className="text-sm text-gray-500 dark:text-gray-400">{student.student_email}</div>
                            {student.student_university_id && (
                              <div className="text-xs text-gray-500 dark:text-gray-400">UNid: {student.student_university_id}</div>
                            )}
                          </div>
                        </div>
                        <Badge className={getTypeBadgeColor(student.posting_type)}>
                          {student.posting_type}
                        </Badge>
                      </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                      Department: {student.department_name} | Posting: {student.posting_title}
                    </div>
                    {student.applications.length > 0 ? (
                      <div>
                        <h4 className="font-medium text-gray-900 dark:text-white mb-2">
                          Applications ({student.applications.length})
                        </h4>
                        <div className="space-y-1">
                          {student.applications.map((app) => (
                            <div key={app.application_id} className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-800 rounded text-sm">
                              <span>Status: {app.status}</span>
                              <span>{new Date(app.submitted_at).toLocaleDateString()}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        No applications yet
                      </div>
                    )}
                  </div>
                ))}
                {assignedStudents.length > 3 && (
                  <div className="text-center text-sm text-gray-500 dark:text-gray-400">
                    And {assignedStudents.length - 3} more students...
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
        </Link>

        {/* Pending Forms */}
        <Link href="/company-supervisor/forms" className="block">
          <Card className="cursor-pointer hover:shadow-xl transition-all duration-300 transform hover:scale-[1.01] group">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-yellow-500" />
              Pending Forms ({pendingForms.length})
            </CardTitle>
            <CardDescription>
              Forms awaiting your approval
            </CardDescription>
          </CardHeader>
          <CardContent>
            {pendingForms.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                No pending forms
              </div>
            ) : (
              <div className="space-y-3">
                {pendingForms.slice(0, 3).map((form) => (
                  <div key={form.form_id} className="flex items-center justify-between p-3 border border-gray-200 dark:border-gray-700 rounded-lg">
                    <div>
                      <div className="font-medium text-gray-900 dark:text-white">{form.title}</div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        Student: {form.student_name} | Advisor: {form.advisor_name}
                      </div>
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      {new Date(form.created_at).toLocaleDateString()}
                    </div>
                  </div>
                ))}
                {pendingForms.length > 3 && (
                  <div className="text-center text-sm text-gray-500 dark:text-gray-400">
                    And {pendingForms.length - 3} more forms...
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
        </Link>

        {/* Postings */}
        <Link href="/company-supervisor/postings" className="block">
          <Card className="cursor-pointer hover:shadow-xl transition-all duration-300 transform hover:scale-[1.01] group">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Briefcase className="h-5 w-5 text-purple-500" />
              Your Postings ({postings.length})
            </CardTitle>
            <CardDescription>
              Position postings you've created
            </CardDescription>
          </CardHeader>
          <CardContent>
            {postings.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                No postings created yet
              </div>
            ) : (
              <div className="space-y-3">
                {postings.slice(0, 3).map((posting) => (
                  <div key={posting.posting_id} className="flex items-center justify-between p-3 border border-gray-200 dark:border-gray-700 rounded-lg">
                    <div>
                      <div className="font-medium text-gray-900 dark:text-white">{posting.title}</div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        {posting.applications_count} applications | Deadline: {new Date(posting.application_deadline).toLocaleDateString()}
                      </div>
                    </div>
                    <Badge className={getTypeBadgeColor(posting.type)}>
                      {posting.type}
                    </Badge>
                  </div>
                ))}
                {postings.length > 3 && (
                  <div className="text-center text-sm text-gray-500 dark:text-gray-400">
                    And {postings.length - 3} more postings...
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
        </Link>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>
              Common tasks for company supervisors
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <Button variant="outline" className="justify-start" asChild>
                <Link href="/company-supervisor/students">
                  <Users className="h-4 w-4 mr-2" />
                  Monitor Students
                </Link>
              </Button>
              <Button variant="outline" className="justify-start" asChild>
                <Link href="/company-supervisor/forms">
                  <FileText className="h-4 w-4 mr-2" />
                  Approve Forms
                </Link>
              </Button>
              <Button variant="outline" className="justify-start" asChild>
                <Link href="/company-supervisor/postings/create">
                  <Briefcase className="h-4 w-4 mr-2" />
                  Post Opportunities
                </Link>
              </Button>
              <Button variant="outline" className="justify-start" asChild>
                <Link href="/company-supervisor/profile">
                  <User className="h-4 w-4 mr-2" />
                  Profile
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
            </div>
        </AppLayout>
    );
};

export default CompanySupervisorDashboard;
