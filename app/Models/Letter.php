<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Letter extends Model
{
    protected $primaryKey = 'letter_id';

    protected $fillable = [
        'coordinator_id',
        'student_id',
        'title',
        'file_path',
        'type',
        'status',
    ];

    protected $casts = [
        'type' => 'string',
        'status' => 'string',
    ];

    public function coordinator()
    {
        return $this->belongsTo(User::class, 'coordinator_id', 'user_id');
    }

    public function student()
    {
        return $this->belongsTo(Student::class, 'student_id', 'student_id');
    }
}