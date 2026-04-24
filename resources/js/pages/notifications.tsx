import { useEffect, useState } from 'react'

type NotificationPayload = { title?: string; body?: string; type?: string }

export default function Notifications({ userId }: { userId: number }) {
    const [items, setItems] = useState<NotificationPayload[]>([])

    useEffect(() => {
        // Listen for notification events on the user-specific channel
        const channel = window.Echo.private(`notifications.user.${userId}`)
        const cb = (data: unknown) => {
            const notification = data as NotificationPayload
            setItems((prev) => [notification, ...prev])
        }
        channel.listen('.notification.received', cb)
        return () => {
            try {
                // Laravel Echo doesn't have stopListening method, just leave the channel
                channel.leave(`notifications.user.${userId}`)
            } catch { /* noop */ }
        }
    }, [userId])

	return (
		<div className="p-4">
			<div className="text-lg font-semibold mb-4">Notifications</div>
			<div className="space-y-3">
				{items.length === 0 ? (
					<div className="text-center text-muted-foreground py-8">No notifications yet</div>
				) : (
					items.map((n, i) => (
						<div key={i} className="border border-border rounded-lg p-4 bg-card hover:bg-muted/50 transition-colors">
							<div className="font-medium text-sm">{n.title || n.type}</div>
							<div className="text-sm text-muted-foreground mt-1">{n.body}</div>
						</div>
					))
				)}
			</div>
		</div>
	)
}


