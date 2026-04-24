<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Application extends Model
{
    protected $primaryKey = 'application_id';

    protected $fillable = [
        'student_id',
        'posting_id',
        'resume',
        'cover_letter',
        'portfolio',
        'skills',
        'certifications',
        'status',
        'accepted_at',
        'feedback', // Added
        'student_approved_at', // Added
        'offer_expiration', // Added
        'cover_letter_path', // New
        'submitted_at', // Added
        'source', // Added
        'last_updated_by', // Added
    ];

    protected $casts = [
        'skills' => 'array',
        'certifications' => 'array',
        'status' => 'string',
        'accepted_at' => 'datetime',
        'student_approved_at' => 'datetime', // Added
        'offer_expiration' => 'datetime', // Added
        'submitted_at' => 'datetime', // Added
    ];

    public function student()
    {
        return $this->belongsTo(Student::class, 'student_id', 'student_id');
    }

    public function posting()
    {
        return $this->belongsTo(Posting::class, 'posting_id', 'posting_id');
    }
    public function lastUpdatedBy()
    {
        return $this->belongsTo(User::class, 'last_updated_by', 'user_id');
    }

    public function feedbacks()
    {
        return $this->hasMany(Feedback::class, 'student_id', 'student_id');
    }

    public function applicationLetter()
    {
        return $this->hasOne(ApplicationLetter::class, 'student_id', 'student_id');
    }

    public function analytics()
    {
        return $this->hasOne(InternshipAnalytics::class, 'application_id', 'application_id');
    }

    public function setOfferExpirationAttribute($value)
    {
        if ($this->accepted_at) {
            $this->attributes['offer_expiration'] = $this->accepted_at->addHours(120);
        }
    }
    

    public function isWithinApprovalWindow(): bool
    {
        return $this->offer_expiration && now()->lt($this->offer_expiration);
    }

  public function approveByStudent()
    {
        if ($this->status === 'accepted' && $this->isWithinApprovalWindow() && !$this->student->hasApprovedApplication()) {
            $this->student_approved_at = now();
            $this->status = 'approved';
            $this->student->accepted_application_id = $this->application_id; // Updated to use primaryKey
            $this->student->save();
            $this->save();
        } else {
            throw new \Exception('Cannot approve: Invalid status, expired, or another application approved.');
        }
    }
}