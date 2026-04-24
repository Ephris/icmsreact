import React, { useState } from 'react';
import { Head, Link, useForm, router } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { ArrowLeft, Briefcase, Plus, AlertCircle } from 'lucide-react';

interface Company {
  company_id: number;
  name: string;
}

interface Supervisor {
  user_id: number;
  name: string;
}

interface Props {
  company: Company;
  supervisors: Supervisor[];
  success?: string;
  error?: string;
}


export default function PostingsCreate({ company, supervisors, success: initialSuccess, error: initialError }: Props) {
   const { data: formData, setData, post, processing, errors } = useForm({
     title: '',
     description: '',
     type: 'internship',
     industry: '',
     location: '',
     salary_range: '',
     start_date: '',
     end_date: '',
     application_deadline: '',
     requirements: '',
     skills_required: [] as string[],
     application_instructions: '',
     work_type: 'remote',
     benefits: '',
     experience_level: 'entry',
     min_gpa: '',
     supervisor_id: '',
   });
   const [isSubmitting, setIsSubmitting] = useState(false);
   const [skillInput, setSkillInput] = useState('');

   const handleSubmit = (e: React.FormEvent) => {
     e.preventDefault();
     setIsSubmitting(true);

     post('/company-admin/postings', {
       forceFormData: true,
       onSuccess: () => {
         router.visit('/company-admin/postings');
       },
       onError: (errors) => {
         console.error('Validation errors:', errors);
         setIsSubmitting(false);
       },
       onFinish: () => {
         setIsSubmitting(false);
       },
     });
   };

   const handleInputChange = (field: string, value: string) => {
     setData(field as keyof typeof formData, value);
   };

   const addSkill = () => {
     if (skillInput.trim() && !formData.skills_required.includes(skillInput.trim())) {
       setData('skills_required', [...formData.skills_required, skillInput.trim()]);
       setSkillInput('');
     }
   };

   const removeSkill = (skill: string) => {
     setData('skills_required', formData.skills_required.filter(s => s !== skill));
   };

   const handleKeyPress = (e: React.KeyboardEvent) => {
     if (e.key === 'Enter') {
       e.preventDefault();
       addSkill();
     }
   };

  return (
    <AppLayout>
      <Head title="Create Posting" />

      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" asChild>
            <Link href="/company-admin/postings">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Create Position Posting</h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              Create a new position posting for {company?.name}
            </p>
          </div>
        </div>

        {initialSuccess && (
          <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
            <p className="text-green-800 dark:text-green-200">{initialSuccess}</p>
          </div>
        )}

        {initialError && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
            <p className="text-red-800 dark:text-red-200">{initialError}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Briefcase className="h-5 w-5 text-blue-500" />
                Basic Information
              </CardTitle>
              <CardDescription>
                Essential details about the position posting
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Position Title *</Label>
                  <div className="relative">
                    <Input
                      id="title"
                      value={formData.title}
                      onChange={(e) => handleInputChange('title', e.target.value)}
                      placeholder="e.g., Software Developer Intern"
                      className={errors.title ? 'border-red-500' : ''}
                      required
                    />
                    {errors.title && (
                      <AlertCircle className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-red-500" />
                    )}
                  </div>
                  {errors.title && <p className="text-red-500 text-sm mt-1">{errors.title}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="type">Position Type *</Label>
                  <Select value={formData.type} onValueChange={(value) => handleInputChange('type', value)}>
                    <SelectTrigger className={errors.type ? 'border-red-500' : ''}>
                      <SelectValue placeholder="Select position type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="internship">Internship</SelectItem>
                      <SelectItem value="career">Career</SelectItem>
                    </SelectContent>
                  </Select>
                  {errors.type && <p className="text-red-500 text-sm mt-1">{errors.type}</p>}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Position Description *</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  placeholder="Describe the role, responsibilities, and what the candidate will learn..."
                  rows={6}
                  className={errors.description ? 'border-red-500' : ''}
                  required
                />
                {errors.description && <p className="text-red-500 text-sm mt-1">{errors.description}</p>}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="industry">Industry *</Label>
                  <div className="relative">
                    <Input
                      id="industry"
                      value={formData.industry}
                      onChange={(e) => handleInputChange('industry', e.target.value)}
                      placeholder="e.g., Technology, Healthcare, Finance"
                      className={errors.industry ? 'border-red-500' : ''}
                      required
                    />
                    {errors.industry && (
                      <AlertCircle className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-red-500" />
                    )}
                  </div>
                  {errors.industry && <p className="text-red-500 text-sm mt-1">{errors.industry}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="location">Location *</Label>
                  <div className="relative">
                    <Input
                      id="location"
                      value={formData.location}
                      onChange={(e) => handleInputChange('location', e.target.value)}
                      placeholder="e.g., New York, NY or Remote"
                      className={errors.location ? 'border-red-500' : ''}
                      required
                    />
                    {errors.location && (
                      <AlertCircle className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-red-500" />
                    )}
                  </div>
                  {errors.location && <p className="text-red-500 text-sm mt-1">{errors.location}</p>}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="salary_range">Salary Range</Label>
                <Input
                  id="salary_range"
                  value={formData.salary_range}
                  onChange={(e) => handleInputChange('salary_range', e.target.value)}
                  placeholder="e.g., $15-20/hour or $50,000-60,000/year"
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Requirements & Skills</CardTitle>
              <CardDescription>
                Specify what you're looking for in candidates
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="requirements">Requirements *</Label>
                <Textarea
                  id="requirements"
                  value={formData.requirements}
                  onChange={(e) => handleInputChange('requirements', e.target.value)}
                  placeholder="List the requirements for this position..."
                  rows={4}
                  className={errors.requirements ? 'border-red-500' : ''}
                  required
                />
                {errors.requirements && <p className="text-red-500 text-sm mt-1">{errors.requirements}</p>}
              </div>

              <div className="space-y-2">
                <Label>Required Skills</Label>
                <div className="flex gap-2">
                  <Input
                    value={skillInput}
                    onChange={(e) => setSkillInput(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Add a skill"
                    className={errors.skills_required ? 'border-red-500' : ''}
                  />
                  <Button type="button" onClick={addSkill} variant="outline">
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                {errors.skills_required && <p className="text-red-500 text-sm mt-1">{Array.isArray(errors.skills_required) ? errors.skills_required.join(', ') : errors.skills_required}</p>}
                {formData.skills_required.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {formData.skills_required.map((skill, index) => (
                      <span
                        key={index}
                        className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 dark:bg-blue-900/20 text-blue-800 dark:text-blue-300 text-sm rounded-md"
                      >
                        {skill}
                        <button
                          type="button"
                          onClick={() => removeSkill(skill)}
                          className="ml-1 hover:text-blue-600"
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="experience_level">Experience Level *</Label>
                  <Select value={formData.experience_level} onValueChange={(value) => handleInputChange('experience_level', value)}>
                    <SelectTrigger className={errors.experience_level ? 'border-red-500' : ''}>
                      <SelectValue placeholder="Select experience level" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="entry">Entry Level</SelectItem>
                      <SelectItem value="mid">Mid Level</SelectItem>
                      <SelectItem value="senior">Senior Level</SelectItem>
                    </SelectContent>
                  </Select>
                  {errors.experience_level && <p className="text-red-500 text-sm mt-1">{errors.experience_level}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="min_gpa">Minimum GPA</Label>
                  <div className="relative">
                    <Input
                      id="min_gpa"
                      type="number"
                      step="0.1"
                      min="0"
                      max="4"
                      value={formData.min_gpa}
                      onChange={(e) => handleInputChange('min_gpa', e.target.value)}
                      placeholder="e.g., 3.0"
                      className={errors.min_gpa ? 'border-red-500' : ''}
                    />
                    {errors.min_gpa && (
                      <AlertCircle className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-red-500" />
                    )}
                  </div>
                  {errors.min_gpa && <p className="text-red-500 text-sm mt-1">{errors.min_gpa}</p>}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Work Details</CardTitle>
              <CardDescription>
                Information about work arrangement and timeline
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="work_type">Work Type *</Label>
                  <Select value={formData.work_type} onValueChange={(value) => handleInputChange('work_type', value)}>
                    <SelectTrigger className={errors.work_type ? 'border-red-500' : ''}>
                      <SelectValue placeholder="Select work type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="remote">Remote</SelectItem>
                      <SelectItem value="onsite">On-site</SelectItem>
                      <SelectItem value="hybrid">Hybrid</SelectItem>
                    </SelectContent>
                  </Select>
                  {errors.work_type && <p className="text-red-500 text-sm mt-1">{errors.work_type}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="start_date">Start Date *</Label>
                  <div className="relative">
                    <Input
                      id="start_date"
                      type="date"
                      value={formData.start_date}
                      onChange={(e) => handleInputChange('start_date', e.target.value)}
                      className={errors.start_date ? 'border-red-500' : ''}
                      required
                    />
                    {errors.start_date && (
                      <AlertCircle className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-red-500" />
                    )}
                  </div>
                  {errors.start_date && <p className="text-red-500 text-sm mt-1">{errors.start_date}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="end_date">End Date</Label>
                  <div className="relative">
                    <Input
                      id="end_date"
                      type="date"
                      value={formData.end_date}
                      onChange={(e) => handleInputChange('end_date', e.target.value)}
                      className={errors.end_date ? 'border-red-500' : ''}
                    />
                    {errors.end_date && (
                      <AlertCircle className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-red-500" />
                    )}
                  </div>
                  {errors.end_date && <p className="text-red-500 text-sm mt-1">{errors.end_date}</p>}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="application_deadline">Application Deadline *</Label>
                <div className="relative">
                  <Input
                    id="application_deadline"
                    type="date"
                    value={formData.application_deadline}
                    onChange={(e) => handleInputChange('application_deadline', e.target.value)}
                    className={errors.application_deadline ? 'border-red-500' : ''}
                    required
                  />
                  {errors.application_deadline && (
                    <AlertCircle className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-red-500" />
                  )}
                </div>
                {errors.application_deadline && <p className="text-red-500 text-sm mt-1">{errors.application_deadline}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="benefits">Benefits</Label>
                <Textarea
                  id="benefits"
                  value={formData.benefits}
                  onChange={(e) => handleInputChange('benefits', e.target.value)}
                  placeholder="List any benefits offered..."
                  rows={3}
                  className={errors.benefits ? 'border-red-500' : ''}
                />
                {errors.benefits && <p className="text-red-500 text-sm mt-1">{errors.benefits}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="application_instructions">Application Instructions</Label>
                <Textarea
                  id="application_instructions"
                  value={formData.application_instructions}
                  onChange={(e) => handleInputChange('application_instructions', e.target.value)}
                  placeholder="Any specific instructions for applicants..."
                  rows={3}
                  className={errors.application_instructions ? 'border-red-500' : ''}
                />
                {errors.application_instructions && <p className="text-red-500 text-sm mt-1">{errors.application_instructions}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="supervisor_id">Supervisor</Label>
                <Select value={formData.supervisor_id} onValueChange={(value) => handleInputChange('supervisor_id', value)}>
                  <SelectTrigger className={errors.supervisor_id ? 'border-red-500' : ''}>
                    <SelectValue placeholder="Select supervisor" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">None</SelectItem>
                    {supervisors.map((supervisor) => (
                      <SelectItem key={supervisor.user_id} value={supervisor.user_id.toString()}>
                        {supervisor.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.supervisor_id && <p className="text-red-500 text-sm mt-1">{errors.supervisor_id}</p>}
              </div>
            </CardContent>
          </Card>

          <div className="flex gap-4 pt-4">
            <Button type="submit" disabled={isSubmitting || processing}>
              {isSubmitting ? 'Creating...' : 'Create Posting'}
            </Button>
            <Button type="button" variant="outline" asChild>
              <Link href="/company-admin/postings">Cancel</Link>
            </Button>
          </div>
        </form>
      </div>
    </AppLayout>
  );
}

// import React from 'react';
// import { Head, useForm, Link } from '@inertiajs/react';
// import AppLayout from '@/layouts/app-layout';
// import { Button } from '@/components/ui/button';
// import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
// import { Input } from '@/components/ui/input';
// import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
// import { Textarea } from '@/components/ui/textarea';
// import { type BreadcrumbItem } from '@/types';

// interface Company {
//   company_id: number;
//   name: string;
// }

// interface Supervisor {
//   user_id: number;
//   name: string;
// }

// interface Props {
//   company: Company;
//   supervisors: Supervisor[];
// }

// const breadcrumbs: BreadcrumbItem[] = [
//   { title: 'Dashboard', href: '/company-admin' },
//   { title: 'Create Posting', href: '/company-admin/postings/create' },
// ];

// export default function PostingsCreate({ company, supervisors }: Props) {
//   const { data, setData, post, processing, errors } = useForm({
//     title: '',
//     description: '',
//     type: 'internship',
//     industry: '',
//     location: '',
//     salary_range: '',
//     start_date: '',
//     end_date: '',
//     application_deadline: '',
//     requirements: '',
//     skills_required: [] as string[],
//     application_instructions: '',
//     work_type: 'remote',
//     benefits: '',
//     experience_level: 'entry',
//     min_gpa: '',
//     supervisor_id: '',
//   });

//   const handleSkillsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
//     const skills = e.target.value.split(',').map(skill => skill.trim()).filter(skill => skill);
//     setData('skills_required', skills);
//   };

//   const handleSubmit = (e: React.FormEvent) => {
//     e.preventDefault();
//     post('/company-admin/postings', {
//       onSuccess: () => {
//         // Handle success
//       },
//       onError: () => {
//         // Handle error
//       },
//     });
//   };

//   return (
//     <AppLayout breadcrumbs={breadcrumbs}>
//       <Head title="Create Posting" />
//       <div className="p-6">
//         <Card className="shadow-sm">
//           <CardHeader>
//             <CardTitle className="text-2xl font-semibold">Create Posting - {company.name}</CardTitle>
//           </CardHeader>
//           <CardContent className="space-y-6">
//             <form onSubmit={handleSubmit} className="space-y-4">
//               <div>
//                 <label htmlFor="title" className="block text-sm font-medium text-gray-700 dark:text-gray-200">
//                   Title
//                 </label>
//                 <Input
//                   id="title"
//                   value={data.title}
//                   onChange={(e) => setData('title', e.target.value)}
//                   className={errors.title ? 'border-red-500' : ''}
//                   aria-label="Posting title"
//                 />
//                 {errors.title && <p className="text-red-500 text-sm mt-1">{errors.title}</p>}
//               </div>
//               <div>
//                 <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-200">
//                   Description
//                 </label>
//                 <Textarea
//                   id="description"
//                   value={data.description}
//                   onChange={(e) => setData('description', e.target.value)}
//                   className={errors.description ? 'border-red-500' : ''}
//                   aria-label="Posting description"
//                 />
//                 {errors.description && <p className="text-red-500 text-sm mt-1">{errors.description}</p>}
//               </div>
//               <div>
//                 <label htmlFor="type" className="block text-sm font-medium text-gray-700 dark:text-gray-200">
//                   Type
//                 </label>
//                 <Select value={data.type} onValueChange={(value) => setData('type', value)}>
//                   <SelectTrigger id="type" aria-label="Select posting type">
//                     <SelectValue placeholder="Select type" />
//                   </SelectTrigger>
//                   <SelectContent>
//                     <SelectItem value="internship">Internship</SelectItem>
//                     <SelectItem value="career">Career</SelectItem>
//                   </SelectContent>
//                 </Select>
//                 {errors.type && <p className="text-red-500 text-sm mt-1">{errors.type}</p>}
//               </div>
//               <div>
//                 <label htmlFor="industry" className="block text-sm font-medium text-gray-700 dark:text-gray-200">
//                   Industry
//                 </label>
//                 <Input
//                   id="industry"
//                   value={data.industry}
//                   onChange={(e) => setData('industry', e.target.value)}
//                   className={errors.industry ? 'border-red-500' : ''}
//                   aria-label="Industry"
//                 />
//                 {errors.industry && <p className="text-red-500 text-sm mt-1">{errors.industry}</p>}
//               </div>
//               <div>
//                 <label htmlFor="location" className="block text-sm font-medium text-gray-700 dark:text-gray-200">
//                   Location
//                 </label>
//                 <Input
//                   id="location"
//                   value={data.location}
//                   onChange={(e) => setData('location', e.target.value)}
//                   className={errors.location ? 'border-red-500' : ''}
//                   aria-label="Location"
//                 />
//                 {errors.location && <p className="text-red-500 text-sm mt-1">{errors.location}</p>}
//               </div>
//               <div>
//                 <label htmlFor="salary_range" className="block text-sm font-medium text-gray-700 dark:text-gray-200">
//                   Salary Range
//                 </label>
//                 <Input
//                   id="salary_range"
//                   value={data.salary_range}
//                   onChange={(e) => setData('salary_range', e.target.value)}
//                   className={errors.salary_range ? 'border-red-500' : ''}
//                   aria-label="Salary range"
//                 />
//                 {errors.salary_range && <p className="text-red-500 text-sm mt-1">{errors.salary_range}</p>}
//               </div>
//               <div>
//                 <label htmlFor="start_date" className="block text-sm font-medium text-gray-700 dark:text-gray-200">
//                   Start Date
//                 </label>
//                 <Input
//                   id="start_date"
//                   type="date"
//                   value={data.start_date}
//                   onChange={(e) => setData('start_date', e.target.value)}
//                   className={errors.start_date ? 'border-red-500' : ''}
//                   aria-label="Start date"
//                 />
//                 {errors.start_date && <p className="text-red-500 text-sm mt-1">{errors.start_date}</p>}
//               </div>
//               <div>
//                 <label htmlFor="end_date" className="block text-sm font-medium text-gray-700 dark:text-gray-200">
//                   End Date
//                 </label>
//                 <Input
//                   id="end_date"
//                   type="date"
//                   value={data.end_date}
//                   onChange={(e) => setData('end_date', e.target.value)}
//                   className={errors.end_date ? 'border-red-500' : ''}
//                   aria-label="End date"
//                 />
//                 {errors.end_date && <p className="text-red-500 text-sm mt-1">{errors.end_date}</p>}
//               </div>
//               <div>
//                 <label htmlFor="application_deadline" className="block text-sm font-medium text-gray-700 dark:text-gray-200">
//                   Application Deadline
//                 </label>
//                 <Input
//                   id="application_deadline"
//                   type="date"
//                   value={data.application_deadline}
//                   onChange={(e) => setData('application_deadline', e.target.value)}
//                   className={errors.application_deadline ? 'border-red-500' : ''}
//                   aria-label="Application deadline"
//                 />
//                 {errors.application_deadline && <p className="text-red-500 text-sm mt-1">{errors.application_deadline}</p>}
//               </div>
//               <div>
//                 <label htmlFor="requirements" className="block text-sm font-medium text-gray-700 dark:text-gray-200">
//                   Requirements
//                 </label>
//                 <Textarea
//                   id="requirements"
//                   value={data.requirements}
//                   onChange={(e) => setData('requirements', e.target.value)}
//                   className={errors.requirements ? 'border-red-500' : ''}
//                   aria-label="Requirements"
//                 />
//                 {errors.requirements && <p className="text-red-500 text-sm mt-1">{errors.requirements}</p>}
//               </div>
//               <div>
//                 <label htmlFor="skills_required" className="block text-sm font-medium text-gray-700 dark:text-gray-200">
//                   Skills Required (comma-separated)
//                 </label>
//                 <Input
//                   id="skills_required"
//                   value={data.skills_required.join(', ')}
//                   onChange={handleSkillsChange}
//                   className={errors.skills_required ? 'border-red-500' : ''}
//                   aria-label="Skills required"
//                 />
//                 {errors.skills_required && <p className="text-red-500 text-sm mt-1">{errors.skills_required}</p>}
//               </div>
//               <div>
//                 <label htmlFor="application_instructions" className="block text-sm font-medium text-gray-700 dark:text-gray-200">
//                   Application Instructions
//                 </label>
//                 <Textarea
//                   id="application_instructions"
//                   value={data.application_instructions}
//                   onChange={(e) => setData('application_instructions', e.target.value)}
//                   className={errors.application_instructions ? 'border-red-500' : ''}
//                   aria-label="Application instructions"
//                 />
//                 {errors.application_instructions && <p className="text-red-500 text-sm mt-1">{errors.application_instructions}</p>}
//               </div>
//               <div>
//                 <label htmlFor="work_type" className="block text-sm font-medium text-gray-700 dark:text-gray-200">
//                   Work Type
//                 </label>
//                 <Select value={data.work_type} onValueChange={(value) => setData('work_type', value)}>
//                   <SelectTrigger id="work_type" aria-label="Select work type">
//                     <SelectValue placeholder="Select work type" />
//                   </SelectTrigger>
//                   <SelectContent>
//                     <SelectItem value="remote">Remote</SelectItem>
//                     <SelectItem value="onsite">Onsite</SelectItem>
//                     <SelectItem value="hybrid">Hybrid</SelectItem>
//                   </SelectContent>
//                 </Select>
//                 {errors.work_type && <p className="text-red-500 text-sm mt-1">{errors.work_type}</p>}
//               </div>
//               <div>
//                 <label htmlFor="benefits" className="block text-sm font-medium text-gray-700 dark:text-gray-200">
//                   Benefits
//                 </label>
//                 <Textarea
//                   id="benefits"
//                   value={data.benefits}
//                   onChange={(e) => setData('benefits', e.target.value)}
//                   className={errors.benefits ? 'border-red-500' : ''}
//                   aria-label="Benefits"
//                 />
//                 {errors.benefits && <p className="text-red-500 text-sm mt-1">{errors.benefits}</p>}
//               </div>
//               <div>
//                 <label htmlFor="experience_level" className="block text-sm font-medium text-gray-700 dark:text-gray-200">
//                   Experience Level
//                 </label>
//                 <Select value={data.experience_level} onValueChange={(value) => setData('experience_level', value)}>
//                   <SelectTrigger id="experience_level" aria-label="Select experience level">
//                     <SelectValue placeholder="Select experience level" />
//                   </SelectTrigger>
//                   <SelectContent>
//                     <SelectItem value="entry">Entry</SelectItem>
//                     <SelectItem value="mid">Mid</SelectItem>
//                     <SelectItem value="senior">Senior</SelectItem>
//                   </SelectContent>
//                 </Select>
//                 {errors.experience_level && <p className="text-red-500 text-sm mt-1">{errors.experience_level}</p>}
//               </div>
//               <div>
//                 <label htmlFor="min_gpa" className="block text-sm font-medium text-gray-700 dark:text-gray-200">
//                   Minimum GPA
//                 </label>
//                 <Input
//                   id="min_gpa"
//                   type="number"
//                   step="0.01"
//                   min="0"
//                   max="4"
//                   value={data.min_gpa}
//                   onChange={(e) => setData('min_gpa', e.target.value)}
//                   className={errors.min_gpa ? 'border-red-500' : ''}
//                   aria-label="Minimum GPA"
//                 />
//                 {errors.min_gpa && <p className="text-red-500 text-sm mt-1">{errors.min_gpa}</p>}
//               </div>
//               <div>
//                 <label htmlFor="supervisor_id" className="block text-sm font-medium text-gray-700 dark:text-gray-200">
//                   Supervisor
//                 </label>
//                 <Select value={data.supervisor_id} onValueChange={(value) => setData('supervisor_id', value)}>
//                   <SelectTrigger id="supervisor_id" aria-label="Select supervisor">
//                     <SelectValue placeholder="Select supervisor" />
//                   </SelectTrigger>
//                   <SelectContent>
//                     <SelectItem value="none">None</SelectItem>
//                     {supervisors.map((supervisor) => (
//                       <SelectItem key={supervisor.user_id} value={supervisor.user_id.toString()}>
//                         {supervisor.name}
//                       </SelectItem>
//                     ))}
//                   </SelectContent>
//                 </Select>
//                 {errors.supervisor_id && <p className="text-red-500 text-sm mt-1">{errors.supervisor_id}</p>}
//               </div>
//               <div className="flex gap-4">
//                 <Button
//                   type="submit"
//                   disabled={processing}
//                   className="bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-600"
//                   aria-label="Create posting"
//                 >
//                   Create Posting
//                 </Button>
//                 <Button asChild variant="outline">
//                   <Link href="/company-admin" aria-label="Cancel and return to dashboard">
//                     Cancel
//                   </Link>
//                 </Button>
//               </div>
//             </form>
//           </CardContent>
//         </Card>
//       </div>
//     </AppLayout>
//   );
// }

