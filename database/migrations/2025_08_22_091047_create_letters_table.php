<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('letters', function (Blueprint $table) {
            $table->id('letter_id');
            $table->unsignedBigInteger('coordinator_id');
            $table->unsignedBigInteger('student_id');
            $table->string('title');
            $table->string('file_path');
            $table->enum('type', ['acceptance', 'completion', 'recommendation'])->default('acceptance');
            $table->enum('status', ['pending', 'sent', 'failed'])->default('pending');
            $table->timestamps();

            $table->foreign('coordinator_id')->references('user_id')->on('users')->onDelete('cascade');
            $table->foreign('student_id')->references('student_id')->on('students')->onDelete('cascade');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('letters');
    }
};