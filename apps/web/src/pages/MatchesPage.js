import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useQuery } from '@tanstack/react-query';
import { api } from '../lib/api';
import { useAuth } from '../contexts/AuthContext';
import { Heart } from 'lucide-react';
export function MatchesPage() {
    const { user } = useAuth();
    const { data, isLoading } = useQuery({
        queryKey: ['my-matches'],
        queryFn: async () => {
            // Get first event
            const eventsResponse = (await api('/api/v1/events'));
            const eventId = eventsResponse.data.events[0]?.id;
            if (!eventId)
                return { matches: [] };
            return api(`/api/v1/events/${eventId}/my-matches`);
        },
        enabled: !!user,
    });
    if (!user) {
        return (_jsx("div", { className: "rounded-xl bg-yellow-50 p-4 text-yellow-700", children: "Please sign in to view your matches." }));
    }
    if (isLoading) {
        return (_jsx("div", { className: "flex items-center justify-center py-20", children: _jsx("div", { className: "h-8 w-8 animate-spin rounded-full border-4 border-rose-200 border-t-rose-600" }) }));
    }
    const matches = data?.data.matches ?? [];
    const getScoreColor = (score) => {
        if (score >= 80)
            return 'text-green-600 bg-green-100';
        if (score >= 60)
            return 'text-blue-600 bg-blue-100';
        if (score >= 40)
            return 'text-yellow-600 bg-yellow-100';
        return 'text-red-600 bg-red-100';
    };
    return (_jsxs("div", { className: "space-y-6", children: [_jsxs("div", { children: [_jsx("h1", { className: "text-3xl font-bold text-gray-900", children: "Your Matches" }), _jsx("p", { className: "mt-2 text-gray-600", children: "People you're compatible with" })] }), matches.length === 0 ? (_jsxs("div", { className: "rounded-xl border border-dashed border-gray-300 p-12 text-center", children: [_jsx(Heart, { className: "mx-auto h-12 w-12 text-gray-400" }), _jsx("p", { className: "mt-4 text-gray-500", children: "No matches available yet" }), _jsx("p", { className: "mt-2 text-sm text-gray-400", children: "Matches will be revealed after the event organizer publishes them." })] })) : (_jsx("div", { className: "grid gap-4 md:grid-cols-2", children: matches.map((match) => (_jsxs("div", { className: "rounded-2xl border border-rose-100 bg-white p-6 shadow-sm", children: [_jsxs("div", { className: "flex items-start justify-between", children: [_jsxs("div", { className: "flex items-center gap-3", children: [_jsx("div", { className: "flex h-12 w-12 items-center justify-center rounded-full bg-rose-100", children: _jsx(Heart, { className: "h-6 w-6 text-rose-600" }) }), _jsxs("div", { children: [_jsxs("h3", { className: "font-semibold text-gray-900", children: ["Match #", match.participantId.slice(0, 8)] }), _jsx("p", { className: "text-sm text-gray-500", children: "Compatibility Score" })] })] }), _jsxs("span", { className: `rounded-full px-3 py-1 text-lg font-bold ${getScoreColor(match.mutualScore)}`, children: [match.mutualScore, "%"] })] }), _jsx("div", { className: "mt-4 space-y-2", children: match.categoryScores
                                .slice(0, 3)
                                .map((cat) => (_jsxs("div", { className: "flex items-center justify-between text-sm", children: [_jsx("span", { className: "capitalize text-gray-600", children: cat.category.replace('_', ' ') }), _jsxs("div", { className: "flex items-center gap-2", children: [_jsx("div", { className: "h-2 w-24 rounded-full bg-gray-200", children: _jsx("div", { className: "h-2 rounded-full bg-rose-500", style: { width: `${cat.score * 100}%` } }) }), _jsxs("span", { className: "w-8 text-right text-gray-500", children: [Math.round(cat.score * 100), "%"] })] })] }, cat.category))) }), _jsxs("div", { className: "mt-4 flex gap-2", children: [_jsx("button", { className: "flex-1 rounded-lg bg-rose-500 py-2 text-sm font-semibold text-white hover:bg-rose-600", children: "Express Interest" }), _jsx("button", { className: "flex-1 rounded-lg border border-gray-200 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50", children: "View Profile" })] })] }, match.id))) }))] }));
}
