import { useQuery } from '@tanstack/react-query';
import { api } from '../lib/api';
import { useAuth } from '../contexts/AuthContext';
import { Bell, Check, Trash2, FileText, Heart } from 'lucide-react';
import { useState } from 'react';
import { useLanguage } from '../contexts/LanguageContext';

interface Notification {
  _id: string;
  type: string;
  title: string;
  message: string;
  readAt?: string;
  createdAt: string;
}

export function NotificationsPage() {
  const { user } = useAuth();
  const { t, language } = useLanguage();
  const [filter, setFilter] = useState<'all' | 'unread'>('all');

  const { data, isLoading } = useQuery({
    queryKey: ['notifications', filter],
    queryFn: async () => {
      try {
        return await api('/api/v1/admin/notifications') as { data: { notifications: Notification[] } };
      } catch {
        return { data: { notifications: [] } };
      }
    },
    enabled: !!user,
  });

  const notifications: Notification[] = data?.data.notifications ?? [];
  const unreadCount = notifications.filter((n) => !n.readAt).length;

  const notificationIcon = (type: string) => {
    switch (type) {
      case 'match_results_published': return <Heart className="h-5 w-5 text-rose-500" />;
      case 'registration_received': return <Check className="h-5 w-5 text-green-500" />;
      case 'registration_status_changed': return <FileText className="h-5 w-5 text-blue-500" />;
      default: return <Bell className="h-5 w-5 text-gray-500" />;
    }
  };

  const formatTime = (date: string) => {
    const d = new Date(date);
    const now = new Date();
    const diff = now.getTime() - d.getTime();
    if (diff < 60000) return t('Just now');
    if (diff < 3600000) return language === 'fr' ? `Il y a ${Math.floor(diff / 60000)} min` : `${Math.floor(diff / 60000)} min ago`;
    if (diff < 86400000) return language === 'fr' ? `Il y a ${Math.floor(diff / 3600000)} h` : `${Math.floor(diff / 3600000)} hours ago`;
    return d.toLocaleDateString(language === 'fr' ? 'fr-FR' : 'en-US');
  };

  if (!user) {
    return (
      <div className="rounded-xl bg-yellow-50 p-4 text-yellow-700">
        {t('Please sign in to view your notifications.')}
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">{t('Notifications')}</h1>
          <p className="mt-1 text-gray-600">
            {unreadCount > 0 ? (language === 'fr' ? `${unreadCount} notification${unreadCount > 1 ? 's' : ''} non lue${unreadCount > 1 ? 's' : ''}` : `${unreadCount} unread notification${unreadCount > 1 ? 's' : ''}`) : t('All caught up!')}
          </p>
        </div>
        <button className="text-sm font-medium text-rose-600 hover:text-rose-700">
          {t('Mark all as read')}
        </button>
      </div>

      {/* Filter */}
      <div className="flex gap-2">
        <button
          onClick={() => setFilter('all')}
          className={`rounded-full px-4 py-2 text-sm font-medium ${
            filter === 'all' ? 'bg-rose-500 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          {t('All')}
        </button>
        <button
          onClick={() => setFilter('unread')}
          className={`rounded-full px-4 py-2 text-sm font-medium ${
            filter === 'unread' ? 'bg-rose-500 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          {t('Unread')} ({unreadCount})
        </button>
      </div>

      {/* Notifications List */}
      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="animate-pulse rounded-xl bg-white p-4 shadow-sm">
              <div className="flex gap-3">
                <div className="h-10 w-10 rounded-full bg-gray-200" />
                <div className="flex-1">
                  <div className="h-4 w-1/3 bg-gray-200 rounded" />
                  <div className="mt-2 h-3 w-2/3 bg-gray-200 rounded" />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : notifications.length === 0 ? (
        <div className="rounded-xl border border-dashed border-gray-300 p-12 text-center">
          <Bell className="mx-auto h-12 w-12 text-gray-400" />
          <p className="mt-4 text-gray-500">{t('No notifications yet')}</p>
        </div>
      ) : (
        <div className="space-y-3">
          {notifications.map((notification) => (
            <div
              key={notification._id}
              className={`rounded-xl border p-4 shadow-sm ${
                notification.readAt
                  ? 'border-gray-100 bg-white'
                  : 'border-rose-100 bg-rose-50'
              }`}
            >
              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white shadow-sm">
                  {notificationIcon(notification.type)}
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <h3 className={`text-sm font-semibold ${notification.readAt ? 'text-gray-900' : 'text-rose-600'}`}>
                      {notification.title}
                    </h3>
                    <span className="text-xs text-gray-500">{formatTime(notification.createdAt)}</span>
                  </div>
                  <p className="mt-1 text-sm text-gray-600">{notification.message}</p>
                  {!notification.readAt && (
                    <button className="mt-2 text-xs font-medium text-rose-600 hover:text-rose-700">
                      {t('Mark as read')}
                    </button>
                  )}
                </div>
                <button className="text-gray-400 hover:text-red-500" title={t('Delete')} aria-label={t('Delete notification')}>
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
