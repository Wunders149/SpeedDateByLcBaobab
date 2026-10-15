import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Shield, Bell, Trash2, Eye, EyeOff } from 'lucide-react';

export function AccountSettingsPage() {
  const { user, logout } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState(user?.email ?? '');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');

  if (!user) {
    return <div className="rounded-xl bg-yellow-50 p-4 text-yellow-700">Please sign in.</div>;
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <h1 className="text-3xl font-bold text-gray-900">Account Settings</h1>

      {/* Profile Info */}
      <div className="rounded-2xl border border-rose-100 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-gray-900">Profile Information</h2>
        <div className="mt-4 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Display Name</label>
            <input type="text" defaultValue="Your Name" className="mt-1 block w-full rounded-lg border border-gray-300 px-4 py-2" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 block w-full rounded-lg border border-gray-300 px-4 py-2"
            />
          </div>
          <button className="rounded-lg bg-rose-500 px-6 py-2 font-semibold text-white hover:bg-rose-600">
            Save Changes
          </button>
        </div>
      </div>

      {/* Security */}
      <div className="rounded-2xl border border-rose-100 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
          <Shield className="h-5 w-5 text-rose-500" />
          Security
        </h2>
        <div className="mt-4 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Current Password</label>
            <input
              type={showPassword ? 'text' : 'password'}
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              className="mt-1 block w-full rounded-lg border border-gray-300 px-4 py-2"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">New Password</label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="mt-1 block w-full rounded-lg border border-gray-300 px-4 py-2 pr-10"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>
          <button className="rounded-lg bg-gray-800 px-6 py-2 font-semibold text-white hover:bg-gray-700">
            Change Password
          </button>
        </div>
      </div>

      {/* Notifications */}
      <div className="rounded-2xl border border-rose-100 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
          <Bell className="h-5 w-5 text-rose-500" />
          Notification Preferences
        </h2>
        <div className="mt-4 space-y-3">
          {[
            { label: 'Match results', description: 'Notify me when match results are published' },
            { label: 'New matches', description: 'Notify me about mutual matches' },
            { label: 'Event reminders', description: 'Reminder before events I am registered for' },
            { label: 'Questionnaire deadlines', description: 'Remind me about upcoming questionnaire deadlines' },
          ].map(({ label }) => (
            <label key={label} className="flex items-center justify-between rounded-lg border p-3">
              <span className="text-sm font-medium text-gray-900">{label}</span>
              <input type="checkbox" defaultChecked className="h-4 w-4 rounded text-rose-500" />
            </label>
          ))}
        </div>
      </div>

      {/* Danger Zone */}
      <div className="rounded-2xl border border-red-200 bg-red-50 p-6">
        <h2 className="text-lg font-semibold text-red-900 flex items-center gap-2">
          <Trash2 className="h-5 w-5 text-red-500" />
          Danger Zone
        </h2>
        <p className="mt-2 text-sm text-red-700">
          Deleting your account will permanently remove all your data, including profile, questionnaire responses, and match history.
        </p>
        <div className="mt-4 flex gap-3">
          <button className="rounded-lg border border-red-300 px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-100">
            Delete Account
          </button>
          <button
            onClick={() => logout()}
            className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50"
          >
            Log Out
          </button>
        </div>
      </div>
    </div>
  );
}
