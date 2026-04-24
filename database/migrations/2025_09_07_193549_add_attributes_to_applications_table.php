<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class AddAttributesToApplicationsTable extends Migration
{
    public function up()
    {
        Schema::table('applications', function (Blueprint $table) {
            $table->timestamp('submitted_at')->nullable()->after('offer_expiration');
            $table->string('source')->nullable()->after('submitted_at'); // e.g., 'web', 'mobile'
            $table->bigInteger('last_updated_by')->unsigned()->nullable()->after('source');
            $table->foreign('last_updated_by')->references('user_id')->on('users')->onDelete('set null');
        });
    }

    public function down()
    {
        Schema::table('applications', function (Blueprint $table) {
            $table->dropForeign(['last_updated_by']);
            $table->dropColumn(['submitted_at', 'source', 'last_updated_by']);
        });
    }
}