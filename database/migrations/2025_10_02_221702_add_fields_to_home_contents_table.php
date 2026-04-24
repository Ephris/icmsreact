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
            if (!Schema::hasColumn('home_contents', 'logo')) {
                $table->string('logo')->nullable()->after('background_image');
            }
            if (!Schema::hasColumn('home_contents', 'about_title')) {
                $table->string('about_title')->after('logo');
            }
            if (!Schema::hasColumn('home_contents', 'about_description')) {
                $table->text('about_description')->after('about_title');
            }
            if (!Schema::hasColumn('home_contents', 'inline_image')) {
                $table->string('inline_image')->nullable()->after('about_description');
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('home_contents', function (Blueprint $table) {
            $table->dropColumn(['logo', 'about_title', 'about_description', 'inline_image']);
        });
    }
};
