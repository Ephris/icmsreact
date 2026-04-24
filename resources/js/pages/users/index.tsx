import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogFooter, DialogTitle, DialogDescription, DialogTrigger } from '@/components/ui/dialog';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import AppLayout from '@/layouts/app-layout';
import { Head, Link, router, useForm, usePage } from '@inertiajs/react';
import { type PaginatedResponse, type User, type BreadcrumbItem } from '@/types';
import { Edit, Trash, X, ArrowUp, ArrowDown, Archive } from 'lucide-react';
import { useState, useEffect, useMemo } from 'react';

// Simple debounce helper to avoid extra dependency and typing issues
function debounceHelper<Args extends unknown[]>(fn: (...args: Args) => void, wait = 300) {
  let t: ReturnType<typeof setTimeout> | null = null;
  return (...args: Args) => {
    if (t) clearTimeout(t);
    t = setTimeout(() => fn(...args), wait);
  };
}

interface Props {
  users: PaginatedResponse<User>;
  filters: { search?: string; status?: string; role_filter?: string; sort_by?: string; sort_dir?: string };
}

const breadcrumbs: BreadcrumbItem[] = [
  { title: 'Dashboard', href: '/dashboard' },
  { title: 'Users', href: '/users' },
];

export default function UserIndex({ users, filters }: Props) {
  const { delete: destroy, processing } = useForm();
  const { flash } = usePage().props;
  const [showSuccess, setShowSuccess] = useState(!!flash?.success);
  const [showError, setShowError] = useState(!!flash?.error);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState(filters.search || '');
  const [statusFilter, setStatusFilter] = useState(filters.status || 'all');
  const [roleFilter, setRoleFilter] = useState(filters.role_filter || 'all');
  const [sortBy, setSortBy] = useState(filters.sort_by || 'name');
  const [sortDir, setSortDir] = useState(filters.sort_dir || 'asc');

  useEffect(() => {
    setShowSuccess(!!flash?.success);
    setShowError(!!flash?.error);
  }, [flash?.success, flash?.error]);

  const handleSort = (column: string) => {
    const newDir = sortBy === column && sortDir === 'asc' ? 'desc' : 'asc';
    setSortBy(column);
    setSortDir(newDir);
    router.get('/users', {
      search: searchTerm,
      status: statusFilter,
      role_filter: roleFilter,
      sort_by: column,
      sort_dir: newDir,
    }, { preserveState: true });
  };

  // Debounced filter application for smoother UX when typing
  // keep function stable with useMemo
  const applyFilters = (params: Record<string, string | number | undefined>) => {
    router.get('/users', params, { preserveState: true });
  };

  const debouncedApply = useMemo(() => debounceHelper((q: string, status: string, role: string, sby: string, sdir: string) => {
    applyFilters({ search: q, status, role_filter: role, sort_by: sby, sort_dir: sdir });
  }, 350), []);

  const handleFilterChange = () => {
    debouncedApply(searchTerm, statusFilter, roleFilter, sortBy, sortDir);
  };

  const handleDelete = () => {
    if (deleteId) {
      destroy(`/users/${deleteId}`, {
        onSuccess: () => {
          setDeleteId(null);
          setShowSuccess(true);
        },
        onError: () => setShowError(true),
      });
    }
  };

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title="Users" />
      <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4">
        <div className="rounded-2xl p-6 bg-gradient-to-r from-indigo-500 to-blue-600 dark:from-indigo-700 dark:to-blue-800 text-white shadow-lg flex items-center justify-between">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Users</h1>
            <p className="text-white/90 mt-1">Manage coordinators, department heads, and company admins</p>
          </div>
          <div className="flex gap-2">
            <Link href="/users/create">
              <Button aria-label="Add user" className="rounded-full bg-white/20 text-white hover:bg-white/30">Add User</Button>
            </Link>
            <Link href="/trashed">
              <Button aria-label="View trashed users" className="rounded-full bg-white/20 text-white hover:bg-white/30">
                <Archive className="h-4 w-4 mr-2" />
                View Trashed
              </Button>
            </Link>
          </div>
        </div>
        <div className="flex justify-between items-center gap-4">
          <div className="flex items-center gap-3 w-full max-w-2xl">
            <Input
              type="text"
              value={searchTerm}
              onChange={(e) => { setSearchTerm(e.target.value); debouncedApply(e.target.value, statusFilter, roleFilter, sortBy, sortDir); }}
              placeholder="Search by name, email, username, role, or status..."
              className="w-full"
              aria-label="Search users"
            />
            <Button variant="ghost" onClick={() => { setSearchTerm(''); handleFilterChange(); }} aria-label="Clear search">Clear</Button>
          </div>
          <div className="flex gap-4">
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>
            <Select value={roleFilter} onValueChange={(v) => { setRoleFilter(v); debouncedApply(searchTerm, v, statusFilter, sortBy, sortDir); }}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Roles</SelectItem>
                <SelectItem value="coordinator">Coordinator</SelectItem>
                <SelectItem value="dept_head">Dept Head</SelectItem>
                <SelectItem value="company_admin">Company Admin</SelectItem>
              </SelectContent>
            </Select>
            <Button onClick={handleFilterChange}>Apply Filters</Button>
          </div>
        </div>
        {showSuccess && flash?.success && (
          <div className="bg-green-100 dark:bg-green-800 text-green-800 dark:text-green-100 p-4 rounded-xl flex justify-between items-center">
            <span>{flash.success}</span>
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
        {showError && flash?.error && (
          <div className="bg-red-100 dark:bg-red-800 text-red-800 dark:text-red-100 p-4 rounded-xl flex justify-between items-center">
            <span>{flash.error}</span>
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
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead onClick={() => handleSort('name')} className="cursor-pointer">
                Name / Email {sortBy === 'name' && (sortDir === 'asc' ? <ArrowUp className="inline h-4 w-4" /> : <ArrowDown className="inline h-4 w-4" />)}
              </TableHead>
              <TableHead onClick={() => handleSort('username')} className="cursor-pointer">
                Username {sortBy === 'username' && (sortDir === 'asc' ? <ArrowUp className="inline h-4 w-4" /> : <ArrowDown className="inline h-4 w-4" />)}
              </TableHead>
              <TableHead onClick={() => handleSort('role')} className="cursor-pointer">
                Role {sortBy === 'role' && (sortDir === 'asc' ? <ArrowUp className="inline h-4 w-4" /> : <ArrowDown className="inline h-4 w-4" />)}
              </TableHead>
              <TableHead onClick={() => handleSort('status')} className="cursor-pointer">
                Status {sortBy === 'status' && (sortDir === 'asc' ? <ArrowUp className="inline h-4 w-4" /> : <ArrowDown className="inline h-4 w-4" />)}
              </TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.data.length > 0 ? (
              users.data.map((user) => (
                <TableRow key={user.user_id} className="transition-shadow hover:shadow-lg hover:scale-[1.01] group">
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar className="h-8 w-8">
                        {user.avatar ? <AvatarImage src={user.avatar} alt={user.name} /> : <AvatarFallback>{user.name ? user.name.split(' ').map(n => n[0]).slice(0,2).join('') : user.username?.slice(0,2)}</AvatarFallback>}
                      </Avatar>
                      <div className="flex flex-col">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{user.name}</span>
                          {(user as User & { gender?: string }).gender && (
                            <span className="text-xs text-gray-500 dark:text-gray-400 capitalize">({(user as User & { gender?: string }).gender})</span>
                          )}
                        </div>
                        <span className={`text-sm ${user.status === 'active' ? 'text-green-600 dark:text-green-300' : user.status === 'inactive' ? 'text-red-600 dark:text-red-300' : 'text-muted-foreground'}`}>{user.email}</span>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className="font-medium">{user.username}</span>
                  </TableCell>
                  <TableCell>
                    {(() => {
                      const role = String(user.role || '');
                      let variant: 'default' | 'destructive' | 'outline' | 'secondary' | undefined = 'default';
                      let extra = '';
                      if (role === 'admin') {
                        variant = 'destructive';
                        extra = 'bg-red-100 text-red-700 dark:bg-red-800 dark:text-red-200';
                      } else if (role === 'company_admin') {
                        variant = 'secondary';
                        extra = 'bg-indigo-100 text-indigo-700 dark:bg-indigo-800 dark:text-indigo-200';
                      } else if (role === 'dept_head' || role === 'dept_head') {
                        variant = 'outline';
                        extra = 'text-amber-600 dark:text-amber-300';
                      } else if (role === 'coordinator') {
                        variant = 'secondary';
                        extra = 'bg-emerald-100 text-emerald-700 dark:bg-emerald-800 dark:text-emerald-200';
                      } else {
                        variant = 'default';
                      }
                      return (
                        <Badge variant={variant} className={`capitalize ${extra}`}>{role}</Badge>
                      );
                    })()}
                  </TableCell>
                  <TableCell>
                    {user.status === 'active' ? (
                      <Badge variant="secondary" className="capitalize bg-green-100 text-green-700 dark:bg-green-800 dark:text-green-200">{user.status}</Badge>
                    ) : (
                      <Badge variant="destructive" className="capitalize bg-red-100 text-red-700 dark:bg-red-800 dark:text-red-200">{user.status}</Badge>
                    )}
                  </TableCell>
                  <TableCell className="flex gap-2 justify-end">
                    <Link href={`/users/${user.user_id}`}>
                      <Button variant="ghost" size="sm" aria-label={`View ${user.name}`}>
                        View
                      </Button>
                    </Link>
                    <Link href={`/users/${user.user_id}/edit`}>
                      <Button variant="outline" size="sm" aria-label={`Edit ${user.name}`}>
                        <Edit className="h-4 w-4" />
                      </Button>
                    </Link>
                    <Dialog open={deleteId === user.user_id} onOpenChange={(open) => setDeleteId(open ? user.user_id : null)}>
                      <DialogTrigger asChild>
                        <Button variant="destructive" size="sm" aria-label={`Delete ${user.name}`}>
                          <Trash className="h-4 w-4" />
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Confirm Delete</DialogTitle>
                          <DialogDescription>
                            Are you sure you want to delete "{user.name}"? This action will soft delete the user and can be restored from the trashed users page.
                          </DialogDescription>
                        </DialogHeader>
                        <DialogFooter>
                          <Button variant="outline" onClick={() => setDeleteId(null)}>Cancel</Button>
                          <Button variant="destructive" onClick={handleDelete} disabled={processing}>{processing ? 'Deleting...' : 'Delete'}</Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={5} className="py-10">
                  <div className="flex flex-col items-center justify-center text-center gap-4">
                    <div className="w-16 h-16 rounded-full bg-indigo-100 dark:bg-indigo-900/40 flex items-center justify-center">
                      <span className="text-2xl">👤</span>
                    </div>
                    <div>
                      <p className="text-lg font-semibold">No users found</p>
                      <p className="text-sm text-muted-foreground">Try adjusting your filters or add a new user.</p>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" onClick={() => { setSearchTerm(''); setStatusFilter('all'); setRoleFilter('all'); handleFilterChange(); }}>
                        Reset filters
                      </Button>
                      <Link href="/users/create">
                        <Button>
                          Add user
                        </Button>
                      </Link>
                    </div>
                  </div>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
        <div className="flex flex-col md:flex-row justify-between items-center mt-4 gap-3">
          <span className="text-sm text-muted-foreground">
            Showing {Math.min((users.current_page - 1) * users.per_page + 1, users.total)} to {Math.min(users.current_page * users.per_page, users.total)} of {users.total} users
          </span>
          <div className="flex gap-2">
            {users.links.map((link, index) => {
              // Laravel's paginator provides 'label' as HTML; strip tags for accessibility
              const label = link.label.replace(/<[^>]*>/g, '');
              return (
                <Link key={index} href={link.url || '#'} preserveState preserveScroll>
                  <Button variant={link.active ? 'default' : 'outline'} size="sm" disabled={!link.url || link.active} aria-label={`Go to page ${label}`}>
                    {label}
                  </Button>
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
