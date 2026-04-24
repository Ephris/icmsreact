import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import AppLayout from '@/layouts/app-layout';
import { Head, Link, useForm, router } from '@inertiajs/react';
import { type BreadcrumbItem, type Company, type User } from '@/types';
import { FormEventHandler, useState } from 'react';
import { X, CheckCircle, AlertCircle } from 'lucide-react';

type Props = {
    company: Company;
    admins: User[];
    error?: string;
    success?: string;
};

export default function Edit({ company, admins, error: initialError, success: initialSuccess }: Props) {
    const [showError, setShowError] = useState(!!initialError);
    const [showSuccess, setShowSuccess] = useState(!!initialSuccess);
    const { data, setData, put, processing, errors } = useForm({
        name: company.name,
        description: company.description || '',
        industry: company.industry || '',
        location: company.location || '',
        website: company.website || '',
        company_size: company.company_size || '',
        founded_year: company.founded_year?.toString() || '',
        contact_email: company.contact_email || '',
        linkedin_url: company.linkedin_url || '',
        user_id: company.admin?.user_id?.toString() || null,
        status: company.status as 'pending' | 'approved',
    });

    const handleSubmit: FormEventHandler = (e) => {
        e.preventDefault();
        put(`/companies/${company.company_id}`, {
            onSuccess: () => {
                router.visit('/companies');
            },
            onError: (errors) => {
                setShowError(true);
                console.log('Update error:', errors);
            },
        });
    };

    const handleUserChange = (value: string) => {
        setData('user_id', value === 'null' ? null : value);
    };

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'dashboard', href: '/dashboard' },
        { title: 'companies', href: '/companies' },
        { title: 'edit', href: `/companies/${company.company_id}/edit` },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Edit Company" />
            <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4">
                <div className="rounded-2xl p-6 bg-gradient-to-r from-indigo-500 to-blue-600 dark:from-indigo-700 dark:to-blue-800 text-white shadow-lg">
                    <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Edit Company</h1>
                    <p className="text-white/90 mt-1">Update company details and admin</p>
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
                <form onSubmit={handleSubmit} className="space-y-4 max-w-md">
                    <div>
                        <Label htmlFor="name">Name</Label>
                        <div className="relative">
                        <Input
                            id="name"
                            value={data.name}
                            onChange={(e) => setData('name', e.target.value)}
                            placeholder="Company Name"
                            className={`rounded-full focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 transition-all ${errors.name ? 'border-red-500' : ''}`}
                        />
                        {!errors.name && data.name && (
                            <CheckCircle className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-green-500" />
                        )}
                        {errors.name && (
                            <AlertCircle className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-red-500" />
                        )}
                        </div>
                        {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
                    </div>
                    <div>
                        <Label htmlFor="description">Description</Label>
                        <div className="relative">
                        <Input
                            id="description"
                            value={data.description}
                            onChange={(e) => setData('description', e.target.value)}
                            placeholder="Company Description"
                            className={`rounded-full focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 transition-all ${errors.description ? 'border-red-500' : ''}`}
                        />
                        {!errors.description && data.description && (
                            <CheckCircle className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-green-500" />
                        )}
                        {errors.description && (
                            <AlertCircle className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-red-500" />
                        )}
                        </div>
                        {errors.description && <p className="text-red-500 text-sm mt-1">{errors.description}</p>}
                    </div>
                    <div>
                        <Label htmlFor="industry">Industry</Label>
                        <div className="relative">
                        <Input
                            id="industry"
                            value={data.industry}
                            onChange={(e) => setData('industry', e.target.value)}
                            placeholder="Industry"
                            className={`rounded-full focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 transition-all ${errors.industry ? 'border-red-500' : ''}`}
                        />
                        {!errors.industry && data.industry && (
                            <CheckCircle className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-green-500" />
                        )}
                        {errors.industry && (
                            <AlertCircle className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-red-500" />
                        )}
                        </div>
                        {errors.industry && <p className="text-red-500 text-sm mt-1">{errors.industry}</p>}
                    </div>
                    <div>
                        <Label htmlFor="location">Location</Label>
                        <div className="relative">
                        <Input
                            id="location"
                            value={data.location}
                            onChange={(e) => setData('location', e.target.value)}
                            placeholder="Location"
                            className={`rounded-full focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 transition-all ${errors.location ? 'border-red-500' : ''}`}
                        />
                        {!errors.location && data.location && (
                            <CheckCircle className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-green-500" />
                        )}
                        {errors.location && (
                            <AlertCircle className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-red-500" />
                        )}
                        </div>
                        {errors.location && <p className="text-red-500 text-sm mt-1">{errors.location}</p>}
                    </div>
                    <div>
                        <Label htmlFor="website">Website</Label>
                        <Input
                            id="website"
                            value={data.website}
                            onChange={(e) => setData('website', e.target.value)}
                            placeholder="Website"
                            className={`rounded-full focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 transition-all ${errors.website ? 'border-red-500' : ''}`}
                        />
                        {errors.website && <p className="text-red-500 text-sm mt-1">{errors.website}</p>}
                    </div>
                    <div>
                        <Label htmlFor="company_size">Company Size</Label>
                        <Input
                            id="company_size"
                            value={data.company_size}
                            onChange={(e) => setData('company_size', e.target.value)}
                            placeholder="Company Size"
                            className={`rounded-full focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 transition-all ${errors.company_size ? 'border-red-500' : ''}`}
                        />
                        {errors.company_size && <p className="text-red-500 text-sm mt-1">{errors.company_size}</p>}
                    </div>
                    <div>
                        <Label htmlFor="founded_year">Founded Year</Label>
                        <Input
                            id="founded_year"
                            type="number"
                            value={data.founded_year}
                            onChange={(e) => setData('founded_year', e.target.value)}
                            placeholder="Founded Year"
                            className={`rounded-full focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 transition-all ${errors.founded_year ? 'border-red-500' : ''}`}
                        />
                        {errors.founded_year && <p className="text-red-500 text-sm mt-1">{errors.founded_year}</p>}
                    </div>
                    <div>
                        <Label htmlFor="contact_email">Contact Email</Label>
                        <Input
                            id="contact_email"
                            value={data.contact_email}
                            onChange={(e) => setData('contact_email', e.target.value)}
                            placeholder="Contact Email"
                            className={`rounded-full focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 transition-all ${errors.contact_email ? 'border-red-500' : ''}`}
                        />
                        {errors.contact_email && <p className="text-red-500 text-sm mt-1">{errors.contact_email}</p>}
                    </div>
                    <div>
                        <Label htmlFor="linkedin_url">LinkedIn URL</Label>
                        <Input
                            id="linkedin_url"
                            value={data.linkedin_url}
                            onChange={(e) => setData('linkedin_url', e.target.value)}
                            placeholder="LinkedIn URL"
                            className={`rounded-full focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 transition-all ${errors.linkedin_url ? 'border-red-500' : ''}`}
                        />
                        {errors.linkedin_url && <p className="text-red-500 text-sm mt-1">{errors.linkedin_url}</p>}
                    </div>
                    <div>
                        <Label htmlFor="user_id">Company Admin</Label>
                        <Select
                            value={data.user_id || 'null'}
                            onValueChange={handleUserChange}
                        >
                            <SelectTrigger id="user_id" className={`rounded-full ${errors.user_id ? 'border-red-500' : ''}`}>
                                <SelectValue placeholder="Select Company Admin" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="null">None</SelectItem>
                                {admins.map((admin) => (
                                    <SelectItem key={admin.user_id} value={admin.user_id.toString()}>
                                        {admin.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        {errors.user_id && <p className="text-red-500 text-sm mt-1">{errors.user_id}</p>}
                    </div>
                    <div>
                        <Label htmlFor="status">Status</Label>
                        <Select
                            value={data.status}
                            onValueChange={(value) => setData('status', value as 'pending' | 'approved')}
                        >
                            <SelectTrigger id="status" className={`rounded-full ${errors.status ? 'border-red-500' : ''}`}>
                                <SelectValue placeholder="Select Status" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="pending">Pending</SelectItem>
                                <SelectItem value="approved">Approved</SelectItem>
                            </SelectContent>
                        </Select>
                        {errors.status && <p className="text-red-500 text-sm mt-1">{errors.status}</p>}
                    </div>
                    <div className="flex gap-4">
                        <Button type="submit" disabled={processing} className="rounded-full bg-gradient-to-r from-indigo-500 to-blue-600 hover:from-indigo-600 hover:to-blue-700">
                            {processing ? 'Updating...' : 'Update Company'}
                        </Button>
                        <Link href="/companies">
                            <Button variant="outline" className="rounded-full">Cancel</Button>
                        </Link>
                    </div>
                </form>
            </div>
        </AppLayout>
    );
}
