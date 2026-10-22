import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '../../lib/api';
import { UserPlus, Shield } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

interface AdminUser { _id: string; email: string; roles: string[]; accountStatus: string; createdAt: string }
interface CreateResponse { data: { admin: { id: string; email: string }; tempPassword: string } }
export function AdminAdminsPage() {
  const { user } = useAuth();
  const [showInvite, setShowInvite] = useState(false);
  const [inviteForm, setInviteForm] = useState({ firstName: '', lastName: '', email: '', role: 'event_admin' });
  const [createdCredential, setCreatedCredential] = useState<{ email: string; password: string } | null>(null);
  const queryClient = useQueryClient();
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['admin-admins'], queryFn: () => api<{ data: { admins: AdminUser[] } }>('/api/v1/admin/admins'),
  });
  const admins = data?.data.admins ?? [];
  const createMutation = useMutation({
    mutationFn: () => api<CreateResponse>('/api/v1/admin/admins', { method: 'POST', body: JSON.stringify(inviteForm) }),
    onSuccess: (result) => {
      setCreatedCredential({ email: result.data.admin.email, password: result.data.tempPassword });
      setInviteForm({ firstName: '', lastName: '', email: '', role: 'event_admin' });
      queryClient.invalidateQueries({ queryKey: ['admin-admins'] });
    },
  });
  const statusMutation = useMutation({
    mutationFn: ({ id, accountStatus }: { id: string; accountStatus: string }) => api(`/api/v1/admin/admins/${id}`, { method: 'PATCH', body: JSON.stringify({ accountStatus }) }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin-admins'] }),
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between"><div><h1 className="text-3xl font-bold text-gray-900">Administrator Management</h1><p className="mt-1 text-sm text-gray-500">Manage host and moderator access.</p></div><button onClick={() => setShowInvite((value) => !value)} className="flex items-center gap-2 rounded-lg bg-rose-500 px-4 py-2 font-semibold text-white"><UserPlus className="h-4 w-4" />Invite Administrator</button></div>
      {createdCredential && <div className="rounded-xl border border-green-200 bg-green-50 p-4 text-sm text-green-900"><p className="font-semibold">Administrator account created. Share this temporary password securely; it is only shown once.</p><p className="mt-1">{createdCredential.email}: <code className="select-all rounded bg-white px-2 py-1">{createdCredential.password}</code></p><button onClick={() => setCreatedCredential(null)} className="mt-2 text-xs underline">Dismiss</button></div>}
      {showInvite && <form onSubmit={(e) => { e.preventDefault(); createMutation.mutate(); }} className="space-y-4 rounded-2xl border border-rose-100 bg-white p-6 shadow-sm"><h2 className="text-lg font-semibold">Create administrator account</h2><div className="grid gap-4 sm:grid-cols-2"><label className="text-sm font-medium">First name<input required maxLength={100} value={inviteForm.firstName} onChange={(e) => setInviteForm((form) => ({ ...form, firstName: e.target.value }))} className="mt-1 block w-full rounded-lg border px-3 py-2" /></label><label className="text-sm font-medium">Last name<input required maxLength={100} value={inviteForm.lastName} onChange={(e) => setInviteForm((form) => ({ ...form, lastName: e.target.value }))} className="mt-1 block w-full rounded-lg border px-3 py-2" /></label><label className="text-sm font-medium">Email<input required type="email" value={inviteForm.email} onChange={(e) => setInviteForm((form) => ({ ...form, email: e.target.value }))} className="mt-1 block w-full rounded-lg border px-3 py-2" /></label><label className="text-sm font-medium">Role<select value={inviteForm.role} onChange={(e) => setInviteForm((form) => ({ ...form, role: e.target.value }))} className="mt-1 block w-full rounded-lg border px-3 py-2"><option value="event_admin">Event Administrator</option><option value="moderator">Moderator</option></select></label></div>{createMutation.isError && <p role="alert" className="text-sm text-red-600">{(createMutation.error as Error).message}</p>}<button disabled={createMutation.isPending} className="rounded-lg bg-rose-500 px-4 py-2 font-semibold text-white disabled:opacity-50">{createMutation.isPending ? 'Creating�' : 'Create account'}</button></form>}
      {isError && <p role="alert" className="text-sm text-red-600">{(error as Error).message}</p>}{statusMutation.isError && <p role="alert" className="text-sm text-red-600">{(statusMutation.error as Error).message}</p>}
      {isLoading ? <p className="py-8 text-center text-gray-500">Loading administrator accounts�</p> : <div className="overflow-x-auto rounded-xl border border-rose-100 bg-white shadow-sm"><table className="w-full text-sm"><thead className="bg-gray-50 text-gray-500"><tr><th className="px-4 py-3 text-left">Email</th><th className="px-4 py-3 text-left">Role</th><th className="px-4 py-3 text-left">Status</th><th className="px-4 py-3 text-left">Created</th><th className="px-4 py-3 text-right">Actions</th></tr></thead><tbody>{admins.map((admin) => <tr key={admin._id} className="border-t border-gray-100"><td className="px-4 py-3 font-medium">{admin.email}</td><td className="px-4 py-3"><span className="inline-flex items-center gap-1"><Shield className="h-4 w-4 text-rose-500" />{admin.roles.join(', ')}</span></td><td className="px-4 py-3 capitalize">{admin.accountStatus}</td><td className="px-4 py-3">{new Date(admin.createdAt).toLocaleDateString()}</td><td className="px-4 py-3 text-right">{admin._id !== user?.id && <button disabled={statusMutation.isPending} onClick={() => statusMutation.mutate({ id: admin._id, accountStatus: admin.accountStatus === 'active' ? 'suspended' : 'active' })} className="rounded border px-3 py-1 text-xs">{admin.accountStatus === 'active' ? 'Suspend' : 'Reactivate'}</button>}</td></tr>)}</tbody></table>{!admins.length && <p className="p-8 text-center text-gray-500">No administrator accounts.</p>}</div>}
    </div>
  );
}
