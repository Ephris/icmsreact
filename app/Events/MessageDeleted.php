<?php

namespace App\Events;

use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcastNow;

class MessageDeleted implements ShouldBroadcastNow
{
    use InteractsWithSockets;

    public function __construct(
        public int $conversationId,
        public int $messageId
    ) {}

    public function broadcastOn()
    {
        return new PrivateChannel('conversation.' . $this->conversationId);
    }

    public function broadcastAs()
    {
        return 'message.deleted';
    }

    public function broadcastWith(): array
    {
        return [ 'message_id' => $this->messageId ];
    }
}


