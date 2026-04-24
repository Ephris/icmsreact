import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import AppLayout from '@/layouts/app-layout';
import { Head, Link, useForm, router } from '@inertiajs/react';
import { type BreadcrumbItem } from '@/types';
import { FormEventHandler, useState, useEffect } from 'react';
import { X, CheckCircle, AlertCircle } from 'lucide-react';

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
  { title: 'Create', href: '/users/create' },
];

// Validation functions
const validateName = (name: string): string | null => {
  if (!name.trim()) return 'Name is required';
  if (!/^[a-zA-Z\s]+$/.test(name.trim())) return 'Name must contain only letters and spaces';
  if (name.trim().length < 2) return 'Name must be at least 2 characters long';
  return null;
};

const validateEmail = (email: string): string | null => {
  if (!email.trim()) return 'Email is required';
  const emailRegex = /^[a-zA-Z][a-zA-Z0-9._-]{2,}@(gmail|ambou)\.(com|et|org|net)$/i;
  if (!emailRegex.test(email.trim())) return 'Email must start with a letter, have at least 3 characters before @, and use gmail/ambou domain';
  return null;
};

const validateUsername = (username: string): string | null => {
  if (!username.trim()) return 'Username is required';
  if (!/^[a-zA-Z]/.test(username.trim())) return 'Username must start with a letter';
  if (username.trim().length < 3) return 'Username must be at least 3 characters long';
  if (!/^[a-zA-Z0-9_]+$/.test(username.trim())) return 'Username can only contain letters, numbers, and underscores';
  return null;
};

const validatePhone = (phone: string): string | null => {
  if (!phone.trim()) return null; // Phone is optional
  if (!/^\d+$/.test(phone.trim())) return 'Phone must contain only numbers';
  if (phone.trim().length < 10) return 'Phone must be at least 10 digits long';
  return null;
};

export default function UserCreate({ error: initialError, success: initialSuccess, coordinatorExists = false }: { error?: string; success?: string; coordinatorExists?: boolean }) {
  const [showError, setShowError] = useState(!!initialError);
  const [showSuccess, setShowSuccess] = useState(!!initialSuccess);
  const [validationErrors, setValidationErrors] = useState<Record<string, string | null>>({});
  const [isFormValid, setIsFormValid] = useState(false);
  
  const { data, setData, post, processing, errors } = useForm<FormData>({
    name: '',
    email: '',
    username: '',
    password: '',
    role: coordinatorExists ? 'dept_head' : 'coordinator',
    phone: '',
    status: 'active',
    gender: undefined,
    avatar: '',
  });

  // Real-time validation
  useEffect(() => {
    const nameError = validateName(data.name);
    const emailError = validateEmail(data.email);
    const usernameError = validateUsername(data.username);
    const phoneError = validatePhone(data.phone);
    
    setValidationErrors({
      name: nameError,
      email: emailError,
      username: usernameError,
      phone: phoneError,
    });
    
    setIsFormValid(!nameError && !emailError && !usernameError && data.password.length >= 6);
  }, [data.name, data.email, data.username, data.phone, data.password]);

  const handleSubmit: FormEventHandler = (e) => {
    e.preventDefault();
    
    // Final validation before submit
    const nameError = validateName(data.name);
    const emailError = validateEmail(data.email);
    const usernameError = validateUsername(data.username);
    const phoneError = validatePhone(data.phone);
    
    if (nameError || emailError || usernameError || phoneError) {
      setValidationErrors({
        name: nameError,
        email: emailError,
        username: usernameError,
        phone: phoneError,
      });
      return;
    }
    
    post('/users', {
      onSuccess: () => {
        router.visit('/users');
      },
      onError: (errors) => {
        setShowError(true);
        console.error('Validation errors:', errors);
      },
    });
  };

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title="Create User" />
      <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4">
        <div className="rounded-2xl p-6 bg-gradient-to-r from-indigo-500 to-blue-600 dark:from-indigo-700 dark:to-blue-800 text-white shadow-lg">
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Create User</h1>
          <p className="text-white/90 mt-1">Add a new user with role and status</p>
        </div>
        {showSuccess && initialSuccess && (
          <div className="bg-green-100 dark:bg-green-800 text-green-800 dark:text-green-100 p-4 rounded-xl flex justify-between items-center">
            <span>{initialSuccess}</span>
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
        {showError && initialError && (
          <div className="bg-red-100 dark:bg-red-800 text-red-800 dark:text-red-100 p-4 rounded-xl flex justify-between items-center">
            <span>{initialError}</span>
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
          <div>
            <Label htmlFor="name">Name</Label>
            <div className="relative">
              <Input
                id="name"
                value={data.name}
                onChange={(e) => setData('name', e.target.value)}
                placeholder="Full Name"
                className={`rounded-full focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 transition-all ${errors.name || validationErrors.name ? 'border-red-500' : validationErrors.name === null && data.name ? 'border-green-500' : ''}`}
                aria-invalid={!!errors.name || !!validationErrors.name}
                aria-describedby={errors.name || validationErrors.name ? 'name-error' : undefined}
              />
              {validationErrors.name === null && data.name && (
                <CheckCircle className="absolute right-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-green-500" />
              )}
              {validationErrors.name && (
                <AlertCircle className="absolute right-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-red-500" />
              )}
            </div>
            {(errors.name || validationErrors.name) && (
              <p className="text-red-500 text-sm mt-1" id="name-error">
                {errors.name || validationErrors.name}
              </p>
            )}
          </div>
          <div>
            <Label htmlFor="email">Email</Label>
            <div className="relative">
              <Input
                id="email"
                type="email"
                value={data.email}
                onChange={(e) => {
                  setData('email', e.target.value);
                  // Clear username when email changes
                  if (data.username === data.email) {
                    setData('username', '');
                  }
                }}
                placeholder="Email Address"
                autoComplete="off"
                className={`rounded-full focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 transition-all ${errors.email || validationErrors.email ? 'border-red-500' : validationErrors.email === null && data.email ? 'border-green-500' : ''}`}
                aria-invalid={!!errors.email || !!validationErrors.email}
                aria-describedby={errors.email || validationErrors.email ? 'email-error' : undefined}
              />
              {validationErrors.email === null && data.email && (
                <CheckCircle className="absolute right-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-green-500" />
              )}
              {validationErrors.email && (
                <AlertCircle className="absolute right-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-red-500" />
              )}
            </div>
            {(errors.email || validationErrors.email) && (
              <p className="text-red-500 text-sm mt-1" id="email-error">
                {errors.email || validationErrors.email}
              </p>
            )}
          </div>
          <div>
            <Label htmlFor="username">Username</Label>
            <div className="relative">
              <Input
                id="username"
                value={data.username}
                onChange={(e) => setData('username', e.target.value)}
                placeholder="Username"
                autoComplete="off"
                className={`rounded-full focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 transition-all ${errors.username || validationErrors.username ? 'border-red-500' : validationErrors.username === null && data.username ? 'border-green-500' : ''}`}
                aria-invalid={!!errors.username || !!validationErrors.username}
                aria-describedby={errors.username || validationErrors.username ? 'username-error' : undefined}
              />
              {validationErrors.username === null && data.username && (
                <CheckCircle className="absolute right-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-green-500" />
              )}
              {validationErrors.username && (
                <AlertCircle className="absolute right-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-red-500" />
              )}
            </div>
            {(errors.username || validationErrors.username) && (
              <p className="text-red-500 text-sm mt-1" id="username-error">
                {errors.username || validationErrors.username}
              </p>
            )}
          </div>
          <div>
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              value={data.password}
              onChange={(e) => setData('password', e.target.value)}
              placeholder="Password"
              autoComplete="new-password"
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
              <SelectTrigger id="role" className={`rounded-full ${errors.role ? 'border-red-500' : ''}`}>
                <SelectValue placeholder="Select Role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="coordinator" disabled={coordinatorExists}>
                  Coordinator{coordinatorExists ? ' (Already exists)' : ''}
                </SelectItem>
                <SelectItem value="dept_head">Department Head</SelectItem>
                <SelectItem value="company_admin">Company Admin</SelectItem>
              </SelectContent>
            </Select>
            {errors.role && <p className="text-red-500 text-sm mt-1" id="role-error">{errors.role}</p>}
          </div>
          <div>
            <Label htmlFor="phone">Phone (Optional)</Label>
            <div className="relative">
              <Input
                id="phone"
                value={data.phone}
                onChange={(e) => setData('phone', e.target.value)}
                placeholder="Phone Number"
                className={`rounded-full focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 transition-all ${errors.phone || validationErrors.phone ? 'border-red-500' : validationErrors.phone === null && data.phone ? 'border-green-500' : ''}`}
                aria-invalid={!!errors.phone || !!validationErrors.phone}
                aria-describedby={errors.phone || validationErrors.phone ? 'phone-error' : undefined}
              />
              {validationErrors.phone === null && data.phone && (
                <CheckCircle className="absolute right-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-green-500" />
              )}
              {validationErrors.phone && (
                <AlertCircle className="absolute right-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-red-500" />
              )}
            </div>
            {(errors.phone || validationErrors.phone) && (
              <p className="text-red-500 text-sm mt-1" id="phone-error">
                {errors.phone || validationErrors.phone}
              </p>
            )}
          </div>
          <div>
            <Label htmlFor="gender">Gender</Label>
            <Select
              value={data.gender}
              onValueChange={(value: string) => setData('gender', value as 'male' | 'female' | undefined)}
              aria-invalid={!!errors.gender}
              aria-describedby={errors.gender ? 'gender-error' : undefined}
            >
              <SelectTrigger id="gender" className={`rounded-full ${errors.gender ? 'border-red-500' : ''}`}>
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
            <Button type="submit" disabled={processing || !isFormValid} aria-label="Create user" className="rounded-full bg-gradient-to-r from-indigo-500 to-blue-600 hover:from-indigo-600 hover:to-blue-700">
              {processing ? 'Creating...' : 'Create User'}
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