import React from 'react';
import { useNotifications } from '@/hooks/useNotifications';

export default function DevNotificationsTrigger() {
  const { simulateNotification } = useNotifications();

  // Hide in production builds
  // Vite exposes import.meta.env.DEV as boolean at build-time
  if (!('env' in import.meta) || (import.meta as { env?: { DEV?: boolean } }).env?.DEV !== true) {
    return null;
  }

  return (
    <div className="flex flex-wrap gap-2 items-center">
      <button
        className="border px-2 py-1 rounded text-xs"
        onClick={() => simulateNotification('new_posting', { posting_id: 123, posting_title: 'Frontend Intern', posting_type: 'Internship' })}
      >
        Simulate Posting
      </button>
      <button
        className="border px-2 py-1 rounded text-xs"
        onClick={() => simulateNotification('application_status_changed', { application_id: 456, posting_title: 'Backend Intern', status: 'Approved' })}
      >
        Simulate App Status
      </button>
      <button
        className="border px-2 py-1 rounded text-xs"
        onClick={() => simulateNotification('new_chat', { sender_name: 'Support Bot' })}
      >
        Simulate Chat
      </button>
      <button
        className="border px-2 py-1 rounded text-xs"
        onClick={() => simulateNotification('user_status_changed', { old_status: 'active', new_status: 'inactive' })}
      >
        Simulate User Status
      </button>
      <button
        className="border px-2 py-1 rounded text-xs"
        onClick={() => simulateNotification('posting_status_changed', { posting_title: 'React Developer', old_status: 'draft', new_status: 'open', posting_id: 123 })}
      >
        Simulate Posting Status
      </button>
      <button
        className="border px-2 py-1 rounded text-xs"
        onClick={() => simulateNotification('assignment_status_changed', { old_status: 'pending', new_status: 'active', assignment_id: 456 })}
      >
        Simulate Assignment Status
      </button>
      <button
        className="border px-2 py-1 rounded text-xs"
        onClick={() => simulateNotification('role_changed', { old_role: 'student', new_role: 'advisor' })}
      >
        Simulate Role Change
      </button>
      <button
        className="border px-2 py-1 rounded text-xs"
        onClick={() => simulateNotification('new_feedback', { feedback_type: 'application', sender_name: 'Dr. Smith' })}
      >
        Simulate Feedback
      </button>
      <button
        className="border px-2 py-1 rounded text-xs"
        onClick={() => simulateNotification('deadline_approaching', { item_type: 'Application', item_name: 'Summer Internship', deadline: '2024-12-31' })}
      >
        Simulate Deadline
      </button>
      <button
        className="border px-2 py-1 rounded text-xs"
        onClick={() => simulateNotification('new_announcement', { message: 'System maintenance scheduled for tonight' })}
      >
        Simulate Announcement
      </button>
    </div>
  );
}


