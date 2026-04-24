import React, { useState, useEffect } from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogTrigger, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Separator } from '@/components/ui/separator';
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from '@/components/ui/pagination';
import { RotateCcw, X, AlertCircle } from 'lucide-react';
import { type BreadcrumbItem } from '@/types';

interface Company {
  company_id: number;
  name: string;
}

interface TrashedSupervisor {
  user_id: number;
  name: string;
  email: string;
  status: string;
  deleted_at?: string;
}

interface PaginationData {
  current_page: number;
  last_page: number;
  data: TrashedSupervisor[];
}

interface Props {
  company: Company;
  trashedSupervisors: PaginationData;
  success?: string;
  error?: string;
}

const breadcrumbs: BreadcrumbItem[] = [
  { title: 'Dashboard', href: '/company-admin' },
  { title: 'Trashed Supervisors', href: '/company-admin/supervisorstrashed' },
];

export default function SupervisorsTrashed({ company, trashedSupervisors, success: initialSuccess, error: initialError }: Props) {
  const [showSuccess, setShowSuccess] = useState(!!initialSuccess);
  const [showError, setShowError] = useState(!!initialError);
  const [restoreId, setRestoreId] = useState<number | null>(null);
  const [restoreName, setRestoreName] = useState<string | null>(null);
  const { post, processing } = useForm();

  useEffect(() => {
    if (initialSuccess) {
      setShowSuccess(true);
      const timer = setTimeout(() => setShowSuccess(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [initialSuccess]);

  useEffect(() => {
    if (initialError) {
      setShowError(true);
      const timer = setTimeout(() => setShowError(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [initialError]);

  const handleRestore = (user_id: number) => {
    post(`/company-admin/supervisorsrestore/${user_id}`, {
      onSuccess: () => {
        setRestoreId(null);
        setRestoreName(null);
      },
      onError: () => setShowError(true),
    });
  };

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title="Trashed Supervisors" />
      <div className="p-6 space-y-6">
        <Card className="shadow-lg border-none bg-white dark:bg-gray-800 rounded-2xl overflow-hidden transition-all duration-300 hover:shadow-xl">
          <CardHeader className="bg-gradient-to-r from-indigo-500 to-blue-600 dark:from-indigo-700 dark:to-blue-800 p-6 rounded-t-2xl transform transition-transform duration-300 hover:scale-[1.01]">
            <CardTitle className="text-2xl font-bold text-white tracking-tight">
              Trashed Supervisors - {company.name}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6 space-y-6">
            {showSuccess && initialSuccess && (
              <Alert className="bg-green-100 dark:bg-green-900/30 border-green-300 dark:border-green-700 animate-in fade-in slide-in-from-top-2 duration-500">
                <AlertCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
                <AlertTitle className="text-green-800 dark:text-green-200 font-semibold">Success</AlertTitle>
                <AlertDescription className="text-green-700 dark:text-green-300 flex justify-between items-center">
                  {initialSuccess}
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
            {showError && initialError && (
              <Alert className="bg-red-100 dark:bg-red-900/30 border-red-300 dark:border-red-700 animate-in fade-in slide-in-from-top-2 duration-500">
                <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400" />
                <AlertTitle className="text-red-800 dark:text-red-200 font-semibold">Error</AlertTitle>
                <AlertDescription className="text-red-700 dark:text-red-300 flex justify-between items-center">
                  {initialError}
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
            {trashedSupervisors.data.length > 0 ? (
              <>
                <Separator className="bg-gray-200 dark:bg-gray-700" />
                <Table className="border border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-900">
                  <TableHeader className="bg-indigo-50 dark:bg-indigo-900/50">
                    <TableRow className="hover:bg-indigo-100 dark:hover:bg-indigo-900/70 transition-colors duration-200">
                      <TableHead className="font-semibold text-indigo-700 dark:text-indigo-300">Name</TableHead>
                      <TableHead className="font-semibold text-indigo-700 dark:text-indigo-300">Email</TableHead>
                      <TableHead className="font-semibold text-indigo-700 dark:text-indigo-300">Status</TableHead>
                      <TableHead className="font-semibold text-indigo-700 dark:text-indigo-300">Deleted At</TableHead>
                      <TableHead className="font-semibold text-indigo-700 dark:text-indigo-300">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {trashedSupervisors.data.map((supervisor, index) => (
                      <TableRow
                        key={supervisor.user_id}
                        className={`${
                          index % 2 === 0 ? 'bg-white dark:bg-gray-900' : 'bg-gray-50 dark:bg-gray-800'
                        } hover:bg-indigo-50 dark:hover:bg-indigo-900/30 transition-colors duration-200`}
                      >
                        <TableCell className="font-medium text-gray-900 dark:text-gray-100">{supervisor.name}</TableCell>
                        <TableCell className="text-gray-700 dark:text-gray-300">{supervisor.email}</TableCell>
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
                        <TableCell className="text-gray-700 dark:text-gray-300">
                          {supervisor.deleted_at ? new Date(supervisor.deleted_at).toLocaleString() : 'N/A'}
                        </TableCell>
                        <TableCell>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button
                                variant="outline"
                                size="sm"
                                className="border-indigo-500 text-indigo-600 dark:text-indigo-400 bg-white dark:bg-gray-900 rounded-full hover:bg-indigo-100 dark:hover:bg-indigo-900/50 hover:text-indigo-700 dark:hover:text-indigo-300 transition-all duration-300 transform hover:scale-105"
                                onClick={() => {
                                  setRestoreId(supervisor.user_id);
                                  setRestoreName(supervisor.name);
                                }}
                                aria-label={`Restore ${supervisor.name}`}
                                disabled={processing && restoreId === supervisor.user_id}
                              >
                                <RotateCcw className="h-4 w-4" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent className="rounded-2xl bg-white dark:bg-gray-800 border-none shadow-lg animate-in fade-in zoom-in-95 duration-300">
                              <div className="bg-gradient-to-r from-indigo-500 to-blue-600 dark:from-indigo-700 dark:to-blue-800 p-4 rounded-t-2xl">
                                <AlertDialogTitle className="text-white text-lg font-bold">Confirm Restoration</AlertDialogTitle>
                              </div>
                              <AlertDialogDescription className="p-4 text-gray-700 dark:text-gray-300">
                                Are you sure you want to restore "{restoreName}"?
                              </AlertDialogDescription>
                              <div className="flex justify-end gap-2 p-4">
                                <AlertDialogCancel
                                  onClick={() => {
                                    setRestoreId(null);
                                    setRestoreName(null);
                                  }}
                                  className="border-indigo-500 text-indigo-600 dark:text-indigo-400 bg-white dark:bg-gray-900 rounded-full hover:bg-indigo-100 dark:hover:bg-indigo-900/50 hover:text-indigo-700 dark:hover:text-indigo-300 transition-all duration-300 transform hover:scale-105"
                                >
                                  Cancel
                                </AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => restoreId && handleRestore(restoreId)}
                                  className="bg-gradient-to-r from-indigo-500 to-blue-600 dark:from-indigo-600 dark:to-blue-700 text-white rounded-full hover:from-indigo-600 hover:to-blue-700 dark:hover:from-indigo-700 dark:hover:to-blue-800 transition-all duration-300 transform hover:scale-105"
                                >
                                  Restore
                                </AlertDialogAction>
                              </div>
                            </AlertDialogContent>
                          </AlertDialog>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
                <Pagination className="mt-4">
                  <PaginationContent>
                    <PaginationItem>
                      <PaginationPrevious
                        href={trashedSupervisors.current_page > 1 ? `/company-admin/supervisorstrashed?page=${trashedSupervisors.current_page - 1}` : '#'}
                        className={`border-indigo-500 text-indigo-600 dark:text-indigo-400 bg-white dark:bg-gray-900 rounded-full hover:bg-indigo-100 dark:hover:bg-indigo-900/50 hover:text-indigo-700 dark:hover:text-indigo-300 transition-all duration-300 transform hover:scale-105 ${
                          trashedSupervisors.current_page === 1 ? 'pointer-events-none opacity-50' : ''
                        }`}
                        aria-label="Previous page"
                      />
                    </PaginationItem>
                    {[...Array(trashedSupervisors.last_page)].map((_, i) => (
                      <PaginationItem key={i}>
                        <PaginationLink
                          href={`/company-admin/supervisorstrashed?page=${i + 1}`}
                          isActive={trashedSupervisors.current_page === i + 1}
                          className="border-indigo-500 text-indigo-600 dark:text-indigo-400 bg-white dark:bg-gray-900 rounded-full hover:bg-indigo-100 dark:hover:bg-indigo-900/50 hover:text-indigo-700 dark:hover:text-indigo-300 transition-all duration-300 transform hover:scale-105"
                          aria-label={`Page ${i + 1}`}
                        >
                          {i + 1}
                        </PaginationLink>
                      </PaginationItem>
                    ))}
                    <PaginationItem>
                      <PaginationNext
                        href={trashedSupervisors.current_page < trashedSupervisors.last_page ? `/company-admin/supervisorstrashed?page=${trashedSupervisors.current_page + 1}` : '#'}
                        className={`border-indigo-500 text-indigo-600 dark:text-indigo-400 bg-white dark:bg-gray-900 rounded-full hover:bg-indigo-100 dark:hover:bg-indigo-900/50 hover:text-indigo-700 dark:hover:text-indigo-300 transition-all duration-300 transform hover:scale-105 ${
                          trashedSupervisors.current_page === trashedSupervisors.last_page ? 'pointer-events-none opacity-50' : ''
                        }`}
                        aria-label="Next page"
                      />
                    </PaginationItem>
                  </PaginationContent>
                </Pagination>
                <Separator className="bg-gray-200 dark:bg-gray-700" />
                <Button
                  asChild
                  variant="outline"
                  className="border-indigo-500 text-indigo-600 dark:text-indigo-400 bg-white dark:bg-gray-900 rounded-full hover:bg-indigo-100 dark:hover:bg-indigo-900/50 hover:text-indigo-700 dark:hover:text-indigo-300 transition-all duration-300 transform hover:scale-105"
                >
                  <Link href="/company-admin/supervisors" aria-label="Back to supervisors list">
                    Back to Supervisors
                  </Link>
                </Button>
              </>
            ) : (
              <p className="text-sm text-gray-500 dark:text-gray-400 text-center">No trashed supervisors found.</p>
            )}
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}

// import React, { useState, useEffect } from 'react';
// import { Head, Link, useForm } from '@inertiajs/react';
// import AppLayout from '@/layouts/app-layout';
// import { Button } from '@/components/ui/button';
// import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
// import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
// import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
// import { Badge } from '@/components/ui/badge';
// import { Separator } from '@/components/ui/separator';
// import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from '@/components/ui/pagination';
// import { RotateCcw, X } from 'lucide-react';
// import { type BreadcrumbItem } from '@/types';

// interface Company {
//   company_id: number;
//   name: string;
// }

// interface TrashedSupervisor {
//   user_id: number;
//   name: string;
//   email: string;
//   status: string;
//   deleted_at?: string;
// }

// interface PaginationData {
//   current_page: number;
//   last_page: number;
//   data: TrashedSupervisor[];
// }

// interface Props {
//   company: Company;
//   trashedSupervisors: PaginationData;
//   success?: string;
//   error?: string;
// }

// const breadcrumbs: BreadcrumbItem[] = [
//   { title: 'Dashboard', href: '/company-admin' },
//   { title: 'Trashed Supervisors', href: '/company-admin/supervisorstrashed' },
// ];

// export default function SupervisorsTrashed({ company, trashedSupervisors, success: initialSuccess, error: initialError }: Props) {
//   const [showSuccess, setShowSuccess] = useState(!!initialSuccess);
//   const [showError, setShowError] = useState(!!initialError);
//   const [restoreId, setRestoreId] = useState<number | null>(null);
//   const { post, processing } = useForm();

//   useEffect(() => {
//     if (initialSuccess) {
//       setShowSuccess(true);
//       const timer = setTimeout(() => setShowSuccess(false), 2000);
//       return () => clearTimeout(timer);
//     }
//   }, [initialSuccess]);

//   useEffect(() => {
//     if (initialError) {
//       setShowError(true);
//       const timer = setTimeout(() => setShowError(false), 2000);
//       return () => clearTimeout(timer);
//     }
//   }, [initialError]);

//   const handleRestore = (user_id: number) => {
//     post(`/company-admin/supervisorsrestore/${user_id}`, {
//       onSuccess: () => setRestoreId(null),
//       onError: () => setShowError(true),
//     });
//   };

//   return (
//     <AppLayout breadcrumbs={breadcrumbs}>
//       <Head title="Trashed Supervisors" />
//       <div className="p-6">
//         <Card className="shadow-sm">
//           <CardHeader>
//             <CardTitle className="text-2xl font-semibold">Trashed Supervisors - {company.name}</CardTitle>
//           </CardHeader>
//           <CardContent className="space-y-6">
//             {showSuccess && initialSuccess && (
//               <div className="bg-green-100 p-4 rounded-lg flex justify-between items-center">
//                 <span>{initialSuccess}</span>
//                 <Button variant="ghost" onClick={() => setShowSuccess(false)} aria-label="Close success message">
//                   <X className="h-4 w-4" />
//                 </Button>
//               </div>
//             )}
//             {showError && initialError && (
//               <div className="bg-red-100 p-4 rounded-lg flex justify-between items-center">
//                 <span>{initialError}</span>
//                 <Button variant="ghost" onClick={() => setShowError(false)} aria-label="Close error message">
//                   <X className="h-4 w-4" />
//                 </Button>
//               </div>
//             )}
//             {trashedSupervisors.data.length > 0 ? (
//               <>
//                 <Separator />
//                 <div className="border rounded-lg overflow-hidden">
//                   <Table>
//                     <TableHeader>
//                       <TableRow>
//                         <TableHead className="font-semibold">Name</TableHead>
//                         <TableHead className="font-semibold">Email</TableHead>
//                         <TableHead className="font-semibold">Status</TableHead>
//                         <TableHead className="font-semibold">Deleted At</TableHead>
//                         <TableHead className="font-semibold">Actions</TableHead>
//                       </TableRow>
//                     </TableHeader>
//                     <TableBody>
//                       {trashedSupervisors.data.map((supervisor) => (
//                         <TableRow key={supervisor.user_id}>
//                           <TableCell className="font-medium">{supervisor.name}</TableCell>
//                           <TableCell>{supervisor.email}</TableCell>
//                           <TableCell>
//                             <Badge variant={supervisor.status === 'active' ? 'default' : 'secondary'}>
//                               {supervisor.status}
//                             </Badge>
//                           </TableCell>
//                           <TableCell>{supervisor.deleted_at ? new Date(supervisor.deleted_at).toLocaleString() : 'N/A'}</TableCell>
//                           <TableCell>
//                             <AlertDialog>
//                               <AlertDialogTrigger asChild>
//                                 <Button
//                                   variant="outline"
//                                   size="sm"
//                                   onClick={() => setRestoreId(supervisor.user_id)}
//                                   aria-label={`Restore ${supervisor.name}`}
//                                   disabled={processing && restoreId === supervisor.user_id}
//                                 >
//                                   <RotateCcw className="h-4 w-4" />
//                                 </Button>
//                               </AlertDialogTrigger>
//                               <AlertDialogContent>
//                                 <AlertDialogHeader>
//                                   <AlertDialogTitle>Are you sure?</AlertDialogTitle>
//                                   <AlertDialogDescription>
//                                     This will restore {supervisor.name}.
//                                   </AlertDialogDescription>
//                                 </AlertDialogHeader>
//                                 <div className="flex justify-end gap-2">
//                                   <AlertDialogCancel onClick={() => setRestoreId(null)}>Cancel</AlertDialogCancel>
//                                   <AlertDialogAction onClick={() => handleRestore(supervisor.user_id)} disabled={processing}>Restore</AlertDialogAction>
//                                 </div>
//                               </AlertDialogContent>
//                             </AlertDialog>
//                           </TableCell>
//                         </TableRow>
//                       ))}
//                     </TableBody>
//                   </Table>
//                 </div>
//                 <Pagination>
//                   <PaginationContent>
//                     <PaginationItem>
//                       <PaginationPrevious
//                         href={trashedSupervisors.current_page > 1 ? `/company-admin/supervisorstrashed?page=${trashedSupervisors.current_page - 1}` : '#'}
//                         className={trashedSupervisors.current_page === 1 ? 'pointer-events-none opacity-50' : ''}
//                       />
//                     </PaginationItem>
//                     {[...Array(trashedSupervisors.last_page)].map((_, i) => (
//                       <PaginationItem key={i}>
//                         <PaginationLink
//                           href={`/company-admin/supervisorstrashed?page=${i + 1}`}
//                           isActive={trashedSupervisors.current_page === i + 1}
//                         >
//                           {i + 1}
//                         </PaginationLink>
//                       </PaginationItem>
//                     ))}
//                     <PaginationItem>
//                       <PaginationNext
//                         href={trashedSupervisors.current_page < trashedSupervisors.last_page ? `/company-admin/supervisorstrashed?page=${trashedSupervisors.current_page + 1}` : '#'}
//                         className={trashedSupervisors.current_page === trashedSupervisors.last_page ? 'pointer-events-none opacity-50' : ''}
//                       />
//                     </PaginationItem>
//                   </PaginationContent>
//                 </Pagination>
//                 <Separator />
//                 <Link href="/company-admin">
//                   <Button variant="outline">Back to Dashboard</Button>
//                 </Link>
//               </>
//             ) : (
//               <p className="text-sm text-gray-500">No trashed supervisors found.</p>
//             )}
//           </CardContent>
//         </Card>
//       </div>
//     </AppLayout>
//   );
// }