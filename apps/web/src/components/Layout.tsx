import { Link, NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Heart, LogOut, User, Menu, X, LayoutDashboard, CalendarDays, ClipboardCheck, QrCode, HeartHandshake, Timer, BarChart3, Bell } from 'lucide-react';
import { useEffect, useState } from 'react';

const adminLinks = [
  { to: '/admin', label: 'Overview', icon: LayoutDashboard, end: true },
  { to: '/admin/events', label: 'Events', icon: CalendarDays },
  { to: '/admin/registrations', label: 'Registrations', icon: ClipboardCheck },
  { to: '/admin/check-in', label: 'Check-in', icon: QrCode },
  { to: '/admin/matching', label: 'Matching', icon: HeartHandshake },
  { to: '/admin/sessions', label: 'Sessions', icon: Timer },
  { to: '/admin/reports', label: 'Reports', icon: BarChart3 },
  { to: '/admin/notifications', label: 'Announcements', icon: Bell },
];

export function Layout() {
  const { user, logout, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const isAdmin = user?.roles.includes('event_admin') || user?.roles.includes('super_admin');
  const inAdmin = isAdmin && location.pathname.startsWith('/admin');

  useEffect(() => setMobileMenuOpen(false), [location.pathname]);

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const navClass = ({ isActive }: { isActive: boolean }) =>
    `inline-flex items-center gap-2 whitespace-nowrap rounded-lg px-3 py-2 text-sm font-medium transition ${isActive ? 'bg-rose-50 text-rose-700' : 'text-slate-600 hover:bg-slate-50 hover:text-rose-700'}`;

  return (
    <div className="flex min-h-screen flex-col bg-[#fffafc] text-slate-800">
      <header className="sticky top-0 z-50 border-b border-rose-100/80 bg-white/95 shadow-sm shadow-rose-100/30 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6">
          <Link to="/" className="flex items-center gap-2.5 text-lg font-extrabold tracking-tight text-slate-900">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-rose-500 to-fuchsia-600 shadow-md shadow-rose-200"><Heart className="h-5 w-5 fill-white text-white" /></span>
            SpeedDate
          </Link>

          <nav aria-label="Main navigation" className="hidden items-center gap-1 md:flex">
            <NavLink to="/events" className={navClass}>Events</NavLink>
            {user && <NavLink to="/dashboard" className={navClass}>My dashboard</NavLink>}
            {isAdmin && <NavLink to="/admin" className={navClass}>Host workspace</NavLink>}
          </nav>

          <div className="hidden items-center gap-2 md:flex">
            {loading ? <div className="h-9 w-24 animate-pulse rounded-lg bg-slate-100" /> : user ? <>
              <Link to="/profile" className="inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50 hover:text-rose-700"><User className="h-4 w-4" />Profile</Link>
              <button onClick={handleLogout} className="inline-flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-600 transition hover:border-rose-200 hover:bg-rose-50 hover:text-rose-700"><LogOut className="h-4 w-4" />Log out</button>
            </> : <>
              <Link to="/login" className="rounded-lg px-3 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-50">Log in</Link>
              <Link to="/register" className="rounded-lg bg-rose-600 px-4 py-2 text-sm font-semibold text-white shadow-sm shadow-rose-200 transition hover:bg-rose-700">Join now</Link>
            </>}
          </div>

          <button type="button" aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'} aria-expanded={mobileMenuOpen} className="rounded-lg p-2 text-slate-600 hover:bg-slate-100 md:hidden" onClick={() => setMobileMenuOpen((open) => !open)}>
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
        {mobileMenuOpen && <div className="border-t border-slate-100 bg-white px-4 py-4 md:hidden">
          <nav aria-label="Mobile navigation" className="flex flex-col gap-1">
            <Link to="/events" className="rounded-lg px-3 py-2.5 text-sm font-medium hover:bg-rose-50">Browse events</Link>
            {user && <><Link to="/dashboard" className="rounded-lg px-3 py-2.5 text-sm font-medium hover:bg-rose-50">My dashboard</Link><Link to="/profile" className="rounded-lg px-3 py-2.5 text-sm font-medium hover:bg-rose-50">My profile</Link></>}
            {isAdmin && <Link to="/admin" className="rounded-lg px-3 py-2.5 text-sm font-semibold text-rose-700 hover:bg-rose-50">Host workspace</Link>}
            <div className="my-2 border-t border-slate-100" />
            {user ? <button onClick={handleLogout} className="flex items-center gap-2 rounded-lg px-3 py-2.5 text-left text-sm font-medium text-slate-600 hover:bg-slate-50"><LogOut className="h-4 w-4" />Log out</button> : <div className="flex gap-2"><Link to="/login" className="flex-1 rounded-lg border border-slate-200 px-4 py-2.5 text-center text-sm font-semibold">Log in</Link><Link to="/register" className="flex-1 rounded-lg bg-rose-600 px-4 py-2.5 text-center text-sm font-semibold text-white">Join now</Link></div>}
          </nav>
        </div>}
      </header>

      {inAdmin && <div className="border-b border-slate-200 bg-white">
        <nav aria-label="Host workspace" className="mx-auto flex max-w-7xl gap-1 overflow-x-auto px-4 py-2 sm:px-6">
          {adminLinks.map(({ to, label, icon: Icon, end }) => <NavLink key={to} to={to} end={end} className={navClass}><Icon className="h-4 w-4" /><span>{label}</span></NavLink>)}
        </nav>
      </div>}

      <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
        <Outlet />
      </main>

      <footer className="mt-12 border-t border-rose-100 bg-white">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-2 px-4 py-6 text-center text-xs text-slate-500 sm:flex-row sm:px-6 sm:text-left">
          <p>© 2026 SpeedDate. All rights reserved.</p>
          <p className="inline-flex items-center gap-1">Made with <Heart className="h-3.5 w-3.5 fill-rose-500 text-rose-500" /> for meaningful connections</p>
        </div>
      </footer>
    </div>
  );
}
