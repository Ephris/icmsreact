<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('postings', function (Blueprint $table) {
            $table->id('posting_id');
            $table->unsignedBigInteger('company_id');
            $table->unsignedBigInteger('supervisor_id')->nullable();
            $table->string('title');
            $table->text('description');
            $table->enum('type', ['internship', 'career']);
            $table->string('industry');
            $table->string('location');
            $table->string('salary_range')->nullable();
            $table->date('start_date');
            $table->date('end_date')->nullable();
            $table->date('application_deadline');
            $table->text('requirements');
            $table->enum('work_type', ['remote', 'onsite', 'hybrid']);
            $table->text('benefits')->nullable();
            $table->enum('experience_level', ['entry', 'mid', 'senior']);
            $table->enum('status', ['open', 'closed', 'draft'])->default('draft');
            $table->timestamps();
            $table->softDeletes();

            $table->foreign('company_id')->references('company_id')->on('companies')->onDelete('cascade');
            $table->foreign('supervisor_id')->references('user_id')->on('users')->onDelete('set null');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('postings');
    }
};