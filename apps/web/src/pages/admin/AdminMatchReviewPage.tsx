import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Heart, CheckCircle, ArrowRight, TrendingUp, ShieldCheck } from 'lucide-react';
import { api } from '../../lib/api';

interface HostEvent { _id: string; name: string }
interface ReviewedMatch {
  _id: string; participantAId: { email: string }; participantBId: { email: string };
  mutualCompatibilityScore: number; matchStatus: string; eligibilityMetadata: { eligible: boolean; exclusionReasons: string[] };
}

export function AdminMatchReviewPage() {
  const [eventId, setEventId] = useState('');
  const [filter, setFilter] = useState('all');
  const queryClient = useQueryClient();
  const { data: eventData } = useQuery({ queryKey: ['admin-events'], queryFn: () => api<{ data: { events: HostEvent[] } }>('/api/v1/admin/events') });
  const events = eventData?.data.events ?? [];
  const selectedEventId = eventId || events[0]?._id || '';
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['admin-matches', selectedEventId], enabled: !!selectedEventId,
    queryFn: () => api<{ data: { matches: ReviewedMatch[] } }>(`/api/v1/admin/events/${selectedEventId}/matches`),
  });
  const mutation = useMutation({
    mutationFn: () => api(`/api/v1/admin/events/${selectedEventId}/matches/finalize`, { method: 'POST' }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-matches', selectedEventId] });
      queryClient.invalidateQueries({ queryKey: ['match-runs', selectedEventId] });
    },
  });
  const matches = data?.data.matches ?? [];
  const filtered = filter === 'all' ? matches : matches.filter((match) => match.matchStatus === filter);
  const provisionalCount = matches.filter((match) => match.matchStatus === 'provisional').length;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4"><div><h1 className="text-3xl font-bold text-gray-900">Match Review & Finalization</h1><p className="mt-1 text-sm text-gray-500">Review generated pairs and finalize the current match run.</p></div><div className="flex flex-wrap items-end gap-3"><label className="text-sm font-medium text-gray-700">Event<select value={selectedEventId} onChange={(e) => setEventId(e.target.value)} className="mt-1 block min-w-56 rounded-lg border border-gray-300 px-4 py-2">{events.map((event) => <option key={event._id} value={event._id}>{event.name}</option>)}</select></label><button onClick={() => mutation.mutate()} disabled={!selectedEventId || !provisionalCount || mutation.isPending} className="rounded-lg bg-rose-500 px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"><ShieldCheck className="mr-1 inline h-4 w-4" />{mutation.isPending ? 'Finalizing…' : `Finalize ${provisionalCount} provisional`}</button></div></div>
      {mutation.isError && <p role="alert" className="text-sm text-red-600">{(mutation.error as Error).message}</p>}{isError && <p role="alert" className="text-sm text-red-600">{(error as Error).message}</p>}{isLoading && <p className="py-8 text-center text-gray-500">Loading matches…</p>}
      <div className="flex flex-wrap gap-2">{['all', 'provisional', 'finalized', 'published'].map((value) => <button key={value} onClick={() => setFilter(value)} className={`rounded-full px-4 py-2 text-sm font-medium ${filter === value ? 'bg-rose-500 text-white' : 'bg-gray-100 text-gray-600'}`}>{value}</button>)}</div>
      <div className="space-y-3">{filtered.map((match) => <div key={match._id} className="rounded-xl border border-rose-100 bg-white p-4 shadow-sm"><div className="flex flex-wrap items-center justify-between gap-3"><div className="flex items-center gap-3"><Heart className={`h-5 w-5 ${match.matchStatus === 'finalized' || match.matchStatus === 'published' ? 'fill-rose-500 text-rose-500' : 'text-gray-400'}`} /><div className="flex flex-wrap items-center gap-2"><span className="font-medium text-gray-900">{match.participantAId?.email}</span><ArrowRight className="h-4 w-4 text-gray-400" /><span className="font-medium text-gray-900">{match.participantBId?.email}</span></div></div><div className="flex items-center gap-4"><span className="inline-flex items-center gap-1 text-lg font-bold text-gray-900"><TrendingUp className="h-4 w-4 text-green-500" />{match.mutualCompatibilityScore.toFixed(1)}%</span><span className={`rounded-full px-2 py-1 text-xs ${match.matchStatus === 'published' ? 'bg-purple-100 text-purple-700' : match.matchStatus === 'finalized' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>{match.matchStatus}</span>{match.eligibilityMetadata?.eligible && <CheckCircle className="h-4 w-4 text-green-500" aria-label="Eligible" />}</div></div>{match.eligibilityMetadata?.exclusionReasons?.length > 0 && <p className="mt-2 text-sm text-amber-700">Review: {match.eligibilityMetadata.exclusionReasons.join(', ')}</p>}</div>)}</div>
      {!isLoading && selectedEventId && !filtered.length && <p className="rounded-xl border border-dashed border-gray-300 p-8 text-center text-gray-500">No {filter === 'all' ? '' : `${filter} `}matches for this event.</p>}
      {!events.length && <p className="text-center text-gray-500">Create an event and generate matches before review.</p>}
    </div>
  );
}
