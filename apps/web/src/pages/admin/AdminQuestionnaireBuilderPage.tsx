import { useEffect, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '../../lib/api';
import { DEFAULT_CATEGORY_WEIGHTS } from '@speed-date/shared';
import { Check, FileText, Layers } from 'lucide-react';
import { localizedQuestionText, useLanguage } from '../../contexts/LanguageContext';

interface HostEvent { _id: string; name: string }
interface Question { _id: string; text: string; textFr?: string; category: string; active: boolean }
interface QuestionnaireVersion { _id: string; version: number; publishedAt?: string; questionSnapshots: Array<{ text: string; textFr?: string; category: string }> }
const categories = Object.keys(DEFAULT_CATEGORY_WEIGHTS) as Array<keyof typeof DEFAULT_CATEGORY_WEIGHTS>;

export function AdminQuestionnaireBuilderPage() {
  const { language } = useLanguage();
  const [eventId, setEventId] = useState('');
  const [selectedQuestionIds, setSelectedQuestionIds] = useState<string[]>([]);
  const [weights, setWeights] = useState<Record<string, number>>(() => Object.fromEntries(Object.entries(DEFAULT_CATEGORY_WEIGHTS)));
  const [completionThreshold, setCompletionThreshold] = useState(80);
  const [initialized, setInitialized] = useState(false);
  const queryClient = useQueryClient();
  const { data: eventData } = useQuery({ queryKey: ['admin-events'], queryFn: () => api<{ data: { events: HostEvent[] } }>('/api/v1/admin/events') });
  const events = eventData?.data.events ?? [];
  const selectedEventId = eventId || events[0]?._id || '';
  const { data: questionData } = useQuery({ queryKey: ['admin-questions'], queryFn: () => api<{ data: { questions: Question[] } }>('/api/v1/admin/questions') });
  const questions = (questionData?.data.questions ?? []).filter((question) => question.active);
  useEffect(() => {
    if (!initialized && questionData) {
      setSelectedQuestionIds(questions.map((question) => question._id));
      setInitialized(true);
    }
  }, [initialized, questionData, questions]);
  const { data: versionData, isLoading, isError, error } = useQuery({
    queryKey: ['questionnaire-versions', selectedEventId], enabled: !!selectedEventId,
    queryFn: () => api<{ data: { versions: QuestionnaireVersion[]; currentQuestionnaireId: string | null } }>(`/api/v1/admin/events/${selectedEventId}/questionnaires`),
  });
  const versions = versionData?.data.versions ?? [];
  const createMutation = useMutation({
    mutationFn: () => api<{ data: { questionnaire: QuestionnaireVersion } }>(`/api/v1/admin/events/${selectedEventId}/questionnaires`, {
      method: 'POST', body: JSON.stringify({ questionIds: selectedQuestionIds, categoryWeights: weights, completionThreshold: completionThreshold / 100 }),
    }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['questionnaire-versions', selectedEventId] }),
  });
  const publishMutation = useMutation({
    mutationFn: (versionId: string) => api(`/api/v1/admin/events/${selectedEventId}/questionnaires/${versionId}/publish`, { method: 'POST' }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['questionnaire-versions', selectedEventId] }),
  });
  const toggleQuestion = (id: string) => setSelectedQuestionIds((current) => current.includes(id) ? current.filter((item) => item !== id) : [...current, id]);
  const setCategoryWeight = (category: string, percent: number) => setWeights((current) => ({ ...current, [category]: percent / 100 }));
  const totalWeight = Object.values(weights).reduce((sum, value) => sum + value * 100, 0);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4"><div><h1 className="text-3xl font-bold text-gray-900">Questionnaire Builder</h1><p className="mt-1 text-sm text-gray-500">Choose questions and scoring weights, then publish a version for participants.</p></div><label className="text-sm font-medium text-gray-700">Event<select value={selectedEventId} onChange={(e) => setEventId(e.target.value)} className="mt-1 block min-w-64 rounded-lg border border-gray-300 px-4 py-2">{events.map((event) => <option key={event._id} value={event._id}>{event.name}</option>)}</select></label></div>
      {createMutation.isError && <p role="alert" className="text-sm text-red-600">{(createMutation.error as Error).message}</p>}{publishMutation.isError && <p role="alert" className="text-sm text-red-600">{(publishMutation.error as Error).message}</p>}{isError && <p role="alert" className="text-sm text-red-600">{(error as Error).message}</p>}
      <section className="rounded-2xl border border-rose-100 bg-white p-6 shadow-sm"><div className="mb-4 flex items-center justify-between"><h2 className="flex items-center gap-2 text-lg font-semibold"><Layers className="h-5 w-5 text-rose-500" />{language === 'fr' ? 'Sélection des questions' : 'Question selection'}</h2><span className="text-sm text-gray-500">{selectedQuestionIds.length} {language === 'fr' ? 'sélectionnées' : 'selected'}</span></div><div className="max-h-96 space-y-2 overflow-y-auto">{questions.map((question) => <label key={question._id} className="flex cursor-pointer items-start gap-3 rounded-lg border border-gray-100 p-3 hover:bg-gray-50"><input type="checkbox" checked={selectedQuestionIds.includes(question._id)} onChange={() => toggleQuestion(question._id)} className="mt-1 accent-rose-500" /><span className="flex-1 text-sm text-gray-800">{localizedQuestionText(question.text, question.textFr, language)}<span className="ml-2 rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-500">{question.category.replace(/_/g, ' ')}</span></span></label>)}{!questions.length && <p className="py-5 text-center text-gray-500">{language === 'fr' ? 'Ajoutez des questions actives à la banque avant de créer un questionnaire.' : 'Add active questions to the question bank before building a questionnaire.'}</p>}</div></section>
      <section className="rounded-2xl border border-rose-100 bg-white p-6 shadow-sm"><h2 className="mb-4 text-lg font-semibold">Scoring weights</h2><div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">{categories.map((category) => <label key={category} className="text-sm capitalize text-gray-700">{category.replace(/_/g, ' ')} (%)<input type="number" min={0} max={100} value={Math.round((weights[category] ?? 0) * 100)} onChange={(e) => setCategoryWeight(category, Number(e.target.value))} className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2" /></label>)}</div><p className={`mt-3 text-sm ${Math.abs(totalWeight - 100) < 0.1 ? 'text-green-700' : 'text-amber-700'}`}>Total: {totalWeight.toFixed(1)}% (must equal 100%)</p><label className="mt-4 block max-w-xs text-sm text-gray-700">Required completion threshold (%)<input type="number" min={1} max={100} value={completionThreshold} onChange={(e) => setCompletionThreshold(Number(e.target.value))} className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2" /></label><button onClick={() => createMutation.mutate()} disabled={!selectedEventId || selectedQuestionIds.length === 0 || Math.abs(totalWeight - 100) >= 0.1 || createMutation.isPending} className="mt-5 rounded-lg bg-rose-500 px-5 py-2 font-semibold text-white disabled:opacity-50"><FileText className="mr-2 inline h-4 w-4" />{createMutation.isPending ? 'Saving…' : 'Save new version'}</button></section>
      <section className="space-y-3"><h2 className="text-lg font-semibold text-gray-900">Saved versions</h2>{isLoading && <p className="text-sm text-gray-500">Loading versions…</p>}{versions.map((version) => <div key={version._id} className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-rose-100 bg-white p-4"><div><p className="font-medium">Version {version.version} · {version.questionSnapshots.length} questions</p><p className="text-sm text-gray-500">{version.publishedAt ? `Published ${new Date(version.publishedAt).toLocaleString()}` : 'Draft'}</p></div>{version.publishedAt ? <span className="rounded-full bg-green-100 px-3 py-1 text-xs text-green-700"><Check className="mr-1 inline h-3 w-3" />Published</span> : <button onClick={() => publishMutation.mutate(version._id)} disabled={publishMutation.isPending} className="rounded-lg border border-gray-200 px-4 py-2 text-sm">Publish version</button>}</div>)}{!isLoading && selectedEventId && versions.length === 0 && <p className="rounded-xl border border-dashed border-gray-300 p-6 text-center text-gray-500">No questionnaire versions for this event.</p>}</section>
      {!events.length && <p className="text-center text-gray-500">Create an event before building its questionnaire.</p>}
    </div>
  );
}
