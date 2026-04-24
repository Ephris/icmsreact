import React, { useState } from 'react';
import { Head, useForm, Link } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { 
  AlertCircle, 
  Plus, 
  MapPin, 
  Building2, 
  Calendar, 
  GraduationCap,
  Clock,
  Users,
  Star,
  ExternalLink,
  Briefcase,
  DollarSign,
  Award,
  FileText,
  CheckCircle,
  XCircle,
  ArrowLeft
} from 'lucide-react';
import { type BreadcrumbItem } from '@/types';
import { getImageUrl, handleImageError } from '@/utils/imageUtils';

interface Posting {
  posting_id: number;
  title: string;
  description: string;
  type: string;
  industry: string;
  location: string;
  company_name: string;
  company_logo?: string;
  salary_range: string | null;
  start_date: string;
  end_date: string | null;
  application_deadline: string;
  requirements: string | null;
  skills_required: string[];
  application_instructions: string | null;
  work_type: string | null;
  benefits: string | null;
  experience_level: string | null;
  min_gpa: number | null;
  supervisor_name: string;
  has_applied: boolean;
}

interface ApplicationLetter {
  letter_id: number;
  ref_number: string;
  start_date: string;
  end_date: string;
  file_path: string;
  status: string;
}

interface Props {
  posting: Posting;
  applicationLetter: ApplicationLetter | null;
  success?: string;
  error?: string;
}

const breadcrumbs: BreadcrumbItem[] = [
  { title: 'Dashboard', href: '/student' },
  { title: 'Postings', href: '/student/postings' },
  { title: 'Posting Details', href: null },
];

export default function PostingView({ posting, applicationLetter, success, error }: Props) {
  const [skillInput, setSkillInput] = useState('');
  const { data, setData, post, processing, errors, reset } = useForm({
    posting_id: posting.posting_id.toString(),
    resume: null as File | null,
    cover_letter: null as File | null,
    portfolio: '',
    skills: [] as string[],
    certifications: [] as string[],
  });

  // Helper functions
  const getCompanyInitials = (companyName: string) => {
    return companyName
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const getTypeColor = (type: string) => {
    switch (type.toLowerCase()) {
      case 'internship':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300';
      case 'career':
        return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300';
      case 'part-time':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-300';
      case 'full-time':
        return 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-300';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-300';
    }
  };

  const getWorkTypeIcon = (workType: string) => {
    switch (workType?.toLowerCase()) {
      case 'remote':
        return <Users className="h-4 w-4" />;
      case 'onsite':
        return <Building2 className="h-4 w-4" />;
      case 'hybrid':
        return <Briefcase className="h-4 w-4" />;
      default:
        return <Briefcase className="h-4 w-4" />;
    }
  };

  const getWorkTypeColor = (workType: string) => {
    switch (workType?.toLowerCase()) {
      case 'remote':
        return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/20 dark:text-emerald-300';
      case 'onsite':
        return 'bg-amber-100 text-amber-800 dark:bg-amber-900/20 dark:text-amber-300';
      case 'hybrid':
        return 'bg-violet-100 text-violet-800 dark:bg-violet-900/20 dark:text-violet-300';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-300';
    }
  };

  const formatDeadline = (deadline: string) => {
    const date = new Date(deadline);
    const now = new Date();
    const diffTime = date.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) {
      return { text: 'Expired', color: 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300', icon: <XCircle className="h-3 w-3" /> };
    } else if (diffDays <= 7) {
      return { text: `${diffDays} days left`, color: 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-300', icon: <Clock className="h-3 w-3" /> };
    } else if (diffDays <= 30) {
      return { text: `${diffDays} days left`, color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300', icon: <Clock className="h-3 w-3" /> };
    } else {
      return { text: `${diffDays} days left`, color: 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300', icon: <CheckCircle className="h-3 w-3" /> };
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    post('/student/postings/apply', {
      onSuccess: () => reset(),
      forceFormData: true, // Required for file uploads
    });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, field: 'resume' | 'cover_letter') => {
    const file = e.target.files?.[0] || null;
    setData(field, file);
  };

  const handleArrayChange = (field: 'skills' | 'certifications', value: string) => {
    const values = value.split(',').map((v) => v.trim()).filter((v) => v);
    setData(field, values);
  };

  const addSkill = () => {
    if (skillInput.trim() && !data.skills.includes(skillInput.trim())) {
      setData('skills', [...data.skills, skillInput.trim()]);
      setSkillInput('');
    }
  };

  const removeSkill = (skill: string) => {
    setData('skills', data.skills.filter(s => s !== skill));
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addSkill();
    }
  };

  const deadlineInfo = formatDeadline(posting.application_deadline);

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title={`Posting - ${posting.title}`} />
      <div className="p-6 space-y-6">
        {/* Header Section */}
        <div className="flex items-center gap-4 mb-6">
          <Button asChild variant="outline" size="sm" className="rounded-full">
            <Link href="/student/postings">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Postings
            </Link>
          </Button>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Position Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Position Header Card */}
            <Card className="shadow-lg border-gray-200 dark:border-gray-700">
              <CardHeader className="pb-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-4">
                    <Avatar className="h-16 w-16">
                      <AvatarImage 
                        src={getImageUrl(posting.company_logo)} 
                        alt={`${posting.company_name} logo`}
                        onError={(e) => handleImageError(e)}
                      />
                      <AvatarFallback className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-semibold text-lg">
                        {getCompanyInitials(posting.company_name)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                        {posting.title}
                      </h1>
                      <p className="text-lg text-gray-600 dark:text-gray-400 mb-3">
                        {posting.company_name}
                      </p>
                      <div className="flex flex-wrap gap-2">
                        <Badge className={`${getTypeColor(posting.type)} text-sm font-medium`}>
                          {posting.type}
                        </Badge>
                        <Badge className={`${getWorkTypeColor(posting.work_type || '')} text-sm font-medium flex items-center gap-1`}>
                          {getWorkTypeIcon(posting.work_type || '')}
                          {posting.work_type || 'N/A'}
                        </Badge>
                        <Badge className={`${deadlineInfo.color} text-sm font-medium flex items-center gap-1`}>
                          {deadlineInfo.icon}
                          {deadlineInfo.text}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </div>
              </CardHeader>
            </Card>

            {/* Position Information */}
            <Card className="shadow-lg border-gray-200 dark:border-gray-700">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Briefcase className="h-5 w-5" />
                  Postion Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Alerts */}
                {error && (
                  <Alert className="bg-red-50 dark:bg-red-900/50 border-red-200 dark:border-red-800">
                    <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400" />
                    <AlertTitle className="text-red-800 dark:text-red-200 font-semibold">Error</AlertTitle>
                    <AlertDescription className="text-red-700 dark:text-red-300">{error}</AlertDescription>
                  </Alert>
                )}
                {success && (
                  <Alert className="bg-green-50 dark:bg-green-900/50 border-green-200 dark:border-green-800">
                    <AlertCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
                    <AlertTitle className="text-green-800 dark:text-green-200 font-semibold">Success</AlertTitle>
                    <AlertDescription className="text-green-700 dark:text-green-300">{success}</AlertDescription>
                  </Alert>
                )}

                {/* Position Details Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <Building2 className="h-5 w-5 text-gray-500" />
                      <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Industry</p>
                        <p className="font-medium">{posting.industry || 'N/A'}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <MapPin className="h-5 w-5 text-gray-500" />
                      <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Location</p>
                        <p className="font-medium">{posting.location || 'N/A'}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Calendar className="h-5 w-5 text-gray-500" />
                      <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Start Date</p>
                        <p className="font-medium">{new Date(posting.start_date).toLocaleDateString()}</p>
                      </div>
                    </div>
                    {posting.end_date && (
                      <div className="flex items-center gap-3">
                        <Calendar className="h-5 w-5 text-gray-500" />
                        <div>
                          <p className="text-sm text-gray-500 dark:text-gray-400">End Date</p>
                          <p className="font-medium">{new Date(posting.end_date).toLocaleDateString()}</p>
                        </div>
                      </div>
                    )}
                  </div>
                  
                  <div className="space-y-4">
                    {posting.salary_range && (
                      <div className="flex items-center gap-3">
                        <DollarSign className="h-5 w-5 text-gray-500" />
                        <div>
                          <p className="text-sm text-gray-500 dark:text-gray-400">Salary Range</p>
                          <p className="font-medium">{posting.salary_range}</p>
                        </div>
                      </div>
                    )}
                    <div className="flex items-center gap-3">
                      <GraduationCap className="h-5 w-5 text-gray-500" />
                      <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Minimum GPA</p>
                        <p className="font-medium">{posting.min_gpa || 'N/A'}</p>
                      </div>
                    </div>
                    {posting.experience_level && (
                      <div className="flex items-center gap-3">
                        <Award className="h-5 w-5 text-gray-500" />
                        <div>
                          <p className="text-sm text-gray-500 dark:text-gray-400">Experience Level</p>
                          <p className="font-medium">{posting.experience_level}</p>
                        </div>
                      </div>
                    )}
                    <div className="flex items-center gap-3">
                      <Users className="h-5 w-5 text-gray-500" />
                      <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Supervisor</p>
                        <p className="font-medium">{posting.supervisor_name}</p>
                      </div>
                    </div>
                  </div>
                </div>

                <Separator />

                {/* Skills Required */}
                {posting.skills_required && posting.skills_required.length > 0 && (
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3 flex items-center gap-2">
                      <Award className="h-5 w-5" />
                      Required Skills
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {posting.skills_required.map((skill, index) => (
                        <Badge key={index} variant="secondary" className="text-sm">
                          {skill}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                <Separator />

                {/* Description */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3 flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    Position Description
                  </h3>
                  <div className="prose prose-sm max-w-none text-gray-600 dark:text-gray-300">
                    {posting.description ? (
                      <div dangerouslySetInnerHTML={{ __html: posting.description.replace(/\n/g, '<br />') }} />
                    ) : (
                      <p>No description provided.</p>
                    )}
                  </div>
                </div>

                {/* Requirements */}
                {posting.requirements && (
                  <>
                    <Separator />
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3 flex items-center gap-2">
                        <CheckCircle className="h-5 w-5" />
                        Requirements
                      </h3>
                      <div className="prose prose-sm max-w-none text-gray-600 dark:text-gray-300">
                        <div dangerouslySetInnerHTML={{ __html: posting.requirements.replace(/\n/g, '<br />') }} />
                      </div>
                    </div>
                  </>
                )}

                {/* Benefits */}
                {posting.benefits && (
                  <>
                    <Separator />
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3 flex items-center gap-2">
                        <Star className="h-5 w-5" />
                        Benefits
                      </h3>
                      <div className="prose prose-sm max-w-none text-gray-600 dark:text-gray-300">
                        <div dangerouslySetInnerHTML={{ __html: posting.benefits.replace(/\n/g, '<br />') }} />
                      </div>
                    </div>
                  </>
                )}

                {/* Application Instructions */}
                {posting.application_instructions && (
                  <>
                    <Separator />
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3 flex items-center gap-2">
                        <ExternalLink className="h-5 w-5" />
                        Application Instructions
                      </h3>
                      <div className="prose prose-sm max-w-none text-gray-600 dark:text-gray-300">
                        <div dangerouslySetInnerHTML={{ __html: posting.application_instructions.replace(/\n/g, '<br />') }} />
                      </div>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Application Form */}
          <div className="space-y-6">
            {/* Application Status Card */}
            <Card className="shadow-lg border-gray-200 dark:border-gray-700">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Application Status
                </CardTitle>
              </CardHeader>
              <CardContent>
                {posting.has_applied ? (
                  <div className="flex items-center gap-3 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                    <CheckCircle className="h-6 w-6 text-green-600 dark:text-green-400" />
                    <div>
                      <p className="font-semibold text-green-800 dark:text-green-200">Applied</p>
                      <p className="text-sm text-green-700 dark:text-green-300">You have already applied to this position.</p>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center gap-3 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                    <Clock className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                    <div>
                      <p className="font-semibold text-blue-800 dark:text-blue-200">Not Applied</p>
                      <p className="text-sm text-blue-700 dark:text-blue-300">Ready to apply for this position.</p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
            {/* Application Form */}
            {!posting.has_applied ? (
              applicationLetter ? (
                <Card className="shadow-lg border-gray-200 dark:border-gray-700">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <FileText className="h-5 w-5" />
                      Application Form
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* Application Letter Display */}
                    <div className="bg-green-50 dark:bg-green-900/50 border border-green-200 dark:border-green-800 rounded-lg p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
                        <h3 className="font-semibold text-green-800 dark:text-green-200">
                          Application Letter Available
                        </h3>
                      </div>
                      <div className="space-y-1 text-sm text-green-700 dark:text-green-300">
                        <p><strong>Reference:</strong> {applicationLetter.ref_number}</p>
                        <p><strong>Duration:</strong> {new Date(applicationLetter.start_date).toLocaleDateString()} - {new Date(applicationLetter.end_date).toLocaleDateString()}</p>
                        <p><strong>Status:</strong> {applicationLetter.status}</p>
                      </div>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-4">
                      <div>
                        <Label className="text-sm font-medium text-gray-700 dark:text-gray-200">Resume (PDF, max 2MB) *</Label>
                        <Input
                          type="file"
                          accept="application/pdf"
                          onChange={(e) => handleFileChange(e, 'resume')}
                          className="mt-1 border-gray-300 dark:border-gray-600"
                          aria-label="Upload resume"
                        />
                        {errors.resume && <p className="text-red-500 text-sm mt-1">{errors.resume}</p>}
                      </div>
                      
                      <div>
                        <Label className="text-sm font-medium text-gray-700 dark:text-gray-200">Cover Letter (PDF, max 2MB)</Label>
                        <Input
                          type="file"
                          accept="application/pdf"
                          onChange={(e) => handleFileChange(e, 'cover_letter')}
                          className="mt-1 border-gray-300 dark:border-gray-600"
                          aria-label="Upload cover letter"
                        />
                        {errors.cover_letter && <p className="text-red-500 text-sm mt-1">{errors.cover_letter}</p>}
                      </div>
                      
                      <div>
                        <Label className="text-sm font-medium text-gray-700 dark:text-gray-200">Portfolio URL</Label>
                        <Input
                          type="url"
                          value={data.portfolio}
                          onChange={(e) => setData('portfolio', e.target.value)}
                          placeholder="https://your-portfolio.com"
                          className="mt-1 border-gray-300 dark:border-gray-600"
                          aria-label="Portfolio URL"
                        />
                        {errors.portfolio && <p className="text-red-500 text-sm mt-1">{errors.portfolio}</p>}
                      </div>
                      
                      <div>
                        <Label className="text-sm font-medium text-gray-700 dark:text-gray-200">Additional Skills</Label>
                        <div className="flex gap-2 mt-1">
                          <Input
                            value={skillInput}
                            onChange={(e) => setSkillInput(e.target.value)}
                            onKeyPress={handleKeyPress}
                            placeholder="Add a skill"
                            className="border-gray-300 dark:border-gray-600"
                            aria-label="Add skill"
                          />
                          <Button type="button" onClick={addSkill} variant="outline" size="sm">
                            <Plus className="h-4 w-4" />
                          </Button>
                        </div>
                        {data.skills.length > 0 && (
                          <div className="flex flex-wrap gap-2 mt-2">
                            {data.skills.map((skill, index) => (
                              <Badge key={index} variant="secondary" className="text-xs">
                                {skill}
                                <button
                                  type="button"
                                  onClick={() => removeSkill(skill)}
                                  className="ml-1 hover:text-red-600"
                                  aria-label={`Remove ${skill}`}
                                >
                                  ×
                                </button>
                              </Badge>
                            ))}
                          </div>
                        )}
                        {errors.skills && <p className="text-red-500 text-sm mt-1">{errors.skills}</p>}
                      </div>
                      
                      <div>
                        <Label className="text-sm font-medium text-gray-700 dark:text-gray-200">Certifications</Label>
                        <Input
                          type="text"
                          value={Array.isArray(data.certifications) ? data.certifications.join(', ') : ''}
                          onChange={(e) => handleArrayChange('certifications', e.target.value)}
                          placeholder="e.g., AWS Certified, PMP"
                          className="mt-1 border-gray-300 dark:border-gray-600"
                          aria-label="Certifications"
                        />
                        {errors.certifications && <p className="text-red-500 text-sm mt-1">{errors.certifications}</p>}
                      </div>
                      
                      <Button
                        type="submit"
                        disabled={processing || !data.resume}
                        className="w-full bg-indigo-600 text-white hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600"
                        aria-label="Submit application"
                      >
                        {processing ? 'Submitting...' : 'Apply Now'}
                      </Button>
                    </form>
                  </CardContent>
                </Card>
              ) : (
                <Card className="shadow-lg border-red-200 dark:border-red-800">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-red-800 dark:text-red-200">
                      <AlertCircle className="h-5 w-5" />
                      Application Letter Required
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
                      <p className="text-red-700 dark:text-red-300 mb-4">
                        You cannot apply for this internship posting because you don't have an application letter from your university coordinator.
                      </p>
                      <div className="bg-red-100 dark:bg-red-800/50 border border-red-300 dark:border-red-700 rounded-lg p-3">
                        <h4 className="font-semibold text-red-800 dark:text-red-200 mb-2">What you need to do:</h4>
                        <ul className="text-red-700 dark:text-red-300 space-y-1 text-sm">
                          <li>• Contact your university coordinator to obtain your application letter</li>
                          <li>• Or contact your department head for assistance</li>
                          <li>• Once you receive your application letter, you can apply for internship postings</li>
                        </ul>
                      </div>
                    </div>
                    <div className="flex flex-col gap-2">
                      <Button asChild variant="outline" className="border-red-300 dark:border-red-600 text-red-700 dark:text-red-300 hover:bg-red-100 dark:hover:bg-red-800">
                        <Link href="/student/application-letter">Check Application Letter Status</Link>
                      </Button>
                      <Button asChild variant="outline" className="border-red-300 dark:border-red-600 text-red-700 dark:text-red-300 hover:bg-red-100 dark:hover:bg-red-800">
                        <Link href="/student/profile">Update Profile</Link>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )
            ) : (
              <Card className="shadow-lg border-green-200 dark:border-green-800">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-green-800 dark:text-green-200">
                    <CheckCircle className="h-5 w-5" />
                    Application Submitted
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-3 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                    <CheckCircle className="h-6 w-6 text-green-600 dark:text-green-400" />
                    <div>
                      <p className="font-semibold text-green-800 dark:text-green-200">Successfully Applied</p>
                      <p className="text-sm text-green-700 dark:text-green-300">Your application has been submitted and is under review.</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </AppLayout>
  );
}