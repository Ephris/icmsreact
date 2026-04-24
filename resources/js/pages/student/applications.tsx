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
import { AlertCircle, X, Eye, Check, XCircle, ArrowUpDown, Star, CheckCircle } from 'lucide-react';
import { type BreadcrumbItem } from '@/types';


interface Application {
  application_id: number;
  posting_title: string;
  company_name: string;
  posting_type: string;
  industry: string;
  status: string;
  submitted_at: string | null;
  accepted_at: string | null;
  offer_expiration: string | null;
  last_updated_by: string;
  analytics_id?: number | null;
  feedback?: {
    feedback_id: number;
    content: string;
    rating: number;
    advisor_name: string;
    created_at: string;
  } | null;
}

interface PaginationData {
  data: Application[];
  current_page: number;
  last_page: number;
  next_page_url: string | null;
  prev_page_url: string | null;
  total: number;
}

interface CompletedApplication {
  application_id: number;
  posting_title: string;
  analytics_id: number | null;
}

interface Props {
  applications: PaginationData;
  completedApplication?: CompletedApplication | null;
  filters: {
    search?: string;
    status?: string;
    sort_by?: string;
    sort_dir?: string;
  };
  success?: string;
  error?: string;
}

const breadcrumbs: BreadcrumbItem[] = [
  { title: 'Dashboard', href: '/student' },
  { title: 'Applications', href: '/student/applications' },
];

export default function Applications({ applications, completedApplication, filters, success, error }: Props) {
  const [searchTerm, setSearchTerm] = useState(filters.search || '');
  const [statusFilter, setStatusFilter] = useState(filters.status || 'all');
  const [sortBy, setSortBy] = useState(filters.sort_by || 'submitted_at');
  const [sortDir, setSortDir] = useState(filters.sort_dir || 'desc');
  const [showSuccess, setShowSuccess] = useState(!!success);
  const [showError, setShowError] = useState(!!error);
  const hasAcceptedOffer = applications.data.some((a) => a.status === 'accepted');

  useEffect(() => {
    const debounce = setTimeout(() => {
      router.get(
        '/student/applications',
        {
          search: searchTerm,
          status: statusFilter,
          sort_by: sortBy,
          sort_dir: sortDir,
        },
        { preserveState: true, preserveScroll: true }
      );
    }, 300);
    return () => clearTimeout(debounce);
  }, [searchTerm, statusFilter, sortBy, sortDir]);

  useEffect(() => {
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
  }, [success, error]);

  const handleSort = (column: string) => {
    const newDir = sortBy === column && sortDir === 'asc' ? 'desc' : 'asc';
    setSortBy(column);
    setSortDir(newDir);
  };

  const handleAccept = (applicationId: number) => {
    router.post(`/student/applications/${applicationId}/accept`, {}, {
      onSuccess: () => {
        setShowSuccess(true);
        setTimeout(() => setShowSuccess(false), 3000);
      },
      onError: () => {
        setShowError(true);
        setTimeout(() => setShowError(false), 3000);
      },
    });
  };

  const handleWithdraw = (applicationId: number) => {
    router.post(`/student/applications/${applicationId}/withdraw`, {}, {
      onSuccess: () => {
        setShowSuccess(true);
        setTimeout(() => setShowSuccess(false), 3000);
      },
      onError: () => {
        setShowError(true);
        setTimeout(() => setShowError(false), 3000);
      },
    });
  };

  const getStatusBadge = (status: string) => {
    const variants: { [key: string]: 'default' | 'secondary' | 'destructive' } = {
      pending: 'default',
      approved: 'secondary',
      accepted: 'secondary',
      completed: 'default',
      rejected: 'destructive',
      inactive: 'secondary',
    };
    return <Badge variant={variants[status] || 'default'} className="capitalize">{status}</Badge>;
  };

  const renderOfferInfo = (app: Application) => {
    if (!app.offer_expiration) return null;
    const exp = new Date(app.offer_expiration);
    const now = new Date();
    const ms = exp.getTime() - now.getTime();
    const days = Math.ceil(ms / (1000 * 60 * 60 * 24));
    const isExpired = ms <= 0;
    const text = isExpired ? 'Offer expired' : `${days} day${days === 1 ? '' : 's'} left`;
    const cls = isExpired
      ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300'
      : days <= 3
      ? 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300'
      : 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300';
    return <span className={`ml-2 inline-block px-2 py-0.5 text-xs rounded ${cls}`}>{text}</span>;
  };

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title="My Applications" />
      <div className="p-6 space-y-6">
        <Card className="shadow-md border-gray-200 dark:border-gray-700 p-4 rounded-lg bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900 dark:to-indigo-900">
          <CardHeader>
            <CardTitle className="text-2xl font-semibold text-gray-800 dark:text-gray-100 flex items-center gap-2">
              My Applications <Badge variant="secondary">Total: {applications.total}</Badge>
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
                <AlertDescription className="text-red-700 dark:text-green-300 flex justify-between items-center">
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
            {completedApplication && (
              <Alert className="bg-green-50 dark:bg-green-900/50 border-green-200 dark:border-green-800">
                <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
                <AlertTitle className="text-green-800 dark:text-green-200 font-semibold">Completed Application</AlertTitle>
                <AlertDescription className="text-green-700 dark:text-green-300">
                  Congratulations! Your application for "{completedApplication.posting_title}" has been completed.
                  {completedApplication.analytics_id && (
                    <Link href={route('student.analytics.view', completedApplication.analytics_id)} className="ml-2 text-blue-600 dark:text-blue-400 underline">
                      View Analytics
                    </Link>
                  )}
                </AlertDescription>
              </Alert>
            )}
            <div className="flex flex-wrap gap-4 items-center">
              <Input
                placeholder="Search by posting title or industry..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="max-w-sm border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 rounded-full"
                aria-label="Search applications"
              />
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-40 border-gray-300 dark:border-gray-600 rounded-full">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="approved">Approved</SelectItem>
                  <SelectItem value="accepted">Accepted</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
              <Button
                asChild
                variant="outline"
                className="border-indigo-300 dark:border-indigo-600 text-indigo-700 dark:text-indigo-200 hover:bg-indigo-50 dark:hover:bg-indigo-900 rounded-full"
              >
                <Link href="/student">Back to Dashboard</Link>
              </Button>
            </div>
            <Separator className="bg-gray-200 dark:bg-gray-600" />
            <Table className="border border-gray-200 dark:border-gray-700 rounded-lg">
              <TableHeader className="bg-indigo-100 dark:bg-indigo-800">
                <TableRow>
                  <TableHead>
                    <Button
                      variant="ghost"
                      onClick={() => handleSort('posting_title')}
                      className="flex items-center gap-2 text-indigo-600 dark:text-indigo-200"
                      aria-label="Sort by posting title"
                    >
                      Posting Title
                      {sortBy === 'posting_title' && <ArrowUpDown className={`h-4 w-4 ${sortDir === 'asc' ? 'rotate-180' : ''}`} />}
                    </Button>
                  </TableHead>
                  <TableHead>Company</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Industry</TableHead>
                  <TableHead>
                    <Button
                      variant="ghost"
                      onClick={() => handleSort('status')}
                      className="flex items-center gap-2 text-indigo-600 dark:text-indigo-200"
                      aria-label="Sort by status"
                    >
                      Status
                      {sortBy === 'status' && <ArrowUpDown className={`h-4 w-4 ${sortDir === 'asc' ? 'rotate-180' : ''}`} />}
                    </Button>
                  </TableHead>
                  <TableHead>Advisor Feedback</TableHead>
                  <TableHead>
                    <Button
                      variant="ghost"
                      onClick={() => handleSort('submitted_at')}
                      className="flex items-center gap-2 text-indigo-600 dark:text-indigo-200"
                      aria-label="Sort by submitted date"
                    >
                      Submitted At
                      {sortBy === 'submitted_at' && <ArrowUpDown className={`h-4 w-4 ${sortDir === 'asc' ? 'rotate-180' : ''}`} />}
                    </Button>
                  </TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {applications.data.map((app) => (
                  <TableRow
                    key={app.application_id}
                    className="hover:bg-indigo-50 dark:hover:bg-indigo-900"
                    aria-label={`Application for ${app.posting_title}`}
                  >
                    <TableCell>{app.posting_title}</TableCell>
                    <TableCell>{app.company_name}</TableCell>
                    <TableCell>{app.posting_type}</TableCell>
                    <TableCell>{app.industry}</TableCell>
                    <TableCell>
                      <div className="flex items-center">
                        {getStatusBadge(app.status)}
                        {renderOfferInfo(app)}
                      </div>
                    </TableCell>
                    <TableCell>
                      {app.feedback ? (
                        <div className="text-sm">
                          <div className="flex items-center gap-1 mb-1" aria-label={`Rating ${app.feedback.rating} out of 5`}>
                            {Array.from({ length: 5 }).map((_, i) => (
                              <Star
                                key={i}
                                className={`h-4 w-4 ${i < (app.feedback?.rating || 0) ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300 dark:text-gray-600'}`}
                              />
                            ))}
                          </div>
                          <div className="text-gray-500 dark:text-gray-400 truncate max-w-32" title={app.feedback.content}>
                            {app.feedback.content.length > 30
                              ? `${app.feedback.content.substring(0, 30)}...`
                              : app.feedback.content}
                          </div>
                          <div className="text-xs text-gray-400">
                            By: {app.feedback.advisor_name}
                          </div>
                        </div>
                      ) : (
                        <span className="text-gray-400">No feedback</span>
                      )}
                    </TableCell>
                    <TableCell>{app.submitted_at ? new Date(app.submitted_at).toLocaleDateString() : 'N/A'}</TableCell>
                    <TableCell className="flex gap-2">
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="outline"
                              size="sm"
                              asChild
                              className="rounded-full"
                              aria-label="View application details"
                            >
                              <Link href={`/student/applications/${app.application_id}`}>
                                <Eye className="h-4 w-4" />
                              </Link>
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>View</TooltipContent>
                        </Tooltip>
                        {app.status === 'completed' && app.analytics_id && (
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                variant="default"
                                size="sm"
                                asChild
                                className="rounded-full"
                                aria-label="View analytics"
                              >
                                <Link href={route('student.analytics.view', app.analytics_id)}>
                                  <CheckCircle className="h-4 w-4 mr-1" />
                                  Analytics
                                </Link>
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>View Analytics</TooltipContent>
                          </Tooltip>
                        )}
                        {app.status === 'approved' && (!app.offer_expiration || new Date(app.offer_expiration) > new Date()) && (
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleAccept(app.application_id)}
                                disabled={hasAcceptedOffer}
                                className="rounded-full bg-green-100 text-green-700 hover:bg-green-200 dark:bg-green-900 dark:text-green-200 dark:hover:bg-green-800"
                                aria-label="Accept application"
                              >
                                <Check className="h-4 w-4" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>{hasAcceptedOffer ? 'You already accepted another offer' : 'Accept Offer'}</TooltipContent>
                          </Tooltip>
                        )}
                        {['pending', 'approved'].includes(app.status) && (
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleWithdraw(app.application_id)}
                                className="rounded-full bg-red-100 text-red-700 hover:bg-red-200 dark:bg-red-900 dark:text-red-200 dark:hover:bg-red-800"
                                aria-label="Withdraw application"
                              >
                                <XCircle className="h-4 w-4" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>Withdraw</TooltipContent>
                          </Tooltip>
                        )}
                      </TooltipProvider>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            {applications.data.length === 0 && (
              <p className="text-sm text-gray-500 dark:text-gray-400 text-center mt-4">No applications found.</p>
            )}
            <Pagination className="mt-4">
              <PaginationContent>
                <PaginationItem>
                  <Button
                    variant="outline"
                    disabled={applications.prev_page_url === null}
                    onClick={() => {
                      if (applications.prev_page_url) {
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
                      href={`/student/applications?page=${page}&search=${searchTerm}&status=${statusFilter}&sort_by=${sortBy}&sort_dir=${sortDir}`}
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
                      if (applications.next_page_url) {
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
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}