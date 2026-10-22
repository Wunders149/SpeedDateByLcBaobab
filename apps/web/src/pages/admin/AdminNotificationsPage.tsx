import { useState } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { api } from '../../lib/api';
import { Send, Bell } from 'lucide-react';

interface HostEvent { _id: string; name: string }
export function AdminNotificationsPage() {
  const [eventId, setEventId] = useState('');
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [channels, setChannels] = useState<string[]>(['in_app']);
  const { data } = useQuery({ queryKey: ['admin-events'], queryFn: () => api<{ data: { events: HostEvent[] } }>('/api/v1/admin/events') });
  const events = data?.data.events ?? [];
  const selectedEventId = eventId || events[0]?._id || '';
  const mutation = useMutation({
    mutationFn: () => api<{ data: { recipientCount: number } }>(`/api/v1/admin/events/${selectedEventId}/announcements`, {
      method: 'POST', body: JSON.stringify({ title, message, channels }),
    }),
    onSuccess: () => { setTitle(''); setMessage(''); },
  });
  const toggle = (channel: string) => setChannels((current) => current.includes(channel) ? current.filter((item) => item !== channel) : [...current, channel]);

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div><h1 className="text-3xl font-bold text-gray-900">Event Announcements</h1><p className="mt-1 text-sm text-gray-500">Send a message to registered participants for an event.</p></div>
      <form onSubmit={(e) => { e.preventDefault(); mutation.mutate(); }} className="space-y-5 rounded-2xl border border-rose-100 bg-white p-6 shadow-sm">
        <label className="block text-sm font-medium text-gray-700">Event<select value={selectedEventId} onChange={(e) => setEventId(e.target.value)} className="mt-1 block w-full rounded-lg border border-gray-300 px-4 py-2">{events.map((event) => <option key={event._id} value={event._id}>{event.name}</option>)}</select></label>
        <label className="block text-sm font-medium text-gray-700">Title<input required maxLength={200} value={title} onChange={(e) => setTitle(e.target.value)} className="mt-1 block w-full rounded-lg border border-gray-300 px-4 py-2" /></label>
        <label className="block text-sm font-medium text-gray-700">Message<textarea required maxLength={5000} rows={5} value={message} onChange={(e) => setMessage(e.target.value)} className="mt-1 block w-full rounded-lg border border-gray-300 px-4 py-2" /></label>
        <fieldset><legend className="text-sm font-medium text-gray-700">Delivery channels</legend><div className="mt-2 flex flex-wrap gap-4">{[['in_app', 'In-app'], ['email', 'Email'], ['sms', 'SMS']].map(([value, label]) => <label key={value} className="inline-flex items-center gap-2 text-sm text-gray-700"><input type="checkbox" checked={channels.includes(value)} onChange={() => toggle(value)} className="accent-rose-500" />{label}</label>)}</div><p className="mt-1 text-xs text-gray-500">Email and SMS require configured delivery providers. Without one, the development adapter logs the message.</p></fieldset>
        {mutation.isError && <p role="alert" className="text-sm text-red-600">{(mutation.error as Error).message}</p>}{mutation.isSuccess && <p className="rounded-lg bg-green-50 p-3 text-sm text-green-700">Announcement sent to {mutation.data.data.recipientCount} registered participants.</p>}
        <button disabled={!selectedEventId || !channels.length || mutation.isPending} className="rounded-lg bg-rose-500 px-5 py-2 font-semibold text-white disabled:opacity-50"><Send className="mr-2 inline h-4 w-4" />{mutation.isPending ? 'Sending…' : 'Send announcement'}</button>
      </form>
      <div className="flex items-start gap-3 rounded-xl bg-blue-50 p-4 text-sm text-blue-800"><Bell className="mt-0.5 h-4 w-4 shrink-0" /><p>Announcements are delivered to active accounts with an event registration. In-app messages are saved in each participant’s notifications.</p></div>
      {!events.length && <p className="text-center text-gray-500">Create an event before sending announcements.</p>}
    </div>
  );
}
