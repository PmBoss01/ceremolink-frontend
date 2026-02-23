'use client';

import { useEffect, useState } from 'react';
import api from '@/lib/api';

interface AdminUser {
  id: number;
  username: string;
  email: string;
  plan: 'free' | 'per_event' | 'pro';
  is_staff: boolean;
  event_count: number;
  event_credits: number;
  date_joined: string;
}

const PLAN_BADGE: Record<string, string> = {
  free: 'bg-gray-100 text-gray-600',
  per_event: 'bg-amber-100 text-amber-700',
  pro: 'bg-indigo-100 text-indigo-700',
};

const PLAN_LABEL: Record<string, string> = {
  free: 'Free',
  per_event: 'Per Event',
  pro: 'Pro',
};

export default function AdminUsersPage() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    api.get('/admin/users/')
      .then((r) => setUsers(r.data))
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, []);

  const filtered = users.filter(
    (u) =>
      u.username.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase()),
  );

  if (error) {
    return <div className="text-sm text-red-500 mt-10 text-center">Failed to load users.</div>;
  }

  return (
    <div className="max-w-5xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Users</h1>
          <p className="text-sm text-gray-400 mt-1">{users.length} registered accounts</p>
        </div>
        <input
          type="text"
          placeholder="Search by username or email..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-64 px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
      </div>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-sm text-gray-400">Loading...</div>
        ) : filtered.length === 0 ? (
          <div className="p-8 text-center text-sm text-gray-400">No users found.</div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50">
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">User</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Plan</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Events</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Credits</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Joined</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filtered.map((u) => (
                <tr key={u.id} className="hover:bg-gray-50 transition">
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-xs font-bold text-indigo-600 flex-shrink-0">
                        {u.username[0].toUpperCase()}
                      </div>
                      <div>
                        <div className="font-medium text-gray-900 flex items-center gap-1.5">
                          {u.username}
                          {u.is_staff && (
                            <span className="text-xs bg-red-100 text-red-600 px-1.5 py-0.5 rounded font-semibold">Staff</span>
                          )}
                        </div>
                        <div className="text-xs text-gray-400">{u.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-3.5">
                    <span className={`inline-block text-xs font-semibold px-2 py-0.5 rounded-full ${PLAN_BADGE[u.plan]}`}>
                      {PLAN_LABEL[u.plan]}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 text-gray-600">{u.event_count}</td>
                  <td className="px-5 py-3.5 text-gray-600">{u.event_credits}</td>
                  <td className="px-5 py-3.5 text-gray-400 text-xs">
                    {new Date(u.date_joined).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
