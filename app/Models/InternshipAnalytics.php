<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class InternshipAnalytics extends Model
{
    protected $primaryKey = 'analytics_id';

    protected $fillable = [
        'student_id',
        'application_id',
        'supervisor_id',
        'posting_id',
        'posting_title',
        'company_name',
        'location',
        'industry',
        'work_type',
        'start_date',
        'end_date',
        'duration_days',
        'form_id',
        'form_type',
        'form_title',
        'supervisor_comments',
        'status',
        'submitted_at',
        'advisor_score',
        'advisor_score_out_of',
        'dept_head_score',
        'dept_head_score_out_of',
        'final_score',
        'advisor_evaluation',
        'dept_head_evaluation',
    ];

    protected $casts = [
        'start_date' => 'date',
        'end_date' => 'date',
        'submitted_at' => 'datetime',
        'duration_days' => 'integer',
        'advisor_score' => 'float',
        'advisor_score_out_of' => 'integer',
        'dept_head_score' => 'float',
        'dept_head_score_out_of' => 'integer',
        'final_score' => 'float',
    ];

    public function student(): BelongsTo
    {
        return $this->belongsTo(Student::class, 'student_id', 'student_id');
    }

    public function application(): BelongsTo
    {
        return $this->belongsTo(Application::class, 'application_id', 'application_id');
    }

    public function supervisor(): BelongsTo
    {
        return $this->belongsTo(User::class, 'supervisor_id', 'user_id');
    }

    public function posting(): BelongsTo
    {
        return $this->belongsTo(Posting::class, 'posting_id', 'posting_id');
    }

    public function form(): BelongsTo
    {
        return $this->belongsTo(Form::class, 'form_id', 'form_id');
    }
}
