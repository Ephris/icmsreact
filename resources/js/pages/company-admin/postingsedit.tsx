import { Head, Link, router } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { ArrowLeft, Briefcase, Plus } from 'lucide-react';
import { useState } from 'react';

interface Company {
  company_id: number;
  name: string;
}

interface Supervisor {
  user_id: number;
  name: string;
}

interface Posting {
  posting_id: number;
  title: string;
  description: string;
  type: string;
  industry: string;
  location: string;
  salary_range: string;
  start_date: string;
  end_date: string;
  application_deadline: string;
  requirements: string;
  skills_required: string[];
  application_instructions: string;
  work_type: string;
  benefits: string;
  experience_level: string;
  min_gpa: number | null;
  supervisor_id: string;
  status: string;
}

interface Props {
  company: Company;
  supervisors: Supervisor[];
  posting: Posting;
  success?: string;
  error?: string;
}


export default function PostingsEdit({ company, supervisors, posting, success, error }: Props) {
  const [formData, setFormData] = useState({
    title: posting.title,
    description: posting.description,
    type: posting.type,
    industry: posting.industry,
    location: posting.location,
    salary_range: posting.salary_range,
    start_date: posting.start_date,
    end_date: posting.end_date,
    application_deadline: posting.application_deadline,
    requirements: posting.requirements,
    skills_required: Array.isArray(posting.skills_required) ? posting.skills_required : [],
    application_instructions: posting.application_instructions,
    work_type: posting.work_type,
    benefits: posting.benefits,
    experience_level: posting.experience_level,
    min_gpa: posting.min_gpa?.toString() || '',
    supervisor_id: posting.supervisor_id,
    status: posting.status,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [skillInput, setSkillInput] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    router.put(`/company-admin/postings/${posting.posting_id}`, formData, {
      onFinish: () => setIsSubmitting(false),
    });
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const addSkill = () => {
    if (skillInput.trim() && !formData.skills_required.includes(skillInput.trim())) {
      setFormData(prev => ({
        ...prev,
        skills_required: [...prev.skills_required, skillInput.trim()],
      }));
      setSkillInput('');
    }
  };

  const removeSkill = (skill: string) => {
    setFormData(prev => ({
      ...prev,
      skills_required: prev.skills_required.filter(s => s !== skill),
    }));
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addSkill();
    }
  };

  return (
    <AppLayout>
      <Head title={`Edit Posting: ${posting.title}`} />

      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" asChild>
            <Link href="/company-admin/postings">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Edit Job Posting</h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              Update the details for this job posting - {company.name}
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

        <form onSubmit={handleSubmit} className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Briefcase className="h-5 w-5 text-blue-500" />
                Basic Information
              </CardTitle>
              <CardDescription>
                Essential details about the job posting
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Job Title *</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => handleInputChange('title', e.target.value)}
                    placeholder="e.g., Software Developer Intern"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="type">Job Type *</Label>
                  <Select value={formData.type} onValueChange={(value) => handleInputChange('type', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select job type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="internship">Internship</SelectItem>
                      <SelectItem value="career">Career</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Job Description *</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  placeholder="Describe the role, responsibilities, and what the candidate will learn..."
                  rows={6}
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="industry">Industry *</Label>
                  <Input
                    id="industry"
                    value={formData.industry}
                    onChange={(e) => handleInputChange('industry', e.target.value)}
                    placeholder="e.g., Technology, Healthcare, Finance"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="location">Location *</Label>
                  <Input
                    id="location"
                    value={formData.location}
                    onChange={(e) => handleInputChange('location', e.target.value)}
                    placeholder="e.g., New York, NY or Remote"
                    required
                  />
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
                  required
                />
              </div>

              <div className="space-y-2">
                <Label>Required Skills</Label>
                <div className="flex gap-2">
                  <Input
                    value={skillInput}
                    onChange={(e) => setSkillInput(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Add a skill"
                  />
                  <Button type="button" onClick={addSkill} variant="outline">
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
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
                    <SelectTrigger>
                      <SelectValue placeholder="Select experience level" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="entry">Entry Level</SelectItem>
                      <SelectItem value="mid">Mid Level</SelectItem>
                      <SelectItem value="senior">Senior Level</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="min_gpa">Minimum GPA</Label>
                  <Input
                    id="min_gpa"
                    type="number"
                    step="0.1"
                    min="0"
                    max="4"
                    value={formData.min_gpa}
                    onChange={(e) => handleInputChange('min_gpa', e.target.value)}
                    placeholder="e.g., 3.0"
                  />
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
                    <SelectTrigger>
                      <SelectValue placeholder="Select work type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="remote">Remote</SelectItem>
                      <SelectItem value="onsite">On-site</SelectItem>
                      <SelectItem value="hybrid">Hybrid</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="start_date">Start Date *</Label>
                  <Input
                    id="start_date"
                    type="date"
                    value={formData.start_date}
                    onChange={(e) => handleInputChange('start_date', e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="end_date">End Date</Label>
                  <Input
                    id="end_date"
                    type="date"
                    value={formData.end_date}
                    onChange={(e) => handleInputChange('end_date', e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="application_deadline">Application Deadline *</Label>
                <Input
                  id="application_deadline"
                  type="date"
                  value={formData.application_deadline}
                  onChange={(e) => handleInputChange('application_deadline', e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="benefits">Benefits</Label>
                <Textarea
                  id="benefits"
                  value={formData.benefits}
                  onChange={(e) => handleInputChange('benefits', e.target.value)}
                  placeholder="List any benefits offered..."
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="application_instructions">Application Instructions</Label>
                <Textarea
                  id="application_instructions"
                  value={formData.application_instructions}
                  onChange={(e) => handleInputChange('application_instructions', e.target.value)}
                  placeholder="Any specific instructions for applicants..."
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="supervisor_id">Supervisor</Label>
                <Select value={formData.supervisor_id} onValueChange={(value) => handleInputChange('supervisor_id', value)}>
                  <SelectTrigger>
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
              </div>
            </CardContent>
          </Card>

          <div className="flex gap-4 pt-4">
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Updating...' : 'Update Posting'}
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

// interface Posting {
//   posting_id: number;
//   title: string;
//   description: string;
//   type: string;
//   industry: string;
//   location: string;
//   salary_range: string;
//   start_date: string;
//   end_date: string;
//   application_deadline: string;
//   requirements: string;
//   skills_required: string[];
//   application_instructions: string;
//   work_type: string;
//   benefits: string;
//   experience_level: string;
//   min_gpa: number | null;
//   supervisor_id: string;
//   status: string;
// }

// interface Props {
//   company: Company;
//   supervisors: Supervisor[];
//   posting: Posting;
// }

// const breadcrumbs: BreadcrumbItem[] = [
//   { title: 'Dashboard', href: '/company-admin' },
//   { title: 'Postings', href: '/company-admin/postings' },
//   { title: 'Edit Posting', href: '' },
// ];

// export default function PostingsEdit({ company, supervisors, posting }: Props) {
//   const { data, setData, put, processing, errors } = useForm({
//     title: posting.title,
//     description: posting.description,
//     type: posting.type,
//     industry: posting.industry,
//     location: posting.location,
//     salary_range: posting.salary_range,
//     start_date: posting.start_date,
//     end_date: posting.end_date,
//     application_deadline: posting.application_deadline,
//     requirements: posting.requirements,
//     skills_required: posting.skills_required || [],
//     application_instructions: posting.application_instructions,
//     work_type: posting.work_type,
//     benefits: posting.benefits,
//     experience_level: posting.experience_level,
//     min_gpa: posting.min_gpa ? posting.min_gpa.toString() : '',
//     supervisor_id: posting.supervisor_id,
//     status: posting.status,
//   });

//   const handleSkillsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
//     const skills = e.target.value.split(',').map(skill => skill.trim()).filter(skill => skill);
//     setData('skills_required', skills);
//   };

//   const handleSubmit = (e: React.FormEvent) => {
//     e.preventDefault();
//     put(`/company-admin/postings/${posting.posting_id}`, {
//       onSuccess: () => {
//         // Handle success (e.g., redirect or show success message)
//       },
//       onError: () => {
//         // Handle error (e.g., display error message)
//       },
//     });
//   };

//   return (
//     <AppLayout breadcrumbs={breadcrumbs}>
//       <Head title="Edit Posting" />
//       <div className="p-6">
//         <Card className="shadow-sm">
//           <CardHeader>
//             <CardTitle className="text-2xl font-semibold">Edit Posting - {company.name}</CardTitle>
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
//               <div>
//                 <label htmlFor="status" className="block text-sm font-medium text-gray-700 dark:text-gray-200">
//                   Status
//                 </label>
//                 <Select value={data.status} onValueChange={(value) => setData('status', value)}>
//                   <SelectTrigger id="status" aria-label="Select status">
//                     <SelectValue placeholder="Select status" />
//                   </SelectTrigger>
//                   <SelectContent>
//                     <SelectItem value="open">Open</SelectItem>
//                     <SelectItem value="closed">Closed</SelectItem>
//                     <SelectItem value="draft">Draft</SelectItem>
//                   </SelectContent>
//                 </Select>
//                 {errors.status && <p className="text-red-500 text-sm mt-1">{errors.status}</p>}
//               </div>
//               <div className="flex gap-4">
//                 <Button
//                   type="submit"
//                   disabled={processing}
//                   className="bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-600"
//                   aria-label="Update posting"
//                 >
//                   Update Posting
//                 </Button>
//                 <Button asChild variant="outline">
//                   <Link href="/company-admin/postings" aria-label="Cancel and return to postings">
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

