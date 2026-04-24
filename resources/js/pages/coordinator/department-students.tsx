import { Head, Link } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { type BreadcrumbItem } from '@/types';
import { Users, FileText, ArrowLeft, CheckCircle, Clock, AlertCircle, UserCheck, UserX, Eye, Bell, GraduationCap } from 'lucide-react';

interface Department {
    department_id: number;
    name: string;
    code: string | null;
}

interface Application {
    application_id: number;
    status: string;
    posting: {
        title: string;
        company: {
            name: string;
        };
    };
    application_letter?: {
        letter_id: number;
        ref_number: string;
        status: string;
        file_path: string;
        start_date: string;
        end_date: string;
    } | null;
}

interface Student {
    student_id: number;
    user: {
        first_name: string;
        last_name: string;
        email: string;
    };
    applications: Application[];
}

interface Advisor {
    user_id: number;
    name: string;
    email: string;
    phone: string | null;
    specialization: string | null;
    assigned_students_count: number;
    accepted_applications_count: number;
    assigned_students: Array<{
        student_id: number;
        name: string;
    }>;
}

interface Props {
    department: Department;
    students: Student[];
    advisors?: Advisor[];
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Track Departments', href: '/coordinator/departments' },
    { title: 'Department Students', href: '' },
];

export default function DepartmentStudents({ department, students, advisors = [] }: Props) {
    // Count approved letters for notifications - check status correctly
    const approvedLetters = students.reduce((count, student) => {
        return count + (student.applications?.filter(app =>
            app.application_letter && app.application_letter.status === 'approved'
        ).length || 0);
    }, 0);

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Students in ${department.name}`} />
            <div className="p-6 space-y-6">
                {/* Notifications */}
                {approvedLetters > 0 && (
                    <Alert className="border-green-200 bg-green-50 dark:bg-green-900/20 dark:border-green-800">
                        <Bell className="h-4 w-4 text-green-600 dark:text-green-400" />
                        <AlertDescription className="text-green-800 dark:text-green-200">
                            <strong>{approvedLetters}</strong> application letter{approvedLetters > 1 ? 's' : ''} have been approved by companies. Students can now proceed with their internships.
                        </AlertDescription>
                    </Alert>
                )}

                <div className="flex items-center gap-4">
                    <Button asChild variant="outline">
                        <Link href="/coordinator/departments">
                            <ArrowLeft className="h-4 w-4 mr-2" />
                            Back to Departments
                        </Link>
                    </Button>
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">{department.name} Students</h1>
                        {department.code && <p className="text-gray-600 dark:text-gray-400">Code: {department.code}</p>}
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {students.map((student) => (
                        <Card key={student.student_id} className="shadow-lg border-none bg-white dark:bg-gray-800 rounded-2xl overflow-hidden transition-all duration-300 hover:shadow-xl">
                            <CardHeader className="bg-gradient-to-r from-blue-500 to-blue-600 dark:from-blue-700 dark:to-blue-800 p-6 rounded-t-2xl">
                                <CardTitle className="text-white flex items-center gap-2">
                                    <Users className="h-6 w-6" />
                                    {student.user?.first_name && student.user?.last_name ? `${student.user.first_name} ${student.user.last_name}` : 'Unknown Student'}
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="p-6 space-y-4">
                                <p className="text-sm text-gray-600 dark:text-gray-400">{student.user?.email || 'No email available'}</p>

                                        <div className="space-y-2">
                                    <h4 className="font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                                        <FileText className="h-4 w-4" />
                                        Applications
                                    </h4>
                                    {student.applications && student.applications.length > 0 ? (
                                        <div className="space-y-3">
                                            {student.applications.map((app) => (
                                                <div key={app.application_id} className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                                                    <div className="space-y-2">
                                                    <div className="flex justify-between items-start">
                                                        <div>
                                                            <p className="font-medium text-sm">{app.posting?.title || 'Unknown Title'}</p>
                                                            <p className="text-xs text-gray-600 dark:text-gray-400">{app.posting?.company?.name || 'Unknown Company'}</p>
                                                        </div>
                                                        <Badge variant="default" className="bg-green-500 hover:bg-green-600">
                                                            {app.status || 'Unknown Status'}
                                                        </Badge>
                                                        </div>
                                                        
                                                        {/* Application Letter Status */}
                                                        {app.application_letter ? (
                                                            <div className="border-t border-gray-200 dark:border-gray-600 pt-2">
                                                                <div className="flex items-center justify-between">
                                                                    <div className="flex items-center gap-2">
                                                                        <FileText className="h-4 w-4 text-blue-600" />
                                                                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Application Letter</span>
                                                                    </div>
                                                                    <div className="flex items-center gap-2">
                                                                        {app.application_letter.status === 'approved' ? (
                                                                            <div className="flex items-center gap-1 text-green-600 dark:text-green-400">
                                                                                <UserCheck className="h-3 w-3" />
                                                                                <CheckCircle className="h-3 w-3" />
                                                                                <span className="text-xs font-medium">Approved</span>
                                                                            </div>
                                                                        ) : app.application_letter.status === 'rejected' ? (
                                                                            <div className="flex items-center gap-1 text-red-600 dark:text-red-400">
                                                                                <UserX className="h-3 w-3" />
                                                                                <span className="text-xs font-medium">Rejected</span>
                                                                            </div>
                                                                        ) : app.application_letter.status === 'viewed' ? (
                                                                            <div className="flex items-center gap-1 text-blue-600 dark:text-blue-400">
                                                                                <Eye className="h-3 w-3" />
                                                                                <span className="text-xs font-medium">Viewed</span>
                                                                            </div>
                                                                        ) : app.application_letter.status === 'sent' ? (
                                                                            <div className="flex items-center gap-1 text-indigo-600 dark:text-indigo-400">
                                                                                <CheckCircle className="h-3 w-3" />
                                                                                <span className="text-xs font-medium">Sent</span>
                                                                            </div>
                                                                        ) : (
                                                                            <div className="flex items-center gap-1 text-yellow-600 dark:text-yellow-400">
                                                                                <Clock className="h-3 w-3" />
                                                                                <span className="text-xs font-medium">Generated</span>
                                                                            </div>
                                                                        )}
                                                                    </div>
                                                                </div>
                                                                <div className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                                                                    Ref: {app.application_letter.ref_number || 'N/A'} | 
                                                                    Duration: {app.application_letter.start_date ? new Date(app.application_letter.start_date).toLocaleDateString() : 'N/A'} - {app.application_letter.end_date ? new Date(app.application_letter.end_date).toLocaleDateString() : 'N/A'}
                                                                </div>
                                                            </div>
                                                        ) : (
                                                            <div className="border-t border-gray-200 dark:border-gray-600 pt-2">
                                                                <div className="flex items-center gap-2 text-red-600">
                                                                    <AlertCircle className="h-4 w-4" />
                                                                    <span className="text-sm font-medium">No Application Letter</span>
                                                                </div>
                                                                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                                                    Student needs to obtain application letter from coordinator
                                                                </p>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <p className="text-sm text-gray-500 dark:text-gray-400">No applications</p>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>

                {students.length === 0 && (
                    <Card className="shadow-lg border-none bg-white dark:bg-gray-800 rounded-2xl overflow-hidden">
                        <CardContent className="p-6 text-center">
                            <p className="text-gray-600 dark:text-gray-400">No students with applications in this department.</p>
                        </CardContent>
                    </Card>
                )}

                {/* Advisors Section */}
                {advisors.length > 0 && (
                    <div className="mt-8">
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
                            <GraduationCap className="h-6 w-6" />
                            Advisors
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {advisors.map((advisor) => (
                                <Card key={advisor.user_id} className="shadow-lg border-none bg-white dark:bg-gray-800 rounded-2xl overflow-hidden transition-all duration-300 hover:shadow-xl">
                                    <CardHeader className="bg-gradient-to-r from-purple-500 to-purple-600 dark:from-purple-700 dark:to-purple-800 p-6 rounded-t-2xl">
                                        <CardTitle className="text-white flex items-center gap-2">
                                            <GraduationCap className="h-6 w-6" />
                                            {advisor.name}
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="p-6 space-y-4">
                                        <p className="text-sm text-gray-600 dark:text-gray-400">{advisor.email}</p>
                                        {advisor.phone && (
                                            <p className="text-sm text-gray-600 dark:text-gray-400">Phone: {advisor.phone}</p>
                                        )}
                                        {advisor.specialization && (
                                            <p className="text-sm text-gray-600 dark:text-gray-400">Specialization: {advisor.specialization}</p>
                                        )}
                                        <div className="grid grid-cols-2 gap-3">
                                            <div className="text-center rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/40 p-3">
                                                <div className="text-lg font-bold text-purple-700 dark:text-purple-400">{advisor.assigned_students_count}</div>
                                                <div className="text-xs text-gray-700 dark:text-gray-400">Assigned Students</div>
                                            </div>
                                            <div className="text-center rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/40 p-3">
                                                <div className="text-lg font-bold text-green-700 dark:text-green-400">{advisor.accepted_applications_count}</div>
                                                <div className="text-xs text-gray-700 dark:text-gray-400">Accepted Apps</div>
                                            </div>
                                        </div>
                                        {advisor.assigned_students.length > 0 && (
                                            <div className="mt-4">
                                                <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Assigned Students:</p>
                                                <div className="space-y-1">
                                                    {advisor.assigned_students.map((student) => (
                                                        <div key={student.student_id} className="text-xs text-gray-600 dark:text-gray-400">
                                                            • {student.name}
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </AppLayout>
    );
}