<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void {
        Schema::table('students', function (Blueprint $table) {
            $table->json('preferred_locations')->nullable()->after('notice_period'); // JSON array of cities for matching
            $table->year('graduation_year')->nullable()->after('preferred_locations'); // For expiration/post-grad filters
        });
    }

    public function down(): void {
        Schema::table('students', function (Blueprint $table) {
            $table->dropColumn(['preferred_locations', 'graduation_year']);
        });
    }
};