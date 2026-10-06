import { Link, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Heart, LogOut, User, Menu, X } from 'lucide-react';
import { useState } from 'react';

export function Layout() {
  const { user, logout, loading } = useAuth();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const isAdmin = user?.roles.includes('event_admin') || user?.roles.includes('super_admin');

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 via-white to-purple-50">
      <header className="sticky top-0 z-50 border-b border-rose-100 bg-white/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3">
          <Link to="/" className="flex items-center gap-2 text-xl font-bold text-rose-600">
            <Heart className="h-6 w-6 fill-rose-500 text-rose-500" />
            SpeedDate
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden items-center gap-6 md:flex">
            <Link to="/events" className="text-sm font-medium text-gray-600 hover:text-rose-600">
              Events
            </Link>
            {user && (
              <Link to="/dashboard" className="text-sm font-medium text-gray-600 hover:text-rose-600">
                Dashboard
              </Link>
            )}
            {isAdmin && (
              <Link to="/admin" className="text-sm font-medium text-gray-600 hover:text-rose-600">
                Admin
              </Link>
            )}
          </nav>

          <div className="hidden items-center gap-3 md:flex">
            {loading ? (
              <div className="h-8 w-20 animate-pulse rounded-full bg-gray-200" />
            ) : user ? (
              <>
                <Link to="/profile" className="flex items-center gap-2 text-sm font-medium text-gray-700 hover:text-rose-600">
                  <User className="h-4 w-4" />
                  Profile
                </Link>
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-2 rounded-full border border-gray-200 px-4 py-2 text-sm font-medium text-gray-600 hover:border-rose-300 hover:text-rose-600"
                >
                  <LogOut className="h-4 w-4" />
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="rounded-full border border-gray-200 px-4 py-2 text-sm font-medium text-gray-600 hover:border-rose-300 hover:text-rose-600"
                >
                  Log in
                </Link>
                <Link
                  to="/register"
                  className="rounded-full bg-rose-500 px-4 py-2 text-sm font-semibold text-white hover:bg-rose-600"
                >
                  Join now
                </Link>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <button
            className="md:hidden"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>

        {/* Mobile Nav */}
        {mobileMenuOpen && (
          <div className="border-t border-rose-100 bg-white px-4 py-4 md:hidden">
            <div className="flex flex-col gap-3">
              <Link to="/events" className="text-sm font-medium text-gray-600" onClick={() => setMobileMenuOpen(false)}>
                Events
              </Link>
              {user && (
                <Link to="/dashboard" className="text-sm font-medium text-gray-600" onClick={() => setMobileMenuOpen(false)}>
                  Dashboard
                </Link>
              )}
              {isAdmin && (
                <Link to="/admin" className="text-sm font-medium text-gray-600" onClick={() => setMobileMenuOpen(false)}>
                  Admin
                </Link>
              )}
              <hr className="border-rose-100" />
              {user ? (
                <button
                  onClick={() => { handleLogout(); setMobileMenuOpen(false); }}
                  className="text-left text-sm font-medium text-gray-600"
                >
                  Logout
                </button>
              ) : (
                <div className="flex gap-2">
                  <Link to="/login" className="flex-1 rounded-full border border-gray-200 px-4 py-2 text-center text-sm font-medium" onClick={() => setMobileMenuOpen(false)}>
                    Log in
                  </Link>
                  <Link to="/register" className="flex-1 rounded-full bg-rose-500 px-4 py-2 text-center text-sm font-semibold text-white" onClick={() => setMobileMenuOpen(false)}>
                    Join now
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}
      </header>

      <main className="mx-auto max-w-7xl px-4 py-8">
        <Outlet />
      </main>

      <footer className="border-t border-rose-100 bg-white py-8">
        <div className="mx-auto max-w-7xl px-4 text-center text-sm text-gray-500">
          <p>&copy; 2026 SpeedDate. All rights reserved.</p>
          <p className="mt-2">Made with <Heart className="inline h-4 w-4 text-rose-500" /> for meaningful connections</p>
        </div>
      </footer>
    </div>
  );
}
