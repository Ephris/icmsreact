import React, { useState } from 'react';
import { Head, Link } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { FileText, Download, Eye, Calendar, User, GraduationCap, X } from 'lucide-react';
import { type BreadcrumbItem } from '@/types';

interface ApplicationLetter {
    letter_id: number;
    ref_number: string;
    start_date: string;
    end_date: string;
    status: 'generated' | 'sent' | 'viewed';
    sent_at: string | null;
    viewed_at: string | null;
    created_at: string;
    department: {
        name: string;
    };
    generatedBy: {
        first_name: string;
        last_name: string;
    };
}

interface Student {
    student_id: number;
    first_name: string;
    last_name: string;
    email: string;
    department_name: string;
    year_of_study: string;
    cgpa: number;
}

interface Props {
    student: Student;
    applicationLetter: ApplicationLetter | null;
    success?: string;
    error?: string;
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/student' },
    { title: 'Application Letter', href: '/student/application-letter' },
];

export default function StudentApplicationLetter({ student, applicationLetter, success, error }: Props) {
    const [showSuccess, setShowSuccess] = useState(!!success);
    const [showError, setShowError] = useState(!!error);

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'generated':
                return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">Generated</Badge>;
            case 'sent':
                return <Badge variant="secondary" className="bg-blue-100 text-blue-800">Sent</Badge>;
            case 'viewed':
                return <Badge variant="secondary" className="bg-green-100 text-green-800">Viewed</Badge>;
            default:
                return <Badge variant="secondary">{status}</Badge>;
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Application Letter" />
            <div className="p-6 space-y-6">
                <div className="flex justify-between items-center">
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Application Letter</h1>
                    <Button asChild variant="outline">
                        <Link href="/student">
                            <User className="h-4 w-4 mr-2" />
                            Back to Dashboard
                        </Link>
                    </Button>
                </div>

                {showSuccess && success && (
                    <Alert className="bg-green-50 dark:bg-green-900/50 border-green-200 dark:border-green-800">
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

                {!applicationLetter ? (
                    <Card className="shadow-lg border-none bg-white dark:bg-gray-800 rounded-2xl overflow-hidden">
                        <CardContent className="p-8 text-center">
                            <FileText className="h-16 w-16 mx-auto text-gray-400 mb-4" />
                            <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-300 mb-2">
                                No Application Letter Available
                            </h3>
                            <p className="text-gray-500 dark:text-gray-400 mb-6">
                                You don't have an application letter yet. Please contact your university coordinator or department head to obtain your application letter.
                            </p>
                            <div className="bg-yellow-50 dark:bg-yellow-900/50 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
                                <h4 className="font-semibold text-yellow-800 dark:text-yellow-200 mb-2">Important Notice</h4>
                                <p className="text-yellow-700 dark:text-yellow-300 text-sm">
                                    You need an application letter from your university coordinator before you can apply for internship postings. 
                                    This letter serves as official authorization for your internship application.
                                </p>
                            </div>
                        </CardContent>
                    </Card>
                ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <Card className="shadow-lg border-none bg-white dark:bg-gray-800 rounded-2xl overflow-hidden">
                            <CardHeader className="bg-gradient-to-r from-blue-500 to-blue-600 dark:from-blue-700 dark:to-blue-800 p-6 rounded-t-2xl">
                                <CardTitle className="text-white flex items-center gap-2">
                                    <FileText className="h-6 w-6" />
                                    Application Letter Details
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="p-6">
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between">
                                        <span className="text-gray-600 dark:text-gray-400">Status:</span>
                                        {getStatusBadge(applicationLetter.status)}
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-gray-600 dark:text-gray-400">Reference Number:</span>
                                        <span className="font-semibold">{applicationLetter.ref_number}</span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-gray-600 dark:text-gray-400">Department:</span>
                                        <span className="font-semibold">{applicationLetter.department.name}</span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-gray-600 dark:text-gray-400">Internship Duration:</span>
                                        <span className="font-semibold">
                                            {new Date(applicationLetter.start_date).toLocaleDateString()} - {new Date(applicationLetter.end_date).toLocaleDateString()}
                                        </span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-gray-600 dark:text-gray-400">Generated By:</span>
                                        <span className="font-semibold">
                                            {applicationLetter.generatedBy.first_name} {applicationLetter.generatedBy.last_name}
                                        </span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-gray-600 dark:text-gray-400">Generated On:</span>
                                        <span className="font-semibold">
                                            {new Date(applicationLetter.created_at).toLocaleDateString()}
                                        </span>
                                    </div>
                                    {applicationLetter.sent_at && (
                                        <div className="flex items-center justify-between">
                                            <span className="text-gray-600 dark:text-gray-400">Sent On:</span>
                                            <span className="font-semibold">
                                                {new Date(applicationLetter.sent_at).toLocaleDateString()}
                                            </span>
                                        </div>
                                    )}
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="shadow-lg border-none bg-white dark:bg-gray-800 rounded-2xl overflow-hidden">
                            <CardHeader className="bg-gradient-to-r from-green-500 to-green-600 dark:from-green-700 dark:to-green-800 p-6 rounded-t-2xl">
                                <CardTitle className="text-white flex items-center gap-2">
                                    <GraduationCap className="h-6 w-6" />
                                    Student Information
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="p-6">
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between">
                                        <span className="text-gray-600 dark:text-gray-400">Name:</span>
                                        <span className="font-semibold">{student.first_name} {student.last_name}</span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-gray-600 dark:text-gray-400">Email:</span>
                                        <span className="font-semibold">{student.email}</span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-gray-600 dark:text-gray-400">Department:</span>
                                        <span className="font-semibold">{student.department_name}</span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-gray-600 dark:text-gray-400">Year of Study:</span>
                                        <span className="font-semibold">Year {student.year_of_study}</span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-gray-600 dark:text-gray-400">CGPA:</span>
                                        <span className="font-semibold">{student.cgpa}</span>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                )}

                {applicationLetter && (
                    <Card className="shadow-lg border-none bg-white dark:bg-gray-800 rounded-2xl overflow-hidden">
                        <CardHeader className="bg-gradient-to-r from-purple-500 to-purple-600 dark:from-purple-700 dark:to-purple-800 p-6 rounded-t-2xl">
                            <CardTitle className="text-white flex items-center gap-2">
                                <Calendar className="h-6 w-6" />
                                Actions
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-6">
                            <div className="flex gap-4">
                                <Button
                                    onClick={() => window.open(`/student/application-letters/${applicationLetter.letter_id}/view`, '_blank')}
                                    className="flex items-center gap-2"
                                >
                                    <Eye className="h-4 w-4" />
                                    View Letter
                                </Button>
                                <Button
                                    variant="outline"
                                    onClick={() => window.open(`/student/application-letters/${applicationLetter.letter_id}/download`, '_blank')}
                                    className="flex items-center gap-2"
                                >
                                    <Download className="h-4 w-4" />
                                    Download Letter
                                </Button>
                            </div>
                            <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/50 border border-blue-200 dark:border-blue-800 rounded-lg">
                                <h4 className="font-semibold text-blue-800 dark:text-blue-200 mb-2">How to Use Your Application Letter</h4>
                                <ul className="text-blue-700 dark:text-blue-300 text-sm space-y-1">
                                    <li>• Download your application letter and keep it safe</li>
                                    <li>• This letter is required when applying for internship postings</li>
                                    <li>• The letter will be automatically attached to your applications</li>
                                    <li>• Companies will review this letter along with your resume and other documents</li>
                                </ul>
                            </div>
                        </CardContent>
                    </Card>
                )}
            </div>
        </AppLayout>
    );
}
