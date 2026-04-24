import { Head, Link } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { type BreadcrumbItem } from '@/types';
import { Users } from 'lucide-react';

interface Department {
    department_id: number;
    name: string;
    code: string | null;
    students_count: number;
    active_students: number;
    pending_applications: number;
    advisors_count: number;
}

interface Props {
    departments: Department[];
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Track Departments', href: '/coordinator/departments' },
];

export default function Departments({ departments }: Props) {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Track Departments" />
            <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-gray-100">Track Departments and Students</h1>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                    {departments.map((dept) => (
                        <Card key={dept.department_id} className="bg-white dark:bg-gray-800 rounded-2xl overflow-hidden shadow-sm border border-gray-200 dark:border-gray-700 transition-all duration-300 hover:shadow-md hover:border-blue-200">
                            <CardHeader className="bg-gradient-to-r from-blue-600 to-blue-500 dark:from-blue-700 dark:to-blue-800 p-5 rounded-t-2xl">
                                <CardTitle className="text-white flex items-center gap-2">
                                    <Users className="h-6 w-6" />
                                    {dept.name}
                                </CardTitle>
                                {dept.code && <Badge variant="secondary" className="bg-white/20 text-white">{dept.code}</Badge>}
                            </CardHeader>
                            <CardContent className="p-4 sm:p-6 space-y-4 sm:space-y-5">
                                <div className="grid grid-cols-2 gap-3 sm:gap-4">
                                    <div className="text-center rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/40 p-3 sm:p-4">
                                        <div className="text-xl sm:text-2xl font-bold text-blue-700 dark:text-blue-400">{dept.students_count}</div>
                                        <div className="text-xs sm:text-sm text-gray-700 dark:text-gray-400">Total Students</div>
                                    </div>
                                    <div className="text-center rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/40 p-3 sm:p-4">
                                        <div className="text-xl sm:text-2xl font-bold text-green-700 dark:text-green-400">{dept.active_students}</div>
                                        <div className="text-xs sm:text-sm text-gray-700 dark:text-gray-400">Active Internships</div>
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-3 sm:gap-4">
                                    <div className="text-center rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/40 p-3 sm:p-4">
                                        <div className="text-base sm:text-lg font-semibold text-orange-700 dark:text-orange-400">{dept.pending_applications}</div>
                                        <div className="text-xs sm:text-sm text-gray-700 dark:text-gray-400">Pending Applications</div>
                                    </div>
                                    <div className="text-center rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/40 p-3 sm:p-4">
                                        <div className="text-base sm:text-lg font-semibold text-purple-700 dark:text-purple-400">{dept.advisors_count}</div>
                                        <div className="text-xs sm:text-sm text-gray-700 dark:text-gray-400">Advisors</div>
                                    </div>
                                </div>
                                <Button asChild className="w-full">
                                    <Link href={`/coordinator/departments/${dept.department_id}/students`}>
                                        View Students
                                    </Link>
                                </Button>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>
        </AppLayout>
    );
}