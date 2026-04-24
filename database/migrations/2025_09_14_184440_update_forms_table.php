<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('forms', function (Blueprint $table) {
            $table->unsignedBigInteger('supervisor_id')->nullable()->after('advisor_id');
            $table->foreign('supervisor_id')->references('user_id')->on('users')->onDelete('cascade');
            $table->enum('status', ['pending', 'submitted', 'approved', 'rejected'])->default('pending')->after('type');
            $table->text('comments')->nullable()->after('status');
            $table->softDeletes();
        });
    }

    public function down(): void
    {
        Schema::table('forms', function (Blueprint $table) {
            $table->dropForeign(['supervisor_id']);
            $table->dropColumn(['supervisor_id', 'status', 'comments']);
            $table->dropSoftDeletes();
        });
    }
};