import { useQuery } from '@tanstack/react-query';
import { api } from '../lib/api';
import { useAuth } from '../contexts/AuthContext';
import { Heart, Star, TrendingUp } from 'lucide-react';

interface Match {
  id: string;
  participantId: string;
  mutualScore: number;
  categoryScores: Array<{
    category: string;
    score: number;
    weight: number;
  }>;
}

interface MatchesData {
  matches: Match[];
  message?: string;
}

export function MatchesPage() {
  const { user } = useAuth();

  const { data, isLoading } = useQuery({
    queryKey: ['my-matches'],
    queryFn: async () => {
      // Get first event
      const eventsResponse = await api('/api/v1/events') as unknown as { data: { events: Array<{ id: string }> } };
      const eventId = eventsResponse.data.events[0]?.id;
      if (!eventId) return { matches: [] };
      return api(`/api/v1/events/${eventId}/my-matches`) as unknown as { data: MatchesData };
    },
    enabled: !!user,
  });

  if (!user) {
    return (
      <div className="rounded-xl bg-yellow-50 p-4 text-yellow-700">
        Please sign in to view your matches.
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-rose-200 border-t-rose-600" />
      </div>
    );
  }

  const matches = (data as { data: MatchesData } | undefined)?.data.matches ?? [];

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600 bg-green-100';
    if (score >= 60) return 'text-blue-600 bg-blue-100';
    if (score >= 40) return 'text-yellow-600 bg-yellow-100';
    return 'text-red-600 bg-red-100';
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Your Matches</h1>
        <p className="mt-2 text-gray-600">People you&apos;re compatible with</p>
      </div>

      {matches.length === 0 ? (
        <div className="rounded-xl border border-dashed border-gray-300 p-12 text-center">
          <Heart className="mx-auto h-12 w-12 text-gray-400" />
          <p className="mt-4 text-gray-500">No matches available yet</p>
          <p className="mt-2 text-sm text-gray-400">
            Matches will be revealed after the event organizer publishes them.
          </p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {matches.map((match: Match) => (
            <div key={match.id} className="rounded-2xl border border-rose-100 bg-white p-6 shadow-sm">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-rose-100">
                    <Heart className="h-6 w-6 text-rose-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">Match #{match.participantId.slice(0, 8)}</h3>
                    <p className="text-sm text-gray-500">Compatibility Score</p>
                  </div>
                </div>
                <span className={`rounded-full px-3 py-1 text-lg font-bold ${getScoreColor(match.mutualScore)}`}>
                  {match.mutualScore}%
                </span>
              </div>

              {/* Category Breakdown */}
              <div className="mt-4 space-y-2">
                {match.categoryScores.slice(0, 3).map((cat: { category: string; score: number; weight: number }) => (
                  <div key={cat.category} className="flex items-center justify-between text-sm">
                    <span className="capitalize text-gray-600">{cat.category.replace('_', ' ')}</span>
                    <div className="flex items-center gap-2">
                      <div className="h-2 w-24 rounded-full bg-gray-200">
                        <div
                          className="h-2 rounded-full bg-rose-500"
                          style={{ width: `${cat.score * 100}%` }}
                        />
                      </div>
                      <span className="w-8 text-right text-gray-500">{Math.round(cat.score * 100)}%</span>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-4 flex gap-2">
                <button className="flex-1 rounded-lg bg-rose-500 py-2 text-sm font-semibold text-white hover:bg-rose-600">
                  Express Interest
                </button>
                <button className="flex-1 rounded-lg border border-gray-200 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50">
                  View Profile
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
