'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/lib/auth';
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

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, loading, router]);

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
    ? 'bg-amber-500 text-white'
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
          <div className="mx-4 mb-4 p-3 bg-amber-900 rounded-lg border border-amber-700">
            <p className="text-xs text-amber-200 font-medium mb-1">Want unlimited events?</p>
            <p className="text-xs text-amber-400 mb-2">Upgrade to Pro and never pay per event again.</p>
            <Link
              href="/pricing"
              className="block text-center text-xs font-semibold bg-amber-500 text-white py-1.5 rounded-lg hover:bg-amber-400 transition"
            >
              Upgrade to Pro
            </Link>
          </div>
        )}

        <div className="p-4 border-t border-gray-700">
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
