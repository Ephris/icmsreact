<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Posting extends Model
{
    use SoftDeletes;

    protected $primaryKey = 'posting_id';

    protected $fillable = [
        'company_id',
        'supervisor_id',
        'title',
        'description',
        'type',
        'industry',
        'location',
        'salary_range',
        'start_date',
        'end_date',
        'application_deadline',
        'requirements',
        'work_type',
        'benefits',
        'experience_level',
        'status',
        'skills_required', // Added
        'application_instructions', // Added
        'min_gpa', // New
    ];

   protected $casts = [
        'start_date' => 'date',
        'end_date' => 'date',
        'application_deadline' => 'date',
        'type' => 'string',
        'work_type' => 'string',
        'experience_level' => 'string',
        'status' => 'string',
        'min_gpa' => 'float',
        'skills_required' => 'array',

    ];

    public function company()
    {
        return $this->belongsTo(Company::class, 'company_id', 'company_id');
    }

    public function supervisor()
    {
        return $this->belongsTo(User::class, 'supervisor_id', 'user_id');
    }

    public function applications()
    {
        return $this->hasMany(Application::class, 'posting_id', 'posting_id');
    }
    
}