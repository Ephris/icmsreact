<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class SupervisorAssignment extends Model
{
    protected $primaryKey = 'assignment_id';

    protected $fillable = [
        'supervisor_id',
        'student_id',
        'posting_id',
        'assigned_at',
        'status',
    ];

    protected $casts = [
        'assigned_at' => 'datetime',
        'status' => 'string',
    ];

    public function supervisor()
    {
        return $this->belongsTo(User::class, 'supervisor_id', 'user_id');
    }

    public function student()
    {
        return $this->belongsTo(Student::class, 'student_id', 'student_id');
    }

    public function posting()
    {
        return $this->belongsTo(Posting::class, 'posting_id', 'posting_id');
    }
}