import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '../../lib/api';
import { Clock, RotateCw, Users, Table2, ArrowRight } from 'lucide-react';

interface HostEvent { _id: string; name: string }
interface SessionRow {
  round: number; tableNumber?: number; participantAId: { email: string }; participantBId: { email: string };
  startTime: string; endTime: string;
}
interface HostSession { _id: string; name: string; rounds: number; status: string; schedule: SessionRow[] }

export function AdminSessionManagementPage() {
  const [eventId, setEventId] = useState('');
  const [roundDuration, setRoundDuration] = useState(8);
  const [rounds, setRounds] = useState(5);
  const [tableCount, setTableCount] = useState(12);
  const queryClient = useQueryClient();
  const { data: eventData } = useQuery({
    queryKey: ['admin-events'],
    queryFn: () => api<{ data: { events: HostEvent[] } }>('/api/v1/admin/events'),
  });
  const events = eventData?.data.events ?? [];
  const selectedEventId = eventId || events[0]?._id || '';
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['admin-sessions', selectedEventId], enabled: !!selectedEventId,
    queryFn: () => api<{ data: { sessions: HostSession[] } }>(`/api/v1/admin/events/${selectedEventId}/sessions`),
  });
  const sessions = data?.data.sessions ?? [];
  const mutation = useMutation({
    mutationFn: () => api(`/api/v1/admin/events/${selectedEventId}/sessions/generate`, {
      method: 'POST', body: JSON.stringify({ rounds, durationMinutes: roundDuration, tableCount }),
    }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin-sessions', selectedEventId] }),
  });
  const statusMutation = useMutation({
    mutationFn: ({ sessionId, status }: { sessionId: string; status: string }) => api(`/api/v1/admin/events/${selectedEventId}/sessions/${sessionId}/status`, {
      method: 'PATCH', body: JSON.stringify({ status }),
    }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin-sessions', selectedEventId] }),
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4"><div><h1 className="text-3xl font-bold text-gray-900">Session & Rotation Management</h1><p className="mt-1 text-sm text-gray-500">Generate a round-robin schedule from approved attendees.</p></div><button onClick={() => mutation.mutate()} disabled={!selectedEventId || mutation.isPending} className="flex items-center gap-2 rounded-lg bg-rose-500 px-4 py-2 text-sm font-semibold text-white hover:bg-rose-600 disabled:opacity-50"><RotateCw className="h-4 w-4" />{mutation.isPending ? 'Generating…' : 'Generate Rotation'}</button></div>
      <div className="rounded-2xl border border-rose-100 bg-white p-6 shadow-sm"><div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <label className="text-sm font-medium text-gray-700">Event<select value={selectedEventId} onChange={(e) => setEventId(e.target.value)} className="mt-1 block w-full rounded-lg border border-gray-300 px-4 py-2">{events.map((event) => <option key={event._id} value={event._id}>{event.name}</option>)}</select></label>
        <label className="text-sm font-medium text-gray-700">Round duration (min)<input type="number" min={1} max={120} value={roundDuration} onChange={(e) => setRoundDuration(Number(e.target.value))} className="mt-1 block w-full rounded-lg border border-gray-300 px-4 py-2" /></label>
        <label className="text-sm font-medium text-gray-700">Rounds<input type="number" min={1} max={30} value={rounds} onChange={(e) => setRounds(Number(e.target.value))} className="mt-1 block w-full rounded-lg border border-gray-300 px-4 py-2" /></label>
        <label className="text-sm font-medium text-gray-700">Tables<input type="number" min={1} max={100} value={tableCount} onChange={(e) => setTableCount(Number(e.target.value))} className="mt-1 block w-full rounded-lg border border-gray-300 px-4 py-2" /></label>
      </div></div>
      {mutation.isError && <p role="alert" className="text-sm text-red-600">{(mutation.error as Error).message}</p>}{statusMutation.isError && <p role="alert" className="text-sm text-red-600">{(statusMutation.error as Error).message}</p>}{isError && <p role="alert" className="text-sm text-red-600">{(error as Error).message}</p>}
      {isLoading && <p className="py-8 text-center text-gray-500">Loading sessions…</p>}
      <div className="space-y-4">{sessions.map((session) => <section key={session._id} className="rounded-xl border border-rose-100 bg-white p-4 shadow-sm"><div className="mb-3 flex flex-wrap items-center justify-between gap-3"><div><h2 className="font-semibold text-gray-900">{session.name}</h2><p className="text-sm text-gray-500">{session.rounds} rounds · {session.schedule.length} pairings</p></div><div className="flex items-center gap-2"><span className="rounded-full bg-gray-100 px-2 py-1 text-xs capitalize text-gray-700">{session.status}</span>{session.status === 'scheduled' && <button onClick={() => statusMutation.mutate({ sessionId: session._id, status: 'active' })} className="rounded border px-3 py-1 text-xs">Start</button>}{session.status === 'active' && <button onClick={() => statusMutation.mutate({ sessionId: session._id, status: 'paused' })} className="rounded border px-3 py-1 text-xs">Pause</button>}{session.status === 'paused' && <button onClick={() => statusMutation.mutate({ sessionId: session._id, status: 'active' })} className="rounded border px-3 py-1 text-xs">Resume</button>}{['active', 'paused'].includes(session.status) && <button onClick={() => statusMutation.mutate({ sessionId: session._id, status: 'ended' })} className="rounded border border-red-200 px-3 py-1 text-xs text-red-600">End</button>}</div></div><div className="space-y-2">{session.schedule.map((row, index) => <div key={`${row.round}-${index}`} className="flex flex-wrap items-center justify-between gap-2 rounded-lg bg-gray-50 p-3"><div className="flex items-center gap-2 text-sm"><span className="font-semibold">Round {row.round}</span><span>{row.participantAId?.email}</span><ArrowRight className="h-4 w-4 text-gray-400" /><span>{row.participantBId?.email}</span></div><div className="flex items-center gap-3 text-xs text-gray-500"><span className="inline-flex items-center gap-1"><Table2 className="h-3 w-3" /> Table {row.tableNumber}</span><span className="inline-flex items-center gap-1"><Clock className="h-3 w-3" /> {new Date(row.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}–{new Date(row.endTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span><span className="inline-flex items-center gap-1"><Users className="h-3 w-3" /> Rotation</span></div></div>)}</div></section>)}</div>
      {!isLoading && selectedEventId && sessions.length === 0 && <div className="rounded-xl border border-dashed border-gray-300 p-8 text-center text-gray-500">No rotation generated for this event yet.</div>}
      {!events.length && <p className="text-center text-gray-500">Create an event before planning sessions.</p>}
    </div>
  );
}
