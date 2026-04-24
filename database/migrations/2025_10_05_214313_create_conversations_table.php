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
        Schema::dropIfExists('conversations');
        Schema::create('conversations', function (Blueprint $table) {
            $table->id();
            $table->boolean('is_group')->default(false);
            $table->string('title')->nullable();
            $table->unsignedBigInteger('created_by_id')->index();
            $table->unsignedBigInteger('last_message_id')->nullable();
            $table->timestamps();
            $table->softDeletes();

            $table->index(['is_group']);
            $table->index(['last_message_id']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('conversations');
    }
};
