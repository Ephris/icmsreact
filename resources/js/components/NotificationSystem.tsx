import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  Bell,
  X,
  CheckCircle,
  AlertCircle,
  Info,
  MessageCircle,
  FileText,
  Users,
  Briefcase,
  Clock,
  Eye,
  EyeOff,
  Settings,
  Filter,
  Search,
  Building2,
  BookOpen,
  ClipboardList,
  Megaphone
} from 'lucide-react';
import { usePage } from '@inertiajs/react';

export interface Notification {
  id: string;
  type: 'info' | 'success' | 'warning' | 'error';
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  action_url?: string;
  action_text?: string;
  icon?: string;
}

interface NotificationSystemProps {
  notifications?: Notification[];
  unreadCount?: number;
  markAsRead?: (notificationId: string) => Promise<void>;
  markAllAsRead?: () => Promise<void>;
}

const getNotificationIcon = (type: string, customIcon?: string) => {
  if (customIcon) {
    switch (customIcon) {
      case 'chat':
        return <MessageCircle className="h-5 w-5" />;
      case 'application':
        return <FileText className="h-5 w-5" />;
      case 'assignment':
        return <Users className="h-5 w-5" />;
      case 'posting':
        return <Briefcase className="h-5 w-5" />;
      case 'form':
        return <FileText className="h-5 w-5" />;
      case 'building':
        return <Building2 className="h-5 w-5" />;
      case 'document':
        return <ClipboardList className="h-5 w-5" />;
      case 'story':
        return <BookOpen className="h-5 w-5" />;
      case 'announcement':
        return <Megaphone className="h-5 w-5" />;
      case 'user':
        return <Users className="h-5 w-5" />;
      default:
        return <Info className="h-5 w-5" />;
    }
  }

  switch (type) {
    case 'success':
      return <CheckCircle className="h-5 w-5" />;
    case 'warning':
      return <AlertCircle className="h-5 w-5" />;
    case 'error':
      return <AlertCircle className="h-5 w-5" />;
    default:
      return <Info className="h-5 w-5" />;
  }
};

const getNotificationColor = (type: string) => {
  switch (type) {
    case 'success':
      return 'text-green-600 dark:text-green-400';
    case 'warning':
      return 'text-yellow-600 dark:text-yellow-400';
    case 'error':
      return 'text-red-600 dark:text-red-400';
    default:
      return 'text-blue-600 dark:text-blue-400';
  }
};

const getNotificationBgColor = (type: string) => {
  switch (type) {
    case 'success':
      return 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800';
    case 'warning':
      return 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800';
    case 'error':
      return 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800';
    default:
      return 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800';
  }
};

export default function NotificationSystem({ 
  notifications = [], 
  unreadCount = 0,
  markAsRead: markAsReadProp,
  markAllAsRead: markAllAsReadProp
}: NotificationSystemProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [localNotifications, setLocalNotifications] = useState<Notification[]>(notifications);
  const [localUnreadCount, setLocalUnreadCount] = useState(unreadCount);

  console.log('NotificationSystem render:', { notifications, unreadCount, localNotifications: localNotifications.length, localUnreadCount });

  console.log('NotificationSystem props:', { notifications: notifications.length, unreadCount, localNotifications: localNotifications.length, localUnreadCount });
  const [showSettings, setShowSettings] = useState(false);
  const [showOnlyUnread, setShowOnlyUnread] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'newest' | 'oldest'>('newest');

  // Get user role for role-based notifications
  const pageProps = usePage().props as Record<string, unknown>;
  const userRole = (pageProps.auth as { user?: { role?: string } })?.user?.role || 'guest';

  // Use userRole for role-based filtering
  const getRoleBasedNotifications = () => {
    let filtered = localNotifications;

    // Role-based filtering (this would be enhanced with backend filtering)
    console.log(`Filtering notifications for role: ${userRole}`);

    // Filter by read status
    if (showOnlyUnread) {
      filtered = filtered.filter(notification => !notification.read);
    }

    // Filter by type
    if (filterType !== 'all') {
      filtered = filtered.filter(notification => notification.type === filterType);
    }

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(notification => 
        notification.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        notification.message.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Sort notifications
    filtered.sort((a, b) => {
      const dateA = new Date(a.timestamp).getTime();
      const dateB = new Date(b.timestamp).getTime();
      return sortBy === 'newest' ? dateB - dateA : dateA - dateB;
    });

    return filtered;
  };

  const getNotificationStats = () => {
    const total = localNotifications.length;
    const unread = localNotifications.filter(n => !n.read).length;
    const byType = localNotifications.reduce((acc, n) => {
      acc[n.type] = (acc[n.type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    return { total, unread, byType };
  };

  useEffect(() => {
    console.log('NotificationSystem useEffect:', { notifications: notifications.length, unreadCount });
    setLocalNotifications(notifications);
    setLocalUnreadCount(unreadCount);
  }, [notifications, unreadCount]);

  // Debug: Log when local state changes
  useEffect(() => {
    console.log('Local notifications updated:', { localNotifications: localNotifications.length, localUnreadCount });
  }, [localNotifications, localUnreadCount]);

  const markAsRead = async (notificationId: string) => {
    // Update local state optimistically
    setLocalNotifications(prev => 
      prev.map(notification => 
        notification.id === notificationId 
          ? { ...notification, read: true }
          : notification
      )
    );
    setLocalUnreadCount(prev => Math.max(0, prev - 1));
    
    // Call API to persist the change
    if (markAsReadProp) {
      try {
        await markAsReadProp(notificationId);
      } catch (error) {
        console.error('Failed to mark notification as read:', error);
        // Revert on error
        setLocalNotifications(prev => 
          prev.map(notification => 
            notification.id === notificationId 
              ? { ...notification, read: false }
              : notification
          )
        );
        setLocalUnreadCount(prev => prev + 1);
      }
    } else {
      // Fallback to API call if prop not provided
      try {
        const response = await fetch(`/api/notifications/${notificationId}/read`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
          },
        });
        if (!response.ok) {
          throw new Error('Failed to mark notification as read');
        }
      } catch (error) {
        console.error('Failed to mark notification as read:', error);
        // Revert on error
        setLocalNotifications(prev => 
          prev.map(notification => 
            notification.id === notificationId 
              ? { ...notification, read: false }
              : notification
          )
        );
        setLocalUnreadCount(prev => prev + 1);
      }
    }
  };

  const markAllAsRead = async () => {
    // Update local state optimistically
    setLocalNotifications(prev => 
      prev.map(notification => ({ ...notification, read: true }))
    );
    setLocalUnreadCount(0);
    
    // Call API to persist the change
    if (markAllAsReadProp) {
      try {
        await markAllAsReadProp();
      } catch (error) {
        console.error('Failed to mark all notifications as read:', error);
        // Revert on error - restore unread count
        const unreadCount = localNotifications.filter(n => !n.read).length;
        setLocalUnreadCount(unreadCount);
      }
    } else {
      // Fallback to API call if prop not provided
      try {
        const response = await fetch('/api/notifications/mark-all-read', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
          },
        });
        if (!response.ok) {
          throw new Error('Failed to mark all notifications as read');
        }
      } catch (error) {
        console.error('Failed to mark all notifications as read:', error);
        // Revert on error
        const unreadCount = localNotifications.filter(n => !n.read).length;
        setLocalUnreadCount(unreadCount);
      }
    }
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return date.toLocaleDateString();
  };

  return (
    <div className="relative">
      {/* Notification Bell */}
      <Button
        variant="ghost"
        size="sm"
        onClick={() => {
          console.log('Notification bell clicked, current state:', { isOpen, localUnreadCount, localNotifications: localNotifications.length });
          setIsOpen(!isOpen);
        }}
        className="relative p-2 hover:bg-gray-100 dark:hover:bg-gray-800"
        aria-label="Notifications"
      >
        <Bell className="h-5 w-5" />
        {localUnreadCount > 0 && (
          <Badge
            variant="destructive"
            className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
          >
            {localUnreadCount > 99 ? '99+' : localUnreadCount}
          </Badge>
        )}
      </Button>

      {/* Notification Dropdown */}
      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-96 z-50">
          <Card className="shadow-lg border border-gray-200 dark:border-gray-700">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg font-semibold flex items-center gap-2">
                  Notifications
                  <Badge variant="secondary" className="text-xs">
                    {getNotificationStats().total} ({getNotificationStats().unread} unread)
                  </Badge>
                </CardTitle>
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowSettings(!showSettings)}
                    className="p-1"
                    title="Settings"
                  >
                    <Settings className="h-4 w-4" />
                  </Button>
                  {localUnreadCount > 0 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={markAllAsRead}
                      className="text-xs text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20"
                    >
                      Mark all read
                    </Button>
                  )}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsOpen(false)}
                    className="p-1"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              
              {/* Search and Filter Bar */}
              <div className="flex items-center gap-2 mt-3">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search notifications..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowOnlyUnread(!showOnlyUnread)}
                  className={`p-2 ${showOnlyUnread ? 'bg-blue-100 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400' : ''}`}
                  title={showOnlyUnread ? 'Show all' : 'Show unread only'}
                >
                  {showOnlyUnread ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="p-2"
                  title="Filter by type"
                >
                  <Filter className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              {/* Settings Panel */}
              {showSettings && (
                <div className="p-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Show only unread</span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setShowOnlyUnread(!showOnlyUnread)}
                        className={`p-1 ${showOnlyUnread ? 'bg-blue-100 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400' : ''}`}
                      >
                        {showOnlyUnread ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </Button>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Sort by</span>
                      <select
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value as 'newest' | 'oldest')}
                        className="text-sm border border-gray-300 dark:border-gray-600 rounded px-2 py-1 bg-white dark:bg-gray-800"
                      >
                        <option value="newest">Newest first</option>
                        <option value="oldest">Oldest first</option>
                      </select>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Filter by type</span>
                      <select
                        value={filterType}
                        onChange={(e) => setFilterType(e.target.value)}
                        className="text-sm border border-gray-300 dark:border-gray-600 rounded px-2 py-1 bg-white dark:bg-gray-800"
                      >
                        <option value="all">All types</option>
                        <option value="info">Info</option>
                        <option value="success">Success</option>
                        <option value="warning">Warning</option>
                        <option value="error">Error</option>
                      </select>
                    </div>
                  </div>
                </div>
              )}
              
              <div className="max-h-96 overflow-y-auto">
                {(() => {
                  const filteredNotifications = getRoleBasedNotifications();
                  console.log('Rendering notifications:', filteredNotifications.length);
                  return filteredNotifications.length === 0 ? (
                    <div className="p-6 text-center text-gray-500 dark:text-gray-400">
                      <Bell className="h-12 w-12 mx-auto mb-3 opacity-50" />
                      <p>No notifications found</p>
                      {(searchTerm || showOnlyUnread || filterType !== 'all') && (
                        <p className="text-xs mt-2">Try adjusting your filters</p>
                      )}
                    </div>
                  ) : (
                    <div className="space-y-1">
                      {filteredNotifications.map((notification, index) => (
                        <div key={notification.id}>
                          <div
                            className={`p-4 hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer transition-all duration-200 ${
                              !notification.read
                                ? `${getNotificationBgColor(notification.type)} border-l-4 border-l-blue-500`
                                : 'hover:shadow-sm'
                            }`}
                            onClick={async () => {
                              console.log('Notification clicked:', notification.id);
                              if (!notification.read) {
                                await markAsRead(notification.id);
                              }
                              if (notification.action_url) {
                                // Use Inertia router for SPA navigation instead of window.location
                                import('@inertiajs/react').then(({ router }) => {
                                  router.visit(notification.action_url!);
                                });
                              }
                            }}
                          >
                            <div className="flex items-start gap-3">
                              <div className={`flex-shrink-0 ${getNotificationColor(notification.type)}`}>
                                {getNotificationIcon(notification.type, notification.icon)}
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between">
                                  <p className={`text-sm font-medium ${!notification.read ? 'font-semibold' : ''}`}>
                                    {notification.title}
                                  </p>
                                  {!notification.read && (
                                    <div className="w-2 h-2 bg-blue-600 rounded-full flex-shrink-0 animate-pulse"></div>
                                  )}
                                </div>
                                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1 line-clamp-2">
                                  {notification.message}
                                </p>
                                <div className="flex items-center justify-between mt-2">
                                  <span className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
                                    <Clock className="h-3 w-3" />
                                    {formatTimestamp(notification.timestamp)}
                                  </span>
                                  {notification.action_text && (
                                    <span className="text-xs text-blue-600 dark:text-blue-400 font-medium hover:underline">
                                      {notification.action_text}
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                          {index < filteredNotifications.length - 1 && (
                            <Separator className="mx-4" />
                          )}
                        </div>
                      ))}
                    </div>
                  );
                })()}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
