import { jsx as _jsx, Fragment as _Fragment, jsxs as _jsxs } from "react/jsx-runtime";
import { Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider, useAuth } from './contexts/AuthContext';
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
import { MatchesPage } from './pages/MatchesPage';
import { MatchRevealPage } from './pages/MatchRevealPage';
import { NotificationsPage } from './pages/NotificationsPage';
import { NotFoundPage } from './pages/NotFoundPage';
const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            staleTime: 1000 * 60 * 5, // 5 minutes
            retry: 1,
        },
    },
});
function ProtectedRoute({ children }) {
    const { user, loading } = useAuth();
    if (loading) {
        return (_jsx("div", { className: "flex items-center justify-center py-20", children: _jsx("div", { className: "h-8 w-8 animate-spin rounded-full border-4 border-rose-200 border-t-rose-600" }) }));
    }
    if (!user) {
        return _jsx(Navigate, { to: "/login", replace: true });
    }
    return _jsx(_Fragment, { children: children });
}
function AdminRoute({ children }) {
    const { user, loading } = useAuth();
    if (loading) {
        return (_jsx("div", { className: "flex items-center justify-center py-20", children: _jsx("div", { className: "h-8 w-8 animate-spin rounded-full border-4 border-rose-200 border-t-rose-600" }) }));
    }
    if (!user || (!user.roles.includes('event_admin') && !user.roles.includes('super_admin'))) {
        return _jsx(Navigate, { to: "/login", replace: true });
    }
    return _jsx(_Fragment, { children: children });
}
function AppRoutes() {
    return (_jsx(Routes, { children: _jsxs(Route, { element: _jsx(Layout, {}), children: [_jsx(Route, { path: "/", element: _jsx(LandingPage, {}) }), _jsx(Route, { path: "/login", element: _jsx(LoginPage, {}) }), _jsx(Route, { path: "/register", element: _jsx(RegisterPage, {}) }), _jsx(Route, { path: "/events", element: _jsx(EventsPage, {}) }), _jsx(Route, { path: "/events/:eventId", element: _jsx(EventDetailsPage, {}) }), _jsx(Route, { path: "/dashboard", element: _jsx(ProtectedRoute, { children: _jsx(DashboardPage, {}) }) }), _jsx(Route, { path: "/profile", element: _jsx(ProtectedRoute, { children: _jsx(ProfilePage, {}) }) }), _jsx(Route, { path: "/questionnaire", element: _jsx(ProtectedRoute, { children: _jsx(QuestionnairePage, {}) }) }), _jsx(Route, { path: "/matches", element: _jsx(ProtectedRoute, { children: _jsx(MatchesPage, {}) }) }), _jsx(Route, { path: "/matches/reveal", element: _jsx(ProtectedRoute, { children: _jsx(MatchRevealPage, {}) }) }), _jsx(Route, { path: "/notifications", element: _jsx(ProtectedRoute, { children: _jsx(NotificationsPage, {}) }) }), _jsx(Route, { path: "/admin", element: _jsx(AdminRoute, { children: _jsx(AdminPage, {}) }) }), _jsx(Route, { path: "*", element: _jsx(NotFoundPage, {}) })] }) }));
}
export default function App() {
    return (_jsx(ErrorBoundary, { children: _jsx(QueryClientProvider, { client: queryClient, children: _jsx(AuthProvider, { children: _jsx(AppRoutes, {}) }) }) }));
}
