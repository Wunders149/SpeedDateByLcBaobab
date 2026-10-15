import { useQuery } from '@tanstack/react-query';
import { api } from '../lib/api';
import { useAuth } from '../contexts/AuthContext';
import { Users, Calendar, FileText, Heart, Activity } from 'lucide-react';
import { Link } from 'react-router-dom';

interface DashboardData {
  overview: {
    totalParticipants: number;
    totalEvents: number;
    pendingRegistrations: number;
    approvedRegistrations: number;
    waitlistedRegistrations: number;
    checkedInParticipants: number;
  };
  recentActivity: Array<{
    _id: string;
    action: string;
    targetType: string;
    timestamp: string;
  }>;
  upcomingEvents: Array<{
    _id: string;
    name: string;
    startAt: string;
    status: string;
  }>;
}

export function AdminPage() {
  const { user } = useAuth();

  const { data, isLoading } = useQuery({
    queryKey: ['admin-dashboard'],
    queryFn: () => api<{ data: DashboardData }>('/api/v1/admin/dashboard'),
    enabled: !!user,
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-rose-200 border-t-rose-600" />
      </div>
    );
  }

  const dashboard = data?.data;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
        <p className="mt-2 text-gray-600">Manage events, participants, and matches</p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-xl border border-rose-100 bg-white p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-rose-100">
              <Users className="h-5 w-5 text-rose-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">
                {dashboard?.overview.totalParticipants ?? 0}
              </p>
              <p className="text-sm text-gray-500">Participants</p>
            </div>
          </div>
        </div>
        <div className="rounded-xl border border-rose-100 bg-white p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-purple-100">
              <Calendar className="h-5 w-5 text-purple-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">
                {dashboard?.overview.totalEvents ?? 0}
              </p>
              <p className="text-sm text-gray-500">Events</p>
            </div>
          </div>
        </div>
        <div className="rounded-xl border border-rose-100 bg-white p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-yellow-100">
              <FileText className="h-5 w-5 text-yellow-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">
                {dashboard?.overview.pendingRegistrations ?? 0}
              </p>
              <p className="text-sm text-gray-500">Pending</p>
            </div>
          </div>
        </div>
        <div className="rounded-xl border border-rose-100 bg-white p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-100">
              <Heart className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">
                {dashboard?.overview.approvedRegistrations ?? 0}
              </p>
              <p className="text-sm text-gray-500">Approved</p>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Link
          to="/admin/events"
          className="flex items-center gap-3 rounded-xl border border-rose-100 bg-white p-4 transition hover:shadow-md"
        >
          <Calendar className="h-8 w-8 text-rose-500" />
          <div>
            <p className="font-medium text-gray-900">Manage Events</p>
            <p className="text-sm text-gray-500">Create and edit events</p>
          </div>
        </Link>
        <Link
          to="/admin/participants"
          className="flex items-center gap-3 rounded-xl border border-rose-100 bg-white p-4 transition hover:shadow-md"
        >
          <Users className="h-8 w-8 text-purple-500" />
          <div>
            <p className="font-medium text-gray-900">Participants</p>
            <p className="text-sm text-gray-500">Review registrations</p>
          </div>
        </Link>
        <Link
          to="/admin/matching"
          className="flex items-center gap-3 rounded-xl border border-rose-100 bg-white p-4 transition hover:shadow-md"
        >
          <Heart className="h-8 w-8 text-pink-500" />
          <div>
            <p className="font-medium text-gray-900">Matching</p>
            <p className="text-sm text-gray-500">Generate and publish matches</p>
          </div>
        </Link>
      </div>

      {/* Recent Activity */}
      <div className="rounded-xl border border-rose-100 bg-white p-6">
        <h2 className="text-lg font-semibold text-gray-900">Recent Activity</h2>
        <div className="mt-4 space-y-3">
          {dashboard?.recentActivity?.slice(0, 5).map((activity) => (
            <div
              key={activity._id}
              className="flex items-center justify-between rounded-lg bg-gray-50 p-3"
            >
              <div className="flex items-center gap-3">
                <Activity className="h-4 w-4 text-gray-400" />
                <span className="text-sm text-gray-700">{activity.action}</span>
              </div>
              <span className="text-xs text-gray-500">
                {new Date(activity.timestamp).toLocaleString()}
              </span>
            </div>
          )) ?? <p className="text-sm text-gray-500">No recent activity</p>}
        </div>
      </div>
    </div>
  );
}
