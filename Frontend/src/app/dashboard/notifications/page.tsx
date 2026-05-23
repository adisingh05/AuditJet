'use client';

import { useEffect, useState } from 'react';
import api from '../../../lib/api';
import { Notification } from '../../../types';
import { formatDate } from '../../../lib/utils';

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      const { data } = await api.get('/notifications');
      setNotifications(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (id: string) => {
    try {
      await api.patch(`/notifications/${id}/read`);
      setNotifications(prev =>
        prev.map(n => n.id === id ? { ...n, readAt: new Date().toISOString() } : n)
      );
    } catch (err) { console.error(err); }
  };

  const markAllRead = async () => {
    try {
      await api.patch('/notifications/read-all');
      setNotifications(prev =>
        prev.map(n => ({ ...n, readAt: new Date().toISOString() }))
      );
    } catch (err) { console.error(err); }
  };

  const typeIcons: Record<string, string> = {
    info: '💡',
    warning: '⚠️',
    error: '🚨',
    success: '✅',
  };

  const typeColors: Record<string, string> = {
    info: 'border-blue-500/30 bg-blue-500/5',
    warning: 'border-yellow-500/30 bg-yellow-500/5',
    error: 'border-red-500/30 bg-red-500/5',
    success: 'border-green-500/30 bg-green-500/5',
  };

  const unreadCount = notifications.filter(n => !n.readAt).length;

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500" />
    </div>
  );

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Notifications</h1>
          <p className="text-gray-400 mt-1">
            {unreadCount > 0 ? `${unreadCount} unread notifications` : 'All caught up!'}
          </p>
        </div>
        {unreadCount > 0 && (
          <button
            onClick={markAllRead}
            className="bg-gray-800 hover:bg-gray-700 text-gray-300 px-4 py-2 rounded-lg text-sm transition-colors"
          >
            Mark all as read
          </button>
        )}
      </div>

      {notifications.length === 0 ? (
        <div className="bg-gray-900 rounded-2xl p-12 border border-gray-800 text-center">
          <p className="text-4xl mb-4">🔔</p>
          <p className="text-white font-semibold">No notifications yet</p>
          <p className="text-gray-400 text-sm mt-1">
            Notifications will appear here as you use the platform
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {notifications.map(notification => (
            <div
              key={notification.id}
              className={`bg-gray-900 rounded-2xl p-5 border transition-colors ${!notification.readAt
                  ? typeColors[notification.type] || 'border-blue-500/30 bg-blue-500/5'
                  : 'border-gray-800'
                }`}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-3 flex-1">
                  <span className="text-2xl">
                    {typeIcons[notification.type] || '🔔'}
                  </span>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className={`font-semibold text-sm ${!notification.readAt ? 'text-white' : 'text-gray-400'}`}>
                        {notification.title}
                      </h3>
                      {!notification.readAt && (
                        <span className="w-2 h-2 bg-blue-500 rounded-full" />
                      )}
                      <span className={`px-2 py-0.5 rounded-full text-xs ${notification.priority === 'critical' ? 'bg-red-500/20 text-red-400' :
                          notification.priority === 'high' ? 'bg-orange-500/20 text-orange-400' :
                            'bg-gray-700 text-gray-400'
                        }`}>
                        {notification.priority}
                      </span>
                    </div>
                    <p className="text-gray-400 text-sm">{notification.message}</p>
                    <p className="text-gray-600 text-xs mt-2">{formatDate(notification.createdAt)}</p>
                  </div>
                </div>
                {!notification.readAt && (
                  <button
                    onClick={() => markAsRead(notification.id)}
                    className="text-blue-400 hover:text-blue-300 text-xs whitespace-nowrap"
                  >
                    Mark read
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
