<?php

namespace Database\Seeders;

use App\Models\HomeContent;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class HomeContentSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        HomeContent::create([
            'title' => 'Discover Your Future with ICMS',
            'description' => 'The ultimate platform for internships and career opportunities. Connect with top companies, manage applications, and build your career path.',
            'about_title' => 'About ICMS',
            'about_description' => 'ICMS is a comprehensive Internship and Career Management System designed to bridge the gap between students, companies, and educational institutions. Our platform facilitates seamless internship placements, application tracking, and career development.',
            'phone' => '+251 911 123 456',
            'email' => 'info@amuniversity.edu.et',
            'location' => 'Ambo University, Ethiopia',
            'social_media' => json_encode([
                ['platform' => 'facebook', 'url' => 'https://facebook.com/ambouniversity'],
                ['platform' => 'twitter', 'url' => 'https://twitter.com/ambouniversity'],
                ['platform' => 'linkedin', 'url' => 'https://linkedin.com/school/ambouniversity'],
            ]),
            'carousel_images' => json_encode(['carousel1.jpg', 'carousel2.jpg', 'carousel3.jpg', 'carousel4.jpg']),
            'carousel_texts' => json_encode([
                'Empower your career with hands-on internships at top companies.',
                'Connect with industry leaders and gain real-world experience.',
                'Build your professional network and advance your skills.',
                'Transform your future with ICMS - where opportunities meet ambition.'
            ]),
            'background_color' => '#f8fafc',
            'postings_button_text' => 'View Postings',
            'about_us_button_text' => 'Learn More',
            'login_button_text' => 'Sign In',
        ]);
    }
}
