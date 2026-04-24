import React, { useState, useEffect } from 'react';
import { Head, Link } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle, X } from 'lucide-react';
import { type BreadcrumbItem } from '@/types';

interface Company {
  company_id: number;
  name: string;
}

interface Assignment {
  assignment_id: number;
  supervisor_name: string;
  supervisor_email: string;
  supervisor_phone: string;
  supervisor_specialization: string;
  student_name: string;
  student_cgpa: number;
  posting_title: string;
  posting_type: string;
  status: string;
  assigned_at: string;
}

interface Props {
  assignment: Assignment;
  company: Company;
  success?: string;
  error?: string;
}

const breadcrumbs: BreadcrumbItem[] = [
  { title: 'Dashboard', href: '/company-admin' },
  { title: 'Supervisor Assignments', href: '/company-admin/supervisor-assignments' },
  { title: 'View Assignment', href: null },
];

export default function SupervisorAssignmentsView({ assignment, company, success, error }: Props) {
  const [showSuccess, setShowSuccess] = useState(!!success);
  const [showError, setShowError] = useState(!!error);

  useEffect(() => {
    if (success) {
      setShowSuccess(true);
      const timer = setTimeout(() => setShowSuccess(false), 3000);
      return () => clearTimeout(timer);
    }
    if (error) {
      setShowError(true);
      const timer = setTimeout(() => setShowError(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [success, error]);

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title="View Supervisor Assignment" />
      <div className="p-6 space-y-6">
        <Card className="shadow-md border-gray-200 dark:border-gray-700 p-4 rounded-lg bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900 dark:to-indigo-900">
          <CardHeader>
            <CardTitle className="text-2xl font-semibold text-gray-800 dark:text-gray-100">
              Supervisor Assignment Details - {company.name}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {showSuccess && success && (
              <Alert className="bg-green-50 dark:bg-green-900/50 border-green-200 dark:border-green-800">
                <AlertCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
                <AlertTitle className="text-green-800 dark:text-green-200 font-semibold">Success</AlertTitle>
                <AlertDescription className="text-green-700 dark:text-green-300 flex justify-between items-center">
                  {success}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowSuccess(false)}
                    className="text-green-800 dark:text-green-200 hover:bg-green-100 dark:hover:bg-green-800"
                    aria-label="Close success alert"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </AlertDescription>
              </Alert>
            )}
            {showError && error && (
              <Alert className="bg-red-50 dark:bg-red-900/50 border-red-200 dark:border-red-800">
                <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400" />
                <AlertTitle className="text-red-800 dark:text-red-200 font-semibold">Error</AlertTitle>
                <AlertDescription className="text-red-700 dark:text-red-300 flex justify-between items-center">
                  {error}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowError(false)}
                    className="text-red-800 dark:text-red-200 hover:bg-red-100 dark:hover:bg-red-800"
                    aria-label="Close error alert"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </AlertDescription>
              </Alert>
            )}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <p><strong>Supervisor Name:</strong> {assignment.supervisor_name}</p>
                <p><strong>Supervisor Email:</strong> {assignment.supervisor_email}</p>
                <p><strong>Supervisor Phone:</strong> {assignment.supervisor_phone || 'N/A'}</p>
                <p><strong>Supervisor Specialization:</strong> {assignment.supervisor_specialization || 'N/A'}</p>
              </div>
              <div>
                <p><strong>Student Name:</strong> {assignment.student_name}</p>
                <p><strong>Student CGPA:</strong> {assignment.student_cgpa || 'N/A'}</p>
              </div>
              <div>
                <p><strong>Posting Title:</strong> {assignment.posting_title}</p>
                <p><strong>Posting Type:</strong> {assignment.posting_type}</p>
              </div>
              <div>
                <p><strong>Status:</strong> <Badge variant="default">{assignment.status}</Badge></p>
                <p><strong>Assigned At:</strong> {new Date(assignment.assigned_at).toLocaleString()}</p>
              </div>
            </div>
            <Separator className="bg-gray-200 dark:bg-gray-600" />
            <Button
              asChild
              variant="outline"
              className="border-gray-300 dark:border-gray-600 rounded-full"
            >
              <Link href="/company-admin/supervisor-assignments">Back to Assignments</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}