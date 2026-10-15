import { useState } from 'react';
import { Clock, RotateCw, Users, Table2, ArrowRight } from 'lucide-react';

interface Session {
  round: number;
  table: number;
  participantA: string;
  participantB: string;
  duration: number;
  status: 'pending' | 'active' | 'completed';
}

const mockSessions: Session[] = [
  { round: 1, table: 3, participantA: 'Emma J.', participantB: 'Marcus H.', duration: 8, status: 'completed' },
  { round: 2, table: 7, participantA: 'Priya S.', participantB: 'Dylan B.', duration: 8, status: 'active' },
  { round: 3, table: 1, participantA: 'Sofia G.', participantB: 'Carlos M.', duration: 8, status: 'pending' },
];

export function AdminSessionManagementPage() {
  const [roundDuration, setRoundDuration] = useState(8);
  const [sessions] = useState(mockSessions);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">Session & Rotation Management</h1>
        <button className="rounded-lg bg-rose-500 px-4 py-2 text-sm font-semibold text-white hover:bg-rose-600 flex items-center gap-2">
          <RotateCw className="h-4 w-4" /> Generate Rotation
        </button>
      </div>

      {/* Controls */}
      <div className="rounded-2xl border border-rose-100 bg-white p-6 shadow-sm">
        <div className="grid gap-4 sm:grid-cols-3">
          <div>
            <label className="block text-sm font-medium text-gray-700">Round Duration (min)</label>
            <input
              type="number"
              value={roundDuration}
              onChange={(e) => setRoundDuration(Number(e.target.value))}
              className="mt-1 block w-full rounded-lg border border-gray-300 px-4 py-2"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Total Rounds</label>
            <input type="number" defaultValue={5} className="mt-1 block w-full rounded-lg border border-gray-300 px-4 py-2" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Table Count</label>
            <input type="number" defaultValue={12} className="mt-1 block w-full rounded-lg border border-gray-300 px-4 py-2" />
          </div>
        </div>
      </div>

      {/* Sessions */}
      <div className="space-y-3">
        {sessions.map((s) => (
          <div key={`${s.round}-${s.table}`} className="rounded-xl border border-rose-100 bg-white p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-rose-500 text-white font-bold">
                  {s.round}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-gray-900">{s.participantA}</span>
                    <ArrowRight className="h-4 w-4 text-gray-400" />
                    <span className="font-medium text-gray-900">{s.participantB}</span>
                  </div>
                  <div className="flex items-center gap-3 mt-1 text-xs text-gray-500">
                    <span className="flex items-center gap-1"><Table2 className="h-4 w-4" /> Table {s.table}</span>
                    <span className="flex items-center gap-1"><Clock className="h-4 w-4" /> {s.duration} min</span>
                    <span className="flex items-center gap-1"><Users className="h-4 w-4" /> Round {s.round}</span>
                  </div>
                </div>
              </div>
              <span className={`rounded-full px-2 py-1 text-xs font-medium ${s.status === 'completed' ? 'bg-green-100 text-green-700' : s.status === 'active' ? 'bg-purple-100 text-purple-700' : 'bg-gray-100 text-gray-600'}`}>
                {s.status}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
