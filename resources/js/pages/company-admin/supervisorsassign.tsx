import React, { useState } from 'react';
import { Head, useForm, Link } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle, AlertTriangle } from 'lucide-react';
import { type BreadcrumbItem } from '@/types';

interface Company {
  company_id: number;
  name: string;
}

interface Supervisor {
  user_id: number;
  name: string;
}

interface Posting {
  posting_id: number;
  title: string;
  supervisor_id: string | null;
}

interface Student {
  student_id: number;
  name: string;
}

interface AcceptedApplication {
  application_id: number;
  student: Student;
  posting: Posting;
}

interface Props {
  company: Company;
  supervisors: Supervisor[];
  acceptedApplications: AcceptedApplication[];
  existingAssignments?: { [key: number]: boolean }; // Track which students already have supervisors
  success?: string;
  error?: string;
}

const breadcrumbs: BreadcrumbItem[] = [
  { title: 'Dashboard', href: '/company-admin' },
  { title: 'Assign Supervisor', href: '/company-admin/supervisors/assign' },
];

export default function SupervisorsAssign({ company, supervisors, acceptedApplications, existingAssignments = {}, success, error }: Props) {
   const { data, setData, post, processing, errors, reset } = useForm({
     supervisor_id: '',
     student_id: '',
     posting_id: '',
   });

   const [selectedApplication, setSelectedApplication] = useState<AcceptedApplication | null>(null);
   const [showWarning, setShowWarning] = useState(false);
   const [originalSupervisorId, setOriginalSupervisorId] = useState<string | null>(null);

   // Get unique students from accepted applications, excluding those already assigned
   const uniqueStudents = acceptedApplications.reduce((acc: Student[], app) => {
     if (!acc.find(s => s.student_id === app.student.student_id) && !existingAssignments[app.student.student_id]) {
       acc.push(app.student);
     }
     return acc;
   }, []);

   const handleStudentChange = (studentId: string) => {
     const application = acceptedApplications.find(app => app.student.student_id.toString() === studentId);
     if (application) {
       setSelectedApplication(application);
       setData('student_id', studentId);
       setData('posting_id', application.posting.posting_id.toString());

       // Set supervisor based on posting
       if (application.posting.supervisor_id) {
         setData('supervisor_id', application.posting.supervisor_id.toString());
         setOriginalSupervisorId(application.posting.supervisor_id.toString());
         setShowWarning(false);
       } else {
         setData('supervisor_id', '');
         setOriginalSupervisorId(null);
         setShowWarning(false);
       }
     }
   };

   const handleSupervisorChange = (supervisorId: string) => {
     setData('supervisor_id', supervisorId);
     if (originalSupervisorId && originalSupervisorId !== supervisorId) {
       setShowWarning(true);
     } else {
       setShowWarning(false);
     }
   };

   const handleSubmit = (e: React.FormEvent) => {
     e.preventDefault();
     
     // Check if student already has a supervisor assigned
     if (existingAssignments[parseInt(data.student_id)]) {
       alert('This student already has a supervisor assigned. Each student can only have one supervisor assignment.');
       return;
     }
     
     post('/company-admin/supervisor-assignments', {
       onSuccess: () => {
         reset();
         setSelectedApplication(null);
         setShowWarning(false);
         setOriginalSupervisorId(null);
       },
     });
   };

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title="Assign Supervisor" />
      <div className="p-6 space-y-6">
        <Card className="shadow-lg border-0 bg-gradient-to-br from-blue-50 via-white to-indigo-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 rounded-xl overflow-hidden">
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-6">
            <CardTitle className="text-2xl font-bold text-white">Assign Supervisor - {company.name}</CardTitle>
            <p className="text-blue-100 mt-1">Select a student with an accepted application to assign a supervisor</p>
          </div>
          <CardContent className="p-6 space-y-6">
            {error && (
              <Alert className="bg-red-50 dark:bg-red-900/50 border-red-200 dark:border-red-800 rounded-lg">
                <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400" />
                <AlertTitle className="text-red-800 dark:text-red-200 font-semibold">Error</AlertTitle>
                <AlertDescription className="text-red-700 dark:text-red-300">{error}</AlertDescription>
              </Alert>
            )}
            {success && (
              <Alert className="bg-green-50 dark:bg-green-900/50 border-green-200 dark:border-green-800 rounded-lg">
                <AlertCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
                <AlertTitle className="text-green-800 dark:text-green-200 font-semibold">Success</AlertTitle>
                <AlertDescription className="text-green-700 dark:text-green-300">{success}</AlertDescription>
              </Alert>
            )}
            {showWarning && (
              <Alert className="bg-amber-50 dark:bg-amber-900/50 border-amber-200 dark:border-amber-800 rounded-lg">
                <AlertTriangle className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                <AlertTitle className="text-amber-800 dark:text-amber-200 font-semibold">Warning</AlertTitle>
                <AlertDescription className="text-amber-700 dark:text-amber-300">
                  You are changing the supervisor from the one originally assigned to this posting. Are you sure you want to proceed?
                </AlertDescription>
              </Alert>
            )}
            {uniqueStudents.length === 0 ? (
              <Alert className="bg-blue-50 dark:bg-blue-900/50 border-blue-200 dark:border-blue-800 rounded-lg">
                <AlertCircle className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                <AlertTitle className="text-blue-800 dark:text-blue-200 font-semibold">No Students Available</AlertTitle>
                <AlertDescription className="text-blue-700 dark:text-blue-300">
                  All students with accepted applications already have supervisors assigned. Each student can only have one supervisor assignment.
                </AlertDescription>
              </Alert>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-200">
                      Student <span className="text-red-500">*</span>
                    </label>
                    <Select value={data.student_id} onValueChange={handleStudentChange}>
                      <SelectTrigger className="border-gray-300 dark:border-gray-600 rounded-lg h-12 bg-white dark:bg-gray-800 shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                        <SelectValue placeholder="Select a student with accepted application" />
                      </SelectTrigger>
                      <SelectContent>
                        {uniqueStudents.map((student) => (
                          <SelectItem key={student.student_id} value={student.student_id.toString()}>
                            {student.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {errors.student_id && <p className="text-red-500 text-sm mt-1">{errors.student_id}</p>}
                  </div>

                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-200">
                    Posting <span className="text-gray-500">(Auto-selected)</span>
                  </label>
                  <div className="h-12 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 flex items-center text-gray-700 dark:text-gray-200">
                    {selectedApplication ? selectedApplication.posting.title : 'Select a student first'}
                  </div>
                  {errors.posting_id && <p className="text-red-500 text-sm mt-1">{errors.posting_id}</p>}
                </div>
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-200">
                  Supervisor <span className="text-red-500">*</span>
                  {originalSupervisorId && (
                    <span className="text-xs text-gray-500 ml-2">(Originally assigned to posting)</span>
                  )}
                </label>
                <Select value={data.supervisor_id} onValueChange={handleSupervisorChange}>
                  <SelectTrigger className="border-gray-300 dark:border-gray-600 rounded-lg h-12 bg-white dark:bg-gray-800 shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                    <SelectValue placeholder="Select supervisor" />
                  </SelectTrigger>
                  <SelectContent>
                    {supervisors.map((supervisor) => (
                      <SelectItem key={supervisor.user_id} value={supervisor.user_id.toString()}>
                        {supervisor.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.supervisor_id && <p className="text-red-500 text-sm mt-1">{errors.supervisor_id}</p>}
              </div>

              <div className="flex gap-4 pt-4">
                <Button
                  type="submit"
                  disabled={processing || !data.student_id || !data.supervisor_id}
                  className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-lg px-8 py-2 font-semibold shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {processing ? 'Assigning...' : 'Assign Supervisor'}
                </Button>
                <Button
                  asChild
                  variant="outline"
                  className="border-gray-300 dark:border-gray-600 rounded-lg px-8 py-2 hover:bg-gray-50 dark:hover:bg-gray-800"
                >
                  <Link href="/company-admin">Back to Dashboard</Link>
                </Button>
              </div>
            </form>
            )}
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
