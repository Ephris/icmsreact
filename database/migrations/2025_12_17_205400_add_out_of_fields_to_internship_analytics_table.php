<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('internship_analytics', function (Blueprint $table) {
            $table->integer('advisor_score_out_of')->nullable();
            $table->integer('dept_head_score_out_of')->nullable();
        });
    }

    public function down(): void
    {
        Schema::table('internship_analytics', function (Blueprint $table) {
            $table->dropColumn([
                'advisor_score_out_of',
                'dept_head_score_out_of',
            ]);
        });
    }
};
