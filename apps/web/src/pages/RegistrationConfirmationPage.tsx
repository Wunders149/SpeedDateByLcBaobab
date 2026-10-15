import { Link } from 'react-router-dom';
import { CheckCircle } from 'lucide-react';

export function RegistrationConfirmationPage() {
  return (
    <div className="mx-auto max-w-2xl space-y-8">
      <div className="rounded-2xl border border-green-200 bg-green-50 p-8 text-center">
        <CheckCircle className="mx-auto h-16 w-16 text-green-500" />
        <h1 className="mt-4 text-3xl font-bold text-gray-900">Registration Submitted!</h1>
        <p className="mt-2 text-gray-600">
          Your registration has been received and is pending review by the organizers.
        </p>
      </div>

      <div className="rounded-2xl border border-rose-100 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-gray-900">What's Next?</h2>
        <div className="mt-4 space-y-4">
          <div className="flex items-start gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-rose-100 text-sm font-bold text-rose-600">1</div>
            <div>
              <p className="font-medium text-gray-900">Wait for approval</p>
              <p className="text-sm text-gray-600">Organizers will review your registration and approve or waitlist you.</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-rose-100 text-sm font-bold text-rose-600">2</div>
            <div>
              <p className="font-medium text-gray-900">Complete the questionnaire</p>
              <p className="text-sm text-gray-600">Once approved, complete your personality questionnaire for matching.</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-rose-100 text-sm font-bold text-rose-600">3</div>
            <div>
              <p className="font-medium text-gray-900">Check in at the event</p>
              <p className="text-sm text-gray-600">Use your unique check-in code at the venue entrance.</p>
            </div>
          </div>
        </div>
      </div>

      <div className="flex gap-4">
        <Link to="/dashboard" className="flex-1 rounded-lg bg-rose-500 py-3 text-center font-semibold text-white hover:bg-rose-600">
          Go to Dashboard
        </Link>
        <Link to="/questionnaire" className="flex-1 rounded-lg border border-gray-200 py-3 text-center font-semibold text-gray-600 hover:bg-gray-50">
          Complete Questionnaire
        </Link>
      </div>
    </div>
  );
}
