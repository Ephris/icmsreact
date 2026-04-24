import React, { useState } from 'react';
import { Head, useForm, Link, router } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle, X } from 'lucide-react';
import { type BreadcrumbItem } from '@/types';

interface Company {
  company_id: number;
  name: string;
}

interface Supervisor {
  user_id: number;
  name: string;
}

interface Assignment {
  assignment_id: number;
  supervisor_id: number;
  student_id: number;
  posting_id: number;
  status: string;
  student_name: string;
  posting_title: string;
}

interface Props {
  assignment: Assignment;
  supervisors: Supervisor[];
  company: Company;
  has_forms?: boolean;
  success?: string;
  error?: string;
}

const breadcrumbs: BreadcrumbItem[] = [
  { title: 'Dashboard', href: '/company-admin' },
  { title: 'Supervisor Assignments', href: '/company-admin/supervisor-assignments' },
  { title: 'Edit Assignment', href: null },
];

export default function SupervisorAssignmentsEdit({ assignment, supervisors, company, has_forms = false, success, error }: Props) {
  const { data, setData, put, processing, errors } = useForm({
    supervisor_id: assignment.supervisor_id.toString(),
    status: assignment.status,
  });
  
  const [showWarning, setShowWarning] = useState(false);

  const [showSuccess, setShowSuccess] = useState(!!success);
  const [showError, setShowError] = useState(!!error);

  React.useEffect(() => {
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

  const handleSupervisorChange = (value: string) => {
    setData('supervisor_id', value);
    // Show warning if supervisor is being changed and there are forms
    if (has_forms && value !== assignment.supervisor_id.toString()) {
      setShowWarning(true);
    } else {
      setShowWarning(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    put(`/company-admin/supervisor-assignments/${assignment.assignment_id}`, {
      onSuccess: () => {
        router.visit('/company-admin/supervisor-assignments');
      },
    });
  };

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title="Edit Supervisor Assignment" />
      <div className="p-6 space-y-6">
        <Card className="shadow-lg border-0 bg-gradient-to-br from-blue-50 via-white to-indigo-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 rounded-xl overflow-hidden">
          <CardHeader className="bg-gradient-to-r from-blue-600 to-indigo-600 p-6">
            <CardTitle className="text-2xl font-bold text-white">Edit Supervisor Assignment - {company.name}</CardTitle>
            <p className="text-blue-100 mt-1">Update supervisor assignment details</p>
          </CardHeader>
          <CardContent className="p-6 space-y-6">
            {showSuccess && success && (
              <Alert className="bg-green-50 dark:bg-green-900/50 border-green-200 dark:border-green-800 rounded-lg">
                <AlertCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
                <AlertTitle className="text-green-800 dark:text-green-200 font-semibold">Success</AlertTitle>
                <AlertDescription className="text-green-700 dark:text-green-300 flex justify-between items-center">
                  {success}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowSuccess(false)}
                    className="text-green-800 dark:text-green-200 hover:bg-green-100 dark:hover:bg-green-800"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </AlertDescription>
              </Alert>
            )}
            {showError && error && (
              <Alert className="bg-red-50 dark:bg-red-900/50 border-red-200 dark:border-red-800 rounded-lg">
                <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400" />
                <AlertTitle className="text-red-800 dark:text-red-200 font-semibold">Error</AlertTitle>
                <AlertDescription className="text-red-700 dark:text-red-300 flex justify-between items-center">
                  {error}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowError(false)}
                    className="text-red-800 dark:text-red-200 hover:bg-red-100 dark:hover:bg-red-800"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </AlertDescription>
              </Alert>
            )}
            {showWarning && has_forms && (
              <Alert className="bg-yellow-50 dark:bg-yellow-900/50 border-yellow-200 dark:border-yellow-800 rounded-lg">
                <AlertCircle className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
                <AlertTitle className="text-yellow-800 dark:text-yellow-200 font-semibold">Warning</AlertTitle>
                <AlertDescription className="text-yellow-700 dark:text-yellow-300">
                  You are trying to change the supervisor for this student. If this change is made, the data or forms that the advisor sent to the current supervisor will be gone forever. The forms will be automatically deleted and notifications will be sent to the advisor, student, and current supervisor. The advisor will need to attach or send a new form for the student's new supervisor.
                </AlertDescription>
              </Alert>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label className="text-sm font-semibold text-gray-700 dark:text-gray-200">Student</Label>
                  <div className="h-12 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 flex items-center text-gray-700 dark:text-gray-200">
                    {assignment.student_name}
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Student cannot be changed</p>
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-semibold text-gray-700 dark:text-gray-200">Posting</Label>
                  <div className="h-12 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 flex items-center text-gray-700 dark:text-gray-200">
                    {assignment.posting_title}
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Posting cannot be changed</p>
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-semibold text-gray-700 dark:text-gray-200">
                  Supervisor <span className="text-red-500">*</span>
                </Label>
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

              <div className="space-y-2">
                <Label className="text-sm font-semibold text-gray-700 dark:text-gray-200">
                  Status <span className="text-red-500">*</span>
                </Label>
                <Select value={data.status} onValueChange={(value) => setData('status', value)}>
                  <SelectTrigger className="border-gray-300 dark:border-gray-600 rounded-lg h-12 bg-white dark:bg-gray-800 shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                  </SelectContent>
                </Select>
                {errors.status && <p className="text-red-500 text-sm mt-1">{errors.status}</p>}
              </div>

              <div className="flex gap-4 pt-4">
                <Button
                  type="submit"
                  disabled={processing}
                  className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-lg px-8 py-2 font-semibold shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {processing ? 'Updating...' : 'Update Assignment'}
                </Button>
                <Button
                  asChild
                  variant="outline"
                  className="border-gray-300 dark:border-gray-600 rounded-lg px-8 py-2 hover:bg-gray-50 dark:hover:bg-gray-800"
                >
                  <Link href="/company-admin/supervisor-assignments">Cancel</Link>
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}

