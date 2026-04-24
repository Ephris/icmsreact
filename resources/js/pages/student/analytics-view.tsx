import React from 'react';
import { Head, Link } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ArrowLeft, Calendar, Building2, MapPin, FileText, User, CheckCircle } from 'lucide-react';

interface Analytics {
  analytics_id: number;
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
  advisor_score?: number | null;
  advisor_score_out_of?: number | null;
  dept_head_score?: number | null;
  dept_head_score_out_of?: number | null;
  final_score?: number | null;
  advisor_evaluation?: string | null;
  dept_head_evaluation?: string | null;
}

interface AnalyticsViewProps {
  analytics: Analytics;
  success?: string;
  error?: string;
}

export default function AnalyticsView({ analytics, success, error }: AnalyticsViewProps) {
  return (
    <AppLayout>
      <Head title="My Internship Analytics" />
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">My Internship Analytics</h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              View your completed internship evaluation
            </p>
          </div>
          <Link href={route('student.applications')}>
            <Button variant="outline">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Applications
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

        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <CheckCircle className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5" />
            <div>
              <p className="font-medium text-blue-900 dark:text-blue-200">
                Analytics Submitted Successfully
              </p>
              <p className="text-sm text-blue-700 dark:text-blue-300 mt-1">
                Your internship analytics have been submitted. The evaluation form has been sent to your advisor, department head, and coordinator for review.
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader>
              <CardTitle>Final Score</CardTitle>
              <CardDescription>Combined advisor and jury (department head) evaluation.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold text-gray-900 dark:text-white">
                {analytics.final_score ?? '—'}/100
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Advisor Score</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-semibold text-gray-900 dark:text-white">
                {analytics.advisor_score !== null && analytics.advisor_score !== undefined
                  ? `${analytics.advisor_score}${analytics.advisor_score_out_of ? ` / ${analytics.advisor_score_out_of}` : ''}`
                  : '—'}
              </div>
              {analytics.advisor_evaluation && (
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-2 whitespace-pre-wrap">
                  {analytics.advisor_evaluation}
                </p>
              )}
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Jury Score</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-semibold text-gray-900 dark:text-white">
                {analytics.dept_head_score !== null && analytics.dept_head_score !== undefined
                  ? `${analytics.dept_head_score}${analytics.dept_head_score_out_of ? ` / ${analytics.dept_head_score_out_of}` : ''}`
                  : '—'}
              </div>
              {analytics.dept_head_evaluation && (
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-2 whitespace-pre-wrap">
                  {analytics.dept_head_evaluation}
                </p>
              )}
            </CardContent>
          </Card>
        </div>

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
                <CardTitle className="flex items-center gap-2">
                  <FileText className="w-5 h-5" />
                  Evaluation Form
                </CardTitle>
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
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    The evaluation form has been sent to your advisor and department head for review.
                  </p>
                </div>
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
                <CardTitle>Supervisor</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-start gap-2">
                  <User className="w-5 h-5 mt-1 text-gray-500" />
                  <div className="flex-1">
                    <p className="text-sm text-gray-500 dark:text-gray-400">Supervisor Name</p>
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

