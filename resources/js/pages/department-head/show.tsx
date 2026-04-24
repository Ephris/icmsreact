import React, { useState, useEffect } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { X, Eye, Pencil, Trash, ArrowUp, ArrowDown, ChevronLeft, ChevronRight } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

interface Department {
  department_id: number;
  name: string;
  description: string | null;
  status: string;
}

interface Student {
  student_id: number;
  name: string;
  cgpa: number | null;
  year_of_study: string | null;
  university_id?: string | null;
  advisors: { user_id: number; name: string }[];
  status: string;
  gender?: 'male' | 'female';
}

interface Advisor {
  user_id: number;
  name: string;
  email: string;
  phone: string | null;
  specialization: string | null;
  status: string;
  student_count: number;
  gender?: 'male' | 'female';
}

interface Props {
  department: Department;
  students: Student[];
  advisors: Advisor[];
  success?: string;
  error?: string;
}

const breadcrumbs = [
  { title: 'Dashboard', href: '/department-head' },
  { title: 'Department Details', href: '/department-head/department' },
];

const Show: React.FC<Props> = ({ department, students, advisors, success, error }) => {
  const [showSuccess, setShowSuccess] = useState(!!success);
  const [showError, setShowError] = useState(!!error);
  const [studentStatusFilter, setStudentStatusFilter] = useState<string>('all');
  const [advisorStatusFilter, setAdvisorStatusFilter] = useState<string>('all');
  const [studentSearch, setStudentSearch] = useState<string>('');
  const [advisorSearch, setAdvisorSearch] = useState<string>('');
  const [studentSortColumn, setStudentSortColumn] = useState<keyof Student | null>(null);
  const [advisorSortColumn, setAdvisorSortColumn] = useState<keyof Advisor | null>(null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [studentPage, setStudentPage] = useState<number>(1);
  const [advisorPage, setAdvisorPage] = useState<number>(1);
  const itemsPerPage = 5;

  // Auto-dismiss success/error messages after 3 seconds
  useEffect(() => {
    if (showSuccess || showError) {
      const timer = setTimeout(() => {
        setShowSuccess(false);
        setShowError(false);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [showSuccess, showError]);

  // Filter, search, and sort students
  const filteredAndSortedStudents = React.useMemo(() => {
    let filtered = [...students];
    if (studentStatusFilter !== 'all') {
      filtered = filtered.filter((student) => student.status.toLowerCase() === studentStatusFilter);
    }
    if (studentSearch) {
      filtered = filtered.filter((student) =>
        student.name.toLowerCase().includes(studentSearch.toLowerCase())
      );
    }
    if (studentSortColumn) {
      filtered.sort((a, b) => {
        const aValue = a[studentSortColumn] ?? '';
        const bValue = b[studentSortColumn] ?? '';
        if (studentSortColumn === 'cgpa') {
          const aNum = typeof aValue === 'number' ? aValue : 0;
          const bNum = typeof bValue === 'number' ? bValue : 0;
          return sortDirection === 'asc' ? aNum - bNum : bNum - aNum;
        }
        if (studentSortColumn === 'advisors') {
          const aNames = a.advisors.map((adv) => adv.name).join(', ') || '';
          const bNames = b.advisors.map((adv) => adv.name).join(', ') || '';
          return sortDirection === 'asc'
            ? aNames.localeCompare(bNames)
            : bNames.localeCompare(aNames);
        }
        return sortDirection === 'asc'
          ? aValue.toString().localeCompare(bValue.toString())
          : bValue.toString().localeCompare(aValue.toString());
      });
    }
    return filtered;
  }, [students, studentStatusFilter, studentSearch, studentSortColumn, sortDirection]);

  // Filter, search, and sort advisors
  const filteredAndSortedAdvisors = React.useMemo(() => {
    let filtered = [...advisors];
    if (advisorStatusFilter !== 'all') {
      filtered = filtered.filter((advisor) => advisor.status.toLowerCase() === advisorStatusFilter);
    }
    if (advisorSearch) {
      filtered = filtered.filter(
        (advisor) =>
          advisor.name.toLowerCase().includes(advisorSearch.toLowerCase()) ||
          advisor.email.toLowerCase().includes(advisorSearch.toLowerCase())
      );
    }
    if (advisorSortColumn) {
      filtered.sort((a, b) => {
        const aValue = a[advisorSortColumn] ?? '';
        const bValue = b[advisorSortColumn] ?? '';
        if (advisorSortColumn === 'student_count') {
          const aNum = typeof aValue === 'number' ? aValue : 0;
          const bNum = typeof bValue === 'number' ? bValue : 0;
          return sortDirection === 'asc' ? aNum - bNum : bNum - aNum;
        }
        return sortDirection === 'asc'
          ? aValue.toString().localeCompare(bValue.toString())
          : bValue.toString().localeCompare(aValue.toString());
      });
    }
    return filtered;
  }, [advisors, advisorStatusFilter, advisorSearch, advisorSortColumn, sortDirection]);

  // Pagination for students
  const studentTotalPages = Math.ceil(filteredAndSortedStudents.length / itemsPerPage);
  const paginatedStudents = filteredAndSortedStudents.slice(
    (studentPage - 1) * itemsPerPage,
    studentPage * itemsPerPage
  );

  // Pagination for advisors
  const advisorTotalPages = Math.ceil(filteredAndSortedAdvisors.length / itemsPerPage);
  const paginatedAdvisors = filteredAndSortedAdvisors.slice(
    (advisorPage - 1) * itemsPerPage,
    advisorPage * itemsPerPage
  );

  const handleDeleteStudent = (student_id: number, student_name: string) => {
    router.delete(route('department-head.destroystudent', student_id), {
      onSuccess: () => {
        console.log(`Student ${student_name} deleted successfully`);
        setShowSuccess(true);
      },
      onError: (errors) => {
        console.error('Failed to delete student:', errors);
        setShowError(true);
      },
    });
  };

  const handleDeleteAdvisor = (user_id: number, advisor_name: string) => {
    router.delete(route('department-head.destroyadvisor', user_id), {
      onSuccess: () => {
        console.log(`Advisor ${advisor_name} deleted successfully`);
        setShowSuccess(true);
      },
      onError: (errors) => {
        console.error('Failed to delete advisor:', errors);
        setShowError(true);
      },
    });
  };

  const handleStudentSort = (column: keyof Student) => {
    if (studentSortColumn === column) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setStudentSortColumn(column);
      setSortDirection('asc');
    }
  };

  const handleAdvisorSort = (column: keyof Advisor) => {
    if (advisorSortColumn === column) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setAdvisorSortColumn(column);
      setSortDirection('asc');
    }
  };

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title="Department Details" />
      <div className="flex flex-1 flex-col gap-6 p-6">
        <h1 className="text-3xl font-bold text-indigo-700 dark:text-indigo-300">Details - {department.name}</h1>
        {showSuccess && success && (
          <Alert className="bg-green-100 dark:bg-green-900/30 border-green-300 dark:border-green-700 rounded-lg animate-in fade-in slide-in-from-top-4 duration-500">
            <AlertTitle className="text-green-800 dark:text-green-200 font-semibold">Success</AlertTitle>
            <AlertDescription className="flex justify-between items-center text-green-700 dark:text-gray-300">
              <span>{success}</span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowSuccess(false)}
                className="text-green-800 dark:text-green-200 hover:bg-green-200 dark:hover:bg-green-800/50 transition-colors duration-200"
                aria-label="Close success alert"
              >
                <X className="h-4 w-4" />
              </Button>
            </AlertDescription>
          </Alert>
        )}
        {showError && error && (
          <Alert className="bg-red-100 dark:bg-red-900/30 border-red-300 dark:border-red-700 rounded-lg animate-in fade-in slide-in-from-top-4 duration-500">
            <AlertTitle className="text-red-800 dark:text-red-200 font-semibold">Error</AlertTitle>
            <AlertDescription className="flex justify-between items-center text-red-700 dark:text-gray-300">
              <span>{error}</span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowError(false)}
                className="text-red-800 dark:text-red-200 hover:bg-red-200 dark:hover:bg-red-800/50 transition-colors duration-200"
                aria-label="Close error alert"
              >
                <X className="h-4 w-4" />
              </Button>
            </AlertDescription>
          </Alert>
        )}
        <div className="space-y-6">
          <Card className="w-full max-w-md bg-white dark:bg-gray-900 border-none rounded-2xl shadow-lg transition-all duration-300 hover:shadow-xl animate-in fade-in zoom-in-95">
            <CardHeader className="bg-gradient-to-r from-indigo-500 to-blue-600 dark:from-indigo-700 dark:to-blue-800 rounded-t-2xl">
              <CardTitle className="text-white text-lg">Department: {department.name}</CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <Accordion type="single" collapsible className="w-full">
                <AccordionItem value="description">
                  <AccordionTrigger className="bg-gradient-to-r from-indigo-500 to-blue-600 dark:from-indigo-700 dark:to-blue-800 text-white rounded-lg hover:bg-indigo-600 dark:hover:bg-indigo-800 transition-all duration-200">Description</AccordionTrigger>
                  <AccordionContent className="text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-900 rounded-lg p-4">{department.description || 'N/A'}</AccordionContent>
                </AccordionItem>
                <AccordionItem value="status">
                  <AccordionTrigger className="bg-gradient-to-r from-indigo-500 to-blue-600 dark:from-indigo-700 dark:to-blue-800 text-white rounded-lg hover:bg-indigo-600 dark:hover:bg-indigo-800 transition-all duration-200">Status</AccordionTrigger>
                  <AccordionContent className="text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-900 rounded-lg p-4">{department.status}</AccordionContent>
                </AccordionItem>
              </Accordion>
            </CardContent>
          </Card>
          <Card className="bg-white dark:bg-gray-900 border-none rounded-2xl shadow-lg transition-all duration-300 hover:shadow-xl animate-in fade-in zoom-in-95">
            <CardHeader className="bg-gradient-to-r from-indigo-500 to-blue-600 dark:from-indigo-700 dark:to-blue-800 rounded-t-2xl">
              <CardTitle className="text-white text-lg">Department Overview</CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              <div>
                <h2 className="text-xl font-semibold text-indigo-700 dark:text-indigo-300">Students ({filteredAndSortedStudents.length})</h2>
                <div className="flex justify-between items-center gap-4 mt-4">
                  <Button
                    asChild
                    className="bg-gradient-to-r from-indigo-500 to-blue-600 dark:from-indigo-700 dark:to-blue-800 text-white rounded-full hover:from-indigo-600 hover:to-blue-700 dark:hover:from-indigo-800 dark:hover:to-blue-900 transition-all duration-300 transform hover:scale-105"
                  >
                    <Link href="/department-head/students/create" aria-label="Add new student">Add Student</Link>
                  </Button>
                  <div className="flex gap-4">
                    <Input
                      placeholder="Search students by name"
                      value={studentSearch}
                      onChange={(e) => setStudentSearch(e.target.value)}
                      className="w-48 bg-white dark:bg-gray-900 border-indigo-500/20 dark:border-indigo-700/20 rounded-full focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 transition-all duration-300 hover:shadow-md"
                      aria-label="Search students"
                    />
                    <Select value={studentStatusFilter} onValueChange={setStudentStatusFilter}>
                      <SelectTrigger className="w-40 bg-white dark:bg-gray-900 border-indigo-500/20 dark:border-indigo-700/20 rounded-full focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 transition-all duration-300 hover:shadow-md">
                        <SelectValue placeholder="Filter by status" />
                      </SelectTrigger>
                      <SelectContent className="bg-white dark:bg-gray-900 border-indigo-500/20 dark:border-indigo-700/20 rounded-lg">
                        <SelectItem value="all">All Statuses</SelectItem>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="inactive">Inactive</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                {paginatedStudents.length > 0 ? (
                  <>
                    <Table className="border border-indigo-500/20 dark:border-indigo-700/20 rounded-lg mt-4">
                      <TableHeader>
                        <TableRow className="bg-indigo-50 dark:bg-indigo-900/30 hover:bg-indigo-100 dark:hover:bg-indigo-800/50">
                          <TableHead className="cursor-pointer text-indigo-700 dark:text-indigo-300" onClick={() => handleStudentSort('name')}>
                            Name
                            {studentSortColumn === 'name' && (
                              sortDirection === 'asc' ? <ArrowUp className="inline ml-1 h-4 w-4" /> : <ArrowDown className="inline ml-1 h-4 w-4" />
                            )}
                          </TableHead>
                          <TableHead className="cursor-pointer text-indigo-700 dark:text-indigo-300" onClick={() => handleStudentSort('cgpa')}>
                            CGPA
                            {studentSortColumn === 'cgpa' && (
                              sortDirection === 'asc' ? <ArrowUp className="inline ml-1 h-4 w-4" /> : <ArrowDown className="inline ml-1 h-4 w-4" />
                            )}
                          </TableHead>
                          <TableHead className="cursor-pointer text-indigo-700 dark:text-indigo-300" onClick={() => handleStudentSort('year_of_study')}>
                            Year
                            {studentSortColumn === 'year_of_study' && (
                              sortDirection === 'asc' ? <ArrowUp className="inline ml-1 h-4 w-4" /> : <ArrowDown className="inline ml-1 h-4 w-4" />
                            )}
                          </TableHead>
                          <TableHead className="cursor-pointer text-indigo-700 dark:text-indigo-300" onClick={() => handleStudentSort('advisors')}>
                            Advisors
                            {studentSortColumn === 'advisors' && (
                              sortDirection === 'asc' ? <ArrowUp className="inline ml-1 h-4 w-4" /> : <ArrowDown className="inline ml-1 h-4 w-4" />
                            )}
                          </TableHead>
                          <TableHead className="cursor-pointer text-indigo-700 dark:text-indigo-300" onClick={() => handleStudentSort('status')}>
                            Status
                            {studentSortColumn === 'status' && (
                              sortDirection === 'asc' ? <ArrowUp className="inline ml-1 h-4 w-4" /> : <ArrowDown className="inline ml-1 h-4 w-4" />
                            )}
                          </TableHead>
                          <TableHead className="text-indigo-700 dark:text-indigo-300">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {paginatedStudents.map((student, index) => (
                          <TableRow
                            key={student.student_id}
                            className={`transition-colors duration-200 ${index % 2 === 0 ? 'bg-white dark:bg-gray-900' : 'bg-indigo-50/50 dark:bg-indigo-900/20'} hover:bg-indigo-100 dark:hover:bg-indigo-800/50`}
                          >
                            <TableCell className="text-gray-700 dark:text-gray-300">
                              <div className="space-y-1">
                                <div className="flex items-center gap-2">
                                  <span>{student.name}</span>
                                  {('gender' in student && student.gender) && (
                                    <span className="text-xs text-gray-500 dark:text-gray-400 capitalize">({student.gender})</span>
                                  )}
                                </div>
                                {student.university_id && (
                                  <div className="text-xs text-gray-500 dark:text-gray-400">UNid: {student.university_id}</div>
                                )}
                              </div>
                            </TableCell>
                            <TableCell className="text-gray-700 dark:text-gray-300">{student.cgpa ?? 'N/A'}</TableCell>
                            <TableCell className="text-gray-700 dark:text-gray-300">{student.year_of_study ?? 'N/A'}</TableCell>
                            <TableCell className="text-gray-700 dark:text-gray-300">{student.advisors.map((advisor) => advisor.name).join(', ') || 'None'}</TableCell>
                            <TableCell className="text-gray-700 dark:text-gray-300">
                              <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                                student.status?.toLowerCase() === 'active' 
                                  ? 'bg-green-100 text-green-700 dark:bg-green-800 dark:text-green-200' 
                                  : student.status?.toLowerCase() === 'inactive'
                                  ? 'bg-red-100 text-red-700 dark:bg-red-800 dark:text-red-200'
                                  : 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-200'
                              }`}>
                                {student.status}
                              </span>
                            </TableCell>
                            <TableCell className="flex gap-2">
                              <Button
                                variant="ghost"
                                size="icon"
                                asChild
                                className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 hover:bg-blue-100 dark:hover:bg-blue-900/50 transition-all duration-200"
                                aria-label="View student details"
                              >
                                <Link href={`/department-head/students/${student.student_id}`}>
                                  <Eye className="h-4 w-4" />
                                </Link>
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                asChild
                                className="text-green-600 dark:text-green-400 hover:text-green-800 dark:hover:text-green-300 hover:bg-green-100 dark:hover:bg-green-900/50 transition-all duration-200"
                                aria-label="Edit student"
                              >
                                <Link href={`/department-head/students/${student.student_id}/edit`}>
                                  <Pencil className="h-4 w-4" />
                                </Link>
                              </Button>
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300 hover:bg-red-100 dark:hover:bg-red-900/50 transition-all duration-200"
                                    aria-label="Delete student"
                                  >
                                    <Trash className="h-4 w-4" />
                                  </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent className="bg-white dark:bg-gray-900 border-indigo-500/20 dark:border-indigo-700/20 rounded-lg">
                                  <AlertDialogHeader>
                                    <AlertDialogTitle className="text-indigo-700 dark:text-indigo-300">Are you sure?</AlertDialogTitle>
                                    <AlertDialogDescription className="text-gray-700 dark:text-gray-300">
                                      This will delete {student.name} permanently.
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel className="bg-white dark:bg-gray-900 border-indigo-500/20 dark:border-indigo-700/20 rounded-full hover:bg-indigo-50 dark:hover:bg-indigo-900/30 transition-all duration-200">Cancel</AlertDialogCancel>
                                    <AlertDialogAction
                                      className="bg-gradient-to-r from-indigo-500 to-blue-600 dark:from-indigo-700 dark:to-blue-800 text-white rounded-full hover:from-indigo-600 hover:to-blue-700 dark:hover:from-indigo-800 dark:hover:to-blue-900 transition-all duration-300 transform hover:scale-105"
                                      onClick={() => handleDeleteStudent(student.student_id, student.name)}
                                    >
                                      Delete
                                    </AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                    <div className="flex justify-between items-center mt-4">
                      <Button
                        variant="outline"
                        disabled={studentPage === 1}
                        onClick={() => setStudentPage((prev) => prev - 1)}
                        className="border-indigo-500/20 dark:border-indigo-700/20 rounded-full text-indigo-700 dark:text-indigo-300 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 transition-all duration-200"
                        aria-label="Previous student page"
                      >
                        <ChevronLeft className="h-4 w-4 mr-1" /> Previous
                      </Button>
                      <span className="text-gray-700 dark:text-gray-300">
                        Page {studentPage} of {studentTotalPages}
                      </span>
                      <Button
                        variant="outline"
                        disabled={studentPage === studentTotalPages}
                        onClick={() => setStudentPage((prev) => prev + 1)}
                        className="border-indigo-500/20 dark:border-indigo-700/20 rounded-full text-indigo-700 dark:text-indigo-300 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 transition-all duration-200"
                        aria-label="Next student page"
                      >
                        Next <ChevronRight className="h-4 w-4 ml-1" />
                      </Button>
                    </div>
                  </>
                ) : (
                  <p className="text-sm text-gray-500 dark:text-gray-400">No students found.</p>
                )}
              </div>
              <div>
                <h2 className="text-xl font-semibold text-indigo-700 dark:text-indigo-300">Advisors ({filteredAndSortedAdvisors.length})</h2>
                <div className="flex justify-between items-center gap-4 mt-4">
                  <Button
                    asChild
                    className="bg-gradient-to-r from-indigo-500 to-blue-600 dark:from-indigo-700 dark:to-blue-800 text-white rounded-full hover:from-indigo-600 hover:to-blue-700 dark:hover:from-indigo-800 dark:hover:to-blue-900 transition-all duration-300 transform hover:scale-105"
                  >
                    <Link href="/department-head/advisors/create" aria-label="Add new advisor">Add Advisor</Link>
                  </Button>
                  <div className="flex gap-4">
                    <Input
                      placeholder="Search advisors by name or email"
                      value={advisorSearch}
                      onChange={(e) => setAdvisorSearch(e.target.value)}
                      className="w-48 bg-white dark:bg-gray-900 border-indigo-500/20 dark:border-indigo-700/20 rounded-full focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 transition-all duration-300 hover:shadow-md"
                      aria-label="Search advisors"
                    />
                    <Select value={advisorStatusFilter} onValueChange={setAdvisorStatusFilter}>
                      <SelectTrigger className="w-40 bg-white dark:bg-gray-900 border-indigo-500/20 dark:border-indigo-700/20 rounded-full focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 transition-all duration-300 hover:shadow-md">
                        <SelectValue placeholder="Filter by status" />
                      </SelectTrigger>
                      <SelectContent className="bg-white dark:bg-gray-900 border-indigo-500/20 dark:border-indigo-700/20 rounded-lg">
                        <SelectItem value="all">All Statuses</SelectItem>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="inactive">Inactive</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                {paginatedAdvisors.length > 0 ? (
                  <>
                    <Table className="border border-indigo-500/20 dark:border-indigo-700/20 rounded-lg mt-4">
                      <TableHeader>
                        <TableRow className="bg-indigo-50 dark:bg-indigo-900/30 hover:bg-indigo-100 dark:hover:bg-indigo-800/50">
                          <TableHead className="cursor-pointer text-indigo-700 dark:text-indigo-300" onClick={() => handleAdvisorSort('name')}>
                            Name
                            {advisorSortColumn === 'name' && (
                              sortDirection === 'asc' ? <ArrowUp className="inline ml-1 h-4 w-4" /> : <ArrowDown className="inline ml-1 h-4 w-4" />
                            )}
                          </TableHead>
                          <TableHead className="cursor-pointer text-indigo-700 dark:text-indigo-300" onClick={() => handleAdvisorSort('email')}>
                            Email
                            {advisorSortColumn === 'email' && (
                              sortDirection === 'asc' ? <ArrowUp className="inline ml-1 h-4 w-4" /> : <ArrowDown className="inline ml-1 h-4 w-4" />
                            )}
                          </TableHead>
                          <TableHead className="cursor-pointer text-indigo-700 dark:text-indigo-300" onClick={() => handleAdvisorSort('specialization')}>
                            Specialization
                            {advisorSortColumn === 'specialization' && (
                              sortDirection === 'asc' ? <ArrowUp className="inline ml-1 h-4 w-4" /> : <ArrowDown className="inline ml-1 h-4 w-4" />
                            )}
                          </TableHead>
                          <TableHead className="cursor-pointer text-indigo-700 dark:text-indigo-300" onClick={() => handleAdvisorSort('status')}>
                            Status
                            {advisorSortColumn === 'status' && (
                              sortDirection === 'asc' ? <ArrowUp className="inline ml-1 h-4 w-4" /> : <ArrowDown className="inline ml-1 h-4 w-4" />
                            )}
                          </TableHead>
                          <TableHead className="cursor-pointer text-indigo-700 dark:text-indigo-300" onClick={() => handleAdvisorSort('student_count')}>
                            Students
                            {advisorSortColumn === 'student_count' && (
                              sortDirection === 'asc' ? <ArrowUp className="inline ml-1 h-4 w-4" /> : <ArrowDown className="inline ml-1 h-4 w-4" />
                            )}
                          </TableHead>
                          <TableHead className="text-indigo-700 dark:text-indigo-300">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {paginatedAdvisors.map((advisor, index) => (
                          <TableRow
                            key={advisor.user_id}
                            className={`transition-colors duration-200 ${index % 2 === 0 ? 'bg-white dark:bg-gray-900' : 'bg-indigo-50/50 dark:bg-indigo-900/20'} hover:bg-indigo-100 dark:hover:bg-indigo-800/50`}
                          >
                            <TableCell className="text-gray-700 dark:text-gray-300">
                              <div className="flex items-center gap-2">
                                <span>{advisor.name}</span>
                                {('gender' in advisor && advisor.gender) && (
                                  <span className="text-xs text-gray-500 dark:text-gray-400 capitalize">({advisor.gender})</span>
                                )}
                              </div>
                            </TableCell>
                            <TableCell className="text-gray-700 dark:text-gray-300">{advisor.email}</TableCell>
                            <TableCell className="text-gray-700 dark:text-gray-300">{advisor.specialization ?? 'N/A'}</TableCell>
                            <TableCell className="text-gray-700 dark:text-gray-300">
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                advisor.status?.toLowerCase() === 'active' 
                                  ? 'bg-green-100 text-green-700 dark:bg-green-800 dark:text-green-200' 
                                  : advisor.status?.toLowerCase() === 'inactive'
                                  ? 'bg-red-100 text-red-700 dark:bg-red-800 dark:text-red-200'
                                  : 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-200'
                              }`}>
                                {advisor.status}
                              </span>
                            </TableCell>
                            <TableCell className="text-gray-700 dark:text-gray-300">{advisor.student_count}</TableCell>
                            <TableCell className="flex gap-2">
                              <Button
                                variant="ghost"
                                size="icon"
                                asChild
                                className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 hover:bg-blue-100 dark:hover:bg-blue-900/50 transition-all duration-200"
                                aria-label="View advisor details"
                              >
                                <Link href={`/department-head/advisors/${advisor.user_id}`}>
                                  <Eye className="h-4 w-4" />
                                </Link>
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                asChild
                                className="text-green-600 dark:text-green-400 hover:text-green-800 dark:hover:text-green-300 hover:bg-green-100 dark:hover:bg-green-900/50 transition-all duration-200"
                                aria-label="Edit advisor"
                              >
                                <Link href={`/department-head/advisors/${advisor.user_id}/edit`}>
                                  <Pencil className="h-4 w-4" />
                                </Link>
                              </Button>
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300 hover:bg-red-100 dark:hover:bg-red-900/50 transition-all duration-200"
                                    aria-label="Delete advisor"
                                  >
                                    <Trash className="h-4 w-4" />
                                  </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent className="bg-white dark:bg-gray-900 border-indigo-500/20 dark:border-indigo-700/20 rounded-lg">
                                  <AlertDialogHeader>
                                    <AlertDialogTitle className="text-indigo-700 dark:text-indigo-300">Are you sure?</AlertDialogTitle>
                                    <AlertDialogDescription className="text-gray-700 dark:text-gray-300">
                                      This will delete {advisor.name} permanently.
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel className="bg-white dark:bg-gray-900 border-indigo-500/20 dark:border-indigo-700/20 rounded-full hover:bg-indigo-50 dark:hover:bg-indigo-900/30 transition-all duration-200">Cancel</AlertDialogCancel>
                                    <AlertDialogAction
                                      className="bg-gradient-to-r from-indigo-500 to-blue-600 dark:from-indigo-700 dark:to-blue-800 text-white rounded-full hover:from-indigo-600 hover:to-blue-700 dark:hover:from-indigo-800 dark:hover:to-blue-900 transition-all duration-300 transform hover:scale-105"
                                      onClick={() => handleDeleteAdvisor(advisor.user_id, advisor.name)}
                                    >
                                      Delete
                                    </AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                    <div className="flex justify-between items-center mt-4">
                      <Button
                        variant="outline"
                        disabled={advisorPage === 1}
                        onClick={() => setAdvisorPage((prev) => prev - 1)}
                        className="border-indigo-500/20 dark:border-indigo-700/20 rounded-full text-indigo-700 dark:text-indigo-300 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 transition-all duration-200"
                        aria-label="Previous advisor page"
                      >
                        <ChevronLeft className="h-4 w-4 mr-1" /> Previous
                      </Button>
                      <span className="text-gray-700 dark:text-gray-300">
                        Page {advisorPage} of {advisorTotalPages}
                      </span>
                      <Button
                        variant="outline"
                        disabled={advisorPage === advisorTotalPages}
                        onClick={() => setAdvisorPage((prev) => prev + 1)}
                        className="border-indigo-500/20 dark:border-indigo-700/20 rounded-full text-indigo-700 dark:text-indigo-300 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 transition-all duration-200"
                        aria-label="Next advisor page"
                      >
                        Next <ChevronRight className="h-4 w-4 ml-1" />
                      </Button>
                    </div>
                  </>
                ) : (
                  <p className="text-sm text-gray-500 dark:text-gray-400">No advisors found.</p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
        <Button
          asChild
          variant="outline"
          className="border-indigo-500/20 dark:border-indigo-700/20 rounded-full text-indigo-700 dark:text-indigo-300 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 transition-all duration-200"
        >
          <Link href="/department-head" aria-label="Back to dashboard">Back to Dashboard</Link>
        </Button>
      </div>
    </AppLayout>
  );
};

export default Show;



// import React, { useState, useEffect } from 'react';
// import { Head, Link, router } from '@inertiajs/react';
// import AppLayout from '@/layouts/app-layout';
// import { Button } from '@/components/ui/button';
// import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
// import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
// import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
// import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
// import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
// import { Input } from '@/components/ui/input';
// import { X, Eye, Pencil, Trash, ArrowUp, ArrowDown, ChevronLeft, ChevronRight } from 'lucide-react';

// interface Department {
//   department_id: number;
//   name: string;
//   description: string | null;
//   status: string;
// }

// interface Student {
//   student_id: number;
//   name: string;
//   cgpa: number | null;
//   year_of_study: string | null;
//   advisors: { user_id: number; name: string }[];
//   status: string;
// }

// interface Advisor {
//   user_id: number;
//   name: string;
//   email: string;
//   phone: string | null;
//   specialization: string | null;
//   status: string;
//   student_count: number;
// }

// interface Props {
//   department: Department;
//   students: Student[];
//   advisors: Advisor[];
//   success?: string;
//   error?: string;
// }

// const breadcrumbs = [
//   { title: 'Dashboard', href: '/department-head' },
//   { title: 'Department Details', href: '/department-head/department' },
// ];

// const Show: React.FC<Props> = ({ department, students, advisors, success, error }) => {
//   const [showSuccess, setShowSuccess] = useState(!!success);
//   const [showError, setShowError] = useState(!!error);
//   const [studentStatusFilter, setStudentStatusFilter] = useState<string>('all');
//   const [advisorStatusFilter, setAdvisorStatusFilter] = useState<string>('all');
//   const [studentSearch, setStudentSearch] = useState<string>('');
//   const [advisorSearch, setAdvisorSearch] = useState<string>('');
//   const [studentSortColumn, setStudentSortColumn] = useState<keyof Student | null>(null);
//   const [advisorSortColumn, setAdvisorSortColumn] = useState<keyof Advisor | null>(null);
//   const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
//   const [studentPage, setStudentPage] = useState<number>(1);
//   const [advisorPage, setAdvisorPage] = useState<number>(1);
//   const itemsPerPage = 5;

//   // Auto-dismiss success/error messages after 3 seconds
//   useEffect(() => {
//     if (showSuccess || showError) {
//       const timer = setTimeout(() => {
//         setShowSuccess(false);
//         setShowError(false);
//       }, 3000);
//       return () => clearTimeout(timer);
//     }
//   }, [showSuccess, showError]);

//   // Filter, search, and sort students
//   const filteredAndSortedStudents = React.useMemo(() => {
//     let filtered = [...students];

//     // Apply status filter
//     if (studentStatusFilter !== 'all') {
//       filtered = filtered.filter((student) => student.status.toLowerCase() === studentStatusFilter);
//     }

//     // Apply search
//     if (studentSearch) {
//       filtered = filtered.filter((student) =>
//         student.name.toLowerCase().includes(studentSearch.toLowerCase())
//       );
//     }

//     // Apply sorting
//     if (studentSortColumn) {
//       filtered.sort((a, b) => {
//         const aValue = a[studentSortColumn] ?? '';
//         const bValue = b[studentSortColumn] ?? '';
//         if (studentSortColumn === 'cgpa') {
//           const aNum = typeof aValue === 'number' ? aValue : 0;
//           const bNum = typeof bValue === 'number' ? bValue : 0;
//           return sortDirection === 'asc' ? aNum - bNum : bNum - aNum;
//         }
//         if (studentSortColumn === 'advisors') {
//           const aNames = a.advisors.map((adv) => adv.name).join(', ') || '';
//           const bNames = b.advisors.map((adv) => adv.name).join(', ') || '';
//           return sortDirection === 'asc'
//             ? aNames.localeCompare(bNames)
//             : bNames.localeCompare(aNames);
//         }
//         return sortDirection === 'asc'
//           ? aValue.toString().localeCompare(bValue.toString())
//           : bValue.toString().localeCompare(aValue.toString());
//       });
//     }

//     return filtered;
//   }, [students, studentStatusFilter, studentSearch, studentSortColumn, sortDirection]);

//   // Filter, search, and sort advisors
//   const filteredAndSortedAdvisors = React.useMemo(() => {
//     let filtered = [...advisors];

//     // Apply status filter
//     if (advisorStatusFilter !== 'all') {
//       filtered = filtered.filter((advisor) => advisor.status.toLowerCase() === advisorStatusFilter);
//     }

//     // Apply search
//     if (advisorSearch) {
//       filtered = filtered.filter(
//         (advisor) =>
//           advisor.name.toLowerCase().includes(advisorSearch.toLowerCase()) ||
//           advisor.email.toLowerCase().includes(advisorSearch.toLowerCase())
//       );
//     }

//     // Apply sorting
//     if (advisorSortColumn) {
//       filtered.sort((a, b) => {
//         const aValue = a[advisorSortColumn] ?? '';
//         const bValue = b[advisorSortColumn] ?? '';
//         if (advisorSortColumn === 'student_count') {
//           const aNum = typeof aValue === 'number' ? aValue : 0;
//           const bNum = typeof bValue === 'number' ? bValue : 0;
//           return sortDirection === 'asc' ? aNum - bNum : bNum - aNum;
//         }
//         return sortDirection === 'asc'
//           ? aValue.toString().localeCompare(bValue.toString())
//           : bValue.toString().localeCompare(aValue.toString());
//       });
//     }

//     return filtered;
//   }, [advisors, advisorStatusFilter, advisorSearch, advisorSortColumn, sortDirection]);

//   // Pagination for students
//   const studentTotalPages = Math.ceil(filteredAndSortedStudents.length / itemsPerPage);
//   const paginatedStudents = filteredAndSortedStudents.slice(
//     (studentPage - 1) * itemsPerPage,
//     studentPage * itemsPerPage
//   );

//   // Pagination for advisors
//   const advisorTotalPages = Math.ceil(filteredAndSortedAdvisors.length / itemsPerPage);
//   const paginatedAdvisors = filteredAndSortedAdvisors.slice(
//     (advisorPage - 1) * itemsPerPage,
//     advisorPage * itemsPerPage
//   );

//   const handleDeleteStudent = (student_id: number, student_name: string) => {
//     router.delete(route('department-head.destroystudent', student_id), {
//       onSuccess: () => {
//         console.log(`Student ${student_name} deleted successfully`);
//         setShowSuccess(true);
//       },
//       onError: (errors) => {
//         console.error('Failed to delete student:', errors);
//         setShowError(true);
//       },
//     });
//   };

//   const handleDeleteAdvisor = (user_id: number, advisor_name: string) => {
//     router.delete(route('department-head.destroyadvisor', user_id), {
//       onSuccess: () => {
//         console.log(`Advisor ${advisor_name} deleted successfully`);
//         setShowSuccess(true);
//       },
//       onError: (errors) => {
//         console.error('Failed to delete advisor:', errors);
//         setShowError(true);
//       },
//     });
//   };

//   const handleStudentSort = (column: keyof Student) => {
//     if (studentSortColumn === column) {
//       setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
//     } else {
//       setStudentSortColumn(column);
//       setSortDirection('asc');
//     }
//   };

//   const handleAdvisorSort = (column: keyof Advisor) => {
//     if (advisorSortColumn === column) {
//       setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
//     } else {
//       setAdvisorSortColumn(column);
//       setSortDirection('asc');
//     }
//   };

//   return (
//     <AppLayout breadcrumbs={breadcrumbs}>
//       <Head title="Department Details" />
//       <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4">
//         <h1 className="text-2xl font-bold">Details - {department.name}</h1>
//         {showSuccess && success && (
//           <div className="bg-green-100 dark:bg-green-800 text-green-800 dark:text-green-100 p-4 rounded-xl flex justify-between items-center">
//             <span>{success}</span>
//             <Button
//               variant="ghost"
//               size="sm"
//               onClick={() => setShowSuccess(false)}
//               className="text-green-800 dark:text-green-100 hover:bg-green-200 dark:hover:bg-green-700"
//               aria-label="Close success alert"
//             >
//               <X className="h-4 w-4" />
//             </Button>
//           </div>
//         )}
//         {showError && error && (
//           <div className="bg-red-100 dark:bg-red-800 text-red-800 dark:text-red-100 p-4 rounded-xl flex justify-between items-center">
//             <span>{error}</span>
//             <Button
//               variant="ghost"
//               size="sm"
//               onClick={() => setShowError(false)}
//               className="text-red-800 dark:text-red-100 hover:bg-red-200 dark:hover:bg-red-700"
//               aria-label="Close error alert"
//             >
//               <X className="h-4 w-4" />
//             </Button>
//           </div>
//         )}
//         <div className="space-y-4">
//           <Card className="w-80 transition-transform duration-200 hover:scale-105 hover:shadow-lg">
//             <CardHeader>
//               <CardTitle>{department.name}</CardTitle>
//             </CardHeader>
//             <CardContent>
//               <Accordion type="single" collapsible className="w-full">
//                 <AccordionItem value="description">
//                   <AccordionTrigger>Description</AccordionTrigger>
//                   <AccordionContent>{department.description || 'N/A'}</AccordionContent>
//                 </AccordionItem>
//                 <AccordionItem value="status">
//                   <AccordionTrigger>Status</AccordionTrigger>
//                   <AccordionContent>{department.status}</AccordionContent>
//                 </AccordionItem>
//               </Accordion>
//             </CardContent>
//           </Card>
//           <Card>
//             <CardHeader>
//               <CardTitle>Department Overview</CardTitle>
//             </CardHeader>
//             <CardContent className="space-y-4">
//               <div>
//                 <h2 className="text-xl font-semibold">Students ({filteredAndSortedStudents.length})</h2>
//                 <div className="flex justify-between items-center">
//                   <Button asChild>
//                     <Link href="/department-head/students/create">Add Student</Link>
//                   </Button>
//                   <div className="flex gap-4">
//                     <Input
//                       placeholder="Search students by name"
//                       value={studentSearch}
//                       onChange={(e) => setStudentSearch(e.target.value)}
//                       className="w-48"
//                     />
//                     <Select value={studentStatusFilter} onValueChange={setStudentStatusFilter}>
//                       <SelectTrigger className="w-40">
//                         <SelectValue placeholder="Filter by status" />
//                       </SelectTrigger>
//                       <SelectContent>
//                         <SelectItem value="all">All Statuses</SelectItem>
//                         <SelectItem value="active">Active</SelectItem>
//                         <SelectItem value="inactive">Inactive</SelectItem>
//                       </SelectContent>
//                     </Select>
//                   </div>
//                 </div>
//                 {paginatedStudents.length > 0 ? (
//                   <>
//                     <Table>
//                       <TableHeader>
//                         <TableRow>
//                           <TableHead className="cursor-pointer" onClick={() => handleStudentSort('name')}>
//                             Name
//                             {studentSortColumn === 'name' && (
//                               sortDirection === 'asc' ? <ArrowUp className="inline ml-1 h-4 w-4" /> : <ArrowDown className="inline ml-1 h-4 w-4" />
//                             )}
//                           </TableHead>
//                           <TableHead className="cursor-pointer" onClick={() => handleStudentSort('cgpa')}>
//                             CGPA
//                             {studentSortColumn === 'cgpa' && (
//                               sortDirection === 'asc' ? <ArrowUp className="inline ml-1 h-4 w-4" /> : <ArrowDown className="inline ml-1 h-4 w-4" />
//                             )}
//                           </TableHead>
//                           <TableHead className="cursor-pointer" onClick={() => handleStudentSort('year_of_study')}>
//                             Year
//                             {studentSortColumn === 'year_of_study' && (
//                               sortDirection === 'asc' ? <ArrowUp className="inline ml-1 h-4 w-4" /> : <ArrowDown className="inline ml-1 h-4 w-4" />
//                             )}
//                           </TableHead>
//                           <TableHead className="cursor-pointer" onClick={() => handleStudentSort('advisors')}>
//                             Advisors
//                             {studentSortColumn === 'advisors' && (
//                               sortDirection === 'asc' ? <ArrowUp className="inline ml-1 h-4 w-4" /> : <ArrowDown className="inline ml-1 h-4 w-4" />
//                             )}
//                           </TableHead>
//                           <TableHead>Actions</TableHead>
//                         </TableRow>
//                       </TableHeader>
//                       <TableBody>
//                         {paginatedStudents.map((student) => (
//                           <TableRow
//                             key={student.student_id}
//                             className="transition-colors duration-200 hover:bg-gray-100 dark:hover:bg-gray-800"
//                           >
//                             <TableCell>{student.name}</TableCell>
//                             <TableCell>{student.cgpa ?? 'N/A'}</TableCell>
//                             <TableCell>{student.year_of_study ?? 'N/A'}</TableCell>
//                             <TableCell>{student.advisors.map((advisor) => advisor.name).join(', ') || 'None'}</TableCell>
//                             <TableCell className="flex gap-2">
//                               <Button
//                                 variant="ghost"
//                                 size="icon"
//                                 asChild
//                                 className="text-blue-600 hover:text-blue-800"
//                               >
//                                 <Link href={`/department-head/students/${student.student_id}`} aria-label="View student">
//                                   <Eye className="h-4 w-4" />
//                                 </Link>
//                               </Button>
//                               <Button
//                                 variant="ghost"
//                                 size="icon"
//                                 asChild
//                                 className="text-green-600 hover:text-green-800"
//                               >
//                                 <Link href={`/department-head/students/${student.student_id}/edit`} aria-label="Edit student">
//                                   <Pencil className="h-4 w-4" />
//                                 </Link>
//                               </Button>
//                               <AlertDialog>
//                                 <AlertDialogTrigger asChild>
//                                   <Button
//                                     variant="ghost"
//                                     size="icon"
//                                     className="text-red-600 hover:text-red-800"
//                                     aria-label="Delete student"
//                                   >
//                                     <Trash className="h-4 w-4" />
//                                   </Button>
//                                 </AlertDialogTrigger>
//                                 <AlertDialogContent>
//                                   <AlertDialogHeader>
//                                     <AlertDialogTitle>Are you sure?</AlertDialogTitle>
//                                     <AlertDialogDescription>
//                                       This will delete {student.name} permanently.
//                                     </AlertDialogDescription>
//                                   </AlertDialogHeader>
//                                   <AlertDialogFooter>
//                                     <AlertDialogCancel>Cancel</AlertDialogCancel>
//                                     <AlertDialogAction onClick={() => handleDeleteStudent(student.student_id, student.name)}>
//                                       Delete
//                                     </AlertDialogAction>
//                                   </AlertDialogFooter>
//                                 </AlertDialogContent>
//                               </AlertDialog>
//                             </TableCell>
//                           </TableRow>
//                         ))}
//                       </TableBody>
//                     </Table>
//                     <div className="flex justify-between items-center mt-4">
//                       <Button
//                         variant="outline"
//                         disabled={studentPage === 1}
//                         onClick={() => setStudentPage((prev) => prev - 1)}
//                       >
//                         <ChevronLeft className="h-4 w-4" /> Previous
//                       </Button>
//                       <span>
//                         Page {studentPage} of {studentTotalPages}
//                       </span>
//                       <Button
//                         variant="outline"
//                         disabled={studentPage === studentTotalPages}
//                         onClick={() => setStudentPage((prev) => prev + 1)}
//                       >
//                         Next <ChevronRight className="h-4 w-4" />
//                       </Button>
//                     </div>
//                   </>
//                 ) : (
//                   <p className="text-sm text-gray-500">No students found.</p>
//                 )}
//               </div>
//               <div>
//                 <h2 className="text-xl font-semibold">Advisors ({filteredAndSortedAdvisors.length})</h2>
//                 <div className="flex justify-between items-center">
//                   <Button asChild>
//                     <Link href="/department-head/advisors/create">Add Advisor</Link>
//                   </Button>
//                   <div className="flex gap-4">
//                     <Input
//                       placeholder="Search advisors by name or email"
//                       value={advisorSearch}
//                       onChange={(e) => setAdvisorSearch(e.target.value)}
//                       className="w-48"
//                     />
//                     <Select value={advisorStatusFilter} onValueChange={setAdvisorStatusFilter}>
//                       <SelectTrigger className="w-40">
//                         <SelectValue placeholder="Filter by status" />
//                       </SelectTrigger>
//                       <SelectContent>
//                         <SelectItem value="all">All Statuses</SelectItem>
//                         <SelectItem value="active">Active</SelectItem>
//                         <SelectItem value="inactive">Inactive</SelectItem>
//                       </SelectContent>
//                     </Select>
//                   </div>
//                 </div>
//                 {paginatedAdvisors.length > 0 ? (
//                   <>
//                     <Table>
//                       <TableHeader>
//                         <TableRow>
//                           <TableHead className="cursor-pointer" onClick={() => handleAdvisorSort('name')}>
//                             Name
//                             {advisorSortColumn === 'name' && (
//                               sortDirection === 'asc' ? <ArrowUp className="inline ml-1 h-4 w-4" /> : <ArrowDown className="inline ml-1 h-4 w-4" />
//                             )}
//                           </TableHead>
//                           <TableHead className="cursor-pointer" onClick={() => handleAdvisorSort('email')}>
//                             Email
//                             {advisorSortColumn === 'email' && (
//                               sortDirection === 'asc' ? <ArrowUp className="inline ml-1 h-4 w-4" /> : <ArrowDown className="inline ml-1 h-4 w-4" />
//                             )}
//                           </TableHead>
//                           <TableHead className="cursor-pointer" onClick={() => handleAdvisorSort('specialization')}>
//                             Specialization
//                             {advisorSortColumn === 'specialization' && (
//                               sortDirection === 'asc' ? <ArrowUp className="inline ml-1 h-4 w-4" /> : <ArrowDown className="inline ml-1 h-4 w-4" />
//                             )}
//                           </TableHead>
//                           <TableHead className="cursor-pointer" onClick={() => handleAdvisorSort('status')}>
//                             Status
//                             {advisorSortColumn === 'status' && (
//                               sortDirection === 'asc' ? <ArrowUp className="inline ml-1 h-4 w-4" /> : <ArrowDown className="inline ml-1 h-4 w-4" />
//                             )}
//                           </TableHead>
//                           <TableHead className="cursor-pointer" onClick={() => handleAdvisorSort('student_count')}>
//                             Students
//                             {advisorSortColumn === 'student_count' && (
//                               sortDirection === 'asc' ? <ArrowUp className="inline ml-1 h-4 w-4" /> : <ArrowDown className="inline ml-1 h-4 w-4" />
//                             )}
//                           </TableHead>
//                           <TableHead>Actions</TableHead>
//                         </TableRow>
//                       </TableHeader>
//                       <TableBody>
//                         {paginatedAdvisors.map((advisor) => (
//                           <TableRow
//                             key={advisor.user_id}
//                             className="transition-colors duration-200 hover:bg-gray-100 dark:hover:bg-gray-800"
//                           >
//                             <TableCell>{advisor.name}</TableCell>
//                             <TableCell>{advisor.email}</TableCell>
//                             <TableCell>{advisor.specialization ?? 'N/A'}</TableCell>
//                             <TableCell>{advisor.status}</TableCell>
//                             <TableCell>{advisor.student_count}</TableCell>
//                             <TableCell className="flex gap-2">
//                               <Button
//                                 variant="ghost"
//                                 size="icon"
//                                 asChild
//                                 className="text-blue-600 hover:text-blue-800"
//                               >
//                                 <Link href={`/department-head/advisors/${advisor.user_id}`} aria-label="View advisor">
//                                   <Eye className="h-4 w-4" />
//                                 </Link>
//                               </Button>
//                               <Button
//                                 variant="ghost"
//                                 size="icon"
//                                 asChild
//                                 className="text-green-600 hover:text-green-800"
//                               >
//                                 <Link href={`/department-head/advisors/${advisor.user_id}/edit`} aria-label="Edit advisor">
//                                   <Pencil className="h-4 w-4" />
//                                 </Link>
//                               </Button>
//                               <AlertDialog>
//                                 <AlertDialogTrigger asChild>
//                                   <Button
//                                     variant="ghost"
//                                     size="icon"
//                                     className="text-red-600 hover:text-red-800"
//                                     aria-label="Delete advisor"
//                                   >
//                                     <Trash className="h-4 w-4" />
//                                   </Button>
//                                 </AlertDialogTrigger>
//                                 <AlertDialogContent>
//                                   <AlertDialogHeader>
//                                     <AlertDialogTitle>Are you sure?</AlertDialogTitle>
//                                     <AlertDialogDescription>
//                                       This will delete {advisor.name} permanently.
//                                     </AlertDialogDescription>
//                                   </AlertDialogHeader>
//                                   <AlertDialogFooter>
//                                     <AlertDialogCancel>Cancel</AlertDialogCancel>
//                                     <AlertDialogAction onClick={() => handleDeleteAdvisor(advisor.user_id, advisor.name)}>
//                                       Delete
//                                     </AlertDialogAction>
//                                   </AlertDialogFooter>
//                                 </AlertDialogContent>
//                               </AlertDialog>
//                             </TableCell>
//                           </TableRow>
//                         ))}
//                       </TableBody>
//                     </Table>
//                     <div className="flex justify-between items-center mt-4">
//                       <Button
//                         variant="outline"
//                         disabled={advisorPage === 1}
//                         onClick={() => setAdvisorPage((prev) => prev - 1)}
//                       >
//                         <ChevronLeft className="h-4 w-4" /> Previous
//                       </Button>
//                       <span>
//                         Page {advisorPage} of {advisorTotalPages}
//                       </span>
//                       <Button
//                         variant="outline"
//                         disabled={advisorPage === advisorTotalPages}
//                         onClick={() => setAdvisorPage((prev) => prev + 1)}
//                       >
//                         Next <ChevronRight className="h-4 w-4" />
//                       </Button>
//                     </div>
//                   </>
//                 ) : (
//                   <p className="text-sm text-gray-500">No advisors found.</p>
//                 )}
//               </div>
//             </CardContent>
//           </Card>
//         </div>
//         <Button asChild variant="outline">
//           <Link href="/department-head">Back to Dashboard</Link>
//         </Button>
//       </div>
//     </AppLayout>
//   );
// };

// export default Show;