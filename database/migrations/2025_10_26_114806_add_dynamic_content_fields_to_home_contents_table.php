<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('home_contents', function (Blueprint $table) {
            // Navigation and Header
            $table->string('header_height')->default('h-16'); // Header height control
            $table->json('navigation_menu')->nullable(); // Dynamic navigation menu
            
            // Hero Section
            $table->text('hero_subtitle')->nullable(); // Additional hero subtitle
            $table->string('hero_image_fit')->default('cover'); // Image fit: cover, contain, fill
            
            // About Us Section
            $table->text('about_image_text')->nullable(); // Text overlay on about image
            $table->json('statistics')->nullable(); // Dynamic statistics data
            $table->text('our_story_text')->nullable(); // Our story content
            $table->text('our_mission')->nullable(); // Our mission statement
            $table->text('our_vision')->nullable(); // Our vision statement
            
            // Why It Works Section
            $table->text('why_it_works_title')->nullable(); // Why it works title
            $table->text('why_it_works_subtitle')->nullable(); // Why it works subtitle
            $table->json('why_it_works_cards')->nullable(); // Why it works cards data
            
            // System Roles Section
            $table->text('system_roles_title')->nullable(); // System roles title
            $table->json('system_roles_data')->nullable(); // System roles data
            
            // How It Works Section
            $table->text('how_it_works_title')->nullable(); // How it works title
            $table->text('how_it_works_subtitle')->nullable(); // How it works subtitle
            $table->json('how_it_works_steps')->nullable(); // How it works steps
            
            // Role-Specific Workflows
            $table->text('workflows_title')->nullable(); // Workflows title
            $table->json('workflows_data')->nullable(); // Workflows data for all roles
            
            // Why Choose ICMS Section
            $table->text('why_choose_title')->nullable(); // Why choose title
            $table->text('why_choose_subtitle')->nullable(); // Why choose subtitle
            $table->json('why_choose_features')->nullable(); // Why choose features
            
            // Success Stories
            $table->text('success_stories_title')->nullable(); // Success stories title
            $table->text('success_stories_subtitle')->nullable(); // Success stories subtitle
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('home_contents', function (Blueprint $table) {
            $table->dropColumn([
                'header_height',
                'navigation_menu',
                'hero_subtitle',
                'hero_image_fit',
                'about_image_text',
                'statistics',
                'our_story_text',
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
            ]);
        });
    }
};