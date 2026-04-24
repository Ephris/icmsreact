import { Head, Link, router } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft, Upload, FileText } from 'lucide-react';
import { useState } from 'react';

interface AssignedStudent {
  student_id: string;
  name: string;
}

interface CompanySupervisorFormsCreateProps {
  assignedStudents: AssignedStudent[];
  success?: string;
  error?: string;
}

export default function CompanySupervisorFormsCreate({
  assignedStudents,
  success,
  error,
}: CompanySupervisorFormsCreateProps) {
  const [formData, setFormData] = useState({
    title: '',
    type: '',
    student_id: '',
  });
  const [file, setFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!file) {
      alert('Please select a file to upload');
      return;
    }

    setIsSubmitting(true);

    const formDataToSend = new FormData();
    formDataToSend.append('title', formData.title);
    formDataToSend.append('type', formData.type);
    formDataToSend.append('student_id', formData.student_id);
    formDataToSend.append('file', file);

    router.post('/company-supervisor/forms', formDataToSend, {
      onFinish: () => setIsSubmitting(false),
    });
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
    }
  };

  return (
    <AppLayout>
      <Head title="Create Form" />

      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" asChild>
            <Link href="/company-supervisor/forms">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Create Form</h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              Submit a new form for student evaluation
            </p>
          </div>
        </div>

        {success && (
          <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
            <p className="text-green-800 dark:text-green-200">{success}</p>
          </div>
        )}

        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
            <p className="text-red-800 dark:text-red-200">{error}</p>
          </div>
        )}

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-blue-500" />
              Form Details
            </CardTitle>
            <CardDescription>
              Fill in the details for the new form
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6" encType="multipart/form-data">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="title">Form Title *</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => handleInputChange('title', e.target.value)}
                    placeholder="Enter form title"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="type">Form Type *</Label>
                  <Select value={formData.type} onValueChange={(value) => handleInputChange('type', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select form type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="evaluation">Evaluation</SelectItem>
                      <SelectItem value="progress">Progress</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="student_id">Student *</Label>
                <Select value={formData.student_id} onValueChange={(value) => handleInputChange('student_id', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select student" />
                  </SelectTrigger>
                  <SelectContent>
                    {assignedStudents.map((student: AssignedStudent) => (
                      <SelectItem key={student.student_id} value={student.student_id}>
                        {student.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="file">File Upload *</Label>
                <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6">
                  <div className="text-center">
                    <Upload className="mx-auto h-12 w-12 text-gray-400" />
                    <div className="mt-4">
                      <Label htmlFor="file" className="cursor-pointer">
                        <span className="mt-2 block text-sm font-medium text-gray-900 dark:text-white">
                          {file ? file.name : 'Click to upload file'}
                        </span>
                        <span className="mt-1 block text-sm text-gray-500 dark:text-gray-400">
                          PDF files up to 2MB
                        </span>
                      </Label>
                      <Input
                        id="file"
                        type="file"
                        accept=".pdf"
                        onChange={handleFileChange}
                        className="hidden"
                        required
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex gap-4 pt-4">
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? 'Creating...' : 'Create Form'}
                </Button>
                <Button type="button" variant="outline" asChild>
                  <Link href="/company-supervisor/forms">Cancel</Link>
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        {assignedStudents.length === 0 && (
          <Card className="border-yellow-200 dark:border-yellow-800 bg-yellow-50 dark:bg-yellow-900/20">
            <CardContent className="pt-6">
              <div className="text-center">
                <FileText className="mx-auto h-12 w-12 text-yellow-400" />
                <h3 className="mt-2 text-sm font-medium text-yellow-800 dark:text-yellow-200">
                  No Assigned Students
                </h3>
                <p className="mt-1 text-sm text-yellow-600 dark:text-yellow-300">
                  You need to have assigned students before you can create forms.
                </p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </AppLayout>
  );
}