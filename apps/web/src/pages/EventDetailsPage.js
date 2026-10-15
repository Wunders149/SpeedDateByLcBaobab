import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useQuery, useMutation } from '@tanstack/react-query';
import { api } from '../lib/api';
import { useAuth } from '../contexts/AuthContext';
import { Calendar, MapPin, Clock, Users, ArrowLeft, AlertCircle } from 'lucide-react';
import { useState } from 'react';
export function EventDetailsPage() {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [registering, setRegistering] = useState(false);
    const { eventId } = useParams();
    const { data, isLoading, error } = useQuery({
        queryKey: ['event', eventId],
        queryFn: () => api(`/api/v1/events/${eventId}`),
        enabled: !!eventId,
    });
    const registerMutation = useMutation({
        mutationFn: () => api(`/api/v1/events/${eventId}/registrations`, {
            method: 'POST',
            body: JSON.stringify({ participantId: user?.id }),
        }),
        onSuccess: () => {
            setRegistering(false);
            alert('Registration submitted successfully!');
            navigate('/dashboard');
        },
        onError: (err) => {
            setRegistering(false);
            alert(err.message);
        },
    });
    if (isLoading) {
        return (_jsx("div", { className: "flex items-center justify-center py-20", children: _jsx("div", { className: "h-8 w-8 animate-spin rounded-full border-4 border-rose-200 border-t-rose-600" }) }));
    }
    if (error || !data) {
        return (_jsx("div", { className: "rounded-xl bg-red-50 p-4 text-red-600", children: "Event not found or failed to load." }));
    }
    const event = data.data.event;
    const spotsLeft = event.capacity - event.registeredCount;
    const registrationOpen = event.status === 'registration_open' && new Date() < new Date(event.registrationDeadline);
    const isFull = spotsLeft <= 0;
    const formatDate = (date) => new Date(date).toLocaleDateString('en-US', { dateStyle: 'full' });
    const formatTime = (date) => new Date(date).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    return (_jsxs("div", { className: "mx-auto max-w-4xl space-y-8", children: [_jsxs(Link, { to: "/events", className: "inline-flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-rose-600", children: [_jsx(ArrowLeft, { className: "h-4 w-4" }), "Back to Events"] }), _jsx("div", { className: "rounded-3xl bg-gradient-to-br from-rose-500 to-purple-600 p-8 text-white", children: _jsxs("div", { className: "flex items-start justify-between", children: [_jsxs("div", { children: [_jsx("h1", { className: "text-3xl font-bold md:text-4xl", children: event.name }), _jsx("p", { className: "mt-2 text-rose-100", children: event.description })] }), _jsx("span", { className: "rounded-full bg-white/20 px-4 py-1 text-sm", children: event.status.replace(/_/g, ' ') })] }) }), _jsxs("div", { className: "grid gap-6 lg:grid-cols-2", children: [_jsxs("div", { className: "rounded-2xl border border-rose-100 bg-white p-6 shadow-sm", children: [_jsx("h2", { className: "text-lg font-semibold text-gray-900", children: "Event Details" }), _jsxs("div", { className: "mt-4 space-y-4", children: [_jsxs("div", { className: "flex items-start gap-3", children: [_jsx(Calendar, { className: "mt-0.5 h-5 w-5 text-rose-500" }), _jsxs("div", { children: [_jsx("p", { className: "text-sm font-medium text-gray-900", children: "Date & Time" }), _jsx("p", { className: "text-sm text-gray-600", children: formatDate(event.startAt) }), _jsxs("p", { className: "text-sm text-gray-600", children: [formatTime(event.startAt), " \u2013 ", formatTime(event.endAt)] })] })] }), _jsxs("div", { className: "flex items-start gap-3", children: [_jsx(MapPin, { className: "mt-0.5 h-5 w-5 text-rose-500" }), _jsxs("div", { children: [_jsx("p", { className: "text-sm font-medium text-gray-900", children: "Venue" }), _jsx("p", { className: "text-sm text-gray-600", children: event.venue }), _jsxs("p", { className: "text-xs text-gray-500", children: ["Timezone: ", event.timezone] })] })] }), _jsxs("div", { className: "flex items-start gap-3", children: [_jsx(Users, { className: "mt-0.5 h-5 w-5 text-rose-500" }), _jsxs("div", { children: [_jsx("p", { className: "text-sm font-medium text-gray-900", children: "Capacity" }), _jsxs("p", { className: "text-sm text-gray-600", children: [event.registeredCount, "/", event.capacity, " registered"] }), _jsx("p", { className: `text-sm ${isFull ? 'text-red-500 font-medium' : 'text-green-600'}`, children: isFull ? 'Event is full' : `${spotsLeft} spots remaining` })] })] }), _jsxs("div", { className: "flex items-start gap-3", children: [_jsx(Clock, { className: "mt-0.5 h-5 w-5 text-rose-500" }), _jsxs("div", { children: [_jsx("p", { className: "text-sm font-medium text-gray-900", children: "Registration Deadline" }), _jsx("p", { className: "text-sm text-gray-600", children: formatDate(event.registrationDeadline) })] })] })] })] }), _jsxs("div", { className: "rounded-2xl border border-rose-100 bg-white p-6 shadow-sm", children: [_jsx("h2", { className: "text-lg font-semibold text-gray-900", children: "Register" }), !user ? (_jsxs("div", { className: "mt-4 space-y-4", children: [_jsxs("div", { className: "flex items-center gap-2 rounded-lg bg-blue-50 p-3 text-sm text-blue-700", children: [_jsx(AlertCircle, { className: "h-4 w-4" }), "Please log in to register for this event."] }), _jsx(Link, { to: "/login", className: "block rounded-lg bg-rose-500 py-3 text-center font-semibold text-white", children: "Log In" })] })) : isFull ? (_jsx("div", { className: "mt-4 rounded-lg bg-red-50 p-4 text-sm text-red-700", children: "This event is currently full. You may be added to the waitlist if you register." })) : registrationOpen ? (_jsxs("div", { className: "mt-4 space-y-4", children: [_jsx("p", { className: "text-sm text-gray-600", children: "Ready to join? Register now and complete the questionnaire to be matched with compatible participants." }), _jsx("button", { onClick: () => {
                                            setRegistering(true);
                                            registerMutation.mutate();
                                        }, disabled: registering, className: "w-full rounded-lg bg-rose-500 py-3 font-semibold text-white hover:bg-rose-600 disabled:opacity-50", children: registering ? 'Registering...' : 'Register Now' })] })) : (_jsx("div", { className: "mt-4 rounded-lg bg-yellow-50 p-4 text-sm text-yellow-700", children: "Registration is currently closed for this event." })), event.instructions && (_jsxs("div", { className: "mt-6", children: [_jsx("h3", { className: "text-sm font-semibold text-gray-900", children: "Instructions" }), _jsx("p", { className: "mt-2 text-sm text-gray-600", children: event.instructions })] }))] })] })] }));
}
