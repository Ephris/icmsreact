<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('advisor_assignments', function (Blueprint $table) {
            $table->unique(['advisor_id', 'student_id'], 'advisor_student_unique');
        });
    }

    public function down(): void
    {
        Schema::table('advisor_assignments', function (Blueprint $table) {
            $table->dropUnique('advisor_student_unique');
        });
    }
};