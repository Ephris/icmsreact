<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class AdvisorAssignment extends Model
{
    protected $primaryKey = 'assignment_id';

    protected $fillable = [
        'advisor_id',
        'student_id',
        'department_id',
        'assigned_at',
        'status',
        'created_at',
        'updated_at',
    ];

    protected $casts = [
        'assigned_at' => 'datetime',
        'status' => 'string',
    ];

    public function advisor()
    {
        return $this->belongsTo(User::class, 'advisor_id', 'user_id');
    }

    public function student()
    {
        return $this->belongsTo(Student::class, 'student_id', 'student_id');
    }

    public function department()
    {
        return $this->belongsTo(Department::class, 'department_id', 'department_id');
    }
}