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
        Schema::create('internship_analytics', function (Blueprint $table) {
            $table->id('analytics_id');
            $table->unsignedBigInteger('student_id');
            $table->unsignedBigInteger('application_id');
            $table->unsignedBigInteger('supervisor_id');
            $table->unsignedBigInteger('posting_id');
            $table->string('posting_title');
            $table->string('company_name');
            $table->string('location');
            $table->string('industry');
            $table->string('work_type'); // remote, onsite, hybrid
            $table->date('start_date'); // from application_letter
            $table->date('end_date'); // from application_letter
            $table->integer('duration_days'); // calculated
            $table->unsignedBigInteger('form_id')->nullable(); // attached evaluation form
            $table->string('form_type')->nullable();
            $table->string('form_title')->nullable();
            $table->text('supervisor_comments')->nullable();
            $table->enum('status', ['pending', 'submitted', 'approved'])->default('pending');
            $table->timestamp('submitted_at')->nullable();
            $table->timestamps();

            $table->foreign('student_id')->references('student_id')->on('students')->onDelete('cascade');
            $table->foreign('application_id')->references('application_id')->on('applications')->onDelete('cascade');
            $table->foreign('supervisor_id')->references('user_id')->on('users')->onDelete('cascade');
            $table->foreign('posting_id')->references('posting_id')->on('postings')->onDelete('cascade');
            $table->foreign('form_id')->references('form_id')->on('forms')->onDelete('set null');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('internship_analytics');
    }
};
