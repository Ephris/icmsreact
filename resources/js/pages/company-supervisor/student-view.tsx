import React from 'react';
import { Head, Link } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, User, Mail, Phone, GraduationCap, Award, MapPin, Calendar, DollarSign, Clock } from 'lucide-react';
import { type BreadcrumbItem } from '@/types';

interface Student {
  student_id: number;
  name: string;
  email: string;
  phone: string;
  department_name: string;
  year_of_study: number | null;
  cgpa: number | null;
  skills: string[];
  certifications: string[];
  portfolio: string | null;
  resume: string | null;
  preferred_locations: string | null;
  graduation_year: number | null;
  expected_salary: number | null;
  notice_period: string | null;
}

interface Assignment {
  posting_title: string;
  posting_type: string;
  status: string;
  assigned_at: string;
}

interface Props {
  student: Student;
  assignment: Assignment;
  success?: string;
  error?: string;
}

const breadcrumbs: BreadcrumbItem[] = [
  { title: 'Dashboard', href: '/company-supervisor' },
  { title: 'Students', href: '/company-supervisor/students' },
  { title: 'View Student', href: null },
];

export default function StudentView({ student, assignment, success, error }: Props) {
  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title={`Student: ${student.name}`} />
      <div className="p-6 space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" asChild>
            <Link href="/company-supervisor/students">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Student Details</h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              View detailed information about {student.name}
            </p>
          </div>
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

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Student Information */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5 text-blue-500" />
                  Personal Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Full Name</label>
                    <p className="text-gray-900 dark:text-white font-medium">{student.name}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Email</label>
                    <p className="text-gray-900 dark:text-white flex items-center gap-2">
                      <Mail className="h-4 w-4" />
                      {student.email}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Phone</label>
                    <p className="text-gray-900 dark:text-white flex items-center gap-2">
                      <Phone className="h-4 w-4" />
                      {student.phone || 'Not provided'}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Department</label>
                    <p className="text-gray-900 dark:text-white">{student.department_name}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Year of Study</label>
                    <p className="text-gray-900 dark:text-white flex items-center gap-2">
                      <GraduationCap className="h-4 w-4" />
                      {student.year_of_study ? `Year ${student.year_of_study}` : 'Not specified'}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">CGPA</label>
                    <p className="text-gray-900 dark:text-white font-medium">
                      {student.cgpa ? `${student.cgpa.toFixed(2)}/4.0` : 'Not available'}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Award className="h-5 w-5 text-green-500" />
                  Skills & Certifications
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Skills</label>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {student.skills && student.skills.length > 0 ? (
                      student.skills.map((skill, index) => (
                        <Badge key={index} variant="secondary">{skill}</Badge>
                      ))
                    ) : (
                      <p className="text-gray-500 dark:text-gray-400">No skills listed</p>
                    )}
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Certifications</label>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {student.certifications && student.certifications.length > 0 ? (
                      student.certifications.map((cert, index) => (
                        <Badge key={index} variant="outline">{cert}</Badge>
                      ))
                    ) : (
                      <p className="text-gray-500 dark:text-gray-400">No certifications listed</p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="h-5 w-5 text-purple-500" />
                  Career Preferences
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Preferred Locations</label>
                    <p className="text-gray-900 dark:text-white flex items-center gap-2">
                      <MapPin className="h-4 w-4" />
                      {student.preferred_locations || 'Not specified'}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Graduation Year</label>
                    <p className="text-gray-900 dark:text-white flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      {student.graduation_year || 'Not specified'}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Expected Salary</label>
                    <p className="text-gray-900 dark:text-white flex items-center gap-2">
                      <DollarSign className="h-4 w-4" />
                      {student.expected_salary ? `$${student.expected_salary.toLocaleString()}` : 'Not specified'}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Notice Period</label>
                    <p className="text-gray-900 dark:text-white flex items-center gap-2">
                      <Clock className="h-4 w-4" />
                      {student.notice_period || 'Not specified'}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Assignment Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Posting</label>
                  <p className="text-gray-900 dark:text-white font-medium">{assignment.posting_title}</p>
                  <Badge className="mt-1" variant={assignment.posting_type === 'internship' ? 'default' : 'secondary'}>
                    {assignment.posting_type}
                  </Badge>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Assignment Status</label>
                  <Badge className={`mt-1 ${assignment.status === 'active' ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300' : 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-300'}`}>
                    {assignment.status}
                  </Badge>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Assigned Date</label>
                  <p className="text-gray-900 dark:text-white text-sm">
                    {new Date(assignment.assigned_at).toLocaleDateString()}
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Documents</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {student.resume && (
                  <div>
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Resume</label>
                    <Button variant="outline" size="sm" className="w-full mt-1" asChild>
                      <a href={student.resume} target="_blank" rel="noopener noreferrer">
                        View Resume
                      </a>
                    </Button>
                  </div>
                )}
                {student.portfolio && (
                  <div>
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Portfolio</label>
                    <Button variant="outline" size="sm" className="w-full mt-1" asChild>
                      <a href={student.portfolio} target="_blank" rel="noopener noreferrer">
                        View Portfolio
                      </a>
                    </Button>
                  </div>
                )}
                {!student.resume && !student.portfolio && (
                  <p className="text-gray-500 dark:text-gray-400 text-sm">No documents available</p>
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        <Button variant="outline" asChild>
          <Link href="/company-supervisor/students">Back to Students</Link>
        </Button>
      </div>
    </AppLayout>
  );
}