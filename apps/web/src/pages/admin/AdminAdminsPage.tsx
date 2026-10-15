import { useState } from 'react';
import { Mail, UserPlus, Shield, Trash2 } from 'lucide-react';

interface Admin {
  _id: string;
  email: string;
  roles: string[];
  accountStatus: string;
  createdAt: string;
}

const mockAdmins: Admin[] = [
  { _id: '1', email: 'admin@speeddate.dev', roles: ['event_admin'], accountStatus: 'active', createdAt: new Date().toISOString() },
  { _id: '2', email: 'superadmin@speeddate.dev', roles: ['super_admin'], accountStatus: 'active', createdAt: new Date().toISOString() },
];

export function AdminAdminsPage() {
  const [showInvite, setShowInvite] = useState(false);
  const [inviteForm, setInviteForm] = useState({ email: '', role: 'event_admin' });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">Administrator Management</h1>
        <button
          onClick={() => setShowInvite(!showInvite)}
          className="flex items-center gap-2 rounded-lg bg-rose-500 px-4 py-2 font-semibold text-white hover:bg-rose-600"
        >
          <UserPlus className="h-4 w-4" />
          Invite Administrator
        </button>
      </div>

      {showInvite && (
        <div className="rounded-2xl border border-rose-100 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-900">Invite New Administrator</h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-gray-700">Email</label>
              <input
                type="email"
                value={inviteForm.email}
                onChange={(e) => setInviteForm((f) => ({ ...f, email: e.target.value }))}
                className="mt-1 block w-full rounded-lg border border-gray-300 px-4 py-2"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Role</label>
              <select
                value={inviteForm.role}
                onChange={(e) => setInviteForm((f) => ({ ...f, role: e.target.value }))}
                className="mt-1 block w-full rounded-lg border border-gray-300 px-4 py-2"
              >
                <option value="event_admin">Event Administrator</option>
                <option value="moderator">Moderator</option>
              </select>
            </div>
          </div>
          <div className="mt-4 flex gap-2">
            <button className="rounded-lg bg-rose-500 px-4 py-2 font-semibold text-white hover:bg-rose-600">
              Send Invitation
            </button>
            <button
              onClick={() => setShowInvite(false)}
              className="rounded-lg border border-gray-200 px-4 py-2 font-medium text-gray-600 hover:bg-gray-50"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      <div className="overflow-hidden rounded-xl border border-rose-100 bg-white shadow-sm">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-gray-500">
            <tr>
              <th className="px-4 py-3 text-left font-medium">Email</th>
              <th className="px-4 py-3 text-left font-medium">Role</th>
              <th className="px-4 py-3 text-left font-medium">Status</th>
              <th className="px-4 py-3 text-left font-medium">Created</th>
              <th className="px-4 py-3 text-right font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {mockAdmins.map((admin) => (
              <tr key={admin._id} className="border-t border-gray-100">
                <td className="px-4 py-3 font-medium text-gray-900">{admin.email}</td>
                <td className="px-4 py-3">
                  <span className="flex items-center gap-1">
                    <Shield className="h-4 w-4 text-rose-500" />
                    {admin.roles.join(', ')}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <span className={`rounded-full px-2 py-1 text-xs font-medium ${admin.accountStatus === 'active' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                    {admin.accountStatus}
                  </span>
                </td>
                <td className="px-4 py-3 text-gray-500">{new Date(admin.createdAt).toLocaleDateString()}</td>
                <td className="px-4 py-3 text-right">
                  <div className="flex justify-end gap-2">
                    <button className="rounded-lg border border-gray-200 p-1 text-gray-600 hover:bg-gray-50">
                      <Mail className="h-4 w-4" />
                    </button>
                    <button className="rounded-lg border border-gray-200 p-1 text-gray-600 hover:bg-red-50 hover:text-red-500">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
