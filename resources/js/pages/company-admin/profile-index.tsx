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
  MapPin,
  Globe,
  FileText,
  ExternalLink
} from 'lucide-react';
import { type BreadcrumbItem } from '@/types';
import { getImageUrl, handleImageError } from '@/utils/imageUtils';

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
  logo?: string | null;
}

interface Props {
  user: User;
  company: Company | null;
}

const breadcrumbs: BreadcrumbItem[] = [
  { title: 'Dashboard', href: '/company-admin' },
  { title: 'Profile', href: '/company-admin/profile' },
];

export default function ProfileIndex({ user, company }: Props) {
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
                  Company Administrator
                </p>
                <div className="flex flex-wrap gap-2 mb-4">
                  <Badge variant="default">
                    Company Admin
                  </Badge>
                  {company && (
                    <Badge variant="secondary">
                      {company.name}
                    </Badge>
                  )}
                </div>
                <div className="flex gap-3">
                  <Button asChild className="bg-indigo-600 text-white hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600">
                    <Link href="/company-admin/profile/edit">Edit Profile</Link>
                  </Button>
                  <Button asChild variant="outline" className="border-indigo-300 text-indigo-600 hover:bg-indigo-50 dark:border-indigo-600 dark:text-indigo-400 dark:hover:bg-indigo-900">
                    <Link href="/company-admin/company/edit">Edit Company</Link>
                  </Button>
                </div>
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
                      <td className="py-3 px-4 text-sm font-medium text-gray-500 dark:text-gray-400 flex items-center gap-2">
                        <Mail className="h-4 w-4" />
                        Email
                      </td>
                      <td className="py-3 px-4 text-gray-900 dark:text-gray-100">{user.email}</td>
                    </tr>
                    <tr>
                      <td className="py-3 px-4 text-sm font-medium text-gray-500 dark:text-gray-400 flex items-center gap-2">
                        <Phone className="h-4 w-4" />
                        Phone
                      </td>
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

          {/* Company Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building className="h-5 w-5" />
                Company Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {company ? (
                <>
                  <div className="flex items-center gap-3">
                    <Building className="h-4 w-4 text-gray-500" />
                    <div>
                      <p className="text-sm text-gray-500">Company Name</p>
                      <p className="font-medium">{company.name}</p>
                    </div>
                  </div>
                  <Separator />
                  <div className="flex items-center gap-3">
                    <FileText className="h-4 w-4 text-gray-500" />
                    <div>
                      <p className="text-sm text-gray-500">Industry</p>
                      <p className="font-medium">{company.industry || 'Not specified'}</p>
                    </div>
                  </div>
                  <Separator />
                  <div className="flex items-center gap-3">
                    <MapPin className="h-4 w-4 text-gray-500" />
                    <div>
                      <p className="text-sm text-gray-500">Location</p>
                      <p className="font-medium">{company.location || 'Not specified'}</p>
                    </div>
                  </div>
                  <Separator />
                  <div className="flex items-center gap-3">
                    <Globe className="h-4 w-4 text-gray-500" />
                    <div>
                      <p className="text-sm text-gray-500">Website</p>
                      {company.website ? (
                        <a
                          href={company.website}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
                        >
                          Visit Website
                          <ExternalLink className="h-3 w-3" />
                        </a>
                      ) : (
                        <p className="text-gray-500">Not provided</p>
                      )}
                    </div>
                  </div>
                  {company.logo && (
                    <>
                      <Separator />
                      <div className="flex items-center gap-3">
                        <div className="h-4 w-4 bg-gray-500 rounded"></div>
                        <div>
                          <p className="text-sm text-gray-500">Company Logo</p>
                          <Avatar className="h-12 w-12">
                            <AvatarImage
                              src={getImageUrl(company.logo)}
                              alt={`${company.name} logo`}
                              onError={(e) => handleImageError(e)}
                            />
                            <AvatarFallback className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-semibold">
                              {company.name.charAt(0).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                        </div>
                      </div>
                    </>
                  )}
                </>
              ) : (
                <p className="text-gray-500">No company assigned</p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Company Description */}
        {company?.description && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Company Description
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700 dark:text-gray-300">{company.description}</p>
            </CardContent>
          </Card>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4">
          <Button asChild className="bg-indigo-600 text-white hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600">
            <Link href="/company-admin/profile/edit">Edit Profile</Link>
          </Button>
          <Button asChild variant="outline" className="border-gray-300 dark:border-gray-600">
            <Link href="/company-admin">Back to Dashboard</Link>
          </Button>
        </div>
      </div>
    </AppLayout>
  );
}