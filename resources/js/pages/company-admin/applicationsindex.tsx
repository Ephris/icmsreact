import React, { useState, useEffect } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Pagination, PaginationContent, PaginationItem, PaginationLink } from '@/components/ui/pagination';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Eye, X, AlertCircle, ArrowUpDown } from 'lucide-react';
import { type BreadcrumbItem } from '@/types';

interface Company {
  company_id: number;
  name: string;
}

interface Application {
  application_id: number;
  student_id?: number;
  student_name: string;
  student_email?: string;
  student_gender?: 'male' | 'female';
  student_university_id?: string | null;
  posting_title: string;
  posting_type: string;
  status: string;
  department: string;
  advisors: string[];
  cgpa: number | null;
  year_of_study: string | null;
  submitted_at: string | null;
  accepted_at?: string | null;
  analytics_id?: number | null;
  source: string | null;
  last_updated_by: string | null;
  has_accepted_application?: boolean;
}

interface PaginationData {
  data: Application[];
  current_page: number;
  last_page: number;
  next_page_url: string | null;
  prev_page_url: string | null;
  total: number;
}

interface Department {
  department_id: number;
  name: string;
}

interface Props {
  company: Company;
  applications: PaginationData;
  completedApplications?: PaginationData;
  departments: Department[];
  filters: {
    search?: string;
    status?: string;
    department_id?: string | number;
    min_gpa?: string | number;
    posting_type?: string;
    sort_by?: string;
    sort_dir?: string;
  };
  success?: string;
  error?: string;
}

const breadcrumbs: BreadcrumbItem[] = [
  { title: 'Dashboard', href: '/company-admin' },
  { title: 'Applications', href: '/company-admin/applications' },
];

export default function ApplicationsIndex({ company, applications, completedApplications, filters, success, error, departments }: Props) {
  const [searchTerm, setSearchTerm] = useState(filters.search || '');
  const [statusFilter, setStatusFilter] = useState(filters.status || 'all');
  const [departmentFilter, setDepartmentFilter] = useState(filters.department_id?.toString() || 'all');
  const [postingTypeFilter, setPostingTypeFilter] = useState(filters.posting_type || 'all');
  const [minGpaFilter, setMinGpaFilter] = useState(filters.min_gpa?.toString() || '');
  const [sortBy, setSortBy] = useState(filters.sort_by || 'submitted_at');
  const [sortDir, setSortDir] = useState(filters.sort_dir || 'desc');
  const [showSuccess, setShowSuccess] = useState(!!success);
  const [showError, setShowError] = useState(!!error);
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [selectedApplicationId, setSelectedApplicationId] = useState<number | null>(null);
  const [showAcceptedTable, setShowAcceptedTable] = useState(false);

  useEffect(() => {
    const debounce = setTimeout(() => {
      router.get(
        '/company-admin/applications',
        {
          search: searchTerm,
          status: statusFilter,
          department_id: departmentFilter === 'all' ? '' : departmentFilter,
          min_gpa: minGpaFilter,
          posting_type: postingTypeFilter,
          sort_by: sortBy,
          sort_dir: sortDir,
        },
        { preserveState: true, preserveScroll: true }
      );
    }, 300);
    return () => clearTimeout(debounce);
  }, [searchTerm, statusFilter, departmentFilter, minGpaFilter, postingTypeFilter, sortBy, sortDir]);

  const handleSort = (column: string) => {
    const newDir = sortBy === column && sortDir === 'asc' ? 'desc' : 'asc';
    setSortBy(column);
    setSortDir(newDir);
  };

  const openRejectDialog = (id: number) => {
    setSelectedApplicationId(id);
    setRejectDialogOpen(true);
  };

  const handleApprove = (id: number) => {
    router.patch(`/company-admin/applications/${id}`, { status: 'approved' });
  };

  const handleReject = () => {
    if (selectedApplicationId) {
      router.patch(`/company-admin/applications/${selectedApplicationId}`, { status: 'rejected' });
      setRejectDialogOpen(false);
    }
  };

  const acceptedApplications = applications.data.filter(app => app.status === 'accepted' || app.status === 'approved');

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title="Manage Applications" />
      <div className="p-6 space-y-6">
        <Card className="shadow-md border-gray-200 dark:border-gray-700 p-4 rounded-lg bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900 dark:to-indigo-900">
          <CardHeader>
            <CardTitle className="text-2xl font-semibold text-gray-800 dark:text-gray-100 flex items-center gap-2">
              Manage Applications - {company.name} <Badge variant="secondary">Total: {applications.total}</Badge>
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
            <div className="flex flex-wrap gap-4 items-center">
              <Input
                placeholder="Search by student name or posting..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="max-w-sm border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 transition-all rounded-full"
                aria-label="Search applications"
              />
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-40 border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 transition-all rounded-full" aria-label="Filter by status">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="approved">Approved</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                  <SelectItem value="accepted">Accepted</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
              <Select value={departmentFilter} onValueChange={setDepartmentFilter}>
                <SelectTrigger className="w-40 border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 transition-all rounded-full" aria-label="Filter by department">
                  <SelectValue placeholder="Filter by department" />
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
              <Input
                type="number"
                placeholder="Min GPA"
                value={minGpaFilter}
                onChange={(e) => setMinGpaFilter(e.target.value)}
                className="w-24 border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 transition-all rounded-full"
                aria-label="Filter by minimum GPA"
              />
              <Select value={postingTypeFilter} onValueChange={setPostingTypeFilter}>
                <SelectTrigger className="w-40 border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 transition-all rounded-full" aria-label="Filter by posting type">
                  <SelectValue placeholder="Filter by type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="internship">Internship</SelectItem>
                  <SelectItem value="career">Career</SelectItem>
                </SelectContent>
              </Select>
              <Button
                asChild
                variant="outline"
                className="border-indigo-300 dark:border-indigo-600 text-indigo-700 dark:text-indigo-200 hover:bg-indigo-50 dark:hover:bg-indigo-900 hover:text-indigo-800 dark:hover:text-indigo-300 transition-colors duration-200 rounded-full"
                aria-label="Back to dashboard"
              >
                <Link href="/company-admin">Back to Dashboard</Link>
              </Button>
              <Button
                variant="outline"
                onClick={() => setShowAcceptedTable(!showAcceptedTable)}
                className="border-indigo-300 dark:border-indigo-600 text-indigo-700 dark:text-indigo-200 hover:bg-indigo-50 dark:hover:bg-indigo-900 hover:text-indigo-800 dark:hover:text-indigo-300 transition-colors duration-200 rounded-full"
                aria-label={showAcceptedTable ? 'Hide Accepted Applications' : 'Show Accepted Applications'}
              >
                {showAcceptedTable ? 'Hide Accepted Applications' : 'Show Accepted Applications'}
              </Button>
            </div>
            <Separator className="bg-gray-200 dark:bg-gray-600" />
            {/* All Applications Table */}
            <div>
              <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-4">All Applications</h3>
              {applications.data && applications.data.length > 0 ? ( // Added null check for applications.data
                <>
                  <Table className="border border-gray-200 dark:border-gray-700 rounded-lg">
                    <TableHeader className="bg-indigo-100 dark:bg-indigo-800">
                      <TableRow>
                        <TableHead>
                          <Button
                            variant="ghost"
                            onClick={() => handleSort('student_name')}
                            className="flex items-center gap-2 text-indigo-600 dark:text-indigo-200 hover:text-indigo-800 dark:hover:text-indigo-300"
                            aria-label="Sort by student name"
                          >
                            Student Name
                            {sortBy === 'student_name' && (
                              <ArrowUpDown className={`h-4 w-4 ${sortDir === 'asc' ? 'rotate-180' : ''}`} />
                            )}
                          </Button>
                        </TableHead>
                        <TableHead className="font-semibold text-indigo-700 dark:text-indigo-300">UNid</TableHead>
                        <TableHead>Posting Title</TableHead>
                        <TableHead>Posting Type</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Department</TableHead>
                        <TableHead>
                          <Button
                            variant="ghost"
                            onClick={() => handleSort('submitted_at')}
                            className="flex items-center gap-2 text-indigo-600 dark:text-indigo-200 hover:text-indigo-800 dark:hover:text-indigo-300"
                            aria-label="Sort by submission date"
                          >
                            Submitted At
                            {sortBy === 'submitted_at' && (
                              <ArrowUpDown className={`h-4 w-4 ${sortDir === 'asc' ? 'rotate-180' : ''}`} />
                            )}
                          </Button>
                        </TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {applications.data.map((application) => (
                        <TableRow
                          key={application.application_id}
                          className="hover:bg-indigo-50 dark:hover:bg-indigo-900 transition-colors duration-200"
                          aria-label={`Application for ${application.posting_title}`}
                        >
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <span>{application.student_name || 'N/A'}</span>
                              {application.student_gender && (
                                <span className="text-xs text-gray-500 dark:text-gray-400 capitalize">({application.student_gender})</span>
                              )}
                            </div>
                          </TableCell>
                          <TableCell className="text-gray-700 dark:text-gray-300">
                            {application.student_university_id || 'N/A'}
                          </TableCell>
                          <TableCell>{application.posting_title || 'N/A'}</TableCell>
                          <TableCell>{application.posting_type || 'N/A'}</TableCell>
                          <TableCell>
                            <Badge
                              variant={
                                application.status === 'approved' || application.status === 'accepted' ? 'default' :
                                application.status === 'rejected' ? 'destructive' : 'secondary'
                              }
                            >
                              {application.status || 'N/A'}
                            </Badge>
                          </TableCell>
                          <TableCell>{application.department || 'N/A'}</TableCell>
                          <TableCell>{application.submitted_at ? new Date(application.submitted_at).toLocaleString() : 'N/A'}</TableCell>
                          <TableCell>
                            <div className="flex gap-2">
                              <TooltipProvider>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Button variant="outline" size="sm" asChild className="rounded-full" aria-label="View application details">
                                      <Link href={`/company-admin/applications/${application.application_id}`}>
                                        <Eye className="h-4 w-4" />
                                      </Link>
                                    </Button>
                                  </TooltipTrigger>
                                  <TooltipContent>View</TooltipContent>
                                </Tooltip>
                                {application.status === 'pending' && (
                                  <>
                                    <Tooltip>
                                      <TooltipTrigger asChild>
                                        <Button
                                          variant="outline"
                                          size="sm"
                                          onClick={() => handleApprove(application.application_id)}
                                          disabled={application.has_accepted_application}
                                          className="border-green-500 text-green-600 dark:text-green-400 hover:bg-green-100 dark:hover:bg-green-900 hover:text-green-800 dark:hover:text-green-300 transition-colors duration-200 rounded-full disabled:opacity-50 disabled:cursor-not-allowed"
                                          aria-label={application.has_accepted_application ? "Student already has an accepted application" : "Approve application"}
                                        >
                                          Approve
                                        </Button>
                                      </TooltipTrigger>
                                      <TooltipContent>
                                        {application.has_accepted_application ? "Student already has an accepted application" : "Approve"}
                                      </TooltipContent>
                                    </Tooltip>
                                    <Tooltip>
                                      <TooltipTrigger asChild>
                                        <Button
                                          variant="destructive"
                                          size="sm"
                                          onClick={() => openRejectDialog(application.application_id)}
                                          disabled={application.has_accepted_application}
                                          className="border-red-500 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900 hover:text-red-800 dark:hover:text-red-300 transition-colors duration-200 rounded-full disabled:opacity-50 disabled:cursor-not-allowed"
                                          aria-label={application.has_accepted_application ? "Student already has an accepted application" : "Reject application"}
                                        >
                                          Reject
                                        </Button>
                                      </TooltipTrigger>
                                      <TooltipContent>
                                        {application.has_accepted_application ? "Student already has an accepted application" : "Reject"}
                                      </TooltipContent>
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
                          disabled={applications.prev_page_url === null}
                          onClick={() => {
                            if (applications.prev_page_url !== null) {
                              router.visit(applications.prev_page_url, { preserveState: true });
                            }
                          }}
                          className="border-gray-300 dark:border-gray-600 rounded-full"
                          aria-label="Previous page"
                        >
                          Previous
                        </Button>
                      </PaginationItem>
                      {Array.from({ length: applications.last_page }, (_, i) => i + 1).map((page) => (
                        <PaginationItem key={page}>
                          <PaginationLink
                            href={`/company-admin/applications?page=${page}&search=${searchTerm}&status=${statusFilter}&department_id=${departmentFilter}&min_gpa=${minGpaFilter}&posting_type=${postingTypeFilter}&sort_by=${sortBy}&sort_dir=${sortDir}`}
                            isActive={applications.current_page === page}
                            aria-label={`Page ${page}`}
                          >
                            {page}
                          </PaginationLink>
                        </PaginationItem>
                      ))}
                      <PaginationItem>
                        <Button
                          variant="outline"
                          disabled={applications.next_page_url === null}
                          onClick={() => {
                            if (applications.next_page_url !== null) {
                              router.visit(applications.next_page_url, { preserveState: true });
                            }
                          }}
                          className="border-gray-300 dark:border-gray-600 rounded-full"
                          aria-label="Next page"
                        >
                          Next
                        </Button>
                      </PaginationItem>
                    </PaginationContent>
                  </Pagination>
                </>
              ) : (
                <p className="text-sm text-gray-500 dark:text-gray-400 text-center">No applications found.</p>
              )}
            </div>
            {/* Accepted Applications Table */}
            {showAcceptedTable && (
              <div>
                <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-4">Accepted/Approved Applications</h3>
                {acceptedApplications.length > 0 ? (
                  <Table className="border border-gray-200 dark:border-gray-700 rounded-lg">
                    <TableHeader className="bg-indigo-100 dark:bg-indigo-800">
                      <TableRow>
                        <TableHead>
                          <Button
                            variant="ghost"
                            onClick={() => handleSort('student_name')}
                            className="flex items-center gap-2 text-indigo-600 dark:text-indigo-200 hover:text-indigo-800 dark:hover:text-indigo-300"
                            aria-label="Sort by student name"
                          >
                            Student Name
                            {sortBy === 'student_name' && (
                              <ArrowUpDown className={`h-4 w-4 ${sortDir === 'asc' ? 'rotate-180' : ''}`} />
                            )}
                          </Button>
                        </TableHead>
                        <TableHead className="font-semibold text-indigo-700 dark:text-indigo-300">UNid</TableHead>
                        <TableHead>Posting Title</TableHead>
                        <TableHead>Posting Type</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Department</TableHead>
                        <TableHead>
                          <Button
                            variant="ghost"
                            onClick={() => handleSort('submitted_at')}
                            className="flex items-center gap-2 text-indigo-600 dark:text-indigo-200 hover:text-indigo-800 dark:hover:text-indigo-300"
                            aria-label="Sort by submission date"
                          >
                            Submitted At
                            {sortBy === 'submitted_at' && (
                              <ArrowUpDown className={`h-4 w-4 ${sortDir === 'asc' ? 'rotate-180' : ''}`} />
                            )}
                          </Button>
                        </TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {acceptedApplications.map((application) => (
                        <TableRow
                          key={application.application_id}
                          className="hover:bg-indigo-50 dark:hover:bg-indigo-900 transition-colors duration-200"
                          aria-label={`Accepted application for ${application.posting_title}`}
                        >
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <span>{application.student_name || 'N/A'}</span>
                              {application.student_gender && (
                                <span className="text-xs text-gray-500 dark:text-gray-400 capitalize">({application.student_gender})</span>
                              )}
                            </div>
                          </TableCell>
                          <TableCell className="text-gray-700 dark:text-gray-300">
                            {application.student_university_id || 'N/A'}
                          </TableCell>
                          <TableCell>{application.posting_title || 'N/A'}</TableCell>
                          <TableCell>{application.posting_type || 'N/A'}</TableCell>
                          <TableCell>
                            <Badge variant="default">{application.status || 'N/A'}</Badge>
                          </TableCell>
                          <TableCell>{application.department || 'N/A'}</TableCell>
                          <TableCell>{application.submitted_at ? new Date(application.submitted_at).toLocaleString() : 'N/A'}</TableCell>
                          <TableCell>
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button variant="outline" size="sm" asChild className="rounded-full" aria-label="View accepted application details">
                                    <Link href={`/company-admin/applications/${application.application_id}`}>
                                      <Eye className="h-4 w-4" />
                                    </Link>
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent>View</TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                ) : (
                  <p className="text-sm text-gray-500 dark:text-gray-400 text-center">No accepted or approved applications found.</p>
                )}
              </div>
            )}
          </CardContent>
        </Card>
        <Dialog open={rejectDialogOpen} onOpenChange={setRejectDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Confirm Rejection</DialogTitle>
              <DialogDescription>
                Are you sure you want to reject this application?
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setRejectDialogOpen(false)}
                className="border-gray-300 dark:border-gray-600 rounded-full"
                aria-label="Cancel rejection"
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={handleReject}
                aria-label="Confirm rejection"
              >
                Confirm
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Completed Applications Table */}
        {completedApplications && completedApplications.data && completedApplications.data.length > 0 && (
          <Card className="mt-8">
            <CardHeader>
              <CardTitle>Completed Applications</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Student</TableHead>
                    <TableHead>Posting</TableHead>
                    <TableHead>Accepted At</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {completedApplications.data.map((app: Application) => (
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
            </CardContent>
          </Card>
        )}
      </div>
    </AppLayout>
  );
}

