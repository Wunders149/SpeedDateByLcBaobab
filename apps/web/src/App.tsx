import { Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { LanguageProvider } from './contexts/LanguageContext';
import { Layout } from './components/Layout';
import { ErrorBoundary } from './components/ErrorBoundary';
import { LandingPage } from './pages/LandingPage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { DashboardPage } from './pages/DashboardPage';
import { EventsPage } from './pages/EventsPage';
import { EventDetailsPage } from './pages/EventDetailsPage';
import { ProfilePage } from './pages/ProfilePage';
import { AdminPage } from './pages/AdminPage';
import { QuestionnairePage } from './pages/QuestionnairePage';
import { QuestionnaireIntroPage } from './pages/QuestionnaireIntroPage';
import { QuestionnaireReviewPage } from './pages/QuestionnaireReviewPage';
import { MatchesPage } from './pages/MatchesPage';
import { MatchRevealPage } from './pages/MatchRevealPage';
import { NotificationsPage } from './pages/NotificationsPage';
import { FaqPage } from './pages/FaqPage';
import { CheckInPage } from './pages/CheckInPage';
import { SessionTimetablePage } from './pages/SessionTimetablePage';
import { AccountSettingsPage } from './pages/AccountSettingsPage';
import { PrivacySettingsPage } from './pages/PrivacySettingsPage';
import { PasswordRecoveryPage } from './pages/PasswordRecoveryPage';
// import { RegistrationConfirmationPage } from './pages/RegistrationConfirmationPage';
import { NotFoundPage } from './pages/NotFoundPage';

// Admin pages
import { AdminEventsPage } from './pages/admin/AdminEventsPage';
import { AdminEventCreatePage } from './pages/admin/AdminEventCreatePage';
import { AdminParticipantsPage } from './pages/admin/AdminParticipantsPage';
import { AdminRegistrationsPage } from './pages/admin/AdminRegistrationsPage';
import { AdminCheckInPage } from './pages/admin/AdminCheckInPage';
import { AdminMatchingPage } from './pages/admin/AdminMatchingPage';
import { AdminAuditLogPage } from './pages/admin/AdminAuditLogPage';
import { AdminReportsPage } from './pages/admin/AdminReportsPage';
import { AdminPlatformSettingsPage } from './pages/admin/AdminPlatformSettingsPage';
import { AdminAdminsPage } from './pages/admin/AdminAdminsPage';
import { AdminQuestionBankPage } from './pages/admin/AdminQuestionBankPage';
import { AdminQuestionnaireBuilderPage } from './pages/admin/AdminQuestionnaireBuilderPage';
import { AdminMatchReviewPage } from './pages/admin/AdminMatchReviewPage';
import { AdminResultsPublicationPage } from './pages/admin/AdminResultsPublicationPage';
import { AdminSessionManagementPage } from './pages/admin/AdminSessionManagementPage';
import { AdminNotificationsPage } from './pages/admin/AdminNotificationsPage';
import { AdminParticipantDetailPage } from './pages/admin/AdminParticipantDetailPage';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      retry: 1,
    },
  },
});

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-rose-200 border-t-rose-600" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}

function AdminRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-rose-200 border-t-rose-600" />
      </div>
    );
  }

  if (!user || (!user.roles.includes('event_admin') && !user.roles.includes('super_admin'))) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}

function AppRoutes() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/events" element={<EventsPage />} />
        <Route path="/events/:eventId" element={<EventDetailsPage />} />
        <Route path="/reset-password" element={<PasswordRecoveryPage />} />
        <Route path="/faq" element={<FaqPage />} />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <DashboardPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <ProfilePage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/questionnaire/intro"
          element={
            <ProtectedRoute>
              <QuestionnaireIntroPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/questionnaire"
          element={
            <ProtectedRoute>
              <QuestionnairePage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/questionnaire/review"
          element={
            <ProtectedRoute>
              <QuestionnaireReviewPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/check-in"
          element={
            <ProtectedRoute>
              <CheckInPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/sessions"
          element={
            <ProtectedRoute>
              <SessionTimetablePage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/settings"
          element={
            <ProtectedRoute>
              <AccountSettingsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/privacy"
          element={
            <ProtectedRoute>
              <PrivacySettingsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/matches"
          element={
            <ProtectedRoute>
              <MatchesPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/matches/reveal"
          element={
            <ProtectedRoute>
              <MatchRevealPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/notifications"
          element={
            <ProtectedRoute>
              <NotificationsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <ProfilePage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/questionnaire"
          element={
            <ProtectedRoute>
              <QuestionnairePage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/matches"
          element={
            <ProtectedRoute>
              <MatchesPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/matches/reveal"
          element={
            <ProtectedRoute>
              <MatchRevealPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/notifications"
          element={
            <ProtectedRoute>
              <NotificationsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin"
          element={
            <AdminRoute>
              <AdminPage />
            </AdminRoute>
          }
        />
        <Route path="/admin/events" element={<AdminRoute><AdminEventsPage /></AdminRoute>} />
        <Route path="/admin/events/new" element={<AdminRoute><AdminEventCreatePage /></AdminRoute>} />
        <Route path="/admin/events/:eventId/edit" element={<AdminRoute><AdminEventCreatePage /></AdminRoute>} />
        <Route path="/admin/participants" element={<AdminRoute><AdminParticipantsPage /></AdminRoute>} />
        <Route path="/admin/registrations" element={<AdminRoute><AdminRegistrationsPage /></AdminRoute>} />
        <Route path="/admin/check-in" element={<AdminRoute><AdminCheckInPage /></AdminRoute>} />
        <Route path="/admin/matching" element={<AdminRoute><AdminMatchingPage /></AdminRoute>} />
        <Route path="/admin/reports" element={<AdminRoute><AdminReportsPage /></AdminRoute>} />
        <Route path="/admin/audit-log" element={<AdminRoute><AdminAuditLogPage /></AdminRoute>} />
        <Route path="/admin/settings" element={<AdminRoute><AdminPlatformSettingsPage /></AdminRoute>} />
        <Route path="/admin/admins" element={<AdminRoute><AdminAdminsPage /></AdminRoute>} />
        <Route path="/admin/questions" element={<AdminRoute><AdminQuestionBankPage /></AdminRoute>} />
        <Route path="/admin/questionnaire-builder" element={<AdminRoute><AdminQuestionnaireBuilderPage /></AdminRoute>} />
        <Route path="/admin/matches/review" element={<AdminRoute><AdminMatchReviewPage /></AdminRoute>} />
        <Route path="/admin/results" element={<AdminRoute><AdminResultsPublicationPage /></AdminRoute>} />
        <Route path="/admin/sessions" element={<AdminRoute><AdminSessionManagementPage /></AdminRoute>} />
        <Route path="/admin/notifications" element={<AdminRoute><AdminNotificationsPage /></AdminRoute>} />
        <Route path="/admin/participants/detail" element={<AdminRoute><AdminParticipantDetailPage /></AdminRoute>} />
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <LanguageProvider>
          <AuthProvider>
            <AppRoutes />
          </AuthProvider>
        </LanguageProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}
