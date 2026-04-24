import React, { useState, useEffect } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { X, RefreshCw, ArrowUp, ArrowDown, ChevronLeft, ChevronRight, Trash2 } from 'lucide-react';

interface Department {
  department_id: number;
  name: string;
}

interface TrashedUser {
  user_id: number;
  name: string;
  role: string;
  email: string;
  phone: string | null;
  gender?: 'male' | 'female';
  deleted_at: string | null;
}

interface Props {
  department: Department;
  trashedUsers: TrashedUser[];
  success?: string;
  error?: string;
}

const breadcrumbs = [
  { title: 'Dashboard', href: '/department-head' },
  { title: 'Trashed Users', href: '/department-head/trashed' },
];

const TrashedUsers: React.FC<Props> = ({ department, trashedUsers, success, error }) => {
  const [showSuccess, setShowSuccess] = useState(!!success);
  const [showError, setShowError] = useState(!!error);
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [search, setSearch] = useState<string>('');
  const [sortColumn, setSortColumn] = useState<keyof TrashedUser | null>(null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [page, setPage] = useState<number>(1);
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

  // Filter, search, and sort trashed users
  const filteredAndSortedUsers = React.useMemo(() => {
    let filtered = [...trashedUsers];

    // Apply role filter
    if (roleFilter !== 'all') {
      filtered = filtered.filter((user) => user.role.toLowerCase() === roleFilter);
    }

    // Apply search
    if (search) {
      filtered = filtered.filter(
        (user) =>
          user.name.toLowerCase().includes(search.toLowerCase()) ||
          user.email.toLowerCase().includes(search.toLowerCase())
      );
    }

    // Apply sorting
    if (sortColumn) {
      filtered.sort((a, b) => {
        const aValue = a[sortColumn] || '';
        const bValue = b[sortColumn] || '';
        if (sortColumn === 'deleted_at') {
          const aDate = aValue ? new Date(aValue).getTime() : 0;
          const bDate = bValue ? new Date(bValue).getTime() : 0;
          return sortDirection === 'asc' ? aDate - bDate : bDate - aDate;
        }
        return sortDirection === 'asc'
          ? aValue.toString().localeCompare(bValue.toString())
          : bValue.toString().localeCompare(aValue.toString());
      });
    }

    return filtered;
  }, [trashedUsers, roleFilter, search, sortColumn, sortDirection]);

  // Pagination
  const totalPages = Math.ceil(filteredAndSortedUsers.length / itemsPerPage);
  const paginatedUsers = filteredAndSortedUsers.slice(
    (page - 1) * itemsPerPage,
    page * itemsPerPage
  );

  const handleRestore = (user_id: number, user_name: string) => {
    router.post(route('department-head.restore', user_id), {}, {
      onSuccess: () => {
        console.log(`User ${user_name} restored successfully`);
        setShowSuccess(true);
      },
      onError: (errors) => {
        console.error('Failed to restore user:', errors);
        setShowError(true);
      },
    });
  };

  const handleDeletePermanently = (user_id: number, user_name: string) => {
    router.delete(`/department-head/trashed/${user_id}/delete-permanently`, {
      onSuccess: () => {
        console.log(`User ${user_name} deleted permanently`);
        setShowSuccess(true);
      },
      onError: (errors) => {
        console.error('Failed to delete user permanently:', errors);
        setShowError(true);
      },
    });
  };

  const handleSort = (column: keyof TrashedUser) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortColumn(column);
      setSortDirection('asc');
    }
  };

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title="Trashed Users" />
      <div className="flex h-full flex-1 flex-col gap-6 rounded-xl p-6">
        <div className="rounded-2xl p-6 bg-gradient-to-r from-indigo-500 to-blue-600 dark:from-indigo-700 dark:to-blue-800 text-white shadow-lg">
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Trashed Users</h1>
          <p className="text-white/90 mt-1">Department: {department.name}</p>
        </div>
        <div className="flex justify-between items-center">
          <div className="flex gap-4">
            <Input
              placeholder="Search by name or email"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-48"
            />
            <Select value={roleFilter} onValueChange={setRoleFilter}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Filter by role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Roles</SelectItem>
                <SelectItem value="student">Student</SelectItem>
                <SelectItem value="advisor">Advisor</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        {showSuccess && success && (
          <div className="bg-green-100 dark:bg-green-800 text-green-800 dark:text-green-100 p-4 rounded-xl flex justify-between items-center">
            <span>{success}</span>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowSuccess(false)}
              className="text-green-800 dark:text-green-100 hover:bg-green-200 dark:hover:bg-green-700"
              aria-label="Close success alert"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        )}
        {showError && error && (
          <div className="bg-red-100 dark:bg-red-800 text-red-800 dark:text-red-100 p-4 rounded-xl flex justify-between items-center">
            <span>{error}</span>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowError(false)}
              className="text-red-800 dark:text-red-100 hover:bg-red-200 dark:hover:bg-red-700"
              aria-label="Close error alert"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        )}
        {paginatedUsers.length > 0 ? (
          <>
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="bg-indigo-50 dark:bg-indigo-900/30">
                    <TableHead className="cursor-pointer text-indigo-700 dark:text-indigo-300" onClick={() => handleSort('name')}>
                      Name
                      {sortColumn === 'name' && (
                        sortDirection === 'asc' ? <ArrowUp className="inline ml-1 h-4 w-4" /> : <ArrowDown className="inline ml-1 h-4 w-4" />
                      )}
                    </TableHead>
                    <TableHead className="cursor-pointer text-indigo-700 dark:text-indigo-300" onClick={() => handleSort('role')}>
                      Role
                      {sortColumn === 'role' && (
                        sortDirection === 'asc' ? <ArrowUp className="inline ml-1 h-4 w-4" /> : <ArrowDown className="inline ml-1 h-4 w-4" />
                      )}
                    </TableHead>
                    <TableHead className="cursor-pointer text-indigo-700 dark:text-indigo-300" onClick={() => handleSort('email')}>
                      Email
                      {sortColumn === 'email' && (
                        sortDirection === 'asc' ? <ArrowUp className="inline ml-1 h-4 w-4" /> : <ArrowDown className="inline ml-1 h-4 w-4" />
                      )}
                    </TableHead>
                    <TableHead className="text-indigo-700 dark:text-indigo-300">Phone</TableHead>
                    <TableHead className="text-indigo-700 dark:text-indigo-300">Gender</TableHead>
                    <TableHead className="cursor-pointer text-indigo-700 dark:text-indigo-300" onClick={() => handleSort('deleted_at')}>
                      Deleted At
                      {sortColumn === 'deleted_at' && (
                        sortDirection === 'asc' ? <ArrowUp className="inline ml-1 h-4 w-4" /> : <ArrowDown className="inline ml-1 h-4 w-4" />
                      )}
                    </TableHead>
                    <TableHead className="text-indigo-700 dark:text-indigo-300">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedUsers.map((user, index) => (
                    <TableRow
                      key={user.user_id}
                      className={`transition-colors duration-200 ${index % 2 === 0 ? 'bg-white dark:bg-gray-900' : 'bg-gray-50 dark:bg-gray-800'} hover:bg-indigo-50 dark:hover:bg-indigo-900/30`}
                    >
                      <TableCell className="text-gray-900 dark:text-gray-100">
                        <div>
                          <div className="font-medium">{user.name}</div>
                          {user.gender && (
                            <div className="text-xs text-gray-500 dark:text-gray-400 capitalize">({user.gender})</div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge 
                          variant={user.role === 'student' ? 'default' : 'secondary'}
                          className={user.role === 'student' 
                            ? 'bg-blue-100 text-blue-700 dark:bg-blue-800 dark:text-blue-200' 
                            : 'bg-purple-100 text-purple-700 dark:bg-purple-800 dark:text-purple-200'
                          }
                        >
                          {user.role}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-gray-900 dark:text-gray-100">{user.email}</TableCell>
                      <TableCell className="text-gray-900 dark:text-gray-100">{user.phone || 'N/A'}</TableCell>
                      <TableCell className="text-gray-900 dark:text-gray-100">{user.gender ? user.gender.charAt(0).toUpperCase() + user.gender.slice(1) : 'N/A'}</TableCell>
                      <TableCell className="text-gray-900 dark:text-gray-100">{user.deleted_at ? new Date(user.deleted_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : 'N/A'}</TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="text-green-600 dark:text-green-400 hover:text-green-800 dark:hover:text-green-300 hover:bg-green-100 dark:hover:bg-green-900/50"
                                aria-label="Restore user"
                              >
                                <RefreshCw className="h-4 w-4" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent className="bg-white dark:bg-gray-900">
                              <AlertDialogHeader>
                                <AlertDialogTitle className="text-gray-900 dark:text-gray-100">Restore User</AlertDialogTitle>
                                <AlertDialogDescription className="text-gray-700 dark:text-gray-300">
                                  This will restore {user.name} ({user.role}) to active status.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel className="bg-white dark:bg-gray-900">Cancel</AlertDialogCancel>
                                <AlertDialogAction 
                                  onClick={() => handleRestore(user.user_id, user.name)}
                                  className="bg-green-600 hover:bg-green-700 text-white"
                                >
                                  Restore
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300 hover:bg-red-100 dark:hover:bg-red-900/50"
                                aria-label="Delete permanently"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent className="bg-white dark:bg-gray-900">
                              <AlertDialogHeader>
                                <AlertDialogTitle className="text-red-600 dark:text-red-400">Delete Permanently</AlertDialogTitle>
                                <AlertDialogDescription className="text-gray-700 dark:text-gray-300">
                                  This action cannot be undone. This will permanently delete {user.name} ({user.role}) and all associated data from the system.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel className="bg-white dark:bg-gray-900">Cancel</AlertDialogCancel>
                                <AlertDialogAction 
                                  onClick={() => handleDeletePermanently(user.user_id, user.name)}
                                  className="bg-red-600 hover:bg-red-700 text-white"
                                >
                                  Delete Permanently
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
            <div className="flex justify-between items-center mt-4">
              <Button
                variant="outline"
                disabled={page === 1}
                onClick={() => setPage((prev) => prev - 1)}
              >
                <ChevronLeft className="h-4 w-4" /> Previous
              </Button>
              <span>
                Page {page} of {totalPages}
              </span>
              <Button
                variant="outline"
                disabled={page === totalPages}
                onClick={() => setPage((prev) => prev + 1)}
              >
                Next <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </>
        ) : (
          <p className="text-sm text-gray-500">No trashed users found.</p>
        )}
        <Button asChild variant="outline">
          <Link href="/department-head">Back to Dashboard</Link>
        </Button>
      </div>
    </AppLayout>
  );
};

export default TrashedUsers;