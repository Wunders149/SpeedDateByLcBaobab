import { Link } from 'react-router-dom';
import { Calendar, Clock, Users, MapPin } from 'lucide-react';

interface Round {
  round: number;
  partner: string;
  table: number;
  startTime: string;
  status: 'upcoming' | 'current' | 'completed';
}

const mockRounds: Round[] = [
  { round: 1, partner: 'Emma J.', table: 3, startTime: '7:00 PM', status: 'completed' },
  { round: 2, partner: 'Marcus H.', table: 7, startTime: '7:10 PM', status: 'completed' },
  { round: 3, partner: 'Priya S.', table: 1, startTime: '7:20 PM', status: 'current' },
  { round: 4, partner: 'Dylan B.', table: 5, startTime: '7:30 PM', status: 'upcoming' },
  { round: 5, partner: 'Sofia G.', table: 2, startTime: '7:40 PM', status: 'upcoming' },
];

export function SessionTimetablePage() {
  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Session Timetable</h1>
          <p className="mt-1 text-gray-600">Your rotation schedule for the event</p>
        </div>
        <div className="rounded-full bg-green-100 px-3 py-1 text-sm font-medium text-green-700">
          In Progress
        </div>
      </div>

      {/* Event Info */}
      <div className="rounded-2xl border border-rose-100 bg-white p-6 shadow-sm">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Calendar className="h-4 w-4 text-rose-400" />
            Autumn Speed Dating Mixer
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <MapPin className="h-4 w-4 text-rose-400" />
            The Grand Ballroom
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Clock className="h-4 w-4 text-rose-400" />
            7:00 PM – 9:00 PM
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Users className="h-4 w-4 text-rose-400" />
            5 rounds × 10 min each
          </div>
        </div>
      </div>

      {/* Round Schedule */}
      <div className="space-y-3">
        {mockRounds.map((round) => (
          <div
            key={round.round}
            className={`rounded-xl border p-4 ${
              round.status === 'current' ? 'border-rose-400 bg-rose-50 shadow-md' :
              round.status === 'completed' ? 'border-gray-200 bg-gray-50 opacity-60' :
              'border-gray-100 bg-white'
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold ${
                  round.status === 'current' ? 'bg-rose-500 text-white' :
                  round.status === 'completed' ? 'bg-green-500 text-white' :
                  'bg-gray-200 text-gray-600'
                }`}>
                  {round.status === 'completed' ? '✓' : round.round}
                </div>
                <div>
                  <p className="font-medium text-gray-900">Round {round.round}</p>
                  <p className="text-sm text-gray-600">
                    {round.status === 'current' ? `Now: ${round.partner} at Table ${round.table}` :
                     round.status === 'completed' ? `Completed: ${round.partner}` :
                     `Upcoming: ${round.partner}`}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm font-medium text-gray-900">{round.startTime}</p>
                <p className="text-xs text-gray-500">{round.status}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="text-center">
        <Link to="/dashboard" className="text-sm font-medium text-rose-600 hover:text-rose-700">
          Back to Dashboard
        </Link>
      </div>
    </div>
  );
}
