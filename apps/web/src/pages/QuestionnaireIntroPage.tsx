import { Link } from 'react-router-dom';
import { ClipboardList, Clock, CheckCircle, Star } from 'lucide-react';

export function QuestionnaireIntroPage() {
  return (
    <div className="mx-auto max-w-3xl space-y-8">
      <div className="text-center">
        <ClipboardList className="mx-auto h-16 w-16 text-rose-500" />
        <h1 className="mt-4 text-3xl font-bold text-gray-900">About the Questionnaire</h1>
        <p className="mt-2 text-lg text-gray-600">
          Your answers help us find compatible matches for you.
        </p>
      </div>

      <div className="rounded-2xl border border-rose-100 bg-white p-8 shadow-sm space-y-6">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">What to Expect</h2>
          <div className="mt-3 space-y-4">
            {[
              { icon: Star, title: '60 Questions', description: 'Across 7 categories: Values, Communication, Personality, Lifestyle, Future Aspirations, Interests, and Fun & Spontaneity.' },
              { icon: Clock, title: '15-20 Minutes', description: 'Take your time answering honestly. There are no right or wrong answers.' },
              { icon: CheckCircle, title: 'Save Progress', description: 'Your answers are saved automatically. You can pick up where you left off.' },
            ].map(({ icon: Icon, title, description }) => (
              <div key={title} className="flex items-start gap-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-rose-100">
                  <Icon className="h-5 w-5 text-rose-600" />
                </div>
                <div>
                  <p className="font-medium text-gray-900">{title}</p>
                  <p className="text-sm text-gray-600">{description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-lg bg-amber-50 p-4">
          <p className="text-sm text-amber-700">
            <strong>Privacy:</strong> Your individual answers are never shared with other participants.
            Only compatibility scores are computed server-side.
          </p>
        </div>

        <div className="rounded-lg bg-blue-50 p-4">
          <p className="text-sm text-blue-700">
            <strong>Completion threshold:</strong> You must answer at least 80% of required questions to submit.
          </p>
        </div>
      </div>

      <div className="flex gap-4">
        <Link to="/questionnaire" className="flex-1 rounded-lg bg-rose-500 py-3 text-center font-semibold text-white hover:bg-rose-600">
          Start Questionnaire
        </Link>
        <Link to="/dashboard" className="flex-1 rounded-lg border border-gray-200 py-3 text-center font-semibold text-gray-600 hover:bg-gray-50">
          Later
        </Link>
      </div>
    </div>
  );
}
