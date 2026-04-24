import { Head, useForm } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { type BreadcrumbItem } from '@/types';
import { FileText, Download } from 'lucide-react';

interface Student {
    student_id: number;
    user: { name: string };
}

interface Props {
    students: Student[];
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Issue Letters', href: '/coordinator/letters' },
];

export default function Letters({ students }: Props) {
    const { data, setData, post, processing } = useForm({
        type: '',
        student_id: '',
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post('/coordinator/letters/generate', {
            onSuccess: () => {
                // PDF will be downloaded
            },
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Issue Letters" />
            <div className="p-6 space-y-6">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Issue Letters</h1>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <Card className="shadow-lg border-none bg-white dark:bg-gray-800 rounded-2xl overflow-hidden">
                        <CardHeader className="bg-gradient-to-r from-green-500 to-green-600 dark:from-green-700 dark:to-green-800 p-6 rounded-t-2xl">
                            <CardTitle className="text-white flex items-center gap-2">
                                <FileText className="h-6 w-6" />
                                Generate Letter
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-6">
                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Letter Type</label>
                                    <Select value={data.type} onValueChange={(value) => setData('type', value)}>
                                        <SelectTrigger className="mt-1">
                                            <SelectValue placeholder="Select letter type" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="acceptance">Acceptance Letter</SelectItem>
                                            <SelectItem value="completion">Completion Letter</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Student</label>
                                    <Select value={data.student_id} onValueChange={(value) => setData('student_id', value)}>
                                        <SelectTrigger className="mt-1">
                                            <SelectValue placeholder="Select student" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {students.map((student) => (
                                                <SelectItem key={student.student_id} value={student.student_id.toString()}>
                                                    {student.user.name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <Button type="submit" disabled={processing} className="flex items-center gap-2">
                                    <Download className="h-4 w-4" />
                                    {processing ? 'Generating...' : 'Generate Letter'}
                                </Button>
                            </form>
                        </CardContent>
                    </Card>

                    <Card className="shadow-lg border-none bg-white dark:bg-gray-800 rounded-2xl overflow-hidden">
                        <CardHeader className="bg-gradient-to-r from-blue-500 to-blue-600 dark:from-blue-700 dark:to-blue-800 p-6 rounded-t-2xl">
                            <CardTitle className="text-white flex items-center gap-2">
                                <FileText className="h-6 w-6" />
                                Letter History
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-6">
                            <p className="text-gray-600 dark:text-gray-400 text-sm">
                                Generated letters are downloaded immediately. No history is stored at this time.
                                For record keeping, save the downloaded files appropriately.
                            </p>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </AppLayout>
    );
}