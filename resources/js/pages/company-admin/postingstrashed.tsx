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
import { RotateCcw, X, AlertCircle, Loader2 } from 'lucide-react';
import { type BreadcrumbItem } from '@/types';

interface Company {
  company_id: number;
  name: string;
}

interface TrashedPosting {
  posting_id: number;
  title: string;
  type: string;
  industry: string;
  location: string;
  benefits: string | null;
  deleted_at: string;
  min_gpa: number | null;
  skills_required: string[];
}

interface PaginationData {
  data: TrashedPosting[];
  current_page: number;
  last_page: number;
  next_page_url: string | null;
  prev_page_url: string | null;
  total: number;
}

interface Props {
  company: Company;
  trashedPostings: PaginationData;
  filters: { search?: string; type?: string; sort_by?: string; sort_dir?: string };
  success?: string;
  error?: string;
}

const breadcrumbs: BreadcrumbItem[] = [
  { title: 'Dashboard', href: '/company-admin' },
  { title: 'Trashed Postings', href: '/company-admin/postingstrashed' },
];

export default function PostingsTrashed({ company, trashedPostings, filters, success, error }: Props) {
  const [searchTerm, setSearchTerm] = useState(filters.search || '');
  const [typeFilter, setTypeFilter] = useState(filters.type || 'all');
  const [showSuccess, setShowSuccess] = useState(!!success);
  const [showError, setShowError] = useState(!!error);
  const [restoreId, setRestoreId] = useState<number | null>(null);
  const [restoreTitle, setRestoreTitle] = useState<string | null>(null);
  const [isRestoring, setIsRestoring] = useState(false);

  useEffect(() => {
    console.log('PostingsTrashed component mounted', {
      company,
      trashedPostings: { count: trashedPostings.data.length, total: trashedPostings.total, current_page: trashedPostings.current_page, last_page: trashedPostings.last_page },
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
  }, [success, error, company, trashedPostings, filters]);

  useEffect(() => {
    const debounce = setTimeout(() => {
      console.log('Initiating search/filter', { searchTerm, typeFilter, sort_by: filters.sort_by, sort_dir: filters.sort_dir });
      router.get(
        '/company-admin/postingstrashed',
        { search: searchTerm, type: typeFilter, sort_by: filters.sort_by, sort_dir: filters.sort_dir },
        { preserveState: true, preserveScroll: true }
      );
    }, 300);
    return () => clearTimeout(debounce);
  }, [searchTerm, typeFilter, filters.sort_by, filters.sort_dir]);

  const handleSort = (column: string) => {
    const newSortDir = filters.sort_by === column && filters.sort_dir === 'asc' ? 'desc' : 'asc';
    console.log('Sorting table', { column, newSortDir });
    router.get(
      '/company-admin/postingstrashed',
      { search: searchTerm, type: typeFilter, sort_by: column, sort_dir: newSortDir },
      { preserveState: true, preserveScroll: true }
    );
  };

  const handleRestore = (posting_id: number) => {
    setIsRestoring(true);
    console.log('Restoring posting', { posting_id });
    router.post(`/company-admin/postings/${posting_id}/restore`, {}, {
      onSuccess: () => {
        console.log('Posting restored successfully', { posting_id });
        setRestoreId(null);
        setRestoreTitle(null);
        setIsRestoring(false);
      },
      onError: (errors) => {
        console.error('Failed to restore posting', { posting_id, errors });
        setRestoreId(null);
        setRestoreTitle(null);
        setIsRestoring(false);
      },
    });
  };

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title="Trashed Postings" />
      <div className="p-6 space-y-6">
        <Card className="shadow-lg border-none bg-white dark:bg-gray-800 rounded-2xl overflow-hidden transition-all duration-300 hover:shadow-xl">
          <CardHeader className="bg-gradient-to-r from-indigo-500 to-blue-600 dark:from-indigo-700 dark:to-blue-800 p-6 rounded-t-2xl transform transition-transform duration-300 hover:scale-[1.01]">
            <CardTitle className="text-2xl font-bold text-white tracking-tight">Trashed Postings - {company.name}</CardTitle>
          </CardHeader>
          <CardContent className="p-6 space-y-6">
            {showSuccess && success && (
              <Alert className="bg-green-100 dark:bg-green-900/30 border-green-300 dark:border-green-700 animate-in fade-in slide-in-from-top-4 duration-500">
                <AlertCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
                <AlertTitle className="text-green-800 dark:text-green-200 font-semibold">Success</AlertTitle>
                <AlertDescription className="text-green-700 dark:text-gray-300 flex justify-between items-center">
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
              <Alert className="bg-red-100 dark:bg-red-900/30 border-red-300 dark:border-red-700 animate-in fade-in slide-in-from-top-4 duration-500">
                <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400" />
                <AlertTitle className="text-red-800 dark:text-red-200 font-semibold">Error</AlertTitle>
                <AlertDescription className="text-red-700 dark:text-gray-300 flex justify-between items-center">
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
                placeholder="Search by title, industry, skills, or location..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="max-w-sm border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 rounded-full focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 transition-all duration-300 hover:shadow-md"
                aria-label="Search trashed postings"
              />
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className="w-40 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 rounded-full focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 transition-all duration-300 hover:shadow-md" aria-label="Filter by type">
                  <SelectValue placeholder="Filter by type" />
                </SelectTrigger>
                <SelectContent className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 rounded-xl">
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="internship">Internship</SelectItem>
                  <SelectItem value="career">Career</SelectItem>
                </SelectContent>
              </Select>
              <Button
                asChild
                variant="outline"
                className="border-indigo-500 text-indigo-600 dark:text-indigo-400 bg-white dark:bg-gray-900 rounded-full hover:bg-indigo-100 dark:hover:bg-indigo-900/50 hover:text-indigo-700 dark:hover:text-indigo-300 transition-all duration-300 transform hover:scale-105"
              >
                <Link href="/company-admin/postings" aria-label="Back to postings">
                  Back to Postings
                </Link>
              </Button>
            </div>
            <Separator className="bg-gray-200 dark:bg-gray-700" />
            {trashedPostings.data.length > 0 ? (
              <>
                <Table className="border border-indigo-500/50 dark:border-indigo-700/50 rounded-xl bg-white dark:bg-gray-900">
                  <TableHeader className="bg-indigo-50 dark:bg-indigo-900/50">
                    <TableRow className="hover:bg-indigo-100 dark:hover:bg-indigo-900/70 transition-colors duration-200">
                      <TableHead className="cursor-pointer font-semibold text-indigo-700 dark:text-indigo-300" onClick={() => handleSort('title')}>
                        Title {filters.sort_by === 'title' && (filters.sort_dir === 'asc' ? '↑' : '↓')}
                      </TableHead>
                      <TableHead className="cursor-pointer font-semibold text-indigo-700 dark:text-indigo-300" onClick={() => handleSort('type')}>
                        Type {filters.sort_by === 'type' && (filters.sort_dir === 'asc' ? '↑' : '↓')}
                      </TableHead>
                      <TableHead className="font-semibold text-indigo-700 dark:text-indigo-300">Industry</TableHead>
                      <TableHead className="font-semibold text-indigo-700 dark:text-indigo-300">Location</TableHead>
                      <TableHead className="font-semibold text-indigo-700 dark:text-indigo-300">Benefits</TableHead>
                      <TableHead className="font-semibold text-indigo-700 dark:text-indigo-300">Min GPA</TableHead>
                      <TableHead className="font-semibold text-indigo-700 dark:text-indigo-300">Skills</TableHead>
                      <TableHead className="cursor-pointer font-semibold text-indigo-700 dark:text-indigo-300" onClick={() => handleSort('deleted_at')}>
                        Deleted At {filters.sort_by === 'deleted_at' && (filters.sort_dir === 'asc' ? '↑' : '↓')}
                      </TableHead>
                      <TableHead className="font-semibold text-indigo-700 dark:text-indigo-300">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {trashedPostings.data.map((posting, index) => (
                      <TableRow
                        key={posting.posting_id}
                        className={`${
                          index % 2 === 0 ? 'bg-white dark:bg-gray-900' : 'bg-gray-50 dark:bg-gray-800'
                        } hover:bg-indigo-50 dark:hover:bg-indigo-900/30 transition-colors duration-200 animate-in fade-in duration-300`}
                      >
                        <TableCell className="font-medium text-gray-900 dark:text-gray-100">{posting.title}</TableCell>
                        <TableCell className="capitalize text-gray-700 dark:text-gray-300">{posting.type}</TableCell>
                        <TableCell className="text-gray-700 dark:text-gray-300">{posting.industry}</TableCell>
                        <TableCell className="text-gray-700 dark:text-gray-300">{posting.location}</TableCell>
                        <TableCell className="text-gray-700 dark:text-gray-300">{posting.benefits || 'N/A'}</TableCell>
                        <TableCell className="text-gray-700 dark:text-gray-300">{posting.min_gpa || 'N/A'}</TableCell>
                        <TableCell className="text-gray-700 dark:text-gray-300">{posting.skills_required.join(', ') || 'N/A'}</TableCell>
                        <TableCell className="text-gray-700 dark:text-gray-300">{posting.deleted_at}</TableCell>
                        <TableCell>
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <AlertDialog>
                                  <AlertDialogTrigger asChild>
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      className="border-green-600 text-green-600 dark:text-green-400 bg-white dark:bg-gray-900 rounded-full hover:bg-green-100 dark:hover:bg-green-900/50 hover:text-green-700 dark:hover:text-green-300 transition-all duration-300 transform hover:scale-105"
                                      onClick={() => {
                                        setRestoreId(posting.posting_id);
                                        setRestoreTitle(posting.title);
                                      }}
                                      aria-label={`Restore posting ${posting.title}`}
                                      disabled={isRestoring && restoreId === posting.posting_id}
                                    >
                                      {isRestoring && restoreId === posting.posting_id ? (
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                      ) : (
                                        <RotateCcw className="h-4 w-4" />
                                      )}
                                    </Button>
                                  </AlertDialogTrigger>
                                  <AlertDialogContent className="rounded-2xl bg-white dark:bg-gray-800 border-none shadow-lg animate-in fade-in zoom-in-95 duration-300">
                                    <div className="bg-gradient-to-r from-indigo-500 to-blue-600 dark:from-indigo-700 dark:to-blue-800 p-4 rounded-t-2xl">
                                      <AlertDialogTitle className="text-white text-lg font-bold">Confirm Restoration</AlertDialogTitle>
                                    </div>
                                    <AlertDialogDescription className="p-4 text-gray-700 dark:text-gray-300">
                                      Are you sure you want to restore the posting "{restoreTitle}"? This action will move the posting back to active postings.
                                    </AlertDialogDescription>
                                    <div className="flex justify-end gap-2 p-4">
                                      <AlertDialogCancel
                                        onClick={() => {
                                          setRestoreId(null);
                                          setRestoreTitle(null);
                                        }}
                                        className="border-indigo-500 text-indigo-600 dark:text-indigo-400 bg-white dark:bg-gray-900 rounded-full hover:bg-indigo-100 dark:hover:bg-indigo-900/50 hover:text-indigo-700 dark:hover:text-indigo-300 transition-all duration-300 transform hover:scale-105"
                                      >
                                        Cancel
                                      </AlertDialogCancel>
                                      <AlertDialogAction
                                        onClick={() => restoreId && handleRestore(restoreId)}
                                        className="bg-gradient-to-r from-green-600 to-green-700 dark:from-green-700 dark:to-green-800 text-white rounded-full hover:from-green-700 hover:to-green-800 dark:hover:from-green-800 dark:hover:to-green-900 transition-all duration-300 transform hover:scale-105"
                                      >
                                        Restore
                                      </AlertDialogAction>
                                    </div>
                                  </AlertDialogContent>
                                </AlertDialog>
                              </TooltipTrigger>
                              <TooltipContent>Restore</TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
                <Pagination className="mt-4">
                  <PaginationContent>
                    <PaginationItem>
                      <PaginationPrevious
                        href={trashedPostings.prev_page_url || '#'}
                        className={`border-indigo-500 text-indigo-600 dark:text-indigo-400 bg-white dark:bg-gray-900 rounded-full hover:bg-indigo-100 dark:hover:bg-indigo-900/50 hover:text-indigo-700 dark:hover:text-indigo-300 transition-all duration-300 transform hover:scale-105 ${
                          !trashedPostings.prev_page_url ? 'pointer-events-none opacity-50' : ''
                        }`}
                        aria-label="Previous page"
                      />
                    </PaginationItem>
                    {[...Array(trashedPostings.last_page)].map((_, i) => (
                      <PaginationItem key={i}>
                        <PaginationLink
                          href={`/company-admin/postingstrashed?page=${i + 1}&search=${encodeURIComponent(searchTerm)}&type=${typeFilter}&sort_by=${
                            filters.sort_by
                          }&sort_dir=${filters.sort_dir}`}
                          isActive={trashedPostings.current_page === i + 1}
                          className="border-indigo-500 text-indigo-600 dark:text-indigo-400 bg-white dark:bg-gray-900 rounded-full hover:bg-indigo-100 dark:hover:bg-indigo-900/50 hover:text-indigo-700 dark:hover:text-indigo-300 transition-all duration-300 transform hover:scale-105"
                          aria-label={`Page ${i + 1}`}
                        >
                          {i + 1}
                        </PaginationLink>
                      </PaginationItem>
                    ))}
                    <PaginationItem>
                      <PaginationNext
                        href={trashedPostings.next_page_url || '#'}
                        className={`border-indigo-500 text-indigo-600 dark:text-indigo-400 bg-white dark:bg-gray-900 rounded-full hover:bg-indigo-100 dark:hover:bg-indigo-900/50 hover:text-indigo-700 dark:hover:text-indigo-300 transition-all duration-300 transform hover:scale-105 ${
                          !trashedPostings.next_page_url ? 'pointer-events-none opacity-50' : ''
                        }`}
                        aria-label="Next page"
                      />
                    </PaginationItem>
                  </PaginationContent>
                </Pagination>
              </>
            ) : (
              <p className="text-sm text-gray-500 dark:text-gray-400 text-center animate-in fade-in duration-300">No trashed postings found.</p>
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
// import { Separator } from '@/components/ui/separator';
// import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from '@/components/ui/pagination';
// import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
// import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
// import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
// import { RotateCcw, X, AlertCircle } from 'lucide-react';
// import { type BreadcrumbItem } from '@/types';

// interface Company {
//   company_id: number;
//   name: string;
// }

// interface TrashedPosting {
//   posting_id: number;
//   title: string;
//   type: string;
//   industry: string;
//   location: string;
//   benefits: string | null;
//   deleted_at: string;
//   min_gpa: number | null;
//   skills_required: string[];
// }

// interface PaginationData {
//   data: TrashedPosting[];
//   current_page: number;
//   last_page: number;
//   next_page_url: string | null;
//   prev_page_url: string | null;
//   total: number;
// }

// interface Props {
//   company: Company;
//   trashedPostings: PaginationData;
//   filters: { search?: string; type?: string; sort_by?: string; sort_dir?: string };
//   success?: string;
//   error?: string;
// }

// const breadcrumbs: BreadcrumbItem[] = [
//   { title: 'Dashboard', href: '/company-admin' },
//   { title: 'Trashed Postings', href: '/company-admin/postingstrashed' },
// ];

// export default function PostingsTrashed({ company, trashedPostings, filters, success, error }: Props) {
//   const [searchTerm, setSearchTerm] = useState(filters.search || '');
//   const [typeFilter, setTypeFilter] = useState(filters.type || 'all');
//   const [showSuccess, setShowSuccess] = useState(!!success);
//   const [showError, setShowError] = useState(!!error);
//   const [restoreId, setRestoreId] = useState<number | null>(null);
//   const [restoreTitle, setRestoreTitle] = useState<string | null>(null);

//   useEffect(() => {
//     console.log('PostingsTrashed component mounted', {
//       company,
//       trashedPostings: { count: trashedPostings.data.length, total: trashedPostings.total, current_page: trashedPostings.current_page, last_page: trashedPostings.last_page },
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
//   }, [success, error, company, trashedPostings, filters]);

//   useEffect(() => {
//     const debounce = setTimeout(() => {
//       console.log('Initiating search/filter', { searchTerm, typeFilter, sort_by: filters.sort_by, sort_dir: filters.sort_dir });
//       router.get(
//         '/company-admin/postingstrashed',
//         { search: searchTerm, type: typeFilter, sort_by: filters.sort_by, sort_dir: filters.sort_dir },
//         { preserveState: true, preserveScroll: true }
//       );
//     }, 300);
//     return () => clearTimeout(debounce);
//   }, [searchTerm, typeFilter, filters.sort_by, filters.sort_dir]);

//   const handleSort = (column: string) => {
//     const newSortDir = filters.sort_by === column && filters.sort_dir === 'asc' ? 'desc' : 'asc';
//     console.log('Sorting table', { column, newSortDir });
//     router.get(
//       '/company-admin/postingstrashed',
//       { search: searchTerm, type: typeFilter, sort_by: column, sort_dir: newSortDir },
//       { preserveState: true, preserveScroll: true }
//     );
//   };

//   const handleRestore = (posting_id: number) => {
//     console.log('Restoring posting', { posting_id });
//     router.post(`/company-admin/postings/${posting_id}/restore`, {}, {
//       onSuccess: () => {
//         console.log('Posting restored successfully', { posting_id });
//         setRestoreId(null);
//         setRestoreTitle(null);
//       },
//       onError: (errors) => {
//         console.error('Failed to restore posting', { posting_id, errors });
//         setRestoreId(null);
//         setRestoreTitle(null);
//       },
//     });
//   };

//   return (
//     <AppLayout breadcrumbs={breadcrumbs}>
//       <Head title="Trashed Postings" />
//       <div className="p-6 space-y-6">
//         <Card className="shadow-lg border-none bg-white dark:bg-gray-800 rounded-2xl overflow-hidden transition-all duration-300 hover:shadow-xl">
//           <CardHeader className="bg-gradient-to-r from-indigo-500 to-blue-600 dark:from-indigo-700 dark:to-blue-800 p-6 rounded-t-2xl transform transition-transform duration-300 hover:scale-[1.01]">
//             <CardTitle className="text-2xl font-bold text-white tracking-tight">Trashed Postings - {company.name}</CardTitle>
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
//                 placeholder="Search by title, industry, skills, or location..."
//                 value={searchTerm}
//                 onChange={(e) => setSearchTerm(e.target.value)}
//                 className="max-w-sm border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 rounded-full focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 transition-all duration-300 hover:shadow-md"
//                 aria-label="Search trashed postings"
//               />
//               <Select value={typeFilter} onValueChange={setTypeFilter}>
//                 <SelectTrigger className="w-40 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 rounded-full focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 transition-all duration-300 hover:shadow-md" aria-label="Filter by type">
//                   <SelectValue placeholder="Filter by type" />
//                 </SelectTrigger>
//                 <SelectContent className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 rounded-xl">
//                   <SelectItem value="all">All Types</SelectItem>
//                   <SelectItem value="internship">Internship</SelectItem>
//                   <SelectItem value="career">Career</SelectItem>
//                 </SelectContent>
//               </Select>
//               <Button
//                 asChild
//                 variant="outline"
//                 className="border-indigo-500 text-indigo-600 dark:text-indigo-400 bg-white dark:bg-gray-900 rounded-full hover:bg-indigo-100 dark:hover:bg-indigo-900/50 hover:text-indigo-700 dark:hover:text-indigo-300 transition-all duration-300 transform hover:scale-105"
//               >
//                 <Link href="/company-admin/postings" aria-label="Back to postings">
//                   Back to Postings
//                 </Link>
//               </Button>
//             </div>
//             <Separator className="bg-gray-200 dark:bg-gray-700" />
//             {trashedPostings.data.length > 0 ? (
//               <>
//                 <Table className="border border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-900">
//                   <TableHeader className="bg-indigo-50 dark:bg-indigo-900/50">
//                     <TableRow className="hover:bg-indigo-100 dark:hover:bg-indigo-900/70 transition-colors duration-200">
//                       <TableHead className="cursor-pointer font-semibold text-indigo-700 dark:text-indigo-300" onClick={() => handleSort('title')}>
//                         Title {filters.sort_by === 'title' && (filters.sort_dir === 'asc' ? '↑' : '↓')}
//                       </TableHead>
//                       <TableHead className="cursor-pointer font-semibold text-indigo-700 dark:text-indigo-300" onClick={() => handleSort('type')}>
//                         Type {filters.sort_by === 'type' && (filters.sort_dir === 'asc' ? '↑' : '↓')}
//                       </TableHead>
//                       <TableHead className="font-semibold text-indigo-700 dark:text-indigo-300">Industry</TableHead>
//                       <TableHead className="font-semibold text-indigo-700 dark:text-indigo-300">Location</TableHead>
//                       <TableHead className="font-semibold text-indigo-700 dark:text-indigo-300">Benefits</TableHead>
//                       <TableHead className="font-semibold text-indigo-700 dark:text-indigo-300">Min GPA</TableHead>
//                       <TableHead className="font-semibold text-indigo-700 dark:text-indigo-300">Skills</TableHead>
//                       <TableHead className="cursor-pointer font-semibold text-indigo-700 dark:text-indigo-300" onClick={() => handleSort('deleted_at')}>
//                         Deleted At {filters.sort_by === 'deleted_at' && (filters.sort_dir === 'asc' ? '↑' : '↓')}
//                       </TableHead>
//                       <TableHead className="font-semibold text-indigo-700 dark:text-indigo-300">Actions</TableHead>
//                     </TableRow>
//                   </TableHeader>
//                   <TableBody>
//                     {trashedPostings.data.map((posting, index) => (
//                       <TableRow
//                         key={posting.posting_id}
//                         className={`${index % 2 === 0 ? 'bg-white dark:bg-gray-900' : 'bg-gray-50 dark:bg-gray-800'} hover:bg-indigo-50 dark:hover:bg-indigo-900/30 transition-colors duration-200`}
//                       >
//                         <TableCell className="font-medium text-gray-900 dark:text-gray-100">{posting.title}</TableCell>
//                         <TableCell className="capitalize text-gray-700 dark:text-gray-300">{posting.type}</TableCell>
//                         <TableCell className="text-gray-700 dark:text-gray-300">{posting.industry}</TableCell>
//                         <TableCell className="text-gray-700 dark:text-gray-300">{posting.location}</TableCell>
//                         <TableCell className="text-gray-700 dark:text-gray-300">{posting.benefits || 'N/A'}</TableCell>
//                         <TableCell className="text-gray-700 dark:text-gray-300">{posting.min_gpa || 'N/A'}</TableCell>
//                         <TableCell className="text-gray-700 dark:text-gray-300">{posting.skills_required.join(', ') || 'N/A'}</TableCell>
//                         <TableCell className="text-gray-700 dark:text-gray-300">{posting.deleted_at}</TableCell>
//                         <TableCell>
//                           <TooltipProvider>
//                             <Tooltip>
//                               <TooltipTrigger asChild>
//                                 <AlertDialog>
//                                   <AlertDialogTrigger asChild>
//                                     <Button
//                                       variant="outline"
//                                       size="sm"
//                                       className="border-green-500 text-green-600 dark:text-green-400 bg-white dark:bg-gray-900 rounded-full hover:bg-green-100 dark:hover:bg-green-900/50 hover:text-green-700 dark:hover:text-green-300 transition-all duration-300 transform hover:scale-105"
//                                       onClick={() => {
//                                         setRestoreId(posting.posting_id);
//                                         setRestoreTitle(posting.title);
//                                       }}
//                                       aria-label={`Restore posting ${posting.title}`}
//                                     >
//                                       <RotateCcw className="h-4 w-4" />
//                                     </Button>
//                                   </AlertDialogTrigger>
//                                   <AlertDialogContent className="rounded-2xl bg-white dark:bg-gray-800 border-none shadow-lg animate-in fade-in zoom-in-95 duration-300">
//                                     <div className="bg-gradient-to-r from-indigo-500 to-blue-600 dark:from-indigo-700 dark:to-blue-800 p-4 rounded-t-2xl">
//                                       <AlertDialogTitle className="text-white text-lg font-bold">Confirm Restoration</AlertDialogTitle>
//                                     </div>
//                                     <AlertDialogDescription className="p-4 text-gray-700 dark:text-gray-300">
//                                       Are you sure you want to restore the posting "{restoreTitle}"? This action will move the posting back to active postings.
//                                     </AlertDialogDescription>
//                                     <div className="flex justify-end gap-2 p-4">
//                                       <AlertDialogCancel
//                                         onClick={() => {
//                                           setRestoreId(null);
//                                           setRestoreTitle(null);
//                                         }}
//                                         className="border-indigo-500 text-indigo-600 dark:text-indigo-400 bg-white dark:bg-gray-900 rounded-full hover:bg-indigo-100 dark:hover:bg-indigo-900/50 hover:text-indigo-700 dark:hover:text-indigo-300 transition-all duration-300 transform hover:scale-105"
//                                       >
//                                         Cancel
//                                       </AlertDialogCancel>
//                                       <AlertDialogAction
//                                         onClick={() => restoreId && handleRestore(restoreId)}
//                                         className="bg-gradient-to-r from-green-500 to-green-600 dark:from-green-600 dark:to-green-700 text-white rounded-full hover:from-green-600 hover:to-green-700 dark:hover:from-green-700 dark:hover:to-green-800 transition-all duration-300 transform hover:scale-105"
//                                       >
//                                         Restore
//                                       </AlertDialogAction>
//                                     </div>
//                                   </AlertDialogContent>
//                                 </AlertDialog>
//                               </TooltipTrigger>
//                               <TooltipContent>Restore</TooltipContent>
//                             </Tooltip>
//                           </TooltipProvider>
//                         </TableCell>
//                       </TableRow>
//                     ))}
//                   </TableBody>
//                 </Table>
//                 <Pagination className="mt-4">
//                   <PaginationContent>
//                     <PaginationItem>
//                       <PaginationPrevious
//                         href={trashedPostings.prev_page_url || '#'}
//                         className={`border-indigo-500 text-indigo-600 dark:text-indigo-400 bg-white dark:bg-gray-900 rounded-full hover:bg-indigo-100 dark:hover:bg-indigo-900/50 hover:text-indigo-700 dark:hover:text-indigo-300 transition-all duration-300 transform hover:scale-105 ${!trashedPostings.prev_page_url ? 'pointer-events-none opacity-50' : ''}`}
//                         aria-label="Previous page"
//                       />
//                     </PaginationItem>
//                     {[...Array(trashedPostings.last_page)].map((_, i) => (
//                       <PaginationItem key={i}>
//                         <PaginationLink
//                           href={`/company-admin/postingstrashed?page=${i + 1}&search=${encodeURIComponent(searchTerm)}&type=${typeFilter}&sort_by=${filters.sort_by}&sort_dir=${filters.sort_dir}`}
//                           isActive={trashedPostings.current_page === i + 1}
//                           className="border-indigo-500 text-indigo-600 dark:text-indigo-400 bg-white dark:bg-gray-900 rounded-full hover:bg-indigo-100 dark:hover:bg-indigo-900/50 hover:text-indigo-700 dark:hover:text-indigo-300 transition-all duration-300 transform hover:scale-105"
//                           aria-label={`Page ${i + 1}`}
//                         >
//                           {i + 1}
//                         </PaginationLink>
//                       </PaginationItem>
//                     ))}
//                     <PaginationItem>
//                       <PaginationNext
//                         href={trashedPostings.next_page_url || '#'}
//                         className={`border-indigo-500 text-indigo-600 dark:text-indigo-400 bg-white dark:bg-gray-900 rounded-full hover:bg-indigo-100 dark:hover:bg-indigo-900/50 hover:text-indigo-700 dark:hover:text-indigo-300 transition-all duration-300 transform hover:scale-105 ${!trashedPostings.next_page_url ? 'pointer-events-none opacity-50' : ''}`}
//                         aria-label="Next page"
//                       />
//                     </PaginationItem>
//                   </PaginationContent>
//                 </Pagination>
//               </>
//             ) : (
//               <p className="text-sm text-gray-500 dark:text-gray-400 text-center">No trashed postings found.</p>
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
// // import { Separator } from '@/components/ui/separator';
// // import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from '@/components/ui/pagination';
// // import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
// // import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
// // import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
// // import { RotateCcw, X, AlertCircle } from 'lucide-react';
// // import { type BreadcrumbItem } from '@/types';

// // interface Company {
// //   company_id: number;
// //   name: string;
// // }

// // interface TrashedPosting {
// //   posting_id: number;
// //   title: string;
// //   type: string;
// //   industry: string;
// //   location: string;
// //   deleted_at: string;
// //   min_gpa: number | null;
// //   skills_required: string[];
// // }

// // interface PaginationData {
// //   data: TrashedPosting[];
// //   current_page: number;
// //   last_page: number;
// //   next_page_url: string | null;
// //   prev_page_url: string | null;
// //   total: number;
// // }

// // interface Props {
// //   company: Company;
// //   trashedPostings: PaginationData;
// //   filters: { search?: string; type?: string; sort_by?: string; sort_dir?: string };
// //   success?: string;
// //   error?: string;
// // }

// // const breadcrumbs: BreadcrumbItem[] = [
// //   { title: 'Dashboard', href: '/company-admin' },
// //   { title: 'Trashed Postings', href: '/company-admin/postingstrashed' },
// // ];

// // export default function PostingsTrashed({ company, trashedPostings, filters, success, error }: Props) {
// //   const [searchTerm, setSearchTerm] = useState(filters.search || '');
// //   const [typeFilter, setTypeFilter] = useState(filters.type || 'all');
// //   const [showSuccess, setShowSuccess] = useState(!!success);
// //   const [showError, setShowError] = useState(!!error);
// //   const [isRestoreDialogOpen, setIsRestoreDialogOpen] = useState(false);
// //   const [postingToRestore, setPostingToRestore] = useState<{ id: number; title: string } | null>(null);

// //   useEffect(() => {
// //     console.log('PostingsTrashed component mounted', {
// //       company,
// //       trashedPostings: { count: trashedPostings.data.length, total: trashedPostings.total, current_page: trashedPostings.current_page, last_page: trashedPostings.last_page },
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
// //   }, [success, error, company, trashedPostings, filters]);

// //   useEffect(() => {
// //     const debounce = setTimeout(() => {
// //       console.log('Initiating search/filter', { searchTerm, typeFilter, sort_by: filters.sort_by, sort_dir: filters.sort_dir });
// //       router.get(
// //         '/company-admin/postingstrashed',
// //         { search: searchTerm, type: typeFilter, sort_by: filters.sort_by, sort_dir: filters.sort_dir },
// //         { preserveState: true, preserveScroll: true }
// //       );
// //     }, 300);
// //     return () => clearTimeout(debounce);
// //   }, [searchTerm, typeFilter, filters.sort_by, filters.sort_dir]);

// //   const handleSort = (column: string) => {
// //     const newSortDir = filters.sort_by === column && filters.sort_dir === 'asc' ? 'desc' : 'asc';
// //     console.log('Sorting table', { column, newSortDir });
// //     router.get(
// //       '/company-admin/postingstrashed',
// //       { search: searchTerm, type: typeFilter, sort_by: column, sort_dir: newSortDir },
// //       { preserveState: true, preserveScroll: true }
// //     );
// //   };

// //   const handleRestoreClick = (posting_id: number, title: string) => {
// //     setPostingToRestore({ id: posting_id, title });
// //     setIsRestoreDialogOpen(true);
// //   };

// //   const handleRestoreConfirm = () => {
// //     if (postingToRestore) {
// //       console.log('Restoring posting', { posting_id: postingToRestore.id });
// //       router.post(`/company-admin/postings/${postingToRestore.id}/restore`, {}, {
// //         onSuccess: () => {
// //           console.log('Posting restored successfully', { posting_id: postingToRestore.id });
// //           setIsRestoreDialogOpen(false);
// //           setPostingToRestore(null);
// //         },
// //         onError: (errors) => {
// //           console.error('Failed to restore posting', { posting_id: postingToRestore.id, errors });
// //           setIsRestoreDialogOpen(false);
// //           setPostingToRestore(null);
// //         },
// //       });
// //     }
// //   };

// //   return (
// //     <AppLayout breadcrumbs={breadcrumbs}>
// //       <Head title="Trashed Postings" />
// //       <div className="p-6 space-y-6">
// //         <Card className="shadow-md border border-gray-200 dark:border-gray-700">
// //           <CardHeader>
// //             <CardTitle className="text-2xl font-semibold text-gray-800 dark:text-gray-100">Trashed Postings - {company.name}</CardTitle>
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
// //                 placeholder="Search by title, industry, skills, or location..."
// //                 value={searchTerm}
// //                 onChange={(e) => setSearchTerm(e.target.value)}
// //                 className="max-w-sm border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 transition-all"
// //                 aria-label="Search trashed postings"
// //               />
// //               <Select value={typeFilter} onValueChange={setTypeFilter}>
// //                 <SelectTrigger className="w-40 border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 transition-all" aria-label="Filter by type">
// //                   <SelectValue placeholder="Filter by type" />
// //                 </SelectTrigger>
// //                 <SelectContent>
// //                   <SelectItem value="all">All Types</SelectItem>
// //                   <SelectItem value="internship">Internship</SelectItem>
// //                   <SelectItem value="career">Career</SelectItem>
// //                 </SelectContent>
// //               </Select>
// //               <Button
// //                 asChild
// //                 variant="outline"
// //                 className="border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 hover:bg-blue-50 dark:hover:bg-blue-900 hover:text-blue-700 dark:hover:text-blue-300 transition-colors duration-200"
// //               >
// //                 <Link href="/company-admin/postings" aria-label="Back to postings">
// //                   Back to Postings
// //                 </Link>
// //               </Button>
// //             </div>
// //             <Separator className="bg-gray-200 dark:bg-gray-600" />
// //             {trashedPostings.data.length > 0 ? (
// //               <>
// //                 <Table>
// //                   <TableHeader>
// //                     <TableRow className="hover:bg-gray-50 dark:hover:bg-gray-800">
// //                       <TableHead className="cursor-pointer font-semibold" onClick={() => handleSort('title')}>
// //                         Title {filters.sort_by === 'title' && (filters.sort_dir === 'asc' ? '↑' : '↓')}
// //                       </TableHead>
// //                       <TableHead className="cursor-pointer font-semibold" onClick={() => handleSort('type')}>
// //                         Type {filters.sort_by === 'type' && (filters.sort_dir === 'asc' ? '↑' : '↓')}
// //                       </TableHead>
// //                       <TableHead className="font-semibold">Industry</TableHead>
// //                       <TableHead className="font-semibold">Location</TableHead>
// //                       <TableHead className="font-semibold">Min GPA</TableHead>
// //                       <TableHead className="font-semibold">Skills</TableHead>
// //                       <TableHead className="cursor-pointer font-semibold" onClick={() => handleSort('deleted_at')}>
// //                         Deleted At {filters.sort_by === 'deleted_at' && (filters.sort_dir === 'asc' ? '↑' : '↓')}
// //                       </TableHead>
// //                       <TableHead className="font-semibold">Actions</TableHead>
// //                     </TableRow>
// //                   </TableHeader>
// //                   <TableBody>
// //                     {trashedPostings.data.map((posting) => (
// //                       <TableRow key={posting.posting_id} className="hover:bg-gray-50 dark:hover:bg-gray-800">
// //                         <TableCell className="font-medium">{posting.title}</TableCell>
// //                         <TableCell className="capitalize">{posting.type}</TableCell>
// //                         <TableCell>{posting.industry}</TableCell>
// //                         <TableCell>{posting.location}</TableCell>
// //                         <TableCell>{posting.min_gpa || 'N/A'}</TableCell>
// //                         <TableCell>{posting.skills_required.join(', ') || 'N/A'}</TableCell>
// //                         <TableCell>{posting.deleted_at}</TableCell>
// //                         <TableCell>
// //                           <TooltipProvider>
// //                             <Tooltip>
// //                               <TooltipTrigger asChild>
// //                                 <Button
// //                                   variant="outline"
// //                                   size="sm"
// //                                   onClick={() => handleRestoreClick(posting.posting_id, posting.title)}
// //                                   className="border-green-500 text-green-600 dark:text-green-400 hover:bg-green-100 dark:hover:bg-green-900 hover:text-green-800 dark:hover:text-green-300 transition-colors duration-200"
// //                                   aria-label={`Restore posting ${posting.title}`}
// //                                 >
// //                                   <RotateCcw className="h-4 w-4" />
// //                                 </Button>
// //                               </TooltipTrigger>
// //                               <TooltipContent>Restore</TooltipContent>
// //                             </Tooltip>
// //                           </TooltipProvider>
// //                         </TableCell>
// //                       </TableRow>
// //                     ))}
// //                   </TableBody>
// //                 </Table>
// //                 <Dialog open={isRestoreDialogOpen} onOpenChange={setIsRestoreDialogOpen}>
// //                   <DialogContent>
// //                     <DialogHeader>
// //                       <DialogTitle>Confirm Restoration</DialogTitle>
// //                       <DialogDescription>
// //                         Are you sure you want to restore the posting "{postingToRestore?.title}"? This action will move the posting back to active postings.
// //                       </DialogDescription>
// //                     </DialogHeader>
// //                     <DialogFooter>
// //                       <Button
// //                         variant="outline"
// //                         onClick={() => setIsRestoreDialogOpen(false)}
// //                         aria-label="Cancel restoration"
// //                       >
// //                         Cancel
// //                       </Button>
// //                       <Button
// //                         variant="default"
// //                         onClick={handleRestoreConfirm}
// //                         className="bg-green-600 hover:bg-green-700"
// //                         aria-label="Confirm restoration"
// //                       >
// //                         Restore
// //                       </Button>
// //                     </DialogFooter>
// //                   </DialogContent>
// //                 </Dialog>
// //                 <Pagination>
// //                   <PaginationContent>
// //                     <PaginationItem>
// //                       <PaginationPrevious
// //                         href={trashedPostings.prev_page_url || '#'}
// //                         className={`border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 hover:bg-blue-50 dark:hover:bg-blue-900 hover:text-blue-700 dark:hover:text-blue-300 transition-colors duration-200 ${!trashedPostings.prev_page_url ? 'pointer-events-none opacity-50' : ''}`}
// //                         aria-label="Previous page"
// //                       />
// //                     </PaginationItem>
// //                     {[...Array(trashedPostings.last_page)].map((_, i) => (
// //                       <PaginationItem key={i}>
// //                         <PaginationLink
// //                           href={`/company-admin/postingstrashed?page=${i + 1}&search=${encodeURIComponent(searchTerm)}&type=${typeFilter}&sort_by=${filters.sort_by}&sort_dir=${filters.sort_dir}`}
// //                           isActive={trashedPostings.current_page === i + 1}
// //                           className="border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 hover:bg-blue-50 dark:hover:bg-blue-900 hover:text-blue-700 dark:hover:text-blue-300 transition-colors duration-200"
// //                           aria-label={`Page ${i + 1}`}
// //                         >
// //                           {i + 1}
// //                         </PaginationLink>
// //                       </PaginationItem>
// //                     ))}
// //                     <PaginationItem>
// //                       <PaginationNext
// //                         href={trashedPostings.next_page_url || '#'}
// //                         className={`border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 hover:bg-blue-50 dark:hover:bg-blue-900 hover:text-blue-700 dark:hover:text-blue-300 transition-colors duration-200 ${!trashedPostings.next_page_url ? 'pointer-events-none opacity-50' : ''}`}
// //                         aria-label="Next page"
// //                       />
// //                     </PaginationItem>
// //                   </PaginationContent>
// //                 </Pagination>
// //               </>
// //             ) : (
// //               <p className="text-sm text-gray-500 dark:text-gray-400 text-center">No trashed postings found.</p>
// //             )}
// //           </CardContent>
// //         </Card>
// //       </div>
// //     </AppLayout>
// //   );
// // }




