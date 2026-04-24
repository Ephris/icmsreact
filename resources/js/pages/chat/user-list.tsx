import React, { useEffect, useState } from 'react'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Search, Users, Building2, GraduationCap, UserCheck, Crown, Shield } from 'lucide-react'

type User = {
	id: number
	name: string
	role: string
	email?: string
	department?: { name: string }
	company?: { name: string }
	references?: Array<{
		type: string
		student_name?: string
		company_name?: string
		department_name?: string
		assigned_students?: number
	}>
}

interface UserListProps {
	onSelectUser: (user: { id: number; name: string }) => void
}

export default function UserList({ onSelectUser }: UserListProps) {
	const [users, setUsers] = useState<User[]>([])
	const [loading, setLoading] = useState(true)
	const [searchTerm, setSearchTerm] = useState('')
	const [error, setError] = useState<string | null>(null)

	useEffect(() => {
		setLoading(true)
		setError(null)
		fetch('/api/chat/users', { credentials: 'include' })
			.then(async (r) => {
				if (!r.ok) {
					const text = await r.text().catch(() => '')
					throw new Error(text || `Failed to load users (${r.status})`)
				}
				return r.json()
			})
			.then((data) => {
				setUsers(data.users || [])
				setLoading(false)
			})
			.catch(() => {
				setError('Failed to load users')
				setLoading(false)
			})
	}, [])

	const getRoleIcon = (role: string) => {
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

	const getRoleColor = (role: string) => {
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

	const getRoleDisplayName = (role: string) => {
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

	const filteredUsers = users.filter(user =>
		user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
		user.role.toLowerCase().includes(searchTerm.toLowerCase()) ||
		user.department?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
		user.company?.name.toLowerCase().includes(searchTerm.toLowerCase())
	)

	if (loading) {
		return (
			<div className="flex flex-col h-full bg-card">
				<div className="p-6 border-b border-border">
					<div className="flex items-center space-x-2 mb-4">
						<Users className="w-5 h-5 text-primary" />
						<h2 className="text-lg font-semibold text-foreground">Available Users</h2>
					</div>
					<div className="space-y-3">
						{Array.from({ length: 5 }).map((_, i) => (
							<div key={i} className="flex items-center space-x-3 p-3">
								<div className="w-10 h-10 bg-muted rounded-full animate-pulse"></div>
								<div className="flex-1 space-y-2">
									<div className="h-4 bg-muted rounded animate-pulse"></div>
									<div className="h-3 bg-muted rounded w-2/3 animate-pulse"></div>
								</div>
							</div>
						))}
					</div>
				</div>
			</div>
		)
	}

	if (error) {
		return (
			<div className="flex flex-col h-full bg-card">
				<div className="p-6 border-b border-border">
					<div className="flex items-center space-x-2 mb-4">
						<Users className="w-5 h-5 text-primary" />
						<h2 className="text-lg font-semibold text-foreground">Available Users</h2>
					</div>
					<div className="text-destructive text-sm">{error}</div>
				</div>
			</div>
		)
	}

	return (
		<div className="flex flex-col h-full bg-card">
			<div className="p-6 border-b border-border">
				<div className="flex items-center space-x-2 mb-4">
					<Users className="w-5 h-5 text-primary" />
					<h2 className="text-lg font-semibold text-foreground">Available Users</h2>
					<Badge variant="secondary" className="ml-auto">
						{filteredUsers.length}
					</Badge>
				</div>
				<div className="relative">
					<Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
					<Input
						placeholder="Search users by name, role, department, company..."
						value={searchTerm}
						onChange={(e) => setSearchTerm(e.target.value)}
						className="pl-10"
					/>
				</div>
			</div>
			
			<div className="flex-1 overflow-y-auto">
				{filteredUsers.length === 0 ? (
					<div className="flex flex-col items-center justify-center h-full text-center p-6">
						<div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
							<Users className="w-8 h-8 text-muted-foreground" />
						</div>
						<h3 className="text-lg font-medium text-foreground mb-2">
							{searchTerm ? 'No users found' : 'No users available'}
						</h3>
						<p className="text-muted-foreground text-sm">
							{searchTerm 
								? 'Try adjusting your search terms'
								: 'No users are available for chat at the moment'
							}
						</p>
					</div>
				) : (
					<div className="p-2 space-y-2">
						{/* Group by role for quick scanning */}
						{Array.from(new Map(filteredUsers.map(u => [u.role, [] as User[]])).keys()).sort().map(role => {
							const roleUsers = filteredUsers.filter(u => u.role === role)
							return (
								<div key={role}>
									<div className="sticky top-0 z-10 bg-card/80 backdrop-blur px-2 py-1 text-[11px] uppercase tracking-wide text-muted-foreground">
										{getRoleDisplayName(role)} ({roleUsers.length})
									</div>
									<div className="space-y-1">
										{roleUsers.map((user) => (
											<div
												key={user.id}
												onClick={() => onSelectUser({ id: user.id, name: user.name })}
												className="group flex items-center gap-3 p-4 hover:bg-muted/50 cursor-pointer rounded-lg transition-all duration-200 hover:shadow-sm border border-transparent hover:border-border/50"
											>
												<div className="relative">
													<Avatar className="h-10 w-10 ring-2 ring-transparent group-hover:ring-primary/20 transition-all duration-200">
														<AvatarFallback className="text-xs font-medium bg-gradient-to-br from-primary/20 to-primary/10">
															{user.name.split(' ').map(n => n[0]).join('').toUpperCase()}
														</AvatarFallback>
													</Avatar>
													<div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 border-2 border-card rounded-full"></div>
												</div>
												
												<div className="flex-1 min-w-0">
													<div className="flex items-center gap-2 mb-1">
														<div className="font-medium text-sm truncate text-foreground group-hover:text-primary transition-colors">
															{user.name}
														</div>
														<Badge 
															variant="outline" 
															className={`text-[10px] flex items-center gap-1 ${getRoleColor(user.role)}`}
														>
															{getRoleIcon(user.role)}
															{getRoleDisplayName(user.role)}
														</Badge>
													</div>
													{(user.department || user.company) && (
														<div className="flex items-center gap-3 text-[11px] text-muted-foreground">
															{user.department && (
																<div className="flex items-center gap-1">
																	<Building2 className="w-3 h-3" />
																	{user.department.name}
																</div>
															)}
															{user.company && (
																<div className="flex items-center gap-1">
																	<Building2 className="w-3 h-3" />
																	{user.company.name}
																</div>
															)}
														</div>
													)}
													{user.references && user.references.length > 0 && (
														<div className="mt-1 space-y-1">
															{user.references.slice(0, 2).map((ref, idx) => (
																<div key={idx} className="text-[11px] text-primary/80 bg-primary/5 px-2 py-1 rounded-md">
																	{ref.type === 'assigned_student' && (
																		<span>👨‍🎓 {ref.student_name}{ref.company_name && ` @ ${ref.company_name}`}</span>
																	)}
																	{ref.type === 'department_head' && (<span>🏢 {ref.department_name} Head</span>)}
																	{ref.type === 'company_admin' && (<span>🏢 {ref.company_name} Admin</span>)}
																	{ref.type === 'advisor' && (<span>👨‍🏫 Advisor ({ref.assigned_students} students)</span>)}
																	{ref.type === 'supervisor' && (<span>👨‍💼 Supervisor ({ref.assigned_students} students)</span>)}
																</div>
															))}
															{user.references.length > 2 && (
																<div className="text-[11px] text-muted-foreground">+{user.references.length - 2} more</div>
															)}
														</div>
													)}
												</div>
												<div className="opacity-0 group-hover:opacity-100 transition-opacity">
													<div className="w-2 h-2 bg-primary rounded-full"></div>
												</div>
											</div>
										))}
									</div>
								</div>
							)
						})}
					</div>
				)}
			</div>
		</div>
	)
}
