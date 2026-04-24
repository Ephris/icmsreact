import { Head, useForm, router } from '@inertiajs/react';
import { useState } from 'react';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { type BreadcrumbItem } from '@/types';
import { Plus, Trash2, AlertCircle, CheckCircle, Eye, Star, Building, Calendar, Users } from 'lucide-react';
import { getImageUrl, handleImageError } from '@/utils/imageUtils';

interface HomeContent {
    id?: number;
    title: string;
    description: string;
    background_image?: string;
    logo?: string;
    about_title: string;
    about_description: string;
    inline_image?: string;
    phone?: string;
    email?: string;
    location?: string;
    social_media?: { platform: string; url: string }[];
    carousel_images?: string[];
    carousel_texts?: string[];
    background_color?: string;
    postings_button_text?: string;
    about_us_button_text?: string;
    login_button_text?: string;
    trusted_logos?: string[];
    footer_text?: string;
    footer_links?: { label: string; url: string }[];
    // New dynamic content fields
    header_height?: string;
    navigation_menu?: { label: string; url: string; children?: { label: string; url: string }[] }[];
    hero_subtitle?: string;
    hero_image_fit?: string;
    about_image_text?: string;
    statistics?: { value: string; label: string }[];
    our_story_text?: string;
    our_story_image?: string;
    our_mission?: string;
    our_vision?: string;
    why_it_works_title?: string;
    why_it_works_subtitle?: string;
    why_it_works_cards?: {
        title: string;
        description: string;
        features: string[];
        bgColor?: string;
        borderColor?: string;
        iconBgColor?: string;
    }[];
    system_roles_title?: string;
    system_roles_data?: {
        role: string;
        icon: string;
        description: string;
        functionalities: string[];
        color: string;
        iconColor: string;
    }[];
    how_it_works_title?: string;
    how_it_works_subtitle?: string;
    how_it_works_steps?: {
        step: number;
        title: string;
        description: string;
        icon: string;
    }[];
    workflows_title?: string;
    workflows_data?: {
        role: string;
        steps: {
            step: number;
            title: string;
            description: string;
        }[];
    }[];
    why_choose_title?: string;
    why_choose_subtitle?: string;
    why_choose_features?: {
        title: string;
        description: string;
        icon: string;
    }[];
    success_stories_title?: string;
    success_stories_subtitle?: string;
}

interface PendingStory {
    student_id: string;
    student_name: string;
    student_role: string;
    title: string;
    story: string;
    company_name: string;
    role: string;
    outcome: string;
    image?: string;
    status: string;
    created_at: string;
}

interface Company {
    company_id: number;
    name: string;
    logo: string | null;
}

interface Props {
    homeContent: HomeContent | null;
    pendingStories: PendingStory[];
    companies: Company[];
    success?: string;
    error?: string;
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Manage Homepage', href: '/admin/homepage' },
];

export default function Homepage({ homeContent, pendingStories, companies, success, error }: Props) {
    const [deletedCarouselIndices, setDeletedCarouselIndices] = useState<number[]>([]);
    
    const { data, setData, processing, errors } = useForm({
        title: homeContent?.title || '',
        description: homeContent?.description || '',
        about_title: homeContent?.about_title || '',
        about_description: homeContent?.about_description || '',
        phone: homeContent?.phone || '',
        email: homeContent?.email || '',
        location: homeContent?.location || '',
        social_media: Array.isArray(homeContent?.social_media) ? homeContent.social_media : [{ platform: '', url: '' }],
        carousel_images: [] as (File | null)[],
        carousel_texts: Array.isArray(homeContent?.carousel_texts) ? homeContent.carousel_texts : ['', '', '', ''],
        background_color: homeContent?.background_color || '#ffffff',
        postings_button_text: homeContent?.postings_button_text || 'Postings',
        about_us_button_text: homeContent?.about_us_button_text || 'About Us',
        login_button_text: homeContent?.login_button_text || 'Login',
        background_image: null as File | null,
        logo: null as File | null,
        inline_image: null as File | null,
        footer_text: homeContent?.footer_text || '',
        footer_links: Array.isArray(homeContent?.footer_links) ? homeContent!.footer_links! : [{ label: '', url: '' }],
        // New dynamic content fields
        header_height: homeContent?.header_height || 'h-16',
        navigation_menu: homeContent?.navigation_menu || [],
        hero_subtitle: homeContent?.hero_subtitle || '',
        hero_image_fit: homeContent?.hero_image_fit || 'cover',
        about_image_text: homeContent?.about_image_text || '',
        statistics: homeContent?.statistics || [],
        our_story_text: homeContent?.our_story_text || '',
        our_story_image: null as File | null,
        our_mission: homeContent?.our_mission || '',
        our_vision: homeContent?.our_vision || '',
        why_it_works_title: homeContent?.why_it_works_title || '',
        why_it_works_subtitle: homeContent?.why_it_works_subtitle || '',
        why_it_works_cards: homeContent?.why_it_works_cards || [],
        system_roles_title: homeContent?.system_roles_title || '',
        system_roles_data: homeContent?.system_roles_data || [],
        how_it_works_title: homeContent?.how_it_works_title || '',
        how_it_works_subtitle: homeContent?.how_it_works_subtitle || '',
        how_it_works_steps: homeContent?.how_it_works_steps || [],
        workflows_title: homeContent?.workflows_title || '',
        workflows_data: homeContent?.workflows_data || [],
        why_choose_title: homeContent?.why_choose_title || '',
        why_choose_subtitle: homeContent?.why_choose_subtitle || '',
        why_choose_features: homeContent?.why_choose_features || [],
        success_stories_title: homeContent?.success_stories_title || '',
        success_stories_subtitle: homeContent?.success_stories_subtitle || '',
    });

    const addSocialMedia = () => {
        setData('social_media', [...data.social_media, { platform: '', url: '' }]);
    };

    const removeSocialMedia = (index: number) => {
        setData('social_media', data.social_media.filter((_, i) => i !== index));
    };

    const updateSocialMedia = (index: number, field: string, value: string) => {
        const updated = [...data.social_media];
        updated[index] = { ...updated[index], [field]: value };
        setData('social_media', updated);
    };

    const handleCarouselImageChange = (index: number, file: File | null) => {
        const updated = [...data.carousel_images];
        if (file) {
            updated[index] = file;
        } else {
            // Keep existing image if no new file is selected
            updated[index] = null;
        }
        setData('carousel_images', updated);
    };

    const handleCarouselImageDelete = (index: number) => {
        const updated = [...data.carousel_images];
        updated[index] = null;
        setData('carousel_images', updated);
        // Track this index for deletion on backend
        if (homeContent?.carousel_images && Array.isArray(homeContent.carousel_images) && homeContent.carousel_images[index]) {
            setDeletedCarouselIndices((prev: number[]) => [...prev.filter((i: number) => i !== index), index]);
        }
        // Also clear the text for this slide
        const updatedTexts = [...data.carousel_texts];
        updatedTexts[index] = '';
        setData('carousel_texts', updatedTexts);
    };

    const handleCarouselTextChange = (index: number, text: string) => {
        const updated = [...data.carousel_texts];
        updated[index] = text;
        setData('carousel_texts', updated);
    };


    const addFooterLink = () => {
        setData('footer_links', [...(data.footer_links as { label: string; url: string }[]), { label: '', url: '' }]);
    };
    const removeFooterLink = (index: number) => {
        setData('footer_links', (data.footer_links as { label: string; url: string }[]).filter((_, i) => i !== index));
    };
    const updateFooterLink = (index: number, field: 'label'|'url', value: string) => {
        const updated = [...(data.footer_links as { label: string; url: string }[])];
        updated[index] = { ...updated[index], [field]: value };
        setData('footer_links', updated);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        // Create transformed data for submission
        const submitData = new FormData();

        // Add regular fields
        Object.entries(data).forEach(([key, value]) => {
            if (['social_media', 'carousel_texts', 'footer_links', 'navigation_menu', 'statistics', 'why_it_works_cards', 'system_roles_data', 'how_it_works_steps', 'workflows_data', 'why_choose_features'].includes(key)) {
                submitData.append(key, JSON.stringify(value));
            } else if (key === 'carousel_images') {
                // Handle carousel images file array
                (value as (File | null)[]).forEach((file, index) => {
                    if (file) {
                        submitData.append(`carousel_images[${index}]`, file);
                    }
                });
            } else if (value instanceof File) {
                submitData.append(key, value);
            } else if (value !== null && value !== undefined) {
                submitData.append(key, String(value));
            }
        });

        // Add deleted carousel image indices
        if (deletedCarouselIndices.length > 0) {
            submitData.append('carousel_images_delete', JSON.stringify(deletedCarouselIndices));
        }

        // Submit with FormData using router
        router.post('/admin/homepage', submitData, {
            forceFormData: true,
            onSuccess: () => {
                // Clear deleted indices after successful submission
                setDeletedCarouselIndices([]);
            },
        });
    };


    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Manage Homepage" />
            <div className="p-6 space-y-6">
                <Card className="shadow-lg border-none bg-white dark:bg-gray-800 rounded-2xl overflow-hidden">
                    <CardHeader className="bg-gradient-to-r from-indigo-500 to-blue-600 dark:from-indigo-700 dark:to-blue-800 p-6 rounded-t-2xl">
                        <CardTitle className="text-white flex items-center">
                            <CheckCircle className="h-6 w-6 mr-3" />
                            Manage Homepage Content
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-6">
                        {success && (
                            <Alert className="bg-green-50 dark:bg-green-900/30 border-green-200 dark:border-green-800 mb-6">
                                <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
                                <AlertTitle className="text-green-800 dark:text-green-200 font-semibold">Success</AlertTitle>
                                <AlertDescription className="text-green-700 dark:text-green-300">{success}</AlertDescription>
                            </Alert>
                        )}
                        {error && (
                            <Alert className="bg-red-50 dark:bg-red-900/30 border-red-200 dark:border-red-800 mb-6">
                                <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400" />
                                <AlertTitle className="text-red-800 dark:text-red-200 font-semibold">Error</AlertTitle>
                                <AlertDescription className="text-red-700 dark:text-red-300">{error}</AlertDescription>
                            </Alert>
                        )}
                        <form onSubmit={handleSubmit} className="space-y-8">
                            {/* Hero Section */}
                            <div className="space-y-4">
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 flex items-center">
                                    <Star className="h-5 w-5 mr-2 text-yellow-500" />
                                    Hero Section
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <Label htmlFor="title">Hero Title</Label>
                                        <Input
                                            id="title"
                                            value={data.title}
                                            onChange={(e) => setData('title', e.target.value)}
                                            className="mt-1 rounded-full"
                                        />
                                        {errors.title && <p className="text-red-500 text-sm mt-1">{errors.title}</p>}
                                    </div>
                                    <div>
                                        <Label htmlFor="background_color">Background Color</Label>
                                        <Input
                                            id="background_color"
                                            type="color"
                                            value={data.background_color}
                                            onChange={(e) => setData('background_color', e.target.value)}
                                            className="mt-1 h-10 rounded-full"
                                        />
                                    </div>
                                </div>
                                <div>
                                    <Label htmlFor="description">Hero Description</Label>
                                    <Textarea
                                        id="description"
                                        value={data.description}
                                        onChange={(e) => setData('description', e.target.value)}
                                        className="mt-1"
                                        rows={3}
                                    />
                                    {errors.description && <p className="text-red-500 text-sm mt-1">{errors.description}</p>}
                                </div>
                            </div>

                            {/* Contact Information */}
                            <div className="space-y-4">
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 flex items-center">
                                    <Building className="h-5 w-5 mr-2 text-blue-500" />
                                    Contact Information (Top Bar)
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                    <div>
                                        <Label htmlFor="phone">Phone Number</Label>
                                        <Input
                                            id="phone"
                                            value={data.phone}
                                            onChange={(e) => setData('phone', e.target.value)}
                                            className="mt-1"
                                            placeholder="+251 911 123 456"
                                        />
                                    </div>
                                    <div>
                                        <Label htmlFor="email">Email Address</Label>
                                        <Input
                                            id="email"
                                            type="email"
                                            value={data.email}
                                            onChange={(e) => setData('email', e.target.value)}
                                            className="mt-1"
                                            placeholder="info@university.edu.et"
                                        />
                                    </div>
                                    <div>
                                        <Label htmlFor="location">Location</Label>
                                        <Input
                                            id="location"
                                            value={data.location}
                                            onChange={(e) => setData('location', e.target.value)}
                                            className="mt-1"
                                            placeholder="Ambo University, Ethiopia"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Social Media */}
                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 flex items-center">
                                        <Users className="h-5 w-5 mr-2 text-purple-500" />
                                        Social Media Links
                                    </h3>
                                    <Button type="button" onClick={addSocialMedia} size="sm" variant="outline">
                                        <Plus className="h-4 w-4 mr-2" />
                                        Add Social Media
                                    </Button>
                                </div>
                                {data.social_media.map((social, index) => (
                                    <div key={index} className="flex gap-4 items-end">
                                        <div className="flex-1">
                                            <Label>Platform</Label>
                                            <Input
                                                value={social.platform}
                                                onChange={(e) => updateSocialMedia(index, 'platform', e.target.value)}
                                                placeholder="facebook, twitter, instagram, linkedin"
                                                className="mt-1"
                                            />
                                        </div>
                                        <div className="flex-1">
                                            <Label>URL</Label>
                                            <Input
                                                value={social.url}
                                                onChange={(e) => updateSocialMedia(index, 'url', e.target.value)}
                                                placeholder="https://..."
                                                className="mt-1"
                                            />
                                        </div>
                                        <Button type="button" onClick={() => removeSocialMedia(index)} size="sm" variant="destructive">
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </div>
                                ))}
                            </div>

                            {/* Carousel */}
                            <div className="space-y-4">
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 flex items-center">
                                    <Eye className="h-5 w-5 mr-2 text-green-500" />
                                    Image Carousel (4 images)
                                </h3>
                                {[0, 1, 2, 3].map((index) => (
                                    <div key={index} className="border rounded-lg p-4 space-y-4">
                                        <h4 className="font-medium">Slide {index + 1}</h4>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div>
                                                <Label>Image</Label>
                                                <Input
                                                    type="file"
                                                    accept="image/*"
                                                    name={`carousel_images[${index}]`}
                                                    onChange={(e) => handleCarouselImageChange(index, e.target.files?.[0] || null)}
                                                    className="mt-1"
                                                />
                                                <p className="text-xs text-gray-500 mt-1">Max size: 5MB. Supported: JPEG, PNG, GIF, WebP</p>
                                                {homeContent?.carousel_images && Array.isArray(homeContent.carousel_images) && homeContent.carousel_images[index] && (
                                                    <div className="mt-2 relative">
                                                        <img src={getImageUrl(homeContent.carousel_images[index])} alt={`Slide ${index + 1}`} className="w-32 h-20 object-cover rounded border" />
                                                        <p className="text-xs text-gray-500 mt-1">Current image</p>
                                                        <Button
                                                            type="button"
                                                            onClick={() => handleCarouselImageDelete(index)}
                                                            size="sm"
                                                            variant="destructive"
                                                            className="mt-2"
                                                        >
                                                            <Trash2 className="h-4 w-4 mr-1" />
                                                            Delete Image
                                                        </Button>
                                                    </div>
                                                )}
                                            </div>
                                            <div>
                                                <Label>Text</Label>
                                                <Textarea
                                                    value={data.carousel_texts[index] || ''}
                                                    onChange={(e) => handleCarouselTextChange(index, e.target.value)}
                                                    className="mt-1"
                                                    rows={3}
                                                    placeholder="Description text for this slide"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Button Texts */}
                            <div className="space-y-4">
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 flex items-center">
                                    <CheckCircle className="h-5 w-5 mr-2 text-indigo-500" />
                                    Navigation Button Texts
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                    <div>
                                        <Label htmlFor="postings_button_text">Postings Button</Label>
                                        <Input
                                            id="postings_button_text"
                                            value={data.postings_button_text}
                                            onChange={(e) => setData('postings_button_text', e.target.value)}
                                            className="mt-1"
                                        />
                                    </div>
                                    <div>
                                        <Label htmlFor="about_us_button_text">About Us Button</Label>
                                        <Input
                                            id="about_us_button_text"
                                            value={data.about_us_button_text}
                                            onChange={(e) => setData('about_us_button_text', e.target.value)}
                                            className="mt-1"
                                        />
                                    </div>
                                    <div>
                                        <Label htmlFor="login_button_text">Login Button</Label>
                                        <Input
                                            id="login_button_text"
                                            value={data.login_button_text}
                                            onChange={(e) => setData('login_button_text', e.target.value)}
                                            className="mt-1"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* About Section */}
                            <div className="space-y-4">
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 flex items-center">
                                    <Building className="h-5 w-5 mr-2 text-teal-500" />
                                    About Section
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <Label htmlFor="about_title">About Title</Label>
                                        <Input
                                            id="about_title"
                                            value={data.about_title}
                                            onChange={(e) => setData('about_title', e.target.value)}
                                            className="mt-1"
                                        />
                                        {errors.about_title && <p className="text-red-500 text-sm mt-1">{errors.about_title}</p>}
                                    </div>
                                    <div>
                                        <Label htmlFor="about_description">About Description</Label>
                                        <Textarea
                                            id="about_description"
                                            value={data.about_description}
                                            onChange={(e) => setData('about_description', e.target.value)}
                                            className="mt-1"
                                            rows={3}
                                        />
                                        {errors.about_description && <p className="text-red-500 text-sm mt-1">{errors.about_description}</p>}
                                    </div>
                                </div>
                            </div>

                            {/* Images */}
                            <div className="space-y-4">
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 flex items-center">
                                    <Eye className="h-5 w-5 mr-2 text-orange-500" />
                                    Images
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                    <div>
                                        <Label htmlFor="logo">Logo</Label>
                                        <Input
                                            id="logo"
                                            type="file"
                                            accept="image/*"
                                            onChange={(e) => setData('logo', e.target.files?.[0] || null)}
                                            className="mt-1"
                                        />
                                        <p className="text-xs text-gray-500 mt-1">Max size: 2MB. Recommended: Square format</p>
                                        {homeContent?.logo && (
                                            <div className="mt-2">
                                                <img src={getImageUrl(homeContent.logo)} alt="Logo" className="w-32 h-20 object-cover rounded border" />
                                                <p className="text-xs text-gray-500 mt-1">Current logo</p>
                                            </div>
                                        )}
                                    </div>
                                    <div>
                                        <Label htmlFor="background_image">Background Image</Label>
                                        <Input
                                            id="background_image"
                                            type="file"
                                            accept="image/*"
                                            onChange={(e) => setData('background_image', e.target.files?.[0] || null)}
                                            className="mt-1"
                                        />
                                        <p className="text-xs text-gray-500 mt-1">Max size: 5MB. Recommended: 1920x1080 or larger</p>
                                        {homeContent?.background_image && (
                                            <div className="mt-2">
                                                <img src={getImageUrl(homeContent.background_image)} alt="Background" className="w-32 h-20 object-cover rounded border" />
                                                <p className="text-xs text-gray-500 mt-1">Current background</p>
                                            </div>
                                        )}
                                    </div>
                                    <div>
                                        <Label htmlFor="inline_image">About Section Image</Label>
                                        <Input
                                            id="inline_image"
                                            type="file"
                                            accept="image/*"
                                            onChange={(e) => setData('inline_image', e.target.files?.[0] || null)}
                                            className="mt-1"
                                        />
                                        <p className="text-xs text-gray-500 mt-1">Max size: 5MB. Recommended: 800x600 or larger</p>
                                        {homeContent?.inline_image && (
                                            <div className="mt-2">
                                                <img src={getImageUrl(homeContent.inline_image)} alt="About" className="w-32 h-20 object-cover rounded border" />
                                                <p className="text-xs text-gray-500 mt-1">Current image</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Trusted by Logos */}
                            <div className="space-y-4">
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 flex items-center">
                                    <Star className="h-5 w-5 mr-2 text-amber-500" />
                                    Trusted By Section - Company Logos
                                </h3>
                                <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                                    <div className="flex items-start space-x-3">
                                        <div className="flex-shrink-0">
                                            <Building className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5" />
                                        </div>
                                        <div>
                                            <h4 className="text-sm font-medium text-blue-900 dark:text-blue-100">Dynamic Company Logos</h4>
                                            <p className="text-sm text-blue-700 dark:text-blue-300 mt-1">
                                                The "Trusted By" section now automatically displays logos from active companies in the system.
                                                Company logos are uploaded by company administrators and displayed here dynamically.
                                            </p>
                                            <div className="mt-3">
                                                <p className="text-xs text-blue-600 dark:text-blue-400 font-medium">Available Companies with Logos:</p>
                                                <div className="flex flex-wrap gap-2 mt-2">
                                                    {companies.length > 0 ? (
                                                        companies.slice(0, 6).map((company) => (
                                                            <div key={company.company_id} className="flex items-center space-x-2 bg-white dark:bg-gray-800 rounded-md px-3 py-2 border">
                                                                {company.logo ? (
                                                                    <img
                                                                        src={getImageUrl(company.logo)}
                                                                        alt={company.name}
                                                                        className="w-6 h-6 object-contain"
                                                                        onError={(e) => handleImageError(e)}
                                                                    />
                                                                ) : (
                                                                    <div className="w-6 h-6 bg-gray-200 dark:bg-gray-700 rounded flex items-center justify-center">
                                                                        <span className="text-xs text-gray-500">{company.name.charAt(0)}</span>
                                                                    </div>
                                                                )}
                                                                <span className="text-xs font-medium text-gray-900 dark:text-gray-100">{company.name}</span>
                                                            </div>
                                                        ))
                                                    ) : (
                                                        <p className="text-xs text-blue-600 dark:text-blue-400 italic">
                                                            No companies with logos found. Company admins can upload logos in their profile settings.
                                                        </p>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="text-sm text-gray-600 dark:text-gray-400">
                                    <p><strong>Note:</strong> The homepage will automatically display up to 6 company logos from active companies that have uploaded logos. This creates a dynamic "Trusted By" section that grows as more companies join the platform.</p>
                                </div>
                            </div>

                            <Button type="submit" disabled={processing} className="bg-indigo-600 hover:bg-indigo-700">
                                {processing ? 'Saving...' : 'Save Changes'}
                            </Button>

                            {/* Header Settings */}
                            <div className="space-y-4 mt-10">
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Header Settings</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <Label htmlFor="header_height">Header Height</Label>
                                        <select
                                            id="header_height"
                                            value={data.header_height}
                                            onChange={(e) => setData('header_height', e.target.value)}
                                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                        >
                                            <option value="h-12">Small (h-12)</option>
                                            <option value="h-16">Medium (h-16)</option>
                                            <option value="h-20">Large (h-20)</option>
                                        </select>
                                    </div>
                                    <div>
                                        <Label htmlFor="hero_image_fit">Hero Image Fit</Label>
                                        <select
                                            id="hero_image_fit"
                                            value={data.hero_image_fit}
                                            onChange={(e) => setData('hero_image_fit', e.target.value)}
                                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                        >
                                            <option value="cover">Cover</option>
                                            <option value="contain">Contain</option>
                                            <option value="fill">Fill</option>
                                        </select>
                                    </div>
                                </div>
                                <div>
                                    <Label htmlFor="hero_subtitle">Hero Subtitle</Label>
                                    <Textarea
                                        id="hero_subtitle"
                                        value={data.hero_subtitle}
                                        onChange={(e) => setData('hero_subtitle', e.target.value)}
                                        className="mt-1"
                                        rows={2}
                                        placeholder="Additional subtitle text for hero section"
                                    />
                                </div>
                            </div>

                            {/* About Us Section Settings */}
                            <div className="space-y-4 mt-10">
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">About Us Section</h3>
                                <div>
                                    <Label htmlFor="about_image_text">About Image Text</Label>
                                    <Textarea
                                        id="about_image_text"
                                        value={data.about_image_text}
                                        onChange={(e) => setData('about_image_text', e.target.value)}
                                        className="mt-1"
                                        rows={3}
                                        placeholder="Text to display on the about image overlay"
                                    />
                                </div>
                                <div>
                                    <Label htmlFor="our_story_text">Our Story Text</Label>
                                    <Textarea
                                        id="our_story_text"
                                        value={data.our_story_text}
                                        onChange={(e) => setData('our_story_text', e.target.value)}
                                        className="mt-1"
                                        rows={4}
                                        placeholder="Our story content"
                                    />
                                    <div className="mt-4">
                                        <Label htmlFor="our_story_image">Our Story Image</Label>
                                        <Input
                                            id="our_story_image"
                                            type="file"
                                            accept="image/*"
                                            onChange={(e) => setData('our_story_image', e.target.files?.[0] || null)}
                                            className="mt-1"
                                        />
                                        <p className="text-xs text-gray-500 mt-1">Max size: 5MB. Supported: JPEG, PNG, GIF, WebP</p>
                                        {homeContent?.our_story_image && (
                                            <div className="mt-2">
                                                <img src={getImageUrl(homeContent.our_story_image)} alt="Our Story" className="w-64 h-auto object-cover rounded border" />
                                                <p className="text-xs text-gray-500 mt-1">Current image</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <Label htmlFor="our_mission">Our Mission</Label>
                                        <Textarea
                                            id="our_mission"
                                            value={data.our_mission}
                                            onChange={(e) => setData('our_mission', e.target.value)}
                                            className="mt-1"
                                            rows={3}
                                            placeholder="Our mission statement"
                                        />
                                    </div>
                                    <div>
                                        <Label htmlFor="our_vision">Our Vision</Label>
                                        <Textarea
                                            id="our_vision"
                                            value={data.our_vision}
                                            onChange={(e) => setData('our_vision', e.target.value)}
                                            className="mt-1"
                                            rows={3}
                                            placeholder="Our vision statement"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Why It Works Section Settings */}
                            <div className="space-y-4 mt-10">
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Why It Works Section</h3>
                                <div>
                                    <Label htmlFor="why_it_works_title">Why It Works Title</Label>
                                    <Input
                                        id="why_it_works_title"
                                        value={data.why_it_works_title}
                                        onChange={(e) => setData('why_it_works_title', e.target.value)}
                                        className="mt-1"
                                        placeholder="Why It Works"
                                    />
                                </div>
                                <div>
                                    <Label htmlFor="why_it_works_subtitle">Why It Works Subtitle</Label>
                                    <Textarea
                                        id="why_it_works_subtitle"
                                        value={data.why_it_works_subtitle}
                                        onChange={(e) => setData('why_it_works_subtitle', e.target.value)}
                                        className="mt-1"
                                        rows={2}
                                        placeholder="Subtitle for why it works section"
                                    />
                                </div>
                            </div>

                            {/* System Roles Section Settings */}
                            <div className="space-y-4 mt-10">
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">System Roles Section</h3>
                                <div>
                                    <Label htmlFor="system_roles_title">System Roles Title</Label>
                                    <Input
                                        id="system_roles_title"
                                        value={data.system_roles_title}
                                        onChange={(e) => setData('system_roles_title', e.target.value)}
                                        className="mt-1"
                                        placeholder="System Roles Overview"
                                    />
                                </div>
                            </div>

                            {/* How It Works Section Settings */}
                            <div className="space-y-4 mt-10">
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">How It Works Section</h3>
                                <div>
                                    <Label htmlFor="how_it_works_title">How It Works Title</Label>
                                    <Input
                                        id="how_it_works_title"
                                        value={data.how_it_works_title}
                                        onChange={(e) => setData('how_it_works_title', e.target.value)}
                                        className="mt-1"
                                        placeholder="How It Works"
                                    />
                                </div>
                                <div>
                                    <Label htmlFor="how_it_works_subtitle">How It Works Subtitle</Label>
                                    <Textarea
                                        id="how_it_works_subtitle"
                                        value={data.how_it_works_subtitle}
                                        onChange={(e) => setData('how_it_works_subtitle', e.target.value)}
                                        className="mt-1"
                                        rows={2}
                                        placeholder="Subtitle for how it works section"
                                    />
                                </div>
                            </div>

                            {/* Why Choose ICMS Section Settings */}
                            <div className="space-y-4 mt-10">
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Why Choose ICMS Section</h3>
                                <div>
                                    <Label htmlFor="why_choose_title">Why Choose Title</Label>
                                    <Input
                                        id="why_choose_title"
                                        value={data.why_choose_title}
                                        onChange={(e) => setData('why_choose_title', e.target.value)}
                                        className="mt-1"
                                        placeholder="Why Choose ICMS"
                                    />
                                </div>
                                <div>
                                    <Label htmlFor="why_choose_subtitle">Why Choose Subtitle</Label>
                                    <Textarea
                                        id="why_choose_subtitle"
                                        value={data.why_choose_subtitle}
                                        onChange={(e) => setData('why_choose_subtitle', e.target.value)}
                                        className="mt-1"
                                        rows={2}
                                        placeholder="Subtitle for why choose section"
                                    />
                                </div>
                            </div>

                            {/* Success Stories Section Settings */}
                            <div className="space-y-4 mt-10">
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Success Stories Section</h3>
                                <div>
                                    <Label htmlFor="success_stories_title">Success Stories Title</Label>
                                    <Input
                                        id="success_stories_title"
                                        value={data.success_stories_title}
                                        onChange={(e) => setData('success_stories_title', e.target.value)}
                                        className="mt-1"
                                        placeholder="Success Stories"
                                    />
                                </div>
                                <div>
                                    <Label htmlFor="success_stories_subtitle">Success Stories Subtitle</Label>
                                    <Textarea
                                        id="success_stories_subtitle"
                                        value={data.success_stories_subtitle}
                                        onChange={(e) => setData('success_stories_subtitle', e.target.value)}
                                        className="mt-1"
                                        rows={2}
                                        placeholder="Subtitle for success stories section"
                                    />
                                </div>
                            </div>

                            {/* Footer Settings */}
                            <div className="space-y-4 mt-10">
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 flex items-center">
                                    <CheckCircle className="h-5 w-5 mr-2 text-gray-500" />
                                    Footer
                                </h3>
                                <div>
                                    <Label htmlFor="footer_text">Footer Text</Label>
                                    <Textarea
                                        id="footer_text"
                                        value={data.footer_text as string}
                                        onChange={(e) => setData('footer_text', e.target.value)}
                                        className="mt-1"
                                        rows={3}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <div className="flex items-center justify-between">
                                        <h4 className="font-medium">Footer Links</h4>
                                        <Button type="button" onClick={addFooterLink} size="sm" variant="outline">
                                            <Plus className="h-4 w-4 mr-2" /> Add Link
                                        </Button>
                                    </div>
                                    {(data.footer_links as { label: string; url: string }[]).map((link, index) => (
                                        <div key={index} className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
                                            <div className="md:col-span-1">
                                                <Label>Label</Label>
                                                <Input
                                                    value={link.label}
                                                    onChange={(e) => updateFooterLink(index, 'label', e.target.value)}
                                                    className="mt-1"
                                                />
                                            </div>
                                            <div className="md:col-span-1">
                                                <Label>URL</Label>
                                                <Input
                                                    value={link.url}
                                                    onChange={(e) => updateFooterLink(index, 'url', e.target.value)}
                                                    className="mt-1"
                                                />
                                            </div>
                                            <div>
                                                <Button type="button" onClick={() => removeFooterLink(index)} size="sm" variant="destructive">
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </form>
                    </CardContent>
                </Card>

                {/* Success Stories Management */}
                <Card className="mt-8 shadow-lg border-none bg-white dark:bg-gray-800 rounded-2xl overflow-hidden">
                    <CardHeader className="bg-gradient-to-r from-green-500 to-emerald-600 dark:from-green-700 dark:to-emerald-800 p-6 rounded-t-2xl">
                        <CardTitle className="text-white flex items-center">
                            <CheckCircle className="h-6 w-6 mr-3" />
                            Success Stories Management
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between mb-6">
                            <div>
                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                    Review and approve success stories submitted by students.
                                </p>
                                <div className="flex items-center gap-4 mt-2">
                                    <Badge variant="secondary" className="bg-blue-100 text-blue-800 border-blue-200">
                                        {pendingStories.length} Pending
                                    </Badge>
                                    <Button asChild variant="outline" size="sm">
                                        <a href={route('admin.approved-success-stories')}>
                                            <Eye className="h-4 w-4 mr-2" />
                                            View Approved Stories
                                        </a>
                                    </Button>
                                </div>
                            </div>
                        </div>

                        {pendingStories.length > 0 ? (
                            <div className="space-y-6">
                                {pendingStories.map((story, index) => (
                                    <Card key={index} className="border-l-4 border-l-blue-500 shadow-md hover:shadow-lg transition-shadow duration-200">
                                        <CardContent className="p-6">
                                            <div className="flex items-start justify-between mb-4">
                                                <div className="flex items-center space-x-4">
                                                    {story.image ? (
                                                        <img
                                                            src={story.image}
                                                            alt={story.student_name}
                                                            className="h-14 w-14 rounded-full object-cover ring-2 ring-blue-100 dark:ring-blue-900"
                                                        />
                                                    ) : (
                                                        <div className="h-14 w-14 rounded-full bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-900/30 dark:to-purple-900/30 flex items-center justify-center ring-2 ring-blue-100 dark:ring-blue-900">
                                                            <span className="text-blue-600 dark:text-blue-400 text-lg font-semibold">
                                                                {story.student_name.charAt(0).toUpperCase()}
                                                            </span>
                                                        </div>
                                                    )}
                                                    <div>
                                                        <h4 className="font-bold text-gray-900 dark:text-gray-100 text-lg">{story.student_name}</h4>
                                                        <p className="text-sm text-gray-600 dark:text-gray-400 flex items-center">
                                                            <Building className="h-4 w-4 mr-1" />
                                                            {story.company_name} • {story.role}
                                                        </p>
                                                        <p className="text-xs text-gray-500 dark:text-gray-500 flex items-center mt-1">
                                                            <Calendar className="h-3 w-3 mr-1" />
                                                            Submitted {new Date(story.created_at).toLocaleDateString('en-US', {
                                                                year: 'numeric',
                                                                month: 'short',
                                                                day: 'numeric',
                                                                hour: '2-digit',
                                                                minute: '2-digit'
                                                            })}
                                                        </p>
                                                    </div>
                                                </div>
                                                <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
                                                    Pending Review
                                                </Badge>
                                            </div>

                                            <Separator className="my-4" />

                                            <div className="space-y-4">
                                                <div>
                                                    <h5 className="font-semibold text-gray-900 dark:text-gray-100 mb-2 flex items-center">
                                                        <Star className="h-4 w-4 mr-2 text-yellow-500" />
                                                        {story.title}
                                                    </h5>
                                                    <p className="text-gray-700 dark:text-gray-300 text-sm leading-relaxed bg-gray-50 dark:bg-gray-800/50 p-3 rounded-lg">
                                                        {story.story}
                                                    </p>
                                                </div>

                                                <div>
                                                    <h6 className="font-semibold text-gray-900 dark:text-gray-100 mb-2 flex items-center">
                                                        <CheckCircle className="h-4 w-4 mr-2 text-green-500" />
                                                        Achievement & Outcome
                                                    </h6>
                                                    <p className="text-gray-700 dark:text-gray-300 text-sm bg-green-50 dark:bg-green-900/20 p-3 rounded-lg border-l-4 border-green-200 dark:border-green-800">
                                                        {story.outcome}
                                                    </p>
                                                </div>
                                            </div>

                                            <Separator className="my-4" />

                                            <div className="flex items-center justify-between">
                                                <div className="text-xs text-gray-500 dark:text-gray-400">
                                                    Story #{index + 1} • Ready for approval
                                                </div>
                                                <div className="flex gap-3">
                                                    <Button
                                                        onClick={() => {
                                                            if (confirm('Are you sure you want to approve this success story? It will be published on the homepage.')) {
                                                                router.post(route('admin.success-story.approve'), {
                                                                    story_index: index
                                                                });
                                                            }
                                                        }}
                                                        className="bg-green-600 hover:bg-green-700 text-white shadow-md hover:shadow-lg transition-all duration-200"
                                                        size="sm"
                                                    >
                                                        <CheckCircle className="h-4 w-4 mr-2" />
                                                        Approve & Publish
                                                    </Button>
                                                    <Button
                                                        onClick={() => {
                                                            if (confirm('Are you sure you want to reject this success story? This action cannot be undone.')) {
                                                                router.post(route('admin.success-story.reject'), {
                                                                    story_index: index
                                                                });
                                                            }
                                                        }}
                                                        variant="destructive"
                                                        size="sm"
                                                        className="shadow-md hover:shadow-lg transition-all duration-200"
                                                    >
                                                        <Trash2 className="h-4 w-4 mr-2" />
                                                        Reject
                                                    </Button>
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-12">
                                <div className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-2xl p-8">
                                    <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
                                    <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
                                        All Caught Up! 🎉
                                    </h3>
                                    <p className="text-gray-600 dark:text-gray-400 mb-4">
                                        No pending success stories to review at the moment.
                                    </p>
                                    <Button asChild variant="outline">
                                        <a href={route('admin.approved-success-stories')}>
                                            <Eye className="h-4 w-4 mr-2" />
                                            View Published Stories
                                        </a>
                                    </Button>
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}