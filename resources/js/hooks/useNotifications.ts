import { useState, useEffect, useCallback } from 'react';
import { usePage } from '@inertiajs/react';
import { Notification } from '@/components/NotificationSystem';

// Extend Window interface to include Echo
declare global {
  interface Window {
    Echo: {
      private: (channel: string) => {
        listen: (event: string, callback: (data: unknown) => void) => void;
        leave: (channel: string) => void;
      };
    };
  }
}

interface NotificationData {
  notifications: Notification[];
  unreadCount: number;
}

interface ApiNotification {
  id: string;
  type: string;
  title: string;
  message: string;
  timestamp: string;
  action_url?: string;
  action_text?: string;
  icon?: string;
  read: boolean;
}

interface NotificationPayload {
  id?: string;
  type?: string;
  title: string;
  message: string;
  timestamp?: string;
  action_url?: string;
  action_text?: string;
  icon?: string;
}

interface AuthUser {
  role: string;
  user_id?: number;
  id?: number;
}

interface PageProps {
  auth?: {
    user?: AuthUser;
  };
  [key: string]: unknown;
}

interface NotificationTemplate {
  title: string;
  message: string;
  icon?: string;
  action_url?: string;
  action_text?: string;
}

export function useNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isConnected, setIsConnected] = useState(false);

  const pageProps = usePage<PageProps>().props;
  const auth = pageProps.auth;
  const userRole = auth?.user?.role || 'guest';
  const userId = auth?.user?.user_id || auth?.user?.id;

  const fetchNotifications = useCallback(async () => {
    try {
      console.log('Fetching notifications from API...');
      const response = await fetch('/api/notifications');
      console.log('API response status:', response.status);
      if (response.ok) {
        const data: NotificationData = await response.json();
        console.log('Raw API data:', data);
        const formattedNotifications = data.notifications.map((notification: ApiNotification) => ({
          id: notification.id,
          type: (notification.type as 'info' | 'success' | 'warning' | 'error') || 'info',
          title: notification.title,
          message: notification.message,
          timestamp: notification.timestamp,
          read: notification.read,
          action_url: normalizeActionUrl(
            userRole,
            notification.action_url,
            notification.type,
            notification as unknown as Record<string, unknown>
          ),
          action_text: notification.action_text,
          icon: notification.icon,
        }));
        console.log('Formatted notifications:', formattedNotifications);
        setNotifications(formattedNotifications);
        setUnreadCount(data.unreadCount);
        console.log('Set notifications state:', formattedNotifications.length, 'unread:', data.unreadCount);
      } else {
        console.error('Failed to fetch notifications:', response.status, response.statusText);
        const errorText = await response.text();
        console.error('Error response:', errorText);
      }
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
    }
  }, [userRole]);

  useEffect(() => {
    console.log('useNotifications hook initialized with role:', userRole, 'userId:', userId);

    // Initialize notifications from server
    fetchNotifications();

    // Set up Laravel Echo for real-time notifications
    if (window.Echo && userRole !== 'guest') {
      console.log('Setting up Echo listener for role:', userRole);
      try {
        const channel = window.Echo.private(`notifications.${userRole}`);

        channel.listen('.notification.received', (data: unknown) => {
          console.log('Real-time notification received:', data);
          const payload = data as NotificationPayload;
          const resolvedActionUrl = normalizeActionUrl(
            userRole,
            payload.action_url,
            payload.type || 'info',
            payload as unknown as Record<string, unknown>
          );
          const newNotification: Notification = {
            id: payload.id || Date.now().toString(),
            type: (payload.type as 'info' | 'success' | 'warning' | 'error') || 'info',
            title: payload.title,
            message: payload.message,
            timestamp: payload.timestamp || new Date().toISOString(),
            read: false,
            action_url: resolvedActionUrl,
            action_text: payload.action_text,
            icon: payload.icon,
          };

          console.log('Adding new notification to state:', newNotification);
          setNotifications(prev => [newNotification, ...prev]);
          setUnreadCount(prev => prev + 1);
        });

        setIsConnected(true);
        console.log('Echo listener set up successfully');

        return () => {
          console.log('Cleaning up Echo listener for role:', userRole);
          try {
            channel.leave(`notifications.${userRole}`);
          } catch (error) {
            console.warn('Error leaving channel:', error);
          }
          setIsConnected(false);
        };
      } catch (error) {
        console.error('Error setting up Echo listener:', error);
        setIsConnected(false);
      }
    } else {
      console.log('Echo not available or user is guest');
    }
  }, [userRole, userId, fetchNotifications]);

  // Re-fetch notifications when user logs in or role changes
  useEffect(() => {
    if (userRole !== 'guest') {
      console.log('User role changed to:', userRole, 'fetching notifications...');
      fetchNotifications();
    }
  }, [userRole, fetchNotifications]);

  

  const markAsRead = async (notificationId: string) => {
    try {
      const response = await fetch(`/api/notifications/${notificationId}/read`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
        },
      });
      
      if (response.ok) {
        // Update local state optimistically
        setNotifications(prev => 
          prev.map(notification => 
            notification.id === notificationId 
              ? { ...notification, read: true }
              : notification
          )
        );
        setUnreadCount(prev => Math.max(0, prev - 1));
        
        // Refetch to ensure sync with backend
        await fetchNotifications();
      }
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      const response = await fetch('/api/notifications/mark-all-read', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
        },
      });
      
      if (response.ok) {
        // Update local state optimistically
        setNotifications(prev => 
          prev.map(notification => ({ ...notification, read: true }))
        );
        setUnreadCount(0);
        
        // Refetch to ensure sync with backend
        await fetchNotifications();
      }
    } catch (error) {
      console.error('Failed to mark all notifications as read:', error);
    }
  };

  const createNotification = (notification: Omit<Notification, 'id' | 'timestamp' | 'read'>) => {
    const newNotification: Notification = {
      ...notification,
      id: Date.now().toString(),
      timestamp: new Date().toISOString(),
      read: false,
    };
    
    setNotifications(prev => [newNotification, ...prev]);
    setUnreadCount(prev => prev + 1);
  };

  const simulateNotification = (
    type: string,
    data: Record<string, unknown> = {}
  ) => {
    const template = getNotificationTemplate(type, data);
    const simulated: Omit<Notification, 'id' | 'timestamp' | 'read'> = {
      type: (type as 'info' | 'success' | 'warning' | 'error') || 'info',
      title: (template.title as string) || 'Notification',
      message: (template.message as string) || 'Test notification',
      action_text: template.action_text,
      icon: template.icon,
      action_url: normalizeActionUrl(userRole, template.action_url, type, data),
    };
    createNotification(simulated);
  };

  return {
    notifications,
    unreadCount,
    isConnected,
    markAsRead,
    markAllAsRead,
    createNotification,
    fetchNotifications,
    simulateNotification,
  };
}

// Role-based notification types
export const getRoleBasedNotificationTypes = (role: string) => {
  switch (role) {
    case 'admin':
      return [
        'new_chat',
        'user_registration',
        'system_alert',
        'application_status_change',
        'user_status_changed',
        'role_changed',
        'system_maintenance',
        'new_announcement',
      ];
    case 'coordinator':
      return [
        'new_chat',
        'new_accepted_application',
        'approved_letter_by_company_admin',
        'student_status_change',
        'user_status_changed',
        'posting_status_changed',
        'assignment_status_changed',
        'new_feedback',
        'deadline_approaching',
        'new_announcement',
      ];
    case 'company_admin':
      return [
        'new_chat',
        'new_application',
        'accepted_application_by_student',
        'supervisor_assignment',
        'user_status_changed',
        'posting_status_changed',
        'assignment_status_changed',
        'new_feedback',
        'deadline_approaching',
        'new_announcement',
      ];
    case 'supervisor':
      return [
        'new_chat',
        'new_assignment',
        'new_form',
        'status_change',
        'student_update',
        'user_status_changed',
        'assignment_status_changed',
        'forms_status_changed',
        'new_feedback',
        'deadline_approaching',
        'new_announcement',
      ];
    case 'dept_head':
      return [
        'new_chat',
        'accepted_applications',
        'student_registration',
        'advisor_assignment',
        'user_status_changed',
        'assignment_status_changed',
        'new_feedback',
        'deadline_approaching',
        'new_announcement',
        'analytics_submitted',
      ];
    case 'student':
      return [
        'new_chat',
        'new_posting',
        'application_status_changed',
        'new_form',
        'status_changed',
        'advisor_feedback',
        'user_status_changed',
        'posting_status_changed',
        'assignment_status_changed',
        'forms_status_changed',
        'new_feedback',
        'deadline_approaching',
        'new_announcement',
      ];
    case 'advisor':
      return [
        'new_chat',
        'assigned_students',
        'student_application_changes',
        'forms_status_changed',
        'student_update',
        'user_status_changed',
        'assignment_status_changed',
        'new_feedback',
        'deadline_approaching',
        'new_announcement',
      ];
    default:
      return ['new_chat'];
  }
};

// Notification templates
export const getNotificationTemplate = (type: string, data: Record<string, unknown>): NotificationTemplate => {
  switch (type) {
    case 'new_chat':
      return {
        title: 'New Message',
        message: `You have a new message from ${data.sender_name}`,
        icon: 'chat',
        // Chat route is role-based; leave undefined to be resolved per user role
        action_url: undefined,
        action_text: 'View Chat',
      };
    case 'new_application':
      return {
        title: 'New Application',
        message: `${data.student_name} applied for ${data.posting_title}`,
        icon: 'application',
        action_url: `/company-admin/applications/${data.application_id}`,
        action_text: 'Review Application',
      };
    case 'accepted_application_by_student':
      return {
        title: 'Application Accepted',
        message: `${data.student_name} accepted your offer for ${data.posting_title}`,
        icon: 'application',
        action_url: `/company-admin/applications/${data.application_id}`,
        action_text: 'View Details',
      };
    case 'new_posting':
      return {
        title: 'New Job Posting',
        message: `New ${data.posting_type} opportunity: ${data.posting_title}`,
        icon: 'posting',
        action_url: `/student/postings/${data.posting_id}`,
        action_text: 'View Posting',
      };
    case 'application_status_changed':
      return {
        title: 'Application Status Update',
        message: `Your application for ${data.posting_title} is now ${data.status}`,
        icon: 'application',
        action_url: `/student/applications/${data.application_id}`,
        action_text: 'View Application',
      };
    case 'approved_letter_by_company_admin':
      return {
        title: 'Application Letter Approved',
        message: `Application letter for ${data.student_name} has been approved`,
        icon: 'application',
        action_url: `/coordinator/departments/${data.department_id}/students`,
        action_text: 'View Student',
      };
    case 'new_assignment':
      return {
        title: 'New Assignment',
        message: `You have been assigned to supervise ${data.student_name}`,
        icon: 'assignment',
        // Company supervisor routes don't expose assignments by id; deep link to student if available
        action_url: getValue<string | number>(data, 'student_id')
          ? `/company-supervisor/students/${getValue<string | number>(data, 'student_id')}`
          : '/company-supervisor/students',
        action_text: 'View Assignment',
      };
    case 'assigned_students':
      return {
        title: 'New Student Assignment',
        message: `You have been assigned to advise ${data.student_name}`,
        icon: 'assignment',
        // Faculty advisor prefix per routes
        action_url: getValue<string | number>(data, 'student_id')
          ? `/faculty-advisor/students/${getValue<string | number>(data, 'student_id')}`
          : '/faculty-advisor/students',
        action_text: 'View Student',
      };
    case 'forms_status_changed':
      return {
        title: 'Form Status Update',
        message: `Form "${String(getValue<string | number>(data, 'form_name') ?? '')}" status changed to ${String(getValue<string | number>(data, 'status') ?? '')}`,
        icon: 'form',
        action_url: getValue<string>(data, 'form_url'),
        action_text: 'View Form',
      };
    case 'user_status_changed':
      return {
        title: 'Account Status Update',
        message: `Your account has been ${getValue<string>(data, 'new_status') === 'active' ? 'activated' : 'deactivated'}`,
        icon: 'user',
        action_url: '/profile',
        action_text: 'View Profile',
      };
    case 'posting_status_changed':
      return {
        title: 'Posting Status Update',
        message: `Posting "${getValue<string>(data, 'posting_title')}" is now ${getValue<string>(data, 'new_status')}`,
        icon: 'posting',
        action_url: getValue<string>(data, 'posting_id') ? `/student/postings/${getValue<string>(data, 'posting_id')}` : '/student/postings',
        action_text: 'View Posting',
      };
    case 'assignment_status_changed':
      return {
        title: 'Assignment Status Update',
        message: `Assignment status changed to ${getValue<string>(data, 'new_status')}`,
        icon: 'assignment',
        action_url: getValue<string>(data, 'assignment_id') ? `/student/assignments/${getValue<string>(data, 'assignment_id')}` : '/student/assignments',
        action_text: 'View Assignment',
      };
    case 'role_changed':
      return {
        title: 'Role Updated',
        message: `Your role has been changed to ${getValue<string>(data, 'new_role')}`,
        icon: 'user',
        action_url: '/profile',
        action_text: 'View Profile',
      };
    case 'new_feedback':
      return {
        title: 'New Feedback',
        message: `You have received new ${getValue<string>(data, 'feedback_type')} feedback`,
        icon: 'feedback',
        action_url: '/feedback',
        action_text: 'View Feedback',
      };
    case 'system_maintenance':
      return {
        title: 'System Maintenance',
        message: getValue<string>(data, 'message') || 'System maintenance scheduled',
        icon: 'info',
        action_url: '/dashboard',
        action_text: 'View Dashboard',
      };
    case 'deadline_approaching':
      return {
        title: 'Deadline Approaching',
        message: `${getValue<string>(data, 'item_type')} "${getValue<string>(data, 'item_name')}" deadline is approaching`,
        icon: 'clock',
        action_url: '/deadlines',
        action_text: 'View Deadlines',
      };
    case 'new_announcement':
      return {
        title: 'New Announcement',
        message: getValue<string>(data, 'message') || 'New announcement available',
        icon: 'announcement',
        action_url: '/announcements',
        action_text: 'View Announcements',
      };
    default:
      return {
        title: 'Notification',
        message: typeof getValue<string>(data, 'message') === 'string'
          ? (getValue<string>(data, 'message') as string)
          : 'You have a new notification',
        icon: 'info',
      };
  }
};

// Resolve or normalize action URLs per user role and notification type
function normalizeActionUrl(
  role: string,
  providedUrl: string | undefined,
  type: string,
  data: Record<string, unknown>
): string | undefined {
  if (providedUrl && typeof providedUrl === 'string') return providedUrl;

  // No URL provided; compute sensible defaults per type/role
  switch (type) {
    case 'new_chat': {
      const roleToChatPath: Record<string, string> = {
        admin: '/admin/chat',
        coordinator: '/coordinator/chat',
        company_admin: '/company-admin/chat',
        supervisor: '/company-supervisor/chat',
        dept_head: '/department-head/chat',
        advisor: '/faculty-advisor/chat',
        student: '/student/chat',
      };
      return roleToChatPath[role] || '/dashboard';
    }
    case 'new_posting': {
      const postingId = getValue<string | number>(data, 'posting_id');
      return postingId ? `/student/postings/${postingId}` : '/student/postings';
    }
    case 'application_status_changed': {
      const appId = getValue<string | number>(data, 'application_id');
      return appId ? `/student/applications/${appId}` : '/student/applications';
    }
    case 'approved_letter_by_company_admin': {
      const deptId = getValue<string | number>(data, 'department_id');
      return deptId ? `/coordinator/departments/${deptId}/students` : '/coordinator/departments';
    }
    case 'new_assignment': {
      const studentId = getValue<string | number>(data, 'student_id');
      return studentId ? `/company-supervisor/students/${studentId}` : '/company-supervisor/students';
    }
    case 'assigned_students': {
      const studentId = getValue<string | number>(data, 'student_id');
      return studentId ? `/faculty-advisor/students/${studentId}` : '/faculty-advisor/students';
    }
    case 'forms_status_changed': {
      const formUrl = getValue<string>(data, 'form_url');
      return formUrl;
    }
    case 'accepted_application_by_student': {
      if (role === 'coordinator') {
        const deptId = getValue<string | number>(data, 'department_id');
        return deptId ? `/coordinator/departments/${deptId}/students` : '/coordinator/departments';
      } else if (role === 'dept_head') {
        return '/department-head/accepted-applications';
      } else if (role === 'company_admin') {
        const appId = getValue<string | number>(data, 'application_id');
        return appId ? `/company-admin/applications/${appId}` : '/company-admin/applications';
      }
      return '/dashboard';
    }
    case 'letter_approved': {
      if (role === 'coordinator') {
        const letterId = getValue<string | number>(data, 'letter_id');
        return letterId ? `/coordinator/application-letters/${letterId}/view` : '/coordinator/application-letters';
      }
      return '/dashboard';
    }
    case 'application_letter_status': {
      if (role === 'student') {
        return '/student/application-letter';
      }
      return '/dashboard';
    }
    case 'user_status_changed': {
      if (role === 'admin') {
        const userId = getValue<string | number>(data, 'user_id');
        return userId ? `/users/${userId}` : '/users';
      }
      return '/profile';
    }
    case 'profile_updated': {
      if (role === 'admin') {
        const userId = getValue<string | number>(data, 'user_id') || getValue<string | number>(data, 'sender_id');
        return userId ? `/users/${userId}` : '/users';
      }
      return '/profile';
    }
    case 'success_story_posted': {
      if (role === 'admin') {
        return '/admin/homepage';
      }
      return '/dashboard';
    }
    case 'success_story_status': {
      if (role === 'student') {
        return '/student/success-stories';
      }
      return '/dashboard';
    }
    case 'new_application': {
      if (role === 'company_admin') {
        const appId = getValue<string | number>(data, 'application_id');
        return appId ? `/company-admin/applications/${appId}` : '/company-admin/applications';
      }
      return '/dashboard';
    }
    case 'student_application_changes': {
      if (role === 'advisor') {
        const appId = getValue<string | number>(data, 'application_id');
        return appId ? `/faculty-advisor/applications/${appId}` : '/faculty-advisor/applications';
      }
      return '/dashboard';
    }
    case 'form_sent_back': {
      if (role === 'advisor') {
        const formId = getValue<string | number>(data, 'form_id');
        return formId ? `/faculty-advisor/forms/${formId}` : '/faculty-advisor/forms';
      } else if (role === 'student') {
        const formUrl = getValue<string>(data, 'form_url');
        return formUrl || '/student/forms';
      } else if (role === 'supervisor') {
        const formId = getValue<string | number>(data, 'form_id');
        return formId ? `/company-supervisor/forms/${formId}` : '/company-supervisor/forms';
      }
      return '/dashboard';
    }
    case 'department_created': {
      if (role === 'coordinator') {
        return '/coordinator/departments';
      } else if (role === 'admin') {
        const deptId = getValue<string | number>(data, 'department_id');
        return deptId ? `/departments/${deptId}` : '/departments';
      }
      return '/dashboard';
    }
    case 'account_deactivation_warning': {
      if (role === 'student') return '/student/analytics';
      return undefined;
    }
    case 'deadline_approaching': {
      if (role === 'student') return '/student/applications';
      if (role === 'advisor') return '/faculty-advisor/applications';
      if (role === 'dept_head') return '/department-head/accepted-applications';
      if (role === 'company_admin') return '/company-admin/applications';
      return '/dashboard';
    }
    case 'system_maintenance': {
      return '/dashboard';
    }
    default: {
      const fallback: Record<string, string> = {
        admin: '/dashboard',
        coordinator: '/coordinator/departments',
        company_admin: '/company-admin',
        supervisor: '/company-supervisor',
        dept_head: '/department-head',
        advisor: '/faculty-advisor',
        student: '/student',
      };
      return fallback[role] || '/dashboard';
    }
  }
}

function getValue<T>(obj: Record<string, unknown>, key: string): T | undefined {
  if (obj && Object.prototype.hasOwnProperty.call(obj, key)) {
    return obj[key] as T;
  }
  return undefined;
}
