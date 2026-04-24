import React from 'react';
import { Head } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Alert } from '@/components/ui/alert';
import { Pagination, PaginationContent, PaginationItem, PaginationNext, PaginationPrevious } from '@/components/ui/pagination';
import { Users, FileText, CheckCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface Application {
  application_id: number;
  posting_title: string;
  posting_type: string;
  status: string;
  submitted_at: string;
}

interface Student {
  student_id: number;
  name: string;
  university_id?: string | null;
  gender?: 'male' | 'female';
  cgpa: number | null;
  year_of_study: string | null;
  accepted_applications: number;
  has_completed_application: boolean;
  applications: Application[];
}

interface Props {
  students: {
    data: Student[];
    prev_page_url: string | null;
    next_page_url: string | null;
  };
  filters: {
    search?: string;
    sort_by?: string;
    sort_dir?: string;
  };
  success?: string;
  error?: string;
}

export default function FacultyAdvisorStudents({ students, filters, success, error }: Props) {
    return (
        <AppLayout>
            <Head title="Monitor Students" />

            <div className="space-y-6">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Monitor Students</h1>
                    <p className="text-gray-600 dark:text-gray-400 mt-2">
                        View and monitor your assigned students with their applications in detail
                    </p>
                </div>

                {success && (
                    <Alert className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
                        <p className="text-green-800 dark:text-green-200">{success}</p>
                    </Alert>
                )}

                {error && (
                    <Alert className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
                        <p className="text-red-800 dark:text-red-200">{error}</p>
                    </Alert>
                )}

                <div className="flex flex-wrap gap-4 items-center mb-6">
                    <Input
                        placeholder="Search by name..."
                        defaultValue={filters.search}
                        className="max-w-sm"
                    />
                </div>

                {students.data.length === 0 ? (
                    <Card>
                        <CardContent className="text-center py-8 text-gray-500">
                            No students assigned yet
                        </CardContent>
                    </Card>
                ) : (
                    <div className="space-y-6">
                        {students.data.map((student) => (
                            <Card key={student.student_id}>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Users className="h-5 w-5 text-blue-500" />
                                        <div className="flex items-center gap-2">
                                          <span>{student.name}</span>
                                          {student.gender && (
                                            <span className="text-xs text-gray-500 dark:text-gray-400 capitalize font-normal">({student.gender})</span>
                                          )}
                                          {student.has_completed_application && (
                                            <Badge className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-200 flex items-center gap-1">
                                              <CheckCircle className="h-3 w-3" />
                                              Completed Application
                                            </Badge>
                                          )}
                                        </div>
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                                        <div>
                                            <span className="font-medium text-gray-900 dark:text-white">CGPA:</span>
                                            <span className="ml-2 text-gray-600 dark:text-gray-400">{student.cgpa?.toFixed(2) || 'N/A'}</span>
                                        </div>
                                        <div>
                                            <span className="font-medium text-gray-900 dark:text-white">Year of Study:</span>
                                            <span className="ml-2 text-gray-600 dark:text-gray-400">{student.year_of_study || 'N/A'}</span>
                                        </div>
                                        <div>
                                            <span className="font-medium text-gray-900 dark:text-white">University ID:</span>
                                            <span className="ml-2 text-gray-600 dark:text-gray-400">{student.university_id || 'N/A'}</span>
                                        </div>
                                        <div>
                                            <span className="font-medium text-gray-900 dark:text-white">Accepted Applications:</span>
                                            <span className="ml-2 text-gray-600 dark:text-gray-400">{student.accepted_applications}</span>
                                        </div>
                                    </div>

                                    {student.applications.length > 0 ? (
                                        <div>
                                            <h4 className="font-medium text-gray-900 dark:text-white mb-2">Accepted Applications</h4>
                                            <div className="space-y-2">
                                                {student.applications.map((app) => (
                                                    <div key={app.application_id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                                                        <div className="flex items-center gap-2">
                                                            <FileText className="h-4 w-4 text-gray-500" />
                                                            <div>
                                                                <div className="font-medium text-gray-900 dark:text-white">{app.posting_title}</div>
                                                                <div className="text-sm text-gray-500 dark:text-gray-400">Type: {app.posting_type}</div>
                                                            </div>
                                                        </div>
                                                        <div className="text-sm text-gray-500 dark:text-gray-400">
                                                            Submitted: {new Date(app.submitted_at).toLocaleDateString()}
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="text-sm text-gray-500 dark:text-gray-400">
                                            No accepted applications yet
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}

                <Pagination>
                    <PaginationContent>
                        <PaginationItem>
                            <PaginationPrevious
                                href={students.prev_page_url || '#'}
                                className={!students.prev_page_url ? 'pointer-events-none opacity-50' : ''}
                            />
                        </PaginationItem>
                        <PaginationItem>
                            <PaginationNext
                                href={students.next_page_url || '#'}
                                className={!students.next_page_url ? 'pointer-events-none opacity-50' : ''}
                            />
                        </PaginationItem>
                    </PaginationContent>
                </Pagination>
            </div>
        </AppLayout>
    );
}
// import { Head, Link, router } from '@inertiajs/react';
// import AppLayout from '@/layouts/app-layout';
// import { Button } from '@/components/ui/button';
// import { Input } from '@/components/ui/input';
// import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
// import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
// import { Badge } from '@/components/ui/badge';
// import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
// import { Search, ArrowUpDown, User, GraduationCap } from 'lucide-react';
// import { useState } from 'react';

// interface Student {
//   student_id: string;
//   name: string;
//   cgpa: number;
//   year_of_study: number;
//   accepted_applications: number;
// }

// interface PaginationLink {
//   url: string | null;
//   label: string;
//   active: boolean;
// }

// interface PaginationMeta {
//   from: number;
//   to: number;
//   total: number;
//   current_page: number;
//   last_page: number;
// }

// interface FacultyAdvisorStudentsProps {
//   students: {
//     data: Student[];
//     links: PaginationLink[];
//     meta: PaginationMeta;
//   };
//   filters: {
//     search?: string;
//     sort_by?: string;
//     sort_dir?: string;
//   };
//   success?: string;
//   error?: string;
// }

// export default function FacultyAdvisorStudents({
//   students,
//   filters,
//   success,
//   error,
// }: FacultyAdvisorStudentsProps) {
//   const [search, setSearch] = useState(filters.search || '');
//   const [sortBy, setSortBy] = useState(filters.sort_by || 'name');
//   const [sortDir, setSortDir] = useState(filters.sort_dir || 'asc');

//   const handleSearch = (value: string) => {
//     setSearch(value);
//     router.get('/faculty-advisor/students', {
//       search: value,
//       sort_by: sortBy,
//       sort_dir: sortDir,
//     }, {
//       preserveState: true,
//       replace: true,
//     });
//   };

//   const handleSort = (field: string) => {
//     const newSortDir = sortBy === field && sortDir === 'asc' ? 'desc' : 'asc';
//     setSortBy(field);
//     setSortDir(newSortDir);
//     router.get('/faculty-advisor/students', {
//       search,
//       sort_by: field,
//       sort_dir: newSortDir,
//     }, {
//       preserveState: true,
//       replace: true,
//     });
//   };

//   const getYearBadgeColor = (year: number) => {
//     switch (year) {
//       case 1: return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300';
//       case 2: return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300';
//       case 3: return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300';
//       case 4: return 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-300';
//       default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-300';
//     }
//   };

//   return (
//     <AppLayout>
//       <Head title="Assigned Students" />
      
//       <div className="space-y-6">
//         <div className="flex justify-between items-center">
//           <div>
//             <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Assigned Students</h1>
//             <p className="text-gray-600 dark:text-gray-400 mt-2">
//               Manage and monitor your assigned students
//             </p>
//           </div>
//         </div>

//         {success && (
//           <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
//             <p className="text-green-800 dark:text-green-200">{success}</p>
//           </div>
//         )}

//         {error && (
//           <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
//             <p className="text-red-800 dark:text-red-200">{error}</p>
//           </div>
//         )}

//         <Card>
//           <CardHeader>
//             <CardTitle>Student List</CardTitle>
//             <CardDescription>
//               View and manage all students assigned to you
//             </CardDescription>
//           </CardHeader>
//           <CardContent>
//             <div className="flex flex-col sm:flex-row gap-4 mb-6">
//               <div className="relative flex-1">
//                 <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
//                 <Input
//                   placeholder="Search students..."
//                   value={search}
//                   onChange={(e) => handleSearch(e.target.value)}
//                   className="pl-10"
//                 />
//               </div>
//               <div className="flex gap-2">
//                 <Select value={sortBy} onValueChange={setSortBy}>
//                   <SelectTrigger className="w-[180px]">
//                     <SelectValue placeholder="Sort by" />
//                   </SelectTrigger>
//                   <SelectContent>
//                     <SelectItem value="name">Name</SelectItem>
//                     <SelectItem value="cgpa">CGPA</SelectItem>
//                     <SelectItem value="year_of_study">Year of Study</SelectItem>
//                     <SelectItem value="accepted_applications">Applications</SelectItem>
//                   </SelectContent>
//                 </Select>
//                 <Button
//                   variant="outline"
//                   size="icon"
//                   onClick={() => handleSort(sortBy)}
//                 >
//                   <ArrowUpDown className="h-4 w-4" />
//                 </Button>
//               </div>
//             </div>

//             <div className="rounded-md border">
//               <Table>
//                 <TableHeader>
//                   <TableRow>
//                     <TableHead className="cursor-pointer" onClick={() => handleSort('name')}>
//                       <div className="flex items-center gap-2">
//                         Student Name
//                         <ArrowUpDown className="h-4 w-4" />
//                       </div>
//                     </TableHead>
//                     <TableHead className="cursor-pointer" onClick={() => handleSort('cgpa')}>
//                       <div className="flex items-center gap-2">
//                         CGPA
//                         <ArrowUpDown className="h-4 w-4" />
//                       </div>
//                     </TableHead>
//                     <TableHead className="cursor-pointer" onClick={() => handleSort('year_of_study')}>
//                       <div className="flex items-center gap-2">
//                         Year
//                         <ArrowUpDown className="h-4 w-4" />
//                       </div>
//                     </TableHead>
//                     <TableHead className="cursor-pointer" onClick={() => handleSort('accepted_applications')}>
//                       <div className="flex items-center gap-2">
//                         Applications
//                         <ArrowUpDown className="h-4 w-4" />
//                       </div>
//                     </TableHead>
//                     <TableHead>Actions</TableHead>
//                   </TableRow>
//                 </TableHeader>
//                 <TableBody>
//                   {students.data.length === 0 ? (
//                     <TableRow>
//                       <TableCell colSpan={5} className="text-center py-8 text-gray-500">
//                         No students found
//                       </TableCell>
//                     </TableRow>
//                   ) : (
//                     students.data.map((student) => (
//                       <TableRow key={student.student_id}>
//                         <TableCell>
//                           <div className="flex items-center gap-3">
//                             <div className="p-2 rounded-full bg-blue-100 dark:bg-blue-900/20">
//                               <User className="h-4 w-4 text-blue-600 dark:text-blue-400" />
//                             </div>
//                             <div>
//                               <div className="font-medium text-gray-900 dark:text-white">
//                                 {student.name}
//                               </div>
//                               <div className="text-sm text-gray-500 dark:text-gray-400">
//                                 ID: {student.student_id}
//                               </div>
//                             </div>
//                           </div>
//                         </TableCell>
//                         <TableCell>
//                           <Badge variant="secondary" className="font-mono">
//                             {student.cgpa.toFixed(2)}
//                           </Badge>
//                         </TableCell>
//                         <TableCell>
//                           <Badge className={getYearBadgeColor(student.year_of_study)}>
//                             Year {student.year_of_study}
//                           </Badge>
//                         </TableCell>
//                         <TableCell>
//                           <div className="flex items-center gap-1">
//                             <GraduationCap className="h-4 w-4 text-green-500" />
//                             <span className="font-medium">{student.accepted_applications}</span>
//                           </div>
//                         </TableCell>
//                         <TableCell>
//                           <div className="flex gap-2">
//                             <Button variant="outline" size="sm" asChild>
//                               <Link href={`/faculty-advisor/students/${student.student_id}`}>
//                                 View Details
//                               </Link>
//                             </Button>
//                           </div>
//                         </TableCell>
//                       </TableRow>
//                     ))
//                   )}
//                 </TableBody>
//               </Table>
//             </div>

//             {students.data.length > 0 && (
//               <div className="flex items-center justify-between mt-4">
//                 <div className="text-sm text-gray-500 dark:text-gray-400">
//                   Showing {students.meta.from} to {students.meta.to} of {students.meta.total} students
//                 </div>
//                 <div className="flex gap-2">
//                   {students.links.map((link, index) => (
//                     <Button
//                       key={index}
//                       variant={link.active ? "default" : "outline"}
//                       size="sm"
//                       disabled={!link.url}
//                       onClick={() => link.url && router.get(link.url)}
//                     >
//                       {link.label}
//                     </Button>
//                   ))}
//                 </div>
//               </div>
//             )}
//           </CardContent>
//         </Card>
//       </div>
//     </AppLayout>
//   );
// }
