<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // For MySQL, we need to modify the enum column
        DB::statement("ALTER TABLE supervisor_assignments MODIFY status ENUM('active', 'inactive', 'completed') DEFAULT 'active'");
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Remove 'completed' from enum
        DB::statement("ALTER TABLE supervisor_assignments MODIFY status ENUM('active', 'inactive') DEFAULT 'active'");
    }
};
