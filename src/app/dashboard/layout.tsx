'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/lib/auth';
import api from '@/lib/api';
import ConfirmModal from '@/components/ConfirmModal';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isAuthenticated, loading, logout, user } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [upgradeLoading, setUpgradeLoading] = useState(false);

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, loading, router]);

  // Poll every 60 s while the user is on the dashboard so expiry emails are
  // sent the moment an event's publish window closes, not on the next page load.
  useEffect(() => {
    if (!isAuthenticated) return;
    const poll = () => api.get('/events/check-expiry/').catch(() => {/* silent */});
    poll(); // immediate check on mount
    const id = setInterval(poll, 60_000);
    return () => clearInterval(id);
  }, [isAuthenticated]);

  // Show a brief branded overlay when the user returns from a plan upgrade/payment
  useEffect(() => {
    if (sessionStorage.getItem('justUpgraded')) {
      sessionStorage.removeItem('justUpgraded');
      setUpgradeLoading(true);
      const t = setTimeout(() => setUpgradeLoading(false), 2200);
      return () => clearTimeout(t);
    }
  }, []);

  const confirmLogout = () => {
    logout();
    router.push('/');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <p className="text-sm text-gray-400">Loading...</p>
      </div>
    );
  }

  if (!isAuthenticated) return null;

  if (upgradeLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 gap-5">
        <div className="w-14 h-14 rounded-full bg-indigo-100 flex items-center justify-center">
          <svg className="w-7 h-7 text-indigo-500 animate-spin" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
          </svg>
        </div>
        <div className="text-center">
          <p className="text-base font-semibold text-gray-800">Activating your plan…</p>
          <p className="text-sm text-gray-400 mt-1">Setting up your dashboard, just a moment.</p>
        </div>
      </div>
    );
  }

  const navLinks = [
    { href: '/dashboard', label: 'My Events', icon: '📋' },
    { href: '/dashboard/events/new', label: 'New Event', icon: '➕' },
  ];

  const effectivePlan = user?.plan ?? 'free';

  const isPro = effectivePlan === 'pro';
  const isPerEvent = effectivePlan === 'per_event';
  const isFree = effectivePlan === 'free';

  const planLabel = isPro
    ? user?.subscription_interval === 'year' ? 'Pro — $199/yr' : 'Pro — $24.99/mo'
    : isPerEvent ? 'Pay Per Event — $9.99'
    : 'Free Plan — $0';
  const planBadgeClass = isPro
    ? 'bg-indigo-500 text-white'
    : isPerEvent
    ? 'bg-sky-600 text-white'
    : 'bg-gray-700 text-gray-300';

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar */}
      <aside className="w-64 min-h-screen bg-gray-900 text-white flex flex-col fixed left-0 top-0 z-10">
        <div className="p-6 border-b border-gray-700">
          <Link href="/" className="text-xl font-bold text-indigo-400">
            CeremoLink
          </Link>
          <p className="text-xs text-gray-400 mt-1 truncate">
            {user?.username}
          </p>
          <span className={`inline-block mt-2 text-xs font-semibold px-2 py-0.5 rounded-full ${planBadgeClass}`}>
            {planLabel}
          </span>
        </div>

        <nav className="flex-1 p-4 space-y-1">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition ${
                pathname === link.href
                  ? 'bg-indigo-600 text-white'
                  : 'text-gray-300 hover:bg-gray-800 hover:text-white'
              }`}
            >
              <span>{link.icon}</span>
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Contextual upgrade prompt */}
        {isFree && (
          <div className="mx-4 mb-4 p-3 bg-indigo-900 rounded-lg border border-indigo-700">
            <p className="text-xs text-indigo-200 font-medium mb-1">Unlock more events</p>
            <p className="text-xs text-indigo-400 mb-2">Pay per event ($9.99) or go Pro for unlimited events & PDF uploads.</p>
            <Link
              href="/pricing"
              className="block text-center text-xs font-semibold bg-indigo-500 text-white py-1.5 rounded-lg hover:bg-indigo-400 transition"
            >
              View Plans
            </Link>
          </div>
        )}
        {isPerEvent && (
          <div className="mx-4 mb-4 p-3 bg-sky-900 rounded-lg border border-sky-700">
            <p className="text-xs text-sky-200 font-medium mb-1">Want unlimited events?</p>
            <p className="text-xs text-sky-400 mb-2">Upgrade to Pro and never pay per event again.</p>
            <Link
              href="/pricing"
              className="block text-center text-xs font-semibold bg-sky-600 text-white py-1.5 rounded-lg hover:bg-sky-500 transition"
            >
              Upgrade to Pro
            </Link>
          </div>
        )}

        <div className="p-4 border-t border-gray-700 space-y-1">
          {user?.is_staff && (
            <Link
              href="/site-admin"
              className="flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm text-gray-300 hover:bg-gray-800 hover:text-white transition"
            >
              <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              Admin Panel
            </Link>
          )}
          <button
            onClick={() => setShowLogoutModal(true)}
            className="w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm text-gray-300 hover:bg-gray-800 hover:text-white transition"
          >
            <span>🚪</span>
            Logout
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 ml-64 p-8">{children}</main>

      {showLogoutModal && (
        <ConfirmModal
          title="Log Out"
          message="Are you sure you want to log out of your account?"
          confirmLabel="Log Out"
          onConfirm={confirmLogout}
          onCancel={() => setShowLogoutModal(false)}
        />
      )}
    </div>
  );
}
