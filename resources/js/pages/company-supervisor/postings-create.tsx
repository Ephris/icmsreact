import { Head, Link, router, useForm } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { ArrowLeft, Briefcase, Plus, AlertCircle } from 'lucide-react';
import { useState } from 'react';

interface Company {
  company_id: string;
  name: string;
}

interface CompanySupervisorPostingsCreateProps {
  company: Company;
  success?: string;
  error?: string;
}

export default function CompanySupervisorPostingsCreate({
  company,
  success,
  error,
}: CompanySupervisorPostingsCreateProps) {
  const { data: formData, setData, post, processing, errors } = useForm({
    title: '',
    description: '',
    type: '',
    industry: '',
    location: '',
    salary_range: '',
    start_date: '',
    end_date: '',
    application_deadline: '',
    requirements: '',
    skills_required: [] as string[],
    application_instructions: '',
    work_type: '',
    benefits: '',
    experience_level: '',
    min_gpa: '',
  });
  const [skillInput, setSkillInput] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    post('/company-supervisor/postings', {
      forceFormData: true,
      onSuccess: () => {
        router.visit('/company-supervisor/postings');
      },
      onError: (errors) => {
        console.error('Validation errors:', errors);
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
            <Link href="/company-supervisor/postings">
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
            </CardContent>
          </Card>

          <div className="flex gap-4 pt-4">
            <Button type="submit" disabled={processing}>
              {processing ? 'Creating...' : 'Create Posting'}
            </Button>
            <Button type="button" variant="outline" asChild>
              <Link href="/company-supervisor/postings">Cancel</Link>
            </Button>
          </div>
        </form>
      </div>
    </AppLayout>
  );
}
