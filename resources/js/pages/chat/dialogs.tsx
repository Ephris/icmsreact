import React, { useEffect, useState } from 'react'
import { usePage } from '@inertiajs/react'
import { Badge } from '@/components/ui/badge'
import { Building2, GraduationCap, UserCheck, Crown, Shield, Users } from 'lucide-react'

type ConversationItem = {
    id: number
    title?: string
    updated_at: string
    messages?: Array<{ body: string }>
    participants?: Array<{ user?: { name?: string; role?: string; user_id?: number; department?: { name?: string }; company?: { name?: string } } }>
    unread_count?: number
}

interface DialogsProps {
	onSelectConversation: (conversation: { id: number; title?: string }) => void
	currentUserId: number
}

export default function Dialogs({ onSelectConversation, currentUserId }: DialogsProps) {
    const [items, setItems] = useState<ConversationItem[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const page = usePage()
    const props = page.props
    const auth = (props as { auth?: { user?: { name?: string } } })?.auth
    const currentUserName = auth?.user?.name || ''
    useEffect(() => {
        setLoading(true)
        setError(null)
        fetch('/api/conversations', { credentials: 'include' })
            .then(async (r) => {
                if (!r.ok) {
                    const text = await r.text().catch(() => '')
                    throw new Error(text || `Failed to load conversations (${r.status})`)
                }
                return r.json()
            })
            .then((convos: ConversationItem[]) => {
                const enhanced = (convos || [])
                    // De-duplicate direct (1:1) conversations with the same pair of participants
                    .reduce((acc: (ConversationItem & { _pairKey?: string })[], c: ConversationItem) => {
                        try {
                            if (!c || !Array.isArray(c.participants)) return acc.concat([c])
                            const ids = c.participants.map(p => p.user?.user_id).filter((v): v is number => typeof v === 'number').sort((a, b) => a - b)
                            // Only de-dupe for 1:1 conversations (two distinct user ids)
                            const isDirect = ids.length === 2
                            const key = isDirect ? `pair:${ids.join('-')}` : `group:${c.id}`
                            const exists = acc.findIndex(prev => prev._pairKey === key)
                            if (exists >= 0) {
                                const prev = acc[exists]
                                const prevTs = new Date(prev.updated_at).getTime()
                                const curTs = new Date(c.updated_at).getTime()
                                const next: ConversationItem & { _pairKey?: string } = curTs >= prevTs
                                    ? ({ ...(c as unknown as Record<string, unknown>), _pairKey: key } as ConversationItem & { _pairKey?: string })
                                    : prev
                                acc[exists] = next
                                return acc
                            }
                            return acc.concat([({ ...(c as unknown as Record<string, unknown>), _pairKey: key } as ConversationItem & { _pairKey?: string })])
                        } catch {
                            return acc.concat([c as ConversationItem])
                        }
                    }, [])
                    .map((c) => {
                    // Use server-generated title if available, otherwise fallback to client-side generation
                    if (c.title && c.title.trim().length > 0) return c

                    // Fallback client-side generation for older conversations
                    const validParticipants = (c.participants || []).filter(p => p.user && p.user.name)
                    const others = validParticipants
                        .map(p => ({ name: p.user!.name, role: p.user!.role, user_id: p.user!.user_id }))
                        .filter(x => x.name !== currentUserName)
                    if (others.length === 0) {
                        const allOthers = validParticipants
                            .map(p => ({ name: p.user!.name, role: p.user!.role, user_id: p.user!.user_id }))
                            .filter(x => x.user_id !== currentUserId)
                        if (allOthers.length > 0) {
                            const other = allOthers[0]
                            return { ...c, title: `${other.name} ${other.role ? `(${other.role.replace('_',' ')})` : ''}`.trim() }
                        }
                        return { ...c, title: 'Conversation' }
                    }
                    if (others.length === 1) {
                        const other = others[0]
                        return { ...c, title: `${other.name} ${other.role ? `(${other.role.replace('_',' ')})` : ''}`.trim() }
                    }
                    return { ...c, title: `Group (${others.length + 1} members)` }
                })
                // sort like Telegram: latest updated first
                enhanced.sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime())
                setItems(enhanced)
                setLoading(false)
            })
            .catch((error) => {
                console.error('Failed to load conversations:', error)
                setItems([])
                setError('Failed to load conversations')
                setLoading(false)
            })
    }, [currentUserId, currentUserName])

    const getRoleIcon = (role?: string) => {
        if (!role) return <Users className="w-3 h-3" />
        const icons: Record<string, React.ReactElement> = {
            admin: <Crown className="w-3 h-3" />,
            company_admin: <Building2 className="w-3 h-3" />,
            coordinator: <Users className="w-3 h-3" />,
            dept_head: <Shield className="w-3 h-3" />,
            supervisor: <UserCheck className="w-3 h-3" />,
            advisor: <GraduationCap className="w-3 h-3" />,
            student: <GraduationCap className="w-3 h-3" />,
        }
        return icons[role] || <Users className="w-3 h-3" />
    }

    const getRoleColor = (role?: string) => {
        if (!role) return 'bg-gray-500/10 text-gray-600 border-gray-200'
        const colors: Record<string, string> = {
            admin: 'bg-red-500/10 text-red-600 border-red-200',
            company_admin: 'bg-blue-500/10 text-blue-600 border-blue-200',
            coordinator: 'bg-green-500/10 text-green-600 border-green-200',
            dept_head: 'bg-purple-500/10 text-purple-600 border-purple-200',
            supervisor: 'bg-orange-500/10 text-orange-600 border-orange-200',
            advisor: 'bg-teal-500/10 text-teal-600 border-teal-200',
            student: 'bg-gray-500/10 text-gray-600 border-gray-200',
        }
        return colors[role] || 'bg-gray-500/10 text-gray-600 border-gray-200'
    }

    const getRoleDisplayName = (role?: string) => {
        if (!role) return 'User'
        const names: Record<string, string> = {
            admin: 'Admin',
            company_admin: 'Company Admin',
            coordinator: 'Coordinator',
            dept_head: 'Department Head',
            supervisor: 'Supervisor',
            advisor: 'Advisor',
            student: 'Student',
        }
        return names[role] || role
    }

	return (
        <div className="flex flex-col h-full bg-background text-[18px]">
            <div className="p-4 border-b bg-muted/50 sticky top-0 z-10 backdrop-blur supports-[backdrop-filter]:bg-muted/40">
				<div className="flex items-center justify-between">
                    <div className="font-semibold text-xl">Chats</div>
                    <div className="text-sm text-muted-foreground">{items.length} {items.length === 1 ? 'chat' : 'chats'}</div>
				</div>
			</div>
            <div className="flex-1 overflow-y-auto">
                {loading ? (
                    <div className="p-4 space-y-3">
                        {Array.from({ length: 6 }).map((_, i) => (
                            <div key={i} className="h-14 bg-muted/50 rounded animate-pulse" />
                        ))}
                    </div>
                ) : error ? (
                    <div className="p-4 text-center text-destructive">{error}</div>
                ) : items.length === 0 ? (
                    <div className="p-4 text-center text-muted-foreground">No conversations yet</div>
                ) : (
                        items.map((c) => {
                        const title = c.title || 'Conversation'
                        const initials = title.split(' ').map(s => s[0]).join('').slice(0,2).toUpperCase()
                        const others = (c.participants || []).map(p => p.user).filter(u => u && (u.user_id !== currentUserId)) as Array<{ name?: string; role?: string; department?: { name?: string }; company?: { name?: string } }>
                        const primary = others[0]
                        return (
                        <div
                            key={c.id}
                            onClick={() => onSelectConversation({ id: c.id, title: c.title })}
                            className="px-4 py-3 hover:bg-muted/60 cursor-pointer border-b border-border/50 transition-all duration-200 hover:shadow-sm"
                        >
                            <div className="flex items-center gap-3">
                                <div className="relative">
                                    <div className="h-11 w-11 rounded-full bg-gradient-to-br from-primary/30 to-primary/10 text-primary flex items-center justify-center text-xs font-semibold" title={title} aria-hidden>
                                        {initials}
                                    </div>
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center justify-between">
                                        <div className={`${c.unread_count && c.unread_count > 0 ? 'font-semibold' : 'font-medium'} truncate`}>{title}</div>
                                        <div className="text-[12px] text-muted-foreground">{new Date(c.updated_at).toLocaleTimeString()}</div>
                                    </div>
                                    <div className="flex items-center gap-2 mt-0.5">
                                        {primary?.role && (
                                            <Badge variant="outline" className={`text-[11px] flex items-center gap-1 ${getRoleColor(primary.role)}`}>
                                                {getRoleIcon(primary.role)}
                                                {getRoleDisplayName(primary.role)}
                                            </Badge>
                                        )}
                                        <div className="text-[13px] text-muted-foreground truncate">{c.messages?.[0]?.body || 'No messages yet'}</div>
                                    </div>
                                    {(primary?.department?.name || primary?.company?.name) && (
                                        <div className="flex items-center gap-3 text-[12px] text-muted-foreground mt-1">
                                            {primary?.department?.name && (
                                                <div className="flex items-center gap-1">
                                                    <Building2 className="w-3 h-3" />
                                                    {primary.department.name}
                                                </div>
                                            )}
                                            {primary?.company?.name && (
                                                <div className="flex items-center gap-1">
                                                    <Building2 className="w-3 h-3" />
                                                    {primary.company.name}
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                                <div className="flex flex-col items-end gap-1">
                                    {c.unread_count && c.unread_count > 0 ? (
                                        <div className="min-w-[22px] h-5 px-1.5 rounded-full bg-primary text-primary-foreground text-[11px] flex items-center justify-center font-semibold">
                                            {c.unread_count}
                                        </div>
                                    ) : (
                                        <div className="w-2 h-2 bg-green-500 rounded-full" />
                                    )}
                                </div>
                            </div>
                        </div>
                    )})
				)}
			</div>
		</div>
	)
}


