import { Head, Link } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Briefcase, Calendar, MapPin, DollarSign, Users, Star } from 'lucide-react';

interface Posting {
  posting_id: string;
  title: string;
  description: string;
  type: string;
  industry: string;
  location: string;
  salary_range?: string;
  start_date: string;
  end_date?: string;
  application_deadline: string;
  requirements: string;
  skills_required: string[];
  application_instructions?: string;
  work_type: string;
  benefits?: string;
  experience_level: string;
  min_gpa?: number;
  status: string;
  created_at: string;
  updated_at: string;
}

interface CompanySupervisorPostingsShowProps {
  posting: Posting;
  success?: string;
  error?: string;
}

export default function CompanySupervisorPostingsShow({
  posting,
  success,
  error,
}: CompanySupervisorPostingsShowProps) {
  const getTypeBadgeColor = (type: string) => {
    switch (type.toLowerCase()) {
      case 'internship':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300';
      case 'career':
        return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-300';
    }
  };

  const getStatusBadgeColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'open':
        return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300';
      case 'closed':
        return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300';
      case 'paused':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-300';
    }
  };

  const getWorkTypeBadgeColor = (workType: string) => {
    switch (workType.toLowerCase()) {
      case 'remote':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-300';
      case 'onsite':
        return 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-300';
      case 'hybrid':
        return 'bg-teal-100 text-teal-800 dark:bg-teal-900/20 dark:text-teal-300';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-300';
    }
  };

  const getExperienceLevelBadgeColor = (level: string) => {
    switch (level.toLowerCase()) {
      case 'entry':
        return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300';
      case 'mid':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300';
      case 'senior':
        return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-300';
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type.toLowerCase()) {
      case 'internship':
        return 'Internship';
      case 'career':
        return 'Career';
      default:
        return type;
    }
  };

  const getWorkTypeLabel = (workType: string) => {
    switch (workType.toLowerCase()) {
      case 'remote':
        return 'Remote';
      case 'onsite':
        return 'On-site';
      case 'hybrid':
        return 'Hybrid';
      default:
        return workType;
    }
  };

  const getExperienceLevelLabel = (level: string) => {
    switch (level.toLowerCase()) {
      case 'entry':
        return 'Entry Level';
      case 'mid':
        return 'Mid Level';
      case 'senior':
        return 'Senior Level';
      default:
        return level;
    }
  };

  return (
    <AppLayout>
      <Head title={`Posting: ${posting.title}`} />
      
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" asChild>
            <Link href="/company-supervisor/postings">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{posting.title}</h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              Job posting details and information
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

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Briefcase className="h-5 w-5 text-blue-500" />
                  Job Description
                </CardTitle>
                <CardDescription>
                  Detailed information about the position
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="prose dark:prose-invert max-w-none">
                  <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                    {posting.description}
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Requirements</CardTitle>
                <CardDescription>
                  What we're looking for in candidates
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="prose dark:prose-invert max-w-none">
                  <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                    {posting.requirements}
                  </p>
                </div>
              </CardContent>
            </Card>

            {posting.skills_required && posting.skills_required.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Required Skills</CardTitle>
                  <CardDescription>
                    Technical and soft skills needed for this role
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {Array.isArray(posting.skills_required) && posting.skills_required.length > 0 ? (
                      posting.skills_required.map((skill, index) => (
                        <Badge key={index} variant="secondary" className="text-sm">
                          {skill}
                        </Badge>
                      ))
                    ) : (
                      <span className="text-gray-500 dark:text-gray-400">No skills specified</span>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

            {posting.benefits && (
              <Card>
                <CardHeader>
                  <CardTitle>Benefits</CardTitle>
                  <CardDescription>
                    What we offer to our team members
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="prose dark:prose-invert max-w-none">
                    <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                      {posting.benefits}
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}

            {posting.application_instructions && (
              <Card>
                <CardHeader>
                  <CardTitle>Application Instructions</CardTitle>
                  <CardDescription>
                    How to apply for this position
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="prose dark:prose-invert max-w-none">
                    <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                      {posting.application_instructions}
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Job Details</CardTitle>
                <CardDescription>
                  Key information about this posting
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-full bg-blue-100 dark:bg-blue-900/20">
                    <Briefcase className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Type</p>
                    <Badge className={getTypeBadgeColor(posting.type)}>
                      {getTypeLabel(posting.type)}
                    </Badge>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-full bg-green-100 dark:bg-green-900/20">
                    <MapPin className="h-4 w-4 text-green-600 dark:text-green-400" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Location</p>
                    <p className="text-sm text-gray-900 dark:text-white">{posting.location}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-full bg-purple-100 dark:bg-purple-900/20">
                    <Users className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Work Type</p>
                    <Badge className={getWorkTypeBadgeColor(posting.work_type)}>
                      {getWorkTypeLabel(posting.work_type)}
                    </Badge>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-full bg-yellow-100 dark:bg-yellow-900/20">
                    <Star className="h-4 w-4 text-yellow-600 dark:text-yellow-400" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Experience Level</p>
                    <Badge className={getExperienceLevelBadgeColor(posting.experience_level)}>
                      {getExperienceLevelLabel(posting.experience_level)}
                    </Badge>
                  </div>
                </div>

                {posting.salary_range && (
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-full bg-green-100 dark:bg-green-900/20">
                      <DollarSign className="h-4 w-4 text-green-600 dark:text-green-400" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Salary Range</p>
                      <p className="text-sm text-gray-900 dark:text-white">{posting.salary_range}</p>
                    </div>
                  </div>
                )}

                {posting.min_gpa && (
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-full bg-indigo-100 dark:bg-indigo-900/20">
                      <Star className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Minimum GPA</p>
                      <p className="text-sm text-gray-900 dark:text-white">{posting.min_gpa}</p>
                    </div>
                  </div>
                )}

                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-full bg-gray-100 dark:bg-gray-800">
                    <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Status</span>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Status</p>
                    <Badge className={getStatusBadgeColor(posting.status)}>
                      {posting.status}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-purple-500" />
                  Timeline
                </CardTitle>
                <CardDescription>
                  Important dates for this posting
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Start Date</p>
                  <p className="text-sm text-gray-900 dark:text-white">
                    {new Date(posting.start_date).toLocaleDateString()}
                  </p>
                </div>
                {posting.end_date && (
                  <div>
                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400">End Date</p>
                    <p className="text-sm text-gray-900 dark:text-white">
                      {new Date(posting.end_date).toLocaleDateString()}
                    </p>
                  </div>
                )}
                <div>
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Application Deadline</p>
                  <p className="text-sm text-gray-900 dark:text-white">
                    {new Date(posting.application_deadline).toLocaleDateString()}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Created</p>
                  <p className="text-sm text-gray-900 dark:text-white">
                    {new Date(posting.created_at).toLocaleDateString()}
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Actions</CardTitle>
                <CardDescription>
                  Available actions for this posting
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button variant="outline" className="w-full justify-start" asChild>
                  <Link href={`/company-supervisor/postings/${posting.posting_id}/edit`}>
                    Edit Posting
                  </Link>
                </Button>
                <Button variant="outline" className="w-full justify-start" asChild>
                  <Link href="/company-supervisor/postings">
                    Back to Postings
                  </Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
