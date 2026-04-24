import React, { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Search, FileText, Eye } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';

interface Analytics {
  analytics_id: number;
  student_name: string;
  student_email: string;
  posting_title: string;
  company_name: string;
  supervisor_name: string;
  submitted_at: string;
  form_title: string;
  advisor_score?: number | null;
  advisor_score_out_of?: number | null;
  advisor_evaluation?: string | null;
  dept_head_score?: number | null;
  dept_head_score_out_of?: number | null;
  final_score?: number | null;
}

interface AnalyticsIndexProps {
  analytics: {
    data: Analytics[];
    current_page: number;
    last_page: number;
    total: number;
  };
  success?: string;
  error?: string;
}

export default function AnalyticsIndex({ analytics, success, error }: AnalyticsIndexProps) {
  const [search, setSearch] = useState('');
  const [openScoreId, setOpenScoreId] = useState<number | null>(null);
  const [advisorScore, setAdvisorScore] = useState<string>('');
  const [advisorScoreOutOf, setAdvisorScoreOutOf] = useState<string>('');
  const [advisorEvaluation, setAdvisorEvaluation] = useState<string>('');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    router.get(route('faculty-advisor.analytics.index'), { search }, { preserveState: true });
  };

  const submitAdvisorScore = (analyticsId: number) => {
    router.post(route('faculty-advisor.analytics.advisor-score', analyticsId), {
      score: Number(advisorScore),
      score_out_of: Number(advisorScoreOutOf),
      evaluation: advisorEvaluation,
    }, {
      preserveScroll: true,
      onSuccess: () => {
        setOpenScoreId(null);
        setAdvisorScore('');
        setAdvisorScoreOutOf('');
        setAdvisorEvaluation('');
      },
    });
  };

  return (
    <AppLayout>
      <Head title="Student Analytics" />
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Student Analytics</h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              View analytics for your assigned students who have completed their internships
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
            <CardTitle>Completed Internship Analytics</CardTitle>
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

            {analytics.data.length === 0 ? (
              <div className="text-center py-8">
                <FileText className="mx-auto h-12 w-12 text-gray-400" />
                <p className="mt-4 text-gray-600 dark:text-gray-400">
                  No analytics found for your assigned students.
                </p>
              </div>
            ) : (
              <>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Student</TableHead>
                      <TableHead>Posting</TableHead>
                      <TableHead>Company</TableHead>
                      <TableHead>Supervisor</TableHead>
                      <TableHead>Form Title</TableHead>
                    <TableHead>Scores</TableHead>
                      <TableHead>Submitted At</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {analytics.data.map((item) => (
                      <TableRow key={item.analytics_id}>
                        <TableCell>
                          <div>
                            <div className="font-medium">{item.student_name}</div>
                            <div className="text-sm text-gray-500 dark:text-gray-400">{item.student_email}</div>
                          </div>
                        </TableCell>
                        <TableCell>{item.posting_title}</TableCell>
                        <TableCell>{item.company_name}</TableCell>
                        <TableCell>{item.supervisor_name}</TableCell>
                        <TableCell>{item.form_title}</TableCell>
                        <TableCell>
                          <div className="text-sm space-y-1">
                            <div>
                              Advisor:{' '}
                              {item.advisor_score != null && item.advisor_score_out_of != null
                                ? `${item.advisor_score} / ${item.advisor_score_out_of}`
                                : '—'}
                            </div>
                            <div>
                              Jury:{' '}
                              {item.dept_head_score != null && item.dept_head_score_out_of != null
                                ? `${item.dept_head_score} / ${item.dept_head_score_out_of}`
                                : '—'}
                            </div>
                            <div className="font-semibold">
                              Final:{' '}
                              {item.final_score != null
                                ? `${item.final_score}/100`
                                : '—'}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          {new Date(item.submitted_at).toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Link href={route('faculty-advisor.analytics.view', item.analytics_id)}>
                              <Button size="sm" variant="outline">
                                <Eye className="w-4 h-4 mr-1" />
                                View
                              </Button>
                            </Link>
                            <Button 
                              size="sm" 
                              variant="secondary" 
                              onClick={() => {
                                setOpenScoreId(item.analytics_id);
                                // Pre-fill form if score exists
                                if (item.advisor_score != null && item.advisor_score_out_of != null) {
                                  setAdvisorScore(item.advisor_score.toString());
                                  setAdvisorScoreOutOf(item.advisor_score_out_of.toString());
                                  setAdvisorEvaluation(item.advisor_evaluation || '');
                                } else {
                                  setAdvisorScore('');
                                  setAdvisorScoreOutOf('');
                                  setAdvisorEvaluation('');
                                }
                              }}
                            >
                              {item.advisor_score != null ? 'Edit Advisor Result' : 'Add Advisor Result'}
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>

                {analytics.last_page > 1 && (
                  <div className="mt-4 flex justify-center gap-2">
                    {Array.from({ length: analytics.last_page }, (_, i) => i + 1).map((page) => (
                      <Button
                        key={page}
                        variant={page === analytics.current_page ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => router.get(route('faculty-advisor.analytics.index'), { page })}
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

        {/* Advisor score modal */}
        <Dialog open={openScoreId !== null} onOpenChange={(open) => {
          if (!open) {
            setOpenScoreId(null);
            setAdvisorScore('');
            setAdvisorScoreOutOf('');
            setAdvisorEvaluation('');
          }
        }}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Advisor Evaluation</DialogTitle>
              <DialogDescription>Enter the advisor score and notes.</DialogDescription>
            </DialogHeader>
            <div className="space-y-3">
              <div>
                <label className="text-sm font-medium">Score</label>
                <Input
                  type="number"
                  min={0}
                  value={advisorScore}
                  onChange={(e) => setAdvisorScore(e.target.value)}
                  placeholder="e.g. 40"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Out Of</label>
                <Input
                  type="number"
                  min={1}
                  max={100}
                  value={advisorScoreOutOf}
                  onChange={(e) => setAdvisorScoreOutOf(e.target.value)}
                  placeholder="e.g. 50 (must sum to 100 with dept head)"
                />
                <p className="text-xs text-gray-500 mt-1">The sum of advisor and department head "out of" values must equal 100</p>
              </div>
              <div>
                <label className="text-sm font-medium">Evaluation (optional)</label>
                <Textarea
                  value={advisorEvaluation}
                  onChange={(e) => setAdvisorEvaluation(e.target.value)}
                  placeholder="Notes about performance"
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setOpenScoreId(null)}>Cancel</Button>
              <Button onClick={() => openScoreId && submitAdvisorScore(openScoreId)} disabled={!advisorScore || !advisorScoreOutOf}>
                Submit
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </AppLayout>
  );
}

