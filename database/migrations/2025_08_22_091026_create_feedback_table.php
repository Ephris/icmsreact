<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('feedback', function (Blueprint $table) {
            $table->id('feedback_id');
            $table->unsignedBigInteger('advisor_id');
            $table->unsignedBigInteger('student_id');
            $table->text('content');
            $table->integer('rating')->unsigned()->check('rating >= 1 AND rating <= 5');
            $table->timestamps();

            $table->foreign('advisor_id')->references('user_id')->on('users')->onDelete('cascade');
            $table->foreign('student_id')->references('student_id')->on('students')->onDelete('cascade');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('feedback');
    }
};