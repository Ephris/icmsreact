import React, { useEffect, useState } from 'react';
import { Head, useForm } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { FormEventHandler } from 'react';
import { Label } from '@/components/ui/label';
import { Link } from '@inertiajs/react';
import { Separator } from '@/components/ui/separator';
import { X, CheckCircle, AlertCircle } from 'lucide-react';

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

interface Props {
  success?: string;
  error?: string;
}

export default function SupervisorsCreate({ success: initialSuccess, error: initialError }: Props) {
  const [showSuccess, setShowSuccess] = useState(!!initialSuccess);
  const [showError, setShowError] = useState(!!initialError);
  const [validationErrors, setValidationErrors] = useState<Record<string, string | null>>({});
  const [isFormValid, setIsFormValid] = useState(false);
  
  const { data, setData, post, processing, errors } = useForm({
    first_name: '',
    last_name: '',
    email: '',
    username: '',
    password: '',
    phone: '',
    specialization: '',
    gender: '',
    status: 'active',
  });

  useEffect(() => {
    if (initialSuccess) {
      setShowSuccess(true);
      const timer = setTimeout(() => setShowSuccess(false), 2000);
      return () => clearTimeout(timer);
    }
  }, [initialSuccess]);

  useEffect(() => {
    if (initialError) {
      setShowError(true);
      const timer = setTimeout(() => setShowError(false), 2000);
      return () => clearTimeout(timer);
    }
  }, [initialError]);

  // Real-time validation
  useEffect(() => {
    const firstNameError = validateName(data.first_name);
    const lastNameError = validateName(data.last_name);
    const emailError = validateEmail(data.email);
    const usernameError = validateUsername(data.username);
    const phoneError = validatePhone(data.phone);
    
    setValidationErrors({
      first_name: firstNameError,
      last_name: lastNameError,
      email: emailError,
      username: usernameError,
      phone: phoneError,
    });
    
    setIsFormValid(!firstNameError && !lastNameError && !emailError && !usernameError && data.password.length >= 6);
  }, [data.first_name, data.last_name, data.email, data.username, data.phone, data.password]);

  const handleSubmit: FormEventHandler = (e) => {
    e.preventDefault();
    
    // Final validation before submit
    const firstNameError = validateName(data.first_name);
    const lastNameError = validateName(data.last_name);
    const emailError = validateEmail(data.email);
    const usernameError = validateUsername(data.username);
    const phoneError = validatePhone(data.phone);
    
    if (firstNameError || lastNameError || emailError || usernameError || phoneError) {
      setValidationErrors({
        first_name: firstNameError,
        last_name: lastNameError,
        email: emailError,
        username: usernameError,
        phone: phoneError,
      });
      return;
    }
    
    post('/company-admin/supervisorsstore', {
      onError: () => console.error('Form errors:', errors),
    });
  };

  return (
    <AppLayout>
      <Head title="Create Supervisor" />
      <div className="p-6">
        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle className="text-2xl font-semibold">Create Supervisor</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {showSuccess && initialSuccess && (
              <div className="bg-green-100 p-4 rounded-lg flex justify-between items-center">
                <span>{initialSuccess}</span>
                <Button variant="ghost" onClick={() => setShowSuccess(false)} aria-label="Close success message">
                  <X className="h-4 w-4" />
                </Button>
              </div>
            )}
            {showError && initialError && (
              <div className="bg-red-100 p-4 rounded-lg flex justify-between items-center">
                <span>{initialError}</span>
                <Button variant="ghost" onClick={() => setShowError(false)} aria-label="Close error message">
                  <X className="h-4 w-4" />
                </Button>
              </div>
            )}
            <Separator />
            <form onSubmit={handleSubmit} className="space-y-6" autoComplete="off">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="first_name" className="font-semibold">First Name</Label>
                  <div className="relative">
                    <Input
                      id="first_name"
                      value={data.first_name}
                      onChange={(e) => setData('first_name', e.target.value)}
                      placeholder="First Name"
                      className={`mt-1 ${errors.first_name || validationErrors.first_name ? 'border-red-500' : validationErrors.first_name === null && data.first_name ? 'border-green-500' : ''}`}
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
                    <span className="text-red-500 text-sm mt-1">
                      {errors.first_name || validationErrors.first_name}
                    </span>
                  )}
                </div>
                <div>
                  <Label htmlFor="last_name" className="font-semibold">Last Name</Label>
                  <div className="relative">
                    <Input
                      id="last_name"
                      value={data.last_name}
                      onChange={(e) => setData('last_name', e.target.value)}
                      placeholder="Last Name"
                      className={`mt-1 ${errors.last_name || validationErrors.last_name ? 'border-red-500' : validationErrors.last_name === null && data.last_name ? 'border-green-500' : ''}`}
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
                    <span className="text-red-500 text-sm mt-1">
                      {errors.last_name || validationErrors.last_name}
                    </span>
                  )}
                </div>
                <div>
                  <Label htmlFor="email" className="font-semibold">Email</Label>
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
                      placeholder="Email"
                      className={`mt-1 ${errors.email || validationErrors.email ? 'border-red-500' : validationErrors.email === null && data.email ? 'border-green-500' : ''}`}
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
                    <span className="text-red-500 text-sm mt-1">
                      {errors.email || validationErrors.email}
                    </span>
                  )}
                </div>
                <div>
                  <Label htmlFor="username" className="font-semibold">Username</Label>
                  <div className="relative">
                    <Input
                      id="username"
                      value={data.username}
                      onChange={(e) => setData('username', e.target.value)}
                      autoComplete="off"
                      placeholder="Username"
                      className={`mt-1 ${errors.username || validationErrors.username ? 'border-red-500' : validationErrors.username === null && data.username ? 'border-green-500' : ''}`}
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
                    <span className="text-red-500 text-sm mt-1">
                      {errors.username || validationErrors.username}
                    </span>
                  )}
                </div>
                <div>
                  <Label htmlFor="password" className="font-semibold">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    value={data.password}
                    onChange={(e) => setData('password', e.target.value)}
                    autoComplete="new-password"
                    placeholder="Password"
                    className="mt-1"
                    aria-invalid={!!errors.password}
                  />
                  {errors.password && <span className="text-red-500 text-sm mt-1">{errors.password}</span>}
                </div>
                <div>
                  <Label htmlFor="phone" className="font-semibold">Phone (Optional)</Label>
                  <div className="relative">
                    <Input
                      id="phone"
                      value={data.phone}
                      onChange={(e) => setData('phone', e.target.value)}
                      placeholder="Phone"
                      className={`mt-1 ${errors.phone || validationErrors.phone ? 'border-red-500' : validationErrors.phone === null && data.phone ? 'border-green-500' : ''}`}
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
                    <span className="text-red-500 text-sm mt-1">
                      {errors.phone || validationErrors.phone}
                    </span>
                  )}
                </div>
                <div>
                  <Label htmlFor="specialization" className="font-semibold">Specialization</Label>
                  <Input
                    id="specialization"
                    value={data.specialization}
                    onChange={(e) => setData('specialization', e.target.value)}
                    placeholder="Specialization"
                    className="mt-1"
                    aria-invalid={!!errors.specialization}
                  />
                  {errors.specialization && <span className="text-red-500 text-sm mt-1">{errors.specialization}</span>}
                </div>
                <div>
                  <Label htmlFor="gender" className="font-semibold">Gender</Label>
                  <Select value={data.gender} onValueChange={(value) => setData('gender', value)}>
                    <SelectTrigger id="gender" className="mt-1">
                      <SelectValue placeholder="Select gender" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="male">Male</SelectItem>
                      <SelectItem value="female">Female</SelectItem>
                    </SelectContent>
                  </Select>
                  {errors.gender && <span className="text-red-500 text-sm mt-1">{errors.gender}</span>}
                </div>
                <div>
                  <Label htmlFor="status" className="font-semibold">Status</Label>
                  <Select value={data.status} onValueChange={(value) => setData('status', value)}>
                    <SelectTrigger id="status" className="mt-1">
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="inactive">Inactive</SelectItem>
                    </SelectContent>
                  </Select>
                  {errors.status && <span className="text-red-500 text-sm mt-1">{errors.status}</span>}
                </div>
              </div>
              <Separator />
              <div className="flex gap-4">
                <Button type="submit" disabled={processing || !isFormValid} className="bg-blue-600 hover:bg-blue-700">
                  Create Supervisor
                </Button>
                <Link href="/company-admin">
                  <Button variant="outline">Cancel</Button>
                </Link>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}