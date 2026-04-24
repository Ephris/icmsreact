<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class HomeContent extends Model
{
    protected $fillable = [
        'title',
        'description',
        'background_image',
        'logo',
        'about_title',
        'about_description',
        'inline_image',
        'phone',
        'email',
        'location',
        'social_media',
        'carousel_images',
        'carousel_texts',
        'background_color',
        'postings_button_text',
        'about_us_button_text',
        'login_button_text',
        'trusted_logos',
        'footer_text',
        'footer_links',
        'success_stories',
        // New dynamic content fields
        'header_height',
        'navigation_menu',
        'hero_subtitle',
        'hero_image_fit',
        'about_image_text',
        'statistics',
        'our_story_text',
        'our_story_image',
        'our_mission',
        'our_vision',
        'why_it_works_title',
        'why_it_works_subtitle',
        'why_it_works_cards',
        'system_roles_title',
        'system_roles_data',
        'how_it_works_title',
        'how_it_works_subtitle',
        'how_it_works_steps',
        'workflows_title',
        'workflows_data',
        'why_choose_title',
        'why_choose_subtitle',
        'why_choose_features',
        'success_stories_title',
        'success_stories_subtitle',
    ];

    protected $casts = [
        'social_media' => 'array',
        'carousel_images' => 'array',
        'carousel_texts' => 'array',
        'trusted_logos' => 'array',
        'footer_links' => 'array',
        'success_stories' => 'array',
        // New dynamic content casts
        'navigation_menu' => 'array',
        'statistics' => 'array',
        'why_it_works_cards' => 'array',
        'system_roles_data' => 'array',
        'how_it_works_steps' => 'array',
        'workflows_data' => 'array',
        'why_choose_features' => 'array',
    ];
}
