import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { User, Mail, Calendar, Heart, MessageCircle } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

export function ProfilePage() {
  const { user, profile } = useAuth();
  const { t, language } = useLanguage();
  const [isEditing, setIsEditing] = useState(false);

  if (!user || !profile) {
    return (
      <div className="rounded-xl bg-yellow-50 p-4 text-yellow-700">
        {t('Please sign in to view your profile.')}
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">{t('Your Profile')}</h1>
        <button
          onClick={() => setIsEditing(!isEditing)}
          className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50"
        >
          {isEditing ? t('Cancel') : t('Edit Profile')}
        </button>
      </div>

      {/* Profile Card */}
      <div className="rounded-2xl border border-rose-100 bg-white p-6 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-rose-100">
            <User className="h-10 w-10 text-rose-600" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">{profile.displayName}</h2>
            <p className="text-gray-500">{user.email}</p>
          </div>
        </div>

        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          <div className="flex items-center gap-3 rounded-lg bg-gray-50 p-3">
            <Mail className="h-5 w-5 text-rose-500" />
            <div>
              <p className="text-xs text-gray-500">{t('Email')}</p>
              <p className="text-sm font-medium text-gray-900">{user.email}</p>
            </div>
          </div>
          <div className="flex items-center gap-3 rounded-lg bg-gray-50 p-3">
            <Calendar className="h-5 w-5 text-rose-500" />
            <div>
              <p className="text-xs text-gray-500">{t('Member since')}</p>
              <p className="text-sm font-medium text-gray-900">{new Date().toLocaleDateString(language === 'fr' ? 'fr-FR' : 'en-US')}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Public Profile */}
      <div className="rounded-2xl border border-rose-100 bg-white p-6 shadow-sm">
        <h3 className="text-lg font-semibold text-gray-900">{t('Public Profile')}</h3>
        <div className="mt-4 space-y-4">
          {profile.publicProfile.bio && (
            <div>
              <p className="text-sm font-medium text-gray-500">{t('Bio')}</p>
              <p className="mt-1 text-gray-900">{profile.publicProfile.bio}</p>
            </div>
          )}
          {profile.publicProfile.interests.length > 0 && (
            <div>
              <p className="text-sm font-medium text-gray-500">{t('Interests')}</p>
              <div className="mt-2 flex flex-wrap gap-2">
                {profile.publicProfile.interests.map((interest) => (
                  <span
                    key={interest}
                    className="rounded-full bg-rose-100 px-3 py-1 text-sm text-rose-700"
                  >
                    {interest}
                  </span>
                ))}
              </div>
            </div>
          )}
          {profile.publicProfile.languages.length > 0 && (
            <div>
              <p className="text-sm font-medium text-gray-500">{t('Languages')}</p>
              <div className="mt-2 flex flex-wrap gap-2">
                {profile.publicProfile.languages.map((lang) => (
                  <span
                    key={lang}
                    className="rounded-full bg-purple-100 px-3 py-1 text-sm text-purple-700"
                  >
                    {lang}
                  </span>
                ))}
              </div>
            </div>
          )}
          {profile.publicProfile.values.length > 0 && (
            <div>
              <p className="text-sm font-medium text-gray-500">{t('Values')}</p>
              <div className="mt-2 flex flex-wrap gap-2">
                {profile.publicProfile.values.map((value) => (
                  <span
                    key={value}
                    className="rounded-full bg-green-100 px-3 py-1 text-sm text-green-700"
                  >
                    {value}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Privacy Settings */}
      <div className="rounded-2xl border border-rose-100 bg-white p-6 shadow-sm">
        <h3 className="text-lg font-semibold text-gray-900">{t('Privacy & Consent')}</h3>
        <div className="mt-4 space-y-3">
          <div className="flex items-center justify-between rounded-lg bg-gray-50 p-3">
            <div className="flex items-center gap-3">
              <Heart className="h-5 w-5 text-rose-500" />
              <span className="text-sm text-gray-700">{t('Matching Consent')}</span>
            </div>
            <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-medium text-green-700">
              {t('Active')}
            </span>
          </div>
          <div className="flex items-center justify-between rounded-lg bg-gray-50 p-3">
            <div className="flex items-center gap-3">
              <MessageCircle className="h-5 w-5 text-purple-500" />
              <span className="text-sm text-gray-700">{t('Contact Sharing')}</span>
            </div>
            <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-medium text-blue-700">
              {profile.privateProfile.communicationPreference.replace('_', ' ')}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
