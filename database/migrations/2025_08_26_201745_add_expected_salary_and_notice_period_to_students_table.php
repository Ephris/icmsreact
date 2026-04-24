<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('students', function (Blueprint $table) {
            $table->string('expected_salary', 255)->nullable()->after('linkedin_url');
            $table->string('notice_period', 50)->nullable()->after('expected_salary');
        });
    }

    public function down(): void
    {
        Schema::table('students', function (Blueprint $table) {
            $table->dropColumn(['expected_salary', 'notice_period']);
        });
    }
};