<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('applications', function (Blueprint $table) {
            $table->id('application_id');
            $table->unsignedBigInteger('student_id');
            $table->unsignedBigInteger('posting_id');
            $table->text('resume');
            $table->text('cover_letter')->nullable();
            $table->text('portfolio')->nullable();
            $table->json('skills')->nullable();
            $table->json('certifications')->nullable();
            $table->enum('status', ['pending', 'approved', 'rejected', 'accepted', 'inactive'])->default('pending');
            $table->timestamp('accepted_at')->nullable();
            $table->timestamps();

            $table->foreign('student_id')->references('student_id')->on('students')->onDelete('cascade');
            $table->foreign('posting_id')->references('posting_id')->on('postings')->onDelete('cascade');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('applications');
    }
};