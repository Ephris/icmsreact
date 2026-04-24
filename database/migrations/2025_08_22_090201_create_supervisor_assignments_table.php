<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('supervisor_assignments', function (Blueprint $table) {
            $table->id('assignment_id');
            $table->unsignedBigInteger('supervisor_id');
            $table->unsignedBigInteger('student_id');
            $table->unsignedBigInteger('posting_id');
            $table->timestamp('assigned_at')->useCurrent();
            $table->enum('status', ['active', 'inactive'])->default('active');
            $table->timestamps();

            $table->foreign('supervisor_id')->references('user_id')->on('users')->onDelete('cascade');
            $table->foreign('student_id')->references('student_id')->on('students')->onDelete('cascade');
            $table->foreign('posting_id')->references('posting_id')->on('postings')->onDelete('cascade');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('supervisor_assignments');
    }
};