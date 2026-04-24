import React from 'react';
import { Head, Link } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ArrowLeft, Download, Calendar, Building2, MapPin, User } from 'lucide-react';

interface Analytics {
  analytics_id: number;
  student_name: string;
  student_email: string;
  student_university_id: string | null;
  posting_title: string;
  company_name: string;
  location: string;
  industry: string;
  work_type: string;
  start_date: string;
  end_date: string;
  duration_days: number;
  form_type: string;
  form_title: string;
  supervisor_comments: string | null;
  supervisor_name: string;
  submitted_at: string;
  form_file: string | null;
}

interface AnalyticsViewProps {
  analytics: Analytics;
  success?: string;
  error?: string;
}

export default function AnalyticsView({ analytics, success, error }: AnalyticsViewProps) {
  return (
    <AppLayout>
      <Head title="View Analytics" />
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Internship Analytics</h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              Analytics for {analytics.student_name}
            </p>
          </div>
          <Link href={route('department-head.completed-applications')}>
            <Button variant="outline">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Completed Applications
            </Button>
          </Link>
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
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Internship Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-start gap-2">
                  <Building2 className="w-5 h-5 mt-1 text-gray-500" />
                  <div className="flex-1">
                    <p className="text-sm text-gray-500 dark:text-gray-400">Posting</p>
                    <p className="font-medium text-lg">{analytics.posting_title}</p>
                  </div>
                </div>
                <Separator />
                <div className="flex items-start gap-2">
                  <Building2 className="w-5 h-5 mt-1 text-gray-500" />
                  <div className="flex-1">
                    <p className="text-sm text-gray-500 dark:text-gray-400">Company</p>
                    <p className="font-medium">{analytics.company_name}</p>
                  </div>
                </div>
                <Separator />
                <div className="flex items-start gap-2">
                  <MapPin className="w-5 h-5 mt-1 text-gray-500" />
                  <div className="flex-1">
                    <p className="text-sm text-gray-500 dark:text-gray-400">Location</p>
                    <p className="font-medium">{analytics.location}</p>
                  </div>
                </div>
                <Separator />
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Industry</p>
                  <p className="font-medium">{analytics.industry}</p>
                </div>
                <Separator />
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Work Type</p>
                  <Badge className="mt-1 capitalize">{analytics.work_type}</Badge>
                </div>
                <Separator />
                <div className="flex items-start gap-2">
                  <Calendar className="w-5 h-5 mt-1 text-gray-500" />
                  <div className="flex-1">
                    <p className="text-sm text-gray-500 dark:text-gray-400">Duration</p>
                    <p className="font-medium">
                      {new Date(analytics.start_date).toLocaleDateString()} - {new Date(analytics.end_date).toLocaleDateString()}
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                      {analytics.duration_days} days
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Evaluation Form</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Form Type</p>
                  <Badge className="mt-1 capitalize">{analytics.form_type.replace('_', ' ')}</Badge>
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Form Title</p>
                  <p className="font-medium">{analytics.form_title}</p>
                </div>
                {analytics.form_file && (
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">Form File</p>
                    <a href={analytics.form_file} target="_blank" rel="noopener noreferrer" download>
                      <Button variant="outline">
                        <Download className="w-4 h-4 mr-2" />
                        Download Form
                      </Button>
                    </a>
                  </div>
                )}
                {analytics.supervisor_comments && (
                  <>
                    <Separator />
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">Supervisor Comments</p>
                      <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">{analytics.supervisor_comments}</p>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Student Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-start gap-2">
                  <User className="w-5 h-5 mt-1 text-gray-500" />
                  <div className="flex-1">
                    <p className="text-sm text-gray-500 dark:text-gray-400">Student Name</p>
                    <p className="font-medium">{analytics.student_name}</p>
                  </div>
                </div>
                <Separator />
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Email</p>
                  <p className="font-medium">{analytics.student_email}</p>
                </div>
                {analytics.student_university_id && (
                  <>
                    <Separator />
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">University ID</p>
                      <p className="font-medium">{analytics.student_university_id}</p>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Submission Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-start gap-2">
                  <User className="w-5 h-5 mt-1 text-gray-500" />
                  <div className="flex-1">
                    <p className="text-sm text-gray-500 dark:text-gray-400">Supervisor</p>
                    <p className="font-medium">{analytics.supervisor_name}</p>
                  </div>
                </div>
                <Separator />
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Submitted At</p>
                  <p className="font-medium">
                    {new Date(analytics.submitted_at).toLocaleString()}
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}

