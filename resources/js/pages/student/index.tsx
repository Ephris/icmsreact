import React, { useState, useEffect } from 'react';
import { Head, Link } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { 
  AlertCircle, 
  X, 
  User, 
  FileText, 
  Briefcase, 
  GraduationCap, 
  Calendar,
  CheckCircle,
  Clock,
  XCircle,
  Award,
  Mail,
  Star,
  Activity,
  Target,
  BookOpen
} from 'lucide-react';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis } from 'recharts';
import { getImageUrl } from '@/utils/imageUtils';

interface Student {
  student_id: number;
  name: string;
  email: string;
  department: string;
  cgpa: number | null;
  year_of_study: string | null;
  profile_image: string | null;
}

interface Applications {
  total: number;
  pending: number;
  accepted: number;
  rejected: number;
  completed?: number;
}

interface Postings {
  total: number;
  internships: number;
  careers: number;
}

interface Props {
  student: Student;
  applications: Applications;
  postings: Postings;
  warningMessage?: string | null;
  hasCompletedApplication?: boolean;
  analyticsId?: number | null;
  success?: string;
  error?: string;
}

// Chart configuration
const chartConfig = {
  applications: {
    label: 'Applications',
  },
  postings: {
    label: 'Postings',
  },
};

const breadcrumbs: BreadcrumbItem[] = [
  { title: 'Dashboard', href: '/student' },
];

export default function StudentDashboard({ student, applications, postings, warningMessage, hasCompletedApplication, analyticsId, success, error }: Props) {
  const [showSuccess, setShowSuccess] = useState(!!success);
  const [showError, setShowError] = useState(!!error);

  useEffect(() => {
    if (success) {
      setShowSuccess(true);
      const timer = setTimeout(() => setShowSuccess(false), 5000);
      return () => clearTimeout(timer);
    }
    if (error) {
      setShowError(true);
      const timer = setTimeout(() => setShowError(false), 5000);
      return () => clearTimeout(timer);
    }
  }, [success, error]);

  // Prepare chart data
  const applicationChartData = [
    { name: 'Pending', value: applications.pending, color: '#f59e0b' },
    { name: 'Accepted', value: applications.accepted, color: '#10b981' },
    { name: 'Rejected', value: applications.rejected, color: '#ef4444' },
  ].filter(item => item.value > 0);

  const postingChartData = [
    { name: 'Internships', value: postings.internships, color: '#8b5cf6' },
    { name: 'Careers', value: postings.careers, color: '#06b6d4' },
  ].filter(item => item.value > 0);

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  const getCGPAStatus = (cgpa: number | null) => {
    if (!cgpa) return { status: 'N/A', color: 'secondary' };
    if (cgpa >= 3.5) return { status: 'Excellent', color: 'default' };
    if (cgpa >= 3.0) return { status: 'Good', color: 'secondary' };
    if (cgpa >= 2.5) return { status: 'Average', color: 'outline' };
    return { status: 'Below Average', color: 'destructive' };
  };

  const cgpaStatus = getCGPAStatus(student.cgpa);

  if (!student) {
    return (
      <AppLayout breadcrumbs={breadcrumbs}>
        <Head title="Student Dashboard" />
        <div className="p-6">
          <Alert className="bg-yellow-50 dark:bg-yellow-900/50 border-yellow-200 dark:border-yellow-800">
            <AlertCircle className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
            <AlertTitle className="text-yellow-800 dark:text-yellow-200 font-semibold">Loading</AlertTitle>
            <AlertDescription className="text-yellow-700 dark:text-yellow-300">
              Student information is loading. Please wait.
            </AlertDescription>
          </Alert>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title="Student Dashboard" />
      <div className="p-6 space-y-6">
        {/* Welcome Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Welcome back, {student.name.split(' ')[0]}! 👋
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Here's what's happening with your internship applications today.
            </p>
          </div>
          <div className="flex items-center space-x-4">
            <Avatar className="h-12 w-12">
              <AvatarImage src={getImageUrl(student.profile_image)} alt={student.name} />
              <AvatarFallback className="bg-gradient-to-r from-blue-500 to-purple-600 text-white font-semibold">
                {getInitials(student.name)}
              </AvatarFallback>
            </Avatar>
          </div>
        </div>

        {/* Alerts */}
            {showSuccess && success && (
              <Alert className="bg-green-50 dark:bg-green-900/50 border-green-200 dark:border-green-800">
            <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
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
            <XCircle className="h-5 w-5 text-red-600 dark:text-red-400" />
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

        {/* Internship Ending Warning (only before analytics is available) */}
        {warningMessage && !analyticsId && (
          <Alert className="bg-yellow-50 dark:bg-yellow-900/50 border-yellow-200 dark:border-yellow-800">
            <AlertCircle className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
            <AlertTitle className="text-yellow-800 dark:text-yellow-200 font-semibold">Internship Ending Soon</AlertTitle>
            <AlertDescription className="text-yellow-700 dark:text-yellow-300">
              {warningMessage}
            </AlertDescription>
          </Alert>
        )}

        {/* Completed Application Analytics */}
        {hasCompletedApplication && analyticsId && (
          <Alert className="bg-blue-50 dark:bg-blue-900/50 border-blue-200 dark:border-blue-800">
            <CheckCircle className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            <AlertTitle className="text-blue-800 dark:text-blue-200 font-semibold">Internship Completed</AlertTitle>
            <AlertDescription className="text-blue-700 dark:text-blue-300 flex justify-between items-center">
              <span>Your internship analytics are available. View your performance evaluation.</span>
              <Link href={route('student.analytics.view', analyticsId)}>
                <Button size="sm" className="ml-4">
                  View Analytics
                </Button>
              </Link>
            </AlertDescription>
          </Alert>
        )}

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Link href="/student/applications" className="block">
            <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white border-0 cursor-pointer hover:shadow-xl transition-all duration-300 transform hover:scale-105 group">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-100 text-sm font-medium">Total Applications</p>
                    <p className="text-3xl font-bold group-hover:scale-110 transition-transform">{applications.total}</p>
                </div>
                  <FileText className="h-8 w-8 text-blue-200 group-hover:scale-110 transition-transform" />
              </div>
            </CardContent>
          </Card>
          </Link>

          <Link href="/student/applications?status=accepted" className="block">
            <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white border-0 cursor-pointer hover:shadow-xl transition-all duration-300 transform hover:scale-105 group">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-100 text-sm font-medium">Accepted</p>
                    <p className="text-3xl font-bold group-hover:scale-110 transition-transform">{applications.accepted}</p>
                </div>
                  <CheckCircle className="h-8 w-8 text-green-200 group-hover:scale-110 transition-transform" />
              </div>
            </CardContent>
          </Card>
          </Link>

          <Link href="/student/postings" className="block">
            <Card className="bg-gradient-to-r from-purple-500 to-purple-600 text-white border-0 cursor-pointer hover:shadow-xl transition-all duration-300 transform hover:scale-105 group">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-purple-100 text-sm font-medium">Available Postings</p>
                    <p className="text-3xl font-bold group-hover:scale-110 transition-transform">{postings.total}</p>
                </div>
                  <Briefcase className="h-8 w-8 text-purple-200 group-hover:scale-110 transition-transform" />
              </div>
            </CardContent>
          </Card>
          </Link>

          <Link href="/student/applications?status=pending" className="block">
            <Card className="bg-gradient-to-r from-orange-500 to-orange-600 text-white border-0 cursor-pointer hover:shadow-xl transition-all duration-300 transform hover:scale-105 group">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-orange-100 text-sm font-medium">Pending</p>
                    <p className="text-3xl font-bold group-hover:scale-110 transition-transform">{applications.pending}</p>
                </div>
                  <Clock className="h-8 w-8 text-orange-200 group-hover:scale-110 transition-transform" />
              </div>
            </CardContent>
          </Card>
          </Link>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Profile Card */}
          <Card className="lg:col-span-1">
                <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Profile Overview
              </CardTitle>
                </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-4">
                <Avatar className="h-16 w-16">
                  <AvatarImage src={getImageUrl(student.profile_image)} alt={student.name} />
                  <AvatarFallback className="bg-gradient-to-r from-blue-500 to-purple-600 text-white font-semibold text-lg">
                    {getInitials(student.name)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="font-semibold text-lg">{student.name}</h3>
                  <p className="text-gray-600 dark:text-gray-400">{student.department}</p>
                  <Badge variant={cgpaStatus.color as "default" | "secondary" | "destructive" | "outline"} className="mt-1">
                    {cgpaStatus.status}
                  </Badge>
                </div>
              </div>
              
              <Separator />
              
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <Mail className="h-4 w-4 text-gray-500" />
                  <span className="text-sm">{student.email}</span>
                </div>
                <div className="flex items-center gap-3">
                  <GraduationCap className="h-4 w-4 text-gray-500" />
                  <span className="text-sm">Year {student.year_of_study || 'N/A'}</span>
                </div>
                <div className="flex items-center gap-3">
                  <Star className="h-4 w-4 text-gray-500" />
                  <span className="text-sm">CGPA: {student.cgpa || 'N/A'}</span>
                </div>
              </div>

              <Button asChild className="w-full">
                    <Link href="/student/profile">Edit Profile</Link>
                  </Button>
                </CardContent>
              </Card>

          {/* Charts Section */}
          <div className="lg:col-span-2 space-y-6">
            {/* Application Status Chart */}
              <Link href="/student/applications" className="block">
                <Card className="cursor-pointer hover:shadow-xl transition-all duration-300 group">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                  <Activity className="h-5 w-5" />
                  Application Status
                </CardTitle>
                </CardHeader>
                <CardContent>
                {applicationChartData.length > 0 ? (
                  <ChartContainer config={chartConfig} className="h-[300px]">
                    <PieChart>
                      <Pie
                        data={applicationChartData}
                        dataKey="value"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        outerRadius={100}
                        label={({ name, value }) => `${name}: ${value}`}
                      >
                        {applicationChartData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <ChartTooltip content={<ChartTooltipContent />} />
                    </PieChart>
                  </ChartContainer>
                ) : (
                  <div className="h-[300px] flex items-center justify-center text-gray-500">
                    <div className="text-center">
                      <FileText className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                      <p>No applications yet</p>
                      <p className="text-sm">Start applying to see your progress here</p>
                    </div>
                  </div>
                )}
                </CardContent>
              </Card>
              </Link>

            {/* Posting Types Chart */}
              <Link href="/student/postings" className="block">
                <Card className="cursor-pointer hover:shadow-xl transition-all duration-300 group">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                  <Target className="h-5 w-5" />
                  Available Opportunities
                </CardTitle>
                </CardHeader>
                <CardContent>
                {postingChartData.length > 0 ? (
                  <ChartContainer config={chartConfig} className="h-[300px]">
                    <BarChart data={postingChartData}>
                      <XAxis dataKey="name" />
                      <YAxis />
                      <ChartTooltip content={<ChartTooltipContent />} />
                      <Bar dataKey="value" fill="#8884d8" />
                    </BarChart>
                  </ChartContainer>
                ) : (
                  <div className="h-[300px] flex items-center justify-center text-gray-500">
                    <div className="text-center">
                      <Briefcase className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                      <p>No postings available</p>
                      <p className="text-sm">Check back later for new opportunities</p>
                    </div>
                  </div>
                )}
                </CardContent>
              </Card>
              </Link>
          </div>
        </div>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="h-5 w-5" />
              Quick Actions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Button asChild variant="outline" className="h-20 flex-col gap-2">
                <Link href="/student/postings">
                  <Briefcase className="h-6 w-6" />
                  Browse Postings
                </Link>
              </Button>
              <Button asChild variant="outline" className="h-20 flex-col gap-2">
                <Link href="/student/applications">
                  <FileText className="h-6 w-6" />
                  My Applications
                </Link>
              </Button>
              <Button asChild variant="outline" className="h-20 flex-col gap-2">
                <Link href="/student/application-letter">
                  <Award className="h-6 w-6" />
                  Application Letter
                </Link>
              </Button>
              <Button asChild variant="outline" className="h-20 flex-col gap-2">
                <Link href="/student/forms">
                  <Calendar className="h-6 w-6" />
                  Forms
                </Link>
              </Button>
              <Button asChild variant="outline" className="h-20 flex-col gap-2">
                <Link href="/student/success-story">
                  <Star className="h-6 w-6" />
                  Share Success Story
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}