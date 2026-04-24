import React, { useState, useEffect } from 'react';
import { Head, Link } from '@inertiajs/react';
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
    Edit,
    Plus,
    CheckCircle,
    Clock,
    XCircle
} from 'lucide-react';
import { type BreadcrumbItem } from '@/types';
import { getImageUrl, handleImageError } from '@/utils/imageUtils';

interface Student {
    student_id: number;
    name: string;
    email: string;
    profile_image: string | null;
}

interface Story {
    story_id?: number;
    student_id: number;
    student_name: string;
    title: string;
    story: string;
    company_name: string;
    role: string;
    outcome: string;
    image: string | null;
    status: string;
    created_at: string;
}

interface Props {
    student: Student;
    stories: Story[];
    success?: string;
    error?: string;
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/student' },
    { title: 'Success Stories', href: '/student/success-stories' },
];

export default function SuccessStoriesIndex({ student, stories, success, error }: Props) {
    const [showSuccess, setShowSuccess] = useState(!!success);
    const [showError, setShowError] = useState(!!error);

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

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'approved':
                return <Badge className="bg-green-100 text-green-800 border-green-200"><CheckCircle className="h-3 w-3 mr-1" />Approved</Badge>;
            case 'rejected':
                return <Badge variant="destructive"><XCircle className="h-3 w-3 mr-1" />Rejected</Badge>;
            case 'pending':
            default:
                return <Badge variant="secondary"><Clock className="h-3 w-3 mr-1" />Pending Review</Badge>;
        }
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="My Success Stories" />
            <div className="p-6 space-y-6">
                {/* Welcome Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                            My Success Stories
                        </h1>
                        <p className="text-gray-600 dark:text-gray-400 mt-1">
                            View and manage your submitted success stories
                        </p>
                    </div>
                    <div className="flex items-center space-x-4">
                        <Button asChild>
                            <Link href="/student/success-story">
                                <Plus className="h-4 w-4 mr-2" />
                                Share New Story
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
                            <Card key={index} className="hover:shadow-lg transition-shadow duration-200">
                                <CardHeader className="pb-3">
                                    <div className="flex items-start justify-between">
                                        <div className="flex items-start space-x-3 flex-1">
                                            {student.profile_image ? (
                                                <img
                                                    src={getImageUrl(student.profile_image)}
                                                    alt={student.name}
                                                    className="h-10 w-10 rounded-full object-cover flex-shrink-0"
                                                    onError={(e) => handleImageError(e)}
                                                />
                                            ) : (
                                                <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-900/30 dark:to-purple-900/30 flex items-center justify-center flex-shrink-0">
                                                    <User className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                                                </div>
                                            )}
                                            <div className="flex-1 min-w-0">
                                                <CardTitle className="text-lg line-clamp-2">{story.title}</CardTitle>
                                                <div className="flex items-center gap-2 mt-2">
                                                    <Building className="h-4 w-4 text-gray-500" />
                                                    <span className="text-sm text-gray-600 dark:text-gray-400">{story.company_name}</span>
                                                </div>
                                            </div>
                                        </div>
                                        {getStatusBadge(story.status)}
                                    </div>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    {story.image && (
                                        <div className="aspect-video rounded-lg overflow-hidden">
                                            <img
                                                src={story.image}
                                                alt={story.title}
                                                className="w-full h-full object-cover"
                                            />
                                        </div>
                                    )}

                                    <div className="space-y-2">
                                        <div className="flex items-center gap-2">
                                            <User className="h-4 w-4 text-gray-500" />
                                            <span className="text-sm font-medium">{story.role}</span>
                                        </div>
                                        <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-3">
                                            {story.outcome}
                                        </p>
                                    </div>

                                    <Separator />

                                    <div className="flex items-center justify-between text-xs text-gray-500">
                                        <span>Submitted {formatDate(story.created_at)}</span>
                                        {story.status === 'pending' && story.story_id !== undefined && (
                                            <Button asChild variant="outline" size="sm">
                                                <Link href={`/student/success-story/${story.story_id}/edit`}>
                                                    <Edit className="h-3 w-3 mr-1" />
                                                    Edit
                                                </Link>
                                            </Button>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                ) : (
                    <Card className="text-center py-12">
                        <CardContent>
                            <Star className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                                No Success Stories Yet
                            </h3>
                            <p className="text-gray-600 dark:text-gray-400 mb-6">
                                Share your internship experiences and success stories to inspire others.
                            </p>
                            <Button asChild>
                                <Link href="/student/success-story">
                                    <Plus className="h-4 w-4 mr-2" />
                                    Share Your First Success Story
                                </Link>
                            </Button>
                        </CardContent>
                    </Card>
                )}
            </div>
        </AppLayout>
    );
}