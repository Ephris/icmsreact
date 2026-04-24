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

interface Posting {
  posting_id: number;
  title: string;
  type: string;
  status: string;
  industry: string;
  location: string;
  application_deadline: string;
  created_at: string;
  min_gpa: number | null;
  skills_required: string[];
  experience_level: string;
  work_type: string;
}

interface PaginationData {
  data: Posting[];
  current_page: number;
  last_page: number;
  next_page_url: string | null;
  prev_page_url: string | null;
  total: number;
}

interface Props {
   company: Company;
   postings: PaginationData;
   filters: { search?: string; type?: string; status?: string; min_gpa?: string; sort_by?: string; sort_dir?: string };
   success?: string;
   error?: string;
}

const breadcrumbs: BreadcrumbItem[] = [
  { title: 'Dashboard', href: '/company-admin' },
  { title: 'Postings', href: '/company-admin/postings' },
];

export default function PostingsIndex({ company, postings, filters, success, error }: Props) {
   const [searchTerm, setSearchTerm] = useState(filters.search || '');
   const [typeFilter, setTypeFilter] = useState(filters.type || 'all');
   const [statusFilter, setStatusFilter] = useState(filters.status || 'all');
   const [minGpaFilter, setMinGpaFilter] = useState(filters.min_gpa || '');
   const [showSuccess, setShowSuccess] = useState(!!success);
   const [showError, setShowError] = useState(!!error);
   const [deleteId, setDeleteId] = useState<number | null>(null);
   const [deleteTitle, setDeleteTitle] = useState<string | null>(null);

  useEffect(() => {
    console.log('PostingsIndex component mounted', {
      company,
      postings: { count: postings.data.length, total: postings.total, current_page: postings.current_page, last_page: postings.last_page },
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
  }, [success, error, company, postings, filters]);

  useEffect(() => {
    const debounce = setTimeout(() => {
      console.log('Initiating search/filter', { searchTerm, typeFilter, statusFilter, min_gpa: minGpaFilter, sort_by: filters.sort_by, sort_dir: filters.sort_dir });
      router.get(
        '/company-admin/postings',
        { search: searchTerm, type: typeFilter, status: statusFilter, min_gpa: minGpaFilter, sort_by: filters.sort_by, sort_dir: filters.sort_dir },
        { preserveState: true, preserveScroll: true }
      );
    }, 300);
    return () => clearTimeout(debounce);
  }, [searchTerm, typeFilter, statusFilter, minGpaFilter, filters.sort_by, filters.sort_dir]);

  const handleSort = (column: string) => {
    const newSortDir = filters.sort_by === column && filters.sort_dir === 'asc' ? 'desc' : 'asc';
    console.log('Sorting table', { column, newSortDir });
    router.get(
      '/company-admin/postings',
      { search: searchTerm, type: typeFilter, status: statusFilter, min_gpa: minGpaFilter, sort_by: column, sort_dir: newSortDir },
      { preserveState: true, preserveScroll: true }
    );
  };

  const handleDelete = (posting_id: number) => {
    console.log('Deleting posting', { posting_id });
    router.delete(`/company-admin/postings/${posting_id}`, {
      onSuccess: () => {
        console.log('Posting deleted successfully', { posting_id });
        setDeleteId(null);
        setDeleteTitle(null);
      },
      onError: (errors) => {
        console.error('Failed to delete posting', { posting_id, errors });
        setDeleteId(null);
        setDeleteTitle(null);
      },
    });
  };

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title="Manage Postings" />
      <div className="p-6 space-y-6">
        <Card className="shadow-lg border-none bg-white dark:bg-gray-800 rounded-2xl overflow-hidden transition-all duration-300 hover:shadow-xl">
          <CardHeader className="bg-gradient-to-r from-indigo-500 to-blue-600 dark:from-indigo-700 dark:to-blue-800 p-6 rounded-t-2xl transform transition-transform duration-300 hover:scale-[1.01]">
            <CardTitle className="text-2xl font-bold text-white tracking-tight">Manage Postings - {company.name}</CardTitle>
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
                placeholder="Search by title, industry, skills, or location..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="max-w-sm border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 rounded-full focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 transition-all duration-300 hover:shadow-md"
                aria-label="Search postings"
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
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-40 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 rounded-full focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 transition-all duration-300 hover:shadow-md" aria-label="Filter by status">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 rounded-xl">
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="open">Open</SelectItem>
                  <SelectItem value="closed">Closed</SelectItem>
                  <SelectItem value="draft">Draft</SelectItem>
                </SelectContent>
              </Select>
              <Input
                placeholder="Min GPA..."
                type="number"
                step="0.01"
                min="0"
                max="4"
                value={minGpaFilter}
                onChange={(e) => setMinGpaFilter(e.target.value)}
                className="w-40 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 rounded-full focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 transition-all duration-300 hover:shadow-md"
                aria-label="Filter by minimum GPA"
              />
              <Button
                asChild
                className="bg-gradient-to-r from-indigo-500 to-blue-600 dark:from-indigo-600 dark:to-blue-700 text-white rounded-full hover:from-indigo-600 hover:to-blue-700 dark:hover:from-indigo-700 dark:hover:to-blue-800 transition-all duration-300 transform hover:scale-105"
              >
                <Link href="/company-admin/postings/create" aria-label="Create posting">
                  Create Posting
                </Link>
              </Button>
              <Button
                asChild
                variant="outline"
                className="border-indigo-500 text-indigo-600 dark:text-indigo-400 bg-white dark:bg-gray-900 rounded-full hover:bg-indigo-100 dark:hover:bg-indigo-900/50 hover:text-indigo-700 dark:hover:text-indigo-300 transition-all duration-300 transform hover:scale-105"
              >
                <Link href="/company-admin/postingstrashed" aria-label="View trashed postings">
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
            {postings.data.length > 0 ? (
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
                      <TableHead className="cursor-pointer font-semibold text-indigo-700 dark:text-indigo-300" onClick={() => handleSort('status')}>
                        Status {filters.sort_by === 'status' && (filters.sort_dir === 'asc' ? '↑' : '↓')}
                      </TableHead>
                      <TableHead className="font-semibold text-indigo-700 dark:text-indigo-300">Industry</TableHead>
                      <TableHead className="font-semibold text-indigo-700 dark:text-indigo-300">Location</TableHead>
                      <TableHead className="font-semibold text-indigo-700 dark:text-indigo-300">Min GPA</TableHead>
                      <TableHead className="font-semibold text-indigo-700 dark:text-indigo-300">Skills</TableHead>
                      <TableHead className="font-semibold text-indigo-700 dark:text-indigo-300">Experience Level</TableHead>
                      <TableHead className="font-semibold text-indigo-700 dark:text-indigo-300">Work Type</TableHead>
                      <TableHead className="cursor-pointer font-semibold text-indigo-700 dark:text-indigo-300" onClick={() => handleSort('application_deadline')}>
                        Deadline {filters.sort_by === 'application_deadline' && (filters.sort_dir === 'asc' ? '↑' : '↓')}
                      </TableHead>
                      <TableHead className="font-semibold text-indigo-700 dark:text-indigo-300">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {postings.data.map((posting, index) => (
                      <TableRow
                        key={posting.posting_id}
                        className={`${index % 2 === 0 ? 'bg-white dark:bg-gray-900' : 'bg-gray-50 dark:bg-gray-800'} hover:bg-indigo-50 dark:hover:bg-indigo-900/30 transition-colors duration-200`}
                      >
                        <TableCell className="font-medium text-gray-900 dark:text-gray-100">{posting.title}</TableCell>
                        <TableCell className="capitalize text-gray-700 dark:text-gray-300">{posting.type}</TableCell>
                        <TableCell>
                          <span
                            className={`inline-flex items-center justify-center capitalize text-white font-semibold px-3 py-1 rounded-full transition-colors duration-200 ${
                              posting.status.toLowerCase() === 'open'
                                ? 'bg-[#22c55e] hover:bg-[#16a34a] dark:bg-[#16a34a] dark:hover:bg-[#15803d]'
                                : posting.status.toLowerCase() === 'closed'
                                ? 'bg-[#ef4444] hover:bg-[#dc2626] dark:bg-[#dc2626] dark:hover:bg-[#b91c1c]'
                                : 'bg-[#6b7280] hover:bg-[#4b5563] dark:bg-[#4b5563] dark:hover:bg-[#374151]'
                            }`}
                          >
                            {posting.status}
                          </span>
                        </TableCell>
                        <TableCell className="text-gray-700 dark:text-gray-300">{posting.industry}</TableCell>
                        <TableCell className="text-gray-700 dark:text-gray-300">{posting.location}</TableCell>
                        <TableCell className="text-gray-700 dark:text-gray-300">{posting.min_gpa || 'N/A'}</TableCell>
                        <TableCell className="text-gray-700 dark:text-gray-300">{posting.skills_required.join(', ') || 'N/A'}</TableCell>
                        <TableCell className="capitalize text-gray-700 dark:text-gray-300">{posting.experience_level || 'N/A'}</TableCell>
                        <TableCell className="capitalize text-gray-700 dark:text-gray-300">{posting.work_type || 'N/A'}</TableCell>
                        <TableCell className="text-gray-700 dark:text-gray-300">{posting.application_deadline}</TableCell>
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
                                    <Link href={`/company-admin/postings/${posting.posting_id}`} aria-label={`View posting ${posting.title}`}>
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
                                    <Link href={`/company-admin/postings/${posting.posting_id}/edit`} aria-label={`Edit posting ${posting.title}`}>
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
                                          setDeleteId(posting.posting_id);
                                          setDeleteTitle(posting.title);
                                        }}
                                        aria-label={`Delete posting ${posting.title}`}
                                      >
                                        <Trash2 className="h-4 w-4" />
                                      </Button>
                                    </AlertDialogTrigger>
                                    <AlertDialogContent className="rounded-2xl bg-white dark:bg-gray-800 border-none shadow-lg animate-in fade-in zoom-in-95 duration-300">
                                      <div className="bg-gradient-to-r from-indigo-500 to-blue-600 dark:from-indigo-700 dark:to-blue-800 p-4 rounded-t-2xl">
                                        <AlertDialogTitle className="text-white text-lg font-bold">Confirm Deletion</AlertDialogTitle>
                                      </div>
                                      <AlertDialogDescription className="p-4 text-gray-700 dark:text-gray-300">
                                        Are you sure you want to delete the posting "{deleteTitle}"? This action will move the posting to the trash.
                                      </AlertDialogDescription>
                                      <div className="flex justify-end gap-2 p-4">
                                        <AlertDialogCancel
                                          onClick={() => {
                                            setDeleteId(null);
                                            setDeleteTitle(null);
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
                        href={postings.prev_page_url || '#'}
                        className={`border-indigo-500 text-indigo-600 dark:text-indigo-400 bg-white dark:bg-gray-900 rounded-full hover:bg-indigo-100 dark:hover:bg-indigo-900/50 hover:text-indigo-700 dark:hover:text-indigo-300 transition-all duration-300 transform hover:scale-105 ${!postings.prev_page_url ? 'pointer-events-none opacity-50' : ''}`}
                        aria-label="Previous page"
                      />
                    </PaginationItem>
                    {[...Array(postings.last_page)].map((_, i) => (
                      <PaginationItem key={i}>
                        <PaginationLink
                          href={`/company-admin/postings?page=${i + 1}&search=${encodeURIComponent(searchTerm)}&type=${typeFilter}&status=${statusFilter}&min_gpa=${minGpaFilter}&sort_by=${filters.sort_by}&sort_dir=${filters.sort_dir}`}
                          isActive={postings.current_page === i + 1}
                          className="border-indigo-500 text-indigo-600 dark:text-indigo-400 bg-white dark:bg-gray-900 rounded-full hover:bg-indigo-100 dark:hover:bg-indigo-900/50 hover:text-indigo-700 dark:hover:text-indigo-300 transition-all duration-300 transform hover:scale-105"
                          aria-label={`Page ${i + 1}`}
                        >
                          {i + 1}
                        </PaginationLink>
                      </PaginationItem>
                    ))}
                    <PaginationItem>
                      <PaginationNext
                        href={postings.next_page_url || '#'}
                        className={`border-indigo-500 text-indigo-600 dark:text-indigo-400 bg-white dark:bg-gray-900 rounded-full hover:bg-indigo-100 dark:hover:bg-indigo-900/50 hover:text-indigo-700 dark:hover:text-indigo-300 transition-all duration-300 transform hover:scale-105 ${!postings.next_page_url ? 'pointer-events-none opacity-50' : ''}`}
                        aria-label="Next page"
                      />
                    </PaginationItem>
                  </PaginationContent>
                </Pagination>
              </>
            ) : (
              <p className="text-sm text-gray-500 dark:text-gray-400 text-center">No postings found.</p>
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
// import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogTrigger, AlertDialogTitle } from '@/components/ui/alert-dialog';
// import { Eye, Edit, Trash2, X, AlertCircle } from 'lucide-react';
// import { type BreadcrumbItem } from '@/types';

// interface Company {
//   company_id: number;
//   name: string;
// }

// interface Posting {
//   posting_id: number;
//   title: string;
//   type: string;
//   status: string;
//   industry: string;
//   location: string;
//   supervisor_name: string;
//   application_deadline: string;
//   created_at: string;
//   min_gpa: number | null;
//   skills_required: string[];
//   experience_level: string;
//   work_type: string;
//   benefits: string | null;
// }

// interface PaginationData {
//   data: Posting[];
//   current_page: number;
//   last_page: number;
//   next_page_url: string | null;
//   prev_page_url: string | null;
//   total: number;
// }

// interface Props {
//   company: Company;
//   postings: PaginationData;
//   filters: { search?: string; type?: string; status?: string; min_gpa?: string; sort_by?: string; sort_dir?: string };
//   success?: string;
//   error?: string;
// }

// const breadcrumbs: BreadcrumbItem[] = [
//   { title: 'Dashboard', href: '/company-admin' },
//   { title: 'Postings', href: '/company-admin/postings' },
// ];

// export default function PostingsIndex({ company, postings, filters, success, error }: Props) {
//   const [searchTerm, setSearchTerm] = useState(filters.search || '');
//   const [typeFilter, setTypeFilter] = useState(filters.type || 'all');
//   const [statusFilter, setStatusFilter] = useState(filters.status || 'all');
//   const [minGpaFilter, setMinGpaFilter] = useState(filters.min_gpa || '');
//   const [showSuccess, setShowSuccess] = useState(!!success);
//   const [showError, setShowError] = useState(!!error);
//   const [deleteId, setDeleteId] = useState<number | null>(null);
//   const [deleteTitle, setDeleteTitle] = useState<string | null>(null);

//   useEffect(() => {
//     console.log('PostingsIndex component mounted', {
//       company,
//       postings: { count: postings.data.length, total: postings.total, current_page: postings.current_page, last_page: postings.last_page },
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
//   }, [success, error, company, postings, filters]);

//   useEffect(() => {
//     const debounce = setTimeout(() => {
//       console.log('Initiating search/filter', { searchTerm, typeFilter, statusFilter, min_gpa: minGpaFilter, sort_by: filters.sort_by, sort_dir: filters.sort_dir });
//       router.get(
//         '/company-admin/postings',
//         { search: searchTerm, type: typeFilter, status: statusFilter, min_gpa: minGpaFilter, sort_by: filters.sort_by, sort_dir: filters.sort_dir },
//         { preserveState: true, preserveScroll: true }
//       );
//     }, 300);
//     return () => clearTimeout(debounce);
//   }, [searchTerm, typeFilter, statusFilter, minGpaFilter, filters.sort_by, filters.sort_dir]);

//   const handleSort = (column: string) => {
//     const newSortDir = filters.sort_by === column && filters.sort_dir === 'asc' ? 'desc' : 'asc';
//     console.log('Sorting table', { column, newSortDir });
//     router.get(
//       '/company-admin/postings',
//       { search: searchTerm, type: typeFilter, status: statusFilter, min_gpa: minGpaFilter, sort_by: column, sort_dir: newSortDir },
//       { preserveState: true, preserveScroll: true }
//     );
//   };

//   const handleDelete = (posting_id: number) => {
//     console.log('Deleting posting', { posting_id });
//     router.delete(`/company-admin/postings/${posting_id}`, {
//       onSuccess: () => {
//         console.log('Posting deleted successfully', { posting_id });
//         setDeleteId(null);
//         setDeleteTitle(null);
//       },
//       onError: (errors) => {
//         console.error('Failed to delete posting', { posting_id, errors });
//         setDeleteId(null);
//         setDeleteTitle(null);
//       },
//     });
//   };

//   return (
//     <AppLayout breadcrumbs={breadcrumbs}>
//       <Head title="Manage Postings" />
//       <div className="p-6 space-y-6">
//         <Card className="shadow-lg border-none bg-white dark:bg-gray-800 rounded-2xl overflow-hidden transition-all duration-300 hover:shadow-xl">
//           <CardHeader className="bg-gradient-to-r from-indigo-500 to-blue-600 dark:from-indigo-700 dark:to-blue-800 p-6 rounded-t-2xl transform transition-transform duration-300 hover:scale-[1.01]">
//             <CardTitle className="text-2xl font-bold text-white tracking-tight">Manage Postings - {company.name}</CardTitle>
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
//                 aria-label="Search postings"
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
//               <Select value={statusFilter} onValueChange={setStatusFilter}>
//                 <SelectTrigger className="w-40 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 rounded-full focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 transition-all duration-300 hover:shadow-md" aria-label="Filter by status">
//                   <SelectValue placeholder="Filter by status" />
//                 </SelectTrigger>
//                 <SelectContent className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 rounded-xl">
//                   <SelectItem value="all">All Statuses</SelectItem>
//                   <SelectItem value="open">Open</SelectItem>
//                   <SelectItem value="closed">Closed</SelectItem>
//                   <SelectItem value="draft">Draft</SelectItem>
//                 </SelectContent>
//               </Select>
//               <Input
//                 placeholder="Min GPA..."
//                 type="number"
//                 step="0.01"
//                 min="0"
//                 max="4"
//                 value={minGpaFilter}
//                 onChange={(e) => setMinGpaFilter(e.target.value)}
//                 className="w-40 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 rounded-full focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 transition-all duration-300 hover:shadow-md"
//                 aria-label="Filter by minimum GPA"
//               />
//               <Button
//                 asChild
//                 className="bg-gradient-to-r from-indigo-500 to-blue-600 dark:from-indigo-600 dark:to-blue-700 text-white rounded-full hover:from-indigo-600 hover:to-blue-700 dark:hover:from-indigo-700 dark:hover:to-blue-800 transition-all duration-300 transform hover:scale-105"
//               >
//                 <Link href="/company-admin/postings/create" aria-label="Create posting">
//                   Create Posting
//                 </Link>
//               </Button>
//               <Button
//                 asChild
//                 variant="outline"
//                 className="border-indigo-500 text-indigo-600 dark:text-indigo-400 bg-white dark:bg-gray-900 rounded-full hover:bg-indigo-100 dark:hover:bg-indigo-900/50 hover:text-indigo-700 dark:hover:text-indigo-300 transition-all duration-300 transform hover:scale-105"
//               >
//                 <Link href="/company-admin/postingstrashed" aria-label="View trashed postings">
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
//             {postings.data.length > 0 ? (
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
//                       <TableHead className="cursor-pointer font-semibold text-indigo-700 dark:text-indigo-300" onClick={() => handleSort('status')}>
//                         Status {filters.sort_by === 'status' && (filters.sort_dir === 'asc' ? '↑' : '↓')}
//                       </TableHead>
//                       <TableHead className="font-semibold text-indigo-700 dark:text-indigo-300">Industry</TableHead>
//                       <TableHead className="font-semibold text-indigo-700 dark:text-indigo-300">Location</TableHead>
//                       <TableHead className="font-semibold text-indigo-700 dark:text-indigo-300">Min GPA</TableHead>
//                       <TableHead className="font-semibold text-indigo-700 dark:text-indigo-300">Skills</TableHead>
//                       <TableHead className="font-semibold text-indigo-700 dark:text-indigo-300">Experience Level</TableHead>
//                       <TableHead className="font-semibold text-indigo-700 dark:text-indigo-300">Work Type</TableHead>
//                       <TableHead className="font-semibold text-indigo-700 dark:text-indigo-300">Benefits</TableHead>
//                       <TableHead className="font-semibold text-indigo-700 dark:text-indigo-300">Supervisor</TableHead>
//                       <TableHead className="cursor-pointer font-semibold text-indigo-700 dark:text-indigo-300" onClick={() => handleSort('application_deadline')}>
//                         Deadline {filters.sort_by === 'application_deadline' && (filters.sort_dir === 'asc' ? '↑' : '↓')}
//                       </TableHead>
//                       <TableHead className="font-semibold text-indigo-700 dark:text-indigo-300">Actions</TableHead>
//                     </TableRow>
//                   </TableHeader>
//                   <TableBody>
//                     {postings.data.map((posting, index) => (
//                       <TableRow
//                         key={posting.posting_id}
//                         className={`${index % 2 === 0 ? 'bg-white dark:bg-gray-900' : 'bg-gray-50 dark:bg-gray-800'} hover:bg-indigo-50 dark:hover:bg-indigo-900/30 transition-colors duration-200`}
//                       >
//                         <TableCell className="font-medium text-gray-900 dark:text-gray-100">{posting.title}</TableCell>
//                         <TableCell className="capitalize text-gray-700 dark:text-gray-300">{posting.type}</TableCell>
//                         <TableCell>
//                           <span
//                             className={`inline-flex items-center justify-center capitalize text-white font-semibold px-3 py-1 rounded-full transition-colors duration-200 ${
//                               posting.status.toLowerCase() === 'open'
//                                 ? '!bg-green-500 hover:!bg-green-600 dark:!bg-green-600 dark:hover:!bg-green-700'
//                                 : posting.status.toLowerCase() === 'closed'
//                                 ? '!bg-red-500 hover:!bg-red-600 dark:!bg-red-600 dark:hover:!bg-red-700'
//                                 : '!bg-gray-500 hover:!bg-gray-600 dark:!bg-gray-600 dark:hover:!bg-gray-700'
//                             }`}
//                           >
//                             {posting.status}
//                           </span>
//                         </TableCell>
//                         <TableCell className="text-gray-700 dark:text-gray-300">{posting.industry}</TableCell>
//                         <TableCell className="text-gray-700 dark:text-gray-300">{posting.location}</TableCell>
//                         <TableCell className="text-gray-700 dark:text-gray-300">{posting.min_gpa || 'N/A'}</TableCell>
//                         <TableCell className="text-gray-700 dark:text-gray-300">{posting.skills_required.join(', ') || 'N/A'}</TableCell>
//                         <TableCell className="capitalize text-gray-700 dark:text-gray-300">{posting.experience_level || 'N/A'}</TableCell>
//                         <TableCell className="capitalize text-gray-700 dark:text-gray-300">{posting.work_type || 'N/A'}</TableCell>
//                         <TableCell className="text-gray-700 dark:text-gray-300">{posting.benefits || 'N/A'}</TableCell>
//                         <TableCell className="text-gray-700 dark:text-gray-300">{posting.supervisor_name}</TableCell>
//                         <TableCell className="text-gray-700 dark:text-gray-300">{posting.application_deadline}</TableCell>
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
//                                     <Link href={`/company-admin/postings/${posting.posting_id}`} aria-label={`View posting ${posting.title}`}>
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
//                                     <Link href={`/company-admin/postings/${posting.posting_id}/edit`} aria-label={`Edit posting ${posting.title}`}>
//                                       <Edit className="h-4 w-4" />
//                                     </Link>
//                                   </Button>
//                                 </TooltipTrigger>
//                                 <TooltipContent>Edit</TooltipContent>
//                               </Tooltip>
//                               <Tooltip>
//                                 <TooltipTrigger asChild>
//                                   <AlertDialog>
//                                     <AlertDialogTrigger asChild>
//                                       <Button
//                                         variant="outline"
//                                         size="sm"
//                                         className="border-red-500 text-red-600 dark:text-red-400 bg-white dark:bg-gray-900 rounded-full hover:bg-red-100 dark:hover:bg-red-900/50 hover:text-red-700 dark:hover:text-red-300 transition-all duration-300 transform hover:scale-105"
//                                         onClick={() => {
//                                           setDeleteId(posting.posting_id);
//                                           setDeleteTitle(posting.title);
//                                         }}
//                                         aria-label={`Delete posting ${posting.title}`}
//                                       >
//                                         <Trash2 className="h-4 w-4" />
//                                       </Button>
//                                     </AlertDialogTrigger>
//                                     <AlertDialogContent className="rounded-2xl bg-white dark:bg-gray-800 border-none shadow-lg animate-in fade-in zoom-in-95 duration-300">
//                                       <div className="bg-gradient-to-r from-indigo-500 to-blue-600 dark:from-indigo-700 dark:to-blue-800 p-4 rounded-t-2xl">
//                                         <AlertDialogTitle className="text-white text-lg font-bold">Confirm Deletion</AlertDialogTitle>
//                                       </div>
//                                       <AlertDialogDescription className="p-4 text-gray-700 dark:text-gray-300">
//                                         Are you sure you want to delete the posting "{deleteTitle}"? This action will move the posting to the trash.
//                                       </AlertDialogDescription>
//                                       <div className="flex justify-end gap-2 p-4">
//                                         <AlertDialogCancel
//                                           onClick={() => {
//                                             setDeleteId(null);
//                                             setDeleteTitle(null);
//                                           }}
//                                           className="border-indigo-500 text-indigo-600 dark:text-indigo-400 bg-white dark:bg-gray-900 rounded-full hover:bg-indigo-100 dark:hover:bg-indigo-900/50 hover:text-indigo-700 dark:hover:text-indigo-300 transition-all duration-300 transform hover:scale-105"
//                                         >
//                                           Cancel
//                                         </AlertDialogCancel>
//                                         <AlertDialogAction
//                                           onClick={() => deleteId && handleDelete(deleteId)}
//                                           className="bg-gradient-to-r from-red-500 to-red-600 dark:from-red-600 dark:to-red-700 text-white rounded-full hover:from-red-600 hover:to-red-700 dark:hover:from-red-700 dark:hover:to-red-800 transition-all duration-300 transform hover:scale-105"
//                                         >
//                                           Delete
//                                         </AlertDialogAction>
//                                       </div>
//                                     </AlertDialogContent>
//                                   </AlertDialog>
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
//                         href={postings.prev_page_url || '#'}
//                         className={`border-indigo-500 text-indigo-600 dark:text-indigo-400 bg-white dark:bg-gray-900 rounded-full hover:bg-indigo-100 dark:hover:bg-indigo-900/50 hover:text-indigo-700 dark:hover:text-indigo-300 transition-all duration-300 transform hover:scale-105 ${!postings.prev_page_url ? 'pointer-events-none opacity-50' : ''}`}
//                         aria-label="Previous page"
//                       />
//                     </PaginationItem>
//                     {[...Array(postings.last_page)].map((_, i) => (
//                       <PaginationItem key={i}>
//                         <PaginationLink
//                           href={`/company-admin/postings?page=${i + 1}&search=${encodeURIComponent(searchTerm)}&type=${typeFilter}&status=${statusFilter}&min_gpa=${minGpaFilter}&sort_by=${filters.sort_by}&sort_dir=${filters.sort_dir}`}
//                           isActive={postings.current_page === i + 1}
//                           className="border-indigo-500 text-indigo-600 dark:text-indigo-400 bg-white dark:bg-gray-900 rounded-full hover:bg-indigo-100 dark:hover:bg-indigo-900/50 hover:text-indigo-700 dark:hover:text-indigo-300 transition-all duration-300 transform hover:scale-105"
//                           aria-label={`Page ${i + 1}`}
//                         >
//                           {i + 1}
//                         </PaginationLink>
//                       </PaginationItem>
//                     ))}
//                     <PaginationItem>
//                       <PaginationNext
//                         href={postings.next_page_url || '#'}
//                         className={`border-indigo-500 text-indigo-600 dark:text-indigo-400 bg-white dark:bg-gray-900 rounded-full hover:bg-indigo-100 dark:hover:bg-indigo-900/50 hover:text-indigo-700 dark:hover:text-indigo-300 transition-all duration-300 transform hover:scale-105 ${!postings.next_page_url ? 'pointer-events-none opacity-50' : ''}`}
//                         aria-label="Next page"
//                       />
//                     </PaginationItem>
//                   </PaginationContent>
//                 </Pagination>
//               </>
//             ) : (
//               <p className="text-sm text-gray-500 dark:text-gray-400 text-center">No postings found.</p>
//             )}
//           </CardContent>
//         </Card>
//       </div>
//     </AppLayout>
//   );
// }

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
// import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
// import { Eye, Edit, Trash2, X, AlertCircle } from 'lucide-react';
// import { type BreadcrumbItem } from '@/types';

// interface Company {
//   company_id: number;
//   name: string;
// }

// interface Posting {
//   posting_id: number;
//   title: string;
//   type: string;
//   status: string;
//   industry: string;
//   location: string;
//   supervisor_name: string;
//   application_deadline: string;
//   created_at: string;
//   min_gpa: number | null;
//   skills_required: string[];
//   experience_level: string;
//   work_type: string;
//   benefits: string | null;
// }

// interface PaginationData {
//   data: Posting[];
//   current_page: number;
//   last_page: number;
//   next_page_url: string | null;
//   prev_page_url: string | null;
//   total: number;
// }

// interface Props {
//   company: Company;
//   postings: PaginationData;
//   filters: { search?: string; type?: string; status?: string; min_gpa?: string; sort_by?: string; sort_dir?: string };
//   success?: string;
//   error?: string;
// }

// const breadcrumbs: BreadcrumbItem[] = [
//   { title: 'Dashboard', href: '/company-admin' },
//   { title: 'Postings', href: '/company-admin/postings' },
// ];

// export default function PostingsIndex({ company, postings, filters, success, error }: Props) {
//   const [searchTerm, setSearchTerm] = useState(filters.search || '');
//   const [typeFilter, setTypeFilter] = useState(filters.type || 'all');
//   const [statusFilter, setStatusFilter] = useState(filters.status || 'all');
//   const [minGpaFilter, setMinGpaFilter] = useState(filters.min_gpa || '');
//   const [showSuccess, setShowSuccess] = useState(!!success);
//   const [showError, setShowError] = useState(!!error);
//   const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
//   const [postingToDelete, setPostingToDelete] = useState<{ id: number; title: string } | null>(null);

//   useEffect(() => {
//     console.log('PostingsIndex component mounted', {
//       company,
//       postings: { count: postings.data.length, total: postings.total, current_page: postings.current_page, last_page: postings.last_page },
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
//   }, [success, error, company, postings, filters]);

//   useEffect(() => {
//     const debounce = setTimeout(() => {
//       console.log('Initiating search/filter', { searchTerm, typeFilter, statusFilter, min_gpa: minGpaFilter, sort_by: filters.sort_by, sort_dir: filters.sort_dir });
//       router.get(
//         '/company-admin/postings',
//         { search: searchTerm, type: typeFilter, status: statusFilter, min_gpa: minGpaFilter, sort_by: filters.sort_by, sort_dir: filters.sort_dir },
//         { preserveState: true, preserveScroll: true }
//       );
//     }, 300);
//     return () => clearTimeout(debounce);
//   }, [searchTerm, typeFilter, statusFilter, minGpaFilter, filters.sort_by, filters.sort_dir]);

//   const handleSort = (column: string) => {
//     const newSortDir = filters.sort_by === column && filters.sort_dir === 'asc' ? 'desc' : 'asc';
//     console.log('Sorting table', { column, newSortDir });
//     router.get(
//       '/company-admin/postings',
//       { search: searchTerm, type: typeFilter, status: statusFilter, min_gpa: minGpaFilter, sort_by: column, sort_dir: newSortDir },
//       { preserveState: true, preserveScroll: true }
//     );
//   };

//   const handleDeleteClick = (posting_id: number, title: string) => {
//     setPostingToDelete({ id: posting_id, title });
//     setIsDeleteDialogOpen(true);
//   };

//   const handleDeleteConfirm = () => {
//     if (postingToDelete) {
//       console.log('Deleting posting', { posting_id: postingToDelete.id });
//       router.delete(`/company-admin/postings/${postingToDelete.id}`, {
//         onSuccess: () => {
//           console.log('Posting deleted successfully', { posting_id: postingToDelete.id });
//           setIsDeleteDialogOpen(false);
//           setPostingToDelete(null);
//         },
//         onError: (errors) => {
//           console.error('Failed to delete posting', { posting_id: postingToDelete.id, errors });
//           setIsDeleteDialogOpen(false);
//           setPostingToDelete(null);
//         },
//       });
//     }
//   };

//   return (
//     <AppLayout breadcrumbs={breadcrumbs}>
//       <Head title="Manage Postings" />
//       <div className="p-6 space-y-6">
//         <Card className="shadow-md border border-gray-200 dark:border-gray-700">
//           <CardHeader>
//             <CardTitle className="text-2xl font-semibold text-gray-800 dark:text-gray-100">Manage Postings - {company.name}</CardTitle>
//           </CardHeader>
//           <CardContent className="space-y-6">
//             {showSuccess && success && (
//               <Alert className="bg-green-50 dark:bg-green-900/50 border-green-200 dark:border-green-800 animate-in fade-in slide-in-from-top-2 duration-300">
//                 <AlertCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
//                 <AlertTitle className="text-green-800 dark:text-green-200 font-semibold">Success</AlertTitle>
//                 <AlertDescription className="text-green-700 dark:text-green-300 flex justify-between items-center">
//                   {success}
//                   <Button
//                     variant="ghost"
//                     size="sm"
//                     onClick={() => setShowSuccess(false)}
//                     className="text-green-800 dark:text-green-200 hover:bg-green-100 dark:hover:bg-green-800"
//                     aria-label="Dismiss success message"
//                   >
//                     <X className="h-4 w-4" />
//                   </Button>
//                 </AlertDescription>
//               </Alert>
//             )}
//             {showError && error && (
//               <Alert className="bg-red-50 dark:bg-red-900/50 border-red-200 dark:border-red-800 animate-in fade-in slide-in-from-top-2 duration-300">
//                 <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400" />
//                 <AlertTitle className="text-red-800 dark:text-red-200 font-semibold">Error</AlertTitle>
//                 <AlertDescription className="text-red-700 dark:text-red-300 flex justify-between items-center">
//                   {error}
//                   <Button
//                     variant="ghost"
//                     size="sm"
//                     onClick={() => setShowError(false)}
//                     className="text-red-800 dark:text-red-200 hover:bg-red-100 dark:hover:bg-red-800"
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
//                 className="max-w-sm border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 transition-all"
//                 aria-label="Search postings"
//               />
//               <Select value={typeFilter} onValueChange={setTypeFilter}>
//                 <SelectTrigger className="w-40 border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 transition-all" aria-label="Filter by type">
//                   <SelectValue placeholder="Filter by type" />
//                 </SelectTrigger>
//                 <SelectContent>
//                   <SelectItem value="all">All Types</SelectItem>
//                   <SelectItem value="internship">Internship</SelectItem>
//                   <SelectItem value="career">Career</SelectItem>
//                 </SelectContent>
//               </Select>
//               <Select value={statusFilter} onValueChange={setStatusFilter}>
//                 <SelectTrigger className="w-40 border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 transition-all" aria-label="Filter by status">
//                   <SelectValue placeholder="Filter by status" />
//                 </SelectTrigger>
//                 <SelectContent>
//                   <SelectItem value="all">All Statuses</SelectItem>
//                   <SelectItem value="open">Open</SelectItem>
//                   <SelectItem value="closed">Closed</SelectItem>
//                   <SelectItem value="draft">Draft</SelectItem>
//                 </SelectContent>
//               </Select>
//               <Input
//                 placeholder="Min GPA..."
//                 type="number"
//                 step="0.01"
//                 min="0"
//                 max="4"
//                 value={minGpaFilter}
//                 onChange={(e) => setMinGpaFilter(e.target.value)}
//                 className="w-40 border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 transition-all"
//                 aria-label="Filter by minimum GPA"
//               />
//               <Button
//                 asChild
//                 className="bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white transition-colors duration-200"
//               >
//                 <Link href="/company-admin/postings/create" aria-label="Create posting">
//                   Create Posting
//                 </Link>
//               </Button>
//               <Button
//                 asChild
//                 variant="outline"
//                 className="border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 hover:bg-blue-50 dark:hover:bg-blue-900 hover:text-blue-700 dark:hover:text-blue-300 transition-colors duration-200"
//               >
//                 <Link href="/company-admin/postingstrashed" aria-label="View trashed postings">
//                   View Trashed
//                 </Link>
//               </Button>
//               <Button
//                 asChild
//                 variant="outline"
//                 className="border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 hover:bg-blue-50 dark:hover:bg-blue-900 hover:text-blue-700 dark:hover:text-blue-300 transition-colors duration-200"
//               >
//                 <Link href="/company-admin" aria-label="Back to dashboard">
//                   Back to Dashboard
//                 </Link>
//               </Button>
//             </div>
//             <Separator className="bg-gray-200 dark:bg-gray-600" />
//             {postings.data.length > 0 ? (
//               <>
//                 <Table>
//                   <TableHeader>
//                     <TableRow className="hover:bg-gray-50 dark:hover:bg-gray-800">
//                       <TableHead className="cursor-pointer font-semibold" onClick={() => handleSort('title')}>
//                         Title {filters.sort_by === 'title' && (filters.sort_dir === 'asc' ? '↑' : '↓')}
//                       </TableHead>
//                       <TableHead className="cursor-pointer font-semibold" onClick={() => handleSort('type')}>
//                         Type {filters.sort_by === 'type' && (filters.sort_dir === 'asc' ? '↑' : '↓')}
//                       </TableHead>
//                       <TableHead className="cursor-pointer font-semibold" onClick={() => handleSort('status')}>
//                         Status {filters.sort_by === 'status' && (filters.sort_dir === 'asc' ? '↑' : '↓')}
//                       </TableHead>
//                       <TableHead className="font-semibold">Industry</TableHead>
//                       <TableHead className="font-semibold">Location</TableHead>
//                       <TableHead className="font-semibold">Min GPA</TableHead>
//                       <TableHead className="font-semibold">Skills</TableHead>
//                       <TableHead className="font-semibold">Experience Level</TableHead>
//                       <TableHead className="font-semibold">Work Type</TableHead>
//                       <TableHead className="font-semibold">Benefits</TableHead>
//                       <TableHead className="font-semibold">Supervisor</TableHead>
//                       <TableHead className="cursor-pointer font-semibold" onClick={() => handleSort('application_deadline')}>
//                         Deadline {filters.sort_by === 'application_deadline' && (filters.sort_dir === 'asc' ? '↑' : '↓')}
//                       </TableHead>
//                       <TableHead className="font-semibold">Actions</TableHead>
//                     </TableRow>
//                   </TableHeader>
//                   <TableBody>
//                     {postings.data.map((posting) => (
//                       <TableRow key={posting.posting_id} className="hover:bg-gray-50 dark:hover:bg-gray-800">
//                         <TableCell className="font-medium">{posting.title}</TableCell>
//                         <TableCell className="capitalize">{posting.type}</TableCell>
//                         <TableCell>
//                           <Badge
//                             variant={posting.status === 'open' ? 'default' : posting.status === 'closed' ? 'destructive' : 'secondary'}
//                             className="capitalize"
//                           >
//                             {posting.status}
//                           </Badge>
//                         </TableCell>
//                         <TableCell>{posting.industry}</TableCell>
//                         <TableCell>{posting.location}</TableCell>
//                         <TableCell>{posting.min_gpa || 'N/A'}</TableCell>
//                         <TableCell>{posting.skills_required.join(', ') || 'N/A'}</TableCell>
//                         <TableCell className="capitalize">{posting.experience_level || 'N/A'}</TableCell>
//                         <TableCell className="capitalize">{posting.work_type || 'N/A'}</TableCell>
//                         <TableCell>{posting.benefits || 'N/A'}</TableCell>
//                         <TableCell>{posting.supervisor_name}</TableCell>
//                         <TableCell>{posting.application_deadline}</TableCell>
//                         <TableCell>
//                           <div className="flex gap-2">
//                             <TooltipProvider>
//                               <Tooltip>
//                                 <TooltipTrigger asChild>
//                                   <Button
//                                     variant="outline"
//                                     size="sm"
//                                     asChild
//                                     className="border-blue-500 text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900 hover:text-blue-800 dark:hover:text-blue-300 transition-colors duration-200"
//                                   >
//                                     <Link href={`/company-admin/postings/${posting.posting_id}`} aria-label={`View posting ${posting.title}`}>
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
//                                     className="border-blue-500 text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900 hover:text-blue-800 dark:hover:text-blue-300 transition-colors duration-200"
//                                   >
//                                     <Link href={`/company-admin/postings/${posting.posting_id}/edit`} aria-label={`Edit posting ${posting.title}`}>
//                                       <Edit className="h-4 w-4" />
//                                     </Link>
//                                   </Button>
//                                 </TooltipTrigger>
//                                 <TooltipContent>Edit</TooltipContent>
//                               </Tooltip>
//                               <Tooltip>
//                                 <TooltipTrigger asChild>
//                                   <Button
//                                     variant="destructive"
//                                     size="sm"
//                                     onClick={() => handleDeleteClick(posting.posting_id, posting.title)}
//                                     className="border-red-500 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900 hover:text-red-800 dark:hover:text-red-300 transition-colors duration-200"
//                                     aria-label={`Delete posting ${posting.title}`}
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
//                 <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
//                   <DialogContent>
//                     <DialogHeader>
//                       <DialogTitle>Confirm Deletion</DialogTitle>
//                       <DialogDescription>
//                         Are you sure you want to delete the posting "{postingToDelete?.title}"? This action will move the posting to the trash.
//                       </DialogDescription>
//                     </DialogHeader>
//                     <DialogFooter>
//                       <Button
//                         variant="outline"
//                         onClick={() => setIsDeleteDialogOpen(false)}
//                         aria-label="Cancel deletion"
//                       >
//                         Cancel
//                       </Button>
//                       <Button
//                         variant="destructive"
//                         onClick={handleDeleteConfirm}
//                         aria-label="Confirm deletion"
//                       >
//                         Delete
//                       </Button>
//                     </DialogFooter>
//                   </DialogContent>
//                 </Dialog>
//                 <Pagination>
//                   <PaginationContent>
//                     <PaginationItem>
//                       <PaginationPrevious
//                         href={postings.prev_page_url || '#'}
//                         className={`border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 hover:bg-blue-50 dark:hover:bg-blue-900 hover:text-blue-700 dark:hover:text-blue-300 transition-colors duration-200 ${!postings.prev_page_url ? 'pointer-events-none opacity-50' : ''}`}
//                         aria-label="Previous page"
//                       />
//                     </PaginationItem>
//                     {[...Array(postings.last_page)].map((_, i) => (
//                       <PaginationItem key={i}>
//                         <PaginationLink
//                           href={`/company-admin/postings?page=${i + 1}&search=${encodeURIComponent(searchTerm)}&type=${typeFilter}&status=${statusFilter}&min_gpa=${minGpaFilter}&sort_by=${filters.sort_by}&sort_dir=${filters.sort_dir}`}
//                           isActive={postings.current_page === i + 1}
//                           className="border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 hover:bg-blue-50 dark:hover:bg-blue-900 hover:text-blue-700 dark:hover:text-blue-300 transition-colors duration-200"
//                           aria-label={`Page ${i + 1}`}
//                         >
//                           {i + 1}
//                         </PaginationLink>
//                       </PaginationItem>
//                     ))}
//                     <PaginationItem>
//                       <PaginationNext
//                         href={postings.next_page_url || '#'}
//                         className={`border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 hover:bg-blue-50 dark:hover:bg-blue-900 hover:text-blue-700 dark:hover:text-blue-300 transition-colors duration-200 ${!postings.next_page_url ? 'pointer-events-none opacity-50' : ''}`}
//                         aria-label="Next page"
//                       />
//                     </PaginationItem>
//                   </PaginationContent>
//                 </Pagination>
//               </>
//             ) : (
//               <p className="text-sm text-gray-500 dark:text-gray-400 text-center">No postings found.</p>
//             )}
//           </CardContent>
//         </Card>
//       </div>
//     </AppLayout>
//   );
// }


