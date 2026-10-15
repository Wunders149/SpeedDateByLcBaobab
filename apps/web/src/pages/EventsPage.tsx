import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { api } from '../lib/api';
import { Calendar, MapPin, Clock, Users } from 'lucide-react';

interface EventItem {
  id: string;
  name: string;
  description: string;
  venue: string;
  startAt: string;
  endAt: string;
  capacity: number;
  registeredCount: number;
  status: string;
  eventMode: string;
}

export function EventsPage() {
  const { data, isLoading, error } = useQuery({
    queryKey: ['events'],
    queryFn: () => api<{ data: { events: EventItem[] } }>('/api/v1/events'),
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-rose-200 border-t-rose-600" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-xl bg-red-50 p-4 text-red-600">
        Failed to load events. Please try again.
      </div>
    );
  }

  const events = data?.data.events ?? [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Events</h1>
        <p className="mt-2 text-gray-600">Discover upcoming SpeedDate events near you</p>
      </div>

      {events.length === 0 ? (
        <div className="rounded-xl border border-dashed border-gray-300 p-12 text-center">
          <Calendar className="mx-auto h-12 w-12 text-gray-400" />
          <p className="mt-4 text-gray-500">No upcoming events at the moment</p>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2">
          {events.map((event) => (
            <div
              key={event.id}
              className="rounded-2xl border border-rose-100 bg-white p-6 shadow-sm transition hover:shadow-md"
            >
              <div className="flex items-start justify-between">
                <h2 className="text-xl font-semibold text-gray-900">{event.name}</h2>
                <span className="rounded-full bg-rose-100 px-3 py-1 text-xs font-medium text-rose-700">
                  {event.status.replace('_', ' ')}
                </span>
              </div>
              <p className="mt-2 text-sm text-gray-600">{event.description}</p>
              <div className="mt-4 space-y-2 text-sm text-gray-500">
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-rose-400" />
                  {event.venue}
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-rose-400" />
                  {new Date(event.startAt).toLocaleDateString('en-US', { dateStyle: 'long' })}
                </div>
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-rose-400" />
                  {event.registeredCount}/{event.capacity} registered
                </div>
              </div>
              <div className="mt-4 flex gap-2">
                <Link
                  to={`/events/${event.id}`}
                  className="flex-1 rounded-lg bg-rose-500 py-2 text-center text-sm font-semibold text-white hover:bg-rose-600"
                >
                  View Details
                </Link>
                <Link
                  to="/register"
                  className="flex-1 rounded-lg border border-rose-200 py-2 text-center text-sm font-semibold text-rose-600 hover:bg-rose-50"
                >
                  Register
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
