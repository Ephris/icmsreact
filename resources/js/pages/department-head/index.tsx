import React, { useState, useEffect } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { X, Eye, Pencil, Trash, ArrowUp, ArrowDown, ChevronLeft, ChevronRight, Users, TrendingUp, FileText, GraduationCap } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart';
import { Area, AreaChart, Bar, BarChart, CartesianGrid, XAxis, ResponsiveContainer, Pie, PieChart, Cell } from 'recharts';

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
  advisors: { user_id: number; name: string }[];
  status: string;
  university_id?: string | null;
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

interface AnalyticsDataset {
  students: {
    total: number;
    active: number;
    inactive: number;
    with_letters: number;
    by_year: { year: string; count: number }[];
  };
  advisors: {
    total: number;
    active: number;
    inactive: number;
    load: { name: string; student_count: number }[];
  };
  applications: {
    by_status: { status: string; count: number }[];
    trend: { period: string; accepted: number; pending: number; approved: number; rejected: number }[];
  };
  letters: { status: string; count: number }[];
  forms: { status: string; count: number }[];
  recent_activity: { type: string; title: string; description: string; timestamp: string }[];
}

interface Props {
  department: Department;
  students: Student[];
  advisors: Advisor[];
  analytics: AnalyticsDataset;
  success?: string;
  error?: string;
}

const breadcrumbs = [
  { title: 'Dashboard', href: '/department-head' },
];

const Index: React.FC<Props> = (props) => {
  const { department, advisors, analytics, success, error } = props;
  const [showSuccess, setShowSuccess] = useState(!!success);
  const [showError, setShowError] = useState(!!error);
  const [advisorStatusFilter, setAdvisorStatusFilter] = useState<string>('all');
  const [advisorSearch, setAdvisorSearch] = useState<string>('');
  const [advisorSortColumn, setAdvisorSortColumn] = useState<keyof Advisor | null>(null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [advisorPage, setAdvisorPage] = useState<number>(1);
  const itemsPerPage = 5;

  // Prepare chart datasets
  const applicationsTrendData = analytics?.applications?.trend?.length
    ? analytics.applications.trend
    : [{ period: 'N/A', accepted: 0, approved: 0, pending: 0, rejected: 0 }];

  const studentsByYearData = analytics?.students?.by_year?.length
    ? analytics.students.by_year
    : [{ year: 'Not set', count: 0 }];

  const applicationStatusData = analytics?.applications?.by_status?.length
    ? analytics.applications.by_status
    : [{ status: 'pending', count: 0 }];

  const appStatusColor: Record<string, string> = {
    accepted: '#6366f1',
    approved: '#10b981',
    pending: '#f59e0b',
    rejected: '#ef4444',
  };

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

  // Filter, search, and sort advisors
  const filteredAndSortedAdvisors = React.useMemo(() => {
    const baseAdvisors: Advisor[] = Array.isArray(advisors) ? advisors : [];
    let filtered = [...baseAdvisors];
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

  // Pagination for advisors
  const advisorTotalPages = Math.ceil(filteredAndSortedAdvisors.length / itemsPerPage);
  const paginatedAdvisors = filteredAndSortedAdvisors.slice(
    (advisorPage - 1) * itemsPerPage,
    advisorPage * itemsPerPage
  );

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
      <Head title="Department Head Dashboard" />
      <div className="flex flex-1 flex-col gap-6 p-6">
        <h1 className="text-3xl font-bold text-indigo-700 dark:text-indigo-300">Dashboard - {department?.name ?? 'Department'}</h1>
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
    {/* Summary cards */}
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <Link href="/department-head/department" className="cursor-pointer">
        <Card className="rounded-2xl shadow-md hover:shadow-xl transition-all duration-300">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-base">
              <Users className="h-4 w-4" />
              Total Students
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{analytics.students.total}</div>
            <div className="text-xs text-gray-500 mt-1">
              {analytics.students.active} active • {analytics.students.inactive} inactive
            </div>
          </CardContent>
        </Card>
      </Link>
      <Link href="/department-head/accepted-applications" className="cursor-pointer">
        <Card className="rounded-2xl shadow-md hover:shadow-xl transition-all duration-300">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-base">
              <GraduationCap className="h-4 w-4" />
              With Letters
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{analytics.students.with_letters}</div>
            <div className="text-xs text-gray-500 mt-1">Students with application letters</div>
          </CardContent>
        </Card>
      </Link>
      <Link href="/department-head/department" className="cursor-pointer">
        <Card className="rounded-2xl shadow-md hover:shadow-xl transition-all duration-300">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-base">
              <FileText className="h-4 w-4" />
              Active Advisors
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{analytics.advisors.active}</div>
            <div className="text-xs text-gray-500 mt-1">{analytics.advisors.total} total</div>
          </CardContent>
        </Card>
      </Link>
      <Link href="/department-head/accepted-applications" className="cursor-pointer">
        <Card className="rounded-2xl shadow-md hover:shadow-xl transition-all duration-300">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-base">
              <TrendingUp className="h-4 w-4" />
              Accepted Apps
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {analytics.applications.by_status.find(s => s.status === 'accepted')?.count ?? 0}
            </div>
            <div className="text-xs text-gray-500 mt-1">Total accepted applications</div>
          </CardContent>
        </Card>
      </Link>
    </div>

    {/* Charts */}
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <Link href="/department-head/accepted-applications" className="cursor-pointer lg:col-span-2">
        <Card className="rounded-2xl hover:shadow-xl transition-all duration-300">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Applications Trend (6 months)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer
              config={{ accepted: { label: 'Accepted' } }}
              className="h-64"
            >
              <AreaChart data={applicationsTrendData} margin={{ left: 12, right: 12 }}>
                <CartesianGrid vertical={false} strokeDasharray="3 3" />
                <XAxis dataKey="period" tickLine={false} axisLine={false} tickMargin={8} />
                <ChartTooltip content={<ChartTooltipContent nameKey="accepted" className="text-foreground" />} />
                <Area dataKey="accepted" type="monotone" fill={appStatusColor.accepted} stroke={appStatusColor.accepted} fillOpacity={0.15} />
                <Area dataKey="approved" type="monotone" fill={appStatusColor.approved} stroke={appStatusColor.approved} fillOpacity={0.15} />
                <Area dataKey="pending" type="monotone" fill={appStatusColor.pending} stroke={appStatusColor.pending} fillOpacity={0.15} />
                <Area dataKey="rejected" type="monotone" fill={appStatusColor.rejected} stroke={appStatusColor.rejected} fillOpacity={0.15} />
              </AreaChart>
            </ChartContainer>
          </CardContent>
        </Card>
      </Link>
      <Link href="/department-head/accepted-applications" className="cursor-pointer">
        <Card className="rounded-2xl hover:shadow-xl transition-all duration-300">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Application Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={256}>
              <PieChart>
                <Pie data={applicationStatusData} dataKey="count" nameKey="status" outerRadius={90} label>
                  {applicationStatusData.map((item, idx) => (
                    <Cell key={idx} fill={appStatusColor[item.status] || '#6366f1'} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </Link>
    </div>

    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <Link href="/department-head/department" className="cursor-pointer">
        <Card className="rounded-2xl hover:shadow-xl transition-all duration-300">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <GraduationCap className="h-5 w-5" />
              Students by Year
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer
              config={{ count: { label: 'Students' } }}
              className="h-64"
            >
              <BarChart data={studentsByYearData} margin={{ left: 12, right: 12, bottom: 32 }}>
                <CartesianGrid vertical={false} strokeDasharray="3 3" />
                <XAxis dataKey="year" tickLine={false} axisLine={false} tickMargin={8} />
                <ChartTooltip content={<ChartTooltipContent nameKey="count" className="text-foreground" />} />
                <Bar dataKey="count" fill="#6366f1" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>
      </Link>
    </div>
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
          <h2 className="text-xl font-semibold text-indigo-700 dark:text-indigo-300">Department Details</h2>
          <Card className="w-full max-w-md bg-white dark:bg-gray-900 border-none rounded-2xl shadow-lg transition-all duration-300 hover:shadow-xl animate-in fade-in zoom-in-95">
            <CardHeader className="bg-gradient-to-r from-indigo-500 to-blue-600 dark:from-indigo-700 dark:to-blue-800 rounded-t-2xl">
              <CardTitle className="text-white text-lg">Department: {department.name}</CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-2">
              <p className="text-sm text-gray-700 dark:text-gray-300"><strong>Description:</strong> {department.description || 'N/A'}</p>
              <p className="text-sm text-gray-700 dark:text-gray-300"><strong>Status:</strong> {department.status}</p>
            </CardContent>
          </Card>
        </div>
        {/* Students and advisors detailed tables removed per requirements */}
        <div className="space-y-6 hidden">
          <h2 className="text-xl font-semibold text-indigo-700 dark:text-indigo-300">Advisors ({filteredAndSortedAdvisors.length})</h2>
          <div className="flex justify-between items-center gap-4">
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
          {paginatedAdvisors.length > 0 && (
            <>
              <Table className="border border-indigo-500/20 dark:border-indigo-700/20 rounded-lg">
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
                          {advisor.gender && (
                            <span className="text-xs text-gray-500 capitalize">({advisor.gender})</span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-gray-700 dark:text-gray-300">{advisor.email}</TableCell>
                      <TableCell className="text-gray-700 dark:text-gray-300">{advisor.specialization ?? 'N/A'}</TableCell>
                      <TableCell className="text-gray-700 dark:text-gray-300">{advisor.status}</TableCell>
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
          )}
        </div>
        <div className="flex gap-4">
          <Button
            asChild
            className="bg-gradient-to-r from-indigo-500 to-blue-600 dark:from-indigo-700 dark:to-blue-800 text-white rounded-full hover:from-indigo-600 hover:to-blue-700 dark:hover:from-indigo-800 dark:hover:to-blue-900 transition-all duration-300 transform hover:scale-105"
          >
            <Link href="/department-head/advisorsassign" aria-label="Assign advisor">Assign Advisor</Link>
          </Button>
          <Button
            asChild
            className="bg-gradient-to-r from-indigo-500 to-blue-600 dark:from-indigo-700 dark:to-blue-800 text-white rounded-full hover:from-indigo-600 hover:to-blue-700 dark:hover:from-indigo-800 dark:hover:to-blue-900 transition-all duration-300 transform hover:scale-105"
          >
            <Link href="/department-head/trashed" aria-label="View trashed users">View Trashed Users</Link>
          </Button>
        </div>
      </div>
    </AppLayout>
  );
};

export default Index;