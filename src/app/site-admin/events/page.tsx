'use client';

import { useEffect, useState } from 'react';
import api from '@/lib/api';

interface AdminEvent {
  id: number;
  title: string;
  slug: string;
  owner: string;
  owner_email: string;
  owner_plan: 'free' | 'per_event' | 'pro';
  is_published: boolean;
  is_paid: boolean;
  paid_per_event: boolean;
  view_count: number;
  event_date: string | null;
  created_at: string;
}

function planLabel(ev: AdminEvent): { text: string; cls: string } {
  if (ev.paid_per_event) return { text: 'Per Event', cls: 'bg-amber-100 text-amber-700' };
  if (ev.owner_plan === 'pro') return { text: 'Pro', cls: 'bg-indigo-100 text-indigo-700' };
  if (ev.is_paid) return { text: 'Free', cls: 'bg-gray-100 text-gray-600' };
  return { text: 'Unpaid', cls: 'bg-gray-100 text-gray-400' };
}

export default function AdminEventsPage() {
  const [events, setEvents] = useState<AdminEvent[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    api.get('/admin/events/')
      .then((r) => setEvents(r.data))
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, []);

  const filtered = events.filter(
    (e) =>
      e.title.toLowerCase().includes(search.toLowerCase()) ||
      e.owner.toLowerCase().includes(search.toLowerCase()) ||
      e.owner_email.toLowerCase().includes(search.toLowerCase()),
  );

  if (error) {
    return <div className="text-sm text-red-500 mt-10 text-center">Failed to load events.</div>;
  }

  return (
    <div className="max-w-6xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Events</h1>
          <p className="text-sm text-gray-400 mt-1">{events.length} total events</p>
        </div>
        <input
          type="text"
          placeholder="Search by title or owner..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-64 px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
      </div>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-sm text-gray-400">Loading...</div>
        ) : filtered.length === 0 ? (
          <div className="p-8 text-center text-sm text-gray-400">No events found.</div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50">
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Event</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Owner</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Type</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Status</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Views</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Created</th>
                <th className="px-5 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filtered.map((ev) => {
                const { text, cls } = planLabel(ev);
                return (
                  <tr key={ev.id} className="hover:bg-gray-50 transition">
                    <td className="px-5 py-3.5 max-w-xs">
                      <p className="font-medium text-gray-900 truncate">{ev.title}</p>
                      <p className="text-xs text-gray-400 truncate">/event/{ev.slug}</p>
                    </td>
                    <td className="px-5 py-3.5">
                      <p className="text-gray-700">{ev.owner}</p>
                      <p className="text-xs text-gray-400">{ev.owner_email}</p>
                    </td>
                    <td className="px-5 py-3.5">
                      <span className={`inline-block text-xs font-semibold px-2 py-0.5 rounded-full ${cls}`}>{text}</span>
                    </td>
                    <td className="px-5 py-3.5">
                      {ev.is_published ? (
                        <span className="inline-flex items-center gap-1 text-xs font-medium text-green-600">
                          <span className="w-1.5 h-1.5 rounded-full bg-green-500 inline-block" />
                          Live
                        </span>
                      ) : (
                        <span className="text-xs text-gray-400">Draft</span>
                      )}
                    </td>
                    <td className="px-5 py-3.5 text-gray-600">{ev.view_count}</td>
                    <td className="px-5 py-3.5 text-xs text-gray-400">
                      {new Date(ev.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </td>
                    <td className="px-5 py-3.5">
                      {ev.is_published && (
                        <a
                          href={`/event/${ev.slug}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-indigo-500 hover:text-indigo-700 font-medium"
                        >
                          View →
                        </a>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
