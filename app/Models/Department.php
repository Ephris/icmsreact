<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Department extends Model
{
    use SoftDeletes;

    protected $primaryKey = 'department_id';

    protected $fillable = [
        'name',
        'description',
        'code',
        'faculty',
        'dept_head_id',
        'status',
        'created_at',
        'updated_at',
        'deleted_at',
    ];

    protected $dates = [
        'deleted_at',
        'created_at',
        'updated_at',
    ];

    public function deptHead()
    {
        return $this->belongsTo(User::class, 'dept_head_id', 'user_id');
    }

    public function students()
    {
        return $this->hasMany(Student::class, 'department_id', 'department_id');
    }

    public function advisorAssignments()
    {
        return $this->hasMany(AdvisorAssignment::class, 'department_id', 'department_id');
    }

    public function departmentHeadAssignments()
    {
        return $this->hasMany(DepartmentHeadAssignment::class, 'department_id', 'department_id');
    }
}