import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useQuery } from '@tanstack/react-query';
import { api } from '../lib/api';
import { useAuth } from '../contexts/AuthContext';
import { Bell, Check, Trash2, Heart, FileText } from 'lucide-react';
import { useState } from 'react';
export function NotificationsPage() {
    const { user } = useAuth();
    const [filter, setFilter] = useState('all');
    const { data, isLoading } = useQuery({
        queryKey: ['notifications', filter],
        queryFn: async () => {
            try {
                return await api('/api/v1/admin/notifications');
            }
            catch {
                return { data: { notifications: [] } };
            }
        },
        enabled: !!user,
    });
    const notifications = data?.data.notifications ?? [];
    const unreadCount = notifications.filter((n) => !n.readAt).length;
    const notificationIcon = (type) => {
        switch (type) {
            case 'match_results_published': return _jsx(Heart, { className: "h-5 w-5 text-rose-500" });
            case 'registration_received': return _jsx(Check, { className: "h-5 w-5 text-green-500" });
            case 'registration_status_changed': return _jsx(FileText, { className: "h-5 w-5 text-blue-500" });
            default: return _jsx(Bell, { className: "h-5 w-5 text-gray-500" });
        }
    };
    const formatTime = (date) => {
        const d = new Date(date);
        const now = new Date();
        const diff = now.getTime() - d.getTime();
        if (diff < 60000)
            return 'Just now';
        if (diff < 3600000)
            return `${Math.floor(diff / 60000)} min ago`;
        if (diff < 86400000)
            return `${Math.floor(diff / 3600000)} hours ago`;
        return d.toLocaleDateString();
    };
    if (!user) {
        return (_jsx("div", { className: "rounded-xl bg-yellow-50 p-4 text-yellow-700", children: "Please sign in to view your notifications." }));
    }
    return (_jsxs("div", { className: "mx-auto max-w-2xl space-y-6", children: [_jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { children: [_jsx("h1", { className: "text-3xl font-bold text-gray-900", children: "Notifications" }), _jsx("p", { className: "mt-1 text-gray-600", children: unreadCount > 0 ? `${unreadCount} unread notification${unreadCount > 1 ? 's' : ''}` : 'All caught up!' })] }), _jsx("button", { className: "text-sm font-medium text-rose-600 hover:text-rose-700", children: "Mark all as read" })] }), _jsxs("div", { className: "flex gap-2", children: [_jsx("button", { onClick: () => setFilter('all'), className: `rounded-full px-4 py-2 text-sm font-medium ${filter === 'all' ? 'bg-rose-500 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`, children: "All" }), _jsxs("button", { onClick: () => setFilter('unread'), className: `rounded-full px-4 py-2 text-sm font-medium ${filter === 'unread' ? 'bg-rose-500 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`, children: ["Unread (", unreadCount, ")"] })] }), isLoading ? (_jsx("div", { className: "space-y-3", children: [1, 2, 3].map((i) => (_jsx("div", { className: "animate-pulse rounded-xl bg-white p-4 shadow-sm", children: _jsxs("div", { className: "flex gap-3", children: [_jsx("div", { className: "h-10 w-10 rounded-full bg-gray-200" }), _jsxs("div", { className: "flex-1", children: [_jsx("div", { className: "h-4 w-1/3 bg-gray-200 rounded" }), _jsx("div", { className: "mt-2 h-3 w-2/3 bg-gray-200 rounded" })] })] }) }, i))) })) : notifications.length === 0 ? (_jsxs("div", { className: "rounded-xl border border-dashed border-gray-300 p-12 text-center", children: [_jsx(Bell, { className: "mx-auto h-12 w-12 text-gray-400" }), _jsx("p", { className: "mt-4 text-gray-500", children: "No notifications yet" })] })) : (_jsx("div", { className: "space-y-3", children: notifications.map((notification) => (_jsx("div", { className: `rounded-xl border p-4 shadow-sm ${notification.readAt
                        ? 'border-gray-100 bg-white'
                        : 'border-rose-100 bg-rose-50'}`, children: _jsxs("div", { className: "flex items-start gap-3", children: [_jsx("div", { className: "flex h-10 w-10 items-center justify-center rounded-full bg-white shadow-sm", children: notificationIcon(notification.type) }), _jsxs("div", { className: "flex-1", children: [_jsxs("div", { className: "flex items-center justify-between", children: [_jsx("h3", { className: `text-sm font-semibold ${notification.readAt ? 'text-gray-900' : 'text-rose-600'}`, children: notification.title }), _jsx("span", { className: "text-xs text-gray-500", children: formatTime(notification.createdAt) })] }), _jsx("p", { className: "mt-1 text-sm text-gray-600", children: notification.message }), !notification.readAt && (_jsx("button", { className: "mt-2 text-xs font-medium text-rose-600 hover:text-rose-700", children: "Mark as read" }))] }), _jsx("button", { className: "text-gray-400 hover:text-red-500", title: "Delete", "aria-label": "Delete notification", children: _jsx(Trash2, { className: "h-4 w-4" }) })] }) }, notification._id))) }))] }));
}
