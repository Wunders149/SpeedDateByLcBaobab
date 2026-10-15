import { useState } from 'react';
import { Eye, Send, Check, Shield, FileText } from 'lucide-react';

interface Publication {
  id: string;
  event: string;
  status: 'draft' | 'published' | 'unpublished';
  matchesCount: number;
  publishedAt?: string;
}

const mockPublications: Publication[] = [
  { id: '1', event: 'Spring Mixer', status: 'published', matchesCount: 12, publishedAt: new Date().toISOString() },
  { id: '2', event: 'Workshop Match', status: 'draft', matchesCount: 8 },
];

export function AdminResultsPublicationPage() {
  const [publications, setPublications] = useState(mockPublications);

  const publish = (id: string) => {
    setPublications((prev) => prev.map((p) => p.id === id ? { ...p, status: 'published', publishedAt: new Date().toISOString() } : p));
  };
  const unpublish = (id: string) => {
    setPublications((prev) => prev.map((p) => p.id === id ? { ...p, status: 'draft' } : p));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">Results Publication</h1>
        <button className="rounded-lg bg-rose-500 px-4 py-2 text-sm font-semibold text-white hover:bg-rose-600 flex items-center gap-2">
          <Send className="h-4 w-4" /> Publish New
        </button>
      </div>

      <div className="space-y-3">
        {publications.map((pub) => (
          <div key={pub.id} className="rounded-xl border border-rose-100 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <FileText className="h-5 w-5 text-rose-500" />
                <div>
                  <p className="font-semibold text-gray-900">{pub.event}</p>
                  <p className="text-sm text-gray-600">{pub.matchesCount} matches</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className={`rounded-full px-3 py-1 text-xs font-medium ${pub.status === 'published' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                  {pub.status === 'published' ? (
                    <><Eye className="h-3 w-3 inline mr-1" /> Published</>
                  ) : (
                    <><Shield className="h-3 w-3 inline mr-1" /> Draft</>
                  )}
                </span>
                {pub.status === 'draft' ? (
                  <button onClick={() => publish(pub.id)} className="rounded-lg bg-rose-500 px-4 py-2 text-sm font-semibold text-white hover:bg-rose-600">
                    <Send className="h-3 w-3 inline mr-1" /> Publish
                  </button>
                ) : (
                  <button onClick={() => unpublish(pub.id)} className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50">
                    Unpublish
                  </button>
                )}
              </div>
            </div>
            {pub.publishedAt && (
              <p className="mt-2 text-xs text-gray-500">
                Published {new Date(pub.publishedAt).toLocaleString()} · Consent-gated visibility
              </p>
            )}
            <p className="mt-1 text-xs text-gray-500">
              <Check className="h-3 w-3 inline text-green-500 mr-1" />
              Requires prior participant consent. Mutual-match enforcement active.
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
