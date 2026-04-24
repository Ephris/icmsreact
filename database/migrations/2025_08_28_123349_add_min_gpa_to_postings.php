<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void {
        Schema::table('postings', function (Blueprint $table) {
            $table->double('min_gpa', 3, 2)->nullable()->after('experience_level'); // e.g., 3.0 for filtering applicants
        });
    }

    public function down(): void {
        Schema::table('postings', function (Blueprint $table) {
            $table->dropColumn('min_gpa');
        });
    }
};