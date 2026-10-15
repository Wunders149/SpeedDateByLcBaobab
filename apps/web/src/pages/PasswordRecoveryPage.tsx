import { useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../lib/api';
import { Mail, ArrowLeft, CheckCircle } from 'lucide-react';

export function PasswordRecoveryPage() {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await api('/api/v1/auth/forgot-password', {
        method: 'POST',
        body: JSON.stringify({ email }),
      });
      setSent(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send reset link');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-md">
      <div className="rounded-2xl border border-rose-100 bg-white p-8 shadow-sm">
        <div className="mb-6 text-center">
          <Mail className="mx-auto h-10 w-10 text-rose-500" />
          <h1 className="mt-4 text-2xl font-bold text-gray-900">Forgot Password?</h1>
          <p className="mt-2 text-sm text-gray-600">
            Enter your email and we'll send you a link to reset your password.
          </p>
        </div>

        {error && (
          <div className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-600">{error}</div>
        )}

        {sent ? (
          <div className="rounded-lg bg-green-50 p-4 text-center">
            <CheckCircle className="mx-auto h-10 w-10 text-green-500" />
            <p className="mt-3 text-sm text-green-700">
              If an account exists with that email, a password reset link has been sent.
            </p>
            <Link to="/login" className="mt-4 inline-block text-sm font-medium text-rose-600 hover:text-rose-700">
              Back to Login
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email</label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="mt-1 block w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-rose-500 focus:outline-none focus:ring-1 focus:ring-rose-500"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-lg bg-rose-500 py-3 font-semibold text-white hover:bg-rose-600 disabled:opacity-50"
            >
              {loading ? 'Sending...' : 'Send Reset Link'}
            </button>
            <Link to="/login" className="block text-center text-sm text-gray-500 hover:text-rose-600">
              <ArrowLeft className="mr-1 inline h-4 w-4" />
              Back to Login
            </Link>
          </form>
        )}
      </div>
    </div>
  );
}
