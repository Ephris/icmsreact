<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class CompanyAdminAssignment extends Model
{
    protected $table = 'company_admin_assignments';
    protected $fillable = [
        'company_id',
        'user_id',
        'created_at',
        'updated_at'
    ];
    public function company()
    {
        return $this->belongsTo(Company::class, 'company_id', 'company_id');
    }

    public function user()
    {
        return $this->belongsTo(User::class, 'user_id', 'user_id');
    }
}