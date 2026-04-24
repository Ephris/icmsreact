import Dialogs from './dialogs'
import Thread from './thread'
import UserList from './user-list'
import { useState } from 'react'
import AppLayout from '@/layouts/app-layout'
import { usePage } from '@inertiajs/react'

type ConversationSummary = {
     id: number
     participants?: Array<{ user?: { name?: string; user_id?: number } }>
}

export default function ChatIndex() {
	const [activeId, setActiveId] = useState<number | null>(null)
	const [activeTitle, setActiveTitle] = useState<string>('')
	const [pinned, setPinned] = useState<{ id: number; body: string; user_name?: string } | null>(null)
    const { props } = usePage()
    const currentUserName: string = (props as unknown as { auth?: { user?: { name?: string } } })?.auth?.user?.name || ''
    const currentUserId: number = (props as unknown as { auth?: { user?: { user_id?: number; id?: number } } })?.auth?.user?.user_id || (props as unknown as { auth?: { user?: { id?: number } } })?.auth?.user?.id || 0

	async function ensureTitleFromServer(conversationId: number, fallbackName?: string) {
		try {
			const res = await fetch(`/api/conversations/${conversationId}`, { credentials: 'include' })
			if (!res.ok) return
			const convo: { id: number; title?: string; participants?: Array<{ user?: { name?: string; role?: string } }>; pinned_summary?: { id: number; body: string; user_name?: string } } = await res.json()
			// Server now generates titles, so use it directly
			if (convo.title && convo.title.trim().length > 0) {
				setActiveTitle(convo.title)
				return
			}
			// Fallback for older conversations
			const other = (convo.participants || [])
				.map(p => ({ name: p.user?.name, role: p.user?.role }))
				.find(p => p.name && p.name !== currentUserName)
			if (other?.name) setActiveTitle(`${other.name}${other.role ? ` (${other.role.replace('_',' ')})` : ''}`)
			else if (fallbackName) setActiveTitle(fallbackName)
			setPinned(convo.pinned_summary || null)
		} catch { /* ignore */ }
	}
	const [activeTab, setActiveTab] = useState<'conversations' | 'users'>('conversations')
	
	return (
		<AppLayout breadcrumbs={[{ title: 'Chat', href: '/chat' }]}>
            <div className="h-screen flex flex-col bg-background text-[18px]">
				{/* Header */}
				<div className="flex-shrink-0 border-b border-border bg-card">
					<div className="flex items-center justify-between px-6 py-5">
						<div className="flex items-center space-x-4">
							<div className="flex space-x-1 bg-muted rounded-lg p-1">
								<button
									onClick={() => setActiveTab('conversations')}
									className={`px-5 py-2.5 text-base font-medium rounded-md transition-all duration-200 ${
										activeTab === 'conversations'
											? 'bg-background text-foreground shadow-sm'
											: 'text-muted-foreground hover:text-foreground hover:bg-background/50'
									}`}
								>
									💬 Conversations
								</button>
								<button
									onClick={() => setActiveTab('users')}
									className={`px-5 py-2.5 text-base font-medium rounded-md transition-all duration-200 ${
										activeTab === 'users'
											? 'bg-background text-foreground shadow-sm'
											: 'text-muted-foreground hover:text-foreground hover:bg-background/50'
									}`}
								>
									👥 Start New Chat
								</button>
							</div>
						</div>
						<div className="flex items-center space-x-2">
						<div className="w-2.5 h-2.5 bg-green-500 rounded-full animate-pulse"></div>
						<span className="text-base text-muted-foreground">Online</span>
						</div>
					</div>
				</div>
				
                {/* Main Content */}
				<div className="flex-1 flex overflow-hidden flex-col md:flex-row">
                    {/* Sidebar */}
					<div className="w-full md:w-96 border-b md:border-b-0 md:border-r border-border bg-card flex flex-col">
						{activeTab === 'conversations' ? (
							<Dialogs onSelectConversation={(c) => { setActiveId(c.id); setActiveTitle(c.title || 'Conversation') }} currentUserId={currentUserId} />
						) : (
							<UserList onSelectUser={async (user) => {
								try {
									// Use Blade meta CSRF token; Laravel will validate header automatically
									const csrf = (document.querySelector('meta[name="csrf-token"]') as HTMLMetaElement | null)?.content || ''
									const xsrf = document.cookie.split('; ').find((c) => c.startsWith('XSRF-TOKEN='))?.split('=')[1]
									const response = await fetch('/api/conversations', {
										method: 'POST',
										headers: {
											'Content-Type': 'application/json',
											'X-Requested-With': 'XMLHttpRequest',
											'Accept': 'application/json',
											'X-CSRF-TOKEN': csrf,
											...(xsrf ? { 'X-XSRF-TOKEN': decodeURIComponent(xsrf) } : {}),
										},
										credentials: 'include',
										body: JSON.stringify({
											participant_ids: [user.id],
											is_group: false,
										}),
									})
									
									if (response.ok) {
										const conversation = await response.json()
										setActiveId(conversation.id)
										setActiveTitle(user.name)
										ensureTitleFromServer(conversation.id, user.name)
										setActiveTab('conversations')
									} else {
										const text = await response.text().catch(() => '')
										console.error('Failed to create conversation', response.status, text)
										// Fallback: refresh list and try to open existing 1:1 if it already exists
										try {
											const listRes = await fetch('/api/conversations', { credentials: 'include' })
									                                const list: ConversationSummary[] = listRes.ok ? await listRes.json() : []
									                                // Find 1:1 conversation with exactly the current user and selected user
									                                const match = (list || []).find((c) =>
											Array.isArray(c.participants) &&
											c.participants.length === 2 &&
											c.participants.some((p) => p.user?.user_id === currentUserId) &&
											c.participants.some((p) => p.user?.user_id === user.id)
										 )
											if (match) {
												setActiveId(match.id)
												setActiveTitle(user.name)
												ensureTitleFromServer(match.id, user.name)
												setActiveTab('conversations')
											}
									                                } catch { /* ignore */ }
									}
								} catch (error) {
									console.error('Error creating conversation:', error)
								}
							}} />
						)}
					</div>
					
				{/* Chat Area */}
				<div className="flex-1 flex flex-col bg-background">
					{activeId ? (
			    <>
						<Thread conversationId={activeId} title={activeTitle} currentUserId={currentUserId} pinned={pinned ? { id: pinned.id, body: pinned.body, user_name: pinned.user_name } : null} onPinnedChange={(p: { id: number; body: string; user_name?: string } | null) => setPinned(p)} />
			    </>
				) : (
							<div className="flex-1 flex items-center justify-center bg-gradient-to-br from-muted/20 to-background">
								<div className="text-center max-w-md mx-auto px-6">
									<div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-primary/20 to-primary/10 rounded-full flex items-center justify-center">
										<div className="text-4xl">💬</div>
									</div>
									<h3 className="text-xl font-semibold text-foreground mb-2">
										{activeTab === 'conversations' 
											? 'Select a conversation'
											: 'Start a new conversation'
										}
									</h3>
									<p className="text-muted-foreground mb-6">
										{activeTab === 'conversations' 
											? 'Choose from your existing conversations to continue chatting'
											: 'Select a user from the list to start a new conversation'
										}
									</p>
									<div className="flex items-center justify-center space-x-2 text-sm text-muted-foreground">
										<div className="w-2 h-2 bg-green-500 rounded-full"></div>
										<span>Real-time messaging powered by Laravel Echo</span>
									</div>
						</div>
					</div>
				)}
			</div>
		</div>
			</div>
		</AppLayout>
	)
}


