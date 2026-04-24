import React, { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { CheckCircle, Eye, Search, FileText } from 'lucide-react';

interface Application {
  application_id: number;
  student_name: string;
  student_email: string;
  student_university_id: string | null;
  posting_title: string;
  accepted_at: string | null;
  analytics_id: number | null;
  analytics_submitted_at: string | null;
  advisor_score?: number | null;
  advisor_score_out_of?: number | null;
  dept_head_score?: number | null;
  dept_head_score_out_of?: number | null;
  dept_head_evaluation?: string | null;
  final_score?: number | null;
}

interface CompletedApplicationsProps {
  applications: {
    data: Application[];
    current_page: number;
    last_page: number;
    total: number;
  };
  filters: {
    search?: string;
    sort_by?: string;
    sort_dir?: string;
  };
  success?: string;
  error?: string;
}

export default function CompletedApplications({
  applications,
  filters,
  success,
  error,
}: CompletedApplicationsProps) {
  const [search, setSearch] = useState(filters.search || '');
  const [openScoreId, setOpenScoreId] = useState<number | null>(null);
  const [juryScore, setJuryScore] = useState<string>('');
  const [juryScoreOutOf, setJuryScoreOutOf] = useState<string>('');
  const [juryEvaluation, setJuryEvaluation] = useState<string>('');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    router.get(route('department-head.completed-applications'), { search }, { preserveState: true });
  };

  const submitJuryScore = (analyticsId: number) => {
    router.post(route('department-head.analytics.jury-score', analyticsId), {
      score: Number(juryScore),
      score_out_of: Number(juryScoreOutOf),
      evaluation: juryEvaluation,
    }, {
      preserveScroll: true,
      onSuccess: () => {
        setOpenScoreId(null);
        setJuryScore('');
        setJuryScoreOutOf('');
        setJuryEvaluation('');
      },
    });
  };

  return (
    <AppLayout>
      <Head title="Completed Applications" />
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Completed Applications</h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              View students from your department who have completed their internships
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

        <Card>
          <CardHeader>
            <CardTitle>Completed Internships</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="mb-4">
              <form onSubmit={handleSearch} className="flex gap-2">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    type="text"
                    placeholder="Search by student name or email..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <Button type="submit">Search</Button>
              </form>
            </div>

            {applications.data.length === 0 ? (
              <div className="text-center py-8">
                <FileText className="mx-auto h-12 w-12 text-gray-400" />
                <p className="mt-4 text-gray-600 dark:text-gray-400">
                  No completed applications found.
                </p>
              </div>
            ) : (
              <>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Student</TableHead>
                      <TableHead>UNid</TableHead>
                      <TableHead>Posting</TableHead>
                      <TableHead>Accepted At</TableHead>
                      <TableHead>Scores</TableHead>
                      <TableHead>Analytics Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {applications.data.map((app) => (
                      <TableRow key={app.application_id}>
                        <TableCell>
                          <div>
                            <div className="font-medium">{app.student_name}</div>
                            <div className="text-sm text-gray-500 dark:text-gray-400">{app.student_email}</div>
                          </div>
                        </TableCell>
                        <TableCell>{app.student_university_id || 'N/A'}</TableCell>
                        <TableCell>{app.posting_title}</TableCell>
                        <TableCell>
                          {app.accepted_at ? new Date(app.accepted_at).toLocaleDateString() : 'N/A'}
                        </TableCell>
                        <TableCell>
                          <div className="text-sm space-y-1">
                            <div>
                              Advisor:{' '}
                              {app.advisor_score != null && app.advisor_score_out_of != null
                                ? `${app.advisor_score} / ${app.advisor_score_out_of}`
                                : '—'}
                            </div>
                            <div>
                              Jury:{' '}
                              {app.dept_head_score != null && app.dept_head_score_out_of != null
                                ? `${app.dept_head_score} / ${app.dept_head_score_out_of}`
                                : '—'}
                            </div>
                            <div className="font-semibold">
                              Final:{' '}
                              {app.final_score != null
                                ? `${app.final_score}/100`
                                : '—'}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          {app.analytics_id ? (
                            <Badge className="bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300">
                              <CheckCircle className="w-3 h-3 mr-1" />
                              Submitted
                            </Badge>
                          ) : (
                            <Badge variant="outline">Pending</Badge>
                          )}
                        </TableCell>
                        <TableCell>
                          {app.analytics_id ? (
                            <div className="flex gap-2">
                              <Link href={route('department-head.analytics.view', app.analytics_id)}>
                                <Button size="sm" variant="outline">
                                  <Eye className="w-4 h-4 mr-1" />
                                  View Analytics
                                </Button>
                              </Link>
                              <Button
                                size="sm"
                                variant="secondary"
                                onClick={() => {
                                  setOpenScoreId(app.analytics_id!);
                                  // Pre-fill form if score exists
                                  if (app.dept_head_score != null && app.dept_head_score_out_of != null) {
                                    setJuryScore(app.dept_head_score.toString());
                                    setJuryScoreOutOf(app.dept_head_score_out_of.toString());
                                    setJuryEvaluation(app.dept_head_evaluation || '');
                                  } else {
                                    setJuryScore('');
                                    setJuryScoreOutOf('');
                                    setJuryEvaluation('');
                                  }
                                }}
                              >
                                {app.dept_head_score != null ? 'Edit Jury Score' : 'Add Jury Result'}
                              </Button>
                            </div>
                          ) : (
                            <span className="text-sm text-gray-500 dark:text-gray-400">Waiting for analytics</span>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>

                {applications.last_page > 1 && (
                  <div className="mt-4 flex justify-center gap-2">
                    {Array.from({ length: applications.last_page }, (_, i) => i + 1).map((page) => (
                      <Button
                        key={page}
                        variant={page === applications.current_page ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => router.get(route('department-head.completed-applications'), { page })}
                      >
                        {page}
                      </Button>
                    ))}
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>

        {/* Jury score modal */}
        <Dialog open={openScoreId !== null} onOpenChange={(open) => {
          if (!open) {
            setOpenScoreId(null);
            setJuryScore('');
            setJuryScoreOutOf('');
            setJuryEvaluation('');
          }
        }}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Jury Evaluation</DialogTitle>
              <DialogDescription>Enter the department head score and notes.</DialogDescription>
            </DialogHeader>
            <div className="space-y-3">
              <div>
                <label className="text-sm font-medium">Score</label>
                <Input
                  type="number"
                  min={0}
                  value={juryScore}
                  onChange={(e) => setJuryScore(e.target.value)}
                  placeholder="e.g. 60"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Out Of</label>
                <Input
                  type="number"
                  min={1}
                  max={100}
                  value={juryScoreOutOf}
                  onChange={(e) => setJuryScoreOutOf(e.target.value)}
                  placeholder="e.g. 50 (must sum to 100 with advisor)"
                />
                <p className="text-xs text-gray-500 mt-1">The sum of advisor and department head "out of" values must equal 100</p>
              </div>
              <div>
                <label className="text-sm font-medium">Evaluation (optional)</label>
                <Textarea
                  value={juryEvaluation}
                  onChange={(e) => setJuryEvaluation(e.target.value)}
                  placeholder="Notes about performance"
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setOpenScoreId(null)}>Cancel</Button>
              <Button onClick={() => openScoreId && submitJuryScore(openScoreId)} disabled={!juryScore || !juryScoreOutOf}>
                Submit
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </AppLayout>
  );
}

