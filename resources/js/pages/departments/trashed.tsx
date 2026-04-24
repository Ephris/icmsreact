import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { PlaceholderPattern } from '@/components/ui/placeholder-pattern';
import AppLayout from '@/layouts/app-layout';
import { Head, Link, useForm } from '@inertiajs/react';
import { type BreadcrumbItem } from '@/types';
import { useState } from 'react';
import { ArrowLeft, RotateCcw, X } from 'lucide-react';

type Department = {
    department_id: number;
    name: string;
    code: string | null;
    faculty: string | null;
    dept_head_id: number | null;
    deptHead?: { user_id: number; name: string } | null;
    description: string | null;
    deleted_at: string | null;
};

type Props = {
    trashedDepartments: Department[];
    success?: string;
    error?: string;
};

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Departments', href: '/departments' },
    { title: 'Trashed', href: '/departments/trashed' },
];

export default function DepartmentTrashed({ trashedDepartments, success: initialSuccess, error: initialError }: Props) {
    const { post, processing } = useForm();
    const [showSuccess, setShowSuccess] = useState(!!initialSuccess);
    const [showError, setShowError] = useState(!!initialError);
    const [searchTerm, setSearchTerm] = useState('');
    const [filteredDepartments, setFilteredDepartments] = useState<Department[]>(trashedDepartments);

    const handleRestore = (departmentId: number) => {
        post(`/departments/${departmentId}/restore`, {
            onSuccess: () => {
                setShowSuccess(true);
                window.location.reload();
            },
            onError: (errors) => {
                setShowError(true);
                console.log('Restore errors:', errors);
            },
        });
    };

    const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
        const term = e.target.value.toLowerCase();
        setSearchTerm(term);
        setFilteredDepartments(
            trashedDepartments.filter((department) =>
                department.name.toLowerCase().includes(term) ||
                (department.code && department.code.toLowerCase().includes(term)) ||
                (department.faculty && department.faculty.toLowerCase().includes(term)) ||
                (department.deptHead?.name && department.deptHead.name.toLowerCase().includes(term))
            )
        );
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Trashed Departments" />
            <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4 overflow-x-auto">
                <div className="rounded-2xl p-6 bg-gradient-to-r from-indigo-500 to-blue-600 dark:from-indigo-700 dark:to-blue-800 text-white shadow-lg flex items-center justify-between">
                    <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Trashed Departments</h1>
                    <Link href="/departments">
                        <Button variant="outline" aria-label="Back to departments" className="rounded-full border-white/40 text-white hover:bg-white/10">
                            <ArrowLeft className="h-4 w-4 mr-2" />
                            Back to Departments
                        </Button>
                    </Link>
                </div>
                <div className="mb-4">
                    <Input
                        type="text"
                        value={searchTerm}
                        onChange={handleSearch}
                        placeholder="Search by name, code, faculty, or department head..."
                        className="max-w-sm rounded-full focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 transition-all"
                        aria-label="Search trashed departments"
                    />
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
                {filteredDepartments.length === 0 ? (
                    <div className="relative min-h-[40vh] flex-1 overflow-hidden rounded-2xl border border-sidebar-border/70 dark:border-sidebar-border bg-card">
                        <PlaceholderPattern className="absolute inset-0 size-full stroke-neutral-900/20 dark:stroke-neutral-100/20" />
                        <div className="relative z-10 flex flex-col items-center justify-center text-center py-16 gap-3">
                            <div className="w-16 h-16 rounded-full bg-indigo-100 dark:bg-indigo-900/40 flex items-center justify-center">
                                <span className="text-2xl">🗑️</span>
                            </div>
                            <p className="text-lg font-semibold">No trashed departments found</p>
                            <p className="text-sm text-muted-foreground">The trash is empty. Great!</p>
                            <Link href="/departments"><Button variant="outline" className="rounded-full">Back to departments</Button></Link>
                        </div>
                    </div>
                ) : (
                    <div className="grid auto-rows-min gap-4 md:grid-cols-3">
                        {filteredDepartments.map((dept) => (
                            <div
                                key={dept.department_id}
                                className="relative p-4 rounded-2xl border border-sidebar-border/70 dark:border-sidebar-border bg-card transition-transform hover:scale-[1.02] hover:shadow-lg"
                            >
                                <div className="flex justify-between items-start">
                                    <div className="space-y-1">
                                        <h2 className="text-lg font-semibold">{dept.name}</h2>
                                        {dept.code && <p className="text-sm text-gray-600 dark:text-gray-400">Code: {dept.code}</p>}
                                        {dept.faculty && <p className="text-sm text-gray-600 dark:text-gray-400">Faculty: {dept.faculty}</p>}
                                        <p className="text-sm text-gray-600 dark:text-gray-400">
                                            Head: {dept.deptHead?.name || 'None'}
                                        </p>
                                        {dept.description && <p className="text-sm text-gray-600 dark:text-gray-400">Description: {dept.description}</p>}
                                        {dept.deleted_at && (
                                            <p className="text-sm text-gray-500 dark:text-gray-500">
                                                Deleted: {new Date(dept.deleted_at).toLocaleDateString()}
                                            </p>
                                        )}
                                    </div>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => handleRestore(dept.department_id)}
                                        disabled={processing}
                                        aria-label={`Restore ${dept.name}`}
                                    >
                                        <RotateCcw className="h-4 w-4" />
                                    </Button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </AppLayout>
    );
}