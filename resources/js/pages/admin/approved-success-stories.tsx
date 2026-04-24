import React, { useState, useEffect } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
    X,
    User,
    Building,
    Star,
    CheckCircle,
    Eye,
    ArrowLeft,
    XCircle
} from 'lucide-react';
import { type BreadcrumbItem } from '@/types';

interface Story {
    name: string;
    role: string;
    text: string;
    image: string | null;
    company: string;
    title: string;
    outcome: string;
}

interface Props {
    approvedStories: Story[];
    success?: string;
    error?: string;
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Homepage', href: '/admin/homepage' },
    { title: 'Approved Success Stories', href: '/admin/approved-success-stories' },
];

export default function ApprovedSuccessStories({ approvedStories, success, error }: Props) {
    const [showSuccess, setShowSuccess] = useState(!!success);
    const [showError, setShowError] = useState(!!error);
  const [stories, setStories] = useState<Story[]>(approvedStories);

    useEffect(() => {
        if (success) {
            setShowSuccess(true);
            const timer = setTimeout(() => setShowSuccess(false), 5000);
            return () => clearTimeout(timer);
        }
        if (error) {
            setShowError(true);
            const timer = setTimeout(() => setShowError(false), 5000);
            return () => clearTimeout(timer);
        }
    }, [success, error]);

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Approved Success Stories" />
            <div className="p-6 space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div className="rounded-2xl p-6 bg-gradient-to-r from-indigo-500 to-blue-600 dark:from-indigo-700 dark:to-blue-800 text-white shadow-lg w-full mr-4">
                        <h1 className="text-3xl font-bold tracking-tight">Approved Success Stories</h1>
                        <p className="text-white/90 mt-1">
                            View approved and published success stories showcased on the homepage
                        </p>
                    </div>
                    <div className="flex items-center space-x-4">
                        <Button asChild variant="outline">
                            <Link href="/admin/homepage">
                                <ArrowLeft className="h-4 w-4 mr-2" />
                                Back to Homepage
                            </Link>
                        </Button>
                    </div>
                </div>

                {/* Alerts */}
                {showSuccess && success && (
                    <Alert className="bg-green-50 dark:bg-green-900/50 border-green-200 dark:border-green-800">
                        <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
                        <AlertTitle className="text-green-800 dark:text-green-200 font-semibold">Success</AlertTitle>
                        <AlertDescription className="text-green-700 dark:text-green-300 flex justify-between items-center">
                            {success}
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setShowSuccess(false)}
                                className="text-green-800 dark:text-green-200 hover:bg-green-100 dark:hover:bg-green-800"
                                aria-label="Close success alert"
                            >
                                <X className="h-4 w-4" />
                            </Button>
                        </AlertDescription>
                    </Alert>
                )}
                {showError && error && (
                    <Alert className="bg-red-50 dark:bg-red-900/50 border-red-200 dark:border-red-800">
                        <XCircle className="h-5 w-5 text-red-600 dark:text-red-400" />
                        <AlertTitle className="text-red-800 dark:text-red-200 font-semibold">Error</AlertTitle>
                        <AlertDescription className="text-red-700 dark:text-red-300 flex justify-between items-center">
                            {error}
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setShowError(false)}
                                className="text-red-800 dark:text-red-200 hover:bg-red-100 dark:hover:bg-red-800"
                                aria-label="Close error alert"
                            >
                                <X className="h-4 w-4" />
                            </Button>
                        </AlertDescription>
                    </Alert>
                )}

                {/* Stories Grid */}
                {stories.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {stories.map((story, index) => (
                            <Card key={index} className="hover:shadow-xl transition-all duration-300 rounded-2xl">
                                    <CardHeader className="pb-3">
                                    <div className="flex items-start justify-between gap-2">
                                        <div className="flex-1">
                                            <CardTitle className="text-lg line-clamp-2">{story.title}</CardTitle>
                                            <div className="flex items-center gap-2 mt-2">
                                                <Building className="h-4 w-4 text-gray-500" />
                                                <span className="text-sm text-gray-600 dark:text-gray-400">{story.company}</span>
                                            </div>
                                        </div>
                                        <div className="flex flex-col items-end gap-2">
                                            <Badge className="bg-green-100 text-green-800 border-green-200">
                                                <CheckCircle className="h-3 w-3 mr-1" />
                                                Published
                                            </Badge>
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                className="text-red-600 border-red-200 hover:bg-red-50 dark:border-red-800 dark:text-red-300 dark:hover:bg-red-900/40"
                                                onClick={() => {
                                                    router.post(route('admin.approved-success-stories.delete'), { index }, {
                                                        preserveScroll: true,
                                                        onSuccess: () => {
                                                            setStories((prev) => prev.filter((_, i) => i !== index));
                                                        },
                                                    });
                                                }}
                                            >
                                                <X className="h-3 w-3 mr-1" />
                                                Delete
                                            </Button>
                                        </div>
                                    </div>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    {story.image && (
                                        <div className="aspect-video rounded-xl overflow-hidden">
                                            <img
                                                src={story.image}
                                                alt={story.title}
                                                loading="lazy"
                                                className="w-full h-full object-cover"
                                            />
                                        </div>
                                    )}

                                    <div className="space-y-2">
                                        <div className="flex items-center gap-2">
                                            <User className="h-4 w-4 text-gray-500" />
                                            <span className="text-sm font-medium">{story.name}</span>
                                            <span className="text-xs text-gray-500">({story.role})</span>
                                        </div>
                                        <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-3">
                                            {story.outcome}
                                        </p>
                                    </div>

                                    <Separator />

                                    <div className="text-xs text-gray-500">
                                        <p className="line-clamp-4">{story.text}</p>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                ) : (
                    <Card className="text-center py-12 rounded-2xl">
                        <CardContent>
                            <div className="w-20 h-20 rounded-full bg-indigo-100 dark:bg-indigo-900/40 flex items-center justify-center mx-auto mb-4">
                                <Star className="h-10 w-10 text-indigo-500" />
                            </div>
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                                No Approved Stories Yet
                            </h3>
                            <p className="text-gray-600 dark:text-gray-400 mb-6">
                                Success stories will appear here once they are approved and published on the homepage.
                            </p>
                            <Button asChild>
                                <Link href="/admin/homepage">
                                    Go to Homepage Management
                                </Link>
                            </Button>
                        </CardContent>
                    </Card>
                )}

                {/* Summary Stats */}
                {approvedStories.length > 0 && (
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Eye className="h-5 w-5" />
                                Summary
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div className="text-center">
                                    <div className="text-2xl font-bold text-green-600">{approvedStories.length}</div>
                                    <div className="text-sm text-gray-600 dark:text-gray-400">Total Approved Stories</div>
                                </div>
                                <div className="text-center">
                                    <div className="text-2xl font-bold text-blue-600">
                                        {new Set(approvedStories.map(s => s.company)).size}
                                    </div>
                                    <div className="text-sm text-gray-600 dark:text-gray-400">Companies Featured</div>
                                </div>
                                <div className="text-center">
                                    <div className="text-2xl font-bold text-purple-600">
                                        {new Set(approvedStories.map(s => s.name)).size}
                                    </div>
                                    <div className="text-sm text-gray-600 dark:text-gray-400">Student Contributors</div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                )}
            </div>
        </AppLayout>
    );
}