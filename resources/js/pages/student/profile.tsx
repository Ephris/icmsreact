import React, { useState, useEffect } from 'react';
import { Head, router, usePage } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
// import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  AlertCircle, 
  X, 
  User, 
  Briefcase,
  Award,
  Camera,
  Download,
  Save
} from 'lucide-react';
import { type BreadcrumbItem } from '@/types';
import { getImageUrl, handleImageError } from '@/utils/imageUtils';

// Department type removed as departments are not editable here

interface Student {
  student_id: number;
  first_name: string;
  last_name: string;
  email: string;
  phone: string | null;
  department_id: number | null;
  department_name: string;
  cgpa: number | null;
  year_of_study: string | null;
  skills: string[];
  certifications: string[];
  portfolio: string | null;
  resume: string | null;
  profile_image: string | null;
}

interface Props {
  student: Student;
  success?: string;
  error?: string;
}

const breadcrumbs: BreadcrumbItem[] = [
  { title: 'Dashboard', href: '/student' },
  { title: 'Profile', href: '/student/profile' },
  { title: 'Edit Profile', href: null },
];

export default function Profile({ student, success, error }: Props) {
  const { errors } = usePage().props as { errors: Record<string, string> };
  
  const getInitials = (firstName: string | null | undefined, lastName: string | null | undefined) => {
    const first = firstName?.[0] || '';
    const last = lastName?.[0] || '';
    return `${first}${last}`.toUpperCase();
  };
   const [formData, setFormData] = useState({
    first_name: student.first_name,
    last_name: student.last_name,
    email: student.email,
    phone: student.phone || '',
    department_id: student.department_id?.toString() || '',
    cgpa: student.cgpa?.toString() || '',
    year_of_study: student.year_of_study || '',
    skills: Array.isArray(student.skills) ? student.skills.join(', ') : '',
    certifications: Array.isArray(student.certifications) ? student.certifications.join(', ') : '',
    portfolio: student.portfolio || '',
    preferred_locations: (student as unknown as { preferred_locations?: string }).preferred_locations || '',
    graduation_year: (student as unknown as { graduation_year?: string }).graduation_year || '',
    expected_salary: (student as unknown as { expected_salary?: string }).expected_salary || '',
    notice_period: (student as unknown as { notice_period?: string }).notice_period || '',
    resume: null as File | null,
    profile_image: null as File | null,
  });
  const [showSuccess, setShowSuccess] = useState(!!success);
  const [showError, setShowError] = useState(!!error);

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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleResumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setFormData((prev) => ({ ...prev, resume: file }));
  };

  const handleProfileImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setFormData((prev) => ({ ...prev, profile_image: file }));
  };

  const handleSubmit = () => {
    const data = new FormData();
    data.append('first_name', formData.first_name);
    data.append('last_name', formData.last_name);
    data.append('email', formData.email);
    data.append('phone', formData.phone);
    // department_id and year_of_study are not editable by students
    data.append('cgpa', formData.cgpa);
    const skillsArray = formData.skills.split(',').map((s) => s.trim()).filter((s) => s);
    skillsArray.forEach(skill => data.append('skills[]', skill));
    const certsArray = formData.certifications.split(',').map((c) => c.trim()).filter((c) => c);
    certsArray.forEach(cert => data.append('certifications[]', cert));
    data.append('portfolio', formData.portfolio);
    data.append('preferred_locations', formData.preferred_locations);
    data.append('graduation_year', formData.graduation_year);
    data.append('expected_salary', formData.expected_salary);
    data.append('notice_period', formData.notice_period);
    if (formData.resume) {
      data.append('resume', formData.resume);
    }
    if (formData.profile_image) {
      data.append('profile_image', formData.profile_image);
    }

    router.post('/student/profile', data, {
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

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title="Edit Profile" />
      <div className="p-6 space-y-6">
        {/* Profile Header */}
        <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900 dark:to-indigo-900 border-0">
          <CardContent className="p-8">
            <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
              <div className="relative">
                <Avatar className="h-24 w-24">
                  <AvatarImage 
                    src={getImageUrl(student.profile_image)} 
                    alt={`${student.first_name} ${student.last_name}`}
                    onError={(e) => handleImageError(e)}
                  />
                  <AvatarFallback className="bg-gradient-to-r from-blue-500 to-purple-600 text-white font-semibold text-2xl">
                    {getInitials(student.first_name, student.last_name)}
                  </AvatarFallback>
                </Avatar>
                <div className="absolute -bottom-2 -right-2 bg-white dark:bg-gray-800 rounded-full p-2 shadow-lg">
                  <Camera className="h-4 w-4 text-blue-600" />
                </div>
              </div>
              <div className="flex-1">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                  Edit Your Profile
                </h1>
                <p className="text-lg text-gray-600 dark:text-gray-400 mb-3">
                  Update your personal information, academic details, and upload your profile image
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Alerts */}
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

        {/* Profile Image Upload Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Camera className="h-5 w-5" />
              Profile Image
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col md:flex-row items-start gap-6">
              <div className="flex-shrink-0">
                <Avatar className="h-32 w-32">
                  <AvatarImage 
                    src={getImageUrl(student.profile_image)} 
                    alt={`${student.first_name} ${student.last_name}`}
                    onError={(e) => handleImageError(e)}
                  />
                  <AvatarFallback className="bg-gradient-to-r from-blue-500 to-purple-600 text-white font-semibold text-3xl">
                    {getInitials(student.first_name, student.last_name)}
                  </AvatarFallback>
                </Avatar>
              </div>
              <div className="flex-1 space-y-4">
                <div>
                  <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Upload Profile Image
                  </Label>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">
                    Upload a professional photo (JPEG, PNG, JPG, GIF - Max 2MB)
                  </p>
                  <Input
                    type="file"
                    accept="image/jpeg,image/png,image/jpg,image/gif"
                    onChange={handleProfileImageChange}
                    className="border-gray-300 dark:border-gray-600"
                  />
                  {errors.profile_image && <p className="text-red-500 text-sm mt-1">{errors.profile_image}</p>}
                </div>
                {student.profile_image && (
                  <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Current profile image:</p>
                    <img 
                      src={getImageUrl(student.profile_image)} 
                      alt="Current profile" 
                      className="w-20 h-20 rounded-full object-cover border-2 border-gray-200"
                      onError={(e) => handleImageError(e)}
                    />
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Personal Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Personal Information
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">First Name</Label>
                  <Input
                    name="first_name"
                    value={formData.first_name}
                    onChange={handleChange}
                    className="mt-1"
                  />
                  {errors.first_name && <p className="text-red-500 text-sm mt-1">{errors.first_name}</p>}
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">Last Name</Label>
                  <Input
                    name="last_name"
                    value={formData.last_name}
                    onChange={handleChange}
                    className="mt-1"
                  />
                  {errors.last_name && <p className="text-red-500 text-sm mt-1">{errors.last_name}</p>}
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">Email</Label>
                  <Input
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="mt-1"
                  />
                  {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">Phone</Label>
                  <Input
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    className="mt-1"
                  />
                  {errors.phone && <p className="text-red-500 text-sm mt-1">{errors.phone}</p>}
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">Gender</Label>
                  <Input value={(student as unknown as { gender?: string }).gender || 'Not set'} disabled className="mt-1 bg-gray-100 dark:bg-gray-800 cursor-not-allowed" />
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">University ID (UNid)</Label>
                  <Input value={(student as unknown as { university_id?: string }).university_id || 'Not set'} disabled className="mt-1 bg-gray-100 dark:bg-gray-800 cursor-not-allowed" />
                </div>
              </div>
              <div className="space-y-4">
                <div>
                  <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">Department</Label>
                  <Input value={student.department_name} disabled className="mt-1 bg-gray-100 dark:bg-gray-800 cursor-not-allowed" />
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">CGPA</Label>
                  <Input
                    name="cgpa"
                    type="number"
                    step="0.01"
                    min="0"
                    max="4"
                    value={formData.cgpa}
                    readOnly
                    className="mt-1 bg-gray-100 dark:bg-gray-800 cursor-not-allowed"
                  />
                  <p className="text-xs text-gray-500 mt-1">CGPA is read-only and managed by faculty advisors</p>
                  {errors.cgpa && <p className="text-red-500 text-sm mt-1">{errors.cgpa}</p>}
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">Year of Study</Label>
                  <Input value={student.year_of_study || 'N/A'} disabled className="mt-1 bg-gray-100 dark:bg-gray-800 cursor-not-allowed" />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Skills and Certifications */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Award className="h-5 w-5" />
              Skills & Certifications
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">Skills (comma-separated)</Label>
                <Input
                  name="skills"
                  value={formData.skills}
                  onChange={handleChange}
                  placeholder="e.g., JavaScript, Python, React"
                  className="mt-1"
                />
                {errors.skills && <p className="text-red-500 text-sm mt-1">{errors.skills}</p>}
              </div>
              <div>
                <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">Certifications (comma-separated)</Label>
                <Input
                  name="certifications"
                  value={formData.certifications}
                  onChange={handleChange}
                  placeholder="e.g., AWS Certified, PMP"
                  className="mt-1"
                />
                {errors.certifications && <p className="text-red-500 text-sm mt-1">{errors.certifications}</p>}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Career Preferences */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Briefcase className="h-5 w-5" />
              Career Preferences
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">Preferred Locations (comma-separated)</Label>
                <Input
                  name="preferred_locations"
                  value={formData.preferred_locations}
                  onChange={handleChange}
                  placeholder="e.g., Addis Ababa, Nairobi, Dubai"
                  className="mt-1"
                />
                {errors.preferred_locations && <p className="text-red-500 text-sm mt-1">{errors.preferred_locations}</p>}
              </div>
              <div>
                <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">Graduation Year</Label>
                <Input
                  name="graduation_year"
                  value={formData.graduation_year}
                  onChange={handleChange}
                  placeholder="e.g., 2025"
                  className="mt-1"
                />
                {errors.graduation_year && <p className="text-red-500 text-sm mt-1">{errors.graduation_year}</p>}
              </div>
              <div>
                <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">Expected Salary (ETB)</Label>
                <Input
                  name="expected_salary"
                  value={formData.expected_salary}
                  onChange={handleChange}
                  placeholder="e.g., 50000"
                  className="mt-1"
                />
                {errors.expected_salary && <p className="text-red-500 text-sm mt-1">{errors.expected_salary}</p>}
              </div>
              <div>
                <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">Notice Period (months)</Label>
                <Input
                  name="notice_period"
                  value={formData.notice_period}
                  onChange={handleChange}
                  placeholder="e.g., 1"
                  className="mt-1"
                />
                {errors.notice_period && <p className="text-red-500 text-sm mt-1">{errors.notice_period}</p>}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Portfolio and Documents */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Briefcase className="h-5 w-5" />
              Portfolio & Documents
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">Portfolio URL</Label>
                <Input
                  name="portfolio"
                  value={formData.portfolio}
                  onChange={handleChange}
                  placeholder="https://your-portfolio.com"
                  className="mt-1"
                />
                {errors.portfolio && <p className="text-red-500 text-sm mt-1">{errors.portfolio}</p>}
              </div>
              <div>
                <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">Resume (PDF)</Label>
                <Input
                  type="file"
                  accept="application/pdf"
                  onChange={handleResumeChange}
                  className="mt-1"
                />
                {errors.resume && <p className="text-red-500 text-sm mt-1">{errors.resume}</p>}
                {student.resume && (
                  <div className="mt-2">
                    <a 
                      href={student.resume} 
                      download 
                      className="text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
                    >
                      <Download className="h-4 w-4" />
                      Download Current Resume
                    </a>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4">
          <Button
            onClick={handleSubmit}
            className="bg-indigo-600 text-white hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600 flex items-center gap-2"
          >
            <Save className="h-4 w-4" />
            Save Profile
          </Button>
          <Button variant="outline" className="border-gray-300 dark:border-gray-600" onClick={() => router.visit('/student/profile')}>
            Cancel
          </Button>
        </div>
      </div>
    </AppLayout>
  );
}