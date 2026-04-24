<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class DepartmentHeadAssignment extends Model
{
    protected $table = 'department_head_assignments';
    protected $primaryKey = 'id';

    protected $fillable = [
        'department_id',
        'user_id',
        'created_at',
        'updated_at',
    ];

    public function department(): BelongsTo
    {
        return $this->belongsTo(Department::class, 'department_id', 'department_id');
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class, 'user_id', 'user_id');
    }
}