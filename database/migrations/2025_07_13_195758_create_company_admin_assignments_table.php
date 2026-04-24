<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateCompanyAdminAssignmentsTable extends Migration
{
    public function up()
    {
        Schema::create('company_admin_assignments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('company_id')
                  ->constrained('companies', 'company_id')
                  ->cascadeOnDelete();
            $table->foreignId('user_id')
                  ->constrained('users', 'user_id')
                  ->cascadeOnDelete();
            $table->timestamps();
        });
    }

    public function down()
    {
        Schema::dropIfExists('company_admin_assignments');
    }
}