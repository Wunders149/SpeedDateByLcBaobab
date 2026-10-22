import { useSearchParams } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '../../lib/api';
import { User, Mail, Phone, Calendar, Heart } from 'lucide-react';

interface ParticipantRecord { _id: string; email: string; phone?: string; accountStatus: string; createdAt: string }
interface ParticipantProfile { displayName: string; dateOfBirth: string; publicProfile: { bio?: string; interests: string[]; languages: string[] } }
interface RegistrationRecord { _id: string; registrationStatus: string; questionnaireStatus: string; eventId: { name: string; startAt: string } }

export function AdminParticipantDetailPage() {
  const [params] = useSearchParams();
  const participantId = params.get('id') ?? '';
  const queryClient = useQueryClient();
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['admin-participant', participantId], enabled: !!participantId,
    queryFn: () => api<{ data: { participant: ParticipantRecord; profile: ParticipantProfile | null; registrations: RegistrationRecord[] } }>(`/api/v1/admin/participants/${participantId}`),
  });
  const mutation = useMutation({
    mutationFn: (accountStatus: string) => api(`/api/v1/admin/participants/${participantId}/status`, { method: 'PATCH', body: JSON.stringify({ accountStatus }) }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin-participant', participantId] }),
  });
  if (isLoading) return <p className="py-16 text-center text-gray-500">Loading participant…</p>;
  if (isError) return <p role="alert" className="text-sm text-red-600">{(error as Error).message}</p>;
  const participant = data?.data.participant;
  const profile = data?.data.profile;
  if (!participant) return <p className="text-center text-gray-500">Participant not found.</p>;
  const age = profile?.dateOfBirth ? Math.floor((Date.now() - new Date(profile.dateOfBirth).getTime()) / 31_557_600_000) : null;

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div className="flex items-center gap-4"><div className="flex h-16 w-16 items-center justify-center rounded-full bg-rose-100"><User className="h-8 w-8 text-rose-500" /></div><div><h1 className="text-3xl font-bold text-gray-900">{profile?.displayName ?? participant.email}</h1><span className="rounded-full bg-gray-100 px-3 py-1 text-xs capitalize text-gray-700">{participant.accountStatus}</span></div></div>
      {mutation.isError && <p role="alert" className="text-sm text-red-600">{(mutation.error as Error).message}</p>}
      <section className="rounded-2xl border border-rose-100 bg-white p-6 shadow-sm"><h2 className="text-lg font-semibold">Contact</h2><div className="mt-4 space-y-3 text-sm text-gray-600"><p className="flex items-center gap-2"><Mail className="h-4 w-4 text-rose-400" />{participant.email}</p>{participant.phone && <p className="flex items-center gap-2"><Phone className="h-4 w-4 text-rose-400" />{participant.phone}</p>}<p className="flex items-center gap-2"><Calendar className="h-4 w-4 text-rose-400" />{age === null ? 'Age not provided' : `Age ${age}`} · Joined {new Date(participant.createdAt).toLocaleDateString()}</p></div>{profile?.publicProfile.bio && <p className="mt-4 text-sm text-gray-600">{profile.publicProfile.bio}</p>}{profile?.publicProfile.interests?.length ? <p className="mt-3 text-sm text-gray-600">Interests: {profile.publicProfile.interests.join(', ')}</p> : null}{profile?.publicProfile.languages?.length ? <p className="mt-2 text-sm text-gray-600">Languages: {profile.publicProfile.languages.join(', ')}</p> : null}</section>
      <section className="rounded-2xl border border-rose-100 bg-white p-6 shadow-sm"><h2 className="text-lg font-semibold">Event registrations</h2><div className="mt-4 space-y-2">{data?.data.registrations.map((registration) => <div key={registration._id} className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-gray-100 p-3"><div className="flex items-center gap-2"><Heart className="h-4 w-4 text-rose-400" /><span className="font-medium">{registration.eventId?.name ?? 'Event'}</span></div><div className="text-right text-sm"><span className="mr-3 capitalize text-gray-700">{registration.registrationStatus.replace(/_/g, ' ')}</span><span className="text-gray-500">Questionnaire: {registration.questionnaireStatus}</span></div></div>)}{!data?.data.registrations.length && <p className="text-sm text-gray-500">No registrations yet.</p>}</div></section>
      <div className="flex gap-3">{participant.accountStatus === 'active' ? <button disabled={mutation.isPending} onClick={() => mutation.mutate('suspended')} className="rounded-lg bg-rose-500 px-4 py-2 text-sm font-semibold text-white">Suspend account</button> : <button disabled={mutation.isPending} onClick={() => mutation.mutate('active')} className="rounded-lg bg-green-600 px-4 py-2 text-sm font-semibold text-white">Reactivate account</button>}{participant.accountStatus !== 'deactivated' && <button disabled={mutation.isPending} onClick={() => mutation.mutate('deactivated')} className="rounded-lg border border-red-200 px-4 py-2 text-sm font-medium text-red-600">Deactivate</button>}</div>
    </div>
  );
}
