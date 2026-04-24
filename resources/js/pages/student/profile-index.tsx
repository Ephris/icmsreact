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
  GraduationCap, 
  Star, 
  MapPin, 
  Briefcase,
  Award,
  ExternalLink,
  Download
} from 'lucide-react';
import { type BreadcrumbItem } from '@/types';
import { getImageUrl, handleImageError } from '@/utils/imageUtils';

interface Student {
  student_id: number;
  first_name: string;
  last_name: string;
  email: string;
  phone: string | null;
  department_id: number | null;
  department_name: string;
  cgpa: number | null;
  year_of_study: string | null;
  skills: string[];
  certifications: string[];
  portfolio: string | null;
  resume: string | null;
  profile_image: string | null;
}

interface Props {
  student: Student;
}

const breadcrumbs: BreadcrumbItem[] = [
  { title: 'Dashboard', href: '/student' },
  { title: 'Profile', href: '/student/profile' },
];

export default function ProfileIndex({ student }: Props) {
  const getInitials = (firstName: string | null | undefined, lastName: string | null | undefined) => {
    const first = firstName?.[0] || '';
    const last = lastName?.[0] || '';
    return `${first}${last}`.toUpperCase();
  };

  const getCGPAStatus = (cgpa: number | null) => {
    if (!cgpa) return { status: 'N/A', color: 'secondary' };
    if (cgpa >= 3.5) return { status: 'Excellent', color: 'default' };
    if (cgpa >= 3.0) return { status: 'Good', color: 'secondary' };
    if (cgpa >= 2.5) return { status: 'Average', color: 'outline' };
    return { status: 'Below Average', color: 'destructive' };
  };

  const cgpaStatus = getCGPAStatus(student.cgpa);

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
                  src={getImageUrl(student.profile_image)}
                  alt={`${student.first_name} ${student.last_name}`}
                  onError={(e) => handleImageError(e)}
                />
                <AvatarFallback className="bg-gradient-to-r from-blue-500 to-purple-600 text-white font-semibold text-2xl">
                  {getInitials(student.first_name, student.last_name)}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                  {student.first_name} {student.last_name}
                </h1>
                <p className="text-lg text-gray-600 dark:text-gray-400 mb-3">
                  {student.department_name}
                </p>
                <div className="flex flex-wrap gap-2 mb-4">
                  <Badge variant={cgpaStatus.color as "default" | "secondary" | "destructive" | "outline"}>
                    {cgpaStatus.status}
                  </Badge>
                  <Badge variant="outline">
                    Year {student.year_of_study || 'N/A'}
                  </Badge>
                </div>
                <Button asChild className="bg-indigo-600 text-white hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600">
                  <Link href="/student/profile/edit">Edit Profile</Link>
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
                  <p className="font-medium">{student.email}</p>
                </div>
              </div>
              <Separator />
              <div className="flex items-center gap-3">
                <Phone className="h-4 w-4 text-gray-500" />
                <div>
                  <p className="text-sm text-gray-500">Phone</p>
                  <p className="font-medium">{student.phone || 'Not provided'}</p>
                </div>
              </div>
              <Separator />
              <div className="flex items-center gap-3">
                <GraduationCap className="h-4 w-4 text-gray-500" />
                <div>
                  <p className="text-sm text-gray-500">Department</p>
                  <p className="font-medium">{student.department_name}</p>
                </div>
              </div>
              <Separator />
              <div className="flex items-center gap-3">
                <User className="h-4 w-4 text-gray-500" />
                <div>
                  <p className="text-sm text-gray-500">Gender</p>
                  <p className="font-medium capitalize">{(student as unknown as { gender?: string }).gender || 'Not set'}</p>
                </div>
              </div>
              <Separator />
              <div className="flex items-center gap-3">
                <Star className="h-4 w-4 text-gray-500" />
                <div>
                  <p className="text-sm text-gray-500">University ID (UNid)</p>
                  <p className="font-medium">{(student as unknown as { university_id?: string }).university_id || 'Not set'}</p>
                </div>
              </div>
              <Separator />
              <div className="flex items-center gap-3">
                <Star className="h-4 w-4 text-gray-500" />
                <div>
                  <p className="text-sm text-gray-500">CGPA</p>
                  <p className="font-medium">{student.cgpa || 'Not provided'}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Academic Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <GraduationCap className="h-5 w-5" />
                Academic Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3">
                <MapPin className="h-4 w-4 text-gray-500" />
                <div>
                  <p className="text-sm text-gray-500">Year of Study</p>
                  <p className="font-medium">Year {student.year_of_study || 'N/A'}</p>
                </div>
              </div>
              <Separator />
              <div className="flex items-center gap-3">
                <Briefcase className="h-4 w-4 text-gray-500" />
                <div>
                  <p className="text-sm text-gray-500">Portfolio</p>
                  {student.portfolio ? (
                    <a 
                      href={student.portfolio} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
                    >
                      View Portfolio
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  ) : (
                    <p className="text-gray-500">Not provided</p>
                  )}
                </div>
              </div>
              <Separator />
              <div className="flex items-center gap-3">
                <Download className="h-4 w-4 text-gray-500" />
                <div>
                  <p className="text-sm text-gray-500">Resume</p>
                  {student.resume ? (
                    <a 
                      href={student.resume} 
                      download 
                      className="text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
                    >
                      Download Resume
                      <Download className="h-3 w-3" />
                    </a>
                  ) : (
                    <p className="text-gray-500">Not uploaded</p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Skills and Certifications */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Award className="h-5 w-5" />
                Skills
              </CardTitle>
            </CardHeader>
            <CardContent>
              {Array.isArray(student.skills) && student.skills.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {student.skills.map((skill, index) => (
                    <Badge key={index} variant="secondary" className="text-sm">
                      {skill}
                    </Badge>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500">No skills listed</p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Award className="h-5 w-5" />
                Certifications
              </CardTitle>
            </CardHeader>
            <CardContent>
              {Array.isArray(student.certifications) && student.certifications.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {student.certifications.map((cert, index) => (
                    <Badge key={index} variant="outline" className="text-sm">
                      {cert}
                    </Badge>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500">No certifications listed</p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4">
          <Button asChild className="bg-indigo-600 text-white hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600">
            <Link href="/student/profile/edit">Edit Profile</Link>
          </Button>
          <Button asChild variant="outline" className="border-gray-300 dark:border-gray-600">
            <Link href="/student">Back to Dashboard</Link>
          </Button>
        </div>
      </div>
    </AppLayout>
  );
}