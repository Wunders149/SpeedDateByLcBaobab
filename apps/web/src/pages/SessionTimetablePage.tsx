import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { api } from '../lib/api';
import { Calendar, Clock, Users, MapPin } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

interface SessionSchedule {
  id: string; name: string; status: string; rounds: number;
  event: { name: string; venue: string; startAt: string; endAt: string };
  schedule: Array<{ round: number; tableNumber: number; startTime: string; endTime: string; partnerName: string }>;
}

export function SessionTimetablePage() {
  const { t, language } = useLanguage();
  const [selectedId, setSelectedId] = useState('');
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['my-sessions'],
    queryFn: () => api<{ data: { sessions: SessionSchedule[] } }>('/api/v1/my-sessions'),
  });
  const sessions = data?.data.sessions ?? [];
  const session = sessions.find((item) => item.id === selectedId) ?? sessions[0];
  const now = Date.now();

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div><h1 className="text-3xl font-bold text-gray-900">{t('Session Timetable')}</h1><p className="mt-1 text-gray-600">{t('Your event rotation schedule')}</p></div>
      {isLoading && <p className="py-10 text-center text-gray-500">{t('Loading your schedule…')}</p>}
      {isError && <p role="alert" className="text-sm text-red-600">{(error as Error).message}</p>}
      {!isLoading && !isError && !sessions.length && <div className="rounded-2xl border border-dashed border-gray-300 bg-white p-10 text-center"><p className="text-gray-600">{t('No rotation schedule is available for your account yet.')}</p><Link to="/events" className="mt-4 inline-block text-sm font-medium text-rose-600">{t('Browse events')}</Link></div>}
      {session && <>
        {sessions.length > 1 && <label className="block text-sm font-medium text-gray-700">{t('Event')}<select value={session.id} onChange={(e) => setSelectedId(e.target.value)} className="mt-1 block w-full rounded-lg border border-gray-300 px-4 py-2">{sessions.map((item) => <option key={item.id} value={item.id}>{item.event.name} · {item.name}</option>)}</select></label>}
        <div className="rounded-2xl border border-rose-100 bg-white p-6 shadow-sm"><div className="mb-4 flex items-center justify-between"><div><h2 className="text-lg font-semibold">{session.event.name}</h2><p className="text-sm text-gray-500">{session.name}</p></div><span className="rounded-full bg-green-100 px-3 py-1 text-sm capitalize text-green-700">{t(session.status)}</span></div><div className="grid gap-4 sm:grid-cols-2 text-sm text-gray-600"><div className="flex items-center gap-2"><Calendar className="h-4 w-4 text-rose-400" />{new Date(session.event.startAt).toLocaleDateString(language === 'fr' ? 'fr-FR' : 'en-US')}</div><div className="flex items-center gap-2"><MapPin className="h-4 w-4 text-rose-400" />{session.event.venue}</div><div className="flex items-center gap-2"><Clock className="h-4 w-4 text-rose-400" />{new Date(session.event.startAt).toLocaleTimeString(language === 'fr' ? 'fr-FR' : 'en-US', { hour: '2-digit', minute: '2-digit' })} – {new Date(session.event.endAt).toLocaleTimeString(language === 'fr' ? 'fr-FR' : 'en-US', { hour: '2-digit', minute: '2-digit' })}</div><div className="flex items-center gap-2"><Users className="h-4 w-4 text-rose-400" />{session.rounds} {t('rounds')}</div></div></div>
        <div className="space-y-3">{session.schedule.map((round) => { const start = new Date(round.startTime).getTime(); const end = new Date(round.endTime).getTime(); const status = now >= end ? 'completed' : now >= start ? 'current' : 'upcoming'; return <div key={round.round} className={`rounded-xl border p-4 ${status === 'current' ? 'border-rose-400 bg-rose-50 shadow-md' : status === 'completed' ? 'border-gray-200 bg-gray-50 opacity-70' : 'border-gray-100 bg-white'}`}><div className="flex items-center justify-between gap-3"><div><p className="font-medium text-gray-900">{t('Round')} {round.round} · {t('Table')} {round.tableNumber}</p><p className="mt-1 text-sm text-gray-600">{t(status === 'current' ? 'Now meeting' : status === 'completed' ? 'Completed' : 'Upcoming')}: {round.partnerName}</p></div><div className="text-right"><p className="text-sm font-medium">{new Date(round.startTime).toLocaleTimeString(language === 'fr' ? 'fr-FR' : 'en-US', { hour: '2-digit', minute: '2-digit' })}</p><p className="text-xs text-gray-500">{t(status)}</p></div></div></div>; })}</div>
      </>}
      <div className="text-center"><Link to="/dashboard" className="text-sm font-medium text-rose-600 hover:text-rose-700">{t('Back to Dashboard')}</Link></div>
    </div>
  );
}
