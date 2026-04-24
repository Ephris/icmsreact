import React, { useState, useEffect } from 'react';
import { Head, Link } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle, X } from 'lucide-react';
import { type BreadcrumbItem } from '@/types';

interface Application {
  application_id: number;
  posting_title: string;
  posting_type: string;
  industry: string;
  company_name: string;
  min_gpa: number | null;
  skills_required: string[];
  description: string;
  status: string;
  submitted_at: string | null;
  accepted_at: string | null;
  offer_expiration: string | null;
  resume_path: string | null;
  cover_letter_path: string | null;
  portfolio: string | null;
  skills: string[];
  certifications: string[];
  feedback?: {
    feedback_id: number;
    content: string;
    rating: number;
    advisor_name: string;
    created_at: string;
  } | null;
  last_updated_by: string;
}

interface Props {
  application: Application;
  success?: string;
  error?: string;
}

const breadcrumbs: BreadcrumbItem[] = [
  { title: 'Dashboard', href: '/student' },
  { title: 'Applications', href: '/student/applications' },
  { title: 'View Application', href: null },
];

export default function ApplicationView({ application, success, error }: Props) {
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

  const getStatusBadge = (status: string) => {
    const variants: { [key: string]: 'default' | 'secondary' | 'destructive' } = {
      pending: 'default',
      approved: 'secondary',
      accepted: 'secondary',
      rejected: 'destructive',
      inactive: 'secondary',
    };
    return <Badge variant={variants[status] || 'default'} className="capitalize">{status}</Badge>;
  };

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title={`Application: ${application.posting_title}`} />
      <div className="p-6 space-y-6">
        <Card className="shadow-lg border-none rounded-2xl overflow-hidden">
          <CardHeader className="bg-gradient-to-r from-indigo-500 to-blue-600 dark:from-indigo-700 dark:to-blue-800 p-6">
            <CardTitle className="text-2xl font-semibold text-white">
              Application for {application.posting_title}
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
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Application Details</CardTitle>
                </CardHeader>
                <CardContent>
                  <p><strong>Posting Title:</strong> {application.posting_title}</p>
                  <p><strong>Company:</strong> {application.company_name}</p>
                  <p><strong>Type:</strong> {application.posting_type}</p>
                  <p><strong>Industry:</strong> {application.industry}</p>
                  <p><strong>Status:</strong> {getStatusBadge(application.status)}</p>
                  <p><strong>Submitted At:</strong> {application.submitted_at ? new Date(application.submitted_at).toLocaleDateString() : 'N/A'}</p>
                  <p><strong>Accepted At:</strong> {application.accepted_at ? new Date(application.accepted_at).toLocaleDateString() : 'N/A'}</p>
                  <p><strong>Offer Expiration:</strong> {application.offer_expiration ? new Date(application.offer_expiration).toLocaleDateString() : 'N/A'}</p>
                  <p><strong>Last Updated By:</strong> {application.last_updated_by}</p>
                  <div>
                    <strong>Advisor Feedback:</strong>
                    {application.feedback ? (
                      <div className="mt-2 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="font-medium">Rating: {application.feedback.rating}/5</span>
                          <span className="text-sm text-gray-500">by {application.feedback.advisor_name}</span>
                        </div>
                        <p className="text-gray-700 dark:text-gray-300">{application.feedback.content}</p>
                        <p className="text-xs text-gray-500 mt-1">
                          {new Date(application.feedback.created_at).toLocaleDateString()}
                        </p>
                      </div>
                    ) : (
                      <span className="text-gray-500"> No feedback provided yet</span>
                    )}
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Submitted Materials</CardTitle>
                </CardHeader>
                <CardContent>
                  <p><strong>Resume:</strong> {application.resume_path ? <a href={application.resume_path} download className="text-blue-600 dark:text-blue-400">Download</a> : 'N/A'}</p>
                  <p><strong>Cover Letter:</strong> {application.cover_letter_path ? <a href={application.cover_letter_path} download className="text-blue-600 dark:text-blue-400">Download</a> : 'N/A'}</p>
                  <p><strong>Portfolio:</strong> {application.portfolio ? <a href={application.portfolio} target="_blank" className="text-blue-600 dark:text-blue-400">{application.portfolio}</a> : 'N/A'}</p>
                  <p><strong>Skills:</strong> {Array.isArray(application.skills) && application.skills.length > 0 ? application.skills.join(', ') : 'N/A'}</p>
                  <p><strong>Certifications:</strong> {Array.isArray(application.certifications) && application.certifications.length > 0 ? application.certifications.join(', ') : 'N/A'}</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Posting Details</CardTitle>
                </CardHeader>
                <CardContent>
                  <p><strong>Description:</strong> {application.description}</p>
                  <p><strong>Min GPA:</strong> {application.min_gpa ?? 'N/A'}</p>
                  <p><strong>Skills Required:</strong> {Array.isArray(application.skills_required) && application.skills_required.length > 0 ? application.skills_required.join(', ') : 'N/A'}</p>
                </CardContent>
              </Card>
            </div>
            <Button
              asChild
              variant="outline"
              className="border-gray-300 dark:border-gray-600 rounded-full"
            >
              <Link href="/student/applications">Back to Applications</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}