import React, { useState, useEffect } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Pagination, PaginationContent, PaginationItem, PaginationLink } from '@/components/ui/pagination';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import {
  AlertCircle,
  X,
  Eye,
  MapPin,
  Briefcase,
  GraduationCap,
  Building2,
  Clock,
  Users,
  ExternalLink,
  Calendar,
  DollarSign,
  CheckCircle,
} from 'lucide-react';
import { type BreadcrumbItem } from '@/types';
import { getImageUrl, handleImageError } from '@/utils/imageUtils';

interface Posting {
  posting_id: number;
  title: string;
  type: string;
  industry: string;
  location: string;
  company_name: string;
  company_logo?: string;
  min_gpa: number | null;
  skills_required: string[];
  work_type: string;
  application_deadline: string;
  start_date: string;
  end_date: string;
  supervisor_name: string;
  has_applied: boolean;
  salary_range?: string;
  experience_level?: string;
  description?: string;
}

interface PaginationData {
  data: Posting[];
  current_page: number;
  last_page: number;
  next_page_url: string | null;
  prev_page_url: string | null;
  total: number;
}

interface Props {
  postings: PaginationData;
  hasCompletedApplication?: boolean;
  message?: string;
  filters: {
    search?: string;
    type?: string;
    min_gpa?: string | number;
    work_type?: string;
    sort_by?: string;
    sort_dir?: string;
  };
  success?: string;
  error?: string;
}

const breadcrumbs: BreadcrumbItem[] = [
  { title: 'Dashboard', href: '/student' },
  { title: 'Postings', href: '/student/postings' },
];

export default function Postings({ postings, hasCompletedApplication, message, filters, success, error }: Props) {
  const [searchTerm, setSearchTerm] = useState(filters.search || '');
  const [typeFilter, setTypeFilter] = useState(filters.type || 'all');
  const [minGpaFilter, setMinGpaFilter] = useState(filters.min_gpa?.toString() || '');
  const [workTypeFilter, setWorkTypeFilter] = useState(filters.work_type || 'all');
  const [showSuccess, setShowSuccess] = useState(!!success);
  const [showError, setShowError] = useState(!!error);
  const [selectedPosting, setSelectedPosting] = useState<Posting | null>(null);

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
    switch (workType.toLowerCase()) {
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
    switch (workType.toLowerCase()) {
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
      return { text: 'Expired', color: 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300' };
    } else if (diffDays <= 7) {
      return { text: `${diffDays} days left`, color: 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-300' };
    } else if (diffDays <= 30) {
      return { text: `${diffDays} days left`, color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300' };
    } else {
      return { text: `${diffDays} days left`, color: 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300' };
    }
  };

  useEffect(() => {
    const debounce = setTimeout(() => {
      router.get(
        '/student/postings',
        {
          search: searchTerm,
          type: typeFilter,
          min_gpa: minGpaFilter,
          work_type: workTypeFilter,
        },
        { preserveState: true, preserveScroll: true }
      );
    }, 300);
    return () => clearTimeout(debounce);
  }, [searchTerm, typeFilter, minGpaFilter, workTypeFilter]);


  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title="Browse Postings" />
      <div className="p-6 space-y-6">
        {/* Completed Application Message */}
        {hasCompletedApplication && (
          <Alert className="bg-blue-50 dark:bg-blue-900/50 border-blue-200 dark:border-blue-800">
            <CheckCircle className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            <AlertTitle className="text-blue-800 dark:text-blue-200 font-semibold">Internship Completed</AlertTitle>
            <AlertDescription className="text-blue-700 dark:text-blue-300">
              {message || 'You have completed your internship. View your analytics to see your performance evaluation.'}
            </AlertDescription>
          </Alert>
        )}

        {/* Main Content Grid */}
        {!hasCompletedApplication && (
        <div className={`grid gap-6 ${selectedPosting ? 'grid-cols-1 lg:grid-cols-3' : 'grid-cols-1'}`}>
          {/* Postings Section */}
          <div className={selectedPosting ? 'lg:col-span-2' : 'col-span-1'}>
        <Card className="shadow-md border-gray-200 dark:border-gray-700 p-4 rounded-lg bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900 dark:to-indigo-900">
          <CardHeader>
            <CardTitle className="text-2xl font-semibold text-gray-800 dark:text-gray-100 flex items-center gap-2">
              Browse Postings <Badge variant="secondary">Total: {postings.total}</Badge>
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
            <div className="flex flex-wrap gap-4 items-center">
              <Input
                placeholder="Search postings..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="max-w-xs border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 rounded-full text-sm"
                aria-label="Search postings"
              />
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className="w-32 border-gray-300 dark:border-gray-600 rounded-full text-sm">
                  <SelectValue placeholder="Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="internship">Internship</SelectItem>
                  <SelectItem value="career">Career</SelectItem>
                </SelectContent>
              </Select>
              <Input
                type="number"
                placeholder="Max GPA"
                value={minGpaFilter}
                onChange={(e) => setMinGpaFilter(e.target.value)}
                className="w-20 border-gray-300 dark:border-gray-600 rounded-full text-sm"
                aria-label="Filter by maximum GPA"
              />
              <Select value={workTypeFilter} onValueChange={setWorkTypeFilter}>
                <SelectTrigger className="w-32 border-gray-300 dark:border-gray-600 rounded-full text-sm">
                  <SelectValue placeholder="Work Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Work Types</SelectItem>
                  <SelectItem value="remote">Remote</SelectItem>
                  <SelectItem value="onsite">Onsite</SelectItem>
                  <SelectItem value="hybrid">Hybrid</SelectItem>
                </SelectContent>
              </Select>
              <Button
                asChild
                variant="outline"
                size="sm"
                className="border-indigo-300 dark:border-indigo-600 text-indigo-700 dark:text-indigo-200 hover:bg-indigo-50 dark:hover:bg-indigo-900 rounded-full text-sm px-3"
              >
                <Link href="/student">Dashboard</Link>
              </Button>
            </div>
            <Separator className="bg-gray-200 dark:bg-gray-600" />
            
            {/* Postings Grid */}
            <div className={`grid gap-4 ${selectedPosting ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3' : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'}`}>
              {postings.data.length === 0 && postings.total === 0 ? (
                // Loading skeleton
                Array.from({ length: 6 }).map((_, index) => (
                  <Card key={index} className="animate-pulse border-gray-200 dark:border-gray-700">
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          <div className="h-12 w-12 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
                          <div className="flex-1 min-w-0">
                            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-2"></div>
                            <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
                          </div>
                        </div>
                        <div className="h-6 w-16 bg-gray-200 dark:bg-gray-700 rounded"></div>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-2">
                        <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-full"></div>
                        <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-2/3"></div>
                        <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
                      </div>
                      <div className="flex gap-1">
                        <div className="h-5 w-16 bg-gray-200 dark:bg-gray-700 rounded"></div>
                        <div className="h-5 w-20 bg-gray-200 dark:bg-gray-700 rounded"></div>
                      </div>
                      <div className="flex gap-2">
                        <div className="h-8 flex-1 bg-gray-200 dark:bg-gray-700 rounded"></div>
                        <div className="h-8 flex-1 bg-gray-200 dark:bg-gray-700 rounded"></div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              ) : (
                postings.data.map((posting) => {
                const deadlineInfo = formatDeadline(posting.application_deadline);
                return (
                  <Card
                    key={posting.posting_id}
                    className="group hover:shadow-lg transition-all duration-200 hover:-translate-y-0.5 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 cursor-pointer min-h-[320px] flex flex-col"
                    onClick={() => setSelectedPosting(posting)}
                  >
                    <CardHeader className="pb-2">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-2">
                          <Avatar className="h-10 w-10">
                            <AvatarImage 
                              src={getImageUrl(posting.company_logo)} 
                              alt={`${posting.company_name} logo`}
                              onError={(e) => handleImageError(e, '/images/default-company.png')}
                            />
                            <AvatarFallback className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-semibold">
                              {getCompanyInitials(posting.company_name)}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1 min-w-0 overflow-hidden">
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <h3 className="font-semibold text-sm text-gray-900 dark:text-gray-100 truncate group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors cursor-help break-words line-clamp-2 max-w-full">
                                    {posting.title}
                                  </h3>
                                </TooltipTrigger>
                                <TooltipContent side="top" className="max-w-xs">
                                  <p className="font-medium break-words">{posting.title}</p>
                                  <p className="text-xs text-gray-400 mt-1">{posting.company_name}</p>
                                  {posting.description && (
                                    <p className="text-xs text-gray-500 mt-2 line-clamp-3">{posting.description}</p>
                                  )}
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                            <p className="text-xs text-gray-600 dark:text-gray-400 truncate">
                              {posting.company_name}
                            </p>
                          </div>
                        </div>
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Badge className={`${getTypeColor(posting.type)} text-xs font-medium px-2 py-1 max-w-full truncate cursor-help`}>
                                <span className="capitalize truncate">{posting.type}</span>
                              </Badge>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>Position Type: {posting.type.charAt(0).toUpperCase() + posting.type.slice(1)}</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </div>
                    </CardHeader>
                    
                    <CardContent className="space-y-3 flex-1 flex flex-col">
                      {/* Position Details */}
                      <div className="space-y-1.5">
                        <div className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-400">
                          <MapPin className="h-3 w-3 text-gray-500 flex-shrink-0" />
                          <span className="truncate">{posting.location}</span>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-400">
                          <Building2 className="h-3 w-3 text-gray-500 flex-shrink-0" />
                          <span className="truncate">{posting.industry}</span>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-400">
                          <GraduationCap className="h-3 w-3 text-gray-500 flex-shrink-0" />
                          <span>Min GPA: {posting.min_gpa ?? 'N/A'}</span>
                        </div>
                      </div>

                      {/* Skills */}
                      {posting.skills_required && posting.skills_required.length > 0 && (
                        <div>
                          <p className="text-xs text-gray-500 dark:text-gray-400 mb-1.5">Required Skills:</p>
                          <div className="flex flex-wrap gap-1">
                            {posting.skills_required.slice(0, 2).map((skill, index) => (
                              <TooltipProvider key={index}>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Badge variant="secondary" className="text-xs px-1.5 py-0.5 truncate max-w-[80px] cursor-help">
                                      {skill}
                                    </Badge>
                                  </TooltipTrigger>
                                  <TooltipContent>
                                    <p>{skill}</p>
                                  </TooltipContent>
                                </Tooltip>
                              </TooltipProvider>
                            ))}
                            {posting.skills_required.length > 2 && (
                              <TooltipProvider>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Badge variant="outline" className="text-xs px-1.5 py-0.5 cursor-help">
                                      +{posting.skills_required.length - 2}
                                    </Badge>
                                  </TooltipTrigger>
                                  <TooltipContent>
                                    <div className="max-w-xs">
                                      <p className="font-medium mb-1">All Required Skills:</p>
                                      <div className="flex flex-wrap gap-1">
                                        {posting.skills_required.map((skill, index) => (
                                          <Badge key={index} variant="secondary" className="text-xs">
                                            {skill}
                                          </Badge>
                                        ))}
                                      </div>
                                    </div>
                                  </TooltipContent>
                                </Tooltip>
                              </TooltipProvider>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Work Type and Deadline */}
                      <div className="flex items-center justify-between gap-2">
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Badge className={`${getWorkTypeColor(posting.work_type)} text-xs flex items-center gap-1 px-2 py-1 cursor-help`}>
                                {getWorkTypeIcon(posting.work_type)}
                                <span className="capitalize">{posting.work_type}</span>
                              </Badge>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>Work Type: {posting.work_type.charAt(0).toUpperCase() + posting.work_type.slice(1)}</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Badge className={`${deadlineInfo.color} text-xs flex items-center gap-1 px-2 py-1 cursor-help`}>
                                <Clock className="h-3 w-3" />
                                {deadlineInfo.text}
                              </Badge>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>Application Deadline</p>
                              <p className="text-xs text-gray-400">
                                {new Date(posting.application_deadline).toLocaleDateString('en-US', {
                                  weekday: 'long',
                                  year: 'numeric',
                                  month: 'long',
                                  day: 'numeric'
                                })}
                              </p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </div>

                      {/* Salary Range */}
                      {posting.salary_range && (
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <div className="flex items-center gap-1.5 text-xs text-gray-600 dark:text-gray-400 cursor-help">
                                <DollarSign className="h-3 w-3 text-green-500" />
                                <span className="font-medium truncate">{posting.salary_range}</span>
                              </div>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>Salary Range: {posting.salary_range}</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      )}

                      {/* Action Buttons */}
                      <div className="flex gap-1.5 pt-2 mt-auto">
                        <Button
                          variant="outline"
                          size="sm"
                          asChild
                          className="flex-1 text-xs px-2 py-1.5 h-8 rounded-md border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700"
                        >
                          <Link href={`/student/postings/${posting.posting_id}`}>
                            <Eye className="h-3 w-3 mr-1" />
                            View
                          </Link>
                        </Button>

                        <Button
                          size="sm"
                          disabled={posting.has_applied}
                          className={`flex-1 text-xs px-2 py-1.5 h-8 rounded-md ${
                            posting.has_applied
                              ? 'bg-gray-100 text-gray-500 dark:bg-gray-700 dark:text-gray-400'
                              : 'bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white'
                          }`}
                        >
                          {posting.has_applied ? (
                            <>
                              <CheckCircle className="h-3 w-3 mr-1" />
                              Applied
                            </>
                          ) : (
                            <>
                              <ExternalLink className="h-3 w-3 mr-1" />
                              Apply
                            </>
                          )}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                );
                })
              )}
            </div>
            {postings.data.length === 0 && postings.total > 0 && (
              <div className="col-span-full flex flex-col items-center justify-center py-12">
                <div className="w-24 h-24 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mb-4">
                  <Briefcase className="h-12 w-12 text-gray-400 dark:text-gray-500" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">No postings found</h3>
                <p className="text-gray-500 dark:text-gray-400 text-center max-w-md">
                  Try adjusting your search criteria or check back later for new opportunities.
                </p>
              </div>
            )}
            <Pagination className="mt-4">
              <PaginationContent>
                <PaginationItem>
                  <Button
                    variant="outline"
                    disabled={postings.prev_page_url === null}
                    onClick={() => {
                      if (postings.prev_page_url) {
                        router.visit(postings.prev_page_url, { preserveState: true });
                      }
                    }}
                    className="border-gray-300 dark:border-gray-600 rounded-full"
                    aria-label="Previous page"
                  >
                    Previous
                  </Button>
                </PaginationItem>
                {Array.from({ length: postings.last_page }, (_, i) => i + 1).map((page) => (
                  <PaginationItem key={page}>
                    <PaginationLink
                      href={`/student/postings?page=${page}&search=${searchTerm}&type=${typeFilter}&min_gpa=${minGpaFilter}&work_type=${workTypeFilter}`}
                      isActive={postings.current_page === page}
                      aria-label={`Page ${page}`}
                    >
                      {page}
                    </PaginationLink>
                  </PaginationItem>
                ))}
                <PaginationItem>
                  <Button
                    variant="outline"
                    disabled={postings.next_page_url === null}
                    onClick={() => {
                      if (postings.next_page_url) {
                        router.visit(postings.next_page_url, { preserveState: true });
                      }
                    }}
                    className="border-gray-300 dark:border-gray-600 rounded-full"
                    aria-label="Next page"
                  >
                    Next
                  </Button>
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          </CardContent>
        </Card>
          </div>

          {/* Detail Panel */}
          {selectedPosting && (
            <div className="lg:col-span-1">
              <Card className="sticky top-6">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg font-semibold text-gray-800 dark:text-gray-100">
                      Position Details
                    </CardTitle>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setSelectedPosting(null)}
                      className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Company Info */}
                  <div className="flex items-center gap-3 pb-3 border-b border-gray-200 dark:border-gray-700">
                    <Avatar className="h-12 w-12">
                      <AvatarImage 
                        src={getImageUrl(selectedPosting.company_logo)} 
                        alt={`${selectedPosting.company_name} logo`}
                        onError={(e) => handleImageError(e, '/images/default-company.png')}
                      />
                      <AvatarFallback className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-semibold">
                        {getCompanyInitials(selectedPosting.company_name)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <h3 className="font-semibold text-gray-800 dark:text-gray-100">
                        {selectedPosting.title}
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {selectedPosting.company_name}
                      </p>
                    </div>
                  </div>

                  {/* Job Details */}
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-sm">
                      <MapPin className="h-4 w-4 text-gray-500" />
                      <span className="text-gray-600 dark:text-gray-400">{selectedPosting.location}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Building2 className="h-4 w-4 text-gray-500" />
                      <span className="text-gray-600 dark:text-gray-400">{selectedPosting.industry}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <GraduationCap className="h-4 w-4 text-gray-500" />
                      <span className="text-gray-600 dark:text-gray-400">Min GPA: {selectedPosting.min_gpa}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Calendar className="h-4 w-4 text-gray-500" />
                      <span className="text-gray-600 dark:text-gray-400">
                        {new Date(selectedPosting.start_date).toLocaleDateString()} - {new Date(selectedPosting.end_date).toLocaleDateString()}
                      </span>
                    </div>
                    {selectedPosting.salary_range && (
                      <div className="flex items-center gap-2 text-sm">
                        <DollarSign className="h-4 w-4 text-gray-500" />
                        <span className="text-gray-600 dark:text-gray-400">{selectedPosting.salary_range}</span>
                      </div>
                    )}
                  </div>

                  {/* Skills */}
                  {selectedPosting.skills_required && selectedPosting.skills_required.length > 0 && (
                    <div>
                      <h4 className="font-medium text-gray-800 dark:text-gray-100 mb-2">Required Skills</h4>
                      <div className="flex flex-wrap gap-1">
                        {selectedPosting.skills_required.slice(0, 5).map((skill: string, index: number) => (
                          <Badge key={index} variant="secondary" className="text-xs">
                            {skill.trim()}
                          </Badge>
                        ))}
                        {selectedPosting.skills_required.length > 5 && (
                          <Badge variant="outline" className="text-xs">
                            +{selectedPosting.skills_required.length - 5} more
                          </Badge>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Description */}
                  {selectedPosting.description && (
                    <div>
                      <h4 className="font-medium text-gray-800 dark:text-gray-100 mb-2">Description</h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-4">
                        {selectedPosting.description}
                      </p>
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="flex gap-2 pt-3 border-t border-gray-200 dark:border-gray-700">
                    <Button
                      variant="outline"
                      size="sm"
                      asChild
                      className="flex-1"
                    >
                      <Link href={`/student/postings/${selectedPosting.posting_id}`}>
                        <ExternalLink className="h-4 w-4 mr-2" />
                        View Full Details
                      </Link>
                    </Button>
                    <Button
                      size="sm"
                      disabled={selectedPosting.has_applied}
                      className="flex-1 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700"
                    >
                      {selectedPosting.has_applied ? (
                        <>
                          <CheckCircle className="h-4 w-4 mr-2" />
                          Applied
                        </>
                      ) : (
                        <>
                          <Briefcase className="h-4 w-4 mr-2" />
                          Apply Now
                        </>
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
        )}
      </div>
    </AppLayout>
  );
}