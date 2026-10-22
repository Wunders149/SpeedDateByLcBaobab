import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { api } from '../lib/api';
import { useAuth } from '../contexts/AuthContext';
import { ChevronLeft, ChevronRight, Check } from 'lucide-react';
import { localizedQuestionText, useLanguage } from '../contexts/LanguageContext';

interface Question {
  questionId: string;
  text: string;
  textFr?: string;
  type: string;
  options: Array<{ id: string; text: string; textFr?: string; value?: number }>;
  required: boolean;
}

interface QuestionnaireData {
  questionnaire: {
    id: string;
    version: number;
    questions: Question[];
    completionThreshold: number;
  };
  response: {
    answers: Array<{ questionId: string; value: number | string | string[] }>;
    completionStatus: string;
  } | null;
}

interface Registration {
  eventId: string;
  registrationStatus: string;
}

export function QuestionnairePage() {
  const { user } = useAuth();
  const { language, t } = useLanguage();
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number | string>>({});
  const [eventId, setEventId] = useState<string | null>(null);

  const { data: registrationsData } = useQuery({
    queryKey: ['my-registrations'],
    queryFn: () => api<{ data: { registrations: Registration[] } }>('/api/v1/my-registrations'),
    enabled: !!user,
  });

  const { data: eventsData } = useQuery({
    queryKey: ['events'],
    queryFn: () =>
      api('/api/v1/events') as unknown as { data: { events: Array<{ id: string; name: string }> } },
    enabled: !!user,
  });

  const registeredEventIds = new Set(
    (registrationsData?.data.registrations ?? [])
      .filter((registration) => registration.registrationStatus !== 'withdrawn')
      .map((registration) => registration.eventId),
  );
  const events = (eventsData?.data.events ?? []).filter((event) => registeredEventIds.has(event.id));
  const selectedEvent = eventId ?? events[0]?.id;

  const { data: questionnaireData, isLoading } = useQuery({
    queryKey: ['questionnaire', selectedEvent],
    queryFn: () =>
      api<{ data: QuestionnaireData }>(`/api/v1/events/${selectedEvent}/questionnaire`),
    enabled: !!selectedEvent,
  });

  const saveDraftMutation = useMutation({
    mutationFn: (answers: Array<{ questionId: string; value: number | string }>) =>
      api(`/api/v1/events/${selectedEvent}/questionnaire/draft`, {
        method: 'PUT',
        body: JSON.stringify({ answers }),
      }),
  });

  const submitMutation = useMutation({
    mutationFn: (answers: Array<{ questionId: string; value: number | string }>) =>
      api(`/api/v1/events/${selectedEvent}/questionnaire/submit`, {
        method: 'POST',
        body: JSON.stringify({ answers }),
      }),
    onSuccess: () => {
      alert(t('Questionnaire submitted successfully!'));
    },
  });

  if (!user) {
    return (
      <div className="rounded-xl bg-yellow-50 p-4 text-yellow-700">
        {t('Please sign in to access the questionnaire.')}
      </div>
    );
  }

  if (events.length === 0) {
    return (
      <div className="rounded-xl bg-yellow-50 p-4 text-yellow-700">
        {t('No events available. Please register for an event first.')}
      </div>
    );
  }

  const questionnaire = questionnaireData?.data.questionnaire;
  const questions = questionnaire?.questions ?? [];
  const question = questions[currentQuestion];

  const handleAnswer = (value: number | string) => {
    setAnswers((prev) => ({ ...prev, [question.questionId]: value }));
  };

  const handleNext = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion((prev) => prev + 1);
    }
  };

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion((prev) => prev - 1);
    }
  };

  const handleSaveDraft = () => {
    const answerList = Object.entries(answers).map(([questionId, value]) => ({
      questionId,
      value,
    }));
    saveDraftMutation.mutate(answerList);
  };

  const handleSubmit = () => {
    const answerList = Object.entries(answers).map(([questionId, value]) => ({
      questionId,
      value,
    }));
    submitMutation.mutate(answerList);
  };

  const progress = questions.length > 0 ? ((currentQuestion + 1) / questions.length) * 100 : 0;

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">{t('Questionnaire')}</h1>
        <p className="mt-2 text-gray-600">{t('Help us find your perfect match')}</p>
      </div>

      {/* Event Selector */}
      {events.length > 1 && (
        <div className="flex gap-2">
          {events.map((event) => (
            <button
              key={event.id}
              onClick={() => setEventId(event.id)}
              className={`rounded-lg px-4 py-2 text-sm font-medium ${
                selectedEvent === event.id
                  ? 'bg-rose-500 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {event.name}
            </button>
          ))}
        </div>
      )}

      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-rose-200 border-t-rose-600" />
        </div>
      ) : questions.length === 0 ? (
        <div className="rounded-xl bg-yellow-50 p-4 text-yellow-700">
          {t('No questionnaire available for this event yet.')}
        </div>
      ) : (
        <>
          {/* Progress Bar */}
          <div className="rounded-xl border border-rose-100 bg-white p-4">
            <div className="flex items-center justify-between text-sm text-gray-600">
              <span>
                {t('Question')} {currentQuestion + 1} {t('of')} {questions.length}
              </span>
              <span>{Math.round(progress)}%</span>
            </div>
            <div className="mt-2 h-2 rounded-full bg-gray-200">
              <div
                className="h-2 rounded-full bg-rose-500 transition-all"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>

          {/* Question Card */}
          <div className="rounded-2xl border border-rose-100 bg-white p-6 shadow-sm">
            <h2 className="text-xl font-semibold text-gray-900">{localizedQuestionText(question.text, question.textFr, language)}</h2>
            <div className="mt-6 space-y-3">
              {question.options.map((option) => (
                <button
                  key={option.id}
                  onClick={() => handleAnswer(option.value ?? option.id)}
                  className={`w-full rounded-lg border p-4 text-left transition ${
                    answers[question.questionId] === (option.value ?? option.id)
                      ? 'border-rose-500 bg-rose-50 text-rose-700'
                      : 'border-gray-200 hover:border-rose-300 hover:bg-rose-50/50'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span>{localizedQuestionText(option.text, option.textFr, language)}</span>
                    {answers[question.questionId] === (option.value ?? option.id) && (
                      <Check className="h-5 w-5 text-rose-500" />
                    )}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Navigation */}
          <div className="flex items-center justify-between">
            <button
              onClick={handlePrevious}
              disabled={currentQuestion === 0}
              className="flex items-center gap-2 rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50 disabled:opacity-50"
            >
              <ChevronLeft className="h-4 w-4" />
              {t('Previous')}
            </button>
            <button
              onClick={handleSaveDraft}
              className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50"
            >
              {t('Save Draft')}
            </button>
            {currentQuestion < questions.length - 1 ? (
              <button
                onClick={handleNext}
                className="flex items-center gap-2 rounded-lg bg-rose-500 px-4 py-2 text-sm font-semibold text-white hover:bg-rose-600"
              >
                {t('Next')}
                <ChevronRight className="h-4 w-4" />
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                className="flex items-center gap-2 rounded-lg bg-green-500 px-4 py-2 text-sm font-semibold text-white hover:bg-green-600"
              >
                <Check className="h-4 w-4" />
                {t('Submit')}
              </button>
            )}
          </div>
        </>
      )}
    </div>
  );
}
