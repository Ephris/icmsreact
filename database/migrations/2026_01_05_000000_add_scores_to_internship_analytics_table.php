<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('internship_analytics', function (Blueprint $table) {
            $table->decimal('advisor_score', 5, 2)->nullable()->after('submitted_at');
            $table->decimal('dept_head_score', 5, 2)->nullable()->after('advisor_score');
            $table->decimal('final_score', 5, 2)->nullable()->after('dept_head_score');
            $table->text('advisor_evaluation')->nullable()->after('final_score');
            $table->text('dept_head_evaluation')->nullable()->after('advisor_evaluation');
        });
    }

    public function down(): void
    {
        Schema::table('internship_analytics', function (Blueprint $table) {
            $table->dropColumn([
                'advisor_score',
                'dept_head_score',
                'final_score',
                'advisor_evaluation',
                'dept_head_evaluation',
            ]);
        });
    }
};

