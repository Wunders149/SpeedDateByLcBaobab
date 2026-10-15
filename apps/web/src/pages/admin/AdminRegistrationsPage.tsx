import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { api } from '../../lib/api';
import { CheckCircle, XCircle, Clock, AlertCircle } from 'lucide-react';

interface Registration {
  _id: string;
  participantId: string;
  eventId: string;
  registrationStatus: string;
  approvalStatus: string;
  questionnaireStatus: string;
  checkInStatus: string;
  registeredAt: string;
}

export function AdminRegistrationsPage() {
  const [statusFilter, setStatusFilter] = useState('pending_review');

  // Mock data for demonstration
  const mockRegistrations: Registration[] = [
    { _id: '1', participantId: 'p1', eventId: 'evt-1', registrationStatus: 'pending_review', approvalStatus: 'pending', questionnaireStatus: 'not_started', checkInStatus: 'not_checked_in', registeredAt: new Date().toISOString() },
    { _id: '2', participantId: 'p2', eventId: 'evt-1', registrationStatus: 'approved', approvalStatus: 'approved', questionnaireStatus: 'submitted', checkInStatus: 'not_checked_in', registeredAt: new Date().toISOString() },
    { _id: '3', participantId: 'p3', eventId: 'evt-1', registrationStatus: 'waitlisted', approvalStatus: 'waitlisted', questionnaireStatus: 'not_started', checkInStatus: 'not_checked_in', registeredAt: new Date().toISOString() },
  ];

  const filtered = statusFilter === 'all'
    ? mockRegistrations
    : mockRegistrations.filter((r) => r.registrationStatus === statusFilter);

  const statusIcon = (status: string) => {
    switch (status) {
      case 'approved': return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'rejected': return <XCircle className="h-4 w-4 text-red-500" />;
      case 'pending_review': return <Clock className="h-4 w-4 text-amber-500" />;
      case 'waitlisted': return <AlertCircle className="h-4 w-4 text-orange-500" />;
      default: return <AlertCircle className="h-4 w-4 text-gray-500" />;
    }
  };

  const updateMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) =>
      api(`/api/v1/admin/registrations/${id}`, {
        method: 'PATCH',
        body: JSON.stringify({ status, reason: `${status} by admin` }),
      }),
  });

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-900">Registration Review</h1>

      {/* Filter Tabs */}
      <div className="flex gap-2 flex-wrap">
        {['all', 'pending_review', 'approved', 'rejected', 'waitlisted'].map((status) => (
          <button
            key={status}
            onClick={() => setStatusFilter(status)}
            className={`rounded-full px-4 py-2 text-sm font-medium transition ${
              statusFilter === status ? 'bg-rose-500 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {status.replace(/_/g, ' ')}
          </button>
        ))}
      </div>

      {/* Registrations Table */}
      <div className="overflow-hidden rounded-xl border border-rose-100 bg-white shadow-sm">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-gray-500">
            <tr>
              <th className="px-4 py-3 text-left font-medium">Participant</th>
              <th className="px-4 py-3 text-left font-medium">Status</th>
              <th className="px-4 py-3 text-left font-medium">Questionnaire</th>
              <th className="px-4 py-3 text-left font-medium">Registered</th>
              <th className="px-4 py-3 text-right font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((reg) => (
              <tr key={reg._id} className="border-t border-gray-100">
                <td className="px-4 py-3 font-medium text-gray-900">
                  {reg.participantId}
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    {statusIcon(reg.registrationStatus)}
                    <span className="capitalize">{reg.registrationStatus.replace(/_/g, ' ')}</span>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <span className={`rounded-full px-2 py-1 text-xs font-medium ${
                    reg.questionnaireStatus === 'submitted' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'
                  }`}>
                    {reg.questionnaireStatus}
                  </span>
                </td>
                <td className="px-4 py-3 text-gray-500">
                  {new Date(reg.registeredAt).toLocaleDateString()}
                </td>
                <td className="px-4 py-3 text-right">
                  <div className="flex justify-end gap-2">
                    {reg.registrationStatus === 'pending_review' && (
                      <>
                        <button
                          onClick={() => updateMutation.mutate({ id: reg._id, status: 'approved' })}
                          className="rounded-lg bg-green-500 px-3 py-1 text-xs font-semibold text-white hover:bg-green-600"
                        >
                          Approve
                        </button>
                        <button
                          onClick={() => updateMutation.mutate({ id: reg._id, status: 'rejected' })}
                          className="rounded-lg bg-red-500 px-3 py-1 text-xs font-semibold text-white hover:bg-red-600"
                        >
                          Reject
                        </button>
                      </>
                    )}
                    {reg.registrationStatus === 'approved' && (
                      <button
                        onClick={() => updateMutation.mutate({ id: reg._id, status: 'waitlisted' })}
                        className="rounded-lg bg-orange-500 px-3 py-1 text-xs font-semibold text-white hover:bg-orange-600"
                      >
                        Waitlist
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filtered.length === 0 && (
          <div className="py-8 text-center text-gray-500">No registrations found.</div>
        )}
      </div>
    </div>
  );
}
