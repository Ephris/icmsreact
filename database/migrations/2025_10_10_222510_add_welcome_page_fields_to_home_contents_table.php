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
            $table->string('phone')->nullable();
            $table->string('email')->nullable();
            $table->string('location')->nullable();
            $table->json('social_media')->nullable(); // array of objects with platform and url
            $table->json('carousel_images')->nullable(); // array of image paths
            $table->json('carousel_texts')->nullable(); // array of texts corresponding to images
            $table->string('background_color')->nullable();
            $table->string('postings_button_text')->default('Postings');
            $table->string('about_us_button_text')->default('About Us');
            $table->string('login_button_text')->default('Login');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('home_contents', function (Blueprint $table) {
            $table->dropColumn(['phone', 'email', 'location', 'social_media', 'carousel_images', 'carousel_texts', 'background_color', 'postings_button_text', 'about_us_button_text', 'login_button_text']);
        });
    }
};
