import { Head, Link, router } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart';
import { Area, AreaChart, Bar, BarChart, CartesianGrid, XAxis, Pie, PieChart, Cell, ResponsiveContainer } from 'recharts';
import { 
  Building2, 
  Users, 
  FileText, 
  CheckCircle, 
  Clock, 
  TrendingUp,
  ArrowRight,
  GraduationCap
} from 'lucide-react';
import { type BreadcrumbItem } from '@/types';
import { useEffect, useState } from 'react';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
];

interface Analytics {
    departments: number;
    total_students: number;
    students_by_department: Array<{ department_name: string; count: number }>;
    application_letters: number;
    application_letters_by_status: Record<string, number>;
    accepted_applications: number;
    pending_applications: number;
    letter_trend: Array<{ day: string; letters: number }>;
}

interface Props {
    analytics: Analytics;
}

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

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

export default function Dashboard({ analytics }: Props) {
    const [animated, setAnimated] = useState(false);
    useEffect(() => { setAnimated(true); }, []);

    const departments = useAnimatedNumber(analytics.departments, animated);
    const totalStudents = useAnimatedNumber(analytics.total_students, animated);
    const applicationLetters = useAnimatedNumber(analytics.application_letters, animated);
    const acceptedApplications = useAnimatedNumber(analytics.accepted_applications, animated);
    const pendingApplications = useAnimatedNumber(analytics.pending_applications, animated);

    // Prepare data for charts
    const studentsByDeptData = analytics.students_by_department || [];
    const letterStatusData = Object.entries(analytics.application_letters_by_status || {}).map(([name, value]) => ({
        name: name.charAt(0).toUpperCase() + name.slice(1),
        value: value as number,
    }));

    const handleCardClick = (route: string) => {
        router.visit(route);
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Coordinator Dashboard" />
            <div className="p-6 space-y-6">
                {/* Header */}
                <div className="rounded-2xl p-6 bg-gradient-to-r from-indigo-500 to-blue-600 dark:from-indigo-700 dark:to-blue-800 text-white shadow-lg">
                    <h1 className="text-3xl font-bold tracking-tight">Coordinator Dashboard</h1>
                    <p className="text-white/90 mt-1">Overview of departments, students, and application letters</p>
                </div>

                {/* Statistics Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
                    <div 
                        onClick={() => handleCardClick('/coordinator/departments')}
                        className="cursor-pointer hover:scale-105 transition-transform duration-300 ease-out"
                    >
                        <Card className="shadow-lg border-none rounded-2xl overflow-hidden transition-all duration-300 hover:shadow-xl">
                            <CardHeader className="bg-gradient-to-r from-blue-500 to-blue-600 dark:from-blue-700 dark:to-blue-800 p-6 rounded-t-2xl">
                                <CardTitle className="text-white flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <Building2 className="h-6 w-6" />
                                        <span>Departments</span>
                                    </div>
                                    <ArrowRight className="h-5 w-5 opacity-80" />
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="p-6">
                                <p className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                                    {departments}
                                </p>
                                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Total departments</p>
                            </CardContent>
                        </Card>
                    </div>

                    <div 
                        onClick={() => handleCardClick('/coordinator/departments')}
                        className="cursor-pointer hover:scale-105 transition-transform duration-300 ease-out"
                    >
                        <Card className="shadow-lg border-none rounded-2xl overflow-hidden transition-all duration-300 hover:shadow-xl">
                            <CardHeader className="bg-gradient-to-r from-green-500 to-green-600 dark:from-green-700 dark:to-green-800 p-6 rounded-t-2xl">
                                <CardTitle className="text-white flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <Users className="h-6 w-6" />
                                        <span>Students</span>
                                    </div>
                                    <ArrowRight className="h-5 w-5 opacity-80" />
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="p-6">
                                <p className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                                    {totalStudents}
                                </p>
                                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Total students</p>
                            </CardContent>
                        </Card>
                    </div>

                    <div 
                        onClick={() => handleCardClick('/coordinator/application-letters')}
                        className="cursor-pointer hover:scale-105 transition-transform duration-300 ease-out"
                    >
                        <Card className="shadow-lg border-none rounded-2xl overflow-hidden transition-all duration-300 hover:shadow-xl">
                            <CardHeader className="bg-gradient-to-r from-purple-500 to-purple-600 dark:from-purple-700 dark:to-purple-800 p-6 rounded-t-2xl">
                                <CardTitle className="text-white flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <FileText className="h-6 w-6" />
                                        <span>Letters</span>
                                    </div>
                                    <ArrowRight className="h-5 w-5 opacity-80" />
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="p-6">
                                <p className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                                    {applicationLetters}
                                </p>
                                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Application letters</p>
                            </CardContent>
                        </Card>
                    </div>

                    <div 
                        onClick={() => handleCardClick('/coordinator/departments')}
                        className="cursor-pointer hover:scale-105 transition-transform duration-300 ease-out"
                    >
                        <Card className="shadow-lg border-none rounded-2xl overflow-hidden transition-all duration-300 hover:shadow-xl">
                            <CardHeader className="bg-gradient-to-r from-emerald-500 to-emerald-600 dark:from-emerald-700 dark:to-emerald-800 p-6 rounded-t-2xl">
                                <CardTitle className="text-white flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <CheckCircle className="h-6 w-6" />
                                        <span>Accepted</span>
                                    </div>
                                    <ArrowRight className="h-5 w-5 opacity-80" />
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="p-6">
                                <p className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                                    {acceptedApplications}
                                </p>
                                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Accepted applications</p>
                            </CardContent>
                        </Card>
                    </div>

                    <div 
                        onClick={() => handleCardClick('/coordinator/departments')}
                        className="cursor-pointer hover:scale-105 transition-transform duration-300 ease-out"
                    >
                        <Card className="shadow-lg border-none rounded-2xl overflow-hidden transition-all duration-300 hover:shadow-xl">
                            <CardHeader className="bg-gradient-to-r from-amber-500 to-amber-600 dark:from-amber-700 dark:to-amber-800 p-6 rounded-t-2xl">
                                <CardTitle className="text-white flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <Clock className="h-6 w-6" />
                                        <span>Pending</span>
                                    </div>
                                    <ArrowRight className="h-5 w-5 opacity-80" />
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="p-6">
                                <p className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                                    {pendingApplications}
                                </p>
                                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Pending applications</p>
                            </CardContent>
                        </Card>
                    </div>
                </div>

                {/* Charts Section */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Application Letters Trend */}
                    <Card className="rounded-2xl">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <TrendingUp className="h-5 w-5" />
                                Application Letters Trend (30 days)
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <ChartContainer
                                config={{ letters: { label: 'Letters', theme: { light: '#3b82f6', dark: '#60a5fa' } } }}
                                className="h-64 aspect-auto"
                            >
                                <AreaChart data={analytics.letter_trend || []} margin={{ left: 12, right: 12 }}>
                                    <CartesianGrid vertical={false} strokeDasharray="3 3" />
                                    <XAxis dataKey="day" tickLine={false} axisLine={false} tickMargin={8} />
                                    <ChartTooltip content={<ChartTooltipContent nameKey="letters" className="text-foreground" />} />
                                    <Area 
                                        dataKey="letters" 
                                        type="monotone" 
                                        fill="var(--color-letters)" 
                                        stroke="var(--color-letters)" 
                                        strokeOpacity={0.9} 
                                        fillOpacity={0.25} 
                                    />
                                </AreaChart>
                            </ChartContainer>
                        </CardContent>
                    </Card>

                    {/* Students by Department */}
                    {studentsByDeptData.length > 0 && (
                        <Card className="rounded-2xl">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <GraduationCap className="h-5 w-5" />
                                    Students by Department
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <ChartContainer
                                    config={studentsByDeptData.reduce((acc, item, index) => {
                                        acc[item.department_name] = { 
                                            label: item.department_name, 
                                            theme: { light: COLORS[index % COLORS.length], dark: COLORS[index % COLORS.length] } 
                                        };
                                        return acc;
                                    }, {} as Record<string, { label: string; theme: { light: string; dark: string } }>)}
                                    className="h-64 aspect-auto"
                                >
                                    <BarChart data={studentsByDeptData} margin={{ left: 12, right: 12, bottom: 60 }}>
                                        <CartesianGrid vertical={false} strokeDasharray="3 3" />
                                        <XAxis 
                                            dataKey="department_name" 
                                            tickLine={false} 
                                            axisLine={false} 
                                            tickMargin={8}
                                            angle={-45}
                                            textAnchor="end"
                                            height={80}
                                        />
                                        <ChartTooltip content={<ChartTooltipContent />} />
                                        <Bar 
                                            dataKey="count" 
                                            fill="#3b82f6" 
                                            radius={[8, 8, 0, 0]}
                                        />
                                    </BarChart>
                                </ChartContainer>
                            </CardContent>
                        </Card>
                    )}
                </div>

                {/* Application Letters Status Pie Chart */}
                {letterStatusData.length > 0 && (
                    <Card className="rounded-2xl">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <FileText className="h-5 w-5" />
                                Application Letters by Status
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="flex items-center justify-center">
                                <ChartContainer
                                    config={letterStatusData.reduce((acc, item, index) => {
                                        acc[item.name] = { 
                                            label: item.name, 
                                            theme: { light: COLORS[index % COLORS.length], dark: COLORS[index % COLORS.length] } 
                                        };
                                        return acc;
                                    }, {} as Record<string, { label: string; theme: { light: string; dark: string } }>)}
                                    className="h-80 w-full"
                                >
                                    <ResponsiveContainer width="100%" height="100%">
                                        <PieChart>
                                            <Pie
                                                data={letterStatusData}
                                                cx="50%"
                                                cy="50%"
                                                labelLine={false}
                                                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                                                outerRadius={100}
                                                fill="#8884d8"
                                                dataKey="value"
                                            >
                                                {letterStatusData.map((entry, index) => (
                                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                                ))}
                                            </Pie>
                                            <ChartTooltip />
                                        </PieChart>
                                    </ResponsiveContainer>
                                </ChartContainer>
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* Quick Actions */}
                <Card className="rounded-2xl">
                    <CardHeader>
                        <CardTitle>Quick Actions</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <Link href="/coordinator/departments">
                                <Button variant="outline" className="w-full justify-start h-auto py-4">
                                    <Building2 className="h-5 w-5 mr-2" />
                                    <div className="text-left">
                                        <div className="font-semibold">Track Departments</div>
                                        <div className="text-sm text-gray-500">View and manage departments</div>
                                    </div>
                                </Button>
                            </Link>
                            <Link href="/coordinator/application-letters">
                                <Button variant="outline" className="w-full justify-start h-auto py-4">
                                    <FileText className="h-5 w-5 mr-2" />
                                    <div className="text-left">
                                        <div className="font-semibold">Application Letters</div>
                                        <div className="text-sm text-gray-500">Generate and manage letters</div>
                                    </div>
                                </Button>
                            </Link>
                            <Link href="/coordinator/letters">
                                <Button variant="outline" className="w-full justify-start h-auto py-4">
                                    <FileText className="h-5 w-5 mr-2" />
                                    <div className="text-left">
                                        <div className="font-semibold">Issue Letters</div>
                                        <div className="text-sm text-gray-500">Create new letters</div>
                                    </div>
                                </Button>
                            </Link>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
