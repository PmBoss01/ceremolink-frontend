'use client';

import { useEffect, useState } from 'react';
import api from '@/lib/api';

interface Stats {
  total_users: number;
  total_events: number;
  published_events: number;
  total_views: number;
  free_users: number;
  per_event_users: number;
  pro_users: number;
  total_conversations: number;
}

function StatCard({
  label,
  value,
  sub,
  color = 'indigo',
  icon,
}: {
  label: string;
  value: number | string;
  sub?: string;
  color?: 'indigo' | 'violet' | 'amber' | 'green' | 'gray';
  icon: React.ReactNode;
}) {
  const ring: Record<string, string> = {
    indigo: 'bg-indigo-50 text-indigo-600',
    violet: 'bg-violet-50 text-violet-600',
    amber: 'bg-amber-50 text-amber-600',
    green: 'bg-green-50 text-green-600',
    gray: 'bg-gray-100 text-gray-500',
  };
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5 flex items-start gap-4">
      <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${ring[color]}`}>
        {icon}
      </div>
      <div>
        <p className="text-xs text-gray-400 font-medium uppercase tracking-wide">{label}</p>
        <p className="text-2xl font-bold text-gray-900 mt-0.5">{value.toLocaleString()}</p>
        {sub && <p className="text-xs text-gray-400 mt-1">{sub}</p>}
      </div>
    </div>
  );
}

export default function AdminOverviewPage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    api.get('/admin/stats/')
      .then((r) => setStats(r.data))
      .catch(() => setError(true));
  }, []);

  if (error) {
    return (
      <div className="text-sm text-red-500 mt-10 text-center">Failed to load stats. Make sure you have admin access.</div>
    );
  }

  if (!stats) {
    return <div className="text-sm text-gray-400 mt-10 text-center">Loading...</div>;
  }

  return (
    <div className="max-w-4xl">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Overview</h1>
        <p className="text-sm text-gray-400 mt-1">Platform-wide statistics</p>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard
          label="Total Users"
          value={stats.total_users}
          color="indigo"
          icon={
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          }
        />
        <StatCard
          label="Total Events"
          value={stats.total_events}
          sub={`${stats.published_events} published`}
          color="violet"
          icon={
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          }
        />
        <StatCard
          label="Total Views"
          value={stats.total_views}
          color="green"
          icon={
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.477 0 8.268 2.943 9.542 7-1.274 4.057-5.065 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
          }
        />
        <StatCard
          label="Chat Threads"
          value={stats.total_conversations}
          color="amber"
          icon={
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
          }
        />
      </div>

      {/* Plan breakdown */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h2 className="text-sm font-semibold text-gray-700 mb-4">Users by Plan</h2>
        <div className="space-y-3">
          {[
            { label: 'Free', count: stats.free_users, total: stats.total_users, color: 'bg-gray-400' },
            { label: 'Pay Per Event', count: stats.per_event_users, total: stats.total_users, color: 'bg-amber-400' },
            { label: 'Pro', count: stats.pro_users, total: stats.total_users, color: 'bg-indigo-500' },
          ].map(({ label, count, total, color }) => {
            const pct = total > 0 ? Math.round((count / total) * 100) : 0;
            return (
              <div key={label}>
                <div className="flex justify-between text-xs text-gray-500 mb-1">
                  <span>{label}</span>
                  <span>{count} users ({pct}%)</span>
                </div>
                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div className={`h-full rounded-full ${color}`} style={{ width: `${pct}%` }} />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
