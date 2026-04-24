import AppLayout from '@/layouts/app-layout';
import { Head, Link } from '@inertiajs/react';
import { type BreadcrumbItem, type Company } from '@/types';
import { useState } from 'react';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useForm } from '@inertiajs/react';

type Props = {
    company: Company;
    success?: string;
    error?: string;
};

export default function Show({ company, success: initialSuccess, error: initialError }: Props) {
    const [showSuccess, setShowSuccess] = useState(!!initialSuccess);
    const [showError, setShowError] = useState(!!initialError);
    const { delete: destroy, processing } = useForm();

    const handleDelete = () => {
        destroy(`/companies/${company.company_id}`, {
            onSuccess: () => window.location.href = '/companies',
            onError: (errors) => {
                setShowError(true);
                console.log(errors);
            },
        });
    };

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'dashboard', href: '/dashboard' },
        { title: 'companies', href: '/companies' },
        { title: 'details', href: `/companies/${company.company_id}` },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Company Details" />
            <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4">
                <div className="rounded-2xl p-6 bg-gradient-to-r from-indigo-500 to-blue-600 dark:from-indigo-700 dark:to-blue-800 text-white shadow-lg">
                    <h1 className="text-2xl md:text-3xl font-bold tracking-tight">{company.name} Details</h1>
                    <p className="text-white/90 mt-1">View company information and admin</p>
                </div>
                {showSuccess && initialSuccess && (
                    <div className="bg-green-100 dark:bg-green-800 text-green-800 dark:text-green-100 p-4 rounded-xl flex justify-between items-center">
                        <span>{initialSuccess}</span>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setShowSuccess(false)}
                            className="text-green-800 dark:text-green-100 hover:bg-green-200 dark:hover:bg-green-700"
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
                        >
                            <X className="h-4 w-4" />
                        </Button>
                    </div>
                )}
                <div className="max-w-xl rounded-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 p-6 shadow-sm space-y-3">
                    <div>
                        <h2 className="text-sm font-medium text-muted-foreground">Name</h2>
                        <p className="text-foreground">{company.name}</p>
                    </div>
                    <div>
                        <h2 className="text-sm font-medium text-muted-foreground">Description</h2>
                        <p className="text-foreground">{company.description || 'N/A'}</p>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <h2 className="text-sm font-medium text-muted-foreground">Industry</h2>
                            <p className="text-foreground">{company.industry || 'N/A'}</p>
                        </div>
                        <div>
                            <h2 className="text-sm font-medium text-muted-foreground">Location</h2>
                            <p className="text-foreground">{company.location || 'N/A'}</p>
                        </div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <h2 className="text-sm font-medium text-muted-foreground">Website</h2>
                            <p className="text-foreground">{company.website ? <a className="underline" href={company.website} target="_blank" rel="noopener noreferrer">{company.website}</a> : 'N/A'}</p>
                        </div>
                        <div>
                            <h2 className="text-sm font-medium text-muted-foreground">LinkedIn</h2>
                            <p className="text-foreground">{company.linkedin_url ? <a className="underline" href={company.linkedin_url} target="_blank" rel="noopener noreferrer">{company.linkedin_url}</a> : 'N/A'}</p>
                        </div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div>
                            <h2 className="text-sm font-medium text-muted-foreground">Size</h2>
                            <p className="text-foreground">{company.company_size || 'N/A'}</p>
                        </div>
                        <div>
                            <h2 className="text-sm font-medium text-muted-foreground">Founded</h2>
                            <p className="text-foreground">{company.founded_year || 'N/A'}</p>
                        </div>
                        <div>
                            <h2 className="text-sm font-medium text-muted-foreground">Status</h2>
                            <span className={`inline-flex rounded-full px-3 py-1 text-xs capitalize ${company.status === 'approved' ? 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300' : 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/40 dark:text-yellow-300'}`}>{company.status}</span>
                        </div>
                    </div>
                    <div>
                        <h2 className="text-sm font-medium text-muted-foreground">Contact Email</h2>
                        <p className="text-foreground">{company.contact_email || 'N/A'}</p>
                    </div>
                    <div>
                        <h2 className="text-sm font-medium text-muted-foreground">Company Admin</h2>
                        <p className="text-foreground">{company.admin?.name || 'Not assigned'}</p>
                    </div>
                    <div className="pt-2 flex gap-2">
                        <Link href={`/companies/${company.company_id}/edit`}>
                            <Button variant="outline" className="rounded-full">Edit</Button>
                        </Link>
                        <Button variant="destructive" onClick={handleDelete} disabled={processing} className="rounded-full">
                            {processing ? 'Deleting...' : 'Delete'}
                        </Button>
                        <Link href="/companies">
                            <Button variant="outline" className="rounded-full">Back</Button>
                        </Link>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}