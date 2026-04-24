import React, { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { CheckCircle, Eye, Search, FileText } from 'lucide-react';

interface Application {
  application_id: number;
  student_name: string;
  student_email: string;
  posting_title: string;
  accepted_at: string | null;
  analytics_id: number | null;
  analytics_submitted_at: string | null;
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

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    router.get(route('companyadmin.completed-applications'), { search }, { preserveState: true });
  };

  return (
    <AppLayout>
      <Head title="Completed Applications" />
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Completed Applications</h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              View students who have completed their internships
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
                      <TableHead>Posting</TableHead>
                      <TableHead>Accepted At</TableHead>
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
                        <TableCell>{app.posting_title}</TableCell>
                        <TableCell>
                          {app.accepted_at ? new Date(app.accepted_at).toLocaleDateString() : 'N/A'}
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
                            <Link href={route('companyadmin.analytics.view', app.analytics_id)}>
                              <Button size="sm" variant="outline">
                                <Eye className="w-4 h-4 mr-1" />
                                View Analytics
                              </Button>
                            </Link>
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
                        onClick={() => router.get(route('companyadmin.completed-applications'), { page })}
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
      </div>
    </AppLayout>
  );
}

