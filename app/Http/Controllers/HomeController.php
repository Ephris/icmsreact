<?php

namespace App\Http\Controllers;

use App\Models\HomeContent;
use App\Models\Posting;
use Illuminate\Support\Facades\Auth as AuthFacade;
use Illuminate\Http\Request;
use Inertia\Inertia;

class HomeController extends Controller
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

        $postings = Posting::with('company')
            ->where('status', 'open')
            ->orderBy('created_at', 'desc')
            ->take(6)
            ->get()
            ->map(function ($posting) {
                // Format company logo URL for frontend - same as companies section
                if ($posting->company && $posting->company->logo) {
                    $logo = $posting->company->logo;
                    // Only process if it's a raw path (not already a URL)
                    if (!str_starts_with($logo, 'http') && !str_starts_with($logo, '/media/')) {
                        // If it starts with /storage/, convert to /media/
                        if (str_starts_with($logo, '/storage/')) {
                            $posting->company->logo = str_replace('/storage/', '/media/', $logo);
                        } else {
                            // Raw path - use Storage::url and convert
                            $url = \Illuminate\Support\Facades\Storage::url($logo);
                            $posting->company->logo = str_replace('/storage/', '/media/', $url);
                        }
                    }
                }
                return $posting;
            });

        // Get system statistics for impact numbers
        $stats = [
            'companies' => \App\Models\Company::whereIn('status', ['active', 'approved'])->count(),
            'company_admins' => \App\Models\User::where('role', 'company_admin')->count(),
            'students' => \App\Models\Student::count(),
            'postings' => \App\Models\Posting::where('status', 'open')->count(),
            'departments' => \App\Models\Department::count(),
            'dept_heads' => \App\Models\User::where('role', 'dept_head')->count(),
            'advisors' => \App\Models\User::where('role', 'advisor')->count(),
            'supervisors' => \App\Models\User::where('role', 'supervisor')->count(),
        ];

        // Get registered companies for partner companies section
        $companies = \App\Models\Company::whereIn('status', ['active', 'approved'])
            ->select('company_id', 'name', 'industry', 'location', 'logo', 'website', 'description')
            ->orderBy('name')
            ->get()
            ->map(function ($company) {
                return [
                    'company_id' => $company->company_id,
                    'name' => $company->name,
                    'industry' => $company->industry,
                    'location' => $company->location,
                    'logo' => $company->logo ? \Illuminate\Support\Facades\Storage::url($company->logo) : null,
                    'website' => $company->website,
                    'description' => $company->description,
                ];
            });

        // Get approved success stories with student profile images
        $storiesFile = storage_path('app/success_stories.json');
        $approvedStories = [];
        if (file_exists($storiesFile)) {
            $allStories = json_decode(file_get_contents($storiesFile), true) ?: [];
            $approvedStories = array_filter($allStories, function($story) {
                return isset($story['status']) && $story['status'] === 'approved';
            });
            
            // Sort by created_at desc and limit to 6
            usort($approvedStories, function($a, $b) {
                return strtotime($b['created_at'] ?? '') - strtotime($a['created_at'] ?? '');
            });
            $approvedStories = array_slice($approvedStories, 0, 6);
            
            // Enhance stories with formatted data and images
            foreach ($approvedStories as &$story) {
                // Format the story image if exists
                if (isset($story['image']) && $story['image']) {
                    $imagePath = $story['image'];
                    if (!str_starts_with($imagePath, 'http://') && !str_starts_with($imagePath, 'https://')) {
                        // Use /media/ URL route
                        $story['image'] = url('/media/' . $imagePath);
                    }
                }
                
                // Get student profile image
                if (isset($story['student_id'])) {
                    $student = \App\Models\Student::with('user')->find($story['student_id']);
                    if ($student && $student->profile_image) {
                        $profileImagePath = $student->profile_image;
                        // Check if it's already a full URL
                        if (str_starts_with($profileImagePath, 'http://') || str_starts_with($profileImagePath, 'https://')) {
                            $story['profile_image'] = $profileImagePath;
                        } else {
                            $story['profile_image'] = url('/media/' . $profileImagePath);
                        }
                    } elseif ($student && $student->user) {
                        // Use default profile image if available
                        $story['profile_image'] = null;
                    }
                }
                
                // Map story to text for backward compatibility
                if (isset($story['story']) && !isset($story['text'])) {
                    $story['text'] = $story['story'];
                }
                
                // Map student_name to name for backward compatibility
                if (isset($story['student_name']) && !isset($story['name'])) {
                    $story['name'] = $story['student_name'];
                }
                
                // Map company_name to company for backward compatibility
                if (isset($story['company_name']) && !isset($story['company'])) {
                    $story['company'] = $story['company_name'];
                }
            }
        }

        // Always update homeContent with enhanced success stories (with profile images)
        if ($homeContent && !empty($approvedStories)) {
            $homeContent->success_stories = $approvedStories;
        } elseif ($homeContent && empty($homeContent->success_stories) && !empty($approvedStories)) {
            $homeContent->success_stories = $approvedStories;
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

        return Inertia::render('welcome', compact('homeContent', 'postings', 'companies', 'stats'));
    }

    public function postingRedirect(int $posting_id)
    {
        if (!AuthFacade::check()) {
            return redirect()->guest(route('login'));
        }

        // Prefer student posting detail for applying
        if (\Illuminate\Support\Facades\Route::has('student.posting.view')) {
            return redirect()->route('student.posting.view', ['posting_id' => $posting_id]);
        }

        // Fallback to dashboard if no specific view route
        return redirect()->route('dashboard');
    }
}
