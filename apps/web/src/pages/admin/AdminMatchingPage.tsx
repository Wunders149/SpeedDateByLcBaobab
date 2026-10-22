import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../../lib/api';
import { Heart, Play, Check, Users, TrendingUp, Settings } from 'lucide-react';

export function AdminMatchingPage() {
  const [eventId, setEventId] = useState('');
  const [mode, setMode] = useState('compatibility_ranking');
  const [threshold, setThreshold] = useState(0);
  const queryClient = useQueryClient();

  const { data: eventsData } = useQuery({
    queryKey: ['admin-events'],
    queryFn: () => api<{ data: { events: Array<{ _id: string; name: string }> } }>('/api/v1/admin/events'),
  });
  const events = eventsData?.data.events ?? [];
  const selectedEventId = eventId || events[0]?._id || '';

  const generateMutation = useMutation({
    mutationFn: () =>
      api(`/api/v1/admin/events/${selectedEventId}/matches/generate`, {
        method: 'POST',
        body: JSON.stringify({
          mode,
          minimumThreshold: threshold,
          dealBreakerAction: 'exclude',
          allowMultipleMatches: false,
          respectNoRepeat: true,
        }),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-matches', selectedEventId] });
      queryClient.invalidateQueries({ queryKey: ['match-runs', selectedEventId] });
    },
  });

  const matchesQuery = useQuery({
    queryKey: ['admin-matches', selectedEventId],
    enabled: !!selectedEventId,
    queryFn: () => api<{ data: { matches: Array<{ matchStatus: string; eligibilityMetadata: { eligible: boolean } }> } }>(`/api/v1/admin/events/${selectedEventId}/matches`),
  });
  const actionMutation = useMutation({
    mutationFn: (action: string) => api(`/api/v1/admin/events/${selectedEventId}/matches/${action}`, { method: 'POST' }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-matches', selectedEventId] });
      queryClient.invalidateQueries({ queryKey: ['admin-events'] });
    },
  });
  const matches = matchesQuery.data?.data.matches ?? [];
  const eligiblePairs = matches.filter((match) => match.eligibilityMetadata?.eligible).length;

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-900">Matching Workspace</h1>

      {/* Configuration */}
      <div className="rounded-2xl border border-rose-100 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
          <Settings className="h-5 w-5 text-rose-500" />
          Matching Configuration
        </h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-3">
          <div>
            <label className="block text-sm font-medium text-gray-700">Event</label>
            <select value={selectedEventId} onChange={(e) => setEventId(e.target.value)} className="mt-1 block w-full rounded-lg border border-gray-300 px-4 py-2">
              <option value="">Select event...</option>
              {events.map((e) => (
                <option key={e._id} value={e._id}>{e.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Matching Mode</label>
            <select
              value={mode}
              onChange={(e) => setMode(e.target.value)}
              className="mt-1 block w-full rounded-lg border border-gray-300 px-4 py-2"
            >
              <option value="compatibility_ranking">Compatibility Ranking</option>
              <option value="global_optimal">Global Optimal Matching</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Min. Threshold</label>
            <input
              type="number"
              value={threshold}
              onChange={(e) => setThreshold(Number(e.target.value))}
              min={0}
              max={100}
              className="mt-1 block w-full rounded-lg border border-gray-300 px-4 py-2"
            />
          </div>
        </div>

        <div className="mt-4 flex gap-4">
          <button
            onClick={() => generateMutation.mutate()}
            disabled={generateMutation.isPending || !selectedEventId}
            className="flex items-center gap-2 rounded-lg bg-rose-500 px-6 py-2 font-semibold text-white hover:bg-rose-600 disabled:opacity-50"
          >
            <Play className="h-4 w-4" />
            {generateMutation.isPending ? 'Generating...' : 'Generate Provisional Matches'}
          </button>
          <button onClick={() => actionMutation.mutate('finalize')} disabled={!selectedEventId || actionMutation.isPending} className="flex items-center gap-2 rounded-lg border border-gray-200 px-6 py-2 font-medium text-gray-600 hover:bg-gray-50 disabled:opacity-50">
            <Check className="h-4 w-4" />
            Finalize Matches
          </button>
          <button onClick={() => actionMutation.mutate('publish')} disabled={!selectedEventId || actionMutation.isPending} className="flex items-center gap-2 rounded-lg border border-gray-200 px-6 py-2 font-medium text-gray-600 hover:bg-gray-50 disabled:opacity-50">
            <TrendingUp className="h-4 w-4" />
            Publish Results
          </button>
        </div>

        {generateMutation.isSuccess && (
          <div className="mt-4 rounded-lg bg-green-50 p-3 text-sm text-green-700">
            Matches generated successfully!
          </div>
        )}
        {generateMutation.isError && (
          <div className="mt-4 rounded-lg bg-red-50 p-3 text-sm text-red-600">
            {(generateMutation.error as Error).message}
          </div>
        )}
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-4">
        {[
          { label: 'Eligible Pairs', value: String(eligiblePairs), icon: Users },
          { label: 'Provisional Matches', value: String(matches.filter((m) => m.matchStatus === 'provisional').length), icon: Heart },
          { label: 'Finalized', value: String(matches.filter((m) => m.matchStatus === 'finalized').length), icon: Check },
          { label: 'Published', value: String(matches.filter((m) => m.matchStatus === 'published').length), icon: TrendingUp },
        ].map(({ label, value, icon: Icon }) => (
          <div key={label} className="rounded-xl border border-rose-100 bg-white p-4">
            <div className="flex items-center gap-3">
              <Icon className="h-5 w-5 text-rose-500" />
              <div>
                <p className="text-2xl font-bold text-gray-900">{value}</p>
                <p className="text-sm text-gray-500">{label}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
      {actionMutation.isError && <p role="alert" className="text-sm text-red-600">{(actionMutation.error as Error).message}</p>}
      {matchesQuery.isError && <p role="alert" className="text-sm text-red-600">{(matchesQuery.error as Error).message}</p>}
    </div>
  );
}
