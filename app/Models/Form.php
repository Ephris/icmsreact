<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Form extends Model
{
    use SoftDeletes;

    protected $primaryKey = 'form_id';

    protected $fillable = [
        'advisor_id',
        'student_id',
        'supervisor_id',
        'title',
        'file_path',
        'type',
        'status',
        'comments',
    ];

    protected $casts = [
        'type' => 'string',
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

    public function supervisor()
    {
        return $this->belongsTo(User::class, 'supervisor_id', 'user_id');
    }
}