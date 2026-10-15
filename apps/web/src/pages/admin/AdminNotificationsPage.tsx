import { useState, useEffect } from 'react';

interface Template {
  id: string;
  name: string;
  subject: string;
  channel: string;
}

const mockTemplates: Template[] = [
  { id: '1', name: 'Registration Confirmed', subject: 'Your registration is confirmed', channel: 'email' },
  { id: '2', name: 'Questionnaire Reminder', subject: 'Complete your questionnaire', channel: 'email' },
  { id: '3', name: 'Match Results Published', subject: 'Your match results are ready', channel: 'email' },
  { id: '4', name: 'Event Reminder', subject: 'Event tomorrow', channel: 'sms' },
];

export function AdminNotificationsPage() {
  const [selected, setSelected] = useState<string | null>(null);
  const [search, setSearch] = useState('');

  useEffect(() => {}, []);

  const filtered = mockTemplates.filter((t) =>
    t.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">Notification Management</h1>
        <button className="rounded-lg bg-rose-500 px-4 py-2 text-sm font-semibold text-white hover:bg-rose-600">
          New Template
        </button>
      </div>

      <input
        type="text"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Search templates..."
        className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-rose-500 focus:outline-none"
      />

      <div className="grid gap-3">
        {filtered.map((t) => (
          <div
            key={t.id}
            onClick={() => setSelected(t.id)}
            className={`rounded-xl border p-4 cursor-pointer transition ${selected === t.id ? 'border-rose-400 bg-rose-50' : 'border-gray-100 bg-white hover:bg-gray-50 shadow-sm'}`}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-gray-900">{t.name}</p>
                <p className="text-sm text-gray-600">{t.subject}</p>
              </div>
              <span className={`rounded-full px-2 py-1 text-xs font-medium ${t.channel === 'email' ? 'bg-blue-100 text-blue-700' : 'bg-green-100 text-green-700'}`}>
                {t.channel}
              </span>
            </div>
            <div className="mt-3 flex gap-2">
              <button className="rounded-lg border border-gray-200 px-3 py-1 text-xs font-medium text-gray-600 hover:bg-gray-50">
                Send Test
              </button>
              {selected === t.id && (
                <button className="rounded-lg bg-rose-500 px-3 py-1 text-xs font-semibold text-white hover:bg-rose-600">
                  Send Now
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
