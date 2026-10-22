import { useQuery } from '@tanstack/react-query';
import { api } from '../lib/api';
import { useAuth } from '../contexts/AuthContext';
import { Users, Calendar, FileText, Heart, Activity, ClipboardCheck, QrCode, ClipboardList, BarChart3, Timer, Bell, ArrowRight, Plus } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';

interface DashboardData {
  overview: {
    totalParticipants: number;
    totalEvents: number;
    pendingRegistrations: number;
    approvedRegistrations: number;
    waitlistedRegistrations: number;
    checkedInParticipants: number;
  };
  recentActivity: Array<{
    _id: string;
    action: string;
    targetType: string;
    timestamp: string;
  }>;
  upcomingEvents: Array<{
    _id: string;
    name: string;
    startAt: string;
    status: string;
  }>;
}

export function AdminPage() {
  const { user } = useAuth();
  const { t } = useLanguage();

  const { data, isLoading } = useQuery({
    queryKey: ['admin-dashboard'],
    queryFn: () => api<{ data: DashboardData }>('/api/v1/admin/dashboard'),
    enabled: !!user,
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-rose-200 border-t-rose-600" />
      </div>
    );
  }

  const dashboard = data?.data;

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-5 rounded-3xl bg-gradient-to-br from-rose-600 via-rose-600 to-fuchsia-700 p-6 text-white shadow-lg shadow-rose-200 sm:flex-row sm:items-center sm:justify-between sm:p-8">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.16em] text-rose-100">Host workspace</p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">{t('Host dashboard')}</h1>
          <p className="mt-2 max-w-xl text-sm text-rose-50 sm:text-base">{t('Keep your event moving: review sign-ups, prepare rotations, and welcome guests.')}</p>
        </div>
        <Link to="/admin/events/new" className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-white px-4 py-3 text-sm font-bold text-rose-700 shadow-sm transition hover:bg-rose-50">
          <Plus className="h-4 w-4" /> {t('Create event')}
        </Link>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-2xl border border-rose-100 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-rose-100">
              <Users className="h-5 w-5 text-rose-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">
                {dashboard?.overview.totalParticipants ?? 0}
              </p>
              <p className="text-sm text-gray-500">{t('Participants')}</p>
            </div>
          </div>
        </div>
        <div className="rounded-2xl border border-rose-100 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-purple-100">
              <Calendar className="h-5 w-5 text-purple-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">
                {dashboard?.overview.totalEvents ?? 0}
              </p>
              <p className="text-sm text-gray-500">{t('Events')}</p>
            </div>
          </div>
        </div>
        <div className="rounded-2xl border border-rose-100 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-yellow-100">
              <FileText className="h-5 w-5 text-yellow-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">
                {dashboard?.overview.pendingRegistrations ?? 0}
              </p>
              <p className="text-sm text-gray-500">{t('Pending')}</p>
            </div>
          </div>
        </div>
        <div className="rounded-2xl border border-rose-100 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-100">
              <Heart className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">
                {dashboard?.overview.approvedRegistrations ?? 0}
              </p>
              <p className="text-sm text-gray-500">{t('Approved')}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Link
          to="/admin/events"
          className="group flex items-center gap-3 rounded-2xl border border-rose-100 bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:border-rose-200 hover:shadow-md"
        >
          <Calendar className="h-8 w-8 text-rose-500" />
          <div>
            <p className="font-medium text-gray-900">{t('Manage Events')}</p>
            <p className="text-sm text-gray-500">{t('Create and edit events')}</p>
          </div>
          <ArrowRight className="ml-auto h-4 w-4 text-slate-300 transition group-hover:translate-x-1 group-hover:text-rose-500" />
        </Link>
        <Link
          to="/admin/registrations"
          className="group flex items-center gap-3 rounded-2xl border border-rose-100 bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:border-rose-200 hover:shadow-md"
        >
          <Users className="h-8 w-8 text-purple-500" />
          <div>
            <p className="font-medium text-gray-900">{t('Registration Review')}</p>
            <p className="text-sm text-gray-500">{t('Approve, reject, and waitlist applicants')}</p>
          </div>
          <ArrowRight className="ml-auto h-4 w-4 text-slate-300 transition group-hover:translate-x-1 group-hover:text-rose-500" />
        </Link>
        <Link
          to="/admin/matching"
          className="group flex items-center gap-3 rounded-2xl border border-rose-100 bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:border-rose-200 hover:shadow-md"
        >
          <Heart className="h-8 w-8 text-pink-500" />
          <div>
            <p className="font-medium text-gray-900">{t('Matching')}</p>
            <p className="text-sm text-gray-500">{t('Generate and publish matches')}</p>
          </div>
          <ArrowRight className="ml-auto h-4 w-4 text-slate-300 transition group-hover:translate-x-1 group-hover:text-rose-500" />
        </Link>
      </div>

      <section>
        <h2 className="mb-3 text-lg font-semibold text-gray-900">{t('Event operations')}</h2>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { to: '/admin/check-in', title: 'Check-In', detail: 'Manage event attendance', icon: QrCode },
            { to: '/admin/questionnaire-builder', title: 'Questionnaires', detail: 'Build and publish forms', icon: ClipboardList },
            { to: '/admin/questions', title: 'Question bank', detail: 'Create and manage questions', icon: ClipboardList },
            { to: '/admin/matches/review', title: 'Review Matches', detail: 'Finalize generated results', icon: ClipboardCheck },
            { to: '/admin/results', title: 'Publish Results', detail: 'Release results to participants', icon: Heart },
            { to: '/admin/sessions', title: 'Session Rotations', detail: 'Schedule speed-date rounds', icon: Timer },
            { to: '/admin/reports', title: 'Reports', detail: 'Review attendance and match data', icon: BarChart3 },
            { to: '/admin/participants', title: 'Participants', detail: 'Search participant accounts', icon: Users },
            { to: '/admin/notifications', title: 'Announcements', detail: 'Message registered participants', icon: Bell },
          ].map(({ to, title, detail, icon: Icon }) => <Link key={to} to={to} className="group flex min-h-20 items-center gap-3 rounded-2xl border border-rose-100 bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:border-rose-200 hover:shadow-md"><Icon className="h-6 w-6 shrink-0 text-rose-500" /><span><span className="block font-medium text-gray-900">{t(title)}</span><span className="text-sm text-gray-500">{t(detail)}</span></span><ArrowRight className="ml-auto h-4 w-4 shrink-0 text-slate-300 transition group-hover:translate-x-1 group-hover:text-rose-500" /></Link>)}
        </div>
      </section>

      {/* Recent Activity */}
      <div className="rounded-2xl border border-rose-100 bg-white p-5 shadow-sm sm:p-6">
        <div className="flex items-center justify-between gap-4"><div><h2 className="text-lg font-semibold text-gray-900">{t('Recent activity')}</h2><p className="mt-1 text-sm text-gray-500">{t('The latest changes across your events.')}</p></div><Activity className="h-5 w-5 text-rose-400" /></div>
        <div className="mt-4 space-y-3">
          {dashboard?.recentActivity?.length ? dashboard.recentActivity.slice(0, 5).map((activity) => (
            <div
              key={activity._id}
              className="flex flex-col gap-1 rounded-xl bg-slate-50 p-3 sm:flex-row sm:items-center sm:justify-between"
            >
              <div className="flex items-center gap-3">
                <Activity className="h-4 w-4 text-gray-400" />
                <span className="text-sm text-gray-700">{activity.action}</span>
              </div>
              <span className="pl-7 text-xs text-gray-500 sm:pl-0">
                {new Date(activity.timestamp).toLocaleString()}
              </span>
            </div>
          )) : <div className="rounded-xl border border-dashed border-slate-200 px-4 py-8 text-center"><p className="text-sm font-medium text-slate-700">{t('No activity yet')}</p><p className="mt-1 text-sm text-slate-500">{t('Updates from event setup and registrations will appear here.')}</p></div>}
        </div>
      </div>
    </div>
  );
}
