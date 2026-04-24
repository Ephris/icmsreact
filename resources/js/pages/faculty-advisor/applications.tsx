import { Head, router } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Search, ArrowUpDown, User, Briefcase, MessageSquare, CheckCircle } from 'lucide-react';
import { useState } from 'react';

interface Application {
  application_id: string;
  student_id?: number;
  student_name: string;
  student_gender?: 'male' | 'female';
  student_university_id?: string | null;
  posting_title: string;
  posting_type: string;
  status: string;
  feedback?: {
    feedback_id: number;
    content: string;
    rating: number;
    created_at: string;
  } | null;
  submitted_at: string;
}

interface PaginationLink {
  url: string | null;
  label: string;
  active: boolean;
}

interface PaginationMeta {
  from: number;
  to: number;
  total: number;
  current_page: number;
  last_page: number;
}

interface FacultyAdvisorApplicationsProps {
  applications: {
    data: Application[];
    links: PaginationLink[];
    meta: PaginationMeta;
  };
  filters: {
    search?: string;
    sort_by?: string;
    sort_dir?: string;
  };
  success?: string;
  error?: string;
}

export default function FacultyAdvisorApplications({
  applications,
  filters,
  success,
  error,
}: FacultyAdvisorApplicationsProps) {
  const [search, setSearch] = useState(filters.search || '');
  const [sortBy, setSortBy] = useState(filters.sort_by || 'submitted_at');
  const [sortDir, setSortDir] = useState(filters.sort_dir || 'desc');
  const [selectedApplication, setSelectedApplication] = useState<Application | null>(null);
  const [feedback, setFeedback] = useState('');
  const [rating, setRating] = useState(5);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  const handleSearch = (value: string) => {
    setSearch(value);
    router.get('/faculty-advisor/applications', {
      search: value,
      sort_by: sortBy,
      sort_dir: sortDir,
    }, {
      preserveState: true,
      replace: true,
    });
  };

  const handleSort = (field: string) => {
    const newSortDir = sortBy === field && sortDir === 'asc' ? 'desc' : 'asc';
    setSortBy(field);
    setSortDir(newSortDir);
    router.get('/faculty-advisor/applications', {
      search,
      sort_by: field,
      sort_dir: newSortDir,
    }, {
      preserveState: true,
      replace: true,
    });
  };

  const handleProvideFeedback = (application: Application) => {
    setSelectedApplication(application);
    setIsEditing(!!application.feedback);
    setFeedback(application.feedback?.content || '');
    setRating(application.feedback?.rating || 5);
    setIsDialogOpen(true);
  };

  const handleDeleteFeedback = (feedbackId: number) => {
    if (confirm('Are you sure you want to delete this feedback?')) {
      router.delete(`/faculty-advisor/feedback/${feedbackId}`);
    }
  };

  const submitFeedback = () => {
    if (selectedApplication && feedback.trim()) {
      if (isEditing && selectedApplication.feedback) {
        router.put(`/faculty-advisor/feedback/${selectedApplication.feedback.feedback_id}`, {
          content: feedback.trim(),
          rating: rating,
        });
      } else {
        router.post(`/faculty-advisor/applications/${selectedApplication.application_id}/feedback`, {
          content: feedback.trim(),
          rating: rating,
        });
      }
      setIsDialogOpen(false);
      setFeedback('');
      setRating(5);
      setSelectedApplication(null);
      setIsEditing(false);
    }
  };

  const getStatusBadgeColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'accepted':
        return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300';
      case 'rejected':
        return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-300';
    }
  };

  const getTypeBadgeColor = (type: string) => {
    switch (type.toLowerCase()) {
      case 'internship':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300';
      case 'career':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-300';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-300';
    }
  };

  return (
    <AppLayout>
      <Head title="Student Applications" />

      <div className="space-y-6">
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-lg p-6 border border-blue-200 dark:border-blue-800">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <MessageSquare className="h-8 w-8 text-blue-600" />
                Student Applications
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-2">
                Review and provide feedback on student applications for internships and career opportunities
              </p>
            </div>
            <Badge variant="secondary" className="text-lg px-3 py-1">
              {applications.data.length} Applications
            </Badge>
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

        <Card className="shadow-lg border-0 bg-white dark:bg-gray-800">
          <CardHeader className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-700 border-b">
            <CardTitle className="flex items-center gap-2 text-xl">
              <Briefcase className="h-5 w-5 text-blue-600" />
              Application Management
            </CardTitle>
            <CardDescription>
              Review and provide constructive feedback on applications from your assigned students
            </CardDescription>
          </CardHeader>
          <CardContent className="p-6">
            <div className="flex flex-col sm:flex-row gap-4 mb-6">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search applications..."
                  value={search}
                  onChange={(e) => handleSearch(e.target.value)}
                  className="pl-10"
                />
              </div>
              <div className="flex gap-2">
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Sort by" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="submitted_at">Submitted Date</SelectItem>
                    <SelectItem value="student_name">Student Name</SelectItem>
                    <SelectItem value="posting_title">Posting Title</SelectItem>
                    <SelectItem value="status">Status</SelectItem>
                  </SelectContent>
                </Select>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => handleSort(sortBy)}
                >
                  <ArrowUpDown className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <div className="rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
              <Table>
                <TableHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20">
                  <TableRow>
                    <TableHead className="cursor-pointer" onClick={() => handleSort('student_name')}>
                      <div className="flex items-center gap-2">
                        Student
                        <ArrowUpDown className="h-4 w-4" />
                      </div>
                    </TableHead>
                    <TableHead className="cursor-pointer" onClick={() => handleSort('posting_title')}>
                      <div className="flex items-center gap-2">
                        Posting
                        <ArrowUpDown className="h-4 w-4" />
                      </div>
                    </TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead className="cursor-pointer" onClick={() => handleSort('status')}>
                      <div className="flex items-center gap-2">
                        Status
                        <ArrowUpDown className="h-4 w-4" />
                      </div>
                    </TableHead>
                    <TableHead>Feedback</TableHead>
                    <TableHead className="cursor-pointer" onClick={() => handleSort('submitted_at')}>
                      <div className="flex items-center gap-2">
                        Submitted
                        <ArrowUpDown className="h-4 w-4" />
                      </div>
                    </TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {applications.data.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-8 text-gray-500">
                        No applications found
                      </TableCell>
                    </TableRow>
                  ) : (
                    applications.data.map((application) => (
                      <TableRow key={application.application_id}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <div className="p-2 rounded-full bg-blue-100 dark:bg-blue-900/20">
                              <User className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                            </div>
                            <div>
                              <div className="font-medium text-gray-900 dark:text-white flex items-center gap-2">
                                <span>{application.student_name}</span>
                                {application.student_gender && (
                                  <span className="text-xs text-gray-500 dark:text-gray-400 capitalize">({application.student_gender})</span>
                                )}
                              </div>
                              {application.student_university_id && (
                                <div className="text-xs text-gray-500 dark:text-gray-400">UNid: {application.student_university_id}</div>
                              )}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Briefcase className="h-4 w-4 text-gray-400" />
                            <span className="font-medium">{application.posting_title}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge className={getTypeBadgeColor(application.posting_type)}>
                            {application.posting_type}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge className={getStatusBadgeColor(application.status)}>
                            {application.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {application.feedback ? (
                            <div className="space-y-1">
                              <div className="flex items-center gap-1">
                                <div className="flex">
                                  {[...Array(5)].map((_, i) => (
                                    <span
                                      key={i}
                                      className={`text-sm ${i < application.feedback!.rating ? 'text-yellow-400' : 'text-gray-300'}`}
                                    >
                                      ★
                                    </span>
                                  ))}
                                </div>
                                <span className="text-xs text-gray-500 ml-1">
                                  ({application.feedback!.rating}/5)
                                </span>
                              </div>
                              <div className="text-xs text-gray-600 dark:text-gray-400 truncate max-w-40" title={application.feedback!.content}>
                                {application.feedback!.content.length > 35
                                  ? `${application.feedback!.content.substring(0, 35)}...`
                                  : application.feedback!.content}
                              </div>
                            </div>
                          ) : (
                            <div className="flex items-center gap-2">
                              <div className="w-2 h-2 bg-gray-300 rounded-full"></div>
                              <span className="text-sm text-gray-400">Pending feedback</span>
                            </div>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="text-sm text-gray-500 dark:text-gray-400">
                            {new Date(application.submitted_at).toLocaleDateString()}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleProvideFeedback(application)}
                            >
                              <MessageSquare className="h-4 w-4 mr-1" />
                              {application.feedback ? 'Edit Feedback' : 'Add Feedback'}
                            </Button>
                            {application.feedback && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleDeleteFeedback(application.feedback!.feedback_id)}
                                className="text-red-600 hover:text-red-700"
                              >
                                Delete
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>

            {applications.data.length > 0 && (
              <div className="flex items-center justify-between mt-4">
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  Showing {applications.meta?.from || 0} to {applications.meta?.to || 0} of {applications.meta?.total || 0} applications
                </div>
                <div className="flex gap-2">
                  {applications.links.map((link, index) => (
                    <Button
                      key={index}
                      variant={link.active ? "default" : "outline"}
                      size="sm"
                      disabled={!link.url}
                      onClick={() => link.url && router.get(link.url)}
                    >
                      {link.label}
                    </Button>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="sm:max-w-[500px] bg-white dark:bg-gray-800 border-0 shadow-2xl">
            <DialogHeader className="pb-4">
              <DialogTitle className="flex items-center gap-2 text-xl">
                <MessageSquare className="h-5 w-5 text-blue-600" />
                {isEditing ? 'Edit Feedback' : 'Provide Feedback'}
              </DialogTitle>
              <DialogDescription className="text-gray-600 dark:text-gray-400">
                {isEditing ? 'Update your' : 'Share your'} constructive feedback for {selectedApplication?.student_name}'s application to {selectedApplication?.posting_title}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-6 py-4">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2">
                  <span className="text-yellow-500">★</span>
                  Overall Rating
                </label>
                <Select value={rating.toString()} onValueChange={(value) => setRating(parseInt(value))}>
                  <SelectTrigger className="border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-blue-500">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">⭐ 1 Star - Needs Improvement</SelectItem>
                    <SelectItem value="2">⭐⭐ 2 Stars - Below Average</SelectItem>
                    <SelectItem value="3">⭐⭐⭐ 3 Stars - Average</SelectItem>
                    <SelectItem value="4">⭐⭐⭐⭐ 4 Stars - Good</SelectItem>
                    <SelectItem value="5">⭐⭐⭐⭐⭐ 5 Stars - Excellent</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2">
                  <MessageSquare className="h-4 w-4 text-blue-500" />
                  Detailed Feedback
                </label>
                <Textarea
                  value={feedback}
                  onChange={(e) => setFeedback(e.target.value)}
                  placeholder="Provide constructive feedback on the student's qualifications, experience, and potential fit for this opportunity..."
                  className="mt-1 border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-blue-500 min-h-[120px] resize-none"
                  rows={4}
                />
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Your feedback helps students improve and guides their career development.
                </p>
              </div>
            </div>
            <DialogFooter className="border-t pt-4">
              <Button variant="outline" onClick={() => setIsDialogOpen(false)} className="border-gray-300">
                Cancel
              </Button>
              <Button
                onClick={submitFeedback}
                disabled={!feedback.trim()}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                <CheckCircle className="h-4 w-4 mr-2" />
                {isEditing ? 'Update Feedback' : 'Submit Feedback'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </AppLayout>
  );
}
