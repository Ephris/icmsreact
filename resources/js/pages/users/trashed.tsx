import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import AppLayout from '@/layouts/app-layout';
import { Head, Link, useForm, usePage } from '@inertiajs/react';
import { type PaginatedResponse, type User, type BreadcrumbItem } from '@/types';
import { ArrowLeft, RotateCcw, X } from 'lucide-react';
import { useState, useEffect } from 'react';

interface Props {
  trashedUsers: PaginatedResponse<User>;
  success?: string;
  error?: string;
}

const breadcrumbs: BreadcrumbItem[] = [
  { title: 'Dashboard', href: '/dashboard' },
  { title: 'Users', href: '/users' },
  { title: 'Trashed', href: '/trashed' },
];

export default function UserTrashed({ trashedUsers, success: initialSuccess, error: initialError }: Props) {
  const { post, processing } = useForm();
  const { props } = usePage<{ success?: string; error?: string }>();
  const [showSuccess, setShowSuccess] = useState(!!initialSuccess);
  const [showError, setShowError] = useState(!!initialError);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    setShowSuccess(!!props.success);
    setShowError(!!props.error);
  }, [props.success, props.error]);

  const filteredUsers = trashedUsers.data.filter(
    (user) =>
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.role.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.status.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleRestore = (userId: number) => {
    post(`/users/${userId}/restore`, {
      onSuccess: () => setShowSuccess(true),
      onError: () => setShowError(true),
    });
  };

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title="Trashed Users" />
      <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4">
        <div className="rounded-2xl p-6 bg-gradient-to-r from-indigo-500 to-blue-600 dark:from-indigo-700 dark:to-blue-800 text-white shadow-lg">
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Trashed Users</h1>
          <p className="text-white/90 mt-1">Restore users that were soft deleted</p>
        </div>
        <div className="flex justify-between items-center">
          <Input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by name, email, username, role, or status..."
            className="max-w-sm rounded-full focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 transition-all"
            aria-label="Search trashed users"
          />
          <Link href="/users">
            <Button variant="outline" aria-label="Back to users" className="rounded-full">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Users
            </Button>
          </Link>
        </div>
        {showSuccess && props.success && (
          <div className="bg-green-100 dark:bg-green-800 text-green-800 dark:text-green-100 p-4 rounded-xl flex justify-between items-center">
            <span>{props.success}</span>
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
        {showError && props.error && (
          <div className="bg-red-100 dark:bg-red-800 text-red-800 dark:text-red-100 p-4 rounded-xl flex justify-between items-center">
            <span>{props.error}</span>
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
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Username</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Deleted At</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredUsers.length > 0 ? (
              filteredUsers.map((user) => (
                <TableRow key={user.user_id} className="hover:bg-indigo-50 dark:hover:bg-indigo-900/30 transition-colors">
                  <TableCell className="font-medium">{user.name}</TableCell>
                  <TableCell className="text-muted-foreground">{user.email}</TableCell>
                  <TableCell>{user.username}</TableCell>
                  <TableCell><span className="capitalize inline-flex rounded-full px-2.5 py-0.5 text-xs bg-indigo-100 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-300">{user.role}</span></TableCell>
                  <TableCell>
                    {user.status === 'active' ? (
                      <span className="inline-flex rounded-full px-2.5 py-0.5 text-xs bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300">Active</span>
                    ) : (
                      <span className="inline-flex rounded-full px-2.5 py-0.5 text-xs bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300">Inactive</span>
                    )}
                  </TableCell>
                  <TableCell>{user.deleted_at ? new Date(user.deleted_at).toLocaleDateString() : 'N/A'}</TableCell>
                  <TableCell>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleRestore(user.user_id)}
                      disabled={processing}
                      aria-label={`Restore ${user.name}`}
                    >
                      <RotateCcw className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={7} className="py-10">
                  <div className="flex flex-col items-center justify-center text-center gap-3">
                    <div className="w-14 h-14 rounded-full bg-indigo-100 dark:bg-indigo-900/40 flex items-center justify-center">
                      <span className="text-xl">🗑️</span>
                    </div>
                    <p className="text-lg font-semibold">No trashed users found</p>
                    <p className="text-sm text-muted-foreground">Great! There are no users in trash.</p>
                    <Link href="/users"><Button variant="outline" className="rounded-full">Back to users</Button></Link>
                  </div>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
        <div className="flex justify-between items-center mt-4">
          <span>
            Showing {filteredUsers.length} of {trashedUsers.total} trashed users
          </span>
          <div className="flex gap-2">
            {trashedUsers.links.map((link, index) => (
              <Link
                key={index}
                href={link.url || '#'}
                preserveState
                preserveScroll
                disabled={!link.url || link.active}
              >
                <Button
                  variant={link.active ? 'default' : 'outline'}
                  size="sm"
                  disabled={!link.url || link.active}
                  dangerouslySetInnerHTML={{ __html: link.label }}
                  aria-label={`Go to page ${link.label}`}
                />
              </Link>
            ))}
          </div>
        </div>
      </div>
    </AppLayout>
  );
}