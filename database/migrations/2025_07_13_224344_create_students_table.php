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
    Schema::create('students', function (Blueprint $table) {
        $table->id('student_id');
        $table->unsignedBigInteger('user_id')->unique();
        $table->unsignedBigInteger('department_id');
        $table->string('first_name', 100)->notNull();
        $table->string('last_name', 100)->notNull();
        $table->float('cgpa')->nullable();
        $table->string('resume_path', 255)->nullable();
        $table->string('profile_image_path', 255)->nullable();
        $table->string('portfolio_url', 255)->nullable();
        $table->json('skills')->nullable();
        $table->json('certifications')->nullable();
        $table->string('year_of_study', 50)->nullable();
        $table->text('bio')->nullable();
        $table->unsignedBigInteger('accepted_application_id')->nullable();
        $table->string('linkedin_url', 255)->nullable();
        $table->timestamps();
        $table->foreign('user_id')->references('user_id')->on('users')->onDelete('cascade');
        $table->foreign('department_id')->references('department_id')->on('departments')->onDelete('cascade');
        
    });
}

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('students');
    }
};
