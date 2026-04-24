<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Feedback extends Model
{
    protected $primaryKey = 'feedback_id';

    protected $fillable = [
        'advisor_id',
        'student_id',
        'content',
        'rating',
    ];

    protected $casts = [
        'rating' => 'integer',
    ];

    public function advisor()
    {
        return $this->belongsTo(User::class, 'advisor_id', 'user_id');
    }

    public function student()
    {
        return $this->belongsTo(Student::class, 'student_id', 'student_id');
    }
}