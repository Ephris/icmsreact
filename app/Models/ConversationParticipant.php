<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ConversationParticipant extends Model
{
	protected $fillable = [
		'conversation_id',
		'user_id',
		'role',
		'joined_at',
		'last_read_message_id',
		'pinned',
		'muted',
	];

	protected $casts = [
		'joined_at' => 'datetime',
		'pinned' => 'boolean',
		'muted' => 'boolean',
	];

	public function conversation(): BelongsTo
	{
		return $this->belongsTo(Conversation::class);
	}

	public function user(): BelongsTo
	{
		return $this->belongsTo(User::class);
	}
}
