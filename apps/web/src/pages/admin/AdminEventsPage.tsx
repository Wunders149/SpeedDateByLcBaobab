import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { api } from '../../lib/api';
import { Calendar, Plus, Users, MapPin, Edit, Trash2 } from 'lucide-react';

interface Event {
  _id: string;
  name: string;
  slug: string;
  venue: string;
  startAt: string;
  capacity: number;
  status: string;
  eventMode: string;
}

export function AdminEventsPage() {
  const { data, isLoading } = useQuery({
    queryKey: ['admin-events'],
    queryFn: () => api('/api/v1/admin/events') as unknown as { data: { events: Event[] } },
  });

  const events = data?.data.events ?? [];

  const statusColor = (status: string) => {
    switch (status) {
      case 'draft': return 'bg-gray-100 text-gray-700';
      case 'published': return 'bg-blue-100 text-blue-700';
      case 'registration_open': return 'bg-green-100 text-green-700';
      case 'registration_closed': return 'bg-yellow-100 text-yellow-700';
      case 'in_progress': return 'bg-purple-100 text-purple-700';
      case 'completed': return 'bg-green-100 text-green-700';
      case 'archived': return 'bg-gray-300 text-gray-600';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">Events</h1>
        <Link
          to="/admin/events/new"
          className="flex items-center gap-2 rounded-lg bg-rose-500 px-4 py-2 font-semibold text-white hover:bg-rose-600"
        >
          <Plus className="h-4 w-4" />
          Create Event
        </Link>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-rose-200 border-t-rose-600" />
        </div>
      ) : (
        <div className="grid gap-4">
          {events.map((event) => (
            <div key={event._id} className="rounded-xl border border-rose-100 bg-white p-6 shadow-sm">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3">
                    <h3 className="text-lg font-semibold text-gray-900">{event.name}</h3>
                    <span className={`rounded-full px-3 py-1 text-xs font-medium ${statusColor(event.status)}`}>
                      {event.status.replace(/_/g, ' ')}
                    </span>
                  </div>
                  <div className="mt-2 flex items-center gap-4 text-sm text-gray-500">
                    <span className="flex items-center gap-1">
                      <MapPin className="h-4 w-4" />
                      {event.venue}
                    </span>
                    <span className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      {new Date(event.startAt).toLocaleDateString()}
                    </span>
                    <span className="flex items-center gap-1">
                      <Users className="h-4 w-4" />
                      {event.capacity} capacity
                    </span>
                    <span className="rounded bg-gray-100 px-2 py-0.5 text-xs">
                      {event.eventMode}
                    </span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button className="rounded-lg border border-gray-200 p-2 text-gray-600 hover:bg-gray-50">
                    <Edit className="h-4 w-4" />
                  </button>
                  <button className="rounded-lg border border-gray-200 p-2 text-gray-600 hover:bg-red-50 hover:text-red-500">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
          {events.length === 0 && (
            <div className="rounded-xl border border-dashed border-gray-300 p-12 text-center text-gray-500">
              No events yet. Create your first event to get started.
            </div>
          )}
        </div>
      )}
    </div>
  );
}
