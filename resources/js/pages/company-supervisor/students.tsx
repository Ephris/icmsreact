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
import { Eye, AlertCircle, X } from 'lucide-react';
import { type BreadcrumbItem } from '@/types';

interface StudentRow {
  assignment_id: number;
  student_id: number;
  student_name: string;
  student_email: string;
  student_phone: string;
  student_gender?: 'male' | 'female';
  student_university_id?: string | null;
  department_name: string;
  year_of_study: number | null;
  cgpa: number | null;
  posting_title: string;
  posting_type: string;
  status: string;
  assigned_at: string;
}

interface PaginationData {
  data: StudentRow[];
  current_page: number;
  last_page: number;
  next_page_url: string | null;
  prev_page_url: string | null;
  total: number;
}

interface Props {
  activeStudents: PaginationData;
  completedStudents: PaginationData;
  filters: { search?: string; status?: string; year?: string; sort_by?: string; sort_dir?: string };
  success?: string;
  error?: string;
}

const breadcrumbs: BreadcrumbItem[] = [
  { title: 'Dashboard', href: '/company-supervisor' },
  { title: 'Students', href: '/company-supervisor/students' },
];

export default function StudentsIndex({ activeStudents, completedStudents, filters, success, error }: Props) {
  const [searchTerm, setSearchTerm] = useState(filters.search || '');
  const [statusFilter, setStatusFilter] = useState(filters.status || 'all');
  const [yearFilter, setYearFilter] = useState(filters.year || 'all');
  const [showSuccess, setShowSuccess] = useState(!!success);
  const [showError, setShowError] = useState(!!error);

  useEffect(() => {
    console.log('StudentsIndex component mounted', {
      activeStudents: {
        count: activeStudents.data.length,
        total: activeStudents.total,
        current_page: activeStudents.current_page,
        last_page: activeStudents.last_page,
      },
      completedStudents: {
        count: completedStudents.data.length,
        total: completedStudents.total,
        current_page: completedStudents.current_page,
        last_page: completedStudents.last_page,
      },
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
  }, [success, error, activeStudents, completedStudents, filters]);

  useEffect(() => {
    const debounce = setTimeout(() => {
      console.log('Initiating search/filter', { searchTerm, statusFilter, yearFilter, sort_by: filters.sort_by, sort_dir: filters.sort_dir });
      router.get(
        '/company-supervisor/students',
        {
          search: searchTerm,
          status: statusFilter,
          year: yearFilter,
          sort_by: filters.sort_by || 'assigned_at',
          sort_dir: filters.sort_dir || 'desc'
        },
        { preserveState: true, preserveScroll: true }
      );
    }, 300);
    return () => clearTimeout(debounce);
  }, [searchTerm, statusFilter, yearFilter, filters.sort_by, filters.sort_dir]);

  const handleSort = (column: string) => {
    const newSortDir = (filters.sort_by === column && filters.sort_dir === 'asc') ? 'desc' : 'asc';
    console.log('Sorting table', { column, newSortDir });
    router.get(
      '/company-supervisor/students',
      {
        search: searchTerm,
        status: statusFilter,
        year: yearFilter,
        sort_by: column,
        sort_dir: newSortDir
      },
      { preserveState: true, preserveScroll: true }
    );
  };

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title="Assigned Students" />
      <div className="p-6 space-y-6">
        <Card className="shadow-lg border-none bg-white dark:bg-gray-800 rounded-2xl overflow-hidden transition-all duration-300 hover:shadow-xl">
          <CardHeader className="bg-gradient-to-r from-indigo-500 to-blue-600 dark:from-indigo-700 dark:to-blue-800 p-6 rounded-t-2xl transform transition-transform duration-300 hover:scale-[1.01]">
            <CardTitle className="text-2xl font-bold text-white tracking-tight">Assigned Students</CardTitle>
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
                placeholder="Search by name, email, or student number..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="max-w-sm border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 rounded-full focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 transition-all duration-300 hover:shadow-md"
                aria-label="Search students"
              />
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-40 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 rounded-full focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 transition-all duration-300 hover:shadow-md" aria-label="Filter by status">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 rounded-xl">
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                  <SelectItem value="graduated">Graduated</SelectItem>
                </SelectContent>
              </Select>
              <Select value={yearFilter} onValueChange={setYearFilter}>
                <SelectTrigger className="w-40 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 rounded-full focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 transition-all duration-300 hover:shadow-md" aria-label="Filter by year">
                  <SelectValue placeholder="Filter by year" />
                </SelectTrigger>
                <SelectContent className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 rounded-xl">
                  <SelectItem value="all">All Years</SelectItem>
                  <SelectItem value="1">Year 1</SelectItem>
                  <SelectItem value="2">Year 2</SelectItem>
                  <SelectItem value="3">Year 3</SelectItem>
                  <SelectItem value="4">Year 4</SelectItem>
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
            {activeStudents.data.length > 0 ? (
              <>
                <Table className="border border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-900">
                  <TableHeader className="bg-indigo-50 dark:bg-indigo-900/50">
                    <TableRow className="hover:bg-indigo-100 dark:hover:bg-indigo-900/70 transition-colors duration-200">
                      <TableHead className="cursor-pointer font-semibold text-indigo-700 dark:text-indigo-300" onClick={() => handleSort('name')}>
                        Name {filters.sort_by === 'name' && (filters.sort_dir === 'asc' ? '↑' : '↓')}
                      </TableHead>
                      <TableHead className="font-semibold text-indigo-700 dark:text-indigo-300">Gender / UNid</TableHead>
                      <TableHead className="font-semibold text-indigo-700 dark:text-indigo-300">Email</TableHead>
                      <TableHead className="font-semibold text-indigo-700 dark:text-indigo-300">Postings</TableHead>
                      <TableHead className="font-semibold text-indigo-700 dark:text-indigo-300">Department</TableHead>
                      <TableHead className="cursor-pointer font-semibold text-indigo-700 dark:text-indigo-300" onClick={() => handleSort('year_of_study')}>
                        Year {filters.sort_by === 'year_of_study' && (filters.sort_dir === 'asc' ? '↑' : '↓')}
                      </TableHead>
                      <TableHead className="cursor-pointer font-semibold text-indigo-700 dark:text-indigo-300" onClick={() => handleSort('gpa')}>
                        GPA {filters.sort_by === 'gpa' && (filters.sort_dir === 'asc' ? '↑' : '↓')}
                      </TableHead>
                      <TableHead className="font-semibold text-indigo-700 dark:text-indigo-300">Phone</TableHead>
                      <TableHead className="cursor-pointer font-semibold text-indigo-700 dark:text-indigo-300" onClick={() => handleSort('status')}>
                        Status {filters.sort_by === 'status' && (filters.sort_dir === 'asc' ? '↑' : '↓')}
                      </TableHead>
                      <TableHead className="font-semibold text-indigo-700 dark:text-indigo-300">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {activeStudents.data.map((student: StudentRow, index: number) => (
                      <TableRow
                        key={student.assignment_id}
                        className={`${index % 2 === 0 ? 'bg-white dark:bg-gray-900' : 'bg-gray-50 dark:bg-gray-800'} hover:bg-indigo-50 dark:hover:bg-indigo-900/30 transition-colors duration-200`}
                      >
                        <TableCell className="font-medium text-gray-900 dark:text-gray-100">
                          <div className="flex items-center gap-2">
                            <span>{student.student_name}</span>
                            {student.student_gender && (
                              <span className="text-xs text-gray-500 dark:text-gray-400 capitalize">({student.student_gender})</span>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="text-gray-700 dark:text-gray-300">
                          <div className="space-y-1">
                            {student.student_gender ? (
                              <div className="text-sm capitalize">{student.student_gender}</div>
                            ) : (
                              <div className="text-sm text-gray-400">N/A</div>
                            )}
                            {student.student_university_id && (
                              <div className="text-xs text-gray-500 dark:text-gray-400">UNid: {student.student_university_id}</div>
                            )}
                            {!student.student_university_id && (
                              <div className="text-xs text-gray-400">UNid: N/A</div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="text-gray-700 dark:text-gray-300">{student.student_email}</TableCell>
                        <TableCell className="text-gray-700 dark:text-gray-300">{student.posting_title} ({student.posting_type})</TableCell>
                        <TableCell className="text-gray-700 dark:text-gray-300">{student.department_name}</TableCell>
                        <TableCell className="text-gray-700 dark:text-gray-300">{student.year_of_study ?? 'N/A'}</TableCell>
                        <TableCell className="text-gray-700 dark:text-gray-300">{typeof student.cgpa === 'number' ? student.cgpa.toFixed(2) : 'N/A'}</TableCell>
                        <TableCell className="text-gray-700 dark:text-gray-300">{student.student_phone}</TableCell>
                        <TableCell>
                          <span
                            className={`inline-flex items-center justify-center capitalize text-white font-semibold px-3 py-1 rounded-full transition-colors duration-200 ${
                              student.status.toLowerCase() === 'active'
                                ? 'bg-[#22c55e] hover:bg-[#16a34a] dark:bg-[#16a34a] dark:hover:bg-[#15803d]'
                                : student.status.toLowerCase() === 'inactive'
                                ? 'bg-[#ef4444] hover:bg-[#dc2626] dark:bg-[#dc2626] dark:hover:bg-[#b91c1c]'
                                : 'bg-[#6b7280] hover:bg-[#4b5563] dark:bg-[#4b5563] dark:hover:bg-[#374151]'
                            }`}
                          >
                            {student.status}
                          </span>
                        </TableCell>
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
                                    <Link href={`/company-supervisor/students/${student.student_id}`} aria-label={`View student ${student.student_name}`}>
                                      <Eye className="h-4 w-4" />
                                    </Link>
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent>View Details</TooltipContent>
                              </Tooltip>
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
                      href={activeStudents.prev_page_url || '#'}
                        className={`border-indigo-500 text-indigo-600 dark:text-indigo-400 bg-white dark:bg-gray-900 rounded-full hover:bg-indigo-100 dark:hover:bg-indigo-900/50 hover:text-indigo-700 dark:hover:text-indigo-300 transition-all duration-300 transform hover:scale-105 ${!activeStudents.prev_page_url ? 'pointer-events-none opacity-50' : ''}`}
                        aria-label="Previous page"
                      />
                    </PaginationItem>
                    {[...Array(activeStudents.last_page)].map((_, i) => (
                      <PaginationItem key={i}>
                        <PaginationLink
                          href={`/company-supervisor/students?page=${i + 1}&search=${encodeURIComponent(searchTerm)}&status=${statusFilter}&year=${yearFilter}&sort_by=${filters.sort_by}&sort_dir=${filters.sort_dir}`}
                          isActive={activeStudents.current_page === i + 1}
                          className="border-indigo-500 text-indigo-600 dark:text-indigo-400 bg-white dark:bg-gray-900 rounded-full hover:bg-indigo-100 dark:hover:bg-indigo-900/50 hover:text-indigo-700 dark:hover:text-indigo-300 transition-all duration-300 transform hover:scale-105"
                          aria-label={`Page ${i + 1}`}
                        >
                          {i + 1}
                        </PaginationLink>
                      </PaginationItem>
                    ))}
                    <PaginationItem>
                      <PaginationNext
                        href={activeStudents.next_page_url || '#'}
                        className={`border-indigo-500 text-indigo-600 dark:text-indigo-400 bg-white dark:bg-gray-900 rounded-full hover:bg-indigo-100 dark:hover:bg-indigo-900/50 hover:text-indigo-700 dark:hover:text-indigo-300 transition-all duration-300 transform hover:scale-105 ${!activeStudents.next_page_url ? 'pointer-events-none opacity-50' : ''}`}
                        aria-label="Next page"
                      />
                    </PaginationItem>
                  </PaginationContent>
                </Pagination>
              </>
            ) : (
              <p className="text-sm text-gray-500 dark:text-gray-400 text-center">No active students found.</p>
            )}
          </CardContent>
        </Card>

        {/* Completed students table */}
        <Card className="shadow-lg border-none bg-white dark:bg-gray-800 rounded-2xl overflow-hidden transition-all duration-300 hover:shadow-xl">
          <CardHeader className="bg-gradient-to-r from-emerald-500 to-emerald-600 dark:from-emerald-700 dark:to-emerald-800 p-6 rounded-t-2xl">
            <CardTitle className="text-2xl font-bold text-white tracking-tight">Completed Students</CardTitle>
          </CardHeader>
          <CardContent className="p-6 space-y-4">
            {completedStudents.data.length > 0 ? (
              <Table className="border border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-900">
                <TableHeader className="bg-emerald-50 dark:bg-emerald-900/40">
                  <TableRow>
                    <TableHead className="font-semibold text-emerald-700 dark:text-emerald-300">Name</TableHead>
                    <TableHead className="font-semibold text-emerald-700 dark:text-emerald-300">Email</TableHead>
                    <TableHead className="font-semibold text-emerald-700 dark:text-emerald-300">Department</TableHead>
                    <TableHead className="font-semibold text-emerald-700 dark:text-emerald-300">Posting</TableHead>
                    <TableHead className="font-semibold text-emerald-700 dark:text-emerald-300">Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {completedStudents.data.map((student) => (
                    <TableRow key={student.assignment_id}>
                      <TableCell className="font-medium text-gray-900 dark:text-gray-100">
                        {student.student_name}
                      </TableCell>
                      <TableCell className="text-gray-700 dark:text-gray-300">{student.student_email}</TableCell>
                      <TableCell className="text-gray-700 dark:text-gray-300">{student.department_name}</TableCell>
                      <TableCell className="text-gray-700 dark:text-gray-300">
                        {student.posting_title} ({student.posting_type})
                      </TableCell>
                      <TableCell>
                        <span className="inline-flex items-center justify-center capitalize text-white font-semibold px-3 py-1 rounded-full bg-emerald-600">
                          Completed
                        </span>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <p className="text-sm text-gray-500 dark:text-gray-400 text-center">No completed students found.</p>
            )}
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
