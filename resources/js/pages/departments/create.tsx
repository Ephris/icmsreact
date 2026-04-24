import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import AppLayout from '@/layouts/app-layout';
import { Head, Link, useForm, router } from '@inertiajs/react';
import { type BreadcrumbItem, type User } from '@/types';
import { FormEventHandler, useState } from 'react';
import { X, CheckCircle, AlertCircle } from 'lucide-react';

type Props = {
    deptHeads: User[];
    error?: string;
    success?: string;
};

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Departments', href: '/departments' },
    { title: 'Create', href: '/departments/create' },
];

export default function DepartmentCreate({ deptHeads, error: initialError, success: initialSuccess }: Props) {
    const [showError, setShowError] = useState(!!initialError);
    const [showSuccess, setShowSuccess] = useState(!!initialSuccess);
    const { data, setData, post, processing, errors } = useForm({
        name: '',
        description: '',
        code: '',
        faculty: '',
        dept_head_id: null as string | null,
    });

    const handleSubmit: FormEventHandler = (e) => {
        e.preventDefault();
        post('/departments', {
            onSuccess: () => {
                setShowSuccess(true);
                router.visit('/departments');
            },
            onError: (errors) => {
                setShowError(true);
                console.log('Form errors:', errors);
            },
        });
    };

    const handleDeptHeadChange = (value: string) => {
        setData('dept_head_id', value === 'null' ? null : value);
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Create Department" />
            <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4">
                <div className="rounded-2xl p-6 bg-gradient-to-r from-indigo-500 to-blue-600 dark:from-indigo-700 dark:to-blue-800 text-white shadow-lg">
                    <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Create Department</h1>
                    <p className="text-white/90 mt-1">Add a new department and assign a head</p>
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
                <form onSubmit={handleSubmit} className="space-y-4 max-w-md">
                    <div>
                        <Label htmlFor="name">Name</Label>
                        <div className="relative">
                        <Input
                            id="name"
                            value={data.name}
                            onChange={(e) => setData('name', e.target.value)}
                            placeholder="Department Name"
                            className={`rounded-full focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 transition-all ${errors.name ? 'border-red-500' : ''}`}
                            aria-invalid={!!errors.name}
                            aria-describedby={errors.name ? 'name-error' : undefined}
                        />
                        {!errors.name && data.name && (
                            <CheckCircle className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-green-500" />
                        )}
                        {errors.name && (
                            <AlertCircle className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-red-500" />
                        )}
                        </div>
                        {errors.name && <p className="text-red-500 text-sm mt-1" id="name-error">{errors.name}</p>}
                    </div>
                    <div>
                        <Label htmlFor="description">Description</Label>
                        <div className="relative">
                        <Input
                            id="description"
                            value={data.description}
                            onChange={(e) => setData('description', e.target.value)}
                            placeholder="Department Description"
                            className={`rounded-full focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 transition-all ${errors.description ? 'border-red-500' : ''}`}
                            aria-invalid={!!errors.description}
                            aria-describedby={errors.description ? 'description-error' : undefined}
                        />
                        {!errors.description && data.description && (
                            <CheckCircle className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-green-500" />
                        )}
                        {errors.description && (
                            <AlertCircle className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-red-500" />
                        )}
                        </div>
                        {errors.description && <p className="text-red-500 text-sm mt-1" id="description-error">{errors.description}</p>}
                    </div>
                    <div>
                        <Label htmlFor="code">Code</Label>
                        <div className="relative">
                        <Input
                            id="code"
                            value={data.code}
                            onChange={(e) => setData('code', e.target.value)}
                            placeholder="Department Code"
                            className={`rounded-full focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 transition-all ${errors.code ? 'border-red-500' : ''}`}
                            aria-invalid={!!errors.code}
                            aria-describedby={errors.code ? 'code-error' : undefined}
                        />
                        {!errors.code && data.code && (
                            <CheckCircle className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-green-500" />
                        )}
                        {errors.code && (
                            <AlertCircle className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-red-500" />
                        )}
                        </div>
                        {errors.code && <p className="text-red-500 text-sm mt-1" id="code-error">{errors.code}</p>}
                    </div>
                    <div>
                        <Label htmlFor="faculty">Faculty</Label>
                        <div className="relative">
                        <Input
                            id="faculty"
                            value={data.faculty}
                            onChange={(e) => setData('faculty', e.target.value)}
                            placeholder="Faculty"
                            className={`rounded-full focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 transition-all ${errors.faculty ? 'border-red-500' : ''}`}
                            aria-invalid={!!errors.faculty}
                            aria-describedby={errors.faculty ? 'faculty-error' : undefined}
                        />
                        {!errors.faculty && data.faculty && (
                            <CheckCircle className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-green-500" />
                        )}
                        {errors.faculty && (
                            <AlertCircle className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-red-500" />
                        )}
                        </div>
                        {errors.faculty && <p className="text-red-500 text-sm mt-1" id="faculty-error">{errors.faculty}</p>}
                    </div>
                    <div>
                        <Label htmlFor="dept_head_id">Department Head</Label>
                        <Select
                            value={data.dept_head_id?.toString() || undefined}
                            onValueChange={handleDeptHeadChange}
                            aria-invalid={!!errors.dept_head_id}
                            aria-describedby={errors.dept_head_id ? 'dept-head-error' : undefined}
                        >
                            <SelectTrigger id="dept_head_id" className={`rounded-full ${errors.dept_head_id ? 'border-red-500' : ''}`}>
                                <SelectValue placeholder="Select Department Head" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="null">None</SelectItem>
                                {deptHeads.map((user) => (
                                    <SelectItem key={user.user_id} value={user.user_id.toString()}>
                                        {user.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        {errors.dept_head_id && <p className="text-red-500 text-sm mt-1" id="dept-head-error">{errors.dept_head_id}</p>}
                    </div>
                    <div className="flex gap-4">
                        <Button type="submit" disabled={processing} aria-label="Create department" className="rounded-full bg-gradient-to-r from-indigo-500 to-blue-600 hover:from-indigo-600 hover:to-blue-700">
                            {processing ? 'Creating...' : 'Create Department'}
                        </Button>
                        <Link href="/departments">
                            <Button variant="outline" aria-label="Cancel" className="rounded-full">Cancel</Button>
                        </Link>
                    </div>
                </form>
            </div>
        </AppLayout>
    );
}