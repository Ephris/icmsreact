<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->renameColumn('id', 'user_id');
            $table->string('username', 100)->unique()->after('user_id');
            $table->enum('role', [
                'student',
                'coordinator',
                'dept_head',
                'advisor',
                'company_admin',
                'supervisor',
                'admin'
            ])->default('student')->after('email');
            $table->string('phone', 20)->nullable()->after('role');
            $table->enum('status', ['active', 'inactive'])->default('active')->after('phone');
            $table->softDeletes();
        });
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->renameColumn('user_id', 'id');
            $table->dropColumn(['username', 'role', 'phone', 'status']);
            $table->dropSoftDeletes();
        });
    }
};