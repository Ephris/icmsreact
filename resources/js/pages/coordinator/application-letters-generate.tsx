import React, { useState } from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { FileText, Users, Calendar, FileDown, CheckCircle, AlertCircle, Clock, Building } from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';
import { type BreadcrumbItem } from '@/types';

interface Student {
    student_id: number;
    user: {
        first_name: string;
        last_name: string;
    };
    year_of_study: string;
}

interface Department {
    department_id: number;
    name: string;
    code?: string | null;
    students: Student[];
    has_existing_letters?: boolean;
    students_with_letters_count?: number;
}

interface Props {
    departments: Department[];
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Application Letters', href: '/coordinator/application-letters' },
    { title: 'Generate Letters', href: '/coordinator/application-letters/generate' },
];

export default function ApplicationLettersGenerate({ departments }: Props) {
    const [selectedDepartment, setSelectedDepartment] = useState<Department | null>(null);
    const [selectedStudents, setSelectedStudents] = useState<number[]>([]);

    const { data, setData, post, processing, errors } = useForm({
        department_id: '',
        start_date: '',
        end_date: '',
        student_ids: [] as number[],
    });

    const handleDepartmentChange = (departmentId: string) => {
        const department = departments.find(d => d.department_id.toString() === departmentId);
        setSelectedDepartment(department || null);
        setData('department_id', departmentId);
        // Reset selected students when department changes
        setSelectedStudents([]);
        setData('student_ids', []);
    };

    const handleStudentToggle = (studentId: number) => {
        setSelectedStudents(prev => {
            const newSelection = prev.includes(studentId)
                ? prev.filter(id => id !== studentId)
                : [...prev, studentId];
            setData('student_ids', newSelection);
            return newSelection;
        });
    };

    const handleSelectAll = () => {
        if (selectedDepartment) {
            const allStudentIds = selectedDepartment.students.map(s => s.student_id);
            setSelectedStudents(allStudentIds);
            setData('student_ids', allStudentIds);
        }
    };

    const handleDeselectAll = () => {
        setSelectedStudents([]);
        setData('student_ids', []);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        
        // Check if students are selected
        if (selectedStudents.length === 0) {
            alert('Please select at least one student to generate application letters for.');
            return;
        }
        
        post('/coordinator/application-letters/generate', {
            onSuccess: () => {
                // Redirect will be handled by the controller
            },
        });
    };

    // Calculate statistics
    const totalStudents = departments.reduce((sum, dept) => sum + dept.students.length, 0);
    const totalDepartments = departments.length;

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Generate Application Letters" />
            <div className="p-6 space-y-6">
                <div className="flex justify-between items-center">
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Generate Application Letters</h1>
                    <Button asChild variant="outline">
                        <Link href="/coordinator/application-letters">
                            <FileText className="h-4 w-4 mr-2" />
                            View Letters
                        </Link>
                    </Button>
                </div>

                {/* Statistics Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <Card className="shadow-md border-gray-200 dark:border-gray-700">
                        <CardContent className="p-6">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
                                    <Building className="h-6 w-6 text-white" />
                                </div>
                                <div>
                                    <p className="text-sm text-gray-600 dark:text-gray-400">Total Departments</p>
                                    <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{totalDepartments}</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                    <Card className="shadow-md border-gray-200 dark:border-gray-700">
                        <CardContent className="p-6">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-green-600 rounded-lg flex items-center justify-center">
                                    <Users className="h-6 w-6 text-white" />
                                </div>
                                <div>
                                    <p className="text-sm text-gray-600 dark:text-gray-400">Total Students</p>
                                    <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{totalStudents}</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                    <Card className="shadow-md border-gray-200 dark:border-gray-700">
                        <CardContent className="p-6">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg flex items-center justify-center">
                                    <FileText className="h-6 w-6 text-white" />
                                </div>
                                <div>
                                    <p className="text-sm text-gray-600 dark:text-gray-400">Selected Students</p>
                                    <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                                        {selectedStudents.length}
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <Card className="shadow-lg border-none bg-white dark:bg-gray-800 rounded-2xl overflow-hidden">
                        <CardHeader className="bg-gradient-to-r from-green-500 to-green-600 dark:from-green-700 dark:to-green-800 p-6 rounded-t-2xl">
                            <CardTitle className="text-white flex items-center gap-2">
                                <FileDown className="h-6 w-6" />
                                Generate Letters
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-6">
                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div className="space-y-2">
                                    <Label htmlFor="department_id" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                        Department
                                    </Label>
                                    <Select value={data.department_id} onValueChange={handleDepartmentChange}>
                                        <SelectTrigger className="w-full">
                                            <SelectValue placeholder="Select department" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {departments.map((department) => (
                                                <SelectItem 
                                                    key={department.department_id} 
                                                    value={department.department_id.toString()}
                                                >
                                                    {department.name} ({department.students.length} students without letters)
                                                    {department.has_existing_letters && ` - ${department.students_with_letters_count} already have letters`}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    {errors.department_id && (
                                        <Alert className="bg-red-50 dark:bg-red-900/50 border-red-200 dark:border-red-800">
                                            <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400" />
                                            <AlertDescription className="text-red-700 dark:text-red-300">
                                                {errors.department_id}
                                            </AlertDescription>
                                        </Alert>
                                    )}
                                    {selectedDepartment && selectedDepartment.has_existing_letters && (
                                        <Alert className="bg-yellow-50 dark:bg-yellow-900/50 border-yellow-200 dark:border-yellow-800">
                                            <AlertCircle className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
                                            <AlertDescription className="text-yellow-700 dark:text-yellow-300">
                                                This department already has {selectedDepartment.students_with_letters_count} student(s) with application letters. You can only generate letters for students without existing letters.
                                            </AlertDescription>
                                        </Alert>
                                    )}
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="start_date" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                            Start Date
                                        </Label>
                                        <Input
                                            id="start_date"
                                            type="date"
                                            value={data.start_date}
                                            onChange={(e) => setData('start_date', e.target.value)}
                                            className="w-full"
                                        />
                                        {errors.start_date && (
                                            <Alert className="bg-red-50 dark:bg-red-900/50 border-red-200 dark:border-red-800">
                                                <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400" />
                                                <AlertDescription className="text-red-700 dark:text-red-300">
                                                    {errors.start_date}
                                                </AlertDescription>
                                            </Alert>
                                        )}
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="end_date" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                            End Date
                                        </Label>
                                        <Input
                                            id="end_date"
                                            type="date"
                                            value={data.end_date}
                                            onChange={(e) => setData('end_date', e.target.value)}
                                            className="w-full"
                                        />
                                        {errors.end_date && (
                                            <Alert className="bg-red-50 dark:bg-red-900/50 border-red-200 dark:border-red-800">
                                                <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400" />
                                                <AlertDescription className="text-red-700 dark:text-red-300">
                                                    {errors.end_date}
                                                </AlertDescription>
                                            </Alert>
                                        )}
                                    </div>
                                </div>

                                <Button 
                                    type="submit" 
                                    disabled={processing || !data.department_id || !data.start_date || !data.end_date || selectedStudents.length === 0}
                                    className="w-full bg-green-600 hover:bg-green-700"
                                >
                                    {processing ? (
                                        <>
                                            <Clock className="h-4 w-4 mr-2 animate-spin" />
                                            Generating...
                                        </>
                                    ) : (
                                        <>
                                    <FileDown className="h-4 w-4 mr-2" />
                                            Generate Letters
                                        </>
                                    )}
                                </Button>
                            </form>
                        </CardContent>
                    </Card>

                    <Card className="shadow-lg border-none bg-white dark:bg-gray-800 rounded-2xl overflow-hidden">
                        <CardHeader className="bg-gradient-to-r from-blue-500 to-blue-600 dark:from-blue-700 dark:to-blue-800 p-6 rounded-t-2xl">
                            <CardTitle className="text-white flex items-center gap-2">
                                <Users className="h-6 w-6" />
                                Selected Department
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-6">
                            {selectedDepartment ? (
                                <div className="space-y-4">
                                    <div className="text-center">
                                        <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
                                            {selectedDepartment.name}
                                        </h3>
                                    <p className="text-gray-600 dark:text-gray-400">
                                        {selectedDepartment.students.length} students available ({selectedStudents.length} selected)
                                    </p>
                                    </div>

                                    {selectedDepartment.students.length > 0 && (
                                        <div className="flex gap-2 mb-3">
                                            <Button
                                                type="button"
                                                variant="outline"
                                                size="sm"
                                                onClick={handleSelectAll}
                                                className="text-xs"
                                            >
                                                Select All
                                            </Button>
                                            <Button
                                                type="button"
                                                variant="outline"
                                                size="sm"
                                                onClick={handleDeselectAll}
                                                className="text-xs"
                                            >
                                                Deselect All
                                            </Button>
                                        </div>
                                    )}

                                    <div className="max-h-64 overflow-y-auto">
                                        <div className="space-y-2">
                                            {selectedDepartment.students.length > 0 ? (
                                                selectedDepartment.students.map((student) => (
                                                    <div 
                                                        key={student.student_id} 
                                                        className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors cursor-pointer"
                                                        onClick={() => handleStudentToggle(student.student_id)}
                                                    >
                                                        <div className="flex items-center gap-3 flex-1">
                                                            <Checkbox
                                                                checked={selectedStudents.includes(student.student_id)}
                                                                onCheckedChange={() => handleStudentToggle(student.student_id)}
                                                                onClick={(e) => e.stopPropagation()}
                                                            />
                                                            <div className="w-8 h-8 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full flex items-center justify-center">
                                                                <span className="text-white text-sm font-semibold">
                                                                    {student.user.first_name[0]}{student.user.last_name[0]}
                                                                </span>
                                                            </div>
                                                            <div>
                                                                <p className="font-medium text-gray-900 dark:text-gray-100">
                                                                    {student.user.first_name} {student.user.last_name}
                                                                </p>
                                                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                                                    Year {student.year_of_study}
                                                                </p>
                                                            </div>
                                                        </div>
                                                        <div className="flex items-center gap-2">
                                                            {selectedStudents.includes(student.student_id) ? (
                                                                <>
                                                                    <CheckCircle className="h-4 w-4 text-green-500" />
                                                                    <span className="text-xs text-gray-500 dark:text-gray-400">Selected</span>
                                                                </>
                                                            ) : (
                                                                <span className="text-xs text-gray-400">Not selected</span>
                                                            )}
                                                        </div>
                                                    </div>
                                                ))
                                            ) : (
                                                <div className="text-center py-4 text-gray-500 dark:text-gray-400">
                                                    All students in this department already have application letters.
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="text-center py-8">
                                    <Users className="h-16 w-16 mx-auto text-gray-400 mb-4" />
                                    <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-2">
                                        Select a Department
                                    </h3>
                                    <p className="text-gray-500 dark:text-gray-400">
                                        Choose a department to see the list of students who will receive application letters.
                                    </p>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>

                <Card className="shadow-lg border-none bg-white dark:bg-gray-800 rounded-2xl overflow-hidden">
                    <CardHeader className="bg-gradient-to-r from-yellow-500 to-yellow-600 dark:from-yellow-700 dark:to-yellow-800 p-6 rounded-t-2xl">
                        <CardTitle className="text-white flex items-center gap-2">
                            <Calendar className="h-6 w-6" />
                            Important Information
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-6">
                        <div className="space-y-4">
                            <div className="flex items-start gap-3">
                                <div className="w-2 h-2 bg-yellow-500 rounded-full mt-2"></div>
                                <p className="text-gray-700 dark:text-gray-300">
                                    Application letters will be generated for all students in the selected department.
                                </p>
                            </div>
                            <div className="flex items-start gap-3">
                                <div className="w-2 h-2 bg-yellow-500 rounded-full mt-2"></div>
                                <p className="text-gray-700 dark:text-gray-300">
                                    Each letter will include a unique reference number and the specified internship duration.
                                </p>
                            </div>
                            <div className="flex items-start gap-3">
                                <div className="w-2 h-2 bg-yellow-500 rounded-full mt-2"></div>
                                <p className="text-gray-700 dark:text-gray-300">
                                    After generation, you can send the letters to students and track their status.
                                </p>
                            </div>
                            <div className="flex items-start gap-3">
                                <div className="w-2 h-2 bg-yellow-500 rounded-full mt-2"></div>
                                <p className="text-gray-700 dark:text-gray-300">
                                    Students will need these letters to apply for internship postings.
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
