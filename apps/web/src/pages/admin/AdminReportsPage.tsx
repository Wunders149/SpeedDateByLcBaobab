import { TrendingUp, Users, Calendar, FileText, BarChart3, Heart } from 'lucide-react';

export function AdminReportsPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-900">Reports & Analytics</h1>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: 'Total Registrations', value: 0, icon: Users, color: 'text-blue-500' },
          { label: 'Attendance Rate', value: '0%', icon: Calendar, color: 'text-green-500' },
          { label: 'Match Rate', value: '0%', icon: Heart, iconExtra: <TrendingUp className="h-5 w-5 text-rose-500" /> },
          { label: 'Avg Compatibility', value: '0%', icon: BarChart3, color: 'text-purple-500' },
        ].map((stat) => (
          <div key={stat.label} className="rounded-xl border border-rose-100 bg-white p-6">
            <div className="flex items-center gap-3">
              <stat.icon className={`h-6 w-6 ${stat.color ?? 'text-rose-500'}`} />
              <div>
                <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
                <p className="text-sm text-gray-500">{stat.label}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="rounded-2xl border border-rose-100 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-gray-900">Compatibility Score Distribution</h2>
        <div className="mt-4 h-48 flex items-center justify-center border-2 border-dashed border-gray-200 rounded-lg">
          <p className="text-gray-400">Chart will render here with real data</p>
        </div>
      </div>

      <div className="rounded-2xl border border-rose-100 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-gray-900">Export Reports</h2>
        <div className="mt-4 flex gap-3">
          <button className="flex items-center gap-2 rounded-lg bg-rose-500 px-4 py-2 text-sm font-semibold text-white hover:bg-rose-600">
            <FileText className="h-4 w-4" />
            Export Participants (CSV)
          </button>
          <button className="flex items-center gap-2 rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50">
            <FileText className="h-4 w-4" />
            Export Matches (CSV)
          </button>
        </div>
      </div>
    </div>
  );
}
