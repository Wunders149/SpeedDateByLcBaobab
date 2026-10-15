import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '../lib/api';
import { useAuth } from '../contexts/AuthContext';
import { Heart, Sparkles, Star, ArrowRight, MessageCircle } from 'lucide-react';
import { Link } from 'react-router-dom';

export function MatchRevealPage() {
  const { user } = useAuth();
  const [revealed, setRevealed] = useState(false);

  const { data } = useQuery({
    queryKey: ['my-results'],
    queryFn: async () => {
      const eventsResponse = await api('/api/v1/events') as unknown as { data: { events: Array<{ id: string }> } };
      const eventId = eventsResponse.data.events[0]?.id;
      if (!eventId) return null;
      return api(`/api/v1/events/${eventId}/my-results`) as unknown as { data: Record<string, unknown> };
    },
    enabled: !!user,
  });

  useEffect(() => {
    const timer = setTimeout(() => setRevealed(true), 2000);
    return () => clearTimeout(timer);
  }, []);

  if (!user) {
    return (
      <div className="rounded-xl bg-yellow-50 p-4 text-yellow-700">
        Please sign in to view your match results.
      </div>
    );
  }

  const results = data?.data.results as { totalMatches?: number; mutualMatches?: number; matches?: Array<{ id: string; score: number }> } | null;

  return (
    <div className="mx-auto max-w-3xl space-y-8">
      {/* Reveal Animation */}
      <div className="text-center">
        {!revealed ? (
          <div className="space-y-6 py-12">
            <div className="relative mx-auto h-32 w-32">
              <div className="absolute inset-0 animate-ping rounded-full bg-rose-300 opacity-30" />
              <div className="relative flex h-32 w-32 items-center justify-center rounded-full bg-gradient-to-br from-rose-500 to-purple-600">
                <Heart className="h-16 w-16 text-white" />
              </div>
            </div>
            <h1 className="text-3xl font-bold text-gray-900">Revealing your matches...</h1>
            <p className="text-gray-600">Hold on, something exciting is happening!</p>
          </div>
        ) : (
          <div className="space-y-8">
            <div className="text-center">
              <Sparkles className="mx-auto h-12 w-12 text-rose-500" />
              <h1 className="mt-4 text-4xl font-bold text-gray-900">Your Match Results</h1>
              <p className="mt-2 text-lg text-gray-600">
                {results?.mutualMatches ? `You have ${results.mutualMatches} mutual match${results.mutualMatches > 1 ? 'es' : ''}!` : 'Your results are available.'}
              </p>
            </div>

            {/* Stats */}
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-xl border border-rose-100 bg-white p-6 text-center">
                <Heart className="mx-auto h-8 w-8 text-rose-500" />
                <p className="mt-2 text-3xl font-bold text-gray-900">{results?.totalMatches ?? 0}</p>
                <p className="text-sm text-gray-600">Total Matches</p>
              </div>
              <div className="rounded-xl border border-rose-100 bg-white p-6 text-center">
                <Star className="mx-auto h-8 w-8 text-amber-500" />
                <p className="mt-2 text-3xl font-bold text-gray-900">{results?.mutualMatches ?? 0}</p>
                <p className="text-sm text-gray-600">Mutual Matches</p>
              </div>
            </div>

            {/* Matches */}
            {results?.matches && results.matches.length > 0 && (
              <div className="space-y-4">
                {results.matches.map((match, index) => (
                  <div key={match.id} className="rounded-2xl border border-rose-100 bg-white p-6 shadow-sm">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-rose-100">
                          <Heart className="h-6 w-6 text-rose-500" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900">Match #{index + 1}</h3>
                          <p className="text-sm text-gray-500">Compatibility Score</p>
                        </div>
                      </div>
                      <span className="rounded-full bg-rose-100 px-4 py-2 text-xl font-bold text-rose-600">
                        {match.score}%
                      </span>
                    </div>
                    <div className="mt-4 flex gap-2">
                      <button className="flex-1 rounded-lg bg-rose-500 py-2 text-sm font-semibold text-white hover:bg-rose-600">
                        <MessageCircle className="mr-1 inline h-4 w-4" />
                        Send Message
                      </button>
                      <button className="flex-1 rounded-lg border border-gray-200 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50">
                        View Profile
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {!results?.mutualMatches && results?.matches && results.matches.length > 0 && (
              <div className="rounded-xl bg-blue-50 p-4 text-center text-blue-700">
                <p className="text-sm">
                  Tip: Express interest in your matches to increase your chances of a mutual connection!
                </p>
              </div>
            )}

            <div className="text-center">
              <Link
                to="/dashboard"
                className="inline-flex items-center gap-2 text-sm font-medium text-rose-600 hover:text-rose-700"
              >
                <ArrowRight className="h-4 w-4 rotate-180" />
                Back to Dashboard
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
