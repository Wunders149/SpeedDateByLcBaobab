import { jsxs as _jsxs, jsx as _jsx } from "react/jsx-runtime";
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useQuery } from '@tanstack/react-query';
import { api } from '../lib/api';
import { Calendar, FileText, Heart, Bell, User, Clock, MapPin } from 'lucide-react';
export function DashboardPage() {
    const { user, profile } = useAuth();
    const { data: registrationsData } = useQuery({
        queryKey: ['my-registrations'],
        queryFn: async () => {
            const response = await api('/api/v1/events');
            return response;
        },
        enabled: !!user,
    });
    const { data: eventsData } = useQuery({
        queryKey: ['events'],
        queryFn: () => api('/api/v1/events'),
    });
    const events = eventsData?.data.events ?? [];
    const getStatusColor = (status) => {
        switch (status) {
            case 'approved':
                return 'bg-green-100 text-green-700';
            case 'pending_review':
                return 'bg-yellow-100 text-yellow-700';
            case 'waitlisted':
                return 'bg-orange-100 text-orange-700';
            case 'rejected':
                return 'bg-red-100 text-red-700';
            default:
                return 'bg-gray-100 text-gray-700';
        }
    };
    return (_jsxs("div", { className: "space-y-8", children: [_jsxs("div", { className: "rounded-2xl bg-gradient-to-r from-rose-500 to-purple-600 p-8 text-white", children: [_jsxs("h1", { className: "text-3xl font-bold", children: ["Welcome back, ", profile?.displayName?.split(' ')[0] ?? 'there', "!"] }), _jsx("p", { className: "mt-2 text-rose-100", children: user
                            ? "Here's what's happening with your SpeedDate journey."
                            : 'Sign in to see your dashboard.' })] }), _jsxs("div", { className: "grid gap-4 sm:grid-cols-2 lg:grid-cols-4", children: [_jsx("div", { className: "rounded-xl border border-rose-100 bg-white p-4", children: _jsxs("div", { className: "flex items-center gap-3", children: [_jsx("div", { className: "flex h-10 w-10 items-center justify-center rounded-full bg-rose-100", children: _jsx(Calendar, { className: "h-5 w-5 text-rose-600" }) }), _jsxs("div", { children: [_jsx("p", { className: "text-2xl font-bold text-gray-900", children: events.length }), _jsx("p", { className: "text-sm text-gray-500", children: "Upcoming Events" })] })] }) }), _jsx("div", { className: "rounded-xl border border-rose-100 bg-white p-4", children: _jsxs("div", { className: "flex items-center gap-3", children: [_jsx("div", { className: "flex h-10 w-10 items-center justify-center rounded-full bg-purple-100", children: _jsx(FileText, { className: "h-5 w-5 text-purple-600" }) }), _jsxs("div", { children: [_jsx("p", { className: "text-2xl font-bold text-gray-900", children: registrationsData?.data.registrations?.filter((r) => r.questionnaireStatus === 'submitted').length ?? 0 }), _jsx("p", { className: "text-sm text-gray-500", children: "Questionnaires Done" })] })] }) }), _jsx("div", { className: "rounded-xl border border-rose-100 bg-white p-4", children: _jsxs("div", { className: "flex items-center gap-3", children: [_jsx("div", { className: "flex h-10 w-10 items-center justify-center rounded-full bg-pink-100", children: _jsx(Heart, { className: "h-5 w-5 text-pink-600" }) }), _jsxs("div", { children: [_jsx("p", { className: "text-2xl font-bold text-gray-900", children: "0" }), _jsx("p", { className: "text-sm text-gray-500", children: "Matches" })] })] }) }), _jsx("div", { className: "rounded-xl border border-rose-100 bg-white p-4", children: _jsxs("div", { className: "flex items-center gap-3", children: [_jsx("div", { className: "flex h-10 w-10 items-center justify-center rounded-full bg-blue-100", children: _jsx(Bell, { className: "h-5 w-5 text-blue-600" }) }), _jsxs("div", { children: [_jsx("p", { className: "text-2xl font-bold text-gray-900", children: "0" }), _jsx("p", { className: "text-sm text-gray-500", children: "Notifications" })] })] }) })] }), _jsxs("section", { children: [_jsxs("div", { className: "flex items-center justify-between", children: [_jsx("h2", { className: "text-xl font-bold text-gray-900", children: "Upcoming Events" }), _jsx(Link, { to: "/events", className: "text-sm font-medium text-rose-600 hover:text-rose-700", children: "View all" })] }), _jsx("div", { className: "mt-4 grid gap-4 md:grid-cols-2", children: events.slice(0, 4).map((event) => (_jsxs("div", { className: "rounded-xl border border-rose-100 bg-white p-4", children: [_jsxs("div", { className: "flex items-start justify-between", children: [_jsxs("div", { children: [_jsx("h3", { className: "font-semibold text-gray-900", children: event.name }), _jsxs("div", { className: "mt-2 space-y-1 text-sm text-gray-500", children: [_jsxs("div", { className: "flex items-center gap-2", children: [_jsx(MapPin, { className: "h-4 w-4 text-rose-400" }), event.venue] }), _jsxs("div", { className: "flex items-center gap-2", children: [_jsx(Clock, { className: "h-4 w-4 text-rose-400" }), new Date(event.startAt).toLocaleDateString('en-US', { dateStyle: 'long' })] })] })] }), _jsx("span", { className: `rounded-full px-3 py-1 text-xs font-medium ${getStatusColor(event.status)}`, children: event.status.replace('_', ' ') })] }), _jsx(Link, { to: `/events/${event.id}`, className: "mt-4 block rounded-lg bg-rose-50 py-2 text-center text-sm font-medium text-rose-600 hover:bg-rose-100", children: "View Details" })] }, event.id))) })] }), _jsxs("section", { children: [_jsx("h2", { className: "text-xl font-bold text-gray-900", children: "Quick Actions" }), _jsxs("div", { className: "mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3", children: [_jsxs(Link, { to: "/profile", className: "flex items-center gap-3 rounded-xl border border-rose-100 bg-white p-4 transition hover:shadow-md", children: [_jsx(User, { className: "h-8 w-8 text-rose-500" }), _jsxs("div", { children: [_jsx("p", { className: "font-medium text-gray-900", children: "Edit Profile" }), _jsx("p", { className: "text-sm text-gray-500", children: "Update your information" })] })] }), _jsxs(Link, { to: "/questionnaire", className: "flex items-center gap-3 rounded-xl border border-rose-100 bg-white p-4 transition hover:shadow-md", children: [_jsx(FileText, { className: "h-8 w-8 text-purple-500" }), _jsxs("div", { children: [_jsx("p", { className: "font-medium text-gray-900", children: "Questionnaire" }), _jsx("p", { className: "text-sm text-gray-500", children: "Complete your profile" })] })] }), _jsxs(Link, { to: "/matches", className: "flex items-center gap-3 rounded-xl border border-rose-100 bg-white p-4 transition hover:shadow-md", children: [_jsx(Heart, { className: "h-8 w-8 text-pink-500" }), _jsxs("div", { children: [_jsx("p", { className: "font-medium text-gray-900", children: "View Matches" }), _jsx("p", { className: "text-sm text-gray-500", children: "See your compatibility" })] })] })] })] })] }));
}
