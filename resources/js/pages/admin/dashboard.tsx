import { Head, Link } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart';
import { Area, AreaChart, CartesianGrid, XAxis } from 'recharts';
import { Users, Building, Briefcase } from 'lucide-react';
import { type BreadcrumbItem } from '@/types';
import { useEffect, useState } from "react";

interface Analytics {
    users: number;
    departments: number;
    companies: number;
}

interface TrendPoint { day: string; users: number; departments: number; companies: number }

interface Props {
    analytics: Analytics;
    trend?: TrendPoint[];
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
];

function useAnimatedNumber(target: number, animated: boolean, duration = 700) {
  const [value, setValue] = useState(0);
  useEffect(() => {
    if (!animated) return;
    let startTimestamp: number | null = null;
    const step = (timestamp: number) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = Math.min((timestamp - startTimestamp) / duration, 1);
      setValue(Math.floor(progress * target));
      if (progress < 1) {
        window.requestAnimationFrame(step);
      } else {
        setValue(target);
      }
    };
    window.requestAnimationFrame(step);
  }, [target, animated, duration]);
  return value;
}

export default function Dashboard({ analytics, trend }: Props) {
    const [animated, setAnimated] = useState(false);
    useEffect(() => { setAnimated(true); }, []);

    const users = useAnimatedNumber(analytics.users, animated);
    const departments = useAnimatedNumber(analytics.departments, animated);
    const companies = useAnimatedNumber(analytics.companies, animated);

    // Prefer backend-provided trend; fallback to light synthetic data if missing
    const trendData: TrendPoint[] = Array.isArray(trend) && trend.length
      ? trend
      : Array.from({ length: 30 }).map((_, i) => ({
          day: new Date(Date.now() - (29 - i) * 24 * 60 * 60 * 1000).toLocaleDateString(undefined, { month: 'short', day: '2-digit' }),
          users: Math.max(0, users - 10 + i * 2),
          departments: Math.max(0, departments - 4 + i),
          companies: Math.max(0, companies - 3 + Math.floor(i / 2)),
        }));

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Super Admin Dashboard" />
            <div className="p-6 space-y-6">
                <div className="rounded-2xl p-6 bg-gradient-to-r from-indigo-500 to-blue-600 dark:from-indigo-700 dark:to-blue-800 text-white shadow-lg">
                    <h1 className="text-3xl font-bold tracking-tight">Super Admin Dashboard</h1>
                    <p className="text-white/90 mt-1">Overview of platform activity at a glance</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <Link href="/users" title="Total users registered on the platform" className="hover:scale-105 transition-transform duration-300 ease-out cursor-pointer">
                        <Card className="shadow-lg border-none rounded-2xl overflow-hidden transition-all duration-300 hover:shadow-xl">
                            <CardHeader className="bg-gradient-to-r from-blue-500 to-blue-600 dark:from-blue-700 dark:to-blue-800 p-6 rounded-t-2xl">
                                <CardTitle className="text-white flex items-center gap-2">
                                    <Users className="h-6 w-6" />
                                    Total Users
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="p-6">
                                <p className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                                    {users}
                                </p>
                            </CardContent>
                        </Card>
                    </Link>
                    <Link href="/departments" title="Total departments across all companies" className="hover:scale-105 transition-transform duration-300 ease-out cursor-pointer">
                        <Card className="shadow-lg border-none rounded-2xl overflow-hidden transition-all duration-300 hover:shadow-xl">
                            <CardHeader className="bg-gradient-to-r from-green-500 to-green-600 dark:from-green-700 dark:to-green-800 p-6 rounded-t-2xl">
                                <CardTitle className="text-white flex items-center gap-2">
                                    <Building className="h-6 w-6" />
                                    Total Departments
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="p-6">
                                <p className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                                    {departments}
                                </p>
                            </CardContent>
                        </Card>
                    </Link>
                    <Link href="/companies" title="Total companies registered on the platform" className="hover:scale-105 transition-transform duration-300 ease-out cursor-pointer">
                        <Card className="shadow-lg border-none rounded-2xl overflow-hidden transition-all duration-300 hover:shadow-xl">
                            <CardHeader className="bg-gradient-to-r from-purple-500 to-purple-600 dark:from-purple-700 dark:to-purple-800 p-6 rounded-t-2xl">
                                <CardTitle className="text-white flex items-center gap-2">
                                    <Briefcase className="h-6 w-6" />
                                    Total Companies
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="p-6">
                                <p className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                                    {companies}
                                </p>
                            </CardContent>
                        </Card>
                    </Link>
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  <Link href="/users" className="cursor-pointer">
                    <Card className="rounded-2xl hover:shadow-xl transition-all duration-300">
                      <CardHeader>
                        <CardTitle>Users Trend (30 days)</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <ChartContainer
                          config={{ users: { label: 'Users', theme: { light: '#60a5fa', dark: '#93c5fd' } } }}
                          className="h-64 aspect-auto"
                        >
                          <AreaChart data={trendData} margin={{ left: 12, right: 12 }}>
                            <CartesianGrid vertical={false} strokeDasharray="3 3" />
                            <XAxis dataKey="day" tickLine={false} axisLine={false} tickMargin={8} />
                            <ChartTooltip content={<ChartTooltipContent nameKey="users" className="text-foreground" />} />
                            <Area dataKey="users" type="monotone" fill="var(--color-users)" stroke="var(--color-users)" strokeOpacity={0.9} fillOpacity={0.25} />
                          </AreaChart>
                        </ChartContainer>
                      </CardContent>
                    </Card>
                  </Link>
                  <Link href="/departments" className="cursor-pointer">
                    <Card className="rounded-2xl hover:shadow-xl transition-all duration-300">
                      <CardHeader>
                        <CardTitle>Departments Trend (30 days)</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <ChartContainer
                          config={{ departments: { label: 'Departments', theme: { light: '#34d399', dark: '#6ee7b7' } } }}
                          className="h-64 aspect-auto"
                        >
                          <AreaChart data={trendData} margin={{ left: 12, right: 12 }}>
                            <CartesianGrid vertical={false} strokeDasharray="3 3" />
                            <XAxis dataKey="day" tickLine={false} axisLine={false} tickMargin={8} />
                            <ChartTooltip content={<ChartTooltipContent nameKey="departments" className="text-foreground" />} />
                            <Area dataKey="departments" type="monotone" fill="var(--color-departments)" stroke="var(--color-departments)" strokeOpacity={0.9} fillOpacity={0.25} />
                          </AreaChart>
                        </ChartContainer>
                      </CardContent>
                    </Card>
                  </Link>
                  <Link href="/companies" className="cursor-pointer">
                    <Card className="rounded-2xl hover:shadow-xl transition-all duration-300">
                      <CardHeader>
                        <CardTitle>Companies Trend (30 days)</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <ChartContainer
                          config={{ companies: { label: 'Companies', theme: { light: '#a78bfa', dark: '#c4b5fd' } } }}
                          className="h-64 aspect-auto"
                        >
                          <AreaChart data={trendData} margin={{ left: 12, right: 12 }}>
                            <CartesianGrid vertical={false} strokeDasharray="3 3" />
                            <XAxis dataKey="day" tickLine={false} axisLine={false} tickMargin={8} />
                            <ChartTooltip content={<ChartTooltipContent nameKey="companies" className="text-foreground" />} />
                            <Area dataKey="companies" type="monotone" fill="var(--color-companies)" stroke="var(--color-companies)" strokeOpacity={0.9} fillOpacity={0.25} />
                          </AreaChart>
                        </ChartContainer>
                      </CardContent>
                    </Card>
                  </Link>
                </div>
            </div>
        </AppLayout>
    );
}