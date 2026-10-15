import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '../../lib/api';
import { Plus, GripVertical, Edit, Trash2 } from 'lucide-react';

interface Question {
  _id: string;
  text: string;
  type: string;
  category: string;
  weight: number;
  required: boolean;
  active: boolean;
  displayOrder: number;
}

export function AdminQuestionBankPage() {
  const [categoryFilter, setCategoryFilter] = useState('all');

  const { data, isLoading } = useQuery({
    queryKey: ['admin-questions'],
    queryFn: () => api('/api/v1/admin/questions') as unknown as { data: { questions: Question[] } },
  });

  const questions = data?.data.questions ?? [];
  const filtered = categoryFilter === 'all' ? questions : questions.filter((q) => q.category === categoryFilter);

  const categories = ['values', 'communication', 'personality', 'lifestyle', 'future_aspirations', 'interests', 'fun_spontaneity'];

  const typeLabel: Record<string, string> = {
    single_choice: 'Single Choice',
    multiple_choice: 'Multiple Choice',
    agreement_scale: 'Agreement Scale',
    preference_scale: 'Preference Scale',
    ranking: 'Ranking',
    short_text: 'Short Text',
    deal_breaker: 'Deal Breaker',
    icebreaker: 'Icebreaker',
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">Question Bank</h1>
        <button className="flex items-center gap-2 rounded-lg bg-rose-500 px-4 py-2 font-semibold text-white hover:bg-rose-600">
          <Plus className="h-4 w-4" />
          Add Question
        </button>
      </div>

      {/* Filter */}
      <div className="flex gap-2 flex-wrap">
        <button
          onClick={() => setCategoryFilter('all')}
          className={`rounded-full px-3 py-1.5 text-xs font-medium ${categoryFilter === 'all' ? 'bg-rose-500 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
        >
          All ({questions.length})
        </button>
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setCategoryFilter(cat)}
            className={`rounded-full px-3 py-1.5 text-xs font-medium ${categoryFilter === cat ? 'bg-rose-500 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
          >
            {cat.replace(/_/g, ' ')} ({questions.filter((q) => q.category === cat).length})
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-rose-200 border-t-rose-600" />
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((q) => (
            <div key={q._id} className="rounded-xl border border-rose-100 bg-white p-4 shadow-sm hover:shadow-md transition">
              <div className="flex items-start gap-3">
                <button className="cursor-grab text-gray-300 hover:text-gray-500">
                  <GripVertical className="h-5 w-5" />
                </button>
                <div className="flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="rounded-full bg-rose-100 px-2 py-0.5 text-xs font-medium text-rose-700">
                      {q.category.replace(/_/g, ' ')}
                    </span>
                    <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-600">
                      {typeLabel[q.type] ?? q.type}
                    </span>
                    <span className="text-xs text-gray-400">Weight: {q.weight}</span>
                    {!q.required && (
                      <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-700">Optional</span>
                    )}
                    {!q.active && (
                      <span className="rounded-full bg-red-100 px-2 py-0.5 text-xs font-medium text-red-700">Inactive</span>
                    )}
                  </div>
                  <p className="mt-2 text-sm text-gray-900">{q.text}</p>
                </div>
                <div className="flex gap-2">
                  <button className="rounded-lg border border-gray-200 p-1.5 text-gray-600 hover:bg-gray-50">
                    <Edit className="h-4 w-4" />
                  </button>
                  <button className="rounded-lg border border-gray-200 p-1.5 text-gray-600 hover:bg-red-50 hover:text-red-500">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
          {filtered.length === 0 && (
            <div className="rounded-xl border border-dashed border-gray-300 p-12 text-center text-gray-500">
              No questions found. Create your first question.
            </div>
          )}
        </div>
      )}
    </div>
  );
}
