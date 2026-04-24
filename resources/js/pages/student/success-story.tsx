import { Head, useForm } from '@inertiajs/react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Upload, User, Building, FileText, Star } from 'lucide-react';
import AppLayout from '@/layouts/app-layout';
import { getImageUrl, handleImageError } from '@/utils/imageUtils';
import { type BreadcrumbItem } from '@/types';

interface Student {
    student_id: string;
    name: string;
    email: string;
    profile_image?: string;
}

interface Props {
    student: Student;
    success?: string;
    error?: string;
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/student' },
    { title: 'Success Story', href: '/student/success-story' },
];

export default function SuccessStory({ student, success, error }: Props) {
    const [imagePreview, setImagePreview] = useState<string | null>(null);

    const { data, setData, post, processing, errors } = useForm({
        title: '',
        story: '',
        company_name: '',
        role: '',
        outcome: '',
        image: null as File | null,
    });

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setData('image', file);
            const reader = new FileReader();
            reader.onload = (e) => {
                setImagePreview(e.target?.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post(route('student.success-story.store'), {
            forceFormData: true,
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Success Story" />
            <div className="min-h-screen bg-gray-50 dark:bg-gray-900">

                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    {/* Success/Error Messages */}
                    {success && (
                        <div className="mb-6 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
                            <div className="flex">
                                <div className="flex-shrink-0">
                                    <Star className="h-5 w-5 text-green-400" />
                                </div>
                                <div className="ml-3">
                                    <p className="text-sm font-medium text-green-800 dark:text-green-200">{success}</p>
                                </div>
                            </div>
                        </div>
                    )}

                    {error && (
                        <div className="mb-6 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
                            <div className="flex">
                                <div className="flex-shrink-0">
                                    <FileText className="h-5 w-5 text-red-400" />
                                </div>
                                <div className="ml-3">
                                    <p className="text-sm font-medium text-red-800 dark:text-red-200">{error}</p>
                                </div>
                            </div>
                        </div>
                    )}

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Student Info */}
                        <div className="lg:col-span-1">
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center">
                                        <User className="h-5 w-5 mr-2" />
                                        Your Profile
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="flex items-center space-x-4">
                                        {student.profile_image ? (
                                            <img 
                                                src={getImageUrl(student.profile_image)} 
                                                alt={student.name}
                                                className="h-16 w-16 rounded-full object-cover"
                                                onError={(e) => handleImageError(e)}
                                            />
                                        ) : (
                                            <div className="h-16 w-16 rounded-full bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-900/30 dark:to-purple-900/30 flex items-center justify-center">
                                                <User className="h-8 w-8 text-blue-600 dark:text-blue-400" />
                                            </div>
                                        )}
                                        <div>
                                            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">{student.name}</h3>
                                            <p className="text-sm text-gray-600 dark:text-gray-400">{student.email}</p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Success Story Form */}
                        <div className="lg:col-span-2">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Share Your Success Story</CardTitle>
                                    <CardDescription>
                                        Tell us about your internship experience and how ICMS helped you achieve your goals. 
                                        Your story will be reviewed by our admin team before being published on the homepage.
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <form onSubmit={handleSubmit} className="space-y-6">
                                        {/* Title */}
                                        <div>
                                            <Label htmlFor="title">Story Title *</Label>
                                            <Input
                                                id="title"
                                                type="text"
                                                value={data.title}
                                                onChange={(e) => setData('title', e.target.value)}
                                                placeholder="e.g., How ICMS Helped Me Land My Dream Internship"
                                                className="mt-1"
                                            />
                                            {errors.title && <p className="text-red-500 text-sm mt-1">{errors.title}</p>}
                                        </div>

                                        {/* Story */}
                                        <div>
                                            <Label htmlFor="story">Your Story *</Label>
                                            <Textarea
                                                id="story"
                                                value={data.story}
                                                onChange={(e) => setData('story', e.target.value)}
                                                placeholder="Share your experience in detail (minimum 100 characters)..."
                                                rows={6}
                                                className="mt-1"
                                            />
                                            {errors.story && <p className="text-red-500 text-sm mt-1">{errors.story}</p>}
                                        </div>

                                        {/* Company Name */}
                                        <div>
                                            <Label htmlFor="company_name" className="flex items-center">
                                                <Building className="h-4 w-4 mr-2" />
                                                Company Name *
                                            </Label>
                                            <Input
                                                id="company_name"
                                                type="text"
                                                value={data.company_name}
                                                onChange={(e) => setData('company_name', e.target.value)}
                                                placeholder="e.g., TechCorp, Business Solutions"
                                                className="mt-1"
                                            />
                                            {errors.company_name && <p className="text-red-500 text-sm mt-1">{errors.company_name}</p>}
                                        </div>

                                        {/* Role */}
                                        <div>
                                            <Label htmlFor="role">Your Role/Position *</Label>
                                            <Input
                                                id="role"
                                                type="text"
                                                value={data.role}
                                                onChange={(e) => setData('role', e.target.value)}
                                                placeholder="e.g., Software Development Intern, Marketing Assistant"
                                                className="mt-1"
                                            />
                                            {errors.role && <p className="text-red-500 text-sm mt-1">{errors.role}</p>}
                                        </div>

                                        {/* Outcome */}
                                        <div>
                                            <Label htmlFor="outcome">Outcome/Achievement *</Label>
                                            <Textarea
                                                id="outcome"
                                                value={data.outcome}
                                                onChange={(e) => setData('outcome', e.target.value)}
                                                placeholder="What did you achieve? Did you get a job offer? What skills did you develop?"
                                                rows={3}
                                                className="mt-1"
                                            />
                                            {errors.outcome && <p className="text-red-500 text-sm mt-1">{errors.outcome}</p>}
                                        </div>

                                        {/* Image Upload */}
                                        <div>
                                            <Label htmlFor="image">Profile Image (Optional)</Label>
                                            <div className="mt-1">
                                                <input
                                                    id="image"
                                                    type="file"
                                                    accept="image/*"
                                                    onChange={handleImageChange}
                                                    className="hidden"
                                                />
                                                <label
                                                    htmlFor="image"
                                                    className="flex items-center justify-center w-full px-4 py-3 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg cursor-pointer hover:border-gray-400 dark:hover:border-gray-500 transition-colors"
                                                >
                                                    <div className="flex flex-col items-center">
                                                        <Upload className="h-8 w-8 text-gray-400 mb-2" />
                                                        <span className="text-sm text-gray-600 dark:text-gray-400">
                                                            {data.image ? 'Change Image' : 'Upload Image'}
                                                        </span>
                                                    </div>
                                                </label>
                                                {imagePreview && (
                                                    <div className="mt-4">
                                                        <img 
                                                            src={imagePreview} 
                                                            alt="Preview" 
                                                            className="h-24 w-24 rounded-full object-cover mx-auto"
                                                        />
                                                    </div>
                                                )}
                                            </div>
                                            {errors.image && <p className="text-red-500 text-sm mt-1">{errors.image}</p>}
                                        </div>

                                        {/* Submit Button */}
                                        <div className="flex justify-end">
                                            <Button 
                                                type="submit" 
                                                disabled={processing}
                                                className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3"
                                            >
                                                {processing ? 'Submitting...' : 'Submit Success Story'}
                                            </Button>
                                        </div>
                                    </form>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
