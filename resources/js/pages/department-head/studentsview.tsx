import React, { useState } from 'react';
import { Head, Link } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { X, User, Mail, Phone, GraduationCap, Calendar, Award, Users } from 'lucide-react';

interface Department {
  department_id: number;
  name: string;
}

interface Student {
  student_id: number;
  name: string;
  email: string;
  phone: string | null;
  gender?: 'male' | 'female';
  cgpa: number | null;
  year_of_study: string | null;
  university_id?: string;
  status: string;
  advisors: { user_id: number; name: string }[];
  applications?: Array<{
    application_id: number;
    posting_title: string;
    company_name: string;
    status: string;
    applied_at: string;
  }>;
}

interface Props {
  department: Department;
  student: Student;
  success?: string;
  error?: string;
}

const breadcrumbs = [
  { title: 'Dashboard', href: '/department-head' },
  { title: 'Student Details', href: '' },
];

const StudentsView: React.FC<Props> = ({ department, student, success, error }) => {
  const [showSuccess, setShowSuccess] = useState(!!success);
  const [showError, setShowError] = useState(!!error);

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title="Student Details" />
      <div className="flex h-full flex-1 flex-col gap-6 rounded-xl p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Student Details</h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">Department: {department.name}</p>
          </div>
        </div>
        {showSuccess && success && (
          <div className="bg-green-100 dark:bg-green-800 text-green-800 dark:text-green-100 p-4 rounded-xl flex justify-between items-center">
            <span>{success}</span>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowSuccess(false)}
              className="text-green-800 dark:text-green-100 hover:bg-green-200 dark:hover:bg-green-700"
              aria-label="Close success alert"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        )}
        {showError && error && (
          <div className="bg-red-100 dark:bg-red-800 text-red-800 dark:text-red-100 p-4 rounded-xl flex justify-between items-center">
            <span>{error}</span>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowError(false)}
              className="text-red-800 dark:text-red-100 hover:bg-red-200 dark:hover:bg-red-700"
              aria-label="Close error alert"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        )}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Personal Information */}
          <Card className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg">
            <CardHeader className="bg-gradient-to-r from-indigo-500 to-blue-600 dark:from-indigo-700 dark:to-blue-800 rounded-t-2xl">
              <CardTitle className="flex items-center gap-2 text-white">
                <User className="h-5 w-5" />
                Personal Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 p-6">
              <div className="flex items-center gap-3">
                <User className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Name</p>
                  <p className="font-medium text-gray-900 dark:text-gray-100">{student.name}</p>
                  {student.gender && (
                    <p className="text-xs text-gray-500 dark:text-gray-400 capitalize mt-1">({student.gender})</p>
                  )}
                </div>
              </div>
              <Separator className="bg-gray-200 dark:bg-gray-700" />
              <div className="flex items-center gap-3">
                <Mail className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Email</p>
                  <p className="font-medium text-gray-900 dark:text-gray-100">{student.email}</p>
                </div>
              </div>
              <Separator className="bg-gray-200 dark:bg-gray-700" />
              <div className="flex items-center gap-3">
                <Phone className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Phone</p>
                  <p className="font-medium text-gray-900 dark:text-gray-100">{student.phone || 'Not provided'}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Academic Information */}
          <Card className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg">
            <CardHeader className="bg-gradient-to-r from-green-500 to-emerald-600 dark:from-green-700 dark:to-emerald-800 rounded-t-2xl">
              <CardTitle className="flex items-center gap-2 text-white">
                <GraduationCap className="h-5 w-5" />
                Academic Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 p-6">
              <div className="flex items-center gap-3">
                <Award className="h-4 w-4 text-green-600 dark:text-green-400" />
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">CGPA</p>
                  <p className="font-medium text-gray-900 dark:text-gray-100">{student.cgpa ?? 'Not provided'}</p>
                </div>
              </div>
              <Separator className="bg-gray-200 dark:bg-gray-700" />
              <div className="flex items-center gap-3">
                <Calendar className="h-4 w-4 text-green-600 dark:text-green-400" />
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Year of Study</p>
                  <p className="font-medium text-gray-900 dark:text-gray-100">{student.year_of_study ?? 'Not provided'}</p>
                </div>
              </div>
              <Separator className="bg-gray-200 dark:bg-gray-700" />
              {student.university_id && (
                <>
                  <div className="flex items-center gap-3">
                    <GraduationCap className="h-4 w-4 text-green-600 dark:text-green-400" />
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">University ID</p>
                      <p className="font-medium text-gray-900 dark:text-gray-100">{student.university_id}</p>
                    </div>
                  </div>
                  <Separator className="bg-gray-200 dark:bg-gray-700" />
                </>
              )}
              <div className="flex items-center gap-3">
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">Status</p>
                  <Badge 
                    variant={student.status === 'active' ? 'default' : 'secondary'}
                    className={student.status === 'active' 
                      ? 'bg-green-100 text-green-700 dark:bg-green-800 dark:text-green-200' 
                      : 'bg-red-100 text-red-700 dark:bg-red-800 dark:text-red-200'
                    }
                  >
                    {student.status}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Advisors Section */}
        <Card className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg">
          <CardHeader className="bg-gradient-to-r from-purple-500 to-pink-600 dark:from-purple-700 dark:to-pink-800 rounded-t-2xl">
            <CardTitle className="flex items-center gap-2 text-white">
              <Users className="h-5 w-5" />
              Assigned Advisors
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            {student.advisors && student.advisors.length > 0 ? (
              <div className="space-y-3">
                {student.advisors.map((advisor) => (
                  <div key={advisor.user_id} className="flex items-center gap-3 p-3 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/30 dark:to-pink-900/30 rounded-lg border border-purple-200 dark:border-purple-700 hover:shadow-md transition-shadow">
                    <div className="h-10 w-10 rounded-full bg-gradient-to-r from-purple-500 to-pink-600 flex items-center justify-center text-white font-semibold">
                      {advisor.name.split(' ').map(n => n[0]).slice(0, 2).join('')}
                    </div>
                    <span className="font-medium text-gray-900 dark:text-gray-100">{advisor.name}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 dark:text-gray-400 text-center py-4">No advisors assigned</p>
            )}
          </CardContent>
        </Card>

        {/* Applications Section */}
        {student.applications && student.applications.length > 0 && (
          <Card className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg">
            <CardHeader className="bg-gradient-to-r from-orange-500 to-amber-600 dark:from-orange-700 dark:to-amber-800 rounded-t-2xl">
              <CardTitle className="flex items-center gap-2 text-white">
                <Award className="h-5 w-5" />
                Applications ({student.applications.length})
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-4">
                {student.applications.map((app) => (
                  <div key={app.application_id} className="p-4 bg-gradient-to-r from-orange-50 to-amber-50 dark:from-orange-900/30 dark:to-amber-900/30 rounded-lg border border-orange-200 dark:border-orange-700 hover:shadow-md transition-all">
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex-1">
                        <p className="font-semibold text-gray-900 dark:text-gray-100 text-lg">{app.posting_title}</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{app.company_name}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-500 mt-2">
                          Applied: {new Date(app.applied_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                        </p>
                      </div>
                      <Badge 
                        variant={app.status === 'accepted' ? 'default' : app.status === 'pending' ? 'secondary' : 'destructive'}
                        className={app.status === 'accepted' 
                          ? 'bg-green-100 text-green-700 dark:bg-green-800 dark:text-green-200' 
                          : app.status === 'pending'
                          ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-800 dark:text-yellow-200'
                          : 'bg-red-100 text-red-700 dark:bg-red-800 dark:text-red-200'
                        }
                      >
                        {app.status}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
        <div className="flex gap-4">
          <Button asChild className="bg-gradient-to-r from-indigo-500 to-blue-600 hover:from-indigo-600 hover:to-blue-700 text-white rounded-full">
            <Link href={`/department-head/students/${student.student_id}/edit`}>Edit Student</Link>
          </Button>
          <Button asChild variant="outline" className="rounded-full">
            <Link href="/department-head/department">Back to Department</Link>
          </Button>
        </div>
      </div>
    </AppLayout>
  );
};

export default StudentsView;