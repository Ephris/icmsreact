import React from 'react';
import { Head, Link } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle, ArrowLeft, Download, FileText } from 'lucide-react';
import { type BreadcrumbItem } from '@/types';

interface Form {
  form_id: string;
  title: string;
  type: string;
  file_path: string;
  filename: string;
  advisor_name: string;
  student_name?: string;
  status: string;
  comments?: string;
  created_at: string;
}

interface Props {
  form: Form;
  success?: string;
  error?: string;
}

const breadcrumbs: BreadcrumbItem[] = [
  { title: 'Dashboard', href: '/student' },
  { title: 'Forms', href: '/student/forms' },
  { title: 'Form Details', href: null },
];

export default function FormsShow({ form, success, error }: Props) {
  const getTypeBadgeColor = (type: string) => {
    switch (type.toLowerCase()) {
      case 'progress_report':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300';
      case 'final_report':
        return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300';
      case 'midterm_evaluation':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-300';
    }
  };

  const getStatusBadgeColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300';
      case 'approved':
        return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300';
      case 'rejected':
        return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-300';
    }
  };

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title={`Form - ${form.title}`} />
      <div className="p-6 space-y-6">
        <Card className="shadow-md border-gray-200 dark:border-gray-700 p-4 rounded-lg bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900 dark:to-indigo-900">
          <CardHeader>
            <CardTitle className="text-2xl font-semibold text-gray-800 dark:text-gray-100 flex items-center gap-2">
              <FileText className="h-6 w-6" />
              {form.title}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {error && (
              <Alert className="bg-red-50 dark:bg-red-900/50 border-red-200 dark:border-red-800">
                <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400" />
                <AlertTitle className="text-red-800 dark:text-red-200 font-semibold">Error</AlertTitle>
                <AlertDescription className="text-red-700 dark:text-red-300">{error}</AlertDescription>
              </Alert>
            )}
            {success && (
              <Alert className="bg-green-50 dark:bg-green-900/50 border-green-200 dark:border-green-800">
                <AlertCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
                <AlertTitle className="text-green-800 dark:text-green-200 font-semibold">Success</AlertTitle>
                <AlertDescription className="text-green-700 dark:text-green-300">{success}</AlertDescription>
              </Alert>
            )}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Type</p>
                  <Badge className={getTypeBadgeColor(form.type)}>{form.type.replace('_', ' ')}</Badge>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Status</p>
                  <Badge className={getStatusBadgeColor(form.status)}>{form.status}</Badge>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">From</p>
                  <p className="text-gray-900 dark:text-gray-100 font-medium">{form.advisor_name}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Faculty Advisor</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">To</p>
                  <p className="text-gray-900 dark:text-gray-100 font-medium">{form.student_name || 'You'}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Student</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Sent Date</p>
                  <p className="text-gray-900 dark:text-gray-100">{new Date(form.created_at).toLocaleDateString()}</p>
                </div>
              </div>
              <div>
                {form.comments && (
                  <div>
                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">Comments</p>
                    <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                      <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">{form.comments}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
            <div className="flex gap-4">
              <Button
                asChild
                className="bg-indigo-600 text-white hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600 rounded-full"
              >
                <a href={`/download/form/${form.filename}`} download>
                  <Download className="h-4 w-4 mr-2" />
                  Download Form
                </a>
              </Button>
              <Button
                asChild
                variant="outline"
                className="border-gray-300 dark:border-gray-600 rounded-full"
              >
                <Link href="/student/forms">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Forms
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}