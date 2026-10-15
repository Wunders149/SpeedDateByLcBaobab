import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '../lib/api';
import { useAuth } from '../contexts/AuthContext';
import { QrCode, MapPin, Clock, CheckCircle, AlertCircle } from 'lucide-react';

export function CheckInPage() {
  const { user } = useAuth();
  const [code, setCode] = useState('');
  const [checkedIn, setCheckedIn] = useState(false);

  const { data } = useQuery({
    queryKey: ['events'],
    queryFn: () => api('/api/v1/events') as unknown as { data: { events: Array<{ id: string; name: string; venue: string; startAt: string; status: string }> } },
    enabled: !!user,
  });

  const events = data?.data.events ?? [];
  const upcomingEvent = events.find((e) => e.status === 'registration_open' || e.status === 'in_progress');

  if (!user) {
    return <div className="rounded-xl bg-yellow-50 p-4 text-yellow-700">Please sign in to check in.</div>;
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div className="text-center">
        <QrCode className="mx-auto h-16 w-16 text-rose-500" />
        <h1 className="mt-4 text-3xl font-bold text-gray-900">Event Check-In</h1>
        <p className="mt-2 text-gray-600">Scan your QR code or enter your participant code at the venue.</p>
      </div>

      {upcomingEvent && (
        <div className="rounded-2xl border border-rose-100 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-900">{upcomingEvent.name}</h2>
          <div className="mt-3 space-y-2 text-sm text-gray-600">
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-rose-400" />
              {upcomingEvent.venue}
            </div>
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-rose-400" />
              {new Date(upcomingEvent.startAt).toLocaleString()}
            </div>
          </div>
        </div>
      )}

      {/* QR Code Display */}
      <div className="rounded-2xl border border-rose-100 bg-white p-8 shadow-sm text-center">
        <div className="mx-auto h-48 w-48 rounded-xl bg-gray-100 flex items-center justify-center">
          <QrCode className="h-32 w-32 text-gray-400" />
        </div>
        <p className="mt-4 text-sm text-gray-500">
          Display this QR code to the organizer for check-in
        </p>
        <p className="mt-1 text-xs text-gray-400">
          Participant Code: SD-{user.id.slice(0, 8).toUpperCase()}
        </p>
      </div>

      {/* Manual Check-in */}
      {checkedIn ? (
        <div className="rounded-2xl bg-green-50 p-6 text-center">
          <CheckCircle className="mx-auto h-10 w-10 text-green-500" />
          <p className="mt-2 font-semibold text-green-700">Successfully checked in!</p>
          <p className="text-sm text-green-600">Welcome to the event.</p>
        </div>
      ) : (
        <div className="rounded-2xl border border-gray-200 bg-white p-6">
          <h3 className="text-sm font-semibold text-gray-900">Manual Check-In</h3>
          <p className="mt-1 text-xs text-gray-500">Enter your participant code if scanning is unavailable.</p>
          <div className="mt-3 flex gap-2">
            <input
              type="text"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="SD-XXXXXXXX"
              className="flex-1 rounded-lg border border-gray-300 px-4 py-2 focus:border-rose-500 focus:outline-none"
            />
            <button
              onClick={() => { if (code) setCheckedIn(true); }}
              className="rounded-lg bg-rose-500 px-6 py-2 font-semibold text-white hover:bg-rose-600"
            >
              Check In
            </button>
          </div>
        </div>
      )}

      <div className="rounded-lg bg-blue-50 p-4 text-sm text-blue-700">
        <AlertCircle className="mr-1 inline h-4 w-4" />
        Arrive 15 minutes early. Bring your check-in code or QR code to the venue.
      </div>
    </div>
  );
}
