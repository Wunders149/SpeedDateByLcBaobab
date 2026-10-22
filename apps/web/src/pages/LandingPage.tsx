import { Link } from 'react-router-dom';
import { Heart, Users, Sparkles, Shield, Clock, MapPin, ArrowRight } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { api } from '../lib/api';
import { useLanguage } from '../contexts/LanguageContext';

interface EventItem {
  id: string;
  name: string;
  description: string;
  venue: string;
  startAt: string;
  capacity: number;
  registeredCount: number;
  status: string;
}

export function LandingPage() {
  const { t, language } = useLanguage();
  const { data: eventsData } = useQuery({
    queryKey: ['events'],
    queryFn: () => api<{ data: { events: EventItem[] } }>('/api/v1/events'),
  });

  const events = eventsData?.data.events ?? [];

  return (
    <div className="space-y-16">
      {/* Hero Section */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-rose-500 via-pink-500 to-purple-600 p-8 text-white md:p-16">
        <div className="relative z-10 max-w-2xl">
          <h1 className="text-4xl font-bold leading-tight md:text-6xl">
            {t('Meet someone who gets you.')}
          </h1>
          <p className="mt-4 text-lg text-rose-100 md:text-xl">
            {t('SpeedDate combines thoughtful matching with the excitement of in-person events. Register, discover compatible people, and connect meaningfully.')}
          </p>
          <div className="mt-8 flex flex-wrap gap-4">
            <Link
              to="/register"
              className="flex items-center gap-2 rounded-full bg-white px-6 py-3 font-semibold text-rose-600 hover:bg-rose-50"
            >
              {t('Get Started')} <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              to="/events"
              className="flex items-center gap-2 rounded-full border border-white/30 px-6 py-3 font-semibold text-white hover:bg-white/10"
            >
              {t('View Events')}
            </Link>
          </div>
        </div>
        <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-white/10 blur-3xl" />
        <div className="absolute -bottom-20 -left-20 h-64 w-64 rounded-full bg-purple-400/20 blur-3xl" />
      </section>

      {/* How It Works */}
      <section>
        <h2 className="text-center text-3xl font-bold text-gray-900">{t('How It Works')}</h2>
        <div className="mt-8 grid gap-6 md:grid-cols-3">
          {[
            {
              icon: Users,
              title: 'Register',
              description: 'Create your profile and tell us about yourself.',
            },
            {
              icon: Sparkles,
              title: 'Discover',
              description: 'Our matching algorithm finds compatible people.',
            },
            {
              icon: Heart,
              title: 'Connect',
              description: 'Meet at events and form meaningful connections.',
            },
          ].map(({ icon: Icon, title, description }) => (
            <div
              key={title}
              className="rounded-2xl border border-rose-100 bg-white p-6 text-center shadow-sm"
            >
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-rose-100">
                <Icon className="h-6 w-6 text-rose-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">{t(title)}</h3>
              <p className="mt-2 text-sm text-gray-600">{t(description)}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Upcoming Events */}
      <section>
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-900">{t('Upcoming Events')}</h2>
          <Link to="/events" className="text-sm font-medium text-rose-600 hover:text-rose-700">
            {t('View all')}
          </Link>
        </div>
        <div className="mt-6 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {events.slice(0, 3).map((event) => (
            <div
              key={event.id}
              className="rounded-2xl border border-rose-100 bg-white p-6 shadow-sm transition hover:shadow-md"
            >
              <h3 className="text-lg font-semibold text-gray-900">{event.name}</h3>
              <p className="mt-2 text-sm text-gray-600">{event.description}</p>
              <div className="mt-4 space-y-2 text-sm text-gray-500">
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-rose-400" />
                  {event.venue}
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-rose-400" />
                  {new Date(event.startAt).toLocaleDateString(language === 'fr' ? 'fr-FR' : 'en-US', { dateStyle: 'long' })}
                </div>
              </div>
              <div className="mt-4 flex items-center justify-between">
                <span className="text-sm text-gray-500">
                  {event.registeredCount}/{event.capacity} {t('spots')}
                </span>
                <Link
                  to="/register"
                  className="rounded-full bg-rose-500 px-4 py-2 text-sm font-semibold text-white hover:bg-rose-600"
                >
                  {t('Register')}
                </Link>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Trust Section */}
      <section className="rounded-2xl bg-purple-50 p-8 md:p-12">
        <div className="grid gap-8 md:grid-cols-2">
          <div>
            <Shield className="h-10 w-10 text-purple-600" />
            <h3 className="mt-4 text-xl font-bold text-gray-900">Privacy First</h3>
            <p className="mt-2 text-gray-600">
              Your personal information is protected. We never share your contact details without
              your explicit consent.
            </p>
          </div>
          <div>
            <Heart className="h-10 w-10 text-rose-500" />
            <h3 className="mt-4 text-xl font-bold text-gray-900">Consent-Based Matching</h3>
            <p className="mt-2 text-gray-600">
              Matches are only revealed when both parties express interest. You control who sees
              your information.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
