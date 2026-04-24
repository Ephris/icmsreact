<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('forms', function (Blueprint $table) {
            $table->id('form_id');
            $table->unsignedBigInteger('advisor_id');
            $table->unsignedBigInteger('student_id')->nullable();
            $table->string('title');
            $table->string('file_path');
            $table->enum('type', ['evaluation', 'progress', 'other'])->default('other');
            $table->timestamps();

            $table->foreign('advisor_id')->references('user_id')->on('users')->onDelete('cascade');
            $table->foreign('student_id')->references('student_id')->on('students')->onDelete('set null');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('forms');
    }
};