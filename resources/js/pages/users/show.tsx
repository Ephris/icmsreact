import { Button } from '@/components/ui/button';
import AppLayout from '@/layouts/app-layout';
import { Head, Link } from '@inertiajs/react';
import { type User, type BreadcrumbItem } from '@/types';
import { X } from 'lucide-react';
import { useState } from 'react';

interface Props {
  user: User;
  success?: string;
  error?: string;
}

const breadcrumbs: BreadcrumbItem[] = [
  { title: 'Dashboard', href: '/dashboard' },
  { title: 'Users', href: '/users' },
  { title: 'View', href: null },
];

export default function UserShow({ user, success: initialSuccess, error: initialError }: Props) {
  const [showSuccess, setShowSuccess] = useState(!!initialSuccess);
  const [showError, setShowError] = useState(!!initialError);

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title="View User" />
      <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4">
        <div className="rounded-2xl p-6 bg-gradient-to-r from-indigo-500 to-blue-600 dark:from-indigo-700 dark:to-blue-800 text-white shadow-lg">
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">User Details</h1>
          <p className="text-white/90 mt-1">View profile and status</p>
        </div>
        {showSuccess && (
          <div className="bg-green-100 dark:bg-green-800 text-green-800 dark:text-green-100 p-4 rounded-xl flex justify-between items-center">
            <span>{initialSuccess}</span>
            <Button variant="ghost" size="sm" onClick={() => setShowSuccess(false)} className="text-green-800 dark:text-green-100"><X className="h-4 w-4" /></Button>
          </div>
        )}
        {showError && (
          <div className="bg-red-100 dark:bg-red-800 text-red-800 dark:text-red-100 p-4 rounded-xl flex justify-between items-center">
            <span>{initialError}</span>
            <Button variant="ghost" size="sm" onClick={() => setShowError(false)} className="text-red-800 dark:text-red-100"><X className="h-4 w-4" /></Button>
          </div>
        )}
        <div className="max-w-md rounded-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 p-6 shadow-sm">
          <div className="grid gap-4">
            <div>
              <label className="block text-sm font-medium">Name</label>
              <p>{user.name}</p>
            </div>
            <div>
              <label className="block text-sm font-medium">Email</label>
              <p>{user.email}</p>
            </div>
            <div>
              <label className="block text-sm font-medium">Username</label>
              <p>{user.username}</p>
            </div>
            <div>
              <label className="block text-sm font-medium">Role</label>
              <p className="capitalize inline-flex rounded-full px-3 py-1 text-sm bg-indigo-100 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-300">{user.role}</p>
            </div>
            <div>
              <label className="block text-sm font-medium">Phone</label>
              <p>{user.phone || 'N/A'}</p>
            </div>
            <div>
              <label className="block text-sm font-medium">Status</label>
              {user.status === 'active' ? (
                <span className="inline-flex rounded-full px-3 py-1 text-sm bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300">Active</span>
              ) : (
                <span className="inline-flex rounded-full px-3 py-1 text-sm bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300">Inactive</span>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium">Avatar</label>
              {user.avatar ? <img src={user.avatar} alt="Avatar" className="h-16 w-16 rounded-full" /> : <p>N/A</p>}
            </div>
            <div className="flex gap-2">
              <Link href={`/users/${user.user_id}/edit`}>
                <Button className="rounded-full bg-gradient-to-r from-indigo-500 to-blue-600 hover:from-indigo-600 hover:to-blue-700">Edit</Button>
              </Link>
              <Link href="/users">
                <Button variant="outline" className="rounded-full">Back</Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}