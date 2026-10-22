import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api, API_BASE } from '../../lib/api';
import { TrendingUp, Users, Calendar, FileText, BarChart3, Heart } from 'lucide-react';

interface HostEvent { _id: string; name: string }
interface Analytics {
  event: { id: string; name: string; capacity: number };
  registrations: { total: number; approved: number; waitlisted: number; checkedIn: number; questionnaireSubmitted: number; matchCount: number; matchedParticipants: number; averageCompatibility: number; scoreDistribution: number[] };
  rates: { checkInRate: number; matchRate: number; questionnaireCompletionRate: number };
}

export function AdminReportsPage() {
  const [eventId, setEventId] = useState('');
  const { data: eventData } = useQuery({ queryKey: ['admin-events'], queryFn: () => api<{ data: { events: HostEvent[] } }>('/api/v1/admin/events') });
  const events = eventData?.data.events ?? [];
  const selectedEventId = eventId || events[0]?._id || '';
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['admin-analytics', selectedEventId], enabled: !!selectedEventId,
    queryFn: () => api<{ data: Analytics }>(`/api/v1/admin/events/${selectedEventId}/analytics`),
  });
  const analytics = data?.data;
  const stats = [
    { label: 'Total Registrations', value: analytics?.registrations.total ?? 0, icon: Users, color: 'text-blue-500' },
    { label: 'Attendance Rate', value: `${Math.round((analytics?.rates.checkInRate ?? 0) * 100)}%`, icon: Calendar, color: 'text-green-500' },
    { label: 'Match Rate', value: `${Math.round((analytics?.rates.matchRate ?? 0) * 100)}%`, icon: Heart, color: 'text-rose-500' },
    { label: 'Avg Compatibility', value: `${analytics?.registrations.averageCompatibility ?? 0}%`, icon: BarChart3, color: 'text-purple-500' },
  ];
  const buckets = ['0–19', '20–39', '40–59', '60–79', '80–100'];
  const distribution = analytics?.registrations.scoreDistribution ?? [0, 0, 0, 0, 0];
  const maxBucket = Math.max(...distribution, 1);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4"><div><h1 className="text-3xl font-bold text-gray-900">Reports & Analytics</h1><p className="mt-1 text-sm text-gray-500">Registration, attendance, and published match performance.</p></div><label className="text-sm font-medium text-gray-700">Event<select value={selectedEventId} onChange={(e) => setEventId(e.target.value)} className="mt-1 block min-w-64 rounded-lg border border-gray-300 px-4 py-2">{events.map((event) => <option key={event._id} value={event._id}>{event.name}</option>)}</select></label></div>
      {isLoading && <p className="py-8 text-center text-gray-500">Loading analytics…</p>}{isError && <p role="alert" className="text-sm text-red-600">{(error as Error).message}</p>}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">{stats.map((stat) => <div key={stat.label} className="rounded-xl border border-rose-100 bg-white p-6"><div className="flex items-center gap-3"><stat.icon className={`h-6 w-6 ${stat.color}`} /><div><p className="text-3xl font-bold text-gray-900">{stat.value}</p><p className="text-sm text-gray-500">{stat.label}</p></div></div></div>)}</div>
      {analytics && <div className="grid gap-4 md:grid-cols-3"><div className="rounded-xl border border-rose-100 bg-white p-5"><p className="text-sm text-gray-500">Approved</p><p className="mt-1 text-2xl font-bold">{analytics.registrations.approved}</p></div><div className="rounded-xl border border-rose-100 bg-white p-5"><p className="text-sm text-gray-500">Waitlisted</p><p className="mt-1 text-2xl font-bold">{analytics.registrations.waitlisted}</p></div><div className="rounded-xl border border-rose-100 bg-white p-5"><p className="text-sm text-gray-500">Questionnaires completed</p><p className="mt-1 text-2xl font-bold">{analytics.registrations.questionnaireSubmitted}</p></div></div>}
      <div className="rounded-2xl border border-rose-100 bg-white p-6 shadow-sm"><h2 className="text-lg font-semibold text-gray-900">Published compatibility scores</h2><div className="mt-5 space-y-3">{buckets.map((bucket, index) => <div key={bucket} className="grid grid-cols-[4rem_1fr_2rem] items-center gap-3 text-sm"><span className="text-gray-500">{bucket}</span><div className="h-4 overflow-hidden rounded-full bg-gray-100"><div className="h-full rounded-full bg-rose-400" style={{ width: `${(distribution[index] / maxBucket) * 100}%` }} /></div><span className="text-right text-gray-600">{distribution[index]}</span></div>)}</div>{analytics?.registrations.matchCount === 0 && <p className="mt-3 text-sm text-gray-500">No published matches yet.</p>}</div>
      <div className="rounded-2xl border border-rose-100 bg-white p-6 shadow-sm"><h2 className="text-lg font-semibold text-gray-900">Export reports</h2><p className="mt-1 text-sm text-gray-500">Downloads are scoped to the selected event.</p><div className="mt-4 flex flex-wrap gap-3"><a href={`${API_BASE}/api/v1/admin/events/${selectedEventId}/exports/participants`} className="flex items-center gap-2 rounded-lg bg-rose-500 px-4 py-2 text-sm font-semibold text-white"><FileText className="h-4 w-4" />Export Participants (CSV)</a><a href={`${API_BASE}/api/v1/admin/events/${selectedEventId}/exports/matches`} className="flex items-center gap-2 rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-600"><TrendingUp className="h-4 w-4" />Export Matches (CSV)</a></div></div>
      {!events.length && <p className="text-center text-gray-500">Create an event before viewing reports.</p>}
    </div>
  );
}
