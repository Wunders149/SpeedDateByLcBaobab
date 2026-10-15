import { useState } from 'react';
import { Search, CheckCircle, QrCode, Users } from 'lucide-react';

interface CheckInParticipant {
  id: string;
  name: string;
  code: string;
  status: 'approved' | 'checked_in' | 'not_registered';
}

const mockParticipants: CheckInParticipant[] = [
  { id: '1', name: 'Emma Johnson', code: 'SD-ABC123', status: 'approved' },
  { id: '2', name: 'Marcus Hale', code: 'SD-DEF456', status: 'checked_in' },
  { id: '3', name: 'Sofia Garcia', code: 'SD-GHI789', status: 'approved' },
];

export function AdminCheckInPage() {
  const [search, setSearch] = useState('');
  const [participants, setParticipants] = useState(mockParticipants);

  const filtered = participants.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.code.toLowerCase().includes(search.toLowerCase())
  );

  const checkIn = (id: string) => {
    setParticipants((prev) =>
      prev.map((p) => p.id === id ? { ...p, status: 'checked_in' } : p)
    );
  };

  const checkedInCount = participants.filter((p) => p.status === 'checked_in').length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">Check-In</h1>
        <div className="flex gap-4 text-sm">
          <span className="text-green-600 font-medium">{checkedInCount} checked in</span>
          <span className="text-gray-500">{participants.filter((p) => p.status === 'approved').length} pending</span>
        </div>
      </div>

      {/* Scan QR Code */}
      <div className="rounded-2xl border border-rose-100 bg-white p-8 shadow-sm text-center">
        <QrCode className="mx-auto h-24 w-24 text-gray-300" />
        <p className="mt-4 text-gray-600">Scan participant QR code or search manually</p>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by name or participant code..."
          className="w-full rounded-lg border border-gray-300 py-2 pl-10 focus:border-rose-500 focus:outline-none"
        />
      </div>

      {/* Participants */}
      <div className="space-y-3">
        {filtered.map((p) => (
          <div key={p.id} className="flex items-center justify-between rounded-xl border border-rose-100 bg-white p-4 shadow-sm">
            <div className="flex items-center gap-3">
              <div className={`flex h-10 w-10 items-center justify-center rounded-full ${p.status === 'checked_in' ? 'bg-green-100' : 'bg-gray-100'}`}>
                {p.status === 'checked_in' ? (
                  <CheckCircle className="h-5 w-5 text-green-500" />
                ) : (
                  <Users className="h-5 w-5 text-gray-400" />
                )}
              </div>
              <div>
                <p className="font-medium text-gray-900">{p.name}</p>
                <p className="text-xs text-gray-500">{p.code}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className={`rounded-full px-2 py-1 text-xs font-medium ${p.status === 'checked_in' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                {p.status === 'checked_in' ? 'Checked In' : 'Approved'}
              </span>
              {p.status === 'approved' && (
                <button
                  onClick={() => checkIn(p.id)}
                  className="rounded-lg bg-rose-500 px-3 py-1 text-xs font-semibold text-white hover:bg-rose-600"
                >
                  Check In
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
