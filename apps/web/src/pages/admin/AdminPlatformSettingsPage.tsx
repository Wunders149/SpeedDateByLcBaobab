import { Settings } from 'lucide-react';

export function AdminPlatformSettingsPage() {
  return (
    <section className="mx-auto max-w-2xl rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-rose-50">
        <Settings className="h-6 w-6 text-rose-600" />
      </div>
      <h1 className="mt-5 text-2xl font-bold text-slate-900">Platform settings</h1>
      <p className="mt-2 text-slate-600">
        Platform-wide settings are not connected to persistent storage yet. No sample settings are shown here.
      </p>
    </section>
  );
}
