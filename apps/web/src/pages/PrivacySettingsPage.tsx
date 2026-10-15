import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Shield, Check } from 'lucide-react';

const consentItems = [
  { id: 'partipation', label: 'Event Participation', description: 'Allow organizers to register me for events and process my registration', required: true },
  { id: 'matching', label: 'Compatibility Matching', description: 'Allow the system to compute compatibility scores with other participants', required: true },
  { id: 'contact_exchange', label: 'Contact Exchange', description: 'Allow matched participants to request contact information exchange', required: false },
  { id: 'analytics', label: 'Usage Analytics', description: 'Allow collection of anonymized usage data for platform improvement', required: false },
  { id: 'marketing', label: 'Marketing Communications', description: 'Receive updates about events and promotional content', required: false },
];

export function PrivacySettingsPage() {
  const { user } = useAuth();
  const [consents, setConsents] = useState<Record<string, boolean>>(
    consentItems.reduce((acc, item) => ({ ...acc, [item.id]: item.required }), {})
  );

  if (!user) {
    return <div className="rounded-xl bg-yellow-50 p-4 text-yellow-700">Please sign in.</div>;
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Privacy & Consent Settings</h1>
        <p className="mt-1 text-gray-600">Manage your data and consent preferences.</p>
      </div>

      <div className="rounded-2xl border border-rose-100 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
          <Shield className="h-5 w-5 text-rose-500" />
          Consent Management
        </h2>
        <p className="mt-2 text-sm text-gray-600">
          Review and manage how your data is used on the SpeedDate platform.
        </p>
        <div className="mt-4 space-y-3">
          {consentItems.map((item) => (
            <div key={item.id} className="rounded-lg border border-gray-200 p-4">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <p className="font-medium text-gray-900">{item.label}</p>
                    {item.required && (
                      <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-500">Required</span>
                    )}
                  </div>
                  <p className="text-sm text-gray-600">{item.description}</p>
                </div>
                {item.required ? (
                  <div className="flex h-6 w-6 items-center justify-center rounded-full bg-green-100">
                    <Check className="h-4 w-4 text-green-600" />
                  </div>
                ) : (
                  <button
                    onClick={() => setConsents((prev) => ({ ...prev, [item.id]: !prev[item.id] }))}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${consents[item.id] ? 'bg-rose-500' : 'bg-gray-200'}`}
                  >
                    <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${consents[item.id] ? 'translate-x-6' : 'translate-x-1'}`} />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
        <button className="mt-4 rounded-lg bg-rose-500 px-6 py-2 font-semibold text-white hover:bg-rose-600">
          Save Preferences
        </button>
      </div>

      <div className="rounded-2xl border border-rose-100 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
          <Shield className="h-5 w-5 text-rose-500" />
          Data Rights
        </h2>
        <div className="mt-4 space-y-3">
          <div className="flex items-center justify-between rounded-lg border p-3">
            <div>
              <p className="font-medium text-gray-900">Download My Data</p>
              <p className="text-sm text-gray-600">Get a copy of all your data in a portable format.</p>
            </div>
            <button className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50">
              Request
            </button>
          </div>
          <div className="flex items-center justify-between rounded-lg border p-3">
            <div>
              <p className="font-medium text-gray-900">Withdraw Consent</p>
              <p className="text-sm text-gray-600">Withdraw consent for matching. This will remove you from future match results.</p>
            </div>
            <button className="rounded-lg border border-red-200 px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50">
              Withdraw
            </button>
          </div>
          <div className="flex items-center justify-between rounded-lg border border-red-200 p-3 bg-red-50">
            <div>
              <p className="font-medium text-red-900">Delete Account</p>
              <p className="text-sm text-red-700">Permanently delete your account and all associated data.</p>
            </div>
            <button className="rounded-lg bg-red-500 px-4 py-2 text-sm font-medium text-white hover:bg-red-600">
              Delete
            </button>
          </div>
        </div>
      </div>

      <div className="rounded-lg bg-gray-50 p-4 text-xs text-gray-500">
        <p>
          Your data is processed in accordance with our privacy policy.
          For questions about data protection, contact <a href="mailto:privacy@speeddate.com" className="text-rose-600 underline">privacy@speeddate.com</a>.
        </p>
      </div>
    </div>
  );
}
