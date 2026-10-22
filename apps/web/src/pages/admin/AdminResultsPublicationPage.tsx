import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Eye, Send, Shield, FileText } from 'lucide-react';
import { api } from '../../lib/api';

interface HostEvent { _id: string; name: string }
interface MatchRun { _id: string; status: string; matchCount: number; createdAt: string; publishedAt?: string }

export function AdminResultsPublicationPage() {
  const [eventId, setEventId] = useState('');
  const queryClient = useQueryClient();
  const { data: eventData } = useQuery({ queryKey: ['admin-events'], queryFn: () => api<{ data: { events: HostEvent[] } }>('/api/v1/admin/events') });
  const events = eventData?.data.events ?? [];
  const selectedEventId = eventId || events[0]?._id || '';
  const selectedEvent = events.find((event) => event._id === selectedEventId);
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['match-runs', selectedEventId], enabled: !!selectedEventId,
    queryFn: () => api<{ data: { runs: MatchRun[] } }>(`/api/v1/admin/events/${selectedEventId}/match-runs`),
  });
  const mutation = useMutation({
    mutationFn: () => api(`/api/v1/admin/events/${selectedEventId}/matches/publish`, { method: 'POST' }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['match-runs', selectedEventId] });
      queryClient.invalidateQueries({ queryKey: ['admin-matches', selectedEventId] });
    },
  });
  const runs = data?.data.runs ?? [];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4"><div><h1 className="text-3xl font-bold text-gray-900">Results Publication</h1><p className="mt-1 text-sm text-gray-500">Publish finalized match runs to participants.</p></div><label className="text-sm font-medium text-gray-700">Event<select value={selectedEventId} onChange={(e) => setEventId(e.target.value)} className="mt-1 block min-w-64 rounded-lg border border-gray-300 px-4 py-2">{events.map((event) => <option key={event._id} value={event._id}>{event.name}</option>)}</select></label></div>
      {mutation.isError && <p role="alert" className="text-sm text-red-600">{(mutation.error as Error).message}</p>}{isError && <p role="alert" className="text-sm text-red-600">{(error as Error).message}</p>}{isLoading && <p className="py-8 text-center text-gray-500">Loading match runs…</p>}
      {!isLoading && runs.map((run) => <div key={run._id} className="rounded-xl border border-rose-100 bg-white p-6 shadow-sm"><div className="flex flex-wrap items-center justify-between gap-4"><div className="flex items-center gap-3"><FileText className="h-5 w-5 text-rose-500" /><div><p className="font-semibold text-gray-900">{selectedEvent?.name}</p><p className="text-sm text-gray-600">{run.matchCount} matches · created {new Date(run.createdAt).toLocaleString()}</p></div></div><div className="flex items-center gap-3"><span className={`rounded-full px-3 py-1 text-xs font-medium ${run.status === 'published' ? 'bg-green-100 text-green-700' : run.status === 'finalized' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-600'}`}>{run.status === 'published' ? <><Eye className="mr-1 inline h-3 w-3" />Published</> : <><Shield className="mr-1 inline h-3 w-3" />{run.status}</>}</span>{run.status === 'finalized' && <button onClick={() => mutation.mutate()} disabled={mutation.isPending} className="rounded-lg bg-rose-500 px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"><Send className="mr-1 inline h-3 w-3" />{mutation.isPending ? 'Publishing…' : 'Publish results'}</button>}</div></div>{run.publishedAt && <p className="mt-3 text-xs text-gray-500">Published {new Date(run.publishedAt).toLocaleString()} · results are now visible to participants.</p>}{run.status === 'generated' && <p className="mt-3 text-sm text-gray-500">Review and finalize this run in <Link className="text-rose-600 underline" to="/admin/matches/review">Match Review</Link> before publishing.</p>}</div>)}
      {!isLoading && selectedEventId && !runs.length && <div className="rounded-xl border border-dashed border-gray-300 p-10 text-center text-gray-500">No match runs for this event yet. Generate matches in the <Link className="text-rose-600 underline" to="/admin/matching">matching workspace</Link>.</div>}
      {!events.length && <p className="text-center text-gray-500">Create an event before publishing results.</p>}
    </div>
  );
}
