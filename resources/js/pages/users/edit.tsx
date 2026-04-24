import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import AppLayout from '@/layouts/app-layout';
import { Head, Link, useForm, usePage } from '@inertiajs/react';
import { type BreadcrumbItem, type User } from '@/types';
import { FormEventHandler, useState } from 'react';
import { X } from 'lucide-react';

interface Props {
  user: User;
  success?: string;
  error?: string;
}

type FormData = {
  name: string;
  email: string;
  username: string;
  password: string;
  role: 'coordinator' | 'dept_head' | 'company_admin';
  phone: string;
  status: 'active' | 'inactive';
  gender?: 'male' | 'female';
  avatar?: string;
} & Record<string, string | undefined>;

const breadcrumbs: BreadcrumbItem[] = [
  { title: 'Dashboard', href: '/dashboard' },
  { title: 'Users', href: '/users' },
  { title: 'Edit', href: '' },
];

export default function UserEdit({ user, success: initialSuccess, error: initialError }: Props) {
  const [showError, setShowError] = useState(!!initialError);
  const [showSuccess, setShowSuccess] = useState(!!initialSuccess);
  const { data, setData, put, processing, errors } = useForm<FormData>({
    name: user.name,
    email: user.email,
    username: user.username,
    password: '',
    role: user.role as 'coordinator' | 'dept_head' | 'company_admin',
    phone: user.phone || '',
    status: user.status,
    gender: (user.gender as 'male' | 'female') || undefined,
    avatar: user.avatar || '',
  });

  const page = usePage<{ success?: string; error?: string; auth?: { user: { role: string } } }>();
  const isAdmin = page?.props?.auth?.user?.role === 'admin';
  const restrictAdminToStatusAvatar = Boolean(isAdmin && !!user.updated_at && !!user.created_at && user.updated_at !== user.created_at);

  const handleSubmit: FormEventHandler = (e) => {
    e.preventDefault();
    put(`/users/${user.user_id}`, {
      onSuccess: () => setShowSuccess(true),
      onError: (errors) => {
        setShowError(true);
        console.log(errors);
      },
    });
  };

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title="Edit User" />
      <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4">
        <div className="rounded-2xl p-6 bg-gradient-to-r from-indigo-500 to-blue-600 dark:from-indigo-700 dark:to-blue-800 text-white shadow-lg">
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Edit User</h1>
          <p className="text-white/90 mt-1">Update user information and role</p>
        </div>
        {showSuccess && page.props.success && (
          <div className="bg-green-100 dark:bg-green-800 text-green-800 dark:text-green-100 p-4 rounded-xl flex justify-between items-center">
            <span>{page.props.success}</span>
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
        {showError && page.props.error && (
          <div className="bg-red-100 dark:bg-red-800 text-red-800 dark:text-red-100 p-4 rounded-xl flex justify-between items-center">
            <span>{page.props.error}</span>
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
        <form onSubmit={handleSubmit} className="space-y-4 max-w-md" autoComplete="off">
          {restrictAdminToStatusAvatar && (
            <div className="text-sm text-muted-foreground bg-muted/30 border rounded-xl p-3">
              This user has updated their profile. As an admin, you can edit only Status and Avatar.
            </div>
          )}
          <div>
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              value={data.name}
              onChange={(e) => setData('name', e.target.value)}
              disabled={restrictAdminToStatusAvatar}
              placeholder="Full Name"
              className={`rounded-full focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 transition-all ${errors.name ? 'border-red-500' : ''}`}
              aria-invalid={!!errors.name}
              aria-describedby={errors.name ? 'name-error' : undefined}
            />
            {errors.name && <p className="text-red-500 text-sm mt-1" id="name-error">{errors.name}</p>}
          </div>
          <div>
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={data.email}
              onChange={(e) => setData('email', e.target.value)}
              disabled={restrictAdminToStatusAvatar}
              placeholder="Email Address"
              className={`rounded-full focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 transition-all ${errors.email ? 'border-red-500' : ''}`}
              aria-invalid={!!errors.email}
              aria-describedby={errors.email ? 'email-error' : undefined}
            />
            {errors.email && <p className="text-red-500 text-sm mt-1" id="email-error">{errors.email}</p>}
          </div>
          <div>
            <Label htmlFor="username">Username</Label>
            <Input
              id="username"
              value={data.username}
              onChange={(e) => setData('username', e.target.value)}
              disabled={restrictAdminToStatusAvatar}
              placeholder="Username"
              className={`rounded-full focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 transition-all ${errors.username ? 'border-red-500' : ''}`}
              aria-invalid={!!errors.username}
              aria-describedby={errors.username ? 'username-error' : undefined}
            />
            {errors.username && <p className="text-red-500 text-sm mt-1" id="username-error">{errors.username}</p>}
          </div>
          <div>
            <Label htmlFor="password">Password (leave blank to keep unchanged)</Label>
            <Input
              id="password"
              type="password"
              value={data.password}
              onChange={(e) => setData('password', e.target.value)}
              disabled={restrictAdminToStatusAvatar}
              placeholder="New Password"
              className={`rounded-full focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 transition-all ${errors.password ? 'border-red-500' : ''}`}
              aria-invalid={!!errors.password}
              aria-describedby={errors.password ? 'password-error' : undefined}
            />
            {errors.password && <p className="text-red-500 text-sm mt-1" id="password-error">{errors.password}</p>}
          </div>
          <div>
            <Label htmlFor="role">Role</Label>
            <Select
              value={data.role}
              onValueChange={(value: string) => setData('role', value as 'coordinator' | 'dept_head' | 'company_admin')}
              aria-invalid={!!errors.role}
              aria-describedby={errors.role ? 'role-error' : undefined}
            >
              <SelectTrigger id="role" className={`rounded-full ${errors.role ? 'border-red-500' : ''}`} disabled={restrictAdminToStatusAvatar}>
                <SelectValue placeholder="Select Role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="coordinator">Coordinator</SelectItem>
                <SelectItem value="dept_head">Department Head</SelectItem>
                <SelectItem value="company_admin">Company Admin</SelectItem>
              </SelectContent>
            </Select>
            {errors.role && <p className="text-red-500 text-sm mt-1" id="role-error">{errors.role}</p>}
          </div>
          <div>
            <Label htmlFor="phone">Phone</Label>
            <Input
              id="phone"
              value={data.phone}
              onChange={(e) => setData('phone', e.target.value)}
              disabled={restrictAdminToStatusAvatar}
              placeholder="Phone Number"
              className={`rounded-full focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 transition-all ${errors.phone ? 'border-red-500' : ''}`}
              aria-invalid={!!errors.phone}
              aria-describedby={errors.phone ? 'phone-error' : undefined}
            />
            {errors.phone && <p className="text-red-500 text-sm mt-1" id="phone-error">{errors.phone}</p>}
          </div>
          <div>
            <Label htmlFor="gender">Gender</Label>
            <Select
              value={data.gender}
              onValueChange={(value: string) => setData('gender', value as 'male' | 'female' | undefined)}
              aria-invalid={!!errors.gender}
              aria-describedby={errors.gender ? 'gender-error' : undefined}
            >
              <SelectTrigger id="gender" className={`rounded-full ${errors.gender ? 'border-red-500' : ''}`} disabled={restrictAdminToStatusAvatar}>
                <SelectValue placeholder="Select Gender (Optional)" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="male">Male</SelectItem>
                <SelectItem value="female">Female</SelectItem>
              </SelectContent>
            </Select>
            {errors.gender && <p className="text-red-500 text-sm mt-1" id="gender-error">{errors.gender}</p>}
          </div>
          <div>
            <Label htmlFor="status">Status</Label>
            <Select
              value={data.status}
              onValueChange={(value: string) => setData('status', value as 'active' | 'inactive')}
              aria-invalid={!!errors.status}
              aria-describedby={errors.status ? 'status-error' : undefined}
            >
              <SelectTrigger id="status" className={`rounded-full ${errors.status ? 'border-red-500' : ''}`}>
                <SelectValue placeholder="Select Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>
            {errors.status && <p className="text-red-500 text-sm mt-1" id="status-error">{errors.status}</p>}
          </div>
          <div>
            <Label htmlFor="avatar">Avatar URL</Label>
            <Input
              id="avatar"
              value={data.avatar}
              onChange={(e) => setData('avatar', e.target.value)}
              placeholder="Avatar URL"
              className={`rounded-full focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 transition-all ${errors.avatar ? 'border-red-500' : ''}`}
              aria-invalid={!!errors.avatar}
              aria-describedby={errors.avatar ? 'avatar-error' : undefined}
            />
            {errors.avatar && <p className="text-red-500 text-sm mt-1" id="avatar-error">{errors.avatar}</p>}
          </div>
          <div className="flex gap-4">
            <Button type="submit" disabled={processing} aria-label="Update user" className="rounded-full bg-gradient-to-r from-indigo-500 to-blue-600 hover:from-indigo-600 hover:to-blue-700">
              {processing ? 'Updating...' : 'Update User'}
            </Button>
            <Link href="/users">
              <Button variant="outline" aria-label="Cancel" className="rounded-full">Cancel</Button>
            </Link>
          </div>
        </form>
      </div>
    </AppLayout>
  );
}