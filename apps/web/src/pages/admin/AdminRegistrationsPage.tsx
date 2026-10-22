import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '../../lib/api';
import { CheckCircle, XCircle, Clock, AlertCircle } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';

interface EventOption { _id: string; name: string }
interface Registration {
  _id: string;
  participantId: { _id: string; email: string };
  registrationStatus: string;
  questionnaireStatus: string;
  registeredAt: string;
}

export function AdminRegistrationsPage() {
  const { t } = useLanguage();
  const [eventId, setEventId] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const queryClient = useQueryClient();
  const { data: eventsData } = useQuery({
    queryKey: ['admin-events'],
    queryFn: () => api<{ data: { events: EventOption[] } }>('/api/v1/admin/events'),
  });
  const events = eventsData?.data.events ?? [];
  const selectedEventId = eventId || events[0]?._id || '';
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['admin-registrations', selectedEventId, statusFilter],
    enabled: !!selectedEventId,
    queryFn: () => api<{ data: { registrations: Registration[] } }>(
      `/api/v1/admin/events/${selectedEventId}/registrations${statusFilter === 'all' ? '' : `?status=${statusFilter}`}`,
    ),
  });
  const updateMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) => api(`/api/v1/admin/registrations/${id}`, {
      method: 'PATCH', body: JSON.stringify({ status, reason: `${status} by event host` }),
    }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin-registrations', selectedEventId] }),
  });
  const registrations = data?.data.registrations ?? [];
  const statusIcon = (status: string) => {
    if (status === 'approved') return <CheckCircle className="h-4 w-4 text-green-500" />;
    if (status === 'rejected') return <XCircle className="h-4 w-4 text-red-500" />;
    if (status === 'submitted' || status === 'pending_review') return <Clock className="h-4 w-4 text-amber-500" />;
    return <AlertCircle className="h-4 w-4 text-gray-500" />;
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div><h1 className="text-3xl font-bold text-gray-900">{t('Registration Review')}</h1><p className="mt-1 text-sm text-gray-500">{t('Review and update participant applications for an event.')}</p></div>
        <label className="text-sm font-medium text-gray-700">{t('Event')}
          <select value={selectedEventId} onChange={(e) => setEventId(e.target.value)} className="mt-1 block min-w-64 rounded-lg border border-gray-300 px-4 py-2">
            {events.map((event) => <option key={event._id} value={event._id}>{event.name}</option>)}
          </select>
        </label>
      </div>
      <div className="flex flex-wrap gap-2">
        {['all', 'submitted', 'pending_review', 'approved', 'rejected', 'waitlisted'].map((status) => <button key={status} onClick={() => setStatusFilter(status)} className={`rounded-full px-4 py-2 text-sm font-medium ${statusFilter === status ? 'bg-rose-500 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>{t(status.replace(/_/g, ' '))}</button>)}
      </div>
      {isLoading && <p className="py-8 text-center text-gray-500">Loading registrations…</p>}
      {isError && <p role="alert" className="text-sm text-red-600">{(error as Error).message}</p>}
      {updateMutation.isError && <p role="alert" className="text-sm text-red-600">{(updateMutation.error as Error).message}</p>}
      {!isLoading && !isError && <div className="overflow-x-auto rounded-xl border border-rose-100 bg-white shadow-sm">
        <table className="w-full text-sm"><thead className="bg-gray-50 text-gray-500"><tr><th className="px-4 py-3 text-left">{t('Participant')}</th><th className="px-4 py-3 text-left">{t('Status')}</th><th className="px-4 py-3 text-left">{t('Questionnaire')}</th><th className="px-4 py-3 text-left">{t('Registered')}</th><th className="px-4 py-3 text-right">{t('Actions')}</th></tr></thead>
          <tbody>{registrations.map((reg) => <tr key={reg._id} className="border-t border-gray-100"><td className="px-4 py-3 font-medium text-gray-900">{reg.participantId?.email ?? t('Participant')}</td><td className="px-4 py-3"><span className="inline-flex items-center gap-2">{statusIcon(reg.registrationStatus)}{t(reg.registrationStatus.replace(/_/g, ' '))}</span></td><td className="px-4 py-3">{t(reg.questionnaireStatus)}</td><td className="px-4 py-3 text-gray-500">{new Date(reg.registeredAt).toLocaleDateString()}</td><td className="px-4 py-3 text-right"><div className="flex justify-end gap-2">{['submitted', 'pending_review'].includes(reg.registrationStatus) && <><button disabled={updateMutation.isPending} onClick={() => updateMutation.mutate({ id: reg._id, status: 'approved' })} className="rounded-lg bg-green-600 px-3 py-1 text-xs font-semibold text-white disabled:opacity-50">{t('Approve')}</button><button disabled={updateMutation.isPending} onClick={() => updateMutation.mutate({ id: reg._id, status: 'rejected' })} className="rounded-lg bg-red-600 px-3 py-1 text-xs font-semibold text-white disabled:opacity-50">{t('Reject')}</button></>}</div></td></tr>)}</tbody>
        </table>
        {registrations.length === 0 && <div className="py-8 text-center text-gray-500">{t('No registrations found for this event.')}</div>}
      </div>}
      {!events.length && !isLoading && <p className="text-center text-gray-500">{t('Create an event before managing registrations.')}</p>}
    </div>
  );
}
