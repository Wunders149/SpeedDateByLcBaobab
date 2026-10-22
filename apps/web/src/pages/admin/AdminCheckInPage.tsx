import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '../../lib/api';
import { Search, CheckCircle, Users } from 'lucide-react';

interface HostEvent { _id: string; name: string }
interface Attendee {
  _id: string;
  participantId: { _id: string; email: string };
  registrationStatus: string;
  checkInStatus: string;
}

export function AdminCheckInPage() {
  const [eventId, setEventId] = useState('');
  const [search, setSearch] = useState('');
  const queryClient = useQueryClient();
  const { data: eventData } = useQuery({
    queryKey: ['admin-events'],
    queryFn: () => api<{ data: { events: HostEvent[] } }>('/api/v1/admin/events'),
  });
  const events = eventData?.data.events ?? [];
  const selectedEventId = eventId || events[0]?._id || '';
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['admin-registrations', selectedEventId, 'all'],
    enabled: !!selectedEventId,
    queryFn: () => api<{ data: { registrations: Attendee[] } }>(`/api/v1/admin/events/${selectedEventId}/registrations?limit=100`),
  });
  const checkInMutation = useMutation({
    mutationFn: (participantId: string) => api(`/api/v1/admin/events/${selectedEventId}/check-in`, {
      method: 'POST', body: JSON.stringify({ participantId }),
    }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin-registrations', selectedEventId] }),
  });
  const attendees = (data?.data.registrations ?? []).filter((attendee) =>
    ['approved', 'checked_in'].includes(attendee.registrationStatus),
  );
  const filtered = attendees.filter((attendee) => attendee.participantId?.email.toLowerCase().includes(search.toLowerCase()));
  const checkedInCount = attendees.filter((attendee) => attendee.registrationStatus === 'checked_in').length;
  const pendingCount = attendees.filter((attendee) => attendee.registrationStatus === 'approved').length;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div><h1 className="text-3xl font-bold text-gray-900">Check-In</h1><p className="mt-1 text-sm text-gray-500">Check in approved event participants.</p></div>
        <div className="flex items-center gap-4 text-sm"><span className="font-medium text-green-600">{checkedInCount} checked in</span><span className="text-gray-500">{pendingCount} waiting</span></div>
      </div>
      <label className="block text-sm font-medium text-gray-700">Event
        <select value={selectedEventId} onChange={(e) => setEventId(e.target.value)} className="mt-1 block w-full rounded-lg border border-gray-300 px-4 py-2">
          {events.map((event) => <option key={event._id} value={event._id}>{event.name}</option>)}
        </select>
      </label>
      <div className="relative"><Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" /><input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search by participant email" className="w-full rounded-lg border border-gray-300 py-2 pl-10 focus:border-rose-500 focus:outline-none" /></div>
      {isLoading && <p className="py-8 text-center text-gray-500">Loading attendees…</p>}
      {isError && <p role="alert" className="text-sm text-red-600">{(error as Error).message}</p>}
      {checkInMutation.isError && <p role="alert" className="text-sm text-red-600">{(checkInMutation.error as Error).message}</p>}
      {!isLoading && !isError && <div className="space-y-3">
        {filtered.map((attendee) => {
          const checkedIn = attendee.registrationStatus === 'checked_in';
          return <div key={attendee._id} className="flex items-center justify-between rounded-xl border border-rose-100 bg-white p-4 shadow-sm">
            <div className="flex items-center gap-3"><div className={`flex h-10 w-10 items-center justify-center rounded-full ${checkedIn ? 'bg-green-100' : 'bg-gray-100'}`}>{checkedIn ? <CheckCircle className="h-5 w-5 text-green-600" /> : <Users className="h-5 w-5 text-gray-400" />}</div><p className="font-medium text-gray-900">{attendee.participantId?.email}</p></div>
            <div className="flex items-center gap-2"><span className={`rounded-full px-2 py-1 text-xs font-medium ${checkedIn ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>{checkedIn ? 'Checked in' : 'Approved'}</span>{!checkedIn && <button disabled={checkInMutation.isPending} onClick={() => checkInMutation.mutate(attendee.participantId._id)} className="rounded-lg bg-rose-500 px-3 py-1 text-xs font-semibold text-white disabled:opacity-50">Check in</button>}</div>
          </div>;
        })}
        {filtered.length === 0 && <div className="rounded-xl border border-dashed border-gray-300 p-8 text-center text-gray-500">No approved attendees match this search.</div>}
      </div>}
      {!events.length && <p className="text-center text-gray-500">Create an event before checking in attendees.</p>}
    </div>
  );
}
