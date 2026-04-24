import React, { useState } from 'react';
import { Head, router } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { CheckCircle, Search, FileText } from 'lucide-react';

interface Application {
  application_id: number;
  student_name: string;
  student_email: string;
  student_university_id: string | null;
  year_of_study?: string | null;
  department_name: string;
  posting_title: string;
  company_name: string;
  accepted_at: string | null;
  analytics_id: number | null;
  analytics_submitted_at: string | null;
  advisor_score?: number | null;
  dept_head_score?: number | null;
  final_score?: number | null;
}

interface Department {
  department_id: number;
  name: string;
}

interface CompletedStudentsProps {
  applications: {
    data: Application[];
    current_page: number;
    last_page: number;
    total: number;
  };
  departments: Department[];
  filters: {
    department_id?: string | number;
    search?: string;
    sort_by?: string;
    sort_dir?: string;
  };
  success?: string;
  error?: string;
}

export default function CompletedStudents({
  applications,
  departments,
  filters,
  success,
  error,
}: CompletedStudentsProps) {
  const [search, setSearch] = useState(filters.search || '');
  const [departmentFilter, setDepartmentFilter] = useState(filters.department_id?.toString() || 'all');
  const [showScores, setShowScores] = useState(false);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    router.get(
      route('coordinator.completed-students'),
      { search, department_id: departmentFilter === 'all' ? '' : departmentFilter },
      { preserveState: true }
    );
  };

  return (
    <AppLayout>
      <Head title="Completed Students with Internship" />
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Completed Students with Internship</h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              View all students who have completed their internships
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
            <div className="mb-4 flex flex-col gap-2">
              <div className="flex gap-2">
                <Select
                  value={departmentFilter}
                  onValueChange={setDepartmentFilter}
                >
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="All Departments" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Departments</SelectItem>
                    {departments.map((dept) => (
                      <SelectItem key={dept.department_id} value={dept.department_id.toString()}>
                        {dept.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
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
                <Button type="submit" onClick={handleSearch}>Search</Button>
              </div>
              <div className="flex justify-end">
                <Button variant="outline" onClick={() => setShowScores(!showScores)}>
                  {showScores ? 'Hide Scores' : 'Show Scores'}
                </Button>
              </div>
            </div>

            {applications.data.length === 0 ? (
              <div className="text-center py-8">
                <FileText className="mx-auto h-12 w-12 text-gray-400" />
                <p className="mt-4 text-gray-600 dark:text-gray-400">
                  No completed students found.
                </p>
              </div>
            ) : (
              <>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Student</TableHead>
                      <TableHead>UNid</TableHead>
                      <TableHead>Department</TableHead>
                      <TableHead>Year</TableHead>
                      <TableHead>Posting</TableHead>
                      <TableHead>Company</TableHead>
                      <TableHead>Accepted At</TableHead>
                      {showScores && <TableHead>Scores</TableHead>}
                      <TableHead>Analytics Status</TableHead>
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
                        <TableCell>{app.department_name}</TableCell>
                        <TableCell>{app.year_of_study || 'N/A'}</TableCell>
                        <TableCell>{app.posting_title}</TableCell>
                        <TableCell>{app.company_name}</TableCell>
                        <TableCell>
                          {app.accepted_at ? new Date(app.accepted_at).toLocaleDateString() : 'N/A'}
                        </TableCell>
                        {showScores && (
                          <TableCell>
                            <div className="text-sm space-y-1">
                              <div>Advisor: {app.advisor_score ? 'Added' : 'Not added'}</div>
                              <div>Jury: {app.dept_head_score ? 'Added' : 'Not added'}</div>
                              <div className="font-semibold">Final: {app.final_score ? 'Calculated' : 'Pending'}</div>
                            </div>
                          </TableCell>
                        )}
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
                        onClick={() => router.get(route('coordinator.completed-students'), { page, search, department_id: departmentFilter === 'all' ? '' : departmentFilter })}
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

