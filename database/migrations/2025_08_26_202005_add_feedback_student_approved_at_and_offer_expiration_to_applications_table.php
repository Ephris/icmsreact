<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('applications', function (Blueprint $table) {
            $table->text('feedback')->nullable()->after('accepted_at');
            $table->timestamp('student_approved_at')->nullable()->after('feedback');
            $table->timestamp('offer_expiration')->nullable()->after('student_approved_at');
        });
    }

    public function down(): void
    {
        Schema::table('applications', function (Blueprint $table) {
            $table->dropColumn(['feedback', 'student_approved_at', 'offer_expiration']);
        });
    }
};