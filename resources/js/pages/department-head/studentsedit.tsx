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

interface Student {
  student_id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  phone: string | null;
  cgpa: number | null;
  year_of_study: string | null;
  university_id?: string | null;
  gender?: 'male' | 'female';
  status: string;
}

interface Props {
  department: Department;
  student: Student;
  success?: string;
  error?: string;
}

type FormData = {
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  phone: string;
  cgpa: string;
  year_of_study: string;
  university_id: string;
  gender: 'male' | 'female' | '';
  status: 'active' | 'inactive';
};

const breadcrumbs = [
  { title: 'Dashboard', href: '/department-head' },
  { title: 'Edit Student', href: '' },
];

const StudentsEdit: React.FC<Props> = ({ department, student, success, error }) => {
  const [showSuccess, setShowSuccess] = useState(!!success);
  const [showError, setShowError] = useState(!!error);
  const { data, setData, put, processing, errors } = useForm<FormData>({
    username: student.username,
    email: student.email,
    first_name: student.first_name,
    last_name: student.last_name,
    phone: student.phone || '',
    cgpa: student.cgpa?.toString() || '',
    year_of_study: student.year_of_study || '',
    university_id: student.university_id || '',
    gender: (student.gender as 'male' | 'female') || '',
    status: student.status as 'active' | 'inactive',
  });

  const handleSubmit: FormEventHandler = (e) => {
    e.preventDefault();
    put(`/department-head/students/${student.student_id}`, {
      onSuccess: () => {
        router.visit('/department-head');
      },
      onError: (errors) => {
        console.error('Validation errors:', errors);
        setShowError(true);
      },
    });
  };

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title="Edit Student" />
      <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4">
        <h1 className="text-2xl font-bold">Edit Student - {department.name}</h1>
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
            <Label htmlFor="cgpa">CGPA</Label>
            <Input
              id="cgpa"
              type="number"
              step="0.01"
              min="0"
              max="4"
              value={data.cgpa}
              onChange={(e) => setData('cgpa', e.target.value)}
              className={errors.cgpa ? 'border-red-500' : ''}
            />
            {errors.cgpa && <p className="text-red-500 text-sm">{errors.cgpa}</p>}
          </div>
          <div>
            <Label htmlFor="year_of_study">Year of Study</Label>
            <Input
              id="year_of_study"
              value={data.year_of_study}
              onChange={(e) => setData('year_of_study', e.target.value)}
              className={errors.year_of_study ? 'border-red-500' : ''}
            />
            {errors.year_of_study && <p className="text-red-500 text-sm">{errors.year_of_study}</p>}
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
          <Label htmlFor="university_id">University ID (UNid)</Label>
          <Input
            id="university_id"
            value={data.university_id}
            onChange={(e) => setData('university_id', e.target.value)}
            placeholder="UGR/12345/12 or UGP/12345/12"
            className={!/^(UGR|UGP|TUGR)\/\d{5}\/\d{2}$/.test(data.university_id) && data.university_id ? 'border-red-500' : ''}
          />
          {errors.university_id && <p className="text-red-500 text-sm">{errors.university_id}</p>}
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
              {processing ? 'Updating...' : 'Update Student'}
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

export default StudentsEdit;