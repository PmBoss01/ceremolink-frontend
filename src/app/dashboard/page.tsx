'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import api from '@/lib/api';
import { Event } from '@/types';
import ConfirmModal from '@/components/ConfirmModal';
import Toast from '@/components/Toast';
import { useAuth } from '@/lib/auth';

// Returns real-time countdown label for a timed event, or null if not applicable
function getEventExpiry(
  publishedAt: string | null,
  durationMs: number,
  now: number
): { label: string; isExpired: boolean } | null {
  if (!publishedAt) return null;
  const expiresAt = new Date(publishedAt).getTime() + durationMs;
  const remaining = Math.max(0, expiresAt - now);

  if (remaining === 0) {
    return { label: 'Expired', isExpired: true };
  }

  const hours = Math.floor(remaining / (60 * 60 * 1000));
  const minutes = Math.floor((remaining % (60 * 60 * 1000)) / 60000);
  const seconds = Math.floor((remaining % 60000) / 1000);

  if (hours > 0) {
    return { label: `${hours}h ${minutes}m ${seconds}s left`, isExpired: false };
  }
  if (minutes > 0) {
    return { label: `${minutes}m ${seconds}s left`, isExpired: false };
  }
  return { label: `${seconds}s left`, isExpired: false };
}

// Returns expiry date label + days-remaining countdown for Pro event cards.
// Expiry is calculated from published_at + 1 month (or + 1 year for yearly).
function getProRenewal(
  publishedAt: string | null,
  interval: string,
  now: number
): { dateLabel: string; countdown: string; isExpired: boolean } | null {
  if (!publishedAt) return null;

  const base = new Date(publishedAt);
  let expiresAt: Date;
  if (interval === 'year') {
    expiresAt = new Date(base);
    expiresAt.setFullYear(expiresAt.getFullYear() + 1);
  } else {
    expiresAt = new Date(base);
    expiresAt.setMonth(expiresAt.getMonth() + 1);
  }

  const endsAt = expiresAt.getTime();
  const remaining = Math.max(0, endsAt - now);

  const dateLabel = expiresAt.toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });

  if (remaining === 0) {
    return { dateLabel, countdown: 'Expired', isExpired: true };
  }

  const days = Math.floor(remaining / (24 * 60 * 60 * 1000));
  const hours = Math.floor((remaining % (24 * 60 * 60 * 1000)) / (60 * 60 * 1000));

  let countdown: string;
  if (days > 1) countdown = `${days} days left`;
  else if (days === 1) countdown = '1 day left';
  else countdown = `${hours}h left`;

  return { dateLabel, countdown, isExpired: false };
}

const FREE_WINDOW_MS = 3 * 60 * 60 * 1000; // 3 hours
const PER_EVENT_WINDOW_MS = 24 * 60 * 60 * 1000; // 24 hours

export default function DashboardPage() {
  const { user } = useAuth();
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteTarget, setDeleteTarget] = useState<Event | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [now, setNow] = useState(() => Date.now());
  const [loginToast, setLoginToast] = useState(false);
  const [deleteToast, setDeleteToast] = useState<string | null>(null);
  const [expiredBannerVisible, setExpiredBannerVisible] = useState(true);
  const [proExpiredBannerVisible, setProExpiredBannerVisible] = useState(true);

  useEffect(() => {
    api
      .get('/events/')
      .then(({ data }) => setEvents(data))
      .finally(() => setLoading(false));
  }, []);

  // Show login success toast once after Google/password sign-in redirect
  useEffect(() => {
    if (sessionStorage.getItem('justLoggedIn')) {
      sessionStorage.removeItem('justLoggedIn');
      setLoginToast(true);
    }
  }, []);

  // Update "now" every second for real-time countdown display
  useEffect(() => {
    const interval = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(interval);
  }, []);

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    const deletedTitle = deleteTarget.title;
    await api.delete(`/events/${deleteTarget.id}/`);
    setEvents((prev) => prev.filter((e) => e.id !== deleteTarget.id));
    setDeleting(false);
    setDeleteTarget(null);
    setDeleteToast(deletedTitle);
  };

  const effectivePlan = user?.plan ?? 'free';
  const isFree = effectivePlan === 'free';
  const isPro = effectivePlan === 'pro';
  const eventsUsed = user?.events_used ?? 0;
  // Any published event that has hit its window limit (3h free, 24h per_event)
  const hasExpiredEvent = events.some((e) => {
    if (!e.is_published || !e.published_at) return false;
    if (e.paid_per_event) return getEventExpiry(e.published_at, PER_EVENT_WINDOW_MS, now)?.isExpired ?? false;
    if (!isPro) return getEventExpiry(e.published_at, FREE_WINDOW_MS, now)?.isExpired ?? false;
    return false;
  });

  // Any Pro event whose published_at + 1 month/year window has passed
  const hasExpiredProEvent = isPro && events.some((e) => {
    if (!e.published_at) return false;
    return getProRenewal(e.published_at, user?.subscription_interval ?? 'month', now)?.isExpired ?? false;
  });

  // Auto-dismiss the expired banner after 6 seconds
  useEffect(() => {
    if (!hasExpiredEvent) return;
    setExpiredBannerVisible(true);
    const timer = setTimeout(() => setExpiredBannerVisible(false), 6000);
    return () => clearTimeout(timer);
  }, [hasExpiredEvent]);

  return (
    <div>
      {loginToast && (
        <Toast
          message="Login successful! Welcome to CeremoLink."
          type="success"
          onClose={() => setLoginToast(false)}
        />
      )}

      {deleteToast && (
        <Toast
          message={`"${deleteToast}" has been deleted.`}
          type="success"
          onClose={() => setDeleteToast(null)}
        />
      )}

      {deleteTarget && (
        <ConfirmModal
          title="Delete Event"
          message={`"${deleteTarget.title}" will be permanently deleted. This cannot be undone.`}
          warning={
            isFree && eventsUsed >= 1
              ? 'You are on the free plan. Once you delete this event, you will NOT be able to create another one for free. Your free event slot is permanently used up — you must upgrade to Pro or pay per event to create more.'
              : undefined
          }
          confirmLabel={isFree && eventsUsed >= 1 ? 'Yes, delete anyway' : 'Delete'}
          onConfirm={confirmDelete}
          onCancel={() => setDeleteTarget(null)}
          loading={deleting}
        />
      )}

      {/* Expired event banner — auto-dismisses after 6 seconds */}
      {hasExpiredEvent && expiredBannerVisible && (
        <div className="mb-4 flex items-center justify-between gap-4 bg-red-50 border border-red-200 rounded-xl px-5 py-4">
          <div>
            <p className="text-sm font-semibold text-red-800">An event&apos;s publish window has expired</p>
            <p className="text-xs text-red-600 mt-0.5">
              The publish window has ended. Guests can no longer view that event.
              Upgrade to Pro to keep events live permanently.
            </p>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <Link
              href="/pricing"
              className="px-4 py-2 bg-red-600 text-white text-xs font-semibold rounded-lg hover:bg-red-700 transition"
            >
              Upgrade
            </Link>
            <button
              onClick={() => setExpiredBannerVisible(false)}
              className="p-1.5 text-red-400 hover:text-red-600 transition"
              aria-label="Dismiss"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      )}

      {/* Pro plan expired banner — shown when a Pro event's subscription window has passed */}
      {hasExpiredProEvent && proExpiredBannerVisible && (
        <div className="mb-4 flex items-center justify-between gap-4 bg-red-50 border border-red-200 rounded-xl px-5 py-4">
          <div>
            <p className="text-sm font-semibold text-red-800">Your Pro event has expired</p>
            <p className="text-xs text-red-600 mt-0.5">
              One or more events have passed their subscription window. Guests can no longer view them.
              Renew your plan to restore access.
            </p>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <Link
              href="/pricing"
              className="px-4 py-2 bg-red-600 text-white text-xs font-semibold rounded-lg hover:bg-red-700 transition"
            >
              Renew Plan
            </Link>
            <button
              onClick={() => setProExpiredBannerVisible(false)}
              className="p-1.5 text-red-400 hover:text-red-600 transition"
              aria-label="Dismiss"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      )}

      {/* Upgrade banner — shown when free user has used their 1 lifetime event */}
      {isFree && eventsUsed >= 1 && (
        <div className="mb-6 flex items-center justify-between gap-4 bg-amber-50 border border-amber-200 rounded-xl px-5 py-4">
          <div>
            <p className="text-sm font-semibold text-amber-800">You&apos;ve reached the free plan limit</p>
            <p className="text-xs text-amber-600 mt-0.5">
              Upgrade to Pro for unlimited events, or pay $9.99 per additional event.
            </p>
          </div>
          <Link
            href="/pricing"
            className="flex-shrink-0 px-4 py-2 bg-amber-500 text-white text-xs font-semibold rounded-lg hover:bg-amber-600 transition"
          >
            View Plans
          </Link>
        </div>
      )}

      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Events</h1>
          <p className="text-sm text-gray-500 mt-1">
            Manage your event programs
          </p>
        </div>
        <div className="flex items-center gap-3">
          {/* Free plan usage indicator */}
          {isFree && (
            <div
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border ${
                eventsUsed >= 1
                  ? 'bg-red-50 border-red-200 text-red-700'
                  : 'bg-green-50 border-green-200 text-green-700'
              }`}
            >
              <span
                className={`w-2 h-2 rounded-full ${eventsUsed >= 1 ? 'bg-red-500' : 'bg-green-500'}`}
              />
              {eventsUsed}/1 free event used
            </div>
          )}
          <Link
            href="/dashboard/events/new"
            className="px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 transition"
          >
            + New Event
          </Link>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-20 text-gray-400 text-sm">
          Loading events...
        </div>
      ) : events.length === 0 ? (
        <div className="text-center py-20">
          <div className="text-5xl mb-4">📋</div>
          <h3 className="text-lg font-semibold text-gray-700">No events yet</h3>
          <p className="text-sm text-gray-400 mt-1 mb-6">
            Create your first event to get started
          </p>
          <Link
            href="/dashboard/events/new"
            className="px-6 py-2.5 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 transition"
          >
            Create Event
          </Link>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {events.map((event) => {
            // Show countdown whenever published_at is set — the window ticks
            // regardless of whether the event is currently published or not.
            const timedExpiry = event.paid_per_event
              ? getEventExpiry(event.published_at, PER_EVENT_WINDOW_MS, now)
              : !isPro
              ? getEventExpiry(event.published_at, FREE_WINDOW_MS, now)
              : null;
            const isExpired = timedExpiry?.isExpired ?? false;

            // Pro users: show subscription renewal countdown on each card
            const proRenewal = isPro
              ? getProRenewal(event.published_at, user?.subscription_interval ?? 'month', now)
              : null;

            return (
              <div
                key={event.id}
                className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm hover:shadow-md transition"
              >
                {event.cover_image && (
                  <img
                    src={event.cover_image}
                    alt={event.title}
                    className="w-full h-32 object-cover rounded-lg mb-4"
                  />
                )}

                <div className="flex items-start justify-between mb-2">
                  <h3 className="font-semibold text-gray-900 text-sm leading-tight">
                    {event.title}
                  </h3>
                  <div className="flex gap-1 ml-2 flex-shrink-0 flex-wrap justify-end">
                    {event.is_paid && (
                      <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-medium">
                        Paid
                      </span>
                    )}
                    {isExpired ? (
                      <span className="text-xs bg-red-100 text-red-600 px-2 py-0.5 rounded-full font-medium">
                        Expired
                      </span>
                    ) : (
                      <span
                        className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                          event.is_published
                            ? 'bg-indigo-100 text-indigo-700'
                            : 'bg-gray-100 text-gray-600'
                        }`}
                      >
                        {event.is_published ? 'Live' : 'Draft'}
                      </span>
                    )}
                  </div>
                </div>

                {/* Countdown for timed events (free: 3h, per_event: 24h) */}
                {timedExpiry && !isExpired && (
                  <div className="flex items-center gap-1.5 mb-3 text-xs text-amber-600 font-medium">
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <circle cx="12" cy="12" r="10" />
                      <path strokeLinecap="round" d="M12 6v6l4 2" />
                    </svg>
                    {timedExpiry.label}
                  </div>
                )}

                {/* Pro subscription expiry indicator */}
                {isPro && (
                  proRenewal ? (
                    <div className={`mb-3 rounded-lg px-3 py-2 text-xs ${proRenewal.isExpired ? 'bg-red-50 border border-red-200' : 'bg-indigo-50 border border-indigo-100'}`}>
                      <div className={`font-semibold ${proRenewal.isExpired ? 'text-red-700' : 'text-indigo-700'}`}>
                        Expires {proRenewal.dateLabel}
                      </div>
                      <div className={`mt-0.5 ${proRenewal.isExpired ? 'text-red-500' : 'text-indigo-400'}`}>
                        {proRenewal.countdown}
                      </div>
                    </div>
                  ) : (
                    <div className="mb-3 rounded-lg px-3 py-2 text-xs bg-indigo-50 border border-indigo-100">
                      <div className="font-semibold text-indigo-700">Pro — Active</div>
                      <div className="mt-0.5 text-indigo-400">Subscription renews automatically</div>
                    </div>
                  )
                )}

                {event.description && (
                  <p className="text-xs text-gray-500 mb-4 line-clamp-2">
                    {event.description}
                  </p>
                )}

                <div className="flex items-center justify-between text-xs text-gray-400 mb-4">
                  <span>👁 {event.view_count} views</span>
                  <span>{new Date(event.created_at).toLocaleDateString()}</span>
                </div>

                <div className="flex gap-2">
                  <Link
                    href={`/dashboard/events/${event.id}`}
                    className="flex-1 text-center py-1.5 text-xs font-medium bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition"
                  >
                    Edit
                  </Link>
                  {event.qr_code && (
                    <Link
                      href={`/dashboard/events/${event.id}?view=qr`}
                      className="flex-1 text-center py-1.5 text-xs font-medium bg-indigo-50 text-indigo-700 rounded-lg hover:bg-indigo-100 transition"
                    >
                      QR Code
                    </Link>
                  )}
                  <button
                    onClick={() => setDeleteTarget(event)}
                    className="px-3 py-1.5 text-xs font-medium bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition"
                  >
                    Delete
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
