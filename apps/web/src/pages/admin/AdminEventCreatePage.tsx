import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '../../lib/api';
import { Save, ArrowLeft } from 'lucide-react';

interface ExistingEvent {
  name: string; slug: string; description: string; venue: string; timezone?: string;
  startAt: string; endAt: string; registrationDeadline: string; capacity: number;
  eligibleGroups: string[]; eventMode: string; organizerContact: string;
  instructions?: string;
}

function datePartsInZone(value: Date, timeZone: string): Record<string, string> {
  return Object.fromEntries(new Intl.DateTimeFormat('en-CA', {
    timeZone, year: 'numeric', month: '2-digit', day: '2-digit',
    hour: '2-digit', minute: '2-digit', hourCycle: 'h23',
  }).formatToParts(value).filter((part) => part.type !== 'literal').map(({ type, value: partValue }) => [type, partValue]));
}

function toZonedDateTimeInput(value: string, timeZone: string): string {
  const parts = datePartsInZone(new Date(value), timeZone);
  return `${parts.year}-${parts.month}-${parts.day}T${parts.hour}:${parts.minute}`;
}

function fromZonedDateTimeInput(value: string, timeZone: string): string {
  const [datePart, timePart] = value.split('T');
  const [year, month, day] = datePart.split('-').map(Number);
  const [hour, minute] = timePart.split(':').map(Number);
  const assumedUtc = Date.UTC(year, month - 1, day, hour, minute);
  const localParts = datePartsInZone(new Date(assumedUtc), timeZone);
  const representedUtc = Date.UTC(Number(localParts.year), Number(localParts.month) - 1, Number(localParts.day), Number(localParts.hour), Number(localParts.minute));
  return new Date(assumedUtc - (representedUtc - assumedUtc)).toISOString();
}

export function AdminEventCreatePage() {
  const navigate = useNavigate();
  const { eventId } = useParams();
  const queryClient = useQueryClient();
  const [form, setForm] = useState({
    name: '', slug: '', description: '', venue: '', timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC',
    startAt: '', endAt: '', registrationDeadline: '', capacity: 30,
    eligibleGroups: 'all', eventMode: 'in_person', organizerContact: '', instructions: '',
  });
  const [saving, setSaving] = useState(false);
  const { data: existingData, isLoading } = useQuery({
    queryKey: ['admin-event', eventId],
    enabled: !!eventId,
    queryFn: async () => {
      const response = await api<{ data: { event: ExistingEvent } }>(`/api/v1/events/${eventId}`);
      return response.data.event;
    },
  });

  useEffect(() => {
    if (!existingData) return;
    const timezone = existingData.timezone ?? 'UTC';
    setForm({
      name: existingData.name, slug: existingData.slug, description: existingData.description,
      venue: existingData.venue, timezone,
      startAt: toZonedDateTimeInput(existingData.startAt, timezone), endAt: toZonedDateTimeInput(existingData.endAt, timezone),
      registrationDeadline: toZonedDateTimeInput(existingData.registrationDeadline, timezone),
      capacity: existingData.capacity, eligibleGroups: existingData.eligibleGroups?.join(', ') ?? 'all',
      eventMode: existingData.eventMode, organizerContact: existingData.organizerContact,
      instructions: existingData.instructions ?? '',
    });
  }, [existingData]);

  const handle = (field: string, value: string | number) =>
    setForm((f) => ({ ...f, [field]: value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api(eventId ? `/api/v1/events/${eventId}` : '/api/v1/events', {
        method: eventId ? 'PATCH' : 'POST',
        body: JSON.stringify({
          ...form,
          eligibleGroups: form.eligibleGroups.split(',').map((group) => group.trim()).filter(Boolean),
          startAt: fromZonedDateTimeInput(form.startAt, form.timezone),
          endAt: fromZonedDateTimeInput(form.endAt, form.timezone),
          registrationDeadline: fromZonedDateTimeInput(form.registrationDeadline, form.timezone),
        }),
      });
      await queryClient.invalidateQueries({ queryKey: ['admin-events'] });
      await queryClient.invalidateQueries({ queryKey: ['admin-event', eventId] });
      alert(eventId ? 'Event updated successfully!' : 'Event created successfully!');
      navigate('/admin/events');
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to create event');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div className="flex items-center gap-3">
        <Link to="/admin/events" className="text-gray-500 hover:text-rose-600">
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <h1 className="text-3xl font-bold text-gray-900">{eventId ? 'Edit Event' : 'Create Event'}</h1>
      </div>
      {isLoading && <p className="text-sm text-gray-500">Loading event…</p>}

      <form onSubmit={handleSubmit} className="space-y-6 rounded-2xl border border-rose-100 bg-white p-6 shadow-sm">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="block text-sm font-medium text-gray-700">Event Name</label>
            <input value={form.name} onChange={(e) => handle('name', e.target.value)} required className="mt-1 block w-full rounded-lg border border-gray-300 px-4 py-2" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Slug (URL)</label>
            <input value={form.slug} onChange={(e) => handle('slug', e.target.value)} required pattern="[a-z0-9-]+" className="mt-1 block w-full rounded-lg border border-gray-300 px-4 py-2" placeholder="my-event-slug" />
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="block text-sm font-medium text-gray-700">Eligible Groups (comma separated)</label>
            <input value={form.eligibleGroups} onChange={(e) => handle('eligibleGroups', e.target.value)} required className="mt-1 block w-full rounded-lg border border-gray-300 px-4 py-2" placeholder="all" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Timezone</label>
            <input value={form.timezone} onChange={(e) => handle('timezone', e.target.value)} required className="mt-1 block w-full rounded-lg border border-gray-300 px-4 py-2" placeholder="Indian/Antananarivo" />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Participant Instructions (optional)</label>
          <textarea value={form.instructions} onChange={(e) => handle('instructions', e.target.value)} rows={3} className="mt-1 block w-full rounded-lg border border-gray-300 px-4 py-2" />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Description</label>
          <textarea value={form.description} onChange={(e) => handle('description', e.target.value)} required rows={3} className="mt-1 block w-full rounded-lg border border-gray-300 px-4 py-2" />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="block text-sm font-medium text-gray-700">Venue</label>
            <input value={form.venue} onChange={(e) => handle('venue', e.target.value)} required className="mt-1 block w-full rounded-lg border border-gray-300 px-4 py-2" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Organizer Contact</label>
            <input value={form.organizerContact} onChange={(e) => handle('organizerContact', e.target.value)} required className="mt-1 block w-full rounded-lg border border-gray-300 px-4 py-2" />
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="block text-sm font-medium text-gray-700">Start Date & Time</label>
            <input type="datetime-local" value={form.startAt} onChange={(e) => handle('startAt', e.target.value)} required className="mt-1 block w-full rounded-lg border border-gray-300 px-4 py-2" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">End Date & Time</label>
            <input type="datetime-local" value={form.endAt} onChange={(e) => handle('endAt', e.target.value)} required className="mt-1 block w-full rounded-lg border border-gray-300 px-4 py-2" />
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          <div>
            <label className="block text-sm font-medium text-gray-700">Registration Deadline</label>
            <input type="datetime-local" value={form.registrationDeadline} onChange={(e) => handle('registrationDeadline', e.target.value)} required className="mt-1 block w-full rounded-lg border border-gray-300 px-4 py-2" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Capacity</label>
            <input type="number" value={form.capacity} onChange={(e) => handle('capacity', Number(e.target.value))} min={1} max={1000} required className="mt-1 block w-full rounded-lg border border-gray-300 px-4 py-2" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Event Mode</label>
            <select value={form.eventMode} onChange={(e) => handle('eventMode', e.target.value)} className="mt-1 block w-full rounded-lg border border-gray-300 px-4 py-2">
              <option value="in_person">In Person</option>
              <option value="quiz_based">Quiz Based</option>
              <option value="guided_conversation">Guided Conversation</option>
              <option value="post_event_matching">Post-Event Matching</option>
              <option value="organizer_mediated">Organizer Mediated</option>
            </select>
          </div>
        </div>

        <div className="flex gap-4">
          <button
            type="submit"
            disabled={saving}
            className="flex items-center gap-2 rounded-lg bg-rose-500 px-6 py-2 font-semibold text-white hover:bg-rose-600 disabled:opacity-50"
          >
            <Save className="h-4 w-4" />
            {saving ? 'Saving...' : eventId ? 'Save Changes' : 'Create Event'}
          </button>
          <Link to="/admin/events" className="rounded-lg border border-gray-200 px-6 py-2 font-medium text-gray-600 hover:bg-gray-50">
            Cancel
          </Link>
        </div>
      </form>
    </div>
  );
}
