import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { api } from '../lib/api';
import { Calendar, MapPin, Clock, Users } from 'lucide-react';
export function EventsPage() {
    const { data, isLoading, error } = useQuery({
        queryKey: ['events'],
        queryFn: () => api('/api/v1/events'),
    });
    if (isLoading) {
        return (_jsx("div", { className: "flex items-center justify-center py-20", children: _jsx("div", { className: "h-8 w-8 animate-spin rounded-full border-4 border-rose-200 border-t-rose-600" }) }));
    }
    if (error) {
        return (_jsx("div", { className: "rounded-xl bg-red-50 p-4 text-red-600", children: "Failed to load events. Please try again." }));
    }
    const events = data?.data.events ?? [];
    return (_jsxs("div", { className: "space-y-6", children: [_jsxs("div", { children: [_jsx("h1", { className: "text-3xl font-bold text-gray-900", children: "Events" }), _jsx("p", { className: "mt-2 text-gray-600", children: "Discover upcoming SpeedDate events near you" })] }), events.length === 0 ? (_jsxs("div", { className: "rounded-xl border border-dashed border-gray-300 p-12 text-center", children: [_jsx(Calendar, { className: "mx-auto h-12 w-12 text-gray-400" }), _jsx("p", { className: "mt-4 text-gray-500", children: "No upcoming events at the moment" })] })) : (_jsx("div", { className: "grid gap-6 md:grid-cols-2", children: events.map((event) => (_jsxs("div", { className: "rounded-2xl border border-rose-100 bg-white p-6 shadow-sm transition hover:shadow-md", children: [_jsxs("div", { className: "flex items-start justify-between", children: [_jsx("h2", { className: "text-xl font-semibold text-gray-900", children: event.name }), _jsx("span", { className: "rounded-full bg-rose-100 px-3 py-1 text-xs font-medium text-rose-700", children: event.status.replace('_', ' ') })] }), _jsx("p", { className: "mt-2 text-sm text-gray-600", children: event.description }), _jsxs("div", { className: "mt-4 space-y-2 text-sm text-gray-500", children: [_jsxs("div", { className: "flex items-center gap-2", children: [_jsx(MapPin, { className: "h-4 w-4 text-rose-400" }), event.venue] }), _jsxs("div", { className: "flex items-center gap-2", children: [_jsx(Clock, { className: "h-4 w-4 text-rose-400" }), new Date(event.startAt).toLocaleDateString('en-US', { dateStyle: 'long' })] }), _jsxs("div", { className: "flex items-center gap-2", children: [_jsx(Users, { className: "h-4 w-4 text-rose-400" }), event.registeredCount, "/", event.capacity, " registered"] })] }), _jsxs("div", { className: "mt-4 flex gap-2", children: [_jsx(Link, { to: `/events/${event.id}`, className: "flex-1 rounded-lg bg-rose-500 py-2 text-center text-sm font-semibold text-white hover:bg-rose-600", children: "View Details" }), _jsx(Link, { to: "/register", className: "flex-1 rounded-lg border border-rose-200 py-2 text-center text-sm font-semibold text-rose-600 hover:bg-rose-50", children: "Register" })] })] }, event.id))) }))] }));
}
