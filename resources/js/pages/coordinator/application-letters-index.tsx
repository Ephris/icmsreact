import React, { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { FileText, Download, Eye, Send, Plus, Users, Calendar, Clock, CheckCircle, AlertCircle, Filter, Search } from 'lucide-react';
import { type BreadcrumbItem } from '@/types';

interface Student {
    student_id: number;
    user: {
        first_name: string;
        last_name: string;
    };
}

interface ApplicationLetter {
    letter_id: number;
    department_id: number;
    department_name: string;
    ref_number: string;
    start_date: string;
    end_date: string;
    status: 'generated' | 'sent' | 'viewed';
    sent_at: string | null;
    viewed_at: string | null;
    created_at: string;
    student: Student;
    generatedBy: {
        first_name: string;
        last_name: string;
    };
}

interface DepartmentLetters {
    [key: string]: ApplicationLetter[];
}

interface Props {
    lettersByDepartment: DepartmentLetters;
    success?: string;
    error?: string;
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Application Letters', href: '/coordinator/application-letters' },
];

export default function ApplicationLettersIndex({ lettersByDepartment, success, error }: Props) {
    const [showSuccess, setShowSuccess] = useState(!!success);
    const [showError, setShowError] = useState(!!error);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [departmentFilter, setDepartmentFilter] = useState('all');

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'generated':
                return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300 flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    Generated
                </Badge>;
            case 'sent':
                return <Badge variant="secondary" className="bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300 flex items-center gap-1">
                    <Send className="h-3 w-3" />
                    Sent
                </Badge>;
            case 'viewed':
                return <Badge variant="secondary" className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300 flex items-center gap-1">
                    <CheckCircle className="h-3 w-3" />
                    Viewed
                </Badge>;
            default:
                return <Badge variant="secondary">{status}</Badge>;
        }
    };

    // Filter letters based on search and filters
    const getFilteredLetters = () => {
        let filtered = { ...lettersByDepartment };
        
        // Filter by department
        if (departmentFilter !== 'all') {
            filtered = Object.fromEntries(
                Object.entries(filtered).filter(([deptName]) => deptName === departmentFilter)
            );
        }
        
        // Filter by status and search term
        Object.keys(filtered).forEach(deptName => {
            filtered[deptName] = filtered[deptName].filter(letter => {
                const matchesStatus = statusFilter === 'all' || letter.status === statusFilter;
                const matchesSearch = searchTerm === '' || 
                    letter.student.user.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    letter.student.user.last_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    letter.ref_number.toLowerCase().includes(searchTerm.toLowerCase());
                return matchesStatus && matchesSearch;
            });
        });
        
        // Remove empty departments
        return Object.fromEntries(
            Object.entries(filtered).filter(([, letters]) => letters.length > 0)
        );
    };

    const handleSendLetters = (departmentName: string) => {
        const departmentLetters = lettersByDepartment[departmentName];
        if (departmentLetters && departmentLetters.length > 0) {
            const departmentId = departmentLetters[0].department_id;
            router.post('/coordinator/application-letters/send', {
                department_id: departmentId,
            }, {
                onSuccess: () => {
                    setShowSuccess(true);
                    setTimeout(() => setShowSuccess(false), 3000);
                },
                onError: () => {
                    setShowError(true);
                    setTimeout(() => setShowError(false), 3000);
                },
            });
        }
    };

    const canSendLetters = (departmentName: string) => {
        const departmentLetters = lettersByDepartment[departmentName];
        return departmentLetters && departmentLetters.some(letter => letter.status === 'generated');
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Application Letters" />
            <div className="p-6 space-y-6">
                <div className="flex justify-between items-center">
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Application Letters</h1>
                    <Button asChild className="bg-green-600 hover:bg-green-700">
                        <Link href="/coordinator/application-letters/generate">
                            <Plus className="h-4 w-4 mr-2" />
                            Generate Letters
                        </Link>
                    </Button>
                </div>

                {showSuccess && success && (
                    <Alert className="bg-green-50 dark:bg-green-900/50 border-green-200 dark:border-green-800">
                        <AlertCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
                        <AlertDescription className="text-green-700 dark:text-green-300">
                            {success}
                        </AlertDescription>
                    </Alert>
                )}

                {showError && error && (
                    <Alert className="bg-red-50 dark:bg-red-900/50 border-red-200 dark:border-red-800">
                        <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400" />
                        <AlertDescription className="text-red-700 dark:text-red-300">
                            {error}
                        </AlertDescription>
                    </Alert>
                )}

                {/* Search and Filter Controls */}
                <Card className="shadow-md border-gray-200 dark:border-gray-700">
                    <CardHeader className="pb-3">
                        <CardTitle className="text-lg font-semibold text-gray-800 dark:text-gray-100 flex items-center gap-2">
                            <Filter className="h-5 w-5" />
                            Search & Filter Letters
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-0">
                        <div className="flex flex-wrap gap-4 items-center">
                            <div className="flex-1 min-w-64">
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                                    <Input
                                        placeholder="Search by student name or reference number..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="pl-10 border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 rounded-full"
                                    />
                                </div>
                            </div>
                            <Select value={statusFilter} onValueChange={setStatusFilter}>
                                <SelectTrigger className="w-40 border-gray-300 dark:border-gray-600 rounded-full">
                                    <SelectValue placeholder="Filter by status" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Statuses</SelectItem>
                                    <SelectItem value="generated">Generated</SelectItem>
                                    <SelectItem value="sent">Sent</SelectItem>
                                    <SelectItem value="viewed">Viewed</SelectItem>
                                </SelectContent>
                            </Select>
                            <Select value={departmentFilter} onValueChange={setDepartmentFilter}>
                                <SelectTrigger className="w-48 border-gray-300 dark:border-gray-600 rounded-full">
                                    <SelectValue placeholder="Filter by department" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Departments</SelectItem>
                                    {Object.keys(lettersByDepartment).map((deptName) => (
                                        <SelectItem key={deptName} value={deptName}>
                                            {deptName}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </CardContent>
                </Card>

                {Object.keys(getFilteredLetters()).length === 0 ? (
                    <Card className="shadow-lg border-none bg-white dark:bg-gray-800 rounded-2xl overflow-hidden">
                        <CardContent className="p-8 text-center">
                            <FileText className="h-16 w-16 mx-auto text-gray-400 mb-4" />
                            <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-300 mb-2">
                                No Application Letters Generated
                            </h3>
                            <p className="text-gray-500 dark:text-gray-400 mb-6">
                                Start by generating application letters for students in different departments.
                            </p>
                            <Button asChild className="bg-green-600 hover:bg-green-700">
                                <Link href="/coordinator/application-letters/generate">
                                    <Plus className="h-4 w-4 mr-2" />
                                    Generate Letters
                                </Link>
                            </Button>
                        </CardContent>
                    </Card>
                ) : (
                    <div className="space-y-6">
                        {Object.entries(getFilteredLetters()).map(([departmentName, letters]) => (
                            <Card key={departmentName} className="shadow-lg border-none bg-white dark:bg-gray-800 rounded-2xl overflow-hidden">
                                <CardHeader className="bg-gradient-to-r from-blue-500 to-blue-600 dark:from-blue-700 dark:to-blue-800 p-6 rounded-t-2xl">
                                    <div className="flex justify-between items-center">
                                        <CardTitle className="text-white flex items-center gap-2">
                                            <Users className="h-6 w-6" />
                                            {departmentName}
                                        </CardTitle>
                                        <div className="flex items-center gap-2">
                                            <Badge variant="secondary" className="bg-white/20 text-white">
                                                {letters.length} Letters
                                            </Badge>
                                            {canSendLetters(departmentName) && (
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    className="bg-white/20 text-white border-white/30 hover:bg-white/30"
                                                    onClick={() => handleSendLetters(departmentName)}
                                                >
                                                    <Send className="h-4 w-4 mr-2" />
                                                    Send All
                                                </Button>
                                            )}
                                        </div>
                                    </div>
                                </CardHeader>
                                <CardContent className="p-6">
                                    <div className="space-y-4">
                                        {letters.map((letter) => (
                                            <div key={letter.letter_id} className="group flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors duration-200">
                                                <div className="flex items-center gap-4">
                                                    <div className="flex-shrink-0">
                                                        <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
                                                            <FileText className="h-6 w-6 text-white" />
                                                        </div>
                                                    </div>
                                                    <div className="flex-1">
                                                        <h4 className="font-semibold text-gray-900 dark:text-gray-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                                                            {letter.student.user.first_name} {letter.student.user.last_name}
                                                        </h4>
                                                        <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400 mt-1">
                                                            <span className="flex items-center gap-1">
                                                                <Calendar className="h-4 w-4" />
                                                                {new Date(letter.start_date).toLocaleDateString('en-US', { 
                                                                    year: 'numeric', 
                                                                    month: 'short', 
                                                                    day: 'numeric' 
                                                                })} - {new Date(letter.end_date).toLocaleDateString('en-US', { 
                                                                    year: 'numeric', 
                                                                    month: 'short', 
                                                                    day: 'numeric' 
                                                                })}
                                                            </span>
                                                            <span className="flex items-center gap-1">
                                                                <FileText className="h-4 w-4" />
                                                                Ref: {letter.ref_number}
                                                            </span>
                                                            <span className="flex items-center gap-1">
                                                                <Users className="h-4 w-4" />
                                                                Generated by: {letter.generatedBy.first_name} {letter.generatedBy.last_name}
                                                            </span>
                                                            {letter.sent_at && (
                                                                <span className="flex items-center gap-1 text-blue-600 dark:text-blue-400">
                                                                    <Send className="h-4 w-4" />
                                                                    Sent: {new Date(letter.sent_at).toLocaleDateString('en-US', { 
                                                                        year: 'numeric', 
                                                                        month: 'short', 
                                                                        day: 'numeric',
                                                                        hour: '2-digit',
                                                                        minute: '2-digit'
                                                                    })}
                                                                </span>
                                                            )}
                                                            {letter.viewed_at && (
                                                                <span className="flex items-center gap-1 text-green-600 dark:text-green-400">
                                                                    <CheckCircle className="h-4 w-4" />
                                                                    Viewed: {new Date(letter.viewed_at).toLocaleDateString('en-US', { 
                                                                        year: 'numeric', 
                                                                        month: 'short', 
                                                                        day: 'numeric',
                                                                        hour: '2-digit',
                                                                        minute: '2-digit'
                                                                    })}
                                                                </span>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    {getStatusBadge(letter.status)}
                                                    <div className="flex gap-1">
                                                      <Button
                                                        size="sm"
                                                        variant="outline"
                                                        onClick={() => window.open(`/coordinator/application-letters/${letter.letter_id}/view`, '_blank')}
                                                        className="hover:bg-blue-50 dark:hover:bg-blue-900/30"
                                                      >
                                                        <Eye className="h-4 w-4" />
                                                      </Button>
                                                      <Button
                                                        size="sm"
                                                        variant="outline"
                                                        onClick={() => window.open(`/coordinator/application-letters/${letter.letter_id}/download`, '_blank')}
                                                        className="hover:bg-green-50 dark:hover:bg-green-900/30"
                                                      >
                                                        <Download className="h-4 w-4" />
                                                      </Button>
                                                      {letter.status === 'generated' && (
                                                        <Button
                                                          size="sm"
                                                          variant="secondary"
                                                          onClick={() =>
                                                            router.post(
                                                              route('coordinator.application-letters.send-single', letter.letter_id)
                                                            )
                                                          }
                                                        >
                                                          <Send className="h-4 w-4 mr-1" />
                                                          Send
                                                        </Button>
                                                      )}
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}
            </div>
        </AppLayout>
    );
}
