'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth';
import api from '@/lib/api';

const features = {
  free: [
    { text: '1 event', included: true },
    { text: 'Rich text event editor', included: true },
    { text: 'QR code generation', included: true },
    { text: 'View count analytics', included: true },
    { text: 'PDF upload', included: false },
    { text: 'Multiple events', included: false },
  ],
  perEvent: [
    { text: 'Single event activation', included: true },
    { text: 'Rich text event editor', included: true },
    { text: 'PDF upload', included: true },
    { text: 'QR code generation', included: true },
    { text: 'View count analytics', included: true },
    { text: 'Unlimited event updates', included: true },
  ],
  pro: [
    { text: 'Unlimited events', included: true },
    { text: 'Rich text event editor', included: true },
    { text: 'PDF upload on all events', included: true },
    { text: 'QR code generation', included: true },
    { text: 'View count analytics', included: true },
    { text: 'Priority support', included: true },
  ],
};

type PlanKey = 'free' | 'per_event' | 'pro' | 'pro_yearly';

export default function PricingPage() {
  const { user, refreshUser } = useAuth();
  const router = useRouter();
  const [billing, setBilling] = useState<'monthly' | 'yearly'>('monthly');
  const [loading, setLoading] = useState<PlanKey | null>(null);

  const proPrice = billing === 'yearly' ? '$199' : '$24.99';
  const proPeriod = billing === 'yearly' ? 'per year' : 'per month';
  const proSubtext = billing === 'yearly' ? '$16.58/mo · billed annually' : null;

  const handlePlanSelect = async (plan: PlanKey) => {
    if (user) {
      // Already logged in — act on the plan choice immediately
      setLoading(plan);
      try {
        if (plan === 'free') {
          router.push('/dashboard');
        } else if (plan === 'per_event') {
          await api.post('/auth/set-plan/', { plan: 'per_event' });
          await refreshUser(); // sync the in-memory user before navigating
          router.push('/dashboard');
        } else {
          const interval = plan === 'pro_yearly' ? 'year' : 'month';
          const { data } = await api.post('/payments/create-checkout-session/', {
            type: 'subscription',
            interval,
          });
          window.location.href = data.url;
        }
      } catch {
        setLoading(null);
      }
    } else {
      // Not logged in — save intent and send to register
      if (plan !== 'free') {
        sessionStorage.setItem('pendingPlan', plan);
      }
      router.push('/register');
    }
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Navbar */}
      <nav className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
        <Link href="/" className="text-xl font-bold text-indigo-600">
          CeremoLink
        </Link>
        <div className="flex items-center gap-3">
          {user ? (
            <Link
              href="/dashboard"
              className="px-4 py-2 text-sm bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium transition"
            >
              Dashboard
            </Link>
          ) : (
            <>
              <Link href="/login" className="px-4 py-2 text-sm text-gray-600 hover:text-indigo-600 font-medium transition">
                Login
              </Link>
              <Link href="/register" className="px-4 py-2 text-sm bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium transition">
                Get Started
              </Link>
            </>
          )}
        </div>
      </nav>

      {/* Header */}
      <section className="py-16 px-6 text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          Simple, Transparent Pricing
        </h1>
        <p className="text-lg text-gray-500 max-w-xl mx-auto mb-10">
          Start free, pay only when you grow. No hidden fees, no surprises.
        </p>

        {/* Billing toggle */}
        <div className="flex items-center justify-center gap-3">
          <span className={`text-sm font-medium transition-colors ${billing === 'monthly' ? 'text-gray-900' : 'text-gray-400'}`}>
            Monthly
          </span>
          <button
            onClick={() => setBilling(billing === 'monthly' ? 'yearly' : 'monthly')}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 focus:outline-none ${
              billing === 'yearly' ? 'bg-indigo-600' : 'bg-gray-300'
            }`}
            aria-label="Toggle billing period"
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform duration-200 ${
                billing === 'yearly' ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
          <span className={`text-sm font-medium transition-colors ${billing === 'yearly' ? 'text-gray-900' : 'text-gray-400'}`}>
            Yearly
          </span>
          {billing === 'yearly' && (
            <span className="text-xs bg-green-100 text-green-700 font-semibold px-2.5 py-1 rounded-full">
              Save 33%
            </span>
          )}
          {billing === 'monthly' && (
            <span className="text-xs text-gray-400 font-medium">
              Switch to yearly and save 33%
            </span>
          )}
        </div>
      </section>

      {/* Plans */}
      <section className="px-6 pb-20">
        <div className="max-w-5xl mx-auto grid md:grid-cols-3 gap-8 items-start">

          {/* Free */}
          <div className="rounded-2xl p-8 bg-white border border-gray-200 shadow-sm transition-all duration-200 cursor-default hover:shadow-lg hover:-translate-y-1 hover:border-indigo-300">
            <p className="text-sm font-semibold uppercase tracking-wide mb-2 text-gray-500">Free</p>
            <p className="text-4xl font-bold mb-1 text-gray-900">$0</p>
            <p className="text-sm mb-1 text-gray-400">forever</p>
            <p className="text-sm mb-8 text-gray-500">Try CeremoLink at no cost.</p>
            <ul className="space-y-3 mb-8">
              {features.free.map((f) => (
                <li key={f.text} className="flex items-center gap-2.5 text-sm">
                  <span className={f.included ? 'text-green-500' : 'text-gray-300'}>{f.included ? '✓' : '✗'}</span>
                  <span className={f.included ? 'text-gray-700' : 'text-gray-400 line-through'}>{f.text}</span>
                </li>
              ))}
            </ul>
            <button
              onClick={() => handlePlanSelect('free')}
              disabled={loading !== null}
              className="w-full py-3 rounded-xl text-sm font-semibold transition border border-gray-300 text-gray-700 hover:bg-gray-50 disabled:opacity-60"
            >
              {loading === 'free' ? 'Redirecting...' : 'Get Started Free'}
            </button>
          </div>

          {/* Pay Per Event */}
          <div className="rounded-2xl p-8 bg-white border border-gray-200 shadow-sm transition-all duration-200 cursor-default hover:shadow-lg hover:-translate-y-1 hover:border-indigo-300">
            <p className="text-sm font-semibold uppercase tracking-wide mb-2 text-gray-500">Pay Per Event</p>
            <p className="text-4xl font-bold mb-1 text-gray-900">$9.99</p>
            <p className="text-sm mb-1 text-gray-400">per event, one-time</p>
            <p className="text-sm mb-8 text-gray-500">Perfect for occasional organizers.</p>
            <ul className="space-y-3 mb-8">
              {features.perEvent.map((f) => (
                <li key={f.text} className="flex items-center gap-2.5 text-sm">
                  <span className={f.included ? 'text-green-500' : 'text-gray-300'}>{f.included ? '✓' : '✗'}</span>
                  <span className={f.included ? 'text-gray-700' : 'text-gray-400 line-through'}>{f.text}</span>
                </li>
              ))}
            </ul>
            <button
              onClick={() => handlePlanSelect('per_event')}
              disabled={loading !== null}
              className="w-full py-3 rounded-xl text-sm font-semibold transition border border-indigo-500 text-indigo-600 hover:bg-indigo-50 disabled:opacity-60"
            >
              {loading === 'per_event' ? 'Setting up...' : 'Pay Per Event'}
            </button>
          </div>

          {/* Pro */}
          <div className="rounded-2xl p-8 bg-indigo-600 shadow-xl transition-all duration-200 cursor-default hover:shadow-2xl hover:-translate-y-1">
            <div className="flex items-center justify-between mb-4">
              <span className="inline-block text-xs bg-white text-indigo-700 font-semibold px-2.5 py-0.5 rounded-full">
                Most Popular
              </span>
              {billing === 'yearly' && (
                <span className="inline-block text-xs bg-green-400 text-green-900 font-semibold px-2.5 py-0.5 rounded-full">
                  Best Value
                </span>
              )}
            </div>
            <p className="text-sm font-semibold uppercase tracking-wide mb-2 text-indigo-200">Pro</p>
            <p className="text-4xl font-bold mb-1 text-white">{proPrice}</p>
            <p className="text-sm mb-1 text-indigo-300">{proPeriod}</p>
            {proSubtext && (
              <p className="text-xs mb-3 text-indigo-400">{proSubtext}</p>
            )}
            <p className="text-sm mb-8 text-indigo-200">For frequent event organizers.</p>
            <ul className="space-y-3 mb-8">
              {features.pro.map((f) => (
                <li key={f.text} className="flex items-center gap-2.5 text-sm">
                  <span className="text-indigo-300">✓</span>
                  <span className="text-indigo-100">{f.text}</span>
                </li>
              ))}
            </ul>
            <button
              onClick={() => handlePlanSelect(billing === 'yearly' ? 'pro_yearly' : 'pro')}
              disabled={loading !== null}
              className="w-full py-3 rounded-xl text-sm font-semibold transition bg-white text-indigo-700 hover:bg-indigo-50 disabled:opacity-60"
            >
              {loading === 'pro' || loading === 'pro_yearly'
                ? 'Redirecting to checkout...'
                : billing === 'yearly' ? 'Start Pro — Best Value' : 'Start Pro'}
            </button>
          </div>

        </div>
      </section>

      {/* FAQ */}
      <section className="py-16 px-6 bg-gray-50">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-2xl font-bold text-gray-900 mb-8 text-center">
            Frequently Asked Questions
          </h2>
          <div className="space-y-6">
            {[
              {
                q: 'Can I cancel my Pro subscription anytime?',
                a: 'Yes. You can cancel at any time from your billing portal. Your subscription stays active until the end of the billing period.',
              },
              {
                q: 'What happens to my events if I cancel Pro?',
                a: 'Your events remain visible until the end of your billing period. After that, new events are limited to the free plan. Existing paid events are not affected.',
              },
              {
                q: 'Does Pay Per Event have an expiry date?',
                a: 'No. A per-event payment activates that event permanently — no expiry.',
              },
              {
                q: 'Can I upgrade from Pay Per Event to Pro?',
                a: 'Yes. You can subscribe to Pro at any time from your dashboard. Pro automatically activates all your existing events.',
              },
              {
                q: 'Can I switch between monthly and yearly billing?',
                a: 'Yes. You can switch to yearly billing at any time from your billing portal to lock in the discounted rate.',
              },
            ].map((item) => (
              <div key={item.q} className="bg-white rounded-xl border border-gray-200 p-6">
                <p className="font-semibold text-gray-900 mb-2">{item.q}</p>
                <p className="text-sm text-gray-500">{item.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 text-center text-sm text-gray-400 border-t border-gray-100">
        © 2025 CeremoLink by IndoorTech. All rights reserved.
      </footer>
    </div>
  );
}
