import { useAuth } from '../contexts/AuthContext';
import { Shield } from 'lucide-react';

const consentLabels: Record<string, string> = {
  event_participation: 'Event participation',
  matching: 'Compatibility matching',
  contact_exchange: 'Contact exchange',
  analytics: 'Usage analytics',
  marketing: 'Marketing communications',
};

export function PrivacySettingsPage() {
  const { user, profile } = useAuth();

  if (!user) {
    return <div className="rounded-xl bg-yellow-50 p-4 text-yellow-700">Please sign in.</div>;
  }

  const records = profile?.consentRecords ?? [];

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Privacy & Consent</h1>
        <p className="mt-1 text-gray-600">Recorded consent choices for your account.</p>
      </div>
      <section className="rounded-2xl border border-rose-100 bg-white p-6 shadow-sm">
        <h2 className="flex items-center gap-2 text-lg font-semibold text-gray-900">
          <Shield className="h-5 w-5 text-rose-500" /> Consent history
        </h2>
        {records.length ? (
          <ul className="mt-4 divide-y divide-gray-100">
            {records.map((record, index) => (
              <li key={`${record.purpose}-${index}`} className="flex flex-wrap items-center justify-between gap-3 py-3">
                <span className="font-medium text-gray-800">{consentLabels[record.purpose] ?? record.purpose.replace(/_/g, ' ')}</span>
                <span className={`rounded-full px-3 py-1 text-xs font-medium ${record.revokedAt ? 'bg-gray-100 text-gray-600' : 'bg-green-100 text-green-700'}`}>
                  {record.revokedAt ? 'Withdrawn' : 'Granted'} · {new Date(record.revokedAt ?? record.consentedAt).toLocaleDateString()}
                </span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-4 rounded-xl border border-dashed border-gray-200 p-6 text-center text-sm text-gray-500">
            No consent records are available for this account.
          </p>
        )}
      </section>
      <p className="text-xs text-gray-500">
        To request a data export or deletion, contact <a href="mailto:privacy@speeddate.com" className="text-rose-600 underline">privacy@speeddate.com</a>.
      </p>
    </div>
  );
}
