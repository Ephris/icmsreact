import { useEffect, useRef, useState, useCallback } from 'react'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { useConversationRealtime } from '../../hooks/useConversationRealtime'

type Message = { id: number; body: string; user_id: number; created_at: string; read_by?: number[]; user?: { name?: string }; attachments?: Array<{ id: number; filename: string; mime?: string; mime_type?: string; size: number }> }

export default function Thread({ conversationId, title, currentUserId, onPinnedChange, pinned }: { conversationId: number; title?: string; currentUserId: number; onPinnedChange?: (p: { id: number; body: string; user_name?: string } | null) => void; pinned?: { id: number; body: string; user_name?: string; user_role?: string } | null }) {
	const [messages, setMessages] = useState<Message[]>([])
	const [body, setBody] = useState('')
	const [file, setFile] = useState<File | null>(null)
	const [sending, setSending] = useState(false)
	const [error, setError] = useState<string | null>(null)
	const [showEmoji, setShowEmoji] = useState(false)
	const [isRecording, setIsRecording] = useState(false)
	const [recordingTime, setRecordingTime] = useState(0)
	const [actionMenuId, setActionMenuId] = useState<number | null>(null)
	const recorderRef = useRef<MediaRecorder | null>(null)
	const [editingId, setEditingId] = useState<number | null>(null)
	const [editingText, setEditingText] = useState<string>('')
	const [replyToId, setReplyToId] = useState<number | null>(null)
	const bottomRef = useRef<HTMLDivElement | null>(null)
    const lastTypingSentAt = useRef<number>(0)
    const lastTypingValue = useRef<boolean>(false)
    const listRef = useRef<HTMLDivElement | null>(null)
    const highlightTimerRef = useRef<number | null>(null)
    const [highlightedId, setHighlightedId] = useState<number | null>(null)

    useEffect(() => {
        fetch(`/api/messages?conversation_id=${conversationId}`, { credentials: 'include' })
            .then(async (r) => {
                if (!r.ok) {
                    const text = await r.text().catch(() => '')
                    throw new Error(text || `Failed to load messages (${r.status})`)
                }
                return r.json()
            })
            .then((res) => {
                const msgs = res.data || []
                // Keep oldest->newest so latest is at the bottom
                setMessages(msgs)
				// Mark the latest message as read
				if (msgs.length > 0) {
                    const latestMessage = msgs[msgs.length - 1]
					fetch('/api/messages/read', {
						method: 'POST',
						headers: {
							'Content-Type': 'application/json',
							'X-Requested-With': 'XMLHttpRequest',
							'Accept': 'application/json',
							'X-CSRF-TOKEN': (document.querySelector('meta[name="csrf-token"]') as HTMLMetaElement | null)?.content || '',
							...(document.cookie.split('; ').find((c) => c.startsWith('XSRF-TOKEN='))?.split('=')[1] ? { 'X-XSRF-TOKEN': decodeURIComponent(document.cookie.split('; ').find((c) => c.startsWith('XSRF-TOKEN='))!.split('=')[1]) } : {}),
						},
						credentials: 'include',
						body: JSON.stringify({ message_id: latestMessage.id }),
					}).catch(() => {})
				}
			})
			.catch((error) => {
				console.error('Failed to load messages:', error)
				setMessages([])
			})
	}, [conversationId])

    const { onlineIds, typing } = useConversationRealtime(
		conversationId,
        (m) => setMessages((prev) => {
            // handle synthetic updates
            if (m.id < 0) {
                const delId = -m.id
                return prev.filter(pm => pm.id !== delId)
            }
            // If edit came with same id, merge body and attachments
            const existing = prev.find(pm => pm.id === m.id)
            if (existing) {
                const updated = { ...existing }
                if (m.body !== undefined && m.body !== existing.body) {
                    updated.body = m.body
                }
                if (m.attachments) {
                    updated.attachments = m.attachments
                }
                return prev.map(pm => pm.id === m.id ? updated : pm)
            }
            return [...prev, m]
        }),
		(r) => {
			setMessages((prev) => prev.map((msg) => 
				msg.id === r.message_id 
					? { ...msg, read_by: [...(msg.read_by || []), r.user_id] }
					: msg
			))
        },
        // onRead callback already below
	)

    useEffect(() => {
		bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
	}, [messages])

    // Close action menu when new messages arrive or on scroll to avoid mismatch
    useEffect(() => { setActionMenuId(null) }, [messages.length])
    useEffect(() => {
        const el = listRef.current
        if (!el) return
        const handler = () => setActionMenuId(null)
        el.addEventListener('scroll', handler)
        return () => el.removeEventListener('scroll', handler)
    }, [])

	const sendVoiceMessage = useCallback(async (chunks: BlobPart[], mimeType: string) => {
		try {
			setSending(true)
			setError(null)

			const extension = mimeType === 'audio/webm' ? 'webm' : 'mp4'
			const blob = new Blob(chunks, { type: mimeType })
			const fileObj = new File([blob], `voice-${Date.now()}.${extension}`, { type: mimeType })

			const csrf = (document.querySelector('meta[name="csrf-token"]') as HTMLMetaElement | null)?.content || ''
			const xsrf = document.cookie.split('; ').find((c) => c.startsWith('XSRF-TOKEN='))?.split('=')[1]

			// Create message first
			const res = await fetch('/api/messages', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					'X-CSRF-TOKEN': csrf,
					'X-Requested-With': 'XMLHttpRequest',
					'Accept': 'application/json',
					...(xsrf ? { 'X-XSRF-TOKEN': decodeURIComponent(xsrf) } : {})
				},
				credentials: 'include',
				body: JSON.stringify({ conversation_id: conversationId, body: '🎙️ Voice message' })
			})

			if (res.ok) {
				const msg = await res.json()
				// Upload voice file
				const form = new FormData()
				form.append('file', fileObj)
				const uploadRes = await fetch(`/api/messages/${msg.id}/upload`, {
					method: 'POST',
					headers: {
						'X-CSRF-TOKEN': csrf,
						...(xsrf ? { 'X-XSRF-TOKEN': decodeURIComponent(xsrf) } : {}),
					},
					credentials: 'include',
					body: form
				})

				if (!uploadRes.ok) {
					const errorText = await uploadRes.text().catch(() => '')
					console.error('Upload failed:', uploadRes.status, errorText)
					throw new Error(`Failed to upload voice message: ${uploadRes.status}`)
				}

				// Refresh messages to show attachment
				const ms = await fetch(`/api/messages?conversation_id=${conversationId}`, { credentials: 'include' })
				if (ms.ok) {
					const resJ = await ms.json()
					const msgs = resJ.data || []
					setMessages(msgs)
				}
			} else {
				throw new Error('Failed to create voice message')
			}
		} catch (uploadErr) {
			console.error('Voice upload failed:', uploadErr)
			setError('Failed to send voice message')
		} finally {
			setSending(false)
		}
	}, [conversationId])

	const sendCurrentVoice = useCallback(() => {
		if (recorderRef.current && recorderRef.current.state === 'recording') {
			recorderRef.current.stop()
		}
	}, [])

	const send = useCallback(async () => {
		const csrf = (document.querySelector('meta[name="csrf-token"]') as HTMLMetaElement | null)?.content || ''
		const xsrf = document.cookie.split('; ').find((c) => c.startsWith('XSRF-TOKEN='))?.split('=')[1]
		// optimistic UI update
		if (body.trim().length > 0 || file) {
			const optimistic: Message = { id: Date.now(), body: body || (file ? `[File: ${file.name}]` : ''), user_id: currentUserId, created_at: new Date().toISOString() }
			setMessages((prev) => [...prev, optimistic])
		}
		try {
			setSending(true)
			setError(null)
			const response = await fetch('/api/messages', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					'X-Requested-With': 'XMLHttpRequest',
					'Accept': 'application/json',
					'X-CSRF-TOKEN': csrf,
					...(xsrf ? { 'X-XSRF-TOKEN': decodeURIComponent(xsrf) } : {}),
				},
				credentials: 'include',
							body: JSON.stringify({ conversation_id: conversationId, body, reply_to_message_id: replyToId || undefined }),
			})
	           if (response.ok) {
	               const message = await response.json()
	               if (file) {
					// Upload file
					const formData = new FormData()
					formData.append('file', file)
					await fetch(`/api/messages/${message.id}/upload`, {
						method: 'POST',
						headers: {
							'X-CSRF-TOKEN': csrf,
							...(xsrf ? { 'X-XSRF-TOKEN': decodeURIComponent(xsrf) } : {}),
						},
						credentials: 'include',
						body: formData,
	                   })
	                   // Fetch updated message with attachments
	                   try {
	                       const ms = await fetch(`/api/messages?conversation_id=${conversationId}`, { credentials: 'include' })
	                       if (ms.ok) {
	                           const resJ = await ms.json()
	                           const msgs = resJ.data || []
	                           setMessages(msgs)
	                       }
	                   } catch {
	                       // ignore refresh failure; UI will still show audio link after next fetch/realtime
	                   }
				}
			} else {
				const text = await response.text().catch(() => '')
				throw new Error(text || 'Failed to send message')
			}
		} catch (error) {
			console.error('Failed to send message:', error)
			setError('Failed to send message')
		}
		setBody('')
		setFile(null)
		setSending(false)
	   }, [conversationId, body, file, currentUserId, replyToId])

	const setTyping = useCallback((val: boolean) => {
		const csrf = (document.querySelector('meta[name="csrf-token"]') as HTMLMetaElement | null)?.content || ''
		const xsrf = document.cookie.split('; ').find((c) => c.startsWith('XSRF-TOKEN='))?.split('=')[1]
        const now = Date.now()
        if (val) {
            if (lastTypingValue.current === true && now - lastTypingSentAt.current < 2000) {
                return
            }
        }
        lastTypingSentAt.current = now
        lastTypingValue.current = val
		if (!conversationId || Number.isNaN(Number(conversationId))) return
		fetch(`/api/conversations/${Number(conversationId)}/typing`, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				'X-Requested-With': 'XMLHttpRequest',
				'Accept': 'application/json',
				'X-CSRF-TOKEN': csrf,
				...(xsrf ? { 'X-XSRF-TOKEN': decodeURIComponent(xsrf) } : {}),
			},
			credentials: 'include',
			body: JSON.stringify({ typing: val }),
		}).catch(() => {})
	}, [conversationId])

    return (
        <div className="flex flex-col h-full bg-gradient-to-br from-background to-muted/20 text-[18px]" onKeyDown={(e) => {
            if (e.key.toLowerCase() === 'p' && actionMenuId == null) {
                const last = messages[messages.length - 1]
                if (last) {
                    fetch(`/api/conversations/${conversationId}/pin/${last.id}`, { method: 'POST', credentials: 'include' }).then(() => onPinnedChange?.({ id: last.id, body: last.body, user_name: last.user?.name }))
                }
            }
            if (e.key.toLowerCase() === 'r' && actionMenuId == null) {
                const last = messages[messages.length - 1]
                if (last) setReplyToId(last.id)
            }
        }} tabIndex={0}>
            <div className="px-5 py-4 border-b bg-card">
				<div className="flex items-center justify-between">
					<div className="flex items-center gap-3 min-w-0">
                        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center text-[12px] font-medium">
							{(title || 'C').slice(0, 2).toUpperCase()}
						</div>
						<div className="min-w-0">
                            <div className="font-semibold truncate text-[19px]">{title || 'Conversation'}</div>
                            <div className="text-[12px] text-muted-foreground">Online: {onlineIds.length}{Object.values(typing).some(Boolean) ? ' • typing…' : ''}</div>
						</div>
					</div>
				</div>
			</div>
            {pinned && (
                <div className="px-5 py-3 border-b bg-primary/10 text-[14px] text-foreground flex items-center gap-3" role="region" aria-label="Pinned message">
                    <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center" title="Pinned">📌</div>
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-[12px] font-semibold ring-2 ${(() => {
                        const role = (pinned as { user_role?: string } | null)?.user_role || 'user'
                        const roleColor: Record<string, string> = {
                            admin: 'bg-red-500/10 text-red-600 ring-red-200',
                            company_admin: 'bg-blue-500/10 text-blue-600 ring-blue-200',
                            coordinator: 'bg-green-500/10 text-green-600 ring-green-200',
                            dept_head: 'bg-purple-500/10 text-purple-600 ring-purple-200',
                            supervisor: 'bg-orange-500/10 text-orange-600 ring-orange-200',
                            advisor: 'bg-teal-500/10 text-teal-600 ring-teal-200',
                            student: 'bg-gray-500/10 text-gray-600 ring-gray-200',
                        }
                        return roleColor[role] || 'bg-gray-500/10 text-gray-600 ring-gray-200'
                    })()}`} aria-hidden>
                        {(pinned.user_name || 'U').split(' ').map(n => n[0]).join('').slice(0,2).toUpperCase()}
                    </div>
                    <button
                        className="truncate flex items-center gap-2 text-left hover:underline"
                        title="Go to pinned message"
                        onClick={() => {
                            const el = document.getElementById(`msg-${pinned.id}`)
                            if (el) {
                                el.scrollIntoView({ behavior: 'smooth', block: 'center' })
                                setHighlightedId(pinned.id)
                                if (highlightTimerRef.current) window.clearTimeout(highlightTimerRef.current)
                                highlightTimerRef.current = window.setTimeout(() => setHighlightedId(null), 2000) as unknown as number
                            }
                        }}
                    >
                        <span className="font-semibold" title={pinned.user_name || ''}>{pinned.user_name || 'Pinned'}</span>
                        <span className="opacity-80 truncate" title={pinned.body}>— {pinned.body}</span>
                    </button>
                    <button title="Unpin" aria-label="Unpin message" className="ml-auto text-sm hover:opacity-80 focus:outline-none focus:ring-2 focus:ring-primary/50 rounded" onClick={async () => {
                        try {
                            await fetch(`/api/conversations/${conversationId}/pin`, { method: 'DELETE', credentials: 'include' })
                            onPinnedChange?.(null)
                        } catch { /* ignore */ }
                    }}>✖</button>
                </div>
            )}
            <div ref={listRef} className="flex-1 overflow-y-auto space-y-3 p-4">
                {messages.map((m) => {
					const isSender = m.user_id === currentUserId;
                    const senderName = isSender ? 'You' : (m.user?.name || (m as unknown as { user_name?: string }).user_name || 'User');
                    const initials = (isSender ? 'You' : senderName).split(' ').map(s => s[0]).join('').slice(0,2).toUpperCase();
                    const otherBubble = 'bg-muted text-foreground dark:bg-muted/70';
                    const selfBubble = 'bg-primary text-primary-foreground';
					return (
                        <div key={m.id} id={`msg-${m.id}`} className={`flex ${isSender ? 'justify-end' : 'justify-start'} items-end gap-3`}>
                            {!isSender && (
                                <Avatar className="h-7 w-7 flex-shrink-0">
                                    <AvatarFallback className="text-[10px]">{initials}</AvatarFallback>
                                </Avatar>
                            )}
                            <div className={`max-w-[70%] rounded-xl px-4 py-3 relative ${isSender ? selfBubble : otherBubble} ${pinned && m.id === pinned.id ? 'ring-2 ring-primary/50' : ''} ${highlightedId === m.id ? 'animate-pulse' : ''}`} onMouseLeave={() => setActionMenuId(prev => prev === m.id ? null : prev)}>
                                {!isSender && <div className="text-[13px] font-medium mb-1 opacity-80">{senderName}</div>}
                                {pinned && m.id === pinned.id && (
                                    <div className="mb-2 text-[11px] uppercase tracking-wide opacity-80 flex items-center gap-2"><span>📌 Pinned</span></div>
                                )}
                                {('reply_preview' in (m as unknown as Record<string, unknown>)) && (
                                    <div className="mb-2 px-2 py-1 rounded text-[12px] bg-muted/60 border-l-2 border-primary/60" role="note" aria-label="Reply preview">
                                        <div className="opacity-80 font-medium">{((m as unknown as { reply_preview?: { user_name?: string } }).reply_preview?.user_name) || 'Reply'}</div>
                                        <div className="truncate">{((m as unknown as { reply_preview?: { body?: string } }).reply_preview?.body) || ''}</div>
                                    </div>
                                )}
                                {('metadata' in (m as unknown as Record<string, unknown>)) && ((m as unknown as { metadata?: { pinned?: boolean } }).metadata?.pinned) && (
                                    <div className="mb-1 text-[11px] uppercase tracking-wide opacity-80 flex items-center gap-2">
                                        <span title="Pinned">📌</span>
                                        <button className="underline hover:no-underline focus:outline-none focus:ring-2 focus:ring-primary/40 rounded" onClick={async () => {
                                            try {
                                                await fetch(`/api/conversations/${conversationId}/pin/${m.id}`, { method: 'POST', credentials: 'include' })
                                                onPinnedChange?.({ id: m.id, body: m.body, user_name: m.user?.name })
                                            } catch (err) { console.error('Pin failed', err) }
                                        }}>Pin to top</button>
                                    </div>
                                )}
								{replyToId === m.id && (
									<div className="mb-1 text-[11px] opacity-80">Replying to this message</div>
								)}
								{editingId === m.id ? (
                                    <div className="space-y-2">
                                        <input className="w-full px-2 py-1 rounded bg-card text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50" value={editingText} onChange={(e) => setEditingText(e.target.value)} />
										<div className="flex gap-2 text-[11px]">
                                            <button className="px-2 py-1 rounded bg-primary/80 text-primary-foreground hover:bg-primary focus:outline-none focus:ring-2 focus:ring-primary/50" onClick={async () => {
												try {
													await fetch(`/api/messages/${m.id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, credentials: 'include', body: JSON.stringify({ body: editingText }) })
													setMessages(prev => prev.map(pm => pm.id === m.id ? { ...pm, body: editingText } : pm))
													setEditingId(null)
                                            } catch (err) {
                                                console.error('Edit failed', err)
                                            }
											}}>Save</button>
                                            <button className="px-2 py-1 rounded bg-muted hover:bg-muted/80 focus:outline-none focus:ring-2 focus:ring-primary/30" onClick={() => setEditingId(null)}>Cancel</button>
										</div>
									</div>
                                ) : (
                                    <div className="text-[18px] leading-7">{m.body}</div>
								)}
								{m.attachments && m.attachments.length > 0 && (
                                    <div className="mt-2 space-y-2">
                                        {m.attachments.map((att) => {
                                            const mimeType = att.mime || att.mime_type || ''
                                            const isAudio = mimeType.startsWith('audio/') || att.filename.endsWith('.webm') || att.filename.endsWith('.mp3') || att.filename.endsWith('.wav')
                                            const isImage = mimeType.startsWith('image/')
                                            const url = `/api/messages/${m.id}/download/${att.filename}`
                                            const fileSize = (att.size / 1024).toFixed(1)
                                            
                                            return (
                                                <div key={att.id} className="text-xs">
                                                    {isAudio ? (
                                                        <div className="bg-muted/30 rounded-lg p-3 border">
                                                            <div className="flex items-center gap-3">
                                                                <div className="w-10 h-10 bg-primary/20 rounded-full flex items-center justify-center">
                                                                    🎵
                                                                </div>
                                                                <div className="flex-1">
                                                                    <div className="font-medium text-sm">Voice message</div>
                                                                    <div className="text-xs text-muted-foreground">{fileSize} KB</div>
                                                                </div>
                                                                <div className="flex items-center gap-2">
                                                                    <audio controls src={url} className="h-8" preload="metadata">
                                                                        Your browser does not support the audio element.
                                                                    </audio>
                                                                    <a href={url} download={att.filename} className="text-primary hover:underline p-1" title="Download">
                                                                        💾
                                                                    </a>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    ) : isImage ? (
                                                        <div className="bg-muted/30 rounded-lg p-3 border">
                                                            <div className="flex items-center gap-3">
                                                                <div className="w-10 h-10 bg-primary/20 rounded-full flex items-center justify-center">
                                                                    🖼️
                                                                </div>
                                                                <div className="flex-1">
                                                                    <div className="font-medium text-sm">{att.filename}</div>
                                                                    <div className="text-xs text-muted-foreground">{fileSize} KB</div>
                                                                </div>
                                                                <div className="flex items-center gap-2">
                                                                    <a href={url} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline p-1" title="View">
                                                                        👁️
                                                                    </a>
                                                                    <a href={url} download={att.filename} className="text-primary hover:underline p-1" title="Download">
                                                                        💾
                                                                    </a>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    ) : (
                                                        <div className="bg-muted/30 rounded-lg p-3 border">
                                                            <div className="flex items-center gap-3">
                                                                <div className="w-10 h-10 bg-primary/20 rounded-full flex items-center justify-center">
                                                                    📄
                                                                </div>
                                                                <div className="flex-1">
                                                                    <div className="font-medium text-sm">{att.filename}</div>
                                                                    <div className="text-xs text-muted-foreground">{fileSize} KB</div>
                                                                </div>
                                                                <div className="flex items-center gap-2">
                                                                    <a href={url} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline p-1" title="View">
                                                                        👁️
                                                                    </a>
                                                                    <a href={url} download={att.filename} className="text-primary hover:underline p-1" title="Download">
                                                                        💾
                                                                    </a>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            )
                                        })}
									</div>
								)}
                                <div className="flex items-center justify-between mt-1">
                                    <div className="text-[12px] opacity-60">{new Date(m.created_at).toLocaleTimeString()}</div>
                                    <div className="text-[12px] opacity-60 flex items-center gap-1">
                                        <span>{m.read_by && m.read_by.length > 0 ? '✓✓' : '✓'}</span>
                                        {m.read_by && m.read_by.length > 0 ? <span>{m.read_by.length}</span> : null}
                                    </div>
								</div>
                                <button className="absolute top-1 right-1 text-xs opacity-50 hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-primary/50 rounded" title="More" aria-label="More actions" onClick={() => setActionMenuId(actionMenuId === m.id ? null : m.id)}>⋮</button>
                                {actionMenuId === m.id && (
                                    <div className="absolute -top-2 right-0 translate-y-[-100%] bg-popover text-popover-foreground border rounded shadow-sm text-xs" role="menu" aria-label="Message actions">
                                        <div className="flex">
                                            <button title="Reply (R)" className="px-2 py-2 hover:bg-muted/60 focus:outline-none focus:ring-2 focus:ring-primary/50" onClick={() => { setActionMenuId(null); setReplyToId(m.id); }}>↩</button>
                                            <button title="Pin (P)" className="px-2 py-2 hover:bg-muted/60 focus:outline-none focus:ring-2 focus:ring-primary/50" onClick={async () => {
                                                setActionMenuId(null);
                                                try { await fetch(`/api/conversations/${conversationId}/pin/${m.id}`, { method: 'POST', credentials: 'include' }); onPinnedChange?.({ id: m.id, body: m.body, user_name: m.user?.name }) } catch (err) { console.error('Pin failed', err) }
                                            }}>📌</button>
                                        </div>
                                    </div>
                                )}
								{actionMenuId === m.id && (
                                    <div className="absolute top-6 right-0 bg-popover text-popover-foreground border rounded shadow-sm text-xs">
									<button className="block px-3 py-2 w-full text-left hover:bg-muted/60" onClick={() => { setActionMenuId(null); setReplyToId(m.id); }}>Reply</button>
									{isSender && (
										<button className="block px-3 py-2 w-full text-left hover:bg-muted/60" onClick={() => { setActionMenuId(null); setEditingId(m.id); setEditingText(m.body); }}>Edit</button>
									)}
                                    <button className="block px-3 py-2 w-full text-left hover:bg-muted/60" onClick={async () => {
                                        setActionMenuId(null);
                                        try {
                                            await fetch(`/api/conversations/${conversationId}/pin/${m.id}`, { method: 'POST', credentials: 'include' })
                                            onPinnedChange?.({ id: m.id, body: m.body, user_name: m.user?.name })
                                        } catch (err) {
                                            console.error('Pin failed', err)
                                        }
                                    }}>Pin</button>
									{isSender && (
										<button className="block px-3 py-2 w-full text-left hover:bg-muted/60 text-destructive" onClick={async () => {
											setActionMenuId(null)
											if (!confirm('Delete this message?')) return
                                        try { await fetch(`/api/messages/${m.id}`, { method: 'DELETE', credentials: 'include' }) } catch (err) { console.error('Delete failed', err) }
											setMessages(prev => prev.filter(pm => pm.id !== m.id))
										}}>Delete</button>
									)}
								</div>
								)}
							</div>
                            {isSender && (
                                <Avatar className="h-7 w-7 flex-shrink-0">
                                    <AvatarFallback className="text-[10px]">{initials}</AvatarFallback>
                                </Avatar>
                            )}
						</div>
					);
				})}
				<div ref={bottomRef} />
			</div>
			<div className="p-4 flex gap-3 items-center border-t bg-card/50">
                {isRecording ? (
                    <div className="flex-1 flex items-center gap-3 bg-red-50 border border-red-200 rounded px-4 py-3">
                        <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
                        <span className="text-red-700 font-medium">Recording... {recordingTime}s</span>
                        <div className="ml-auto flex gap-2">
                            <button
                                onClick={sendCurrentVoice}
                                disabled={sending}
                                className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                            >
                                Send Voice
                            </button>
                            <button
                                onClick={() => setIsRecording(false)}
                                className="text-red-600 hover:text-red-800"
                            >
                                ✕ Cancel
                            </button>
                        </div>
                    </div>
                ) : (
                    <input
                        value={body}
                        onChange={(e) => {
                            setBody(e.target.value)
                            setTyping(true)
                        }}
                        onBlur={() => setTyping(false)}
                        className="flex-1 border rounded px-4 py-3 text-[18px] focus:outline-none focus:ring-2 focus:ring-primary/40"
                        placeholder="Write a message"
                    />
                )}
				<div className="relative">
                    <button type="button" className="px-2.5 py-2.5 rounded hover:bg-muted/50 text-[18px]" onClick={() => setShowEmoji(v => !v)}>😊</button>
					{showEmoji && (
                        <div className="absolute bottom-12 right-0 bg-popover text-popover-foreground border rounded p-2 shadow-md grid grid-cols-8 gap-1 text-2xl max-w-[360px]">
                            {['😀','😁','😂','🤣','😊','😍','😘','😎','🤩','😉','🙂','🙃','😇','🥳','🤗','🤝','👍','👎','🙏','👏','💯','✅','❌','🔥','✨','🌟','⚡','🎉','🎁','📎','📷','🎙️','🎧','📝','🕒','📍','📌','💡','🔔','🔕','🧠','💬','👀'].map(em => (
								<button key={em} className="hover:bg-muted/50 rounded" onClick={() => { setBody(prev => prev + em); setShowEmoji(false); }}>
									{em}
								</button>
							))}
						</div>
					)}
				</div>
                <button 
                    type="button" 
                    className={`px-2.5 py-2.5 rounded text-[18px] transition-all duration-200 ${
                        isRecording 
                            ? 'bg-red-500 text-white animate-pulse' 
                            : 'hover:bg-muted/50'
                    }`}
                    onClick={async () => {
                        if (isRecording) {
                            // Stop recording
                            setIsRecording(false)
                            setRecordingTime(0)
                            return
                        }

                        try {
                            // Request microphone permission and record voice note
                            const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
                            const chunks: BlobPart[] = []
                            const mimeType = MediaRecorder.isTypeSupported('audio/webm') ? 'audio/webm' : 'audio/mp4'
                            const rec = new MediaRecorder(stream, { mimeType })
                            recorderRef.current = rec

                            // Start recording UI
                            setIsRecording(true)
                            setRecordingTime(0)
                            setError(null)

                            // Recording timer
                            const timer = setInterval(() => {
                                setRecordingTime(prev => prev + 1)
                            }, 1000)

                            rec.ondataavailable = (e) => {
                                if (e.data.size > 0) {
                                    chunks.push(e.data)
                                }
                            }

                            rec.onstop = async () => {
                                clearInterval(timer)
                                setIsRecording(false)
                                setRecordingTime(0)

                                // Stop all tracks to release microphone
                                stream.getTracks().forEach(track => track.stop())

                                if (chunks.length === 0) {
                                    setError('No audio recorded')
                                    return
                                }

                                await sendVoiceMessage(chunks, mimeType)
                            }

                            rec.onerror = (e) => {
                                clearInterval(timer)
                                console.error('Recording error:', e)
                                setError('Recording failed')
                                setIsRecording(false)
                                setRecordingTime(0)
                                setSending(false)
                                stream.getTracks().forEach(track => track.stop())
                            }

                            rec.start()

                            // Auto-stop after 60 seconds max
                            setTimeout(() => {
                                if (rec.state === 'recording') {
                                    rec.stop()
                                }
                            }, 60000)
                        } catch (err) {
                            console.error('Voice recording failed', err)
                            setError('Microphone access denied or recording failed')
                            setIsRecording(false)
                            setRecordingTime(0)
                        }
                    }}
                >
                    {isRecording ? `🔴 ${recordingTime}s` : '🎙️'}
                </button>
                <label className="px-2.5 py-2.5 rounded hover:bg-muted/50 cursor-pointer text-[18px]" title="Attach file">
                    📎
                    <input
                        type="file"
                        onChange={(e) => {
                            const file = e.target.files?.[0]
                            if (file) {
                                setFile(file)
                                setError(null)
                            }
                        }}
                        className="hidden"
                        accept="*/*"
                    />
                </label>
				{file && <span className="text-sm">{file.name}</span>}
                {replyToId && (
                    <div className="text-[11px] text-muted-foreground mr-2">
                        Replying to <button className="underline" onClick={() => setReplyToId(null)}>cancel</button>
                    </div>
                )}
                <button disabled={sending} className="px-4 py-3 bg-primary text-primary-foreground rounded hover:bg-primary/90 disabled:opacity-60 text-[18px]" onClick={send}>{sending ? 'Sending…' : (replyToId ? 'Reply' : 'Send')}</button>
			</div>
			{error && <div className="px-3 pb-3 text-sm text-destructive">{error}</div>}
		</div>
	)
}


