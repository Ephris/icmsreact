<?php

namespace App\Events;

use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcastNow;

class MessageEdited implements ShouldBroadcastNow
{
    use InteractsWithSockets;

    public function __construct(
        public int $conversationId,
        public array $payload
    ) {}

    public function broadcastOn()
    {
        return new PrivateChannel('conversation.' . $this->conversationId);
    }

    public function broadcastAs()
    {
        return 'message.edited';
    }

    public function broadcastWith(): array
    {
        return $this->payload;
    }
}


