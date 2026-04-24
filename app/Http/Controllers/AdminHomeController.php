<?php

namespace App\Http\Controllers;

use App\Models\HomeContent;
use App\Models\Student;
use App\Models\InternshipAnalytics;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;
use Carbon\Carbon;
use App\Services\NotificationService;

class AdminHomeController extends Controller
{
    public function index()
    {
        $homeContent = HomeContent::first();

        // If no HomeContent exists, create a default one
        if (!$homeContent) {
            $homeContent = HomeContent::create([
                'title' => 'Welcome to ICMS',
                'description' => 'Internship and Career Management System',
                'about_title' => 'About Us',
                'about_description' => 'Your gateway to internships and career opportunities',
            ]);
        }

        // Get pending success stories
        $storiesFile = storage_path('app/success_stories.json');
        $pendingStories = [];
        if (file_exists($storiesFile)) {
            $allStories = json_decode(file_get_contents($storiesFile), true) ?: [];
            $pendingStories = array_filter($allStories, fn($story) => $story['status'] === 'pending');
        }

        // Get companies with logos for trusted by section
        $companies = \App\Models\Company::where('status', 'active')
            ->whereNotNull('logo')
            ->select('company_id', 'name', 'logo')
            ->orderBy('name')
            ->get()
            ->map(function ($company) {
                return [
                    'company_id' => $company->company_id,
                    'name' => $company->name,
                    'logo' => $company->logo ? \Illuminate\Support\Facades\Storage::url($company->logo) : null,
                ];
            });

        // Update trusted_logos in home content with company logos
        if ($companies->count() > 0) {
            $trustedLogos = $companies->pluck('logo')->filter()->values()->toArray();
            $homeContent->update(['trusted_logos' => $trustedLogos]);
        }

        // Format carousel images URLs for frontend - use /media/ route for better compatibility
        if ($homeContent && $homeContent->carousel_images) {
            $formattedCarouselImages = array_map(function ($imagePath) {
                if (!$imagePath) return null;
                // Convert storage path to /media/ URL
                $url = \Illuminate\Support\Facades\Storage::url($imagePath);
                // Replace /storage/ with /media/ for the custom route
                return str_replace('/storage/', '/media/', $url);
            }, $homeContent->carousel_images);
            $homeContent->carousel_images = array_values(array_filter($formattedCarouselImages, fn($img) => $img !== null));
        }

        // Format other image URLs - use /media/ route
        if ($homeContent) {
            if ($homeContent->background_image) {
                $url = \Illuminate\Support\Facades\Storage::url($homeContent->background_image);
                $homeContent->background_image = str_replace('/storage/', '/media/', $url);
            }
            if ($homeContent->logo) {
                $url = \Illuminate\Support\Facades\Storage::url($homeContent->logo);
                $homeContent->logo = str_replace('/storage/', '/media/', $url);
            }
            if ($homeContent->inline_image) {
                $url = \Illuminate\Support\Facades\Storage::url($homeContent->inline_image);
                $homeContent->inline_image = str_replace('/storage/', '/media/', $url);
            }
            if ($homeContent->our_story_image) {
                $url = \Illuminate\Support\Facades\Storage::url($homeContent->our_story_image);
                $homeContent->our_story_image = str_replace('/storage/', '/media/', $url);
            }
        }

        return Inertia::render('admin/homepage', [
            'homeContent' => $homeContent,
            'pendingStories' => array_values($pendingStories),
            'companies' => $companies,
            'success' => session('success'),
            'error' => session('error'),
        ]);
    }

    public function update(Request $request)
    {
        $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'required|string',
            'about_title' => 'required|string|max:255',
            'about_description' => 'required|string',
            'phone' => 'nullable|string|max:255',
            'email' => 'nullable|email|max:255',
            'location' => 'nullable|string|max:255',
            'social_media' => 'nullable|string', // JSON string from form
            'carousel_texts' => 'nullable|string', // JSON string from form
            'background_color' => 'nullable|string|max:7',
            'postings_button_text' => 'nullable|string|max:255',
            'about_us_button_text' => 'nullable|string|max:255',
            'login_button_text' => 'nullable|string|max:255',
            'background_image' => 'nullable|image|mimes:jpeg,png,jpg,gif,webp|max:5120',
            'logo' => 'nullable|image|mimes:jpeg,png,jpg,gif,webp|max:2048',
            'inline_image' => 'nullable|image|mimes:jpeg,png,jpg,gif,webp|max:5120',
            'carousel_images' => 'nullable|array',
            'carousel_images.*' => 'nullable|image|mimes:jpeg,png,jpg,gif,webp|max:5120',
            'trusted_logos' => 'nullable|array',
            'trusted_logos.*' => 'nullable|image|mimes:jpeg,png,jpg,gif,svg,webp|max:2048',
            'footer_text' => 'nullable|string',
            'footer_links' => 'nullable|string',
            'success_stories' => 'nullable|string', // JSON string from form
            // New dynamic content validation
            'header_height' => 'nullable|string|max:50',
            'navigation_menu' => 'nullable|string',
            'hero_subtitle' => 'nullable|string',
            'hero_image_fit' => 'nullable|string|in:cover,contain,fill',
            'about_image_text' => 'nullable|string',
            'statistics' => 'nullable|string',
            'our_story_text' => 'nullable|string',
            'our_story_image' => 'nullable|image|mimes:jpeg,png,jpg,gif,webp|max:5120',
            'our_mission' => 'nullable|string',
            'our_vision' => 'nullable|string',
            'why_it_works_title' => 'nullable|string',
            'why_it_works_subtitle' => 'nullable|string',
            'why_it_works_cards' => 'nullable|string',
            'system_roles_title' => 'nullable|string',
            'system_roles_data' => 'nullable|string',
            'how_it_works_title' => 'nullable|string',
            'how_it_works_subtitle' => 'nullable|string',
            'how_it_works_steps' => 'nullable|string',
            'workflows_title' => 'nullable|string',
            'workflows_data' => 'nullable|string',
            'why_choose_title' => 'nullable|string',
            'why_choose_subtitle' => 'nullable|string',
            'why_choose_features' => 'nullable|string',
            'success_stories_title' => 'nullable|string',
            'success_stories_subtitle' => 'nullable|string',
        ]);

        $homeContent = HomeContent::first() ?? new HomeContent();

        // Prepare basic data
        $data = $request->only([
            'title', 'description', 'about_title', 'about_description',
            'phone', 'email', 'location', 'background_color', 
            'postings_button_text', 'about_us_button_text', 'login_button_text', 'footer_text',
            // New dynamic content fields
            'header_height', 'hero_subtitle', 'hero_image_fit', 'about_image_text',
            'our_story_text', 'our_mission', 'our_vision', 'why_it_works_title',
            'why_it_works_subtitle', 'system_roles_title', 'how_it_works_title',
            'how_it_works_subtitle', 'workflows_title', 'why_choose_title',
            'why_choose_subtitle', 'success_stories_title', 'success_stories_subtitle'
        ]);

        // Handle JSON fields
        if ($request->has('footer_links')) {
            $links = $request->footer_links;
            if (is_string($links)) {
                $data['footer_links'] = json_decode($links, true);
            } else {
                $data['footer_links'] = $links;
            }
        }

        if ($request->has('social_media')) {
            $socialMedia = $request->social_media;
            if (is_string($socialMedia)) {
                $data['social_media'] = json_decode($socialMedia, true);
            } else {
                $data['social_media'] = $socialMedia;
            }
        }

        if ($request->has('carousel_texts')) {
            $carouselTexts = $request->carousel_texts;
            if (is_string($carouselTexts)) {
                $data['carousel_texts'] = json_decode($carouselTexts, true);
            } else {
                $data['carousel_texts'] = $carouselTexts;
            }
        }

        if ($request->has('success_stories')) {
            $successStories = $request->success_stories;
            if (is_string($successStories)) {
                $data['success_stories'] = json_decode($successStories, true);
            } else {
                $data['success_stories'] = $successStories;
            }
        }

        // Handle new JSON fields
        $jsonFields = [
            'navigation_menu', 'statistics', 'why_it_works_cards', 'system_roles_data',
            'how_it_works_steps', 'workflows_data', 'why_choose_features'
        ];

        foreach ($jsonFields as $field) {
            if ($request->has($field)) {
                $value = $request->$field;
                if (is_string($value)) {
                    $data[$field] = json_decode($value, true);
                } else {
                    $data[$field] = $value;
                }
            }
        }

        // Handle carousel images - preserve existing and add new, handle deletions
        $existingCarouselImages = $homeContent->carousel_images ?? [];
        $carouselImages = $existingCarouselImages; // Start with existing images
        
        // Track which indices have new files or are being deleted
        $updatedIndices = [];
        
        // Handle new file uploads
        if ($request->hasFile('carousel_images')) {
            foreach ($request->file('carousel_images') as $index => $file) {
                if ($file && $file->isValid()) {
                    // Delete old file if it exists
                    if (isset($carouselImages[$index]) && $carouselImages[$index]) {
                        try {
                            \Illuminate\Support\Facades\Storage::disk('public')->delete($carouselImages[$index]);
                        } catch (\Exception $e) {
                            \Illuminate\Support\Facades\Log::warning('Failed to delete old carousel image', [
                                'path' => $carouselImages[$index],
                                'error' => $e->getMessage(),
                            ]);
                        }
                    }
                    $carouselImages[$index] = $file->store('carousel', 'public');
                    $updatedIndices[] = $index;
                }
            }
        }
        
        // Handle explicit deletions (when carousel_images_delete is sent)
        if ($request->has('carousel_images_delete')) {
            $deletedIndices = is_array($request->carousel_images_delete) 
                ? $request->carousel_images_delete 
                : (is_string($request->carousel_images_delete) ? json_decode($request->carousel_images_delete, true) : []);
            
            if (is_array($deletedIndices)) {
                foreach ($deletedIndices as $index) {
                    $index = (int)$index;
                    if (isset($carouselImages[$index]) && $carouselImages[$index]) {
                        // Delete the old file from storage
                        try {
                            \Illuminate\Support\Facades\Storage::disk('public')->delete($carouselImages[$index]);
                        } catch (\Exception $e) {
                            \Illuminate\Support\Facades\Log::warning('Failed to delete carousel image', [
                                'path' => $carouselImages[$index],
                                'error' => $e->getMessage(),
                            ]);
                        }
                        $carouselImages[$index] = null;
                    }
                }
            }
        }
        
        // Ensure we have exactly 4 slots, fill empty ones with null
        $finalCarouselImages = [];
        for ($i = 0; $i < 4; $i++) {
            $finalCarouselImages[$i] = $carouselImages[$i] ?? null;
        }
        $data['carousel_images'] = $finalCarouselImages;


        // Handle single images - only update if new file is uploaded
        if ($request->hasFile('background_image') && $request->file('background_image')->isValid()) {
            $data['background_image'] = $request->file('background_image')->store('home', 'public');
        } elseif ($homeContent->background_image) {
            $data['background_image'] = $homeContent->background_image;
        }
        
        if ($request->hasFile('logo') && $request->file('logo')->isValid()) {
            $data['logo'] = $request->file('logo')->store('home', 'public');
        } elseif ($homeContent->logo) {
            $data['logo'] = $homeContent->logo;
        }
        
        if ($request->hasFile('inline_image') && $request->file('inline_image')->isValid()) {
            $data['inline_image'] = $request->file('inline_image')->store('home', 'public');
        } elseif ($homeContent->inline_image) {
            $data['inline_image'] = $homeContent->inline_image;
        }
        
        if ($request->hasFile('our_story_image') && $request->file('our_story_image')->isValid()) {
            $data['our_story_image'] = $request->file('our_story_image')->store('home', 'public');
        } elseif ($homeContent->our_story_image) {
            $data['our_story_image'] = $homeContent->our_story_image;
        }

        try {
            $homeContent->fill($data)->save();
            
            // Clear any potential cache to ensure fresh data
            \Illuminate\Support\Facades\Cache::forget('home_content');
            
            return redirect()->route('admin.homepage.index')->with('success', 'Homepage content updated successfully. Changes will be visible on the homepage immediately.');
        } catch (\Exception $e) {
            \Illuminate\Support\Facades\Log::error('Failed to update homepage content', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);
            return redirect()->back()->with('error', 'Failed to update homepage content: ' . $e->getMessage());
        }
    }

    public function approveSuccessStory(Request $request)
    {
        $request->validate([
            'story_index' => 'required|integer|min:0',
        ]);

        $storiesFile = storage_path('app/success_stories.json');
        if (!file_exists($storiesFile)) {
            return redirect()->back()->with('error', 'No success stories found.');
        }

        $stories = json_decode(file_get_contents($storiesFile), true) ?: [];
        $storyIndex = $request->story_index;

        // Find the original index in the full stories array
        $pendingIndices = array_keys(array_filter($stories, fn($story) => $story['status'] === 'pending'));
        if (!isset($pendingIndices[$storyIndex])) {
            return redirect()->back()->with('error', 'Success story not found.');
        }
        $originalIndex = $pendingIndices[$storyIndex];

        try {
            // Update story status to approved
            $stories[$originalIndex]['status'] = 'approved';
            $stories[$originalIndex]['approved_at'] = now()->toISOString();
            $stories[$originalIndex]['approved_by'] = Auth::user()->user_id;

            // Save updated stories
            file_put_contents($storiesFile, json_encode($stories, JSON_PRETTY_PRINT));

            // Add to home content success stories
            $homeContent = \App\Models\HomeContent::first();
            if (!$homeContent) {
                // Create home content if it doesn't exist
                $homeContent = \App\Models\HomeContent::create(['success_stories' => []]);
            }

            $currentStories = $homeContent->success_stories ?? [];
            $approvedStory = $stories[$originalIndex];

            $successStory = [
                'name' => $approvedStory['student_name'] ?? null,
                'role' => $approvedStory['student_role'] ?? null,
                'role_position' => $approvedStory['position'] ?? null,
                'text' => $approvedStory['story'] ?? null,
                'image' => $approvedStory['image'] ?? null,
                'profile_image' => $approvedStory['profile_image'] ?? null,
                'company' => $approvedStory['company_name'] ?? null,
                'achievements' => $approvedStory['achievements'] ?? null,
                'outcome' => $approvedStory['outcome'] ?? null,
                'experiences' => $approvedStory['experiences'] ?? null,
            ];

            $currentStories[] = $successStory;
            $homeContent->update(['success_stories' => $currentStories]);

            Log::info('Success story approved', [
                'story_index' => $storyIndex,
                'approved_by' => Auth::user()->user_id,
            ]);

            return redirect()->route('admin.homepage.index')->with('success', 'Success story approved and added to homepage.');
        } catch (\Exception $e) {
            Log::error('Failed to approve success story', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);

            return redirect()->back()->with('error', 'Failed to approve success story: ' . $e->getMessage());
        }

        // Notify student about approval (outside try to avoid failing the approval if notification fails)
        if (isset($stories[$originalIndex]['student_id'])) {
            try {
                $student = \App\Models\Student::find($stories[$originalIndex]['student_id']);
                if ($student && $student->user) {
                    \App\Services\NotificationService::notifyStudentSuccessStoryStatus(
                        $student->user,
                        $stories[$originalIndex]['title'] ?? 'Success Story',
                        'approved'
                    );
                }
            } catch (\Exception $e) {
                Log::error('Failed to notify student about success story approval', [
                    'error' => $e->getMessage(),
                    'student_id' => $stories[$originalIndex]['student_id'],
                ]);
            }
        }
    }

    public function rejectSuccessStory(Request $request)
    {
        $request->validate([
            'story_index' => 'required|integer|min:0',
        ]);

        $storiesFile = storage_path('app/success_stories.json');
        if (!file_exists($storiesFile)) {
            return redirect()->back()->with('error', 'No success stories found.');
        }

        $stories = json_decode(file_get_contents($storiesFile), true) ?: [];
        $storyIndex = $request->story_index;

        // Find the original index in the full stories array
        $pendingIndices = array_keys(array_filter($stories, fn($story) => $story['status'] === 'pending'));
        if (!isset($pendingIndices[$storyIndex])) {
            return redirect()->back()->with('error', 'Success story not found.');
        }
        $originalIndex = $pendingIndices[$storyIndex];

        try {
            // Update story status to rejected
            $stories[$originalIndex]['status'] = 'rejected';
            $stories[$originalIndex]['rejected_at'] = now()->toISOString();
            $stories[$originalIndex]['rejected_by'] = Auth::user()->user_id;

            // Save updated stories
            file_put_contents($storiesFile, json_encode($stories, JSON_PRETTY_PRINT));

            Log::info('Success story rejected', [
                'story_index' => $storyIndex,
                'rejected_by' => Auth::user()->user_id,
            ]);

            return redirect()->route('admin.homepage.index')->with('success', 'Success story rejected.');
        } catch (\Exception $e) {
            Log::error('Failed to reject success story', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);

            return redirect()->back()->with('error', 'Failed to reject success story: ' . $e->getMessage());
        }

        // Notify student about rejection (outside try to avoid failing the rejection if notification fails)
        if (isset($stories[$originalIndex]['student_id'])) {
            try {
                $student = \App\Models\Student::find($stories[$originalIndex]['student_id']);
                if ($student && $student->user) {
                    \App\Services\NotificationService::notifyStudentSuccessStoryStatus(
                        $student->user,
                        $stories[$originalIndex]['title'] ?? 'Success Story',
                        'rejected'
                    );
                }
            } catch (\Exception $e) {
                Log::error('Failed to notify student about success story rejection', [
                    'error' => $e->getMessage(),
                    'student_id' => $stories[$originalIndex]['student_id'],
                ]);
            }
        }
    }

    public function approvedSuccessStories()
    {
        // Get approved success stories from home content
        $homeContent = HomeContent::first();
        $approvedStories = $homeContent ? ($homeContent->success_stories ?? []) : [];

        return Inertia::render('admin/approved-success-stories', [
            'approvedStories' => $approvedStories,
            'success' => session('success'),
            'error' => session('error'),
        ]);
    }

    public function deleteSuccessStory(Request $request)
    {
        $request->validate([
            'index' => 'required|integer|min:0',
        ]);

        $homeContent = HomeContent::first();
        if (!$homeContent) {
            return redirect()->back()->with('error', 'No homepage content found.');
        }

        $stories = $homeContent->success_stories ?? [];
        $index = $request->index;

        if (!isset($stories[$index])) {
            return redirect()->back()->with('error', 'Success story not found.');
        }

        // Remove the story from the array and reindex
        unset($stories[$index]);
        $stories = array_values($stories);

        $homeContent->update(['success_stories' => $stories]);

        return redirect()->back()->with('success', 'Success story deleted successfully.');
    }

    public function deactivations()
    {
        if (Auth::user()->role !== 'admin') {
            abort(403, 'Unauthorized');
        }

        $students = Student::with(['user', 'department'])
            ->whereHas('user', fn($q) => $q->where('role', 'student'))
            ->whereHas('applications', fn($q) => $q->where('status', 'completed')->whereHas('analytics', fn($a) => $a->whereNotNull('final_score')))
            ->get()
            ->map(function ($student) {
                $latestAnalytics = InternshipAnalytics::where('student_id', $student->student_id)
                    ->whereNotNull('final_score')
                    ->orderByDesc('submitted_at')
                    ->first();

                return [
                    'student_id' => $student->student_id,
                    'name' => $student->user->name,
                    'email' => $student->user->email,
                    'department' => $student->department?->name,
                    'final_score' => $latestAnalytics?->final_score,
                    'advisor_score' => $latestAnalytics?->advisor_score,
                    'dept_head_score' => $latestAnalytics?->dept_head_score,
                    'account_deactivation_date' => $student->user->account_deactivation_date,
                    'status' => $student->user->status,
                    'analytics_id' => $latestAnalytics?->analytics_id,
                ];
            });

        return Inertia::render('admin/deactivations', [
            'students' => $students,
            'success' => session('success'),
            'error' => session('error'),
        ]);
    }

    public function scheduleDeactivation(Request $request, $student_id)
    {
        if (Auth::user()->role !== 'admin') {
            abort(403, 'Unauthorized');
        }

        $student = Student::with('user')->findOrFail($student_id);
        $user = $student->user;
        if ($user->role !== 'student') {
            return redirect()->back()->with('error', 'Only student accounts can be scheduled for deactivation.');
        }

        // Check if both scores are submitted
        $analytics = InternshipAnalytics::where('student_id', $student->student_id)
            ->whereNotNull('advisor_score')
            ->whereNotNull('dept_head_score')
            ->first();

        if (!$analytics) {
            return redirect()->back()->with('error', 'Cannot schedule deactivation. Both advisor and department head scores must be submitted first.');
        }

        $deactivationDate = Carbon::now()->addDays(30)->toDateString();
        $user->account_deactivation_date = $deactivationDate;
        $user->save();

        NotificationService::notifyStudentAccountDeactivationWarning($user);

        return redirect()->back()->with('success', 'Deactivation scheduled in 30 days.');
    }
}
