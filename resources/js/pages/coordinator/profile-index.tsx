import React from 'react';
import { Head, Link } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  User
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
}

interface Props {
  user: User;
}

const breadcrumbs: BreadcrumbItem[] = [
  { title: 'Dashboard', href: '/coordinator' },
  { title: 'Profile', href: '/coordinator/profile' },
];

export default function ProfileIndex({ user }: Props) {
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
                  Coordinator
                </p>
                <div className="flex flex-wrap gap-2 mb-4">
                  <Badge variant="default">
                    Coordinator
                  </Badge>
                </div>
                <Button asChild className="bg-indigo-600 text-white hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600">
                  <Link href="/coordinator/profile/edit">Edit Profile</Link>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Profile Details */}
        <div className="grid grid-cols-1 gap-6">
          {/* Personal Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Personal Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                    <tr>
                      <td className="py-3 px-4 text-sm font-medium text-gray-500 dark:text-gray-400 w-1/3">Profile Image</td>
                      <td className="py-3 px-4">
                        <Avatar className="h-16 w-16">
                          <AvatarImage 
                            src={getImageUrl(user.avatar || '')} 
                            alt={`${user.first_name} ${user.last_name}`}
                            onError={(e) => handleImageError(e)}
                          />
                          <AvatarFallback className="bg-gradient-to-r from-blue-500 to-purple-600 text-white font-semibold">
                            {getInitials(user.first_name, user.last_name)}
                          </AvatarFallback>
                        </Avatar>
                      </td>
                    </tr>
                    <tr>
                      <td className="py-3 px-4 text-sm font-medium text-gray-500 dark:text-gray-400">Email</td>
                      <td className="py-3 px-4 text-gray-900 dark:text-gray-100">{user.email}</td>
                    </tr>
                    <tr>
                      <td className="py-3 px-4 text-sm font-medium text-gray-500 dark:text-gray-400">Phone</td>
                      <td className="py-3 px-4 text-gray-900 dark:text-gray-100">{user.phone || 'Not provided'}</td>
                    </tr>
                    <tr>
                      <td className="py-3 px-4 text-sm font-medium text-gray-500 dark:text-gray-400">Username</td>
                      <td className="py-3 px-4 text-gray-900 dark:text-gray-100">{user.username}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>


        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4">
          <Button asChild className="bg-indigo-600 text-white hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600">
            <Link href="/coordinator/profile/edit">Edit Profile</Link>
          </Button>
          <Button asChild variant="outline" className="border-gray-300 dark:border-gray-600">
            <Link href="/coordinator">Back to Dashboard</Link>
          </Button>
        </div>
      </div>
    </AppLayout>
  );
}