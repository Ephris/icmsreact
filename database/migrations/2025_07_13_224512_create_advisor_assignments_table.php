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
    Schema::create('advisor_assignments', function (Blueprint $table) {
        $table->id('assignment_id');
        $table->unsignedBigInteger('advisor_id');
        $table->unsignedBigInteger('student_id');
        $table->timestamp('assigned_at')->useCurrent();
        $table->enum('status', ['active', 'inactive'])->default('active');
        $table->timestamps();
        $table->foreign('advisor_id')->references('user_id')->on('users')->onDelete('cascade');
        $table->foreign('student_id')->references('student_id')->on('students')->onDelete('cascade');
    });
}

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('advisor_assignments');
    }
};
