import { Link } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '../../lib/api';
import { Calendar, Plus, Users, MapPin, Edit } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';

interface Event {
  _id: string;
  name: string;
  slug: string;
  venue: string;
  startAt: string;
  capacity: number;
  status: string;
  eventMode: string;
  registeredCount: number;
}

export function AdminEventsPage() {
  const { t, language } = useLanguage();
  const queryClient = useQueryClient();
  const { data, isLoading } = useQuery({
    queryKey: ['admin-events'],
    queryFn: () => api('/api/v1/admin/events') as unknown as { data: { events: Event[] } },
  });

  const events = data?.data.events ?? [];
  const transition = useMutation({
    mutationFn: ({ id, action }: { id: string; action: string }) =>
      api(`/api/v1/events/${id}/${action}`, { method: 'POST' }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin-events'] }),
  });

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
        <h1 className="text-3xl font-bold text-gray-900">{t('Events')}</h1>
        <Link
          to="/admin/events/new"
          className="flex items-center gap-2 rounded-lg bg-rose-500 px-4 py-2 font-semibold text-white hover:bg-rose-600"
        >
          <Plus className="h-4 w-4" />
          {t('Create event')}
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
                      {t(event.status.replace(/_/g, ' '))}
                    </span>
                  </div>
                  <div className="mt-2 flex items-center gap-4 text-sm text-gray-500">
                    <span className="flex items-center gap-1">
                      <MapPin className="h-4 w-4" />
                      {event.venue}
                    </span>
                    <span className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      {new Date(event.startAt).toLocaleDateString(language === 'fr' ? 'fr-FR' : 'en-US')}
                    </span>
                    <span className="flex items-center gap-1">
                      <Users className="h-4 w-4" />
                      {event.capacity} {t('capacity')}
                    </span>
                    <span className="rounded bg-gray-100 px-2 py-0.5 text-xs">
                      {event.eventMode}
                    </span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Link to={`/admin/events/${event._id}/edit`} aria-label={`Edit ${event.name}`} className="rounded-lg border border-gray-200 p-2 text-gray-600 hover:bg-gray-50">
                    <Edit className="h-4 w-4" />
                  </Link>
                </div>
              </div>
              <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-gray-100 pt-4">
                <p className="text-sm text-gray-500">{event.registeredCount ?? 0} {t('registered')}</p>
                <div className="flex flex-wrap gap-2">
                  {event.status === 'draft' && <button onClick={() => transition.mutate({ id: event._id, action: 'publish' })} className="rounded-lg bg-blue-600 px-3 py-1.5 text-sm font-medium text-white">{t('Publish')}</button>}
                  {event.status === 'published' && <button onClick={() => transition.mutate({ id: event._id, action: 'open-registration' })} className="rounded-lg bg-green-600 px-3 py-1.5 text-sm font-medium text-white">{t('Open registration')}</button>}
                  {event.status === 'registration_open' && <button onClick={() => transition.mutate({ id: event._id, action: 'close-registration' })} className="rounded-lg bg-amber-600 px-3 py-1.5 text-sm font-medium text-white">{t('Close registration')}</button>}
                  {['registration_open', 'registration_closed'].includes(event.status) && <button onClick={() => transition.mutate({ id: event._id, action: 'start' })} className="rounded-lg bg-purple-600 px-3 py-1.5 text-sm font-medium text-white">{t('Start event')}</button>}
                  {event.status === 'in_progress' && <button onClick={() => transition.mutate({ id: event._id, action: 'complete' })} className="rounded-lg bg-green-700 px-3 py-1.5 text-sm font-medium text-white">{t('Complete event')}</button>}
                  {event.status === 'completed' && <button onClick={() => transition.mutate({ id: event._id, action: 'archive' })} className="rounded-lg border border-gray-200 px-3 py-1.5 text-sm text-gray-600">{t('Archive')}</button>}
                </div>
              </div>
            </div>
          ))}
          {events.length === 0 && (
            <div className="rounded-xl border border-dashed border-gray-300 p-12 text-center text-gray-500">
              {t('No events yet. Create your first event to get started.')}
            </div>
          )}
        </div>
      )}
      {transition.isError && <p role="alert" className="text-sm text-red-600">{(transition.error as Error).message}</p>}
    </div>
  );
}
