import React, { useState, useEffect } from 'react';
import { Head, Link, useForm, router } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { X, CheckCircle, AlertCircle } from 'lucide-react';
import { FormEventHandler } from 'react';

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
  if (!phone.trim()) return null; // optional
  if (!/^\d+$/.test(phone.trim())) return 'Phone must contain only numbers';
  if (phone.trim().length < 10) return 'Phone must be at least 10 digits long';
  return null;
};

const validateCGPA = (cgpa: string): string | null => {
  if (!cgpa.trim()) return 'CGPA is required';
  const cgpaValue = parseFloat(cgpa);
  if (isNaN(cgpaValue)) return 'CGPA must be a valid number';
  if (cgpaValue < 0 || cgpaValue > 4) return 'CGPA must be between 0 and 4';
  return null;
};

interface Department {
  department_id: number;
  name: string;
}

interface Props {
  department: Department;
  success?: string;
  error?: string;
}

type FormData = {
  username: string;
  email: string;
  password: string;
  password_confirmation: string;
  first_name: string;
  last_name: string;
  phone: string;
  gender: 'male' | 'female' | '';
  cgpa: string;
  year_of_study: string;
  university_id: string;
  status: 'active' | 'inactive';
};

const breadcrumbs = [
  { title: 'Dashboard', href: '/department-head' },
  { title: 'Create Student', href: '/department-head/students/create' },
];

const StudentsCreate: React.FC<Props> = ({ department, success, error }) => {
  const [showSuccess, setShowSuccess] = useState(!!success);
  const [showError, setShowError] = useState(!!error);
  const [validationErrors, setValidationErrors] = useState<Record<string, string | null>>({});
  const [isFormValid, setIsFormValid] = useState(false);
  
  const { data, setData, post, processing, errors } = useForm<FormData>({
    username: '',
    email: '',
    password: '',
    password_confirmation: '',
    first_name: '',
    last_name: '',
    phone: '',
    gender: '',
    cgpa: '',
    year_of_study: '',
    university_id: '',
    status: 'active',
  });

  // Real-time validation
  useEffect(() => {
    const firstNameError = validateName(data.first_name);
    const lastNameError = validateName(data.last_name);
    const emailError = validateEmail(data.email);
    const usernameError = validateUsername(data.username);
    const phoneError = validatePhone(data.phone);
    const cgpaError = validateCGPA(data.cgpa);
    
    setValidationErrors({
      first_name: firstNameError,
      last_name: lastNameError,
      email: emailError,
      username: usernameError,
      phone: phoneError,
      cgpa: cgpaError,
    });
    
    const genderValid = data.gender === 'male' || data.gender === 'female';
    const unidValid = /^(UGR|UGP|TUGR)\/\d{5}\/\d{2}$/.test(data.university_id);

    setIsFormValid(
      !firstNameError &&
      !lastNameError &&
      !emailError &&
      !usernameError &&
      !phoneError &&
      !cgpaError &&
      genderValid &&
      unidValid &&
      data.password.length >= 8 &&
      data.password === data.password_confirmation
    );
  }, [data.first_name, data.last_name, data.email, data.username, data.phone, data.cgpa, data.password, data.password_confirmation, data.gender, data.university_id]);

  const handleSubmit: FormEventHandler = (e) => {
    e.preventDefault();
    
    // Final validation before submit
    const firstNameError = validateName(data.first_name);
    const lastNameError = validateName(data.last_name);
    const emailError = validateEmail(data.email);
    const usernameError = validateUsername(data.username);
    const phoneError = validatePhone(data.phone);
    const cgpaError = validateCGPA(data.cgpa);
    
    const genderValid = data.gender === 'male' || data.gender === 'female';
    const unidValid = /^(UGR|UGP|TUGR)\/\d{5}\/\d{2}$/.test(data.university_id);
    if (firstNameError || lastNameError || emailError || usernameError || phoneError || cgpaError || !genderValid || !unidValid) {
      setValidationErrors({
        first_name: firstNameError,
        last_name: lastNameError,
        email: emailError,
        username: usernameError,
        phone: phoneError,
        cgpa: cgpaError,
      });
      return;
    }
    
    post('/department-head/students', {
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
      <Head title="Create Student" />
      <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4">
        <h1 className="text-2xl font-bold">Create Student - {department.name}</h1>
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
        <form onSubmit={handleSubmit} className="space-y-4" autoComplete="off">
          <div>
            <Label htmlFor="username">Username</Label>
            <div className="relative">
              <Input
                id="username"
                value={data.username}
                onChange={(e) => setData('username', e.target.value)}
                autoComplete="off"
                className={`${errors.username || validationErrors.username ? 'border-red-500' : validationErrors.username === null && data.username ? 'border-green-500' : ''}`}
                aria-invalid={!!errors.username || !!validationErrors.username}
              />
              {validationErrors.username === null && data.username && (
                <CheckCircle className="absolute right-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-green-500" />
              )}
              {validationErrors.username && (
                <AlertCircle className="absolute right-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-red-500" />
              )}
            </div>
            {(errors.username || validationErrors.username) && (
              <p className="text-red-500 text-sm">{errors.username || validationErrors.username}</p>
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
                autoComplete="off"
                className={`${errors.email || validationErrors.email ? 'border-red-500' : validationErrors.email === null && data.email ? 'border-green-500' : ''}`}
                aria-invalid={!!errors.email || !!validationErrors.email}
              />
              {validationErrors.email === null && data.email && (
                <CheckCircle className="absolute right-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-green-500" />
              )}
              {validationErrors.email && (
                <AlertCircle className="absolute right-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-red-500" />
              )}
            </div>
            {(errors.email || validationErrors.email) && (
              <p className="text-red-500 text-sm">{errors.email || validationErrors.email}</p>
            )}
          </div>
          <div>
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              value={data.password}
              onChange={(e) => setData('password', e.target.value)}
              autoComplete="new-password"
              className={errors.password || (data.password_confirmation && data.password !== data.password_confirmation) ? 'border-red-500' : ''}
            />
            {errors.password && <p className="text-red-500 text-sm">{errors.password}</p>}
            {data.password_confirmation && data.password !== data.password_confirmation && (
              <p className="text-red-500 text-sm">Passwords do not match</p>
            )}
          </div>
          <div>
            <Label htmlFor="password_confirmation">Confirm Password</Label>
            <Input
              id="password_confirmation"
              type="password"
              value={data.password_confirmation}
              onChange={(e) => setData('password_confirmation', e.target.value)}
              autoComplete="new-password"
              className={errors.password_confirmation || (data.password_confirmation && data.password !== data.password_confirmation) ? 'border-red-500' : ''}
            />
            {errors.password_confirmation && <p className="text-red-500 text-sm">{errors.password_confirmation}</p>}
            {data.password_confirmation && data.password !== data.password_confirmation && (
              <p className="text-red-500 text-sm">Passwords do not match</p>
            )}
          </div>
          <div>
            <Label htmlFor="first_name">First Name</Label>
            <div className="relative">
              <Input
                id="first_name"
                value={data.first_name}
                onChange={(e) => setData('first_name', e.target.value)}
                className={`${errors.first_name || validationErrors.first_name ? 'border-red-500' : validationErrors.first_name === null && data.first_name ? 'border-green-500' : ''}`}
                aria-invalid={!!errors.first_name || !!validationErrors.first_name}
              />
              {validationErrors.first_name === null && data.first_name && (
                <CheckCircle className="absolute right-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-green-500" />
              )}
              {validationErrors.first_name && (
                <AlertCircle className="absolute right-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-red-500" />
              )}
            </div>
            {(errors.first_name || validationErrors.first_name) && (
              <p className="text-red-500 text-sm">{errors.first_name || validationErrors.first_name}</p>
            )}
          </div>
          <div>
            <Label htmlFor="last_name">Last Name</Label>
            <div className="relative">
              <Input
                id="last_name"
                value={data.last_name}
                onChange={(e) => setData('last_name', e.target.value)}
                className={`${errors.last_name || validationErrors.last_name ? 'border-red-500' : validationErrors.last_name === null && data.last_name ? 'border-green-500' : ''}`}
                aria-invalid={!!errors.last_name || !!validationErrors.last_name}
              />
              {validationErrors.last_name === null && data.last_name && (
                <CheckCircle className="absolute right-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-green-500" />
              )}
              {validationErrors.last_name && (
                <AlertCircle className="absolute right-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-red-500" />
              )}
            </div>
            {(errors.last_name || validationErrors.last_name) && (
              <p className="text-red-500 text-sm">{errors.last_name || validationErrors.last_name}</p>
            )}
          </div>
          <div>
            <Label htmlFor="phone">Phone (Optional)</Label>
            <div className="relative">
              <Input
                id="phone"
                value={data.phone}
                onChange={(e) => setData('phone', e.target.value)}
                className={`${errors.phone || validationErrors.phone ? 'border-red-500' : validationErrors.phone === null && data.phone ? 'border-green-500' : ''}`}
                aria-invalid={!!errors.phone || !!validationErrors.phone}
              />
              {validationErrors.phone === null && data.phone && (
                <CheckCircle className="absolute right-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-green-500" />
              )}
              {validationErrors.phone && (
                <AlertCircle className="absolute right-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-red-500" />
              )}
            </div>
            {(errors.phone || validationErrors.phone) && (
              <p className="text-red-500 text-sm">{errors.phone || validationErrors.phone}</p>
            )}
          </div>
          <div>
            <Label htmlFor="cgpa">CGPA</Label>
            <div className="relative">
              <Input
                id="cgpa"
                type="number"
                step="0.01"
                min="0"
                max="4"
                value={data.cgpa}
                onChange={(e) => setData('cgpa', e.target.value)}
                className={`${errors.cgpa || validationErrors.cgpa ? 'border-red-500' : validationErrors.cgpa === null && data.cgpa ? 'border-green-500' : ''}`}
                aria-invalid={!!errors.cgpa || !!validationErrors.cgpa}
              />
              {validationErrors.cgpa === null && data.cgpa && (
                <CheckCircle className="absolute right-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-green-500" />
              )}
              {validationErrors.cgpa && (
                <AlertCircle className="absolute right-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-red-500" />
              )}
            </div>
            {(errors.cgpa || validationErrors.cgpa) && (
              <p className="text-red-500 text-sm">{errors.cgpa || validationErrors.cgpa}</p>
            )}
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
          </div>
          <div>
            <Label htmlFor="university_id">University ID (UNid)</Label>
            <div className="relative">
              <Input
                id="university_id"
                placeholder="UGR/12345/12 or UGP/12345/12"
                value={data.university_id}
                onChange={(e) => setData('university_id', e.target.value)}
                className={`${errors.university_id || (!/^(UGR|UGP|TUGR)\/\d{5}\/\d{2}$/.test(data.university_id) && data.university_id) ? 'border-red-500' : ''}`}
                aria-invalid={!!errors.university_id || !!(!/^(UGR|UGP|TUGR)\/\d{5}\/\d{2}$/.test(data.university_id) && data.university_id)}
              />
              {errors.university_id && (
                <AlertCircle className="absolute right-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-red-500" />
              )}
            </div>
            {errors.university_id && <p className="text-red-500 text-sm">{errors.university_id}</p>}
            {!errors.university_id && !/^(UGR|UGP|TUGR)\/\d{5}\/\d{2}$/.test(data.university_id) && data.university_id && (
              <p className="text-red-500 text-sm">Accepted: UGR/12345/12, UGP/12345/12, TUGR/12345/12</p>
            )}
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
            <Button type="submit" disabled={processing || !isFormValid}>
              {processing ? 'Creating...' : 'Create Student'}
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

export default StudentsCreate;