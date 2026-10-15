import { useState } from 'react';
import { Save, Mail, Globe, Palette, Settings } from 'lucide-react';

export function AdminPlatformSettingsPage() {
  const [settings, setSettings] = useState({
    siteName: 'SpeedDate',
    siteDescription: 'Modern speed dating events',
    contactEmail: 'support@speeddate.dev',
    defaultTimezone: 'America/New_York',
    maxParticipantsPerEvent: 100,
    questionnaireCompletionThreshold: 0.8,
    enableEmailNotifications: false,
    enableSmsNotifications: false,
    allowProfilePhotos: true,
    allowFreeTextQuestions: false,
  });

  const handle = (field: string, value: string | number | boolean) =>
    setSettings((s) => ({ ...s, [field]: value }));

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-900">Platform Settings</h1>

      {/* General */}
      <div className="rounded-2xl border border-rose-100 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
          <Globe className="h-5 w-5 text-rose-500" />
          General
        </h2>
        <div className="mt-4 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Site Name</label>
            <input value={settings.siteName} onChange={(e) => handle('siteName', e.target.value)} className="mt-1 block w-full rounded-lg border border-gray-300 px-4 py-2" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Description</label>
            <textarea value={settings.siteDescription} onChange={(e) => handle('siteDescription', e.target.value)} rows={2} className="mt-1 block w-full rounded-lg border border-gray-300 px-4 py-2" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Default Timezone</label>
            <select value={settings.defaultTimezone} onChange={(e) => handle('defaultTimezone', e.target.value)} className="mt-1 block w-full rounded-lg border border-gray-300 px-4 py-2">
              <option value="America/New_York">America/New_York</option>
              <option value="America/Chicago">America/Chicago</option>
              <option value="America/Los_Angeles">America/Los_Angeles</option>
              <option value="Europe/London">Europe/London</option>
              <option value="UTC">UTC</option>
            </select>
          </div>
        </div>
      </div>

      {/* Notifications */}
      <div className="rounded-2xl border border-rose-100 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
          <Mail className="h-5 w-5 text-rose-500" />
          Notifications
        </h2>
        <div className="mt-4 space-y-3">
          <label className="flex items-center justify-between rounded-lg border p-3">
            <div>
              <p className="font-medium text-gray-900">Email Notifications</p>
              <p className="text-sm text-gray-600">Send email notifications to participants</p>
            </div>
            <input type="checkbox" checked={settings.enableEmailNotifications} onChange={(e) => handle('enableEmailNotifications', e.target.checked)} className="h-4 w-4 rounded text-rose-500" />
          </label>
          <label className="flex items-center justify-between rounded-lg border p-3">
            <div>
              <p className="font-medium text-gray-900">SMS Notifications</p>
              <p className="text-sm text-gray-600">Send SMS notifications (requires provider configuration)</p>
            </div>
            <input type="checkbox" checked={settings.enableSmsNotifications} onChange={(e) => handle('enableSmsNotifications', e.target.checked)} className="h-4 w-4 rounded text-rose-500" />
          </label>
        </div>
      </div>

      {/* Limits */}
      <div className="rounded-2xl border border-rose-100 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
          <Settings className="h-5 w-5 text-rose-500" />
          Limits & Defaults
        </h2>
        <div className="mt-4 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Max Participants per Event</label>
            <input type="number" value={settings.maxParticipantsPerEvent} onChange={(e) => handle('maxParticipantsPerEvent', Number(e.target.value))} className="mt-1 block w-48 rounded-lg border border-gray-300 px-4 py-2" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Questionnaire Completion Threshold</label>
            <input type="number" step="0.05" value={settings.questionnaireCompletionThreshold} onChange={(e) => handle('questionnaireCompletionThreshold', Number(e.target.value))} className="mt-1 block w-48 rounded-lg border border-gray-300 px-4 py-2" />
          </div>
          <label className="flex items-center justify-between rounded-lg border p-3">
            <div>
              <p className="font-medium text-gray-900">Allow Profile Photos</p>
              <p className="text-sm text-gray-600">Allow participants to upload profile photos</p>
            </div>
            <input type="checkbox" checked={settings.allowProfilePhotos} onChange={(e) => handle('allowProfilePhotos', e.target.checked)} className="h-4 w-4 rounded text-rose-500" />
          </label>
          <label className="flex items-center justify-between rounded-lg border p-3">
            <div>
              <p className="font-medium text-gray-900">Allow Free Text Questions</p>
              <p className="text-sm text-gray-600">Allow organizers to create short text questions</p>
            </div>
            <input type="checkbox" checked={settings.allowFreeTextQuestions} onChange={(e) => handle('allowFreeTextQuestions', e.target.checked)} className="h-4 w-4 rounded text-rose-500" />
          </label>
        </div>
      </div>

      {/* Branding */}
      <div className="rounded-2xl border border-rose-100 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
          <Palette className="h-5 w-5 text-rose-500" />
          Branding
        </h2>
        <div className="mt-4 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Accent Color</label>
            <input type="color" defaultValue="#e11d48" className="mt-1 h-10 w-20 rounded border border-gray-300" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Logo URL</label>
            <input type="url" placeholder="https://..." className="mt-1 block w-full rounded-lg border border-gray-300 px-4 py-2" />
          </div>
        </div>
      </div>

      <div className="flex justify-end">
        <button className="flex items-center gap-2 rounded-lg bg-rose-500 px-6 py-3 font-semibold text-white hover:bg-rose-600">
          <Save className="h-4 w-4" />
          Save Settings
        </button>
      </div>
    </div>
  );
}
