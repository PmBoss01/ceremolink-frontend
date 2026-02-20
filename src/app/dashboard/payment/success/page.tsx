'use client';

import { useSearchParams, useRouter } from 'next/navigation';
import { Suspense, useEffect, useState } from 'react';
import { useAuth } from '@/lib/auth';
import api from '@/lib/api';

function SuccessContent() {
  const params = useSearchParams();
  const router = useRouter();
  const plan = params.get('plan');
  const sessionId = params.get('session_id');
  const isPro = plan === 'pro';
  const isPerEvent = plan === 'per_event';
  const eventId = params.get('event_id');
  const { refreshUser } = useAuth();
  const [syncing, setSyncing] = useState(isPro);
  const [countdown, setCountdown] = useState<number | null>(null);

  // Pro plan: confirm session then auto-redirect to dashboard
  useEffect(() => {
    if (!isPro) return;

    const activate = async () => {
      // Step 1: confirm payment directly via Stripe session — no webhook dependency
      if (sessionId) {
        try {
          await api.post('/payments/confirm-session/', { session_id: sessionId });
        } catch {
          // Already processed or failed — fall through to polling
        }
      }

      // Step 2: refresh auth context
      await refreshUser();

      // Step 3: check if plan is already pro
      const checkAndFinish = async (): Promise<boolean> => {
        try {
          const { data } = await api.get('/auth/me/');
          if (data.plan === 'pro') {
            await refreshUser();
            return true;
          }
        } catch {
          // ignore
        }
        return false;
      };

      if (await checkAndFinish()) {
        setSyncing(false);
        return;
      }

      // Step 4: poll up to 6 more times (every 1.5 s)
      let attempts = 0;
      const poll = async () => {
        if (await checkAndFinish()) {
          setSyncing(false);
          return;
        }
        attempts++;
        if (attempts < 6) {
          setTimeout(poll, 1500);
        } else {
          setSyncing(false); // Give up — let the user through anyway
        }
      };

      setTimeout(poll, 1500);
    };

    activate();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Once syncing finishes (Pro confirmed), start 3-second auto-redirect countdown
  useEffect(() => {
    if (syncing) return;
    setCountdown(3);
  }, [syncing]);

  useEffect(() => {
    if (countdown === null) return;
    if (countdown === 0) {
      router.push('/dashboard');
      return;
    }
    const t = setTimeout(() => setCountdown((c) => (c !== null ? c - 1 : null)), 1000);
    return () => clearTimeout(t);
  }, [countdown, router]);

  // Per-event upfront credit: also auto-redirect after brief pause
  useEffect(() => {
    if (!isPerEvent) return;
    const t = setTimeout(() => router.push('/dashboard'), 3000);
    return () => clearTimeout(t);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const heading = isPro
    ? 'Welcome to Pro!'
    : isPerEvent
    ? 'Payment Successful!'
    : 'Event Activated!';

  const body = isPro
    ? 'Your Pro subscription is now active. You have unlimited events and full access to all features.'
    : isPerEvent
    ? 'Your payment is confirmed. Your dashboard is ready — you can now create your event.'
    : 'Your event has been activated. You can now share the QR code with your guests.';

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-6">
      <div className="max-w-md w-full bg-white rounded-2xl border border-gray-200 shadow-sm p-10 text-center">

        {/* Icon */}
        <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6 ${syncing ? 'bg-indigo-50' : 'bg-green-100'}`}>
          {syncing ? (
            <svg className="w-7 h-7 text-indigo-400 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
            </svg>
          ) : (
            <svg className="w-8 h-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          )}
        </div>

        <h1 className="text-2xl font-bold text-gray-900 mb-2">{heading}</h1>

        {syncing ? (
          <p className="text-gray-400 text-sm mb-8 animate-pulse">Activating your Pro plan, please wait...</p>
        ) : (
          <>
            <p className="text-gray-500 text-sm mb-4">{body}</p>
            {countdown !== null && countdown > 0 && (
              <p className="text-xs text-indigo-400 mb-6">
                Redirecting to your dashboard in {countdown}s...
              </p>
            )}
            {(isPro || isPerEvent) && (
              <button
                onClick={() => router.push('/dashboard')}
                className="w-full py-3 bg-indigo-600 text-white text-sm font-semibold rounded-xl hover:bg-indigo-700 transition"
              >
                Go to Dashboard →
              </button>
            )}
            {eventId && !isPro && !isPerEvent && (
              <button
                onClick={() => router.push(`/dashboard/events/${eventId}`)}
                className="w-full py-3 bg-indigo-600 text-white text-sm font-semibold rounded-xl hover:bg-indigo-700 transition"
              >
                Go to Event →
              </button>
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default function PaymentSuccessPage() {
  return (
    <Suspense>
      <SuccessContent />
    </Suspense>
  );
}
