<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class Message extends Model
{
	use SoftDeletes;

	protected $fillable = [
		'conversation_id',
		'user_id',
		'body',
		'reply_to_message_id',
		'metadata',
		'edited_at',
	];

	protected $casts = [
		'edited_at' => 'datetime',
		'metadata' => 'array',
	];

	public function conversation(): BelongsTo
	{
		return $this->belongsTo(Conversation::class);
	}

	public function user(): BelongsTo
	{
		return $this->belongsTo(User::class);
	}

	public function attachments(): HasMany
	{
		return $this->hasMany(MessageAttachment::class);
	}
}
