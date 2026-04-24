<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Company extends Model
{
    use SoftDeletes;

    protected $primaryKey = 'company_id';
    protected $fillable = [
        'name',
        'description',
        'industry',
        'location',
        'website',
        'company_size',
        'founded_year',
        'contact_email',
        'linkedin_url',
        'status',
        'logo',
    ];
    protected $dates = ['deleted_at'];

    public function admin()
    {
        return $this->hasOneThrough(
            User::class,
            CompanyAdminAssignment::class,
            'company_id',
            'user_id',
            'company_id',
            'user_id'
        )->where('users.role', 'company_admin');
    }

    // for company supervisors
  public function supervisorAssignments()
{
    return $this->hasMany(CompanySupervisorAssignment::class, 'company_id', 'company_id');
}

public function supervisors()
{
    return $this->hasManyThrough(
        User::class,
        CompanySupervisorAssignment::class,
        'company_id',
        'user_id',
        'company_id',
        'supervisor_id'
    )->where('users.role', 'supervisor');
}


}