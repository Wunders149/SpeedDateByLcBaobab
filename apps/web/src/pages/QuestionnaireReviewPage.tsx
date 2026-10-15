import { useQuery } from '@tanstack/react-query';
import { api } from '../lib/api';
import { useAuth } from '../contexts/AuthContext';
import { CheckCircle, AlertCircle, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useState } from 'react';

interface QuestionnaireData {
  questionnaire: {
    questions: Array<{ questionId: string; text: string; type: string }>;
  };
  response: {
    answers: Array<{ questionId: string; value: number | string }>;
    completionStatus: string;
  } | null;
}

export function QuestionnaireReviewPage() {
  const { user } = useAuth();
  const [submitted, setSubmitted] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ['questionnaire-review'],
    queryFn: async () => {
      const eventsResponse = await api('/api/v1/events') as unknown as { data: { events: Array<{ id: string }> } };
      const eventId = eventsResponse.data.events[0]?.id;
      if (!eventId) return null;
      return api(`/api/v1/events/${eventId}/questionnaire`) as unknown as { data: QuestionnaireData };
    },
    enabled: !!user,
  });

  if (!user) {
    return <div className="rounded-xl bg-yellow-50 p-4 text-yellow-700">Please sign in.</div>;
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-rose-200 border-t-rose-600" />
      </div>
    );
  }

  const questionnaire = data?.data.questionnaire;
  const response = data?.data.response;
  const questions = questionnaire?.questions ?? [];
  const answers = response?.answers ?? [];
  const answeredCount = answers.length;
  const totalQuestions = questions.length;
  const percentage = totalQuestions > 0 ? Math.round((answeredCount / totalQuestions) * 100) : 0;

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div className="flex items-center gap-3">
        <Link to="/questionnaire" className="text-gray-500 hover:text-rose-600">
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <h1 className="text-3xl font-bold text-gray-900">Review Your Answers</h1>
      </div>

      {/* Progress Summary */}
      <div className="rounded-xl border border-rose-100 bg-white p-6 shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-600">Completion</p>
            <p className="text-2xl font-bold text-gray-900">{percentage}%</p>
          </div>
          {percentage >= 80 ? (
            <div className="flex items-center gap-2 text-green-600">
              <CheckCircle className="h-5 w-5" />
              <span className="text-sm font-medium">Ready to submit</span>
            </div>
          ) : (
            <div className="flex items-center gap-2 text-yellow-600">
              <AlertCircle className="h-5 w-5" />
              <span className="text-sm font-medium">More questions needed</span>
            </div>
          )}
        </div>
        <div className="mt-3 h-2 rounded-full bg-gray-200">
          <div
            className="h-2 rounded-full bg-rose-500 transition-all"
            style={{ width: `${percentage}%` }}
          />
        </div>
        <p className="mt-2 text-xs text-gray-500">
          {answeredCount} of {totalQuestions} questions answered
        </p>
      </div>

      {/* Answer Review */}
      <div className="space-y-3">
        {questions.slice(0, 10).map((q, index) => {
          const answer = answers.find((a) => a.questionId === q.questionId);
          return (
            <div key={q.questionId} className="rounded-xl border border-gray-100 bg-white p-4">
              <p className="text-sm font-medium text-gray-900">
                {index + 1}. {q.text}
              </p>
              <p className="mt-1 text-sm">
                {answer ? (
                  <span className="font-medium text-rose-600">Your answer: {answer.value}</span>
                ) : (
                  <span className="text-gray-400">Not answered</span>
                )}
              </p>
            </div>
          );
        })}
        {questions.length > 10 && (
          <p className="text-center text-sm text-gray-500">
            ... and {questions.length - 10} more questions
          </p>
        )}
      </div>

      {/* Actions */}
      <div className="flex gap-4">
        <Link to="/questionnaire" className="flex-1 rounded-lg border border-gray-200 py-3 text-center font-semibold text-gray-600 hover:bg-gray-50">
          <ArrowLeft className="mr-2 inline h-4 w-4" />
          Back to Edit
        </Link>
        <button
          onClick={() => { setSubmitted(true); alert('Questionnaire submitted!'); }}
          disabled={percentage < 80 || submitted}
          className="flex-1 rounded-lg bg-green-500 py-3 font-semibold text-white hover:bg-green-600 disabled:opacity-50"
        >
          {submitted ? 'Submitted!' : 'Submit Questionnaire'}
        </button>
      </div>
    </div>
  );
}
