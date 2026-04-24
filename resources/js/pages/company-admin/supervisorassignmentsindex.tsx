import React, { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Pagination, PaginationContent, PaginationItem, PaginationLink } from '@/components/ui/pagination';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Badge } from '@/components/ui/badge';
import { ArrowUpDown, Eye } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { AlertCircle, X, Trash2 } from 'lucide-react';
import { type BreadcrumbItem } from '@/types';

interface Company {
  company_id: number;
  name: string;
}

interface Assignment {
  assignment_id: number;
  supervisor_name: string;
  student_name: string;
  posting_title: string;
  status: string;
  assigned_at: string;
}

interface PaginationData {
  data: Assignment[];
  current_page: number;
  last_page: number;
  next_page_url: string | null;
  prev_page_url: string | null;
  total: number;
}

interface Props {
  company: Company;
  assignments: PaginationData;
  filters: {
    sort_by?: string;
    sort_dir?: string;
  };
  success?: string;
  error?: string;
}

const breadcrumbs: BreadcrumbItem[] = [
  { title: 'Dashboard', href: '/company-admin' },
  { title: 'Supervisor Assignments', href: '/company-admin/supervisor-assignments' },
];

export default function SupervisorAssignmentsIndex({ company, assignments, filters, success, error }: Props) {
  const [showSuccess, setShowSuccess] = useState(!!success);
  const [showError, setShowError] = useState(!!error);
  const [sortBy, setSortBy] = useState(filters.sort_by || 'assigned_at');
  const [sortDir, setSortDir] = useState(filters.sort_dir || 'desc');

  // Auto-hide alerts after 5 seconds
  React.useEffect(() => {
    if (success) {
      const timer = setTimeout(() => setShowSuccess(false), 5000);
      return () => clearTimeout(timer);
    }
  }, [success]);

  React.useEffect(() => {
    if (error) {
      const timer = setTimeout(() => setShowError(false), 5000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  const handleSort = (column: string) => {
    const newDir = sortBy === column && sortDir === 'asc' ? 'desc' : 'asc';
    setSortBy(column);
    setSortDir(newDir);
    router.get('/company-admin/supervisor-assignments', { sort_by: column, sort_dir: newDir }, { preserveState: true });
  };

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title="Supervisor Assignments" />
      <div className="p-6 space-y-6">
        <Card className="shadow-md border-gray-200 dark:border-gray-700 p-4 rounded-lg bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900 dark:to-indigo-900">
          <CardHeader>
            <CardTitle className="text-2xl font-semibold text-gray-800 dark:text-gray-100">
              Supervisor Assignments - {company.name}
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
            <div className="flex justify-end">
              <Button
                asChild
                className="bg-indigo-600 text-white hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600 rounded-full"
              >
                <Link href="/company-admin/supervisors/assign">Assign New Supervisor</Link>
              </Button>
            </div>
            <Table className="border border-gray-200 dark:border-gray-700 rounded-lg">
              <TableHeader className="bg-indigo-100 dark:bg-indigo-800">
                <TableRow>
                  <TableHead>Supervisor Name</TableHead>
                  <TableHead>Student Name</TableHead>
                  <TableHead>Posting Title</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>
                    <Button variant="ghost" onClick={() => handleSort('assigned_at')} className="flex items-center gap-2 text-indigo-600 dark:text-indigo-200">
                      Assigned At
                      {sortBy === 'assigned_at' && <ArrowUpDown className={`h-4 w-4 ${sortDir === 'asc' ? 'rotate-180' : ''}`} />}
                    </Button>
                  </TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {assignments.data.map((assignment) => (
                  <TableRow key={assignment.assignment_id}>
                    <TableCell>{assignment.supervisor_name}</TableCell>
                    <TableCell>{assignment.student_name}</TableCell>
                    <TableCell>{assignment.posting_title}</TableCell>
                    <TableCell><Badge variant={assignment.status === 'active' ? 'default' : 'destructive'}>{assignment.status}</Badge></TableCell>
                    <TableCell>{new Date(assignment.assigned_at).toLocaleString()}</TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button variant="outline" size="sm" asChild className="rounded-full">
                                <Link href={`/company-admin/supervisor-assignments/${assignment.assignment_id}`}>
                                  <Eye className="h-4 w-4" />
                                </Link>
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>View Assignment</TooltipContent>
                          </Tooltip>
                          {assignment.status !== 'completed' && (
                            <>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button variant="outline" size="sm" asChild className="rounded-full" disabled={assignment.status === 'completed'}>
                                    <Link href={`/company-admin/supervisor-assignments/${assignment.assignment_id}/edit`}>
                                      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                      </svg>
                                    </Link>
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent>Edit Assignment</TooltipContent>
                              </Tooltip>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <AlertDialog>
                                    <AlertDialogTrigger asChild>
                                      <Button variant="outline" size="sm" className="rounded-full text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/50" disabled={assignment.status === 'completed'}>
                                        <Trash2 className="h-4 w-4" />
                                      </Button>
                                    </AlertDialogTrigger>
                                    <AlertDialogContent>
                                      <AlertDialogHeader>
                                        <AlertDialogTitle>Delete Assignment</AlertDialogTitle>
                                        <AlertDialogDescription>
                                          Are you sure you want to delete this assignment? This action cannot be undone.
                                        </AlertDialogDescription>
                                      </AlertDialogHeader>
                                      <AlertDialogFooter>
                                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                                        <AlertDialogAction
                                          onClick={() => router.delete(`/company-admin/supervisor-assignments/${assignment.assignment_id}`)}
                                          className="bg-red-600 hover:bg-red-700"
                                        >
                                          Delete
                                        </AlertDialogAction>
                                      </AlertDialogFooter>
                                    </AlertDialogContent>
                                  </AlertDialog>
                                </TooltipTrigger>
                                <TooltipContent>Delete Assignment</TooltipContent>
                              </Tooltip>
                            </>
                          )}
                        </TooltipProvider>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            <Pagination className="mt-4">
              <PaginationContent>
                <PaginationItem>
                  <Button
                    variant="outline"
                    disabled={assignments.prev_page_url === null}
                    onClick={() => router.visit(assignments.prev_page_url || '')}
                  >
                    Previous
                  </Button>
                </PaginationItem>
                {Array.from({ length: assignments.last_page }, (_, i) => i + 1).map((page) => (
                  <PaginationItem key={page}>
                    <PaginationLink
                      href={`/company-admin/supervisor-assignments?page=${page}&sort_by=${sortBy}&sort_dir=${sortDir}`}
                      isActive={assignments.current_page === page}
                    >
                      {page}
                    </PaginationLink>
                  </PaginationItem>
                ))}
                <PaginationItem>
                  <Button
                    variant="outline"
                    disabled={assignments.next_page_url === null}
                    onClick={() => router.visit(assignments.next_page_url || '')}
                  >
                    Next
                  </Button>
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}