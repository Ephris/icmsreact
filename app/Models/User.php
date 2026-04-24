<?php

namespace App\Models;

use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Notifications\Notifiable;

class User extends Authenticatable
{
    use HasFactory, SoftDeletes, Notifiable;

    protected $table = 'users';
    protected $primaryKey = 'user_id';

    protected $fillable = [
        'username',
        'name',
        'first_name',
        'last_name',
        'specialization',
        'email',
        'role', // Enum: 'student','coordinator','dept_head','advisor','company_admin','supervisor','admin'
        'department_id',
        'phone',
        'gender',
        'status',
        'avatar',
        'email_verified_at',
        'password',
        'remember_token',
        'created_by',
    ];

    protected $casts = [
        'email_verified_at' => 'datetime',
        'role' => 'string',
        'status' => 'string',
        'gender' => 'string',
        'account_deactivation_date' => 'date',
    ];

    protected $dates = [
        'deleted_at',
        'created_at',
        'updated_at',
    ];

    protected $hidden = [
        'password',
        'remember_token',
    ];

    protected $appends = ['name'];

   public function getNameAttribute(): string
    {
        // Fallback to DB 'name' if first_name and last_name are empty (for non-student users)
        $fullName = trim("{$this->first_name} {$this->last_name}");
       return $fullName ?: ($this->attributes['name'] ?? $this->username ?? 'Unnamed User');
    }
    public function departmentHeadAssignments()
    {
        return $this->hasMany(DepartmentHeadAssignment::class, 'user_id', 'user_id');
    }

    public function student()
    {
        return $this->hasOne(Student::class, 'user_id', 'user_id');
    }

    public function advisorAssignments()
    {
        return $this->hasMany(AdvisorAssignment::class, 'advisor_id', 'user_id');
    }

    public function companyAdminAssignments()
    {
        return $this->hasMany(CompanyAdminAssignment::class, 'user_id', 'user_id');
    }

    public function assignedCompany()
    {
        return $this->hasOneThrough(
            Company::class,
            CompanyAdminAssignment::class,
            'user_id',
            'company_id',
            'user_id',
            'company_id'
        );
    }

    public function assignedStudents()
    {
        return $this->hasManyThrough(
            Student::class,
            AdvisorAssignment::class,
            'advisor_id',
            'student_id',
            'user_id',
            'student_id'
        ); 
    }
    // public function forms()
    // {
    //     return $this->hasMany(Form::class, 'advisor_id', 'user_id');
    // }

    public function department()
    {
        return $this->belongsTo(Department::class, 'department_id', 'department_id');
    }

    public function assignedDepartment()
    {
        return $this->hasOneThrough(
            Department::class,
            DepartmentHeadAssignment::class,
            'user_id', // Foreign key on DepartmentHeadAssignment
            'department_id', // Foreign key on Department
            'user_id', // Local key on User
            'department_id' // Local key on DepartmentHeadAssignment
        );
    }

    //add for company supervisor
    public function supervisorAssignments()
{
    return $this->hasMany(CompanySupervisorAssignment::class, 'supervisor_id', 'user_id');
}

public function assignedCompaniesAsSupervisor()
{
    return $this->hasManyThrough(
        Company::class,
        CompanySupervisorAssignment::class,
        'supervisor_id',
        'company_id',
        'user_id',
        'company_id'
    );
}


    // public function approvedForms()
    // {
    //     return $this->hasMany(Form::class, 'supervisor_id', 'user_id');
    // }
    public function forms()
    {
        return $this->hasMany(Form::class, 'advisor_id', 'user_id');
    }

    public function approvedForms()
    {
        return $this->hasMany(Form::class, 'supervisor_id', 'user_id');
    }
    
}