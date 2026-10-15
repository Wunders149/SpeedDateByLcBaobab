import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '../lib/api';
import { useAuth } from '../contexts/AuthContext';
import { Heart, Sparkles, Star, ArrowRight, MessageCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
export function MatchRevealPage() {
    const { user } = useAuth();
    const [revealed, setRevealed] = useState(false);
    const { data, isLoading } = useQuery({
        queryKey: ['my-results'],
        queryFn: async () => {
            const eventsResponse = await api('/api/v1/events');
            const eventId = eventsResponse.data.events[0]?.id;
            if (!eventId)
                return null;
            return api(`/api/v1/events/${eventId}/my-results`);
        },
        enabled: !!user,
    });
    useEffect(() => {
        const timer = setTimeout(() => setRevealed(true), 2000);
        return () => clearTimeout(timer);
    }, []);
    if (!user) {
        return (_jsx("div", { className: "rounded-xl bg-yellow-50 p-4 text-yellow-700", children: "Please sign in to view your match results." }));
    }
    const results = data?.data.results;
    return (_jsx("div", { className: "mx-auto max-w-3xl space-y-8", children: _jsx("div", { className: "text-center", children: !revealed ? (_jsxs("div", { className: "space-y-6 py-12", children: [_jsxs("div", { className: "relative mx-auto h-32 w-32", children: [_jsx("div", { className: "absolute inset-0 animate-ping rounded-full bg-rose-300 opacity-30" }), _jsx("div", { className: "relative flex h-32 w-32 items-center justify-center rounded-full bg-gradient-to-br from-rose-500 to-purple-600", children: _jsx(Heart, { className: "h-16 w-16 text-white" }) })] }), _jsx("h1", { className: "text-3xl font-bold text-gray-900", children: "Revealing your matches..." }), _jsx("p", { className: "text-gray-600", children: "Hold on, something exciting is happening!" })] })) : (_jsxs("div", { className: "space-y-8", children: [_jsxs("div", { className: "text-center", children: [_jsx(Sparkles, { className: "mx-auto h-12 w-12 text-rose-500" }), _jsx("h1", { className: "mt-4 text-4xl font-bold text-gray-900", children: "Your Match Results" }), _jsx("p", { className: "mt-2 text-lg text-gray-600", children: results?.mutualMatches ? `You have ${results.mutualMatches} mutual match${results.mutualMatches > 1 ? 'es' : ''}!` : 'Your results are available.' })] }), _jsxs("div", { className: "grid gap-4 sm:grid-cols-2", children: [_jsxs("div", { className: "rounded-xl border border-rose-100 bg-white p-6 text-center", children: [_jsx(Heart, { className: "mx-auto h-8 w-8 text-rose-500" }), _jsx("p", { className: "mt-2 text-3xl font-bold text-gray-900", children: results?.totalMatches ?? 0 }), _jsx("p", { className: "text-sm text-gray-600", children: "Total Matches" })] }), _jsxs("div", { className: "rounded-xl border border-rose-100 bg-white p-6 text-center", children: [_jsx(Star, { className: "mx-auto h-8 w-8 text-amber-500" }), _jsx("p", { className: "mt-2 text-3xl font-bold text-gray-900", children: results?.mutualMatches ?? 0 }), _jsx("p", { className: "text-sm text-gray-600", children: "Mutual Matches" })] })] }), results?.matches && results.matches.length > 0 && (_jsx("div", { className: "space-y-4", children: results.matches.map((match, index) => (_jsxs("div", { className: "rounded-2xl border border-rose-100 bg-white p-6 shadow-sm", children: [_jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { className: "flex items-center gap-3", children: [_jsx("div", { className: "flex h-12 w-12 items-center justify-center rounded-full bg-rose-100", children: _jsx(Heart, { className: "h-6 w-6 text-rose-500" }) }), _jsxs("div", { children: [_jsxs("h3", { className: "font-semibold text-gray-900", children: ["Match #", index + 1] }), _jsx("p", { className: "text-sm text-gray-500", children: "Compatibility Score" })] })] }), _jsxs("span", { className: "rounded-full bg-rose-100 px-4 py-2 text-xl font-bold text-rose-600", children: [match.score, "%"] })] }), _jsxs("div", { className: "mt-4 flex gap-2", children: [_jsxs("button", { className: "flex-1 rounded-lg bg-rose-500 py-2 text-sm font-semibold text-white hover:bg-rose-600", children: [_jsx(MessageCircle, { className: "mr-1 inline h-4 w-4" }), "Send Message"] }), _jsx("button", { className: "flex-1 rounded-lg border border-gray-200 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50", children: "View Profile" })] })] }, match.id))) })), !results?.mutualMatches && results?.matches && results.matches.length > 0 && (_jsx("div", { className: "rounded-xl bg-blue-50 p-4 text-center text-blue-700", children: _jsx("p", { className: "text-sm", children: "Tip: Express interest in your matches to increase your chances of a mutual connection!" }) })), _jsx("div", { className: "text-center", children: _jsxs(Link, { to: "/dashboard", className: "inline-flex items-center gap-2 text-sm font-medium text-rose-600 hover:text-rose-700", children: [_jsx(ArrowRight, { className: "h-4 w-4 rotate-180" }), "Back to Dashboard"] }) })] })) }) }));
}
