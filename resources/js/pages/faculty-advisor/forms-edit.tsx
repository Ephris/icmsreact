import { Head, Link, router } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { ArrowLeft, Upload, FileText } from 'lucide-react';
import { useState } from 'react';


interface Form {
  form_id: string;
  title: string;
  type: string;
  student_id: string;
  student_name: string;
  supervisor_name: string;
  description: string;
  file_path: string;
}

interface FacultyAdvisorFormsEditProps {
  form: Form;
  success?: string;
  error?: string;
}

export default function FacultyAdvisorFormsEdit({
  form,
  success,
  error,
}: FacultyAdvisorFormsEditProps) {
  const [formData, setFormData] = useState({
    title: form.title,
    type: form.type,
    student_id: form.student_id,
    description: form.description,
  });
  const [file, setFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    setIsSubmitting(true);
    
    const formDataToSend = new FormData();
    formDataToSend.append('title', formData.title);
    formDataToSend.append('type', formData.type);
    formDataToSend.append('student_id', formData.student_id);
    formDataToSend.append('description', formData.description);
    if (file) {
      formDataToSend.append('file', file);
    }
    formDataToSend.append('_method', 'PUT');

    router.post(`/faculty-advisor/forms/${form.form_id}`, formDataToSend, {
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
      <Head title="Edit Form" />
      
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" asChild>
            <Link href="/faculty-advisor/forms">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Edit Form</h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              Update form details for student evaluation
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
              Update the details for the form
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
                      <SelectItem value="progress_report">Progress Report</SelectItem>
                      <SelectItem value="final_report">Final Report</SelectItem>
                      <SelectItem value="midterm_evaluation">Midterm Evaluation</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label>Student</Label>
                  <p className="text-gray-900 dark:text-white">{form.student_name}</p>
                </div>

                <div className="space-y-2">
                  <Label>Assigned Supervisor</Label>
                  <p className="text-gray-900 dark:text-white">{form.supervisor_name}</p>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  placeholder="Enter form description (optional)"
                  rows={4}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="file">File Upload</Label>
                <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6">
                  <div className="text-center">
                    <Upload className="mx-auto h-12 w-12 text-gray-400" />
                    <div className="mt-4">
                      <Label htmlFor="file" className="cursor-pointer">
                        <span className="mt-2 block text-sm font-medium text-gray-900 dark:text-white">
                          {file ? file.name : 'Click to upload new file (optional)'}
                        </span>
                        <span className="mt-1 block text-sm text-gray-500 dark:text-gray-400">
                          PDF, DOC, or DOCX files up to 10MB
                        </span>
                      </Label>
                      <Input
                        id="file"
                        type="file"
                        accept=".pdf,.doc,.docx"
                        onChange={handleFileChange}
                        className="hidden"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex gap-4 pt-4">
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? 'Updating...' : 'Update Form'}
                </Button>
                <Button type="button" variant="outline" asChild>
                  <Link href="/faculty-advisor/forms">Cancel</Link>
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
