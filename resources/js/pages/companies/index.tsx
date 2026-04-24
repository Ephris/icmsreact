import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { PlaceholderPattern } from '@/components/ui/placeholder-pattern';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import AppLayout from '@/layouts/app-layout';
import { Link, Head, useForm, router } from '@inertiajs/react';
import { type BreadcrumbItem, type Company } from '@/types';
import { useState } from 'react';
import { X, Edit, Trash, Archive, MapPin, Briefcase } from 'lucide-react';

type Props = {
    companies: {
        data: Company[];
        current_page: number;
        per_page: number;
        total: number;
        last_page: number;
        links: { url: string; label: string; active: boolean }[];
    };
    success?: string;
    error?: string;
    filters: { search: string; status: string };
};

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'dashboard', href: '/dashboard' },
    { title: 'companies', href: '/companies' },
];

export default function Index({ companies, success: initialSuccess, error: initialError, filters }: Props) {
    const [showSuccess, setShowSuccess] = useState(!!initialSuccess);
    const [showError, setShowError] = useState(!!initialError);
    const [deleteId, setDeleteId] = useState<number | null>(null);
    const [searchTerm, setSearchTerm] = useState(filters.search || '');
    const [statusFilter, setStatusFilter] = useState(filters.status || 'all');

    const { delete: destroy, processing } = useForm();

    // Keep UI clean; no console logging for production UI

    const handleDelete = () => {
        if (deleteId) {
            destroy(`/companies/${deleteId}`, {
                onSuccess: () => setDeleteId(null),
                onError: (errors) => {
                    setShowError(true);
                    console.log('Delete error:', errors);
                },
            });
        }
    };

    const handleStatusFilterChange = (value: string) => {
        setStatusFilter(value);
        router.get('/companies', { search: searchTerm, status: value === 'all' ? '' : value }, { preserveState: true });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Companies" />
            <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4 overflow-x-auto">
                <div className="rounded-2xl p-6 bg-gradient-to-r from-indigo-500 to-blue-600 dark:from-indigo-700 dark:to-blue-800 text-white shadow-lg flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Companies</h1>
                        <p className="text-white/90 mt-1">Manage partner companies and admins</p>
                    </div>
                    <div className="flex gap-2">
                        <Link href="/companies/create">
                            <Button className="rounded-full bg-white/20 text-white hover:bg-white/30">Add Company</Button>
                        </Link>
                        <Link href="/companies/trashed">
                            <Button className="rounded-full bg-white/20 text-white hover:bg-white/30">
                                <Archive className="h-4 w-4 mr-2" />
                                View Trashed
                            </Button>
                        </Link>
                    </div>
                </div>
                <div className="flex gap-4 mb-4">
                    <Input
                        type="text"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        placeholder="Search by name, industry, or admin..."
                        className="max-w-md rounded-full focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 transition-all"
                    />
                    <Select
                        value={statusFilter}
                        onValueChange={handleStatusFilterChange}
                    >
                        <SelectTrigger className="w-40 rounded-full">
                            <SelectValue placeholder="Filter by status" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Statuses</SelectItem>
                            <SelectItem value="pending">Pending</SelectItem>
                            <SelectItem value="approved">Approved</SelectItem>
                        </SelectContent>
                    </Select>
                    <Link
                        href={`/companies?search=${encodeURIComponent(searchTerm)}&status=${encodeURIComponent(statusFilter === 'all' ? '' : statusFilter)}`}
                        preserveState
                    >
                        <Button>Apply Filters</Button>
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
                {companies.data.length === 0 ? (
                    <div className="relative min-h-[40vh] flex-1 overflow-hidden rounded-2xl border border-sidebar-border/70 dark:border-sidebar-border bg-card">
                        <PlaceholderPattern className="absolute inset-0 size-full stroke-neutral-900/20 dark:stroke-neutral-100/20" />
                        <div className="relative z-10 flex flex-col items-center justify-center text-center py-16 gap-3">
                            <div className="w-16 h-16 rounded-full bg-indigo-100 dark:bg-indigo-900/40 flex items-center justify-center">
                                <span className="text-2xl">🏢</span>
                            </div>
                            <p className="text-lg font-semibold">No companies found</p>
                            <p className="text-sm text-muted-foreground">Try different filters or add a new company.</p>
                            <Link href="/companies/create"><Button className="rounded-full">Add Company</Button></Link>
                        </div>
                    </div>
                ) : (
                    <>
                        <div className="grid auto-rows-min gap-4 md:grid-cols-3">
                            {companies.data.map((company) => (
                                <div
                                    key={company.company_id}
                                    className="relative p-4 rounded-2xl border border-sidebar-border/70 dark:border-sidebar-border bg-card transition-transform hover:scale-[1.02] hover:shadow-lg"
                                >
                                    <div className="flex justify-between items-start">
                                            <div>
                                            <h2 className="text-lg font-semibold">{company.name}</h2>
                                                            <div className="flex flex-col gap-2 mt-1">
                                                                {company.industry && (
                                                                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                                                        <Briefcase className="h-4 w-4 text-muted-foreground" />
                                                                        <span>{company.industry}</span>
                                                                    </div>
                                                                )}
                                                                {company.location && (
                                                                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                                                        <MapPin className="h-4 w-4 text-muted-foreground" />
                                                                        <span>{company.location}</span>
                                                                    </div>
                                                                )}
                                                                {company.status && (
                                                                    <div>
                                                                        <Badge variant={company.status === 'approved' ? 'secondary' : company.status === 'pending' ? 'outline' : 'default'} className="capitalize">
                                                                            {company.status}
                                                                        </Badge>
                                                                    </div>
                                                                )}
                                                                {company.admin && (
                                                                    <div className="flex items-center gap-2 text-sm mt-1">
                                                                        <Avatar className="h-6 w-6">
                                                                            {('avatar' in company.admin && (company.admin as { avatar?: string }).avatar) ? (
                                                                                <AvatarImage src={(company.admin as { avatar?: string }).avatar as string} alt={company.admin.name} />
                                                                            ) : (
                                                                                <AvatarFallback>{company.admin.name.split(' ').map(n => n[0]).slice(0,2).join('')}</AvatarFallback>
                                                                            )}
                                                                        </Avatar>
                                                                        <span className="text-muted-foreground font-medium">{company.admin.name}</span>
                                                                    </div>
                                                                )}
                                                            </div>
                                        </div>
                                        <div className="flex gap-2">
                                            <Link href={`/companies/${company.company_id}/edit`}>
                                                <Button variant="outline" size="sm" aria-label={`Edit ${company.name}`}>
                                                    <Edit className="h-4 w-4" />
                                                </Button>
                                            </Link>
                                            <Dialog open={deleteId === company.company_id} onOpenChange={(open) => setDeleteId(open ? company.company_id : null)}>
                                                <DialogTrigger asChild>
                                                    <Button variant="destructive" size="sm">
                                                        <Trash className="h-4 w-4" />
                                                    </Button>
                                                </DialogTrigger>
                                                <DialogContent>
                                                    <DialogHeader>
                                                        <DialogTitle>Confirm Delete</DialogTitle>
                                                        <DialogDescription>
                                                            Are you sure you want to delete "{company.name}"? This action will soft delete the company and can be restored later.
                                                        </DialogDescription>
                                                    </DialogHeader>
                                                    <DialogFooter>
                                                        <Button variant="outline" onClick={() => setDeleteId(null)}>
                                                            Cancel
                                                        </Button>
                                                        <Button variant="destructive" onClick={handleDelete} disabled={processing}>
                                                            {processing ? 'Deleting...' : 'Delete'}
                                                        </Button>
                                                    </DialogFooter>
                                                </DialogContent>
                                            </Dialog>
                                            <Link href={`/companies/${company.company_id}`}>
                                                <Button variant="ghost" size="sm">View</Button>
                                            </Link>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                        <div className="flex items-center justify-between mt-4">
                            <p className="text-sm">
                                Showing {(companies.current_page - 1) * companies.per_page + 1} to{' '}
                                {Math.min(companies.current_page * companies.per_page, companies.total)} of {companies.total} companies
                            </p>
                            <div className="flex gap-2">
                                <Link
                                    href={companies.current_page > 1 ? companies.links.find(l => l.label === (companies.current_page - 1).toString())?.url || '#' : '#'}
                                    preserveState
                                    disabled={companies.current_page === 1}
                                >
                                    <Button variant="outline" disabled={companies.current_page === 1}>
                                        Previous
                                    </Button>
                                </Link>
                                {companies.links.map((link) => (
                                    <Link
                                        key={link.label}
                                        href={link.url}
                                        preserveState
                                    >
                                        <Button variant={link.active ? 'default' : 'outline'} size="sm">
                                            {link.label}
                                        </Button>
                                    </Link>
                                ))}
                                <Link
                                    href={companies.current_page < companies.last_page ? companies.links.find(l => l.label === (companies.current_page + 1).toString())?.url || '#' : '#'}
                                    preserveState
                                    disabled={companies.current_page === companies.last_page}
                                >
                                    <Button variant="outline" disabled={companies.current_page === companies.last_page}>
                                        Next
                                    </Button>
                                </Link>
                            </div>
                        </div>
                    </>
                )}
            </div>
        </AppLayout>
    );
}