import React, { useState } from 'react';
import AppLayout from '@/layouts/app-layout';
import { Head, router } from '@inertiajs/react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Search, Clock, ShieldAlert } from 'lucide-react';

interface StudentRow {
  student_id: number;
  name: string;
  email: string;
  department?: string | null;
  final_score?: number | null;
  advisor_score?: number | null;
  dept_head_score?: number | null;
  account_deactivation_date?: string | null;
  status: string;
  analytics_id?: number | null;
}

interface Props {
  students: StudentRow[];
  success?: string;
  error?: string;
}

export default function AdminDeactivations({ students, success, error }: Props) {
  const [search, setSearch] = useState('');

  const filtered = students.filter((s) =>
    s.name.toLowerCase().includes(search.toLowerCase()) ||
    s.email.toLowerCase().includes(search.toLowerCase())
  );

  const eligible = filtered.filter((s) => s.status === 'active');
  const deactivated = filtered.filter((s) => s.status !== 'active');

  const schedule = (studentId: number) => {
    router.post(route('admin.deactivations.schedule', studentId), {}, { preserveScroll: true });
  };

  return (
    <AppLayout>
      <Head title="Student Deactivations" />
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Student Deactivations</h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Schedule deactivation for students with completed internships and final scores.
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
            <CardTitle>Eligible Students</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2">
              <div className="relative w-full md:w-96">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search by name or email"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <div className="rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden">
              <Table>
                <TableHeader className="bg-gray-50 dark:bg-gray-900/30">
                  <TableRow>
                    <TableHead>Student</TableHead>
                    <TableHead>Department</TableHead>
                    <TableHead>Scores</TableHead>
                    <TableHead>Deactivation</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {eligible.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-6 text-gray-500">
                        No students found.
                      </TableCell>
                    </TableRow>
                  ) : (
                    eligible.map((student) => {
                      const deact = student.account_deactivation_date;
                      const inactive = student.status !== 'active';
                      const hasDeactivationDate = deact && deact !== null;
                      
                      // Calculate days remaining until deactivation
                      let daysRemaining = null;
                      if (hasDeactivationDate) {
                        const deactivationDate = new Date(deact);
                        const today = new Date();
                        const diffTime = deactivationDate.getTime() - today.getTime();
                        daysRemaining = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                      }
                      
                      const isButtonDisabled = inactive || hasDeactivationDate || !student.advisor_score || !student.dept_head_score;
                      
                      const handleButtonClick = () => {
                        if (hasDeactivationDate) {
                          // Show message that student is already scheduled for deactivation
                          alert('Student is already scheduled for deactivation.');
                        } else {
                          schedule(student.student_id);
                        }
                      };
                      
                      return (
                        <TableRow key={student.student_id}>
                          <TableCell>
                            <div className="font-medium">{student.name}</div>
                            <div className="text-sm text-gray-500 dark:text-gray-400">{student.email}</div>
                          </TableCell>
                          <TableCell>{student.department || 'N/A'}</TableCell>
                          <TableCell>
                            <div className="text-sm">
                              <div>Advisor: {student.advisor_score ? 'Added' : 'Not added'}</div>
                              <div>Jury: {student.dept_head_score ? 'Added' : 'Not added'}</div>
                              <div className="font-semibold">Final: {student.final_score ? 'Calculated' : 'Pending'}</div>
                            </div>
                          </TableCell>
                          <TableCell>
                            {hasDeactivationDate ? (
                              <div className="flex items-center gap-2 text-sm text-orange-700 dark:text-orange-300">
                                <Clock className="h-4 w-4" />
                                <div>
                                  <div>Deactivate Pending</div>
                                  {daysRemaining !== null && daysRemaining > 0 && (
                                    <div className="text-xs font-semibold">
                                      {daysRemaining} {daysRemaining === 1 ? 'day' : 'days'} remaining
                                    </div>
                                  )}
                                  {daysRemaining !== null && daysRemaining <= 0 && (
                                    <div className="text-xs font-semibold text-red-600 dark:text-red-400">
                                      Overdue
                                    </div>
                                  )}
                                </div>
                              </div>
                            ) : (
                              <span className="text-sm text-gray-500">Not scheduled</span>
                            )}
                          </TableCell>
                          <TableCell>
                            <Badge variant={inactive ? 'destructive' : 'secondary'} className={inactive ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-200' : ''}>
                              {inactive ? 'inactive' : 'active'}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <Button
                              size="sm"
                              variant={hasDeactivationDate ? "secondary" : "destructive"}
                              onClick={handleButtonClick}
                              disabled={isButtonDisabled}
                              title={
                                inactive 
                                  ? 'Already inactive' 
                                  : hasDeactivationDate
                                  ? 'Deactivation already scheduled'
                                  : (!student.advisor_score || !student.dept_head_score) 
                                  ? 'Both scores must be submitted' 
                                  : 'Deactivate in 30 days'
                              }
                            >
                              <ShieldAlert className="h-4 w-4 mr-2" />
                              {hasDeactivationDate ? 'Deactivate Pending' : 'Deactivate in 30 days'}
                            </Button>
                          </TableCell>
                        </TableRow>
                      );
                    })
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        {/* Deactivated students table */}
        <Card>
          <CardHeader>
            <CardTitle>Deactivated Students</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden">
              <Table>
                <TableHeader className="bg-gray-50 dark:bg-gray-900/30">
                  <TableRow>
                    <TableHead>Student</TableHead>
                    <TableHead>Department</TableHead>
                    <TableHead>Scores</TableHead>
                    <TableHead>Deactivation</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {deactivated.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-6 text-gray-500">
                        No deactivated students yet.
                      </TableCell>
                    </TableRow>
                  ) : (
                    deactivated.map((student) => (
                      <TableRow key={student.student_id}>
                        <TableCell>
                          <div className="font-medium">{student.name}</div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">{student.email}</div>
                        </TableCell>
                        <TableCell>{student.department || 'N/A'}</TableCell>
                        <TableCell>
                          <div className="text-sm">
                            <div>Advisor: {student.advisor_score ? 'Added' : 'Not added'}</div>
                            <div>Jury: {student.dept_head_score ? 'Added' : 'Not added'}</div>
                            <div className="font-semibold">Final: {student.final_score ? 'Calculated' : 'Pending'}</div>
                          </div>
                        </TableCell>
                        <TableCell>
                          {student.account_deactivation_date ? (
                            <div className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
                              <Clock className="h-4 w-4" />
                              Deactivated: {student.account_deactivation_date}
                            </div>
                          ) : (
                            <span className="text-sm text-gray-500">Not scheduled</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <Badge variant="destructive" className="bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-200">
                            inactive
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}

