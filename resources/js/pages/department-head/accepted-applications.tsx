import React, { useState, useEffect } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle, X, ArrowUpDown, Building, User, Star } from 'lucide-react';
import { type BreadcrumbItem } from '@/types';

interface Application {
  application_id: number;
  student_name: string;
  student_email: string;
  posting_title: string;
  posting_type: string;
  company_name: string;
  company_email: string;
  supervisor_name: string;
  supervisor_email: string;
  advisor_feedback: {
    content: string;
    rating: number;
    advisor_name: string;
    created_at: string;
  } | null;
  accepted_at: string;
  offer_expiration: string;
}

interface PaginationData {
  data: Application[];
  current_page: number;
  last_page: number;
  next_page_url: string | null;
  prev_page_url: string | null;
  total: number;
}

interface Props {
  applications: PaginationData;
  filters: {
    search?: string;
    sort_by?: string;
    sort_dir?: string;
  };
  success?: string;
  error?: string;
}

const breadcrumbs: BreadcrumbItem[] = [
  { title: 'Dashboard', href: '/department-head' },
  { title: 'Accepted Applications', href: '/department-head/accepted-applications' },
];

export default function AcceptedApplications({ applications, filters, success, error }: Props) {
  const [searchTerm, setSearchTerm] = useState(filters.search || '');
  const [sortBy, setSortBy] = useState(filters.sort_by || 'accepted_at');
  const [sortDir, setSortDir] = useState(filters.sort_dir || 'desc');
  const [showSuccess, setShowSuccess] = useState(!!success);
  const [showError, setShowError] = useState(!!error);

  useEffect(() => {
    const debounce = setTimeout(() => {
      router.get(
        '/department-head/accepted-applications',
        {
          search: searchTerm,
          sort_by: sortBy,
          sort_dir: sortDir,
        },
        { preserveState: true, preserveScroll: true }
      );
    }, 300);
    return () => clearTimeout(debounce);
  }, [searchTerm, sortBy, sortDir]);

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

  const getTypeBadgeColor = (type: string) => {
    switch (type.toLowerCase()) {
      case 'internship':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300';
      case 'career':
        return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-300';
    }
  };

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title="Accepted Applications" />
      <div className="p-6 space-y-6">
        <Card className="shadow-md border-gray-200 dark:border-gray-700 p-4 rounded-lg bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900 dark:to-indigo-900">
          <CardHeader>
            <CardTitle className="text-2xl font-semibold text-gray-800 dark:text-gray-100 flex items-center gap-2">
              Accepted Applications <Badge variant="secondary">Total: {applications.total}</Badge>
            </CardTitle>
            <CardDescription>
              View all accepted applications from your department with detailed information
            </CardDescription>
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
                placeholder="Search by student name or posting title..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="max-w-sm border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 rounded-full"
                aria-label="Search applications"
              />
              <Button
                asChild
                variant="outline"
                className="border-indigo-300 dark:border-indigo-600 text-indigo-700 dark:text-indigo-200 hover:bg-indigo-50 dark:hover:bg-indigo-900 rounded-full"
              >
                <Link href="/department-head">Back to Dashboard</Link>
              </Button>
            </div>
            <Table className="border border-gray-200 dark:border-gray-700 rounded-lg">
              <TableHeader className="bg-indigo-100 dark:bg-indigo-800">
                <TableRow>
                  <TableHead>
                    <Button
                      variant="ghost"
                      onClick={() => handleSort('student_name')}
                      className="flex items-center gap-2 text-indigo-600 dark:text-indigo-200"
                      aria-label="Sort by student name"
                    >
                      Student
                      {sortBy === 'student_name' && <ArrowUpDown className={`h-4 w-4 ${sortDir === 'asc' ? 'rotate-180' : ''}`} />}
                    </Button>
                  </TableHead>
                  <TableHead>Posting & Company</TableHead>
                  <TableHead>Supervisor</TableHead>
                  <TableHead>Advisor Feedback</TableHead>
                  <TableHead>
                    <Button
                      variant="ghost"
                      onClick={() => handleSort('accepted_at')}
                      className="flex items-center gap-2 text-indigo-600 dark:text-indigo-200"
                      aria-label="Sort by accepted date"
                    >
                      Accepted Date
                      {sortBy === 'accepted_at' && <ArrowUpDown className={`h-4 w-4 ${sortDir === 'asc' ? 'rotate-180' : ''}`} />}
                    </Button>
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {applications.data.map((app) => (
                  <TableRow
                    key={app.application_id}
                    className="hover:bg-indigo-50 dark:hover:bg-indigo-900"
                    aria-label={`Application for ${app.posting_title}`}
                  >
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-full bg-blue-100 dark:bg-blue-900/20">
                          <User className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                        </div>
                        <div>
                          <div className="font-medium text-gray-900 dark:text-white">
                            {app.student_name}
                          </div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">
                            {app.student_email}
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{app.posting_title}</span>
                          <Badge className={getTypeBadgeColor(app.posting_type)}>
                            {app.posting_type}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                          <Building className="h-3 w-3" />
                          <span>{app.company_name}</span>
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          {app.company_email}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium">{app.supervisor_name}</div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          {app.supervisor_email}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      {app.advisor_feedback ? (
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <div className="flex items-center">
                              {[...Array(5)].map((_, i) => (
                                <Star
                                  key={i}
                                  className={`h-4 w-4 ${
                                    i < app.advisor_feedback!.rating
                                      ? 'text-yellow-400 fill-yellow-400'
                                      : 'text-gray-300 dark:text-gray-600'
                                  }`}
                                />
                              ))}
                            </div>
                            <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                              {app.advisor_feedback.rating}/5
                            </span>
                          </div>
                          <div className="text-sm text-gray-600 dark:text-gray-400 truncate max-w-48" title={app.advisor_feedback.content}>
                            {app.advisor_feedback.content.length > 40
                              ? `${app.advisor_feedback.content.substring(0, 40)}...`
                              : app.advisor_feedback.content}
                          </div>
                          <div className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
                            <User className="h-3 w-3" />
                            {app.advisor_feedback.advisor_name}
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2 text-gray-400">
                          <div className="w-2 h-2 bg-gray-300 dark:bg-gray-600 rounded-full"></div>
                          <span className="text-sm">No feedback yet</span>
                        </div>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <div>{new Date(app.accepted_at).toLocaleDateString()}</div>
                        {app.offer_expiration && (
                          <div className="text-xs text-gray-500 dark:text-gray-400">
                            Expires: {new Date(app.offer_expiration).toLocaleDateString()}
                          </div>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            {applications.data.length === 0 && (
              <p className="text-sm text-gray-500 dark:text-gray-400 text-center mt-4">No accepted applications found.</p>
            )}
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}