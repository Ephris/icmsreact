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
        Schema::create('application_letters', function (Blueprint $table) {
            $table->id('letter_id');
            $table->unsignedBigInteger('department_id');
            $table->unsignedBigInteger('student_id');
            $table->string('ref_number');
            $table->date('start_date');
            $table->date('end_date');
            $table->string('file_path');
            $table->enum('status', ['generated', 'sent', 'viewed'])->default('generated');
            $table->timestamp('sent_at')->nullable();
            $table->timestamp('viewed_at')->nullable();
            $table->unsignedBigInteger('generated_by');
            $table->timestamps();

            $table->foreign('department_id')->references('department_id')->on('departments');
            $table->foreign('student_id')->references('student_id')->on('students');
            $table->foreign('generated_by')->references('user_id')->on('users');
            $table->unique(['student_id', 'ref_number']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('application_letters');
    }
};
