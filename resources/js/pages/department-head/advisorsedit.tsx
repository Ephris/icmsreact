import React, { useState } from 'react';
import { Head, Link, useForm, router } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { X } from 'lucide-react';
import { FormEventHandler } from 'react';

interface Department {
  department_id: number;
  name: string;
}

interface Advisor {
  user_id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  phone: string | null;
  specialization: string | null;
  gender?: 'male' | 'female';
  status: string;
}

interface Props {
  department: Department;
  advisor: Advisor;
  success?: string;
  error?: string;
}

type FormData = {
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  phone: string;
  specialization: string;
  gender: 'male' | 'female' | '';
  status: 'active' | 'inactive';
};

const breadcrumbs = [
  { title: 'Dashboard', href: '/department-head' },
  { title: 'Edit Advisor', href: '' },
];

const AdvisorsEdit: React.FC<Props> = ({ department, advisor, success, error }) => {
  const [showSuccess, setShowSuccess] = useState(!!success);
  const [showError, setShowError] = useState(!!error);
  const { data, setData, put, processing, errors } = useForm<FormData>({
    username: advisor.username,
    email: advisor.email,
    first_name: advisor.first_name,
    last_name: advisor.last_name,
    phone: advisor.phone || '',
    specialization: advisor.specialization || '',
    gender: (advisor.gender as 'male' | 'female') || '',
    status: advisor.status as 'active' | 'inactive',
  });

  const handleSubmit: FormEventHandler = (e) => {
    e.preventDefault();
    put(`/department-head/advisors/${advisor.user_id}`, {
      onSuccess: () => {
        router.visit('/department-head');
      },
      onError: (errors) => {
        setShowError(true);
        console.error('Validation errors:', errors);
      },
    });
  };

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title="Edit Advisor" />
      <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4">
        <h1 className="text-2xl font-bold">Edit Advisor - {department.name}</h1>
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
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="username">Username</Label>
            <Input
              id="username"
              value={data.username}
              onChange={(e) => setData('username', e.target.value)}
              className={errors.username ? 'border-red-500' : ''}
            />
            {errors.username && <p className="text-red-500 text-sm">{errors.username}</p>}
          </div>
          <div>
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={data.email}
              onChange={(e) => setData('email', e.target.value)}
              className={errors.email ? 'border-red-500' : ''}
            />
            {errors.email && <p className="text-red-500 text-sm">{errors.email}</p>}
          </div>
          <div>
            <Label htmlFor="first_name">First Name</Label>
            <Input
              id="first_name"
              value={data.first_name}
              onChange={(e) => setData('first_name', e.target.value)}
              className={errors.first_name ? 'border-red-500' : ''}
            />
            {errors.first_name && <p className="text-red-500 text-sm">{errors.first_name}</p>}
          </div>
          <div>
            <Label htmlFor="last_name">Last Name</Label>
            <Input
              id="last_name"
              value={data.last_name}
              onChange={(e) => setData('last_name', e.target.value)}
              className={errors.last_name ? 'border-red-500' : ''}
            />
            {errors.last_name && <p className="text-red-500 text-sm">{errors.last_name}</p>}
          </div>
          <div>
            <Label htmlFor="phone">Phone (Optional)</Label>
            <Input
              id="phone"
              value={data.phone}
              onChange={(e) => setData('phone', e.target.value)}
              className={errors.phone ? 'border-red-500' : ''}
            />
            {errors.phone && <p className="text-red-500 text-sm">{errors.phone}</p>}
          </div>
          <div>
            <Label htmlFor="specialization">Specialization</Label>
            <Input
              id="specialization"
              value={data.specialization}
              onChange={(e) => setData('specialization', e.target.value)}
              className={errors.specialization ? 'border-red-500' : ''}
            />
            {errors.specialization && <p className="text-red-500 text-sm">{errors.specialization}</p>}
          </div>
          <div>
            <Label htmlFor="gender">Gender</Label>
            <Select value={data.gender} onValueChange={(v) => setData('gender', v as 'male' | 'female')}>
              <SelectTrigger id="gender">
                <SelectValue placeholder="Select gender" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="male">Male</SelectItem>
                <SelectItem value="female">Female</SelectItem>
              </SelectContent>
            </Select>
            {errors.gender && <p className="text-red-500 text-sm">{errors.gender}</p>}
          </div>
          <div>
            <Label htmlFor="status">Status</Label>
            <Select value={data.status} onValueChange={(value) => setData('status', value as 'active' | 'inactive')}>
              <SelectTrigger id="status">
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>
            {errors.status && <p className="text-red-500 text-sm">{errors.status}</p>}
          </div>
          <div className="flex gap-4">
            <Button type="submit" disabled={processing}>
              {processing ? 'Updating...' : 'Update Advisor'}
            </Button>
            <Button asChild variant="outline">
              <Link href="/department-head">Cancel</Link>
            </Button>
          </div>
        </form>
      </div>
    </AppLayout>
  );
};

export default AdvisorsEdit;