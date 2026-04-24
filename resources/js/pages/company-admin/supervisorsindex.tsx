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
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogTrigger, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Eye, Edit, Trash2, X, AlertCircle } from 'lucide-react';
import { type BreadcrumbItem } from '@/types';

interface Company {
  company_id: number;
  name: string;
}

interface Supervisor {
  user_id: number;
  name: string;
  email: string;
  phone?: string;
  specialization?: string;
  status: string;
  gender?: 'male' | 'female';
}

interface PaginationData {
  data: Supervisor[];
  current_page: number;
  last_page: number;
  next_page_url: string | null;
  prev_page_url: string | null;
  total: number;
}

interface Props {
  company: Company | null;
  supervisors: PaginationData;
  filters: { search?: string; status?: string; sort_by?: string; sort_dir?: string };
  success?: string;
  error?: string;
}

const breadcrumbs: BreadcrumbItem[] = [
  { title: 'Dashboard', href: '/company-admin' },
  { title: 'Supervisors', href: '/company-admin/supervisors' },
];

export default function SupervisorsIndex({ company, supervisors, filters, success, error }: Props) {
  const [searchTerm, setSearchTerm] = useState(filters.search || '');
  const [statusFilter, setStatusFilter] = useState(filters.status || 'all');
  const [showSuccess, setShowSuccess] = useState(!!success);
  const [showError, setShowError] = useState(!!error);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [deleteName, setDeleteName] = useState<string | null>(null);

  useEffect(() => {
    console.log('SupervisorsIndex component mounted', {
      company,
      supervisors: { count: supervisors.data.length, total: supervisors.total, current_page: supervisors.current_page, last_page: supervisors.last_page },
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
  }, [success, error, company, supervisors, filters]);

  useEffect(() => {
    const debounce = setTimeout(() => {
      console.log('Initiating search/filter', { searchTerm, statusFilter, sort_by: filters.sort_by, sort_dir: filters.sort_dir });
      router.get(
        '/company-admin/supervisors',
        { search: searchTerm, status: statusFilter, sort_by: filters.sort_by, sort_dir: filters.sort_dir },
        { preserveState: true, preserveScroll: true }
      );
    }, 300);
    return () => clearTimeout(debounce);
  }, [searchTerm, statusFilter, filters.sort_by, filters.sort_dir]);

  const handleSort = (column: string) => {
    const newSortDir = filters.sort_by === column && filters.sort_dir === 'asc' ? 'desc' : 'asc';
    console.log('Sorting table', { column, newSortDir });
    router.get(
      '/company-admin/supervisors',
      { search: searchTerm, status: statusFilter, sort_by: column, sort_dir: newSortDir },
      { preserveState: true, preserveScroll: true }
    );
  };

  const handleDelete = (user_id: number) => {
    console.log('Deleting supervisor', { user_id });
    router.delete(`/company-admin/supervisorsdestroy/${user_id}`, {
      onSuccess: () => {
        console.log('Supervisor deleted successfully', { user_id });
        setDeleteId(null);
        setDeleteName(null);
      },
      onError: (errors) => {
        console.error('Failed to delete supervisor', { user_id, errors });
        setDeleteId(null);
        setDeleteName(null);
      },
    });
  };

  if (!company) {
    return (
      <AppLayout breadcrumbs={breadcrumbs}>
        <Head title="Manage Supervisors" />
        <div className="p-6 space-y-6">
          <Alert className="bg-red-100 dark:bg-red-900/30 border-red-300 dark:border-red-700 animate-in fade-in slide-in-from-top-2 duration-500">
            <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400" />
            <AlertTitle className="text-red-800 dark:text-red-200 font-semibold">Error</AlertTitle>
            <AlertDescription className="text-red-700 dark:text-red-300">
              No company assigned to your account. Please contact support.
            </AlertDescription>
          </Alert>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title="Manage Supervisors" />
      <div className="p-6 space-y-6">
        <Card className="shadow-lg border-none bg-white dark:bg-gray-800 rounded-2xl overflow-hidden transition-all duration-300 hover:shadow-xl">
          <CardHeader className="bg-gradient-to-r from-indigo-500 to-blue-600 dark:from-indigo-700 dark:to-blue-800 p-6 rounded-t-2xl transform transition-transform duration-300 hover:scale-[1.01]">
            <CardTitle className="text-2xl font-bold text-white tracking-tight">
              Manage Supervisors - {company.name}
            </CardTitle>
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
                placeholder="Search by name or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="max-w-sm border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 rounded-full focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 transition-all duration-300 hover:shadow-md"
                aria-label="Search supervisors"
              />
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-40 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 rounded-full focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 transition-all duration-300 hover:shadow-md" aria-label="Filter by status">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 rounded-xl">
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
              <Button
                asChild
                className="bg-gradient-to-r from-indigo-500 to-blue-600 dark:from-indigo-600 dark:to-blue-700 text-white rounded-full hover:from-indigo-600 hover:to-blue-700 dark:hover:from-indigo-700 dark:hover:to-blue-800 transition-all duration-300 transform hover:scale-105"
              >
                <Link href="/company-admin/supervisorscreate" aria-label="Add supervisor">
                  Add Supervisor
                </Link>
              </Button>
              <Button
                asChild
                variant="outline"
                className="border-indigo-500 text-indigo-600 dark:text-indigo-400 bg-white dark:bg-gray-900 rounded-full hover:bg-indigo-100 dark:hover:bg-indigo-900/50 hover:text-indigo-700 dark:hover:text-indigo-300 transition-all duration-300 transform hover:scale-105"
              >
                <Link href="/company-admin/supervisorstrashed" aria-label="View trashed supervisors">
                  View Trashed
                </Link>
              </Button>
              <Button
                asChild
                variant="outline"
                className="border-indigo-500 text-indigo-600 dark:text-indigo-400 bg-white dark:bg-gray-900 rounded-full hover:bg-indigo-100 dark:hover:bg-indigo-900/50 hover:text-indigo-700 dark:hover:text-indigo-300 transition-all duration-300 transform hover:scale-105"
              >
                <Link href="/company-admin" aria-label="Back to dashboard">
                  Back to Dashboard
                </Link>
              </Button>
            </div>
            <Separator className="bg-gray-200 dark:bg-gray-700" />
            {supervisors.data.length > 0 ? (
              <>
                <Table className="border border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-900">
                  <TableHeader className="bg-indigo-50 dark:bg-indigo-900/50">
                    <TableRow className="hover:bg-indigo-100 dark:hover:bg-indigo-900/70 transition-colors duration-200">
                      <TableHead className="cursor-pointer font-semibold text-indigo-700 dark:text-indigo-300" onClick={() => handleSort('name')}>
                        Name {filters.sort_by === 'name' && (filters.sort_dir === 'asc' ? '↑' : '↓')}
                      </TableHead>
                      <TableHead className="cursor-pointer font-semibold text-indigo-700 dark:text-indigo-300" onClick={() => handleSort('email')}>
                        Email {filters.sort_by === 'email' && (filters.sort_dir === 'asc' ? '↑' : '↓')}
                      </TableHead>
                      <TableHead className="font-semibold text-indigo-700 dark:text-indigo-300">Phone</TableHead>
                      <TableHead className="font-semibold text-indigo-700 dark:text-indigo-300">Specialization</TableHead>
                      <TableHead className="cursor-pointer font-semibold text-indigo-700 dark:text-indigo-300" onClick={() => handleSort('status')}>
                        Status {filters.sort_by === 'status' && (filters.sort_dir === 'asc' ? '↑' : '↓')}
                      </TableHead>
                      <TableHead className="font-semibold text-indigo-700 dark:text-indigo-300">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {supervisors.data.map((supervisor, index) => (
                      <TableRow
                        key={supervisor.user_id}
                        className={`${
                          index % 2 === 0 ? 'bg-white dark:bg-gray-900' : 'bg-gray-50 dark:bg-gray-800'
                        } hover:bg-indigo-50 dark:hover:bg-indigo-900/30 transition-colors duration-200`}
                      >
                        <TableCell className="font-medium text-gray-900 dark:text-gray-100">
                          <div className="flex items-center gap-2">
                            <span>{supervisor.name}</span>
                            {supervisor.gender && (
                              <span className="text-xs text-gray-500 dark:text-gray-400 capitalize">({supervisor.gender})</span>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="text-gray-700 dark:text-gray-300">{supervisor.email}</TableCell>
                        <TableCell className="text-gray-700 dark:text-gray-300">{supervisor.phone || 'N/A'}</TableCell>
                        <TableCell className="text-gray-700 dark:text-gray-300">{supervisor.specialization || 'N/A'}</TableCell>
                        <TableCell>
                          <span
                            className={`inline-flex items-center justify-center capitalize text-white font-semibold px-3 py-1 rounded-full transition-colors duration-200 ${
                              supervisor.status.toLowerCase() === 'active'
                                ? '!bg-green-500 hover:!bg-green-600 dark:!bg-green-600 dark:hover:!bg-green-700'
                                : '!bg-red-500 hover:!bg-red-600 dark:!bg-red-600 dark:hover:!bg-red-700'
                            }`}
                          >
                            {supervisor.status}
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
                                    <Link href={`/company-admin/supervisorsview/${supervisor.user_id}`} aria-label={`View supervisor ${supervisor.name}`}>
                                      <Eye className="h-4 w-4" />
                                    </Link>
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent>View</TooltipContent>
                              </Tooltip>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    asChild
                                    className="border-indigo-500 text-indigo-600 dark:text-indigo-400 bg-white dark:bg-gray-900 rounded-full hover:bg-indigo-100 dark:hover:bg-indigo-900/50 hover:text-indigo-700 dark:hover:text-indigo-300 transition-all duration-300 transform hover:scale-105"
                                  >
                                    <Link href={`/company-admin/supervisorsedit/${supervisor.user_id}`} aria-label={`Edit supervisor ${supervisor.name}`}>
                                      <Edit className="h-4 w-4" />
                                    </Link>
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent>Edit</TooltipContent>
                              </Tooltip>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <AlertDialog>
                                    <AlertDialogTrigger asChild>
                                      <Button
                                        variant="outline"
                                        size="sm"
                                        className="border-red-500 text-red-600 dark:text-red-400 bg-white dark:bg-gray-900 rounded-full hover:bg-red-100 dark:hover:bg-red-900/50 hover:text-red-700 dark:hover:text-red-300 transition-all duration-300 transform hover:scale-105"
                                        onClick={() => {
                                          setDeleteId(supervisor.user_id);
                                          setDeleteName(supervisor.name);
                                        }}
                                        aria-label={`Delete supervisor ${supervisor.name}`}
                                      >
                                        <Trash2 className="h-4 w-4" />
                                      </Button>
                                    </AlertDialogTrigger>
                                    <AlertDialogContent className="rounded-2xl bg-white dark:bg-gray-800 border-none shadow-lg animate-in fade-in zoom-in-95 duration-300">
                                      <div className="bg-gradient-to-r from-indigo-500 to-blue-600 dark:from-indigo-700 dark:to-blue-800 p-4 rounded-t-2xl">
                                        <AlertDialogTitle className="text-white text-lg font-bold">Confirm Deletion</AlertDialogTitle>
                                      </div>
                                      <AlertDialogDescription className="p-4 text-gray-700 dark:text-gray-300">
                                        Are you sure you want to delete the supervisor "{deleteName}"? This action cannot be undone.
                                      </AlertDialogDescription>
                                      <div className="flex justify-end gap-2 p-4">
                                        <AlertDialogCancel
                                          onClick={() => {
                                            setDeleteId(null);
                                            setDeleteName(null);
                                          }}
                                          className="border-indigo-500 text-indigo-600 dark:text-indigo-400 bg-white dark:bg-gray-900 rounded-full hover:bg-indigo-100 dark:hover:bg-indigo-900/50 hover:text-indigo-700 dark:hover:text-indigo-300 transition-all duration-300 transform hover:scale-105"
                                        >
                                          Cancel
                                        </AlertDialogCancel>
                                        <AlertDialogAction
                                          onClick={() => deleteId && handleDelete(deleteId)}
                                          className="bg-gradient-to-r from-red-500 to-red-600 dark:from-red-600 dark:to-red-700 text-white rounded-full hover:from-red-600 hover:to-red-700 dark:hover:from-red-700 dark:hover:to-red-800 transition-all duration-300 transform hover:scale-105"
                                        >
                                          Delete
                                        </AlertDialogAction>
                                      </div>
                                    </AlertDialogContent>
                                  </AlertDialog>
                                </TooltipTrigger>
                                <TooltipContent>Delete</TooltipContent>
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
                        href={supervisors.prev_page_url || '#'}
                        className={`border-indigo-500 text-indigo-600 dark:text-indigo-400 bg-white dark:bg-gray-900 rounded-full hover:bg-indigo-100 dark:hover:bg-indigo-900/50 hover:text-indigo-700 dark:hover:text-indigo-300 transition-all duration-300 transform hover:scale-105 ${
                          !supervisors.prev_page_url ? 'pointer-events-none opacity-50' : ''
                        }`}
                        aria-label="Previous page"
                      />
                    </PaginationItem>
                    {[...Array(supervisors.last_page)].map((_, i) => (
                      <PaginationItem key={i}>
                        <PaginationLink
                          href={`/company-admin/supervisors?page=${i + 1}&search=${encodeURIComponent(searchTerm)}&status=${statusFilter}&sort_by=${filters.sort_by}&sort_dir=${filters.sort_dir}`}
                          isActive={supervisors.current_page === i + 1}
                          className="border-indigo-500 text-indigo-600 dark:text-indigo-400 bg-white dark:bg-gray-900 rounded-full hover:bg-indigo-100 dark:hover:bg-indigo-900/50 hover:text-indigo-700 dark:hover:text-indigo-300 transition-all duration-300 transform hover:scale-105"
                          aria-label={`Page ${i + 1}`}
                        >
                          {i + 1}
                        </PaginationLink>
                      </PaginationItem>
                    ))}
                    <PaginationItem>
                      <PaginationNext
                        href={supervisors.next_page_url || '#'}
                        className={`border-indigo-500 text-indigo-600 dark:text-indigo-400 bg-white dark:bg-gray-900 rounded-full hover:bg-indigo-100 dark:hover:bg-indigo-900/50 hover:text-indigo-700 dark:hover:text-indigo-300 transition-all duration-300 transform hover:scale-105 ${
                          !supervisors.next_page_url ? 'pointer-events-none opacity-50' : ''
                        }`}
                        aria-label="Next page"
                      />
                    </PaginationItem>
                  </PaginationContent>
                </Pagination>
              </>
            ) : (
              <p className="text-sm text-gray-500 dark:text-gray-400 text-center">No supervisors found.</p>
            )}
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}


// import React, { useState, useEffect } from 'react';
// import { Head, Link, router } from '@inertiajs/react';
// import AppLayout from '@/layouts/app-layout';
// import { Button } from '@/components/ui/button';
// import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
// import { Input } from '@/components/ui/input';
// import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
// import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
// import { Badge } from '@/components/ui/badge';
// import { Separator } from '@/components/ui/separator';
// import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from '@/components/ui/pagination';
// import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
// import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
// import { Eye, Edit, Trash2, X, AlertCircle } from 'lucide-react';
// import { type BreadcrumbItem } from '@/types';

// interface Company {
//   company_id: number;
//   name: string;
// }

// interface Supervisor {
//   user_id: number;
//   name: string;
//   email: string;
//   phone?: string;
//   specialization?: string;
//   status: string;
// }

// interface PaginationData {
//   data: Supervisor[];
//   current_page: number;
//   last_page: number;
//   next_page_url: string | null;
//   prev_page_url: string | null;
//   total: number;
// }

// interface Props {
//   company: Company | null;
//   supervisors: PaginationData;
//   filters: { search?: string; status?: string; sort_by?: string; sort_dir?: string };
//   success?: string;
//   error?: string;
// }

// const breadcrumbs: BreadcrumbItem[] = [
//   { title: 'Dashboard', href: '/company-admin' },
//   { title: 'Supervisors', href: '/company-admin/supervisors' },
// ];

// export default function SupervisorsIndex({ company, supervisors, filters, success, error }: Props) {
//   const [searchTerm, setSearchTerm] = useState(filters.search || '');
//   const [statusFilter, setStatusFilter] = useState(filters.status || 'all');
//   const [showSuccess, setShowSuccess] = useState(!!success);
//   const [showError, setShowError] = useState(!!error);

//   useEffect(() => {
//     console.log('SupervisorsIndex component mounted', {
//       company,
//       supervisors: { count: supervisors.data.length, total: supervisors.total, current_page: supervisors.current_page, last_page: supervisors.last_page },
//       filters,
//       success,
//       error,
//     });

//     if (success) {
//       setShowSuccess(true);
//       const timer = setTimeout(() => setShowSuccess(false), 3000);
//       return () => clearTimeout(timer);
//     }
//     if (error) {
//       setShowError(true);
//       const timer = setTimeout(() => setShowError(false), 3000);
//       return () => clearTimeout(timer);
//     }
//   }, [success, error, company, supervisors, filters]);

//   useEffect(() => {
//     const debounce = setTimeout(() => {
//       console.log('Initiating search/filter', { searchTerm, statusFilter, sort_by: filters.sort_by, sort_dir: filters.sort_dir });
//       router.get(
//         '/company-admin/supervisors',
//         { search: searchTerm, status: statusFilter, sort_by: filters.sort_by, sort_dir: filters.sort_dir },
//         { preserveState: true, preserveScroll: true }
//       );
//     }, 300);
//     return () => clearTimeout(debounce);
//   }, [searchTerm, statusFilter, filters.sort_by, filters.sort_dir]);

//   const handleSort = (column: string) => {
//     const newSortDir = filters.sort_by === column && filters.sort_dir === 'asc' ? 'desc' : 'asc';
//     console.log('Sorting table', { column, newSortDir });
//     router.get(
//       '/company-admin/supervisors',
//       { search: searchTerm, status: statusFilter, sort_by: column, sort_dir: newSortDir },
//       { preserveState: true, preserveScroll: true }
//     );
//   };

//   const handleDelete = (user_id: number, name: string) => {
//     if (confirm(`Are you sure you want to delete the supervisor "${name}"?`)) {
//       console.log('Deleting supervisor', { user_id });
//       router.delete(`/company-admin/supervisorsdestroy/${user_id}`, {
//         onSuccess: () => console.log('Supervisor deleted successfully', { user_id }),
//         onError: (errors) => console.error('Failed to delete supervisor', { user_id, errors }),
//       });
//     }
//   };

//   if (!company) {
//     return (
//       <AppLayout breadcrumbs={breadcrumbs}>
//         <Head title="Manage Supervisors" />
//         <div className="p-6 space-y-6">
//           <Alert className="bg-red-100 dark:bg-red-900/30 border-red-300 dark:border-red-700 animate-in fade-in slide-in-from-top-2 duration-500">
//             <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400" />
//             <AlertTitle className="text-red-800 dark:text-red-200 font-semibold">Error</AlertTitle>
//             <AlertDescription className="text-red-700 dark:text-red-300">
//               No company assigned to your account. Please contact support.
//             </AlertDescription>
//           </Alert>
//         </div>
//       </AppLayout>
//     );
//   }

//   return (
//     <AppLayout breadcrumbs={breadcrumbs}>
//       <Head title="Manage Supervisors" />
//       <div className="p-6 space-y-6">
//         <Card className="shadow-lg border-none bg-white dark:bg-gray-800 rounded-2xl overflow-hidden transition-all duration-300 hover:shadow-xl">
//           <CardHeader className="bg-gradient-to-r from-indigo-500 to-blue-600 dark:from-indigo-700 dark:to-blue-800 p-6 rounded-t-2xl transform transition-transform duration-300 hover:scale-[1.01]">
//             <CardTitle className="text-2xl font-bold text-white tracking-tight">
//               Manage Supervisors - {company.name}
//             </CardTitle>
//           </CardHeader>
//           <CardContent className="p-6 space-y-6">
//             {showSuccess && success && (
//               <Alert className="bg-green-100 dark:bg-green-900/30 border-green-300 dark:border-green-700 animate-in fade-in slide-in-from-top-2 duration-500">
//                 <AlertCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
//                 <AlertTitle className="text-green-800 dark:text-green-200 font-semibold">Success</AlertTitle>
//                 <AlertDescription className="text-green-700 dark:text-green-300 flex justify-between items-center">
//                   {success}
//                   <Button
//                     variant="ghost"
//                     size="sm"
//                     onClick={() => setShowSuccess(false)}
//                     className="text-green-800 dark:text-green-200 hover:bg-green-200 dark:hover:bg-green-800/50 transition-colors duration-200"
//                     aria-label="Dismiss success message"
//                   >
//                     <X className="h-4 w-4" />
//                   </Button>
//                 </AlertDescription>
//               </Alert>
//             )}
//             {showError && error && (
//               <Alert className="bg-red-100 dark:bg-red-900/30 border-red-300 dark:border-red-700 animate-in fade-in slide-in-from-top-2 duration-500">
//                 <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400" />
//                 <AlertTitle className="text-red-800 dark:text-red-200 font-semibold">Error</AlertTitle>
//                 <AlertDescription className="text-red-700 dark:text-red-300 flex justify-between items-center">
//                   {error}
//                   <Button
//                     variant="ghost"
//                     size="sm"
//                     onClick={() => setShowError(false)}
//                     className="text-red-800 dark:text-red-200 hover:bg-red-200 dark:hover:bg-red-800/50 transition-colors duration-200"
//                     aria-label="Dismiss error message"
//                   >
//                     <X className="h-4 w-4" />
//                   </Button>
//                 </AlertDescription>
//               </Alert>
//             )}
//             <div className="flex flex-wrap gap-4 items-center">
//               <Input
//                 placeholder="Search by name or email..."
//                 value={searchTerm}
//                 onChange={(e) => setSearchTerm(e.target.value)}
//                 className="max-w-sm border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 rounded-full focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 transition-all duration-300 hover:shadow-md"
//                 aria-label="Search supervisors"
//               />
//               <Select value={statusFilter} onValueChange={setStatusFilter}>
//                 <SelectTrigger className="w-40 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 rounded-full focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 transition-all duration-300 hover:shadow-md" aria-label="Filter by status">
//                   <SelectValue placeholder="Filter by status" />
//                 </SelectTrigger>
//                 <SelectContent className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 rounded-xl">
//                   <SelectItem value="all">All Statuses</SelectItem>
//                   <SelectItem value="active">Active</SelectItem>
//                   <SelectItem value="inactive">Inactive</SelectItem>
//                 </SelectContent>
//               </Select>
//               <Button
//                 asChild
//                 className="bg-gradient-to-r from-indigo-500 to-blue-600 dark:from-indigo-600 dark:to-blue-700 text-white rounded-full hover:from-indigo-600 hover:to-blue-700 dark:hover:from-indigo-700 dark:hover:to-blue-800 transition-all duration-300 transform hover:scale-105"
//               >
//                 <Link href="/company-admin/supervisorscreate" aria-label="Add supervisor">
//                   Add Supervisor
//                 </Link>
//               </Button>
//               <Button
//                 asChild
//                 variant="outline"
//                 className="border-indigo-500 text-indigo-600 dark:text-indigo-400 bg-white dark:bg-gray-900 rounded-full hover:bg-indigo-100 dark:hover:bg-indigo-900/50 hover:text-indigo-700 dark:hover:text-indigo-300 transition-all duration-300 transform hover:scale-105"
//               >
//                 <Link href="/company-admin/supervisorstrashed" aria-label="View trashed supervisors">
//                   View Trashed
//                 </Link>
//               </Button>
//               <Button
//                 asChild
//                 variant="outline"
//                 className="border-indigo-500 text-indigo-600 dark:text-indigo-400 bg-white dark:bg-gray-900 rounded-full hover:bg-indigo-100 dark:hover:bg-indigo-900/50 hover:text-indigo-700 dark:hover:text-indigo-300 transition-all duration-300 transform hover:scale-105"
//               >
//                 <Link href="/company-admin" aria-label="Back to dashboard">
//                   Back to Dashboard
//                 </Link>
//               </Button>
//             </div>
//             <Separator className="bg-gray-200 dark:bg-gray-700" />
//             {supervisors.data.length > 0 ? (
//               <>
//                 <Table className="border border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-900">
//                   <TableHeader className="bg-indigo-50 dark:bg-indigo-900/50">
//                     <TableRow className="hover:bg-indigo-100 dark:hover:bg-indigo-900/70 transition-colors duration-200">
//                       <TableHead className="cursor-pointer font-semibold text-indigo-700 dark:text-indigo-300" onClick={() => handleSort('name')}>
//                         Name {filters.sort_by === 'name' && (filters.sort_dir === 'asc' ? '↑' : '↓')}
//                       </TableHead>
//                       <TableHead className="cursor-pointer font-semibold text-indigo-700 dark:text-indigo-300" onClick={() => handleSort('email')}>
//                         Email {filters.sort_by === 'email' && (filters.sort_dir === 'asc' ? '↑' : '↓')}
//                       </TableHead>
//                       <TableHead className="font-semibold text-indigo-700 dark:text-indigo-300">Phone</TableHead>
//                       <TableHead className="font-semibold text-indigo-700 dark:text-indigo-300">Specialization</TableHead>
//                       <TableHead className="cursor-pointer font-semibold text-indigo-700 dark:text-indigo-300" onClick={() => handleSort('status')}>
//                         Status {filters.sort_by === 'status' && (filters.sort_dir === 'asc' ? '↑' : '↓')}
//                       </TableHead>
//                       <TableHead className="font-semibold text-indigo-700 dark:text-indigo-300">Actions</TableHead>
//                     </TableRow>
//                   </TableHeader>
//                   <TableBody>
//                     {supervisors.data.map((supervisor, index) => (
//                       <TableRow
//                         key={supervisor.user_id}
//                         className={`${
//                           index % 2 === 0 ? 'bg-white dark:bg-gray-900' : 'bg-gray-50 dark:bg-gray-800'
//                         } hover:bg-indigo-50 dark:hover:bg-indigo-900/30 transition-colors duration-200`}
//                       >
//                         <TableCell className="font-medium text-gray-900 dark:text-gray-100">{supervisor.name}</TableCell>
//                         <TableCell className="text-gray-700 dark:text-gray-300">{supervisor.email}</TableCell>
//                         <TableCell className="text-gray-700 dark:text-gray-300">{supervisor.phone || 'N/A'}</TableCell>
//                         <TableCell className="text-gray-700 dark:text-gray-300">{supervisor.specialization || 'N/A'}</TableCell>
//                         <TableCell>
//                           <Badge
//                             className={`capitalize ${
//                               supervisor.status === 'active'
//                                 ? 'bg-green-500 hover:bg-green-600 dark:bg-green-600 dark:hover:bg-green-700 text-white'
//                                 : 'bg-red-500 hover:bg-red-600 dark:bg-red-600 dark:hover:bg-red-700 text-white'
//                             } transition-colors duration-200`}
//                           >
//                             {supervisor.status}
//                           </Badge>
//                         </TableCell>
//                         <TableCell>
//                           <div className="flex gap-2">
//                             <TooltipProvider>
//                               <Tooltip>
//                                 <TooltipTrigger asChild>
//                                   <Button
//                                     variant="outline"
//                                     size="sm"
//                                     asChild
//                                     className="border-indigo-500 text-indigo-600 dark:text-indigo-400 bg-white dark:bg-gray-900 rounded-full hover:bg-indigo-100 dark:hover:bg-indigo-900/50 hover:text-indigo-700 dark:hover:text-indigo-300 transition-all duration-300 transform hover:scale-105"
//                                   >
//                                     <Link href={`/company-admin/supervisorsview/${supervisor.user_id}`} aria-label={`View supervisor ${supervisor.name}`}>
//                                       <Eye className="h-4 w-4" />
//                                     </Link>
//                                   </Button>
//                                 </TooltipTrigger>
//                                 <TooltipContent>View</TooltipContent>
//                               </Tooltip>
//                               <Tooltip>
//                                 <TooltipTrigger asChild>
//                                   <Button
//                                     variant="outline"
//                                     size="sm"
//                                     asChild
//                                     className="border-indigo-500 text-indigo-600 dark:text-indigo-400 bg-white dark:bg-gray-900 rounded-full hover:bg-indigo-100 dark:hover:bg-indigo-900/50 hover:text-indigo-700 dark:hover:text-indigo-300 transition-all duration-300 transform hover:scale-105"
//                                   >
//                                     <Link href={`/company-admin/supervisorsedit/${supervisor.user_id}`} aria-label={`Edit supervisor ${supervisor.name}`}>
//                                       <Edit className="h-4 w-4" />
//                                     </Link>
//                                   </Button>
//                                 </TooltipTrigger>
//                                 <TooltipContent>Edit</TooltipContent>
//                               </Tooltip>
//                               <Tooltip>
//                                 <TooltipTrigger asChild>
//                                   <Button
//                                     variant="outline"
//                                     size="sm"
//                                     className="border-red-500 text-red-600 dark:text-red-400 bg-white dark:bg-gray-900 rounded-full hover:bg-red-100 dark:hover:bg-red-900/50 hover:text-red-700 dark:hover:text-red-300 transition-all duration-300 transform hover:scale-105"
//                                     onClick={() => handleDelete(supervisor.user_id, supervisor.name)}
//                                     aria-label={`Delete supervisor ${supervisor.name}`}
//                                   >
//                                     <Trash2 className="h-4 w-4" />
//                                   </Button>
//                                 </TooltipTrigger>
//                                 <TooltipContent>Delete</TooltipContent>
//                               </Tooltip>
//                             </TooltipProvider>
//                           </div>
//                         </TableCell>
//                       </TableRow>
//                     ))}
//                   </TableBody>
//                 </Table>
//                 <Pagination className="mt-4">
//                   <PaginationContent>
//                     <PaginationItem>
//                       <PaginationPrevious
//                         href={supervisors.prev_page_url || '#'}
//                         className={`border-indigo-500 text-indigo-600 dark:text-indigo-400 bg-white dark:bg-gray-900 rounded-full hover:bg-indigo-100 dark:hover:bg-indigo-900/50 hover:text-indigo-700 dark:hover:text-indigo-300 transition-all duration-300 transform hover:scale-105 ${
//                           !supervisors.prev_page_url ? 'pointer-events-none opacity-50' : ''
//                         }`}
//                         aria-label="Previous page"
//                       />
//                     </PaginationItem>
//                     {[...Array(supervisors.last_page)].map((_, i) => (
//                       <PaginationItem key={i}>
//                         <PaginationLink
//                           href={`/company-admin/supervisors?page=${i + 1}&search=${encodeURIComponent(searchTerm)}&status=${statusFilter}&sort_by=${filters.sort_by}&sort_dir=${filters.sort_dir}`}
//                           isActive={supervisors.current_page === i + 1}
//                           className="border-indigo-500 text-indigo-600 dark:text-indigo-400 bg-white dark:bg-gray-900 rounded-full hover:bg-indigo-100 dark:hover:bg-indigo-900/50 hover:text-indigo-700 dark:hover:text-indigo-300 transition-all duration-300 transform hover:scale-105"
//                           aria-label={`Page ${i + 1}`}
//                         >
//                           {i + 1}
//                         </PaginationLink>
//                       </PaginationItem>
//                     ))}
//                     <PaginationItem>
//                       <PaginationNext
//                         href={supervisors.next_page_url || '#'}
//                         className={`border-indigo-500 text-indigo-600 dark:text-indigo-400 bg-white dark:bg-gray-900 rounded-full hover:bg-indigo-100 dark:hover:bg-indigo-900/50 hover:text-indigo-700 dark:hover:text-indigo-300 transition-all duration-300 transform hover:scale-105 ${
//                           !supervisors.next_page_url ? 'pointer-events-none opacity-50' : ''
//                         }`}
//                         aria-label="Next page"
//                       />
//                     </PaginationItem>
//                   </PaginationContent>
//                 </Pagination>
//               </>
//             ) : (
//               <p className="text-sm text-gray-500 dark:text-gray-400 text-center">No supervisors found.</p>
//             )}
//           </CardContent>
//         </Card>
//       </div>
//     </AppLayout>
//   );
// }


// // import React, { useState, useEffect } from 'react';
// // import { Head, Link, router } from '@inertiajs/react';
// // import AppLayout from '@/layouts/app-layout';
// // import { Button } from '@/components/ui/button';
// // import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
// // import { Input } from '@/components/ui/input';
// // import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
// // import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
// // import { Badge } from '@/components/ui/badge';
// // import { Separator } from '@/components/ui/separator';
// // import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from '@/components/ui/pagination';
// // import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
// // import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
// // import { Eye, Edit, Trash2, X, AlertCircle } from 'lucide-react';
// // import { type BreadcrumbItem } from '@/types';

// // interface Company {
// //   company_id: number;
// //   name: string;
// // }

// // interface Supervisor {
// //   user_id: number;
// //   name: string;
// //   email: string;
// //   phone?: string;
// //   specialization?: string;
// //   status: string;
// // }

// // interface PaginationData {
// //   data: Supervisor[];
// //   current_page: number;
// //   last_page: number;
// //   next_page_url: string | null;
// //   prev_page_url: string | null;
// //   total: number;
// // }

// // interface Props {
// //   company: Company | null;
// //   supervisors: PaginationData;
// //   filters: { search?: string; status?: string; sort_by?: string; sort_dir?: string };
// //   success?: string;
// //   error?: string;
// // }

// // const breadcrumbs: BreadcrumbItem[] = [
// //   { title: 'Dashboard', href: '/company-admin' },
// //   { title: 'Supervisors', href: '/company-admin/supervisors' },
// // ];

// // export default function SupervisorsIndex({ company, supervisors, filters, success, error }: Props) {
// //   const [searchTerm, setSearchTerm] = useState(filters.search || '');
// //   const [statusFilter, setStatusFilter] = useState(filters.status || 'all');
// //   const [showSuccess, setShowSuccess] = useState(!!success);
// //   const [showError, setShowError] = useState(!!error);

// //   useEffect(() => {
// //     console.log('SupervisorsIndex component mounted', {
// //       company,
// //       supervisors: { count: supervisors.data.length, total: supervisors.total, current_page: supervisors.current_page, last_page: supervisors.last_page },
// //       filters,
// //       success,
// //       error,
// //     });

// //     if (success) {
// //       setShowSuccess(true);
// //       const timer = setTimeout(() => setShowSuccess(false), 3000);
// //       return () => clearTimeout(timer);
// //     }
// //     if (error) {
// //       setShowError(true);
// //       const timer = setTimeout(() => setShowError(false), 3000);
// //       return () => clearTimeout(timer);
// //     }
// //   }, [success, error, company, supervisors, filters]);

// //   useEffect(() => {
// //     const debounce = setTimeout(() => {
// //       console.log('Initiating search/filter', { searchTerm, statusFilter, sort_by: filters.sort_by, sort_dir: filters.sort_dir });
// //       router.get(
// //         '/company-admin/supervisors',
// //         { search: searchTerm, status: statusFilter, sort_by: filters.sort_by, sort_dir: filters.sort_dir },
// //         { preserveState: true, preserveScroll: true }
// //       );
// //     }, 300);
// //     return () => clearTimeout(debounce);
// //   }, [searchTerm, statusFilter, filters.sort_by, filters.sort_dir]);

// //   const handleSort = (column: string) => {
// //     const newSortDir = filters.sort_by === column && filters.sort_dir === 'asc' ? 'desc' : 'asc';
// //     console.log('Sorting table', { column, newSortDir });
// //     router.get(
// //       '/company-admin/supervisors',
// //       { search: searchTerm, status: statusFilter, sort_by: column, sort_dir: newSortDir },
// //       { preserveState: true, preserveScroll: true }
// //     );
// //   };

// //   const handleDelete = (user_id: number, name: string) => {
// //     if (confirm(`Are you sure you want to delete the supervisor "${name}"?`)) {
// //       console.log('Deleting supervisor', { user_id });
// //       router.delete(`/company-admin/supervisorsdestroy/${user_id}`, {
// //         onSuccess: () => console.log('Supervisor deleted successfully', { user_id }),
// //         onError: (errors) => console.error('Failed to delete supervisor', { user_id, errors }),
// //       });
// //     }
// //   };

// //   if (!company) {
// //     return (
// //       <AppLayout breadcrumbs={breadcrumbs}>
// //         <Head title="Manage Supervisors" />
// //         <div className="p-6 space-y-6">
// //           <Alert className="bg-red-50 dark:bg-red-900/50 border-red-200 dark:border-red-800 animate-in fade-in slide-in-from-top-2 duration-300">
// //             <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400" />
// //             <AlertTitle className="text-red-800 dark:text-red-200 font-semibold">Error</AlertTitle>
// //             <AlertDescription className="text-red-700 dark:text-red-300">
// //               No company assigned to your account. Please contact support.
// //             </AlertDescription>
// //           </Alert>
// //         </div>
// //       </AppLayout>
// //     );
// //   }

// //   return (
// //     <AppLayout breadcrumbs={breadcrumbs}>
// //       <Head title="Manage Supervisors" />
// //       <div className="p-6 space-y-6">
// //         <Card className="shadow-md border border-muted bg-background animate-in fade-in duration-300">
// //           <CardHeader>
// //             <CardTitle className="text-2xl font-semibold text-foreground">Manage Supervisors - {company.name}</CardTitle>
// //           </CardHeader>
// //           <CardContent className="space-y-6">
// //             {showSuccess && success && (
// //               <Alert className="bg-green-50 dark:bg-green-900/50 border-green-200 dark:border-green-800 animate-in fade-in slide-in-from-top-2 duration-300">
// //                 <AlertCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
// //                 <AlertTitle className="text-green-800 dark:text-green-200 font-semibold">Success</AlertTitle>
// //                 <AlertDescription className="text-green-700 dark:text-green-300 flex justify-between items-center">
// //                   {success}
// //                   <Button
// //                     variant="ghost"
// //                     size="sm"
// //                     onClick={() => setShowSuccess(false)}
// //                     className="text-green-800 dark:text-green-200 hover:bg-green-100 dark:hover:bg-green-800"
// //                     aria-label="Dismiss success message"
// //                   >
// //                     <X className="h-4 w-4" />
// //                   </Button>
// //                 </AlertDescription>
// //               </Alert>
// //             )}
// //             {showError && error && (
// //               <Alert className="bg-red-50 dark:bg-red-900/50 border-red-200 dark:border-red-800 animate-in fade-in slide-in-from-top-2 duration-300">
// //                 <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400" />
// //                 <AlertTitle className="text-red-800 dark:text-red-200 font-semibold">Error</AlertTitle>
// //                 <AlertDescription className="text-red-700 dark:text-red-300 flex justify-between items-center">
// //                   {error}
// //                   <Button
// //                     variant="ghost"
// //                     size="sm"
// //                     onClick={() => setShowError(false)}
// //                     className="text-red-800 dark:text-red-200 hover:bg-red-100 dark:hover:bg-red-800"
// //                     aria-label="Dismiss error message"
// //                   >
// //                     <X className="h-4 w-4" />
// //                   </Button>
// //                 </AlertDescription>
// //               </Alert>
// //             )}
// //             <div className="flex flex-wrap gap-4 items-center">
// //               <Input
// //                 placeholder="Search by name or email..."
// //                 value={searchTerm}
// //                 onChange={(e) => setSearchTerm(e.target.value)}
// //                 className="max-w-sm border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 transition-all"
// //                 aria-label="Search supervisors"
// //               />
// //               <Select value={statusFilter} onValueChange={setStatusFilter}>
// //                 <SelectTrigger className="w-40 border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 transition-all" aria-label="Filter by status">
// //                   <SelectValue placeholder="Filter by status" />
// //                 </SelectTrigger>
// //                 <SelectContent>
// //                   <SelectItem value="all">All Statuses</SelectItem>
// //                   <SelectItem value="active">Active</SelectItem>
// //                   <SelectItem value="inactive">Inactive</SelectItem>
// //                 </SelectContent>
// //               </Select>
// //               <Button
// //                 asChild
// //                 className="bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white transition-colors duration-200"
// //               >
// //                 <Link href="/company-admin/supervisorscreate" aria-label="Add supervisor">
// //                   Add Supervisor
// //                 </Link>
// //               </Button>
// //               <Button
// //                 asChild
// //                 variant="outline"
// //                 className="border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 hover:bg-blue-50 dark:hover:bg-blue-900 hover:text-blue-700 dark:hover:text-blue-300 transition-colors duration-200"
// //               >
// //                 <Link href="/company-admin/supervisorstrashed" aria-label="View trashed supervisors">
// //                   View Trashed
// //                 </Link>
// //               </Button>
// //               <Button
// //                 asChild
// //                 variant="outline"
// //                 className="border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 hover:bg-blue-50 dark:hover:bg-blue-900 hover:text-blue-700 dark:hover:text-blue-300 transition-colors duration-200"
// //               >
// //                 <Link href="/company-admin" aria-label="Back to dashboard">
// //                   Back to Dashboard
// //                 </Link>
// //               </Button>
// //             </div>
// //             <Separator className="bg-gray-200 dark:bg-gray-600" />
// //             {supervisors.data.length > 0 ? (
// //               <>
// //                 <Table>
// //                   <TableHeader>
// //                     <TableRow className="hover:bg-gray-50 dark:hover:bg-gray-800">
// //                       <TableHead className="cursor-pointer font-semibold" onClick={() => handleSort('name')}>
// //                         Name {filters.sort_by === 'name' && (filters.sort_dir === 'asc' ? '↑' : '↓')}
// //                       </TableHead>
// //                       <TableHead className="cursor-pointer font-semibold" onClick={() => handleSort('email')}>
// //                         Email {filters.sort_by === 'email' && (filters.sort_dir === 'asc' ? '↑' : '↓')}
// //                       </TableHead>
// //                       <TableHead className="font-semibold">Phone</TableHead>
// //                       <TableHead className="font-semibold">Specialization</TableHead>
// //                       <TableHead className="cursor-pointer font-semibold" onClick={() => handleSort('status')}>
// //                         Status {filters.sort_by === 'status' && (filters.sort_dir === 'asc' ? '↑' : '↓')}
// //                       </TableHead>
// //                       <TableHead className="font-semibold">Actions</TableHead>
// //                     </TableRow>
// //                   </TableHeader>
// //                   <TableBody>
// //                     {supervisors.data.map((supervisor) => (
// //                       <TableRow key={supervisor.user_id} className="hover:bg-gray-50 dark:hover:bg-gray-800">
// //                         <TableCell className="font-medium">{supervisor.name}</TableCell>
// //                         <TableCell>{supervisor.email}</TableCell>
// //                         <TableCell>{supervisor.phone || 'N/A'}</TableCell>
// //                         <TableCell>{supervisor.specialization || 'N/A'}</TableCell>
// //                         <TableCell>
// //                           <Badge
// //                             variant={supervisor.status === 'active' ? 'default' : 'secondary'}
// //                             className="capitalize"
// //                           >
// //                             {supervisor.status}
// //                           </Badge>
// //                         </TableCell>
// //                         <TableCell>
// //                           <div className="flex gap-2">
// //                             <TooltipProvider>
// //                               <Tooltip>
// //                                 <TooltipTrigger asChild>
// //                                   <Button
// //                                     variant="outline"
// //                                     size="sm"
// //                                     asChild
// //                                     className="border-blue-500 text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900 hover:text-blue-800 dark:hover:text-blue-300 transition-colors duration-200"
// //                                   >
// //                                     <Link href={`/company-admin/supervisorsview/${supervisor.user_id}`} aria-label={`View supervisor ${supervisor.name}`}>
// //                                       <Eye className="h-4 w-4" />
// //                                     </Link>
// //                                   </Button>
// //                                 </TooltipTrigger>
// //                                 <TooltipContent>View</TooltipContent>
// //                               </Tooltip>
// //                               <Tooltip>
// //                                 <TooltipTrigger asChild>
// //                                   <Button
// //                                     variant="outline"
// //                                     size="sm"
// //                                     asChild
// //                                     className="border-blue-500 text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900 hover:text-blue-800 dark:hover:text-blue-300 transition-colors duration-200"
// //                                   >
// //                                     <Link href={`/company-admin/supervisorsedit/${supervisor.user_id}`} aria-label={`Edit supervisor ${supervisor.name}`}>
// //                                       <Edit className="h-4 w-4" />
// //                                     </Link>
// //                                   </Button>
// //                                 </TooltipTrigger>
// //                                 <TooltipContent>Edit</TooltipContent>
// //                               </Tooltip>
// //                               <Tooltip>
// //                                 <TooltipTrigger asChild>
// //                                   <Button
// //                                     variant="destructive"
// //                                     size="sm"
// //                                     onClick={() => handleDelete(supervisor.user_id, supervisor.name)}
// //                                     className="border-red-500 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900 hover:text-red-800 dark:hover:text-red-300 transition-colors duration-200"
// //                                     aria-label={`Delete supervisor ${supervisor.name}`}
// //                                   >
// //                                     <Trash2 className="h-4 w-4" />
// //                                   </Button>
// //                                 </TooltipTrigger>
// //                                 <TooltipContent>Delete</TooltipContent>
// //                               </Tooltip>
// //                             </TooltipProvider>
// //                           </div>
// //                         </TableCell>
// //                       </TableRow>
// //                     ))}
// //                   </TableBody>
// //                 </Table>
// //                 <Pagination>
// //                   <PaginationContent>
// //                     <PaginationItem>
// //                       <PaginationPrevious
// //                         href={supervisors.prev_page_url || '#'}
// //                         className={`border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 hover:bg-blue-50 dark:hover:bg-blue-900 hover:text-blue-700 dark:hover:text-blue-300 transition-colors duration-200 ${!supervisors.prev_page_url ? 'pointer-events-none opacity-50' : ''}`}
// //                         aria-label="Previous page"
// //                       />
// //                     </PaginationItem>
// //                     {[...Array(supervisors.last_page)].map((_, i) => (
// //                       <PaginationItem key={i}>
// //                         <PaginationLink
// //                           href={`/company-admin/supervisors?page=${i + 1}&search=${encodeURIComponent(searchTerm)}&status=${statusFilter}&sort_by=${filters.sort_by}&sort_dir=${filters.sort_dir}`}
// //                           isActive={supervisors.current_page === i + 1}
// //                           className="border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 hover:bg-blue-50 dark:hover:bg-blue-900 hover:text-blue-700 dark:hover:text-blue-300 transition-colors duration-200"
// //                           aria-label={`Page ${i + 1}`}
// //                         >
// //                           {i + 1}
// //                         </PaginationLink>
// //                       </PaginationItem>
// //                     ))}
// //                     <PaginationItem>
// //                       <PaginationNext
// //                         href={supervisors.next_page_url || '#'}
// //                         className={`border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 hover:bg-blue-50 dark:hover:bg-blue-900 hover:text-blue-700 dark:hover:text-blue-300 transition-colors duration-200 ${!supervisors.next_page_url ? 'pointer-events-none opacity-50' : ''}`}
// //                         aria-label="Next page"
// //                       />
// //                     </PaginationItem>
// //                   </PaginationContent>
// //                 </Pagination>
// //               </>
// //             ) : (
// //               <p className="text-sm text-muted-foreground text-center">No supervisors found.</p>
// //             )}
// //           </CardContent>
// //         </Card>
// //       </div>
// //     </AppLayout>
// //   );
// // }