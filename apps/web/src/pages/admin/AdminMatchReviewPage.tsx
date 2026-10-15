import { useState } from 'react';
import { Heart, CheckCircle, XCircle, ArrowRight, TrendingUp } from 'lucide-react';

interface Match {
  id: string;
  participantA: string;
  participantB: string;
  score: number;
  status: 'provisional' | 'finalized' | 'rejected';
  dealBreakers: number;
}

const mockMatches: Match[] = [
  { id: '1', participantA: 'Emma J.', participantB: 'Marcus H.', score: 87.5, status: 'provisional', dealBreakers: 0 },
  { id: '2', participantA: 'Priya S.', participantB: 'Dylan B.', score: 72.3, status: 'provisional', dealBreakers: 0 },
  { id: '3', participantA: 'Sofia G.', participantB: 'Carlos M.', score: 91.0, status: 'finalized', dealBreakers: 0 },
  { id: '4', participantA: 'Lily K.', participantB: 'Noah W.', score: 64.8, status: 'provisional', dealBreakers: 1 },
];

export function AdminMatchReviewPage() {
  const [matches, setMatches] = useState(mockMatches);
  const [filter, setFilter] = useState<'all' | 'provisional' | 'finalized'>('all');

  const finalize = (id: string) => {
    setMatches((prev) => prev.map((m) => m.id === id ? { ...m, status: 'finalized' } : m));
  };
  const reject = (id: string) => {
    setMatches((prev) => prev.map((m) => m.id === id ? { ...m, status: 'rejected' } : m));
  };

  const filtered = filter === 'all' ? matches : matches.filter((m) => m.status === filter);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">Match Review & Finalization</h1>
        <div className="flex gap-2">
          <button className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50">
            Approve All Provisional
          </button>
          <button className="rounded-lg bg-rose-500 px-4 py-2 text-sm font-semibold text-white hover:bg-rose-600">
            Finalize All
          </button>
        </div>
      </div>

      <div className="flex gap-2">
        {(['all', 'provisional', 'finalized'] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`rounded-full px-4 py-2 text-sm font-medium ${filter === f ? 'bg-rose-500 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
          >
            {f}
          </button>
        ))}
      </div>

      <div className="space-y-3">
        {filtered.map((m) => (
          <div key={m.id} className="rounded-xl border border-rose-100 bg-white p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Heart className={`h-5 w-5 ${m.status === 'finalized' ? 'text-rose-500 fill-rose-500' : 'text-gray-400'}`} />
                <div className="flex items-center gap-2">
                  <span className="font-medium text-gray-900">{m.participantA}</span>
                  <ArrowRight className="h-4 w-4 text-gray-400" />
                  <span className="font-medium text-gray-900">{m.participantB}</span>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="text-right">
                  <div className="flex items-center gap-1">
                    <TrendingUp className="h-4 w-4 text-green-500" />
                    <span className="text-lg font-bold text-gray-900">{m.score}%</span>
                  </div>
                  {m.dealBreakers > 0 && (
                    <span className="text-xs text-red-500">{m.dealBreakers} deal-breaker(s)</span>
                  )}
                </div>
                <span className={`rounded-full px-2 py-1 text-xs font-medium ${
                  m.status === 'finalized' ? 'bg-green-100 text-green-700' :
                  m.status === 'rejected' ? 'bg-red-100 text-red-700' :
                  'bg-yellow-100 text-yellow-700'
                }`}>
                  {m.status}
                </span>
                {m.status === 'provisional' && (
                  <div className="flex gap-2">
                    <button onClick={() => finalize(m.id)} className="rounded-lg bg-green-500 px-3 py-1 text-xs font-semibold text-white hover:bg-green-600">
                      <CheckCircle className="h-3 w-3 inline mr-1" /> Finalize
                    </button>
                    <button onClick={() => reject(m.id)} className="rounded-lg bg-red-500 px-3 py-1 text-xs font-semibold text-white hover:bg-red-600">
                      <XCircle className="h-3 w-3 inline mr-1" /> Reject
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
