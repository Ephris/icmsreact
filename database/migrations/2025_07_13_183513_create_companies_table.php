<?php

use Illuminate\Database\Migrations\Migration; // Import the Migration class to define database schema changes
use Illuminate\Database\Schema\Blueprint; // Import Blueprint to define table structure
use Illuminate\Support\Facades\Schema; // Import Schema facade to interact with database schema

class CreateCompaniesTable extends Migration
{
    public function up()
    {
        Schema::create('companies', function (Blueprint $table) { // Create a new 'companies' table
            $table->id('company_id'); // Define 'company_id' as the primary key (auto-incrementing bigint)
            $table->foreignId('user_id') // Define 'user_id' as a foreign key referencing 'users.user_id'
                ->nullable() // Allow null values (no admin assigned yet)
                ->constrained('users', 'user_id') // Constrain to 'users' table, referencing 'user_id' column
                ->cascadeOnDelete(); // Delete company if associated user is deleted
            $table->string('name', 255)->notNull(); // Define 'name' as a string (max 255 chars), required field
            $table->text('description')->nullable(); // Define 'description' as text, optional field
            $table->string('industry', 100)->nullable(); // Define 'industry' as string (max 100 chars), optional
            $table->string('location', 255)->nullable(); // Define 'location' as string (max 255 chars), optional
            $table->string('website', 255)->nullable(); // Define 'website' as string (max 255 chars), optional
            $table->string('company_size', 100)->nullable(); // Define 'company_size' as string (max 100 chars), optional
            $table->year('founded_year')->nullable(); // Define 'founded_year' as year type, optional
            $table->string('contact_email', 255)->nullable(); // Define 'contact_email' as string (max 255 chars), optional
            $table->string('linkedin_url', 255)->nullable(); // Define 'linkedin_url' as string (max 255 chars), optional
            $table->enum('status', ['pending', 'approved'])->default('pending'); // Define 'status' as enum with default 'pending'
            $table->softDeletes(); // Add soft delete column (deleted_at) for soft deletion
            $table->timestamps(); // Add 'created_at' and 'updated_at' timestamps
        });
    }

    public function down()
    {
        Schema::dropIfExists('companies'); // Drop the 'companies' table if migration is rolled back
    }
}