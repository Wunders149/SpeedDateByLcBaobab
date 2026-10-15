import { User, Mail, Phone, MapPin, Calendar, FileText, Heart } from 'lucide-react';

interface ParticipantDetail {
  name: string;
  email: string;
  phone: string;
  age: number;
  location: string;
  joinedAt: string;
  status: string;
  questionnaireStatus: string;
  events: { name: string; status: string }[];
}

const mock: ParticipantDetail = {
  name: 'Emma Johnson',
  email: 'emma@example.com',
  phone: '+1 (555) 123-4567',
  age: 28,
  location: 'New York, NY',
  joinedAt: new Date().toISOString(),
  status: 'active',
  questionnaireStatus: 'submitted',
  events: [
    { name: 'Autumn Mixer', status: 'approved' },
    { name: 'Spring Speed Dating', status: 'completed' },
  ],
};

export function AdminParticipantDetailPage() {
  const p = mock;

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div className="flex items-center gap-4">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-rose-100">
          <User className="h-8 w-8 text-rose-500" />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">{p.name}</h1>
          <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-medium text-green-700">{p.status}</span>
        </div>
      </div>

      <div className="rounded-2xl border border-rose-100 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-gray-900">Contact</h2>
        <div className="mt-4 space-y-3 text-sm text-gray-600">
          <div className="flex items-center gap-2">
            <Mail className="h-4 w-4 text-rose-400" /> {p.email}
          </div>
          <div className="flex items-center gap-2">
            <Phone className="h-4 w-4 text-rose-400" /> {p.phone}
          </div>
          <div className="flex items-center gap-2">
            <MapPin className="h-4 w-4 text-rose-400" /> {p.location}
          </div>
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-rose-400" /> Age {p.age}
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-rose-100 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-gray-900">Questionnaire</h2>
        <p className="mt-2 text-sm text-gray-600">
          Status: <span className="font-medium text-rose-600 capitalize">{p.questionnaireStatus}</span>
        </p>
        <button className="mt-3 rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50 flex items-center gap-2">
          <FileText className="h-4 w-4" /> View Responses
        </button>
      </div>

      <div className="rounded-2xl border border-rose-100 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-gray-900">Events</h2>
        <div className="mt-4 space-y-2">
          {p.events.map((ev) => (
            <div key={ev.name} className="flex items-center justify-between rounded-lg border border-gray-100 p-3">
              <div className="flex items-center gap-2">
                <Heart className="h-4 w-4 text-rose-400" />
                <span className="font-medium text-gray-900">{ev.name}</span>
              </div>
              <span className="rounded-full bg-gray-100 px-2 py-1 text-xs font-medium text-gray-600 capitalize">
                {ev.status}
              </span>
            </div>
          ))}
        </div>
      </div>

      <div className="flex gap-3">
        <button className="rounded-lg bg-rose-500 px-4 py-2 text-sm font-semibold text-white hover:bg-rose-600">
          Suspend Account
        </button>
        <button className="rounded-lg border border-red-200 px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50">
          Deactivate
        </button>
      </div>
    </div>
  );
}
