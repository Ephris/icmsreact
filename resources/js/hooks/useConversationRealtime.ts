import { useEffect, useMemo, useRef, useState } from 'react'
import { useEcho } from '@laravel/echo-react'

export type TypingState = { [userId: number]: boolean }
type MessagePayload = { id: number; conversation_id: number; user_id: number; body: string; created_at: string; attachments?: Array<{ id: number; filename: string; mime?: string; mime_type?: string; size: number }> }
// inline types omitted to avoid unused warnings
type ReadPayload = { message_id: number; user_id: number }

export function useConversationRealtime(
	conversationId: number,
	onMessage?: (m: MessagePayload) => void,
	onRead?: (r: ReadPayload) => void
) {
	const privName = `conversation.${conversationId}`
	const presName = `presence-conversation.${conversationId}`
    const priv = useEcho(privName)
    const pres = useEcho(presName)
	const [onlineIds, setOnlineIds] = useState<number[]>([])
	const [typing, setTyping] = useState<TypingState>({})
	const typingTimers = useRef<Record<number, ReturnType<typeof setTimeout>>>({})

	useEffect(() => {
        const ch = priv.channel()
		ch.listen('.message.sent', (payload: MessagePayload) => onMessage?.(payload))
		ch.listen('.message.read', (payload: ReadPayload) => onRead?.(payload))
		ch.listen('.message.edited', (e: { id: number; body: string; attachments?: Array<{ id: number; filename: string; mime?: string; mime_type?: string; size: number }> }) => {
			onMessage?.({ id: e.id, body: e.body, attachments: e.attachments, conversation_id: conversationId, created_at: new Date().toISOString(), user_id: 0 })
		})
		ch.listen('.message.deleted', (e: { message_id: number }) => {
			// Emit a synthetic "delete" by sending a minimal message with negative id; UI will filter by id
			onMessage?.({ id: -e.message_id, body: '', conversation_id: conversationId, created_at: new Date().toISOString(), user_id: 0 })
		})

        const pchAny = pres.channel() as unknown as {
			here?: (cb: (members: Array<{ id: number }>) => void) => void
			joining?: (cb: (member: { id: number }) => void) => void
			leaving?: (cb: (member: { id: number }) => void) => void
			listen: (event: string, cb: (e: { user_id: number; typing: boolean }) => void) => void
			stopListening?: (event: string) => void
		}

		// Guard: presence methods exist only on PresenceChannel
        // Always reinitialize presence member list to avoid stale 0
        if (typeof pchAny.here === 'function') {
            pchAny.here((members) => setOnlineIds(Array.isArray(members) ? members.map((m) => Number(m.id)) : []))
        }
		if (typeof pchAny.joining === 'function') {
			pchAny.joining((member) => setOnlineIds((prev) => Array.from(new Set([...prev, Number(member.id)]))))
		}
		if (typeof pchAny.leaving === 'function') {
			pchAny.leaving((member) => setOnlineIds((prev) => prev.filter((id) => id !== Number(member.id))))
		}
        pchAny.listen('.typing', (e) => {
			setTyping((prev) => ({ ...prev, [e.user_id]: e.typing }))
			if (e.typing) {
				clearTimeout(typingTimers.current[e.user_id])
				typingTimers.current[e.user_id] = setTimeout(() => setTyping((prev) => ({ ...prev, [e.user_id]: false })), 3000)
			}
		})

		return () => {
			try { ch.stopListening('.message.sent').stopListening('.message.read') } catch (err) { console.warn('stopListening failed', err) }
			try {
				if (pchAny.stopListening) {
					pchAny.stopListening('.typing')
				}
			} catch (err) { console.warn('presence stopListening failed', err) }
		}
    }, [privName, presName, onMessage, onRead, priv, pres, conversationId])

	return useMemo(() => ({ onlineIds, typing }), [onlineIds, typing])
}


