import { Head, Link, router } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { ArrowLeft, FileText, Calendar, Building2, MapPin } from 'lucide-react';
import { useState } from 'react';

interface Student {
  student_id: string;
  name: string;
  email: string;
}

interface Posting {
  posting_id: string;
  title: string;
  company_name: string;
  location: string;
  industry: string;
  work_type: string;
}

interface ApplicationLetter {
  start_date: string;
  end_date: string;
  duration_days: number;
}

interface Advisor {
  user_id: string;
  name: string;
}

interface AnalyticsCreateProps {
  student: Student;
  posting: Posting;
  applicationLetter: ApplicationLetter;
  advisor: Advisor | null;
  formTypes: string[];
  success?: string;
  error?: string;
}

export default function AnalyticsCreate({
  student,
  posting,
  applicationLetter,
  advisor,
  formTypes,
  success,
  error,
}: AnalyticsCreateProps) {
  const [formData, setFormData] = useState({
    form_type: '',
    form_title: '',
    supervisor_comments: '',
  });
  const [file, setFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!file) {
      alert('Please select a form file to upload');
      return;
    }

    if (!formData.form_type || !formData.form_title) {
      alert('Please fill in all required fields');
      return;
    }

    setIsSubmitting(true);

    const formDataToSend = new FormData();
    formDataToSend.append('form_type', formData.form_type);
    formDataToSend.append('form_title', formData.form_title);
    formDataToSend.append('supervisor_comments', formData.supervisor_comments);
    formDataToSend.append('form_file', file);

    router.post(
      route('company-supervisor.analytics.store', student.student_id),
      formDataToSend,
      {
        forceFormData: true,
        onSuccess: () => {
          setIsSubmitting(false);
        },
        onError: () => {
          setIsSubmitting(false);
        },
      }
    );
  };

  return (
    <AppLayout>
      <Head title="Submit Analytics" />
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Submit Internship Analytics</h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              Complete the analytics submission for {student.name}
            </p>
          </div>
          <Link href={route('company-supervisor.analytics.index')}>
            <Button variant="outline">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Analytics
            </Button>
          </Link>
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

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Analytics Form</CardTitle>
                <CardDescription>
                  Submit the evaluation form and analytics for this completed internship
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="form_type">Form Type *</Label>
                    <Select
                      value={formData.form_type}
                      onValueChange={(value) => setFormData({ ...formData, form_type: value })}
                      required
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select form type" />
                      </SelectTrigger>
                      <SelectContent>
                        {formTypes.map((type) => (
                          <SelectItem key={type} value={type}>
                            {type.charAt(0).toUpperCase() + type.slice(1).replace('_', ' ')}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="form_title">Form Title *</Label>
                    <Input
                      id="form_title"
                      value={formData.form_title}
                      onChange={(e) => setFormData({ ...formData, form_title: e.target.value })}
                      placeholder="e.g., Final Evaluation Report"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="form_file">Evaluation Form File *</Label>
                    <div className="flex items-center gap-4">
                      <Input
                        id="form_file"
                        type="file"
                        accept=".pdf,.doc,.docx"
                        onChange={(e) => setFile(e.target.files?.[0] || null)}
                        required
                        className="flex-1"
                      />
                      {file && (
                        <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                          <FileText className="w-4 h-4" />
                          {file.name}
                        </div>
                      )}
                    </div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Accepted formats: PDF, DOC, DOCX (Max 5MB)
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="supervisor_comments">Supervisor Comments</Label>
                    <Textarea
                      id="supervisor_comments"
                      value={formData.supervisor_comments}
                      onChange={(e) => setFormData({ ...formData, supervisor_comments: e.target.value })}
                      placeholder="Add any additional comments or observations..."
                      rows={5}
                      maxLength={2000}
                    />
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {formData.supervisor_comments.length}/2000 characters
                    </p>
                  </div>

                  <div className="flex gap-4">
                    <Button type="submit" disabled={isSubmitting}>
                      {isSubmitting ? 'Submitting...' : 'Submit Analytics'}
                    </Button>
                    <Link href={route('company-supervisor.analytics.index')}>
                      <Button type="button" variant="outline">
                        Cancel
                      </Button>
                    </Link>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Student Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Student Name</p>
                  <p className="font-medium">{student.name}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Email</p>
                  <p className="font-medium">{student.email}</p>
                </div>
                {advisor && (
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Advisor</p>
                    <p className="font-medium">{advisor.name}</p>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Internship Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-start gap-2">
                  <Building2 className="w-4 h-4 mt-1 text-gray-500" />
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Posting</p>
                    <p className="font-medium">{posting.title}</p>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <Building2 className="w-4 h-4 mt-1 text-gray-500" />
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Company</p>
                    <p className="font-medium">{posting.company_name}</p>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <MapPin className="w-4 h-4 mt-1 text-gray-500" />
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Location</p>
                    <p className="font-medium">{posting.location}</p>
                  </div>
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Work Type</p>
                  <p className="font-medium capitalize">{posting.work_type}</p>
                </div>
                <div className="flex items-start gap-2">
                  <Calendar className="w-4 h-4 mt-1 text-gray-500" />
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Duration</p>
                    <p className="font-medium">
                      {new Date(applicationLetter.start_date).toLocaleDateString()} - {new Date(applicationLetter.end_date).toLocaleDateString()}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {applicationLetter.duration_days} days
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}

