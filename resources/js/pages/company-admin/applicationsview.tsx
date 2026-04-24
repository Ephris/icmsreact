import React, { useState, useEffect } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AlertCircle, X, CheckCircle, FileText, Download, Eye, Clock, UserCheck, UserX } from 'lucide-react';
import { type BreadcrumbItem } from '@/types';

interface Company {
  company_id: number;
  name: string;
}

interface Application {
  application_id: number;
  student_name: string;
  student_email: string;
  student_phone: string;
  department: string;
  department_head: string;
  advisors: { user_id: number; name: string }[];
  cgpa: number | null;
  year_of_study: string | null;
  resume_path: string | null;
  cover_letter_path: string | null;
  portfolio: string | null;
  skills: string[];
  certifications: string[];
  posting_title: string;
  posting_type: string;
  posting_industry: string;
  posting_min_gpa: number | null;
  posting_skills_required: string[];
  status: string;
  submitted_at: string | null;
  source: string | null;
  accepted_at: string | null;
  offer_expiration: string | null;
  feedback: string | null;
  last_updated_by: string | null;
  application_letter: {
    letter_id: number;
    ref_number: string;
    start_date: string;
    end_date: string;
    file_path: string;
    status: string;
  } | null;
}

interface Props {
  application: Application;
  company: Company;
  success?: string;
  error?: string;
}

const breadcrumbs: BreadcrumbItem[] = [
  { title: 'Dashboard', href: '/company-admin' },
  { title: 'Applications', href: '/company-admin/applications' },
  { title: 'View Application', href: null },
];

export default function ApplicationsView({ application, company, success, error }: Props) {
  const [showSuccess, setShowSuccess] = useState(!!success);
  const [showError, setShowError] = useState(!!error);
  const [status, setStatus] = useState(application.status);
  const [feedback, setFeedback] = useState(application.feedback || '');
  const [offerExpiration, setOfferExpiration] = useState(application.offer_expiration || '');
  const [letterApprovalStatus, setLetterApprovalStatus] = useState(application.application_letter?.status || 'pending');

  useEffect(() => {
    if (success) {
      setShowSuccess(true);
      const timer = setTimeout(() => setShowSuccess(false), 3000);
      return () => clearTimeout(timer);
    }
    if (error) {
      setShowError(true);
      const timer = setTimeout(() => setShowError(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [success, error]);

  const handleUpdate = () => {
    router.patch(`/company-admin/applications/${application.application_id}`, {
      status,
      feedback,
      offer_expiration: offerExpiration,
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
  };

  const handleLetterApproval = (approvalStatus: 'approved' | 'rejected') => {
    if (application.application_letter) {
      router.patch(`/company-admin/application-letters/${application.application_letter.letter_id}/approve`, {
        status: approvalStatus,
      }, {
        onSuccess: () => {
          setLetterApprovalStatus(approvalStatus);
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

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title="View Application" />
      <div className="p-6 space-y-6">
        <Card className="shadow-md border-gray-200 dark:border-gray-700">
          <CardHeader>
            <CardTitle className="text-2xl font-semibold text-gray-800 dark:text-gray-100">
              Application Details - {application.student_name} for {application.posting_title} at {company.name}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {showSuccess && success && (
              <Alert className="bg-green-50 dark:bg-green-900/50 border-green-200 dark:border-green-800">
                <AlertCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
                <AlertTitle className="text-green-800 dark:text-green-200 font-semibold">Success</AlertTitle>
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
                <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400" />
                <AlertTitle className="text-red-800 dark:text-red-200 font-semibold">Error</AlertTitle>
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
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="shadow-lg border-none bg-white dark:bg-gray-800 rounded-2xl overflow-hidden">
                <CardHeader className="bg-gradient-to-r from-blue-500 to-blue-600 dark:from-blue-700 dark:to-blue-800 p-6 rounded-t-2xl">
                  <CardTitle className="text-white flex items-center gap-2">
                    <UserCheck className="h-6 w-6" />
                    Student Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6 space-y-3">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Name</p>
                      <p className="font-semibold text-gray-900 dark:text-gray-100">{application.student_name}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Email</p>
                      <p className="font-semibold text-gray-900 dark:text-gray-100">{application.student_email}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Phone</p>
                      <p className="font-semibold text-gray-900 dark:text-gray-100">{application.student_phone || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Department</p>
                      <p className="font-semibold text-gray-900 dark:text-gray-100">{application.department}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">CGPA</p>
                      <p className="font-semibold text-gray-900 dark:text-gray-100">{application.cgpa ?? 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Year of Study</p>
                      <p className="font-semibold text-gray-900 dark:text-gray-100">{application.year_of_study ?? 'N/A'}</p>
                    </div>
                  </div>
                  <div className="pt-4 border-t border-gray-200 dark:border-gray-600">
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Skills</p>
                    <div className="flex flex-wrap gap-2">
                      {application.skills.map((skill, index) => (
                        <span key={index} className="px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200 text-xs rounded-full">
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card className="shadow-lg border-none bg-white dark:bg-gray-800 rounded-2xl overflow-hidden">
                <CardHeader className="bg-gradient-to-r from-green-500 to-green-600 dark:from-green-700 dark:to-green-800 p-6 rounded-t-2xl">
                  <CardTitle className="text-white flex items-center gap-2">
                    <FileText className="h-6 w-6" />
                    Application Documents
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6 space-y-4">
                  <div className="space-y-3">
                    <div>
                      <strong>University Application Letter:</strong> 
                      {application.application_letter ? (
                        <div className="mt-2 space-y-3">
                          <div className="flex items-center gap-3">
                            <div className="flex items-center gap-2">
                              <FileText className="h-5 w-5 text-blue-600" />
                              <div className="flex items-center gap-2">
                                <Download className="h-4 w-4 text-blue-600" />
                          <a 
                            href={`/company-admin/application-letters/${application.application_letter.letter_id}/download`}
                            className="text-blue-600 hover:text-blue-800 underline font-medium"
                          >
                            Download Application Letter
                          </a>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <Eye className="h-4 w-4 text-gray-500" />
                              <a 
                                href={`/company-admin/application-letters/${application.application_letter.letter_id}/view`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-gray-600 hover:text-gray-800 underline text-sm"
                              >
                                View
                              </a>
                            </div>
                          </div>
                          <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded-lg">
                            <div className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                              <div className="flex items-center gap-2">
                                <FileText className="h-4 w-4" />
                                <span>Ref: {application.application_letter.ref_number}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <Clock className="h-4 w-4" />
                                <span>Duration: {new Date(application.application_letter.start_date).toLocaleDateString()} - {new Date(application.application_letter.end_date).toLocaleDateString()}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <CheckCircle className={`h-4 w-4 ${letterApprovalStatus === 'approved' ? 'text-green-600' : letterApprovalStatus === 'rejected' ? 'text-red-600' : 'text-yellow-600'}`} />
                                <span className={`font-medium ${letterApprovalStatus === 'approved' ? 'text-green-600' : letterApprovalStatus === 'rejected' ? 'text-red-600' : 'text-yellow-600'}`}>
                                  Status: {letterApprovalStatus.charAt(0).toUpperCase() + letterApprovalStatus.slice(1)}
                                </span>
                              </div>
                          </div>
                          </div>
                          {letterApprovalStatus === 'pending' && (
                            <div className="flex gap-2 mt-3">
                              <Button
                                size="sm"
                                onClick={() => handleLetterApproval('approved')}
                                className="bg-green-600 hover:bg-green-700 text-white rounded-lg px-4 py-2 font-medium shadow-md hover:shadow-lg transition-all duration-200"
                              >
                                <UserCheck className="h-4 w-4 mr-2" />
                                Approve Letter
                              </Button>
                              <Button
                                size="sm"
                                variant="destructive"
                                onClick={() => handleLetterApproval('rejected')}
                                className="rounded-lg px-4 py-2 font-medium shadow-md hover:shadow-lg transition-all duration-200"
                              >
                                <UserX className="h-4 w-4 mr-2" />
                                Reject Letter
                              </Button>
                            </div>
                          )}
                          {letterApprovalStatus === 'approved' && (
                            <div className="mt-3 p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                              <div className="flex items-center gap-2 text-green-700 dark:text-green-300">
                                <UserCheck className="h-5 w-5" />
                                <span className="font-semibold">Application Letter Approved</span>
                              </div>
                              <p className="text-sm text-green-600 dark:text-green-400 mt-1">
                                This letter has been approved and the student can proceed with their internship.
                              </p>
                            </div>
                          )}
                          {letterApprovalStatus === 'rejected' && (
                            <div className="mt-3 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                              <div className="flex items-center gap-2 text-red-700 dark:text-red-300">
                                <UserX className="h-5 w-5" />
                                <span className="font-semibold">Application Letter Rejected</span>
                              </div>
                              <p className="text-sm text-red-600 dark:text-red-400 mt-1">
                                This letter has been rejected. The student may need to obtain a new application letter.
                              </p>
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="mt-2">
                          <div className="flex items-center gap-2 text-red-600 font-semibold">
                            <AlertCircle className="h-5 w-5" />
                            <span>Missing - Student does not have application letter</span>
                          </div>
                          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                            The student must obtain an application letter from their coordinator before applying.
                          </p>
                        </div>
                      )}
                    </div>
                    <div>
                      <strong>Resume:</strong> {application.resume_path ? <a href={application.resume_path} download className="text-blue-600 hover:text-blue-800 underline">Download</a> : 'N/A'}
                    </div>
                    <div>
                      <strong>Cover Letter:</strong> {application.cover_letter_path ? <a href={application.cover_letter_path} download className="text-blue-600 hover:text-blue-800 underline">Download</a> : 'N/A'}
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Posting Information</CardTitle>
                </CardHeader>
                <CardContent>
                  <p><strong>Title:</strong> {application.posting_title}</p>
                  <p><strong>Type:</strong> {application.posting_type}</p>
                  <p><strong>Industry:</strong> {application.posting_industry}</p>
                  <p><strong>Min GPA Required:</strong> {application.posting_min_gpa ?? 'N/A'}</p>
                  <p><strong>Skills Required:</strong> {application.posting_skills_required.join(', ') || 'N/A'}</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Application Status</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Status</label>
                      <Select value={status} onValueChange={setStatus} disabled={application.status === 'approved'}>
                        <SelectTrigger className="w-full border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 transition-all rounded-full">
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="pending">Pending</SelectItem>
                          <SelectItem value="rejected">Rejected</SelectItem>
                          <SelectItem value="approved">Approved</SelectItem>
                          <SelectItem value="inactive">Inactive</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Feedback</label>
                      <Textarea
                        value={feedback}
                        onChange={(e) => setFeedback(e.target.value)}
                        placeholder="Enter feedback..."
                        className="border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 transition-all rounded-md"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Offer Expiration</label>
                      <Input
                        type="datetime-local"
                        value={offerExpiration}
                        onChange={(e) => setOfferExpiration(e.target.value)}
                        className="border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 transition-all rounded-full"
                        disabled={application.status !== 'accepted' && application.status !== 'approved'}
                      />
                    </div>
                    <Button
                      onClick={handleUpdate}
                      className="bg-indigo-600 text-white hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600 transition-colors duration-200 rounded-full"
                      disabled={application.status === 'approved'}
                    >
                      Update Application
                    </Button>
                  </div>
                  <p><strong>Submitted At:</strong> {application.submitted_at ? new Date(application.submitted_at).toLocaleString() : 'N/A'}</p>
                  <p><strong>Accepted At:</strong> {application.accepted_at ? new Date(application.accepted_at).toLocaleString() : 'N/A'}</p>
                  <p><strong>Offer Expiration:</strong> {application.offer_expiration ? new Date(application.offer_expiration).toLocaleString() : 'N/A'}</p>
                  <p><strong>Source:</strong> {application.source || 'N/A'}</p>
                  <p><strong>Last Updated By:</strong> {application.last_updated_by || 'N/A'}</p>
                </CardContent>
              </Card>
            </div>
            <Button
              asChild
              variant="outline"
              className="border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 hover:bg-blue-50 dark:hover:bg-blue-900 hover:text-blue-700 dark:hover:text-blue-300 transition-colors duration-200 rounded-full"
            >
              <Link href="/company-admin/applications">Back to Applications</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}