import React, { useState, useEffect } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Separator } from '@/components/ui/separator';
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from '@/components/ui/pagination';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Eye, CheckCircle, XCircle, AlertCircle, X } from 'lucide-react';
import { type BreadcrumbItem } from '@/types';

interface Form {
  form_id: number;
  title: string;
  type: string;
  status: string;
  student_name: string;
  student_email: string;
  submitted_at: string;
  created_at: string;
  description?: string;
}

interface PaginationData {
  data: Form[];
  current_page: number;
  last_page: number;
  next_page_url: string | null;
  prev_page_url: string | null;
  total: number;
}

interface Props {
  forms: PaginationData;
  filters: { search?: string; type?: string; status?: string; sort_by?: string; sort_dir?: string };
  success?: string;
  error?: string;
}

const breadcrumbs: BreadcrumbItem[] = [
  { title: 'Dashboard', href: '/company-supervisor' },
  { title: 'Forms', href: '/company-supervisor/forms' },
];

export default function FormsIndex({ forms, filters, success, error }: Props) {
  const [searchTerm, setSearchTerm] = useState(filters.search || '');
  const [typeFilter, setTypeFilter] = useState(filters.type || 'all');
  const [statusFilter, setStatusFilter] = useState(filters.status || 'all');
  const [showSuccess, setShowSuccess] = useState(!!success);
  const [showError, setShowError] = useState(!!error);

  useEffect(() => {
    console.log('FormsIndex component mounted', {
      forms: { count: forms.data.length, total: forms.total, current_page: forms.current_page, last_page: forms.last_page },
      filters,
      success,
      error,
    });

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
  }, [success, error, forms, filters]);

  useEffect(() => {
    const debounce = setTimeout(() => {
      console.log('Initiating search/filter', { searchTerm, typeFilter, statusFilter, sort_by: filters.sort_by, sort_dir: filters.sort_dir });
      router.get(
        '/company-supervisor/forms',
        { search: searchTerm, type: typeFilter, status: statusFilter, sort_by: filters.sort_by, sort_dir: filters.sort_dir },
        { preserveState: true, preserveScroll: true }
      );
    }, 300);
    return () => clearTimeout(debounce);
  }, [searchTerm, typeFilter, statusFilter, filters.sort_by, filters.sort_dir]);

  const handleSort = (column: string) => {
    const newSortDir = filters.sort_by === column && filters.sort_dir === 'asc' ? 'desc' : 'asc';
    console.log('Sorting table', { column, newSortDir });
    router.get(
      '/company-supervisor/forms',
      { search: searchTerm, type: typeFilter, status: statusFilter, sort_by: column, sort_dir: newSortDir },
      { preserveState: true, preserveScroll: true }
    );
  };

  const handleApprove = (formId: number, status: 'approved' | 'rejected') => {
    console.log(`${status === 'approved' ? 'Approving' : 'Rejecting'} form`, { formId });
    router.post(`/company-supervisor/forms/${formId}/approve`, { status }, {
      onSuccess: () => {
        console.log(`Form ${status} successfully`, { formId });
      },
      onError: (errors) => {
        console.error(`Failed to ${status} form`, { formId, errors });
      },
    });
  };


  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title="Forms to Review" />
      <div className="p-6 space-y-6">
        <Card className="shadow-lg border-none bg-white dark:bg-gray-800 rounded-2xl overflow-hidden transition-all duration-300 hover:shadow-xl">
          <CardHeader className="bg-gradient-to-r from-indigo-500 to-blue-600 dark:from-indigo-700 dark:to-blue-800 p-6 rounded-t-2xl transform transition-transform duration-300 hover:scale-[1.01]">
            <CardTitle className="text-2xl font-bold text-white tracking-tight">Forms to Review</CardTitle>
          </CardHeader>
          <CardContent className="p-6 space-y-6">
            {showSuccess && success && (
              <Alert className="bg-green-100 dark:bg-green-900/30 border-green-300 dark:border-green-700 animate-in fade-in slide-in-from-top-2 duration-500">
                <AlertCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
                <AlertTitle className="text-green-800 dark:text-green-200 font-semibold">Success</AlertTitle>
                <AlertDescription className="text-green-700 dark:text-green-300 flex justify-between items-center">
                  {success}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowSuccess(false)}
                    className="text-green-800 dark:text-green-200 hover:bg-green-200 dark:hover:bg-green-800/50 transition-colors duration-200"
                    aria-label="Dismiss success message"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </AlertDescription>
              </Alert>
            )}
            {showError && error && (
              <Alert className="bg-red-100 dark:bg-red-900/30 border-red-300 dark:border-red-700 animate-in fade-in slide-in-from-top-2 duration-500">
                <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400" />
                <AlertTitle className="text-red-800 dark:text-red-200 font-semibold">Error</AlertTitle>
                <AlertDescription className="text-red-700 dark:text-red-300 flex justify-between items-center">
                  {error}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowError(false)}
                    className="text-red-800 dark:text-red-200 hover:bg-red-200 dark:hover:bg-red-800/50 transition-colors duration-200"
                    aria-label="Dismiss error message"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </AlertDescription>
              </Alert>
            )}
            <div className="flex flex-wrap gap-4 items-center">
              <Input
                placeholder="Search by title, student name, or type..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="max-w-sm border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 rounded-full focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 transition-all duration-300 hover:shadow-md"
                aria-label="Search forms"
              />
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className="w-40 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 rounded-full focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 transition-all duration-300 hover:shadow-md" aria-label="Filter by type">
                  <SelectValue placeholder="Filter by type" />
                </SelectTrigger>
                <SelectContent className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 rounded-xl">
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="progress_report">Progress Report</SelectItem>
                  <SelectItem value="final_report">Final Report</SelectItem>
                  <SelectItem value="midterm_evaluation">Midterm Evaluation</SelectItem>
                </SelectContent>
              </Select>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-40 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 rounded-full focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 transition-all duration-300 hover:shadow-md" aria-label="Filter by status">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 rounded-xl">
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="approved">Approved</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                </SelectContent>
              </Select>
              <Button
                asChild
                variant="outline"
                className="border-indigo-500 text-indigo-600 dark:text-indigo-400 bg-white dark:bg-gray-900 rounded-full hover:bg-indigo-100 dark:hover:bg-indigo-900/50 hover:text-indigo-700 dark:hover:text-indigo-300 transition-all duration-300 transform hover:scale-105"
              >
                <Link href="/company-supervisor" aria-label="Back to dashboard">
                  Back to Dashboard
                </Link>
              </Button>
            </div>
            <Separator className="bg-gray-200 dark:bg-gray-700" />
            {forms.data.length > 0 ? (
              <>
                <Table className="border border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-900">
                  <TableHeader className="bg-indigo-50 dark:bg-indigo-900/50">
                    <TableRow className="hover:bg-indigo-100 dark:hover:bg-indigo-900/70 transition-colors duration-200">
                      <TableHead className="cursor-pointer font-semibold text-indigo-700 dark:text-indigo-300" onClick={() => handleSort('title')}>
                        Title {filters.sort_by === 'title' && (filters.sort_dir === 'asc' ? '↑' : '↓')}
                      </TableHead>
                      <TableHead className="cursor-pointer font-semibold text-indigo-700 dark:text-indigo-300" onClick={() => handleSort('type')}>
                        Type {filters.sort_by === 'type' && (filters.sort_dir === 'asc' ? '↑' : '↓')}
                      </TableHead>
                      <TableHead className="font-semibold text-indigo-700 dark:text-indigo-300">Student</TableHead>
                      <TableHead className="font-semibold text-indigo-700 dark:text-indigo-300">Email</TableHead>
                      <TableHead className="cursor-pointer font-semibold text-indigo-700 dark:text-indigo-300" onClick={() => handleSort('status')}>
                        Status {filters.sort_by === 'status' && (filters.sort_dir === 'asc' ? '↑' : '↓')}
                      </TableHead>
                      <TableHead className="cursor-pointer font-semibold text-indigo-700 dark:text-indigo-300" onClick={() => handleSort('submitted_at')}>
                        Submitted {filters.sort_by === 'submitted_at' && (filters.sort_dir === 'asc' ? '↑' : '↓')}
                      </TableHead>
                      <TableHead className="font-semibold text-indigo-700 dark:text-indigo-300">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {forms.data.map((form, index) => (
                      <TableRow
                        key={form.form_id}
                        className={`${index % 2 === 0 ? 'bg-white dark:bg-gray-900' : 'bg-gray-50 dark:bg-gray-800'} hover:bg-indigo-50 dark:hover:bg-indigo-900/30 transition-colors duration-200`}
                      >
                        <TableCell className="font-medium text-gray-900 dark:text-gray-100">{form.title}</TableCell>
                        <TableCell className="capitalize text-gray-700 dark:text-gray-300">{form.type}</TableCell>
                        <TableCell className="text-gray-700 dark:text-gray-300">{form.student_name}</TableCell>
                        <TableCell className="text-gray-700 dark:text-gray-300">{form.student_email}</TableCell>
                        <TableCell>
                          <span
                            className={`inline-flex items-center justify-center capitalize text-white font-semibold px-3 py-1 rounded-full transition-colors duration-200 ${
                              form.status.toLowerCase() === 'approved'
                                ? 'bg-[#22c55e] hover:bg-[#16a34a] dark:bg-[#16a34a] dark:hover:bg-[#15803d]'
                                : form.status.toLowerCase() === 'pending'
                                ? 'bg-[#f59e0b] hover:bg-[#d97706] dark:bg-[#d97706] dark:hover:bg-[#b45309]'
                                : form.status.toLowerCase() === 'rejected'
                                ? 'bg-[#ef4444] hover:bg-[#dc2626] dark:bg-[#dc2626] dark:hover:bg-[#b91c1c]'
                                : 'bg-[#6b7280] hover:bg-[#4b5563] dark:bg-[#4b5563] dark:hover:bg-[#374151]'
                            }`}
                          >
                            {form.status.replace('_', ' ')}
                          </span>
                        </TableCell>
                        <TableCell className="text-gray-700 dark:text-gray-300">{form.submitted_at}</TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    asChild
                                    className="border-indigo-500 text-indigo-600 dark:text-indigo-400 bg-white dark:bg-gray-900 rounded-full hover:bg-indigo-100 dark:hover:bg-indigo-900/50 hover:text-indigo-700 dark:hover:text-indigo-300 transition-all duration-300 transform hover:scale-105"
                                  >
                                    <Link href={`/company-supervisor/forms/${form.form_id}`} aria-label={`View form ${form.title}`}>
                                      <Eye className="h-4 w-4" />
                                    </Link>
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent>View Form</TooltipContent>
                              </Tooltip>
                              {form.status.toLowerCase() === 'pending' && (
                                <>
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => handleApprove(form.form_id, 'approved')}
                                        className="border-green-500 text-green-600 dark:text-green-400 bg-white dark:bg-gray-900 rounded-full hover:bg-green-100 dark:hover:bg-green-900/50 hover:text-green-700 dark:hover:text-green-300 transition-all duration-300 transform hover:scale-105"
                                        aria-label={`Approve form ${form.title}`}
                                      >
                                        <CheckCircle className="h-4 w-4" />
                                      </Button>
                                    </TooltipTrigger>
                                    <TooltipContent>Approve Form</TooltipContent>
                                  </Tooltip>
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => handleApprove(form.form_id, 'rejected')}
                                        className="border-red-500 text-red-600 dark:text-red-400 bg-white dark:bg-gray-900 rounded-full hover:bg-red-100 dark:hover:bg-red-900/50 hover:text-red-700 dark:hover:text-red-300 transition-all duration-300 transform hover:scale-105"
                                        aria-label={`Reject form ${form.title}`}
                                      >
                                        <XCircle className="h-4 w-4" />
                                      </Button>
                                    </TooltipTrigger>
                                    <TooltipContent>Reject Form</TooltipContent>
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
                      <PaginationPrevious
                        href={forms.prev_page_url || '#'}
                        className={`border-indigo-500 text-indigo-600 dark:text-indigo-400 bg-white dark:bg-gray-900 rounded-full hover:bg-indigo-100 dark:hover:bg-indigo-900/50 hover:text-indigo-700 dark:hover:text-indigo-300 transition-all duration-300 transform hover:scale-105 ${!forms.prev_page_url ? 'pointer-events-none opacity-50' : ''}`}
                        aria-label="Previous page"
                      />
                    </PaginationItem>
                    {[...Array(forms.last_page)].map((_, i) => (
                      <PaginationItem key={i}>
                        <PaginationLink
                          href={`/company-supervisor/forms?page=${i + 1}&search=${encodeURIComponent(searchTerm)}&type=${typeFilter}&status=${statusFilter}&sort_by=${filters.sort_by}&sort_dir=${filters.sort_dir}`}
                          isActive={forms.current_page === i + 1}
                          className="border-indigo-500 text-indigo-600 dark:text-indigo-400 bg-white dark:bg-gray-900 rounded-full hover:bg-indigo-100 dark:hover:bg-indigo-900/50 hover:text-indigo-700 dark:hover:text-indigo-300 transition-all duration-300 transform hover:scale-105"
                          aria-label={`Page ${i + 1}`}
                        >
                          {i + 1}
                        </PaginationLink>
                      </PaginationItem>
                    ))}
                    <PaginationItem>
                      <PaginationNext
                        href={forms.next_page_url || '#'}
                        className={`border-indigo-500 text-indigo-600 dark:text-indigo-400 bg-white dark:bg-gray-900 rounded-full hover:bg-indigo-100 dark:hover:bg-indigo-900/50 hover:text-indigo-700 dark:hover:text-indigo-300 transition-all duration-300 transform hover:scale-105 ${!forms.next_page_url ? 'pointer-events-none opacity-50' : ''}`}
                        aria-label="Next page"
                      />
                    </PaginationItem>
                  </PaginationContent>
                </Pagination>
              </>
            ) : (
              <p className="text-sm text-gray-500 dark:text-gray-400 text-center">No forms found.</p>
            )}
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
