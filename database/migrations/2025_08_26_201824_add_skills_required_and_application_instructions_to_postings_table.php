<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('postings', function (Blueprint $table) {
            $table->json('skills_required')->nullable()->after('experience_level');
            $table->text('application_instructions')->nullable()->after('skills_required');
        });
    }

    public function down(): void
    {
        Schema::table('postings', function (Blueprint $table) {
            $table->dropColumn(['skills_required', 'application_instructions']);
        });
    }
};