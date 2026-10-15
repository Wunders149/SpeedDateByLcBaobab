import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '../../lib/api';
import { Save, ArrowLeft } from 'lucide-react';

export function AdminEventCreatePage() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: '', slug: '', description: '', venue: '', timezone: 'UTC',
    startAt: '', endAt: '', registrationDeadline: '', capacity: 30,
    eligibleGroups: 'all', eventMode: 'in_person', organizerContact: '',
  });
  const [saving, setSaving] = useState(false);

  const handle = (field: string, value: string | number) =>
    setForm((f) => ({ ...f, [field]: value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api('/api/v1/admin/events', {
        method: 'POST',
        body: JSON.stringify({
          ...form,
          eligibleGroups: [form.eligibleGroups],
        }),
      });
      alert('Event created successfully!');
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
        <h1 className="text-3xl font-bold text-gray-900">Create Event</h1>
      </div>

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
            {saving ? 'Creating...' : 'Create Event'}
          </button>
          <Link to="/admin/events" className="rounded-lg border border-gray-200 px-6 py-2 font-medium text-gray-600 hover:bg-gray-50">
            Cancel
          </Link>
        </div>
      </form>
    </div>
  );
}
