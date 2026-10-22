import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useQuery } from '@tanstack/react-query';
import { api } from '../lib/api';
import { Calendar, FileText, Heart, User, Clock, MapPin, ClipboardCheck } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

interface Registration {
  _id: string;
  eventId: string;
  registrationStatus: string;
  questionnaireStatus: string;
  checkInStatus: string;
}

interface Event {
  id: string;
  name: string;
  startAt: string;
  venue: string;
  status: string;
}

export function DashboardPage() {
  const { user, profile } = useAuth();
  const { t, language } = useLanguage();

  const { data: registrationsData } = useQuery({
    queryKey: ['my-registrations'],
    queryFn: async () => {
      const response = await api<{ data: { registrations: Registration[] } }>('/api/v1/my-registrations');
      return response;
    },
    enabled: !!user,
  });

  const { data: eventsData } = useQuery({
    queryKey: ['events'],
    queryFn: () => api<{ data: { events: Event[] } }>('/api/v1/events'),
  });

  const events = eventsData?.data.events ?? [];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
        return 'bg-green-100 text-green-700';
      case 'pending_review':
        return 'bg-yellow-100 text-yellow-700';
      case 'waitlisted':
        return 'bg-orange-100 text-orange-700';
      case 'rejected':
        return 'bg-red-100 text-red-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div className="rounded-2xl bg-gradient-to-r from-rose-500 to-purple-600 p-8 text-white">
        <h1 className="text-3xl font-bold">
          {t('Welcome back,')} {profile?.displayName?.split(' ')[0] ?? t('there')}!
        </h1>
        <p className="mt-2 text-rose-100">
          {user
            ? t("Here's what's happening with your SpeedDate journey.")
            : 'Sign in to see your dashboard.'}
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-xl border border-rose-100 bg-white p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-rose-100">
              <Calendar className="h-5 w-5 text-rose-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{events.length}</p>
              <p className="text-sm text-gray-500">{t('Upcoming Events')}</p>
            </div>
          </div>
        </div>
        <div className="rounded-xl border border-rose-100 bg-white p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-purple-100">
              <FileText className="h-5 w-5 text-purple-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">
                {registrationsData?.data.registrations?.filter(
                  (r: Registration) => r.questionnaireStatus === 'submitted',
                ).length ?? 0}
              </p>
              <p className="text-sm text-gray-500">{t('Questionnaires Done')}</p>
            </div>
          </div>
        </div>
        <div className="rounded-xl border border-rose-100 bg-white p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-pink-100">
              <Heart className="h-5 w-5 text-pink-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">
                {registrationsData?.data.registrations?.length ?? 0}
              </p>
              <p className="text-sm text-gray-500">{t('My Registrations')}</p>
            </div>
          </div>
        </div>
        <div className="rounded-xl border border-rose-100 bg-white p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100">
              <ClipboardCheck className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">
                {registrationsData?.data.registrations?.filter((registration) => ['approved', 'checked_in'].includes(registration.registrationStatus)).length ?? 0}
              </p>
              <p className="text-sm text-gray-500">{t('Approved Registrations')}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Upcoming Events */}
      <section>
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-900">{t('Upcoming Events')}</h2>
          <Link to="/events" className="text-sm font-medium text-rose-600 hover:text-rose-700">
            {t('View all')}
          </Link>
        </div>
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          {events.slice(0, 4).map((event) => (
            <div key={event.id} className="rounded-xl border border-rose-100 bg-white p-4">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-semibold text-gray-900">{event.name}</h3>
                  <div className="mt-2 space-y-1 text-sm text-gray-500">
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-rose-400" />
                      {event.venue}
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-rose-400" />
                      {new Date(event.startAt).toLocaleDateString(language === 'fr' ? 'fr-FR' : 'en-US', { dateStyle: 'long' })}
                    </div>
                  </div>
                </div>
                <span
                  className={`rounded-full px-3 py-1 text-xs font-medium ${getStatusColor(event.status)}`}
                >
                  {event.status.replace('_', ' ')}
                </span>
              </div>
              <Link
                to={`/events/${event.id}`}
                className="mt-4 block rounded-lg bg-rose-50 py-2 text-center text-sm font-medium text-rose-600 hover:bg-rose-100"
              >
                {t('View Details')}
              </Link>
            </div>
          ))}
        </div>
      </section>

      {/* Quick Actions */}
      <section>
        <h2 className="text-xl font-bold text-gray-900">{t('Quick Actions')}</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <Link
            to="/profile"
            className="flex items-center gap-3 rounded-xl border border-rose-100 bg-white p-4 transition hover:shadow-md"
          >
            <User className="h-8 w-8 text-rose-500" />
            <div>
              <p className="font-medium text-gray-900">{t('Edit Profile')}</p>
              <p className="text-sm text-gray-500">{t('Update your information')}</p>
            </div>
          </Link>
          <Link
            to="/questionnaire"
            className="flex items-center gap-3 rounded-xl border border-rose-100 bg-white p-4 transition hover:shadow-md"
          >
            <FileText className="h-8 w-8 text-purple-500" />
            <div>
              <p className="font-medium text-gray-900">{t('Questionnaire')}</p>
              <p className="text-sm text-gray-500">{t('Complete your profile')}</p>
            </div>
          </Link>
          <Link
            to="/matches"
            className="flex items-center gap-3 rounded-xl border border-rose-100 bg-white p-4 transition hover:shadow-md"
          >
            <Heart className="h-8 w-8 text-pink-500" />
            <div>
              <p className="font-medium text-gray-900">{t('View Matches')}</p>
              <p className="text-sm text-gray-500">{t('See your compatibility')}</p>
            </div>
          </Link>
        </div>
      </section>
    </div>
  );
}
