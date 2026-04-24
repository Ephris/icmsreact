<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class Conversation extends Model
{
	use SoftDeletes;

	protected $fillable = [
		'is_group',
		'type',
		'title',
		'created_by_id',
		'last_message_id',
        'pinned_message_id',
	];

	public function creator(): BelongsTo
	{
		return $this->belongsTo(User::class, 'created_by_id');
	}

	public function participants(): HasMany
	{
		return $this->hasMany(ConversationParticipant::class);
	}

	public function messages(): HasMany
	{
		return $this->hasMany(Message::class);
	}

    public function pinned(): BelongsTo
    {
        return $this->belongsTo(Message::class, 'pinned_message_id');
    }
}
