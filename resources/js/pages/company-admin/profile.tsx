import React, { useState, useEffect } from 'react';
import { Head, router, usePage } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  AlertCircle,
  Link,
  X,
  User,
  Save
} from 'lucide-react';
import { type BreadcrumbItem } from '@/types';
import { getImageUrl, handleImageError } from '@/utils/imageUtils';
import { Camera } from 'lucide-react';

interface User {
  user_id: number;
  first_name: string;
  last_name: string;
  email: string;
  phone: string | null;
  username: string;
  avatar?: string | null;
}

interface Company {
  company_id: number;
  name: string;
  industry: string | null;
  location: string | null;
  website: string | null;
  description: string | null;
}

interface Props {
  user: User;
  company: Company | null;
  success?: string;
  error?: string;
}

const breadcrumbs: BreadcrumbItem[] = [
  { title: 'Dashboard', href: '/company-admin' },
  { title: 'Profile', href: '/company-admin/profile' },
  { title: 'Edit Profile', href: null },
];

export default function Profile({ user, company, success, error }: Props) {
  const { errors } = usePage().props as { errors: Record<string, string> };

  const getInitials = (firstName: string | null | undefined, lastName: string | null | undefined) => {
    const first = firstName?.[0] || '';
    const last = lastName?.[0] || '';
    return `${first}${last}`.toUpperCase();
  };

  const [formData, setFormData] = useState({
    first_name: user.first_name,
    last_name: user.last_name,
    email: user.email,
    phone: user.phone || '',
    username: user.username,
    profile_image: null as File | null,
  });

  const [showSuccess, setShowSuccess] = useState(!!success);
  const [showError, setShowError] = useState(!!error);

  useEffect(() => {
    if (success) {
      setShowSuccess(true);
      const timer = setTimeout(() => setShowSuccess(false), 3000);
      return () => clearTimeout(timer);
    }
    if (error) {
      setShowError(true);
      const timer = setTimeout(() => setShowError(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [success, error]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleProfileImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setFormData((prev) => ({ ...prev, profile_image: file }));
  };

  const handleSubmit = () => {
    const data = new FormData();
    data.append('first_name', formData.first_name);
    data.append('last_name', formData.last_name);
    data.append('email', formData.email);
    data.append('phone', formData.phone);
    data.append('username', formData.username);
    if (formData.profile_image) {
      data.append('profile_picture', formData.profile_image);
    }

    router.post('/company-admin/profile', data, {
      onSuccess: () => {
        setShowSuccess(true);
        setTimeout(() => setShowSuccess(false), 3000);
      },
      onError: () => {
        setShowError(true);
        setTimeout(() => setShowError(false), 3000);
      },
    });
  };

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title="Edit Profile" />
      <div className="p-6 space-y-6">
        {/* Profile Header */}
        <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900 dark:to-indigo-900 border-0">
          <CardContent className="p-8">
            <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
              <div className="relative">
                <Avatar className="h-24 w-24">
                  <AvatarImage 
                    src={getImageUrl(user.avatar || '')} 
                    alt={`${user.first_name} ${user.last_name}`}
                    onError={(e) => handleImageError(e)}
                  />
                  <AvatarFallback className="bg-gradient-to-r from-blue-500 to-purple-600 text-white font-semibold text-2xl">
                    {getInitials(user.first_name, user.last_name)}
                  </AvatarFallback>
                </Avatar>
                <label className="absolute -bottom-2 -right-2 bg-white dark:bg-gray-800 rounded-full p-2 shadow-lg cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                  <Camera className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleProfileImageChange}
                  />
                </label>
              </div>
              <div className="flex-1">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                  Edit Your Profile
                </h1>
                <p className="text-lg text-gray-600 dark:text-gray-400 mb-3">
                  Update your personal information and profile image
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Alerts */}
        {showSuccess && success && (
          <Alert className="bg-green-50 dark:bg-green-900/50 border-green-200 dark:border-green-800">
            <AlertCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
            <AlertTitle className="text-green-800 dark:text-green-200 font-semibold">Success</AlertTitle>
            <AlertDescription className="text-green-700 dark:text-green-300 flex justify-between items-center">
              {success}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowSuccess(false)}
                className="text-green-800 dark:text-green-200 hover:bg-green-100 dark:hover:bg-green-800"
                aria-label="Close success alert"
              >
                <X className="h-4 w-4" />
              </Button>
            </AlertDescription>
          </Alert>
        )}
        {showError && error && (
          <Alert className="bg-red-50 dark:bg-red-900/50 border-red-200 dark:border-red-800">
            <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400" />
            <AlertTitle className="text-red-800 dark:text-red-200 font-semibold">Error</AlertTitle>
            <AlertDescription className="text-red-700 dark:text-red-300 flex justify-between items-center">
              {error}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowError(false)}
                className="text-red-800 dark:text-red-200 hover:bg-red-100 dark:hover:bg-red-800"
                aria-label="Close error alert"
              >
                <X className="h-4 w-4" />
              </Button>
            </AlertDescription>
          </Alert>
        )}

        {/* Personal Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Personal Information
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">First Name</Label>
                  <Input
                    name="first_name"
                    value={formData.first_name}
                    onChange={handleChange}
                    className="mt-1"
                  />
                  {errors.first_name && <p className="text-red-500 text-sm mt-1">{errors.first_name}</p>}
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">Last Name</Label>
                  <Input
                    name="last_name"
                    value={formData.last_name}
                    onChange={handleChange}
                    className="mt-1"
                  />
                  {errors.last_name && <p className="text-red-500 text-sm mt-1">{errors.last_name}</p>}
                </div>
              </div>
              <div className="space-y-4">
                <div>
                  <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">Email</Label>
                  <Input
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="mt-1"
                  />
                  {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">Phone</Label>
                  <Input
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    className="mt-1"
                  />
                  {errors.phone && <p className="text-red-500 text-sm mt-1">{errors.phone}</p>}
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">Username</Label>
                  <Input
                    name="username"
                    value={formData.username}
                    onChange={handleChange}
                    className="mt-1"
                  />
                  {errors.username && <p className="text-red-500 text-sm mt-1">{errors.username}</p>}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Company Information (Read-only) */}
        {company && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Company Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">Company Name</Label>
                    <Input
                      value={company.name}
                      disabled
                      className="mt-1 bg-gray-50 dark:bg-gray-800"
                    />
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">Industry</Label>
                    <Input
                      value={company.industry || 'Not specified'}
                      disabled
                      className="mt-1 bg-gray-50 dark:bg-gray-800"
                    />
                  </div>
                </div>
                <div className="space-y-4">
                  <div>
                    <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">Location</Label>
                    <Input
                      value={company.location || 'Not specified'}
                      disabled
                      className="mt-1 bg-gray-50 dark:bg-gray-800"
                    />
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">Website</Label>
                    <Input
                      value={company.website || 'Not specified'}
                      disabled
                      className="mt-1 bg-gray-50 dark:bg-gray-800"
                    />
                  </div>
                </div>
              </div>
              {company.description && (
                <div className="mt-4">
                  <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">Description</Label>
                  <div className="mt-1 p-3 bg-gray-50 dark:bg-gray-800 rounded-md text-sm text-gray-700 dark:text-gray-300">
                    {company.description}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4">
          <Button
            onClick={handleSubmit}
            className="bg-indigo-600 text-white hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600 flex items-center gap-2"
          >
            <Save className="h-4 w-4" />
            Save Profile
          </Button>
          <Button asChild variant="outline" className="border-gray-300 dark:border-gray-600">
            <Link href="/company-admin/profile">Cancel</Link>
          </Button>
        </div>
      </div>
    </AppLayout>
  );
}