import { useEffect } from 'react'
import { useEchoModel } from '@laravel/echo-react'
import { usePage } from '@inertiajs/react'
import { toast } from 'sonner'

type NotificationPayload = { 
    title?: string
    body?: string
    type?: string
    timestamp?: string
}

export function NotificationProvider({ children }: { children: React.ReactNode }) {
    const { props } = usePage()
    const auth = (props as { auth?: { user?: { user_id?: number; id?: number } } })?.auth
    const userId = auth?.user?.user_id ?? auth?.user?.id
    const { channel } = useEchoModel('App.Models.User', userId || 0)

    useEffect(() => {
        if (!userId) return

        const ch = channel()
        const handleNotification = (notification: NotificationPayload) => {
            // Show toast notification using sonner
            toast(notification.title || 'New Notification', {
                description: notification.body || '',
                duration: 5000,
            })
        }

        ch.notification(handleNotification)

        return () => {
            try {
                ch.stopListeningForNotification(handleNotification)
            } catch (error) {
                console.warn('Failed to stop listening for notifications:', error)
            }
        }
    }, [channel, userId])

    return <>{children}</>
}
