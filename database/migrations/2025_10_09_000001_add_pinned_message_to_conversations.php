<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (!Schema::hasColumn('conversations', 'pinned_message_id')) {
            Schema::table('conversations', function (Blueprint $table) {
                $table->unsignedBigInteger('pinned_message_id')->nullable()->after('last_message_id');
                $table->index(['pinned_message_id']);
            });
        }
    }

    public function down(): void
    {
        if (Schema::hasColumn('conversations', 'pinned_message_id')) {
            Schema::table('conversations', function (Blueprint $table) {
                $table->dropColumn('pinned_message_id');
            });
        }
    }
};


