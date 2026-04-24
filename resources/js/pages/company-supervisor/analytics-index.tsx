import React from 'react';
import AppLayout from '@/layouts/app-layout';
import { Head, Link } from '@inertiajs/react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { FileText, CheckCircle, Clock } from 'lucide-react';

interface CompletedStudent {
  assignment_id: number;
  student_id: number;
  student_name: string;
  student_email: string;
  posting_title: string;
  company_name: string;
  end_date: string;
  days_past: number;
  has_analytics: boolean;
  application_id: number | null;
}

interface SubmittedAnalytics {
  analytics_id: number;
  student_id: number;
  student_name: string;
  student_email: string;
  posting_title: string;
  company_name: string;
  form_type: string;
  form_title: string;
  submitted_at: string;
  advisor_score?: number | null;
  advisor_score_out_of?: number | null;
  dept_head_score?: number | null;
  dept_head_score_out_of?: number | null;
  final_score?: number | null;
}

interface AnalyticsIndexProps {
  completedStudents: CompletedStudent[];
  submittedAnalytics: SubmittedAnalytics[];
  success?: string;
  error?: string;
}

const AnalyticsIndex: React.FC<AnalyticsIndexProps> = ({
  completedStudents,
  submittedAnalytics,
  success,
  error,
}) => {
  return (
    <AppLayout>
      <Head title="Internship Analytics" />
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Internship Analytics</h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              Submit analytics for students who have completed their internships
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

        {/* Pending / not-yet-submitted analytics */}
        <Card>
          <CardHeader>
            <CardTitle>Completed Internships</CardTitle>
            <CardDescription>
              Students with internships that have ended. Submit analytics to complete the process.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {completedStudents.length === 0 ? (
              <div className="text-center py-8">
                <FileText className="mx-auto h-12 w-12 text-gray-400" />
                <p className="mt-4 text-gray-600 dark:text-gray-400">
                  No completed internships found. Analytics can be submitted once internships have ended.
                </p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Student</TableHead>
                    <TableHead>Posting</TableHead>
                    <TableHead>Company</TableHead>
                    <TableHead>End Date</TableHead>
                    <TableHead>Days Past</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {completedStudents.map((student) => (
                    <TableRow key={student.assignment_id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{student.student_name}</div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">{student.student_email}</div>
                        </div>
                      </TableCell>
                      <TableCell>{student.posting_title}</TableCell>
                      <TableCell>{student.company_name}</TableCell>
                      <TableCell>{new Date(student.end_date).toLocaleDateString()}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{student.days_past} days</Badge>
                      </TableCell>
                      <TableCell>
                        {student.has_analytics ? (
                          <Badge className="bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300">
                            <CheckCircle className="w-3 h-3 mr-1" />
                            Submitted
                          </Badge>
                        ) : (
                          <Badge className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300">
                            <Clock className="w-3 h-3 mr-1" />
                            Pending
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        {student.has_analytics ? (
                          <span className="text-sm text-gray-500 dark:text-gray-400">Already submitted</span>
                        ) : (
                          <Link href={route('company-supervisor.analytics.create', student.student_id)}>
                            <Button size="sm">Submit Analytics</Button>
                          </Link>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        {/* Submitted analytics history */}
        <Card>
          <CardHeader>
            <CardTitle>Submitted Analytics</CardTitle>
            <CardDescription>
              Analytics you have already submitted for completed internships.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {submittedAnalytics.length === 0 ? (
              <div className="text-center py-8">
                <FileText className="mx-auto h-12 w-12 text-gray-400" />
                <p className="mt-4 text-gray-600 dark:text-gray-400">
                  No analytics have been submitted yet.
                </p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Student</TableHead>
                    <TableHead>Posting</TableHead>
                    <TableHead>Company</TableHead>
                    <TableHead>Form</TableHead>
                    <TableHead>Submitted At</TableHead>
                    <TableHead>Scores</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {submittedAnalytics.map((item) => (
                    <TableRow key={item.analytics_id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{item.student_name}</div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">
                            {item.student_email}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>{item.posting_title}</TableCell>
                      <TableCell>{item.company_name}</TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <div className="font-medium">{item.form_title}</div>
                          <div className="text-xs text-gray-500 dark:text-gray-400 capitalize">
                            {item.form_type.replace('_', ' ')}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        {item.submitted_at
                          ? new Date(item.submitted_at).toLocaleString()
                          : 'N/A'}
                      </TableCell>
                      <TableCell>
                        <div className="text-sm space-y-1">
                          <div>Advisor: {item.advisor_score != null ? 'Added' : 'Not added'}</div>
                          <div>Jury: {item.dept_head_score != null ? 'Added' : 'Not added'}</div>
                          <div className="font-semibold">Final: {item.final_score != null ? 'Calculated' : 'Pending'}</div>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
};

export default AnalyticsIndex;

