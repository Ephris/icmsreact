import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { PlaceholderPattern } from '@/components/ui/placeholder-pattern';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import AppLayout from '@/layouts/app-layout';
import { Head, Link, router, useForm } from '@inertiajs/react';
import { type BreadcrumbItem } from '@/types';
import { useState } from 'react';
import { X, Edit, Trash, Archive, ChevronLeft, ChevronRight } from 'lucide-react';

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
    departments: {
        data: Department[];
        current_page: number;
        per_page: number;
        total: number;
        last_page: number;
        links: { url: string | null; label: string; active: boolean }[];
    };
    search?: string;
    success?: string;
    error?: string;
};

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Departments', href: '/departments' },
];

export default function DepartmentIndex({ departments, search: initialSearch = '', success: initialSuccess, error: initialError }: Props) {
    const [showSuccess, setShowSuccess] = useState(!!initialSuccess);
    const [showError, setShowError] = useState(!!initialError);
    const [deleteId, setDeleteId] = useState<number | null>(null);
    const [searchTerm, setSearchTerm] = useState(initialSearch);

    const { delete: destroy, processing } = useForm();

    // No console logging in production UI; keep watch for real-time debugging elsewhere

    const handleDelete = () => {
        if (deleteId) {
            destroy(`/departments/${deleteId}`, {
                preserveState: true,
                preserveScroll: true,
                onSuccess: () => {
                    setDeleteId(null);
                    setShowSuccess(true);
                },
                onError: (errors) => {
                    setShowError(true);
                    console.log('Delete errors:', errors);
                },
            });
        }
    };

    const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
        const term = e.target.value;
        setSearchTerm(term);
        router.get(
            '/departments',
            { search: term },
            { preserveState: true, preserveScroll: true }
        );
    };

    const handlePageChange = (page: number) => {
        router.get(
            `/departments?page=${page}`,
            { search: searchTerm },
            { preserveState: true, preserveScroll: true }
        );
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Departments" />
            <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4 overflow-x-auto">
                <div className="rounded-2xl p-6 bg-gradient-to-r from-indigo-500 to-blue-600 dark:from-indigo-700 dark:to-blue-800 text-white shadow-lg flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Departments</h1>
                        <p className="text-white/90 mt-1">Manage departments, heads, and details</p>
                    </div>
                    <div className="flex gap-2">
                        <Link href="/departments/create">
                            <Button aria-label="Add department" className="rounded-full bg-white/20 text-white hover:bg-white/30">Add Department</Button>
                        </Link>
                        <Link href="/departments/trashed">
                            <Button aria-label="View trashed departments" className="rounded-full bg-white/20 text-white hover:bg-white/30">
                                <Archive className="h-4 w-4 mr-2" />
                                View Trashed
                            </Button>
                        </Link>
                    </div>
                </div>
                <div className="mb-4">
                    <Input
                        type="text"
                        value={searchTerm}
                        onChange={handleSearch}
                        placeholder="Search by name, code, faculty, or department head..."
                        className="max-w-sm rounded-full focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 transition-all"
                        aria-label="Search departments"
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
                {departments.data.length === 0 ? (
                    <div className="relative min-h-[40vh] flex-1 overflow-hidden rounded-2xl border border-sidebar-border/70 dark:border-sidebar-border bg-card">
                        <PlaceholderPattern className="absolute inset-0 size-full stroke-neutral-900/20 dark:stroke-neutral-100/20" />
                        <div className="relative z-10 flex flex-col items-center justify-center text-center py-16 gap-3">
                            <div className="w-16 h-16 rounded-full bg-indigo-100 dark:bg-indigo-900/40 flex items-center justify-center">
                                <span className="text-2xl">🏫</span>
                            </div>
                            <p className="text-lg font-semibold">No departments found</p>
                            <p className="text-sm text-muted-foreground">Try a different search or create a new department.</p>
                            <Link href="/departments/create"><Button className="rounded-full">Add Department</Button></Link>
                        </div>
                    </div>
                ) : (
                    <>
                        <div className="grid auto-rows-min gap-4 md:grid-cols-3">
                            {departments.data.map((dept) => (
                                <div
                                    key={dept.department_id}
                                    className="relative p-4 rounded-xl border border-sidebar-border/70 dark:border-sidebar-border bg-card transition-transform hover:scale-[1.02] hover:shadow-lg"
                                >
                                    <div className="flex flex-col gap-3">
                                        <div className="flex justify-between items-start">
                                            <div className="space-y-1">
                                                <h2 className="text-lg font-semibold">{dept.name}</h2>
                                                <div className="flex gap-2 items-center">
                                                    {dept.code && <Badge variant="outline" className="bg-gradient-to-r from-indigo-100 to-pink-100 dark:from-indigo-700 dark:to-pink-700 text-indigo-700 dark:text-white">{dept.code}</Badge>}
                                                    {dept.faculty && <span className="text-sm text-muted-foreground">{dept.faculty}</span>}
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    {dept.deptHead ? (
                                                        <>
                                                            <Avatar className="h-8 w-8">
                                                                {/* If deptHead has avatar property, it will show; otherwise initials */}
                                                                <AvatarFallback>{dept.deptHead.name.split(' ').map(n => n[0]).slice(0,2).join('')}</AvatarFallback>
                                                            </Avatar>
                                                            <p className="text-sm text-muted-foreground">Head: <span className="font-medium">{dept.deptHead.name}</span></p>
                                                        </>
                                                    ) : (
                                                        <p className="text-sm text-muted-foreground">Head: <span className="font-medium">None</span></p>
                                                    )}
                                                </div>
                                                {dept.description && <p className="text-sm text-muted-foreground">{dept.description}</p>}
                                            </div>
                                            <div className="flex gap-2">
                                                <Link href={`/departments/${dept.department_id}`}>
                                                    <Button variant="ghost" size="sm">View</Button>
                                                </Link>
                                                <Link href={`/departments/${dept.department_id}/edit`}>
                                                    <Button variant="outline" size="sm" aria-label={`Edit ${dept.name}`}>
                                                        <Edit className="h-4 w-4" />
                                                    </Button>
                                                </Link>
                                                <Dialog open={deleteId === dept.department_id} onOpenChange={(open) => setDeleteId(open ? dept.department_id : null)}>
                                                    <DialogTrigger asChild>
                                                        <Button variant="destructive" size="sm" aria-label={`Delete ${dept.name}`}>
                                                            <Trash className="h-4 w-4" />
                                                        </Button>
                                                    </DialogTrigger>
                                                    <DialogContent>
                                                        <DialogHeader>
                                                            <DialogTitle>Confirm Delete</DialogTitle>
                                                            <DialogDescription>
                                                                Are you sure you want to delete "{dept.name}"? This action will soft delete the department and can be restored later.
                                                            </DialogDescription>
                                                        </DialogHeader>
                                                        <DialogFooter>
                                                            <Button variant="outline" onClick={() => setDeleteId(null)} aria-label="Cancel delete">Cancel</Button>
                                                            <Button variant="destructive" onClick={handleDelete} disabled={processing}>{processing ? 'Deleting...' : 'Delete'}</Button>
                                                        </DialogFooter>
                                                    </DialogContent>
                                                </Dialog>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                        <div className="flex justify-between items-center mt-4">
                            <div className="text-sm text-gray-600 dark:text-gray-400">
                                Showing {departments.data.length} of {departments.total} departments
                            </div>
                            <div className="flex gap-2">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    disabled={departments.current_page === 1}
                                    onClick={() => handlePageChange(departments.current_page - 1)}
                                    aria-label="Previous page"
                                >
                                    <ChevronLeft className="h-4 w-4" />
                                </Button>
                                {Array.from({ length: departments.last_page }, (_, i) => i + 1).map((page) => (
                                    <Button
                                        key={page}
                                        variant={departments.current_page === page ? 'default' : 'outline'}
                                        size="sm"
                                        onClick={() => handlePageChange(page)}
                                        aria-label={`Page ${page}`}
                                    >
                                        {page}
                                    </Button>
                                ))}
                                <Button
                                    variant="outline"
                                    size="sm"
                                    disabled={departments.current_page === departments.last_page}
                                    onClick={() => handlePageChange(departments.current_page + 1)}
                                    aria-label="Next page"
                                >
                                    <ChevronRight className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>
                    </>
                )}
            </div>
        </AppLayout>
    );
}
