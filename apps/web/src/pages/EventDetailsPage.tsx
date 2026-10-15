import { Link, useNavigate, useParams } from 'react-router-dom';
import { useQuery, useMutation } from '@tanstack/react-query';
import { api } from '../lib/api';
import { useAuth } from '../contexts/AuthContext';
import { Calendar, MapPin, Clock, Users, ArrowLeft, AlertCircle } from 'lucide-react';
import { useState } from 'react';

interface EventDetail {
  id: string;
  name: string;
  description: string;
  venue: string;
  timezone: string;
  startAt: string;
  endAt: string;
  registrationDeadline: string;
  capacity: number;
  registeredCount: number;
  eligibleGroups: string[];
  eventMode: string;
  organizerContact: string;
  instructions?: string;
  status: string;
}

export function EventDetailsPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [registering, setRegistering] = useState(false);
  const { eventId } = useParams<{ eventId: string }>();

  const { data, isLoading, error } = useQuery({
    queryKey: ['event', eventId],
    queryFn: () => api(`/api/v1/events/${eventId}`) as unknown as { data: { event: EventDetail } },
    enabled: !!eventId,
  });

  const registerMutation = useMutation({
    mutationFn: () =>
      api(`/api/v1/events/${eventId}/registrations`, {
        method: 'POST',
        body: JSON.stringify({ participantId: user?.id }),
      }),
    onSuccess: () => {
      setRegistering(false);
      alert('Registration submitted successfully!');
      navigate('/dashboard');
    },
    onError: (err: Error) => {
      setRegistering(false);
      alert(err.message);
    },
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-rose-200 border-t-rose-600" />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="rounded-xl bg-red-50 p-4 text-red-600">
        Event not found or failed to load.
      </div>
    );
  }

  const event = data.data.event;
  const spotsLeft = event.capacity - event.registeredCount;
  const registrationOpen = event.status === 'registration_open' && new Date() < new Date(event.registrationDeadline);
  const isFull = spotsLeft <= 0;

  const formatDate = (date: string) =>
    new Date(date).toLocaleDateString('en-US', { dateStyle: 'full' });

  const formatTime = (date: string) =>
    new Date(date).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });

  return (
    <div className="mx-auto max-w-4xl space-y-8">
      <Link to="/events" className="inline-flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-rose-600">
        <ArrowLeft className="h-4 w-4" />
        Back to Events
      </Link>

      {/* Header */}
      <div className="rounded-3xl bg-gradient-to-br from-rose-500 to-purple-600 p-8 text-white">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold md:text-4xl">{event.name}</h1>
            <p className="mt-2 text-rose-100">{event.description}</p>
          </div>
          <span className="rounded-full bg-white/20 px-4 py-1 text-sm">
            {event.status.replace(/_/g, ' ')}
          </span>
        </div>
      </div>

      {/* Details Grid */}
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border border-rose-100 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-900">Event Details</h2>
          <div className="mt-4 space-y-4">
            <div className="flex items-start gap-3">
              <Calendar className="mt-0.5 h-5 w-5 text-rose-500" />
              <div>
                <p className="text-sm font-medium text-gray-900">Date & Time</p>
                <p className="text-sm text-gray-600">{formatDate(event.startAt)}</p>
                <p className="text-sm text-gray-600">{formatTime(event.startAt)} – {formatTime(event.endAt)}</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <MapPin className="mt-0.5 h-5 w-5 text-rose-500" />
              <div>
                <p className="text-sm font-medium text-gray-900">Venue</p>
                <p className="text-sm text-gray-600">{event.venue}</p>
                <p className="text-xs text-gray-500">Timezone: {event.timezone}</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Users className="mt-0.5 h-5 w-5 text-rose-500" />
              <div>
                <p className="text-sm font-medium text-gray-900">Capacity</p>
                <p className="text-sm text-gray-600">{event.registeredCount}/{event.capacity} registered</p>
                <p className={`text-sm ${isFull ? 'text-red-500 font-medium' : 'text-green-600'}`}>
                  {isFull ? 'Event is full' : `${spotsLeft} spots remaining`}
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Clock className="mt-0.5 h-5 w-5 text-rose-500" />
              <div>
                <p className="text-sm font-medium text-gray-900">Registration Deadline</p>
                <p className="text-sm text-gray-600">{formatDate(event.registrationDeadline)}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Registration */}
        <div className="rounded-2xl border border-rose-100 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-900">Register</h2>
          {!user ? (
            <div className="mt-4 space-y-4">
              <div className="flex items-center gap-2 rounded-lg bg-blue-50 p-3 text-sm text-blue-700">
                <AlertCircle className="h-4 w-4" />
                Please log in to register for this event.
              </div>
              <Link
                to="/login"
                className="block rounded-lg bg-rose-500 py-3 text-center font-semibold text-white"
              >
                Log In
              </Link>
            </div>
          ) : isFull ? (
            <div className="mt-4 rounded-lg bg-red-50 p-4 text-sm text-red-700">
              This event is currently full. You may be added to the waitlist if you register.
            </div>
          ) : registrationOpen ? (
            <div className="mt-4 space-y-4">
              <p className="text-sm text-gray-600">
                Ready to join? Register now and complete the questionnaire to be matched with compatible participants.
              </p>
              <button
                onClick={() => {
                  setRegistering(true);
                  registerMutation.mutate();
                }}
                disabled={registering}
                className="w-full rounded-lg bg-rose-500 py-3 font-semibold text-white hover:bg-rose-600 disabled:opacity-50"
              >
                {registering ? 'Registering...' : 'Register Now'}
              </button>
            </div>
          ) : (
            <div className="mt-4 rounded-lg bg-yellow-50 p-4 text-sm text-yellow-700">
              Registration is currently closed for this event.
            </div>
          )}

          {event.instructions && (
            <div className="mt-6">
              <h3 className="text-sm font-semibold text-gray-900">Instructions</h3>
              <p className="mt-2 text-sm text-gray-600">{event.instructions}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
