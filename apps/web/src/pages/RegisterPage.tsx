import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Heart } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

export function RegisterPage() {
  const { t } = useLanguage();
  const { register } = useAuth();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    dateOfBirth: '',
    agreedToRules: false,
    agreedToPrivacy: false,
    consentToMatching: false,
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!formData.agreedToRules || !formData.agreedToPrivacy || !formData.consentToMatching) {
      setError(t('Please agree to all terms and conditions'));
      return;
    }

    setLoading(true);

    try {
      await register({
        email: formData.email,
        password: formData.password,
        firstName: formData.firstName,
        lastName: formData.lastName,
        dateOfBirth: new Date(formData.dateOfBirth).toISOString(),
        agreedToRules: formData.agreedToRules,
        agreedToPrivacy: formData.agreedToPrivacy,
        consentToMatching: formData.consentToMatching,
      });
      navigate('/dashboard');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-lg">
      <div className="rounded-2xl border border-rose-100 bg-white p-8 shadow-sm">
        <div className="mb-6 text-center">
          <Heart className="mx-auto h-10 w-10 text-rose-500" />
          <h1 className="mt-4 text-2xl font-bold text-gray-900">{t('Create your account')}</h1>
          <p className="mt-2 text-sm text-gray-600">
            {t('Join SpeedDate and start meeting compatible people')}
          </p>
        </div>

        {error && <div className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-600">{error}</div>}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="firstName" className="block text-sm font-medium text-gray-700">
                {t('First name')}
              </label>
              <input
                id="firstName"
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
                required
                className="mt-1 block w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-rose-500 focus:outline-none focus:ring-1 focus:ring-rose-500"
              />
            </div>
            <div>
              <label htmlFor="lastName" className="block text-sm font-medium text-gray-700">
                {t('Last name')}
              </label>
              <input
                id="lastName"
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
                required
                className="mt-1 block w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-rose-500 focus:outline-none focus:ring-1 focus:ring-rose-500"
              />
            </div>
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
              {t('Email')}
            </label>
            <input
              id="email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              required
              className="mt-1 block w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-rose-500 focus:outline-none focus:ring-1 focus:ring-rose-500"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700">
              {t('Password')}
            </label>
            <input
              id="password"
              name="password"
              type="password"
              value={formData.password}
              onChange={handleChange}
              required
              minLength={8}
              className="mt-1 block w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-rose-500 focus:outline-none focus:ring-1 focus:ring-rose-500"
            />
            <p className="mt-1 text-xs text-gray-500">{t('Must be at least 8 characters')}</p>
          </div>

          <div>
            <label htmlFor="dateOfBirth" className="block text-sm font-medium text-gray-700">
              {t('Date of birth')}
            </label>
            <input
              id="dateOfBirth"
              name="dateOfBirth"
              type="date"
              value={formData.dateOfBirth}
              onChange={handleChange}
              required
              max={
                new Date(Date.now() - 18 * 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
              }
              className="mt-1 block w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-rose-500 focus:outline-none focus:ring-1 focus:ring-rose-500"
            />
            <p className="mt-1 text-xs text-gray-500">{t('You must be at least 18 years old')}</p>
          </div>

          <div className="space-y-3 rounded-lg bg-gray-50 p-4">
            <label className="flex items-start gap-3">
              <input
                type="checkbox"
                name="agreedToRules"
                checked={formData.agreedToRules}
                onChange={handleChange}
                className="mt-1"
              />
              <span className="text-sm text-gray-600">
                {t('I agree to the')}{' '}
                <Link to="/rules" className="text-rose-600 hover:underline">
                  {t('event rules')}
                </Link>
              </span>
            </label>
            <label className="flex items-start gap-3">
              <input
                type="checkbox"
                name="agreedToPrivacy"
                checked={formData.agreedToPrivacy}
                onChange={handleChange}
                className="mt-1"
              />
              <span className="text-sm text-gray-600">
                {t('I agree to the')}{' '}
                <Link to="/privacy" className="text-rose-600 hover:underline">
                  {t('privacy policy')}
                </Link>
              </span>
            </label>
            <label className="flex items-start gap-3">
              <input
                type="checkbox"
                name="consentToMatching"
                checked={formData.consentToMatching}
                onChange={handleChange}
                className="mt-1"
              />
              <span className="text-sm text-gray-600">
                {t('I consent to participating in the matching process')}
              </span>
            </label>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-rose-500 py-3 font-semibold text-white hover:bg-rose-600 disabled:opacity-50"
          >
            {loading ? t('Creating account...') : t('Create account')}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-gray-600">
          {t('Already have an account?')}{' '}
          <Link to="/login" className="font-medium text-rose-600 hover:text-rose-700">
            {t('Sign in')}
          </Link>
        </p>
      </div>
    </div>
  );
}
