<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('company_supervisor_assignments', function (Blueprint $table) {
            $table->id('assignment_id');
            $table->foreignId('supervisor_id')->constrained('users', 'user_id')->onDelete('cascade');
            $table->foreignId('company_id')->constrained('companies', 'company_id')->onDelete('cascade');
            $table->timestamp('assigned_at')->useCurrent();
            $table->enum('status', ['active', 'inactive'])->default('active');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('company_supervisor_assignments');
    }
};