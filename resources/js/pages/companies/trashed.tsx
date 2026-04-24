import { Button } from '@/components/ui/button';
import AppLayout from '@/layouts/app-layout';
import { Head, Link } from '@inertiajs/react';
import { type BreadcrumbItem, type Company } from '@/types';
import { useState } from 'react';
import { X } from 'lucide-react';

type Props = {
    trashedCompanies: Company[];
    success?: string;
    error?: string;
};

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'dashboard', href: '/dashboard' },
    { title: 'companies', href: '/companies' },
    { title: 'trashed', href: '/companies/trashed' },
];

export default function Trashed({ trashedCompanies, success: initialSuccess, error: initialError }: Props) {
    const [showSuccess, setShowSuccess] = useState(!!initialSuccess);
    const [showError, setShowError] = useState(!!initialError);

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Trashed Companies" />
            <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4">
                <div className="rounded-2xl p-6 bg-gradient-to-r from-indigo-500 to-blue-600 dark:from-indigo-700 dark:to-blue-800 text-white shadow-lg">
                    <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Trashed Companies</h1>
                    <p className="text-white/90 mt-1">Restore companies that were soft deleted</p>
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
                            className="text-red-800 dark:text-red-100 hover:bg-red-200 dark:hover:bg-green-700"
                        >
                            <X className="h-4 w-4" />
                        </Button>
                    </div>
                )}
                <div className="mt-2 flex gap-2">
                    <Link href="/companies">
                        <Button variant="outline" className="rounded-full">Back to Companies</Button>
                    </Link>
                </div>
                <div className="space-y-4">
                    {trashedCompanies.length === 0 ? (
                        <div className="relative min-h-[40vh] flex-1 overflow-hidden rounded-2xl border border-sidebar-border/70 dark:border-sidebar-border bg-card">
                            <div className="relative z-10 flex flex-col items-center justify-center text-center py-16 gap-3">
                                <div className="w-16 h-16 rounded-full bg-indigo-100 dark:bg-indigo-900/40 flex items-center justify-center">
                                    <span className="text-2xl">🗑️</span>
                                </div>
                                <p className="text-lg font-semibold">No trashed companies found</p>
                                <p className="text-sm text-muted-foreground">The trash is empty. Great!</p>
                                <Link href="/companies"><Button variant="outline" className="rounded-full">Back to companies</Button></Link>
                            </div>
                        </div>
                    ) : (
                        trashedCompanies.map((company: Company) => (
                            <div key={company.company_id} className="p-4 border rounded-2xl bg-card transition-transform hover:scale-[1.02] hover:shadow-lg">
                                <h2 className="text-xl font-semibold">{company.name}</h2>
                                <p><strong>Company Admin:</strong> {company.admin?.name || 'Not assigned'}</p>
                                <p><strong>Deleted At:</strong> {company.deleted_at ? new Date(company.deleted_at as string).toLocaleString() : 'N/A'}</p>
                                <div className="mt-2 flex gap-2">
                                    <Link href={`/companies/${company.company_id}/restore`} method="post" as="button">
                                        <Button variant="outline" className="rounded-full">Restore</Button>
                                    </Link>
                                    <Link href="/companies">
                                        <Button variant="outline" className="rounded-full">Cancel</Button>
                                    </Link>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </AppLayout>
    );
}