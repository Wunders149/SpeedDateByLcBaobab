import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '../../lib/api';
import { ClipboardList } from 'lucide-react';

interface AuditLog {
  _id: string;
  actorId: string;
  action: string;
  targetType: string;
  targetId: string;
  reason?: string;
  timestamp: string;
  eventId?: string;
}

export function AdminAuditLogPage() {
  const [actionFilter, setActionFilter] = useState('all');
  const [page] = useState(1);

  const { data, isLoading } = useQuery({
    queryKey: ['audit-logs', actionFilter, page],
    queryFn: () => api('/api/v1/admin/audit-logs') as unknown as { data: { logs: AuditLog[]; meta: { total: number } } },
  });

  const logs = data?.data.logs ?? [];

  const actionColor = (action: string) => {
    if (action.includes('created') || action.includes('published')) return 'text-green-600 bg-green-50';
    if (action.includes('updated') || action.includes('changed')) return 'text-blue-600 bg-blue-50';
    if (action.includes('deleted') || action.includes('suspended')) return 'text-red-600 bg-red-50';
    return 'text-gray-600 bg-gray-50';
  };

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-900">Audit Log</h1>

      <div className="flex gap-3">
        <select
          value={actionFilter}
          onChange={(e) => setActionFilter(e.target.value)}
          className="rounded-lg border border-gray-300 py-2 px-3 text-sm"
        >
          <option value="all">All Actions</option>
          <option value="user.registered">User Registered</option>
          <option value="matches.generated">Matches Generated</option>
          <option value="matches.published">Results Published</option>
          <option value="check_in.completed">Check-In</option>
        </select>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-rose-200 border-t-rose-600" />
        </div>
      ) : (
        <div className="space-y-3">
          {logs.map((log) => (
            <div key={log._id} className="rounded-xl border border-rose-100 bg-white p-4 shadow-sm">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <ClipboardList className="h-4 w-4 text-gray-400" />
                  <span className={`rounded-full px-2 py-1 text-xs font-medium ${actionColor(log.action)}`}>
                    {log.action}
                  </span>
                  <span className="text-sm text-gray-600">
                    {log.targetType}: {log.targetId.slice(0, 12)}...
                  </span>
                </div>
                <span className="text-xs text-gray-500">
                  {new Date(log.timestamp).toLocaleString()}
                </span>
              </div>
              {log.reason && (
                <p className="mt-2 pl-7 text-sm text-gray-500">Reason: {log.reason}</p>
              )}
            </div>
          ))}
          {logs.length === 0 && (
            <div className="rounded-xl border border-dashed border-gray-300 p-12 text-center text-gray-500">
              No audit log entries yet.
            </div>
          )}
        </div>
      )}
    </div>
  );
}
