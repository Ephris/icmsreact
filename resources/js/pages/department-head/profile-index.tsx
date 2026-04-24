import React from 'react';
import { Head, Link } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import {
  User,
  Mail,
  Phone,
  Building,
  FileText
} from 'lucide-react';
import { getImageUrl, handleImageError } from '@/utils/imageUtils';
import { type BreadcrumbItem } from '@/types';

interface User {
  user_id: number;
  first_name: string;
  last_name: string;
  email: string;
  phone: string | null;
  username: string;
  avatar?: string | null;
  gender?: 'male' | 'female';
}

interface Department {
  department_id: number;
  name: string;
  description: string | null;
}

interface Props {
  user: User;
  department: Department | null;
}

const breadcrumbs: BreadcrumbItem[] = [
  { title: 'Dashboard', href: '/department-head' },
  { title: 'Profile', href: '/department-head/profile' },
];

export default function ProfileIndex({ user, department }: Props) {
  const getInitials = (firstName: string | null | undefined, lastName: string | null | undefined) => {
    const first = firstName?.[0] || '';
    const last = lastName?.[0] || '';
    return `${first}${last}`.toUpperCase();
  };

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title="My Profile" />
      <div className="p-6 space-y-6">
        {/* Profile Header */}
        <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900 dark:to-indigo-900 border-0">
          <CardContent className="p-8">
            <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
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
              <div className="flex-1">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                  {user.first_name} {user.last_name}
                </h1>
                <p className="text-lg text-gray-600 dark:text-gray-400 mb-3">
                  Department Head
                </p>
                <div className="flex flex-wrap gap-2 mb-4">
                  <Badge variant="default">
                    Department Head
                  </Badge>
                  {department && (
                    <Badge variant="secondary">
                      {department.name}
                    </Badge>
                  )}
                </div>
                <Button asChild className="bg-indigo-600 text-white hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600">
                  <Link href="/department-head/profile/edit">Edit Profile</Link>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Profile Details Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Personal Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Personal Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3">
                <Mail className="h-4 w-4 text-gray-500" />
                <div>
                  <p className="text-sm text-gray-500">Email</p>
                  <p className="font-medium">{user.email}</p>
                </div>
              </div>
              <Separator />
              <div className="flex items-center gap-3">
                <Phone className="h-4 w-4 text-gray-500" />
                <div>
                  <p className="text-sm text-gray-500">Phone</p>
                  <p className="font-medium">{user.phone || 'Not provided'}</p>
                </div>
              </div>
              <Separator />
              <div className="flex items-center gap-3">
                <User className="h-4 w-4 text-gray-500" />
                <div>
                  <p className="text-sm text-gray-500">Username</p>
                  <p className="font-medium">{user.username}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Department Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building className="h-5 w-5" />
                Department Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {department ? (
                <>
                  <div className="flex items-center gap-3">
                    <Building className="h-4 w-4 text-gray-500" />
                    <div>
                      <p className="text-sm text-gray-500">Department Name</p>
                      <p className="font-medium">{department.name}</p>
                    </div>
                  </div>
                </>
              ) : (
                <p className="text-gray-500">No department assigned</p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Department Description */}
        {department?.description && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Department Description
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700 dark:text-gray-300">{department.description}</p>
            </CardContent>
          </Card>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4">
          <Button asChild className="bg-indigo-600 text-white hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600">
            <Link href="/department-head/profile/edit">Edit Profile</Link>
          </Button>
          <Button asChild variant="outline" className="border-gray-300 dark:border-gray-600">
            <Link href="/department-head">Back to Dashboard</Link>
          </Button>
        </div>
      </div>
    </AppLayout>
  );
}