"use client";

import React, { useState, useEffect } from 'react';
import { Head, Link } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle, Briefcase, Users, FileText, X } from 'lucide-react';
import { Bar, BarChart, CartesianGrid, XAxis, YAxis, Pie, PieChart } from 'recharts';
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
} from '@/components/ui/chart';
import { type BreadcrumbItem } from '@/types';

interface Company {
  company_id: number;
  name: string;
}

interface Supervisor {
  user_id: number;
  name: string;
  email: string;
  phone?: string;
  specialization?: string;
  status: string;
}

interface PaginationData {
  current_page: number;
  last_page: number;
  data?: Supervisor[];
  total: number;
}

interface Postings {
  internships: number;
  careers: number;
  drafts: number;
  total: number;
}

interface Applications {
  pending: number;
}

interface Props {
  company: Company;
  supervisors: PaginationData;
  postings: Postings;
  applications: Applications;
  success?: string;
  error?: string;
}

const breadcrumbs: BreadcrumbItem[] = [
  { title: 'Dashboard', href: '/company-admin' },
];

const supervisorChartConfig = {
  count: {
    label: 'Supervisors',
  },
  active: {
    label: 'Active',
    color: 'hsl(255, 65%, 60%)', // Indigo
  },
  inactive: {
    label: 'Inactive',
    color: 'hsl(0, 65%, 60%)', // Red
  },
} satisfies ChartConfig;

const postingsChartConfig = {
  count: {
    label: 'Postings',
  },
  internships: {
    label: 'Internships',
    color: 'hsl(255, 65%, 60%)', // Indigo
  },
  careers: {
    label: 'Careers',
    color: 'hsl(220, 65%, 60%)', // Blue
  },
  drafts: {
    label: 'Drafts',
    color: 'hsl(30, 70%, 50%)', // Orange
  },
} satisfies ChartConfig;

export default function Index({ company, supervisors, postings, applications, success: initialSuccess, error: initialError }: Props) {
  const [showSuccess, setShowSuccess] = useState(!!initialSuccess);
  const [showError, setShowError] = useState(!!initialError);

  useEffect(() => {
    console.log('Index component mounted', {
      company,
      supervisors: { count: supervisors?.data?.length || 0, total: supervisors?.total || 0, current_page: supervisors?.current_page || 1, last_page: supervisors?.last_page || 1 },
      postings,
      applications,
      success: initialSuccess,
      error: initialError,
    });

    if (initialSuccess) {
      setShowSuccess(true);
      const timer = setTimeout(() => setShowSuccess(false), 3000);
      return () => clearTimeout(timer);
    }
    if (initialError) {
      setShowError(true);
      const timer = setTimeout(() => setShowError(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [initialSuccess, initialError, company, supervisors, postings, applications]);

  const supervisorChartData = [
    { status: 'active', count: (supervisors?.data || []).filter((s: Supervisor) => s?.status && s.status.toLowerCase() === 'active').length, fill: supervisorChartConfig.active.color },
    { status: 'inactive', count: (supervisors?.data || []).filter((s: Supervisor) => s?.status && s.status.toLowerCase() === 'inactive').length, fill: supervisorChartConfig.inactive.color },
  ];

  const postingsChartData = [
    { category: 'Internships', count: postings?.internships || 0, fill: postingsChartConfig.internships.color },
    { category: 'Careers', count: postings?.careers || 0, fill: postingsChartConfig.careers.color },
    { category: 'Drafts', count: postings?.drafts || 0, fill: postingsChartConfig.drafts.color },
  ];

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title="Company Admin Dashboard" />
      <div className="p-6 space-y-6">
        <Card className="shadow-lg border-none bg-white dark:bg-gray-800 rounded-2xl overflow-hidden transition-all duration-300 hover:shadow-xl">
          <CardHeader className="bg-gradient-to-r from-indigo-500 to-blue-600 dark:from-indigo-700 dark:to-blue-800 p-6 rounded-t-2xl transform transition-transform duration-300 hover:scale-[1.01]">
            <CardTitle className="text-2xl font-bold text-white tracking-tight">Welcome, {company?.name || 'Company Admin'}</CardTitle>
          </CardHeader>
          <CardContent className="p-6 space-y-6">
            {showSuccess && initialSuccess && (
              <Alert className="bg-green-100 dark:bg-green-900/30 border-green-300 dark:border-green-700 animate-in fade-in slide-in-from-top-2 duration-500">
                <AlertCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
                <AlertTitle className="text-green-800 dark:text-green-200 font-semibold">Success</AlertTitle>
                <AlertDescription className="text-green-700 dark:text-green-300 flex justify-between items-center">
                  {initialSuccess}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowSuccess(false)}
                    className="text-green-800 dark:text-green-200 hover:bg-green-200 dark:hover:bg-green-800/50 transition-colors duration-200"
                    aria-label="Dismiss success message"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </AlertDescription>
              </Alert>
            )}
            {showError && initialError && (
              <Alert className="bg-red-100 dark:bg-red-900/30 border-red-300 dark:border-red-700 animate-in fade-in slide-in-from-top-2 duration-500">
                <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400" />
                <AlertTitle className="text-red-800 dark:text-red-200 font-semibold">Error</AlertTitle>
                <AlertDescription className="text-red-700 dark:text-red-300 flex justify-between items-center">
                  {initialError}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowError(false)}
                    className="text-red-800 dark:text-red-200 hover:bg-red-200 dark:hover:bg-red-800/50 transition-colors duration-200"
                    aria-label="Dismiss error message"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </AlertDescription>
              </Alert>
            )}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="border-none shadow-lg bg-white dark:bg-gray-800 rounded-2xl hover:shadow-xl transition-all duration-300 cursor-pointer group">
                <Link href="/company-admin/supervisors" className="block">
                  <CardHeader>
                    <CardTitle className="text-lg font-semibold text-gray-900 dark:text-gray-100 flex items-center group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                      <Users className="h-5 w-5 mr-2 text-indigo-600 dark:text-indigo-400" /> Supervisors
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-3xl font-bold text-indigo-600 dark:text-indigo-400 group-hover:scale-110 transition-transform">{supervisors?.total || 0}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Total Supervisors</p>
                    <Button
                      className="mt-4 bg-gradient-to-r from-indigo-500 to-blue-600 dark:from-indigo-600 dark:to-blue-700 text-white rounded-full hover:from-indigo-600 hover:to-blue-700 dark:hover:from-indigo-700 dark:hover:to-blue-800 transition-all duration-300 transform hover:scale-105"
                    >
                      Manage Supervisors
                    </Button>
                  </CardContent>
                </Link>
              </Card>
              <Card className="border-none shadow-lg bg-white dark:bg-gray-800 rounded-2xl hover:shadow-xl transition-all duration-300 cursor-pointer group">
                <Link href="/company-admin/postings" className="block">
                  <CardHeader>
                    <CardTitle className="text-lg font-semibold text-gray-900 dark:text-gray-100 flex items-center group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                      <Briefcase className="h-5 w-5 mr-2 text-indigo-600 dark:text-indigo-400" /> Postings
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-3xl font-bold text-indigo-600 dark:text-indigo-400 group-hover:scale-110 transition-transform">{(postings?.total || 0) - (postings?.drafts || 0)}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Active Postings</p>
                    <Button
                      className="mt-4 bg-gradient-to-r from-indigo-500 to-blue-600 dark:from-indigo-600 dark:to-blue-700 text-white rounded-full hover:from-indigo-600 hover:to-blue-700 dark:hover:from-indigo-700 dark:hover:to-blue-800 transition-all duration-300 transform hover:scale-105"
                    >
                      View Postings
                    </Button>
                  </CardContent>
                </Link>
              </Card>
              <Card className="border-none shadow-lg bg-white dark:bg-gray-800 rounded-2xl hover:shadow-xl transition-all duration-300 cursor-pointer group">
                <Link href="/company-admin/applications" className="block">
                  <CardHeader>
                    <CardTitle className="text-lg font-semibold text-gray-900 dark:text-gray-100 flex items-center group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                      <FileText className="h-5 w-5 mr-2 text-indigo-600 dark:text-indigo-400" /> Applications
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-3xl font-bold text-indigo-600 dark:text-indigo-400 group-hover:scale-110 transition-transform">{applications?.pending || 0}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Pending Applications</p>
                    <Button
                      className="mt-4 bg-gradient-to-r from-indigo-500 to-blue-600 dark:from-indigo-600 dark:to-blue-700 text-white rounded-full hover:from-indigo-600 hover:to-blue-700 dark:hover:from-indigo-700 dark:hover:to-blue-800 transition-all duration-300 transform hover:scale-105"
                    >
                      View Applications
                    </Button>
                  </CardContent>
                </Link>
              </Card>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Link href="/company-admin/supervisors" className="block">
                <Card className="border-none shadow-lg bg-white dark:bg-gray-800 rounded-2xl flex flex-col animate-in fade-in duration-300 cursor-pointer group hover:shadow-xl transition-all">
                  <CardHeader className="items-center pb-0">
                    <CardTitle className="text-lg font-semibold text-gray-900 dark:text-gray-100 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">Supervisor Status</CardTitle>
                    <CardDescription className="text-gray-500 dark:text-gray-400">Active vs Inactive Supervisors</CardDescription>
                  </CardHeader>
                  <CardContent className="flex-1 pb-0">
                    <ChartContainer
                      config={supervisorChartConfig}
                      className="[&_.recharts-pie-label-text]:fill-gray-900 dark:[&_.recharts-pie-label-text]:fill-gray-100 mx-auto aspect-square max-h-[300px] pb-0"
                    >
                      <PieChart>
                        <ChartTooltip
                          content={<ChartTooltipContent hideLabel className="bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 border-gray-200 dark:border-gray-700 p-3 rounded-md shadow-md" />}
                        />
                        <Pie
                          data={supervisorChartData}
                          dataKey="count"
                          nameKey="status"
                          label
                          labelLine={false}
                          className="fill-gray-900 dark:fill-gray-100"
                          innerRadius={60}
                          outerRadius={100}
                          paddingAngle={5}
                        />
                      </PieChart>
                    </ChartContainer>
                  </CardContent>
                </Card>
              </Link>
              <Link href="/company-admin/postings" className="block">
                <Card className="border-none shadow-lg bg-white dark:bg-gray-800 rounded-2xl animate-in fade-in duration-300 cursor-pointer group hover:shadow-xl transition-all">
                  <CardHeader>
                    <CardTitle className="text-lg font-semibold text-gray-900 dark:text-gray-100 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">Postings Overview</CardTitle>
                    <CardDescription className="text-gray-500 dark:text-gray-400">Breakdown of Posting Types</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ChartContainer config={postingsChartConfig} className="h-[350px]">
                      <BarChart accessibilityLayer data={postingsChartData}>
                        <CartesianGrid vertical={false} stroke="hsl(var(--muted))" strokeDasharray="3 3" />
                        <XAxis
                          dataKey="category"
                          tickLine={false}
                          tickMargin={10}
                          axisLine={{ stroke: 'hsl(var(--muted))' }}
                          tickFormatter={(value) => value.slice(0, 10)}
                          tick={{ fill: 'hsl(var(--foreground))', fontSize: 12 }}
                        />
                        <YAxis
                          tickLine={false}
                          axisLine={{ stroke: 'hsl(var(--muted))' }}
                          tick={{ fill: 'hsl(var(--foreground))', fontSize: 12 }}
                        />
                        <ChartTooltip
                          content={<ChartTooltipContent hideLabel className="bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 border-gray-200 dark:border-gray-700 p-3 rounded-md shadow-md" />}
                        />
                        <ChartLegend content={<ChartLegendContent className="text-gray-900 dark:text-gray-100 mt-2" />} />
                        <Bar dataKey="count" fill={postingsChartConfig.internships.color} radius={[4, 4, 0, 0]} name="Internships" />
                        <Bar dataKey="count" fill={postingsChartConfig.careers.color} radius={[4, 4, 0, 0]} name="Careers" />
                        <Bar dataKey="count" fill={postingsChartConfig.drafts.color} radius={[4, 4, 0, 0]} name="Drafts" />
                      </BarChart>
                    </ChartContainer>
                  </CardContent>
                </Card>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}



