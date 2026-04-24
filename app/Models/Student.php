<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Notifications\Notifiable;

class Student extends Model
{
    use SoftDeletes, Notifiable;

    protected $primaryKey = 'student_id';

    protected $fillable = [
        'user_id',
        'department_id',
        'first_name',
        'last_name',
        'cgpa',
        'resume_path',
        'profile_image_path',
        'profile_image', // New field for profile image
        'portfolio_url',
        'skills',
        'certifications',
        'year_of_study',
        'university_id',
        'bio',
        'accepted_application_id',
        'linkedin_url',
        'expected_salary', // Added
        'notice_period',  // Added
        'preferred_locations', // New
        'graduation_year',
    ];

    protected $casts = [
        'skills' => 'array',
        'certifications' => 'array',
        'preferred_locations' => 'array', // New
        'cgpa' => 'float',
        'graduation_year' => 'integer',   // New
        'deleted_at' => 'datetime',
    ];

    protected $dates = [
        'created_at',
        'updated_at',
        'deleted_at',
    ];

    public function user()
    {
        return $this->belongsTo(User::class, 'user_id', 'user_id');
    }

    public function department()
    {
        return $this->belongsTo(Department::class, 'department_id', 'department_id');
    }

    public function advisorAssignments()
    {
        return $this->hasMany(AdvisorAssignment::class, 'student_id', 'student_id');
    }

    public function advisors()
    {
        return $this->hasManyThrough(
            User::class,
            AdvisorAssignment::class,
            'student_id',
            'user_id',
            'student_id',
            'advisor_id'
        );
    }
    //for posting application
    public function applications()
    {
        return $this->hasMany(Application::class, 'student_id', 'student_id');
    }

    public function forms()
    {
        return $this->hasMany(Form::class, 'student_id', 'student_id');
    }

    public function acceptedApplication()
    {
        return $this->belongsTo(Application::class, 'accepted_application_id', 'application_id');
    }
    public function hasApprovedApplication(): bool
    {
        return !is_null($this->accepted_application_id);
    }

    public function getMatchingPostings()
    {
        return Posting::where('status', 'open')
            ->where('application_deadline', '>=', now())
            ->whereJsonOverlaps('skills_required', $this->skills ?? [])
            ->where('min_gpa', '<=', $this->cgpa ?? 0) // New GPA filter
            ->whereIn('location', $this->preferred_locations ?? []) // New location filter
            ->where('end_date', '>=', $this->graduation_year ?? now()->year) // New: Postings ending after graduation
            ->with('company')
            ->get();
    }

    public function applicationLetter()
    {
        return $this->hasOne(ApplicationLetter::class, 'student_id', 'student_id');
    }

    public function getNameAttribute()
    {
        return trim($this->first_name . ' ' . $this->last_name);
    }

    /**
     * Route notifications for the mail channel.
     */
    public function routeNotificationForMail($notification)
    {
        return $this->user->email;
    }

    /**
     * Route notifications for the database channel.
     */
    public function routeNotificationForDatabase($notification)
    {
        return $this->student_id;
    }

    /**
     * Route notifications for the broadcast channel.
     */
    public function routeNotificationForBroadcast($notification)
    {
        return 'student.' . $this->student_id;
    }
}