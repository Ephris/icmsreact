import { Button } from '@/components/ui/button';
import AppLayout from '@/layouts/app-layout';
import { Head, Link } from '@inertiajs/react';
import { type BreadcrumbItem } from '@/types';
import { ArrowLeft, X } from 'lucide-react';
import { useState } from 'react';

type Department = {
    department_id: number;
    name: string;
    code: string | null;
    faculty: string | null;
    dept_head_id: number | null;
    deptHead?: { user_id: number; name: string } | null;
    description: string | null;
};

type Props = {
    department: Department;
    error?: string;
    success?: string;
};

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Departments', href: '/departments' },
    { title: 'View', href: '' },
];

export default function DepartmentShow({ department, error: initialError, success: initialSuccess }: Props) {
    const [showError, setShowError] = useState(!!initialError);
    const [showSuccess, setShowSuccess] = useState(!!initialSuccess);

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="View Department" />
            <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4">
                <div className="rounded-2xl p-6 bg-gradient-to-r from-indigo-500 to-blue-600 dark:from-indigo-700 dark:to-blue-800 text-white shadow-lg flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Department Details</h1>
                        <p className="text-white/90 mt-1">{department.name}</p>
                    </div>
                    <Link href="/departments">
                        <Button variant="outline" aria-label="Back to departments" className="rounded-full border-white/40 text-white hover:bg-white/10">
                            <ArrowLeft className="h-4 w-4 mr-2" />
                            Back to Departments
                        </Button>
                    </Link>
                </div>
                {showSuccess && initialSuccess && (
                    <div className="bg-green-100 dark:bg-green-800 text-green-800 dark:text-green-100 p-4 rounded-xl flex justify-between items-center">
                        <span>{initialSuccess}</span>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setShowSuccess(false)}
                            className="text-green-800 dark:text-green-100 hover:bg-green-200 dark:hover:bg-green-700"
                            aria-label="Close success alert"
                        >
                            <X className="h-4 w-4" />
                        </Button>
                    </div>
                )}
                {showError && initialError && (
                    <div className="bg-red-100 dark:bg-red-800 text-red-800 dark:text-red-100 p-4 rounded-xl flex justify-between items-center">
                        <span>{initialError}</span>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setShowError(false)}
                            className="text-red-800 dark:text-red-100 hover:bg-red-200 dark:hover:bg-red-700"
                            aria-label="Close error alert"
                        >
                            <X className="h-4 w-4" />
                        </Button>
                    </div>
                )}
                <div className="max-w-xl rounded-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 p-6 shadow-sm space-y-4">
                    <div>
                        <h2 className="text-sm font-medium text-muted-foreground">Name</h2>
                        <p className="text-foreground">{department.name}</p>
                    </div>
                    <div>
                        <h2 className="text-sm font-medium text-muted-foreground">Code</h2>
                        <p className="text-foreground">{department.code || 'N/A'}</p>
                    </div>
                    <div>
                        <h2 className="text-sm font-medium text-muted-foreground">Faculty</h2>
                        <p className="text-foreground">{department.faculty || 'N/A'}</p>
                    </div>
                    <div>
                        <h2 className="text-sm font-medium text-muted-foreground">Department Head</h2>
                        <p className="text-foreground">{department.deptHead?.name || 'None'}</p>
                    </div>
                    <div>
                        <h2 className="text-sm font-medium text-muted-foreground">Description</h2>
                        <p className="text-foreground">{department.description || 'No description available'}</p>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
