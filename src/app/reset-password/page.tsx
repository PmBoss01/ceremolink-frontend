'use client';

import { useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import api from '@/lib/api';

function ResetPasswordForm() {
  const params = useSearchParams();
  const router = useRouter();
  const uid = params.get('uid') ?? '';
  const token = params.get('token') ?? '';

  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e: { preventDefault: () => void }) => {
    e.preventDefault();
    setError('');

    if (password.length < 8) {
      setError('Password must be at least 8 characters.');
      return;
    }
    if (password !== confirm) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);
    try {
      await api.post('/auth/reset-password/', { uid, token, password });
      setDone(true);
      setTimeout(() => router.push('/login'), 3000);
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { error?: string } } })?.response?.data?.error ??
        'Something went wrong. Please try again.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  if (!uid || !token) {
    return (
      <div className="text-center py-4">
        <p className="text-sm text-red-600 font-medium">Invalid reset link.</p>
        <Link href="/forgot-password" className="text-sm text-indigo-600 hover:underline mt-2 inline-block">
          Request a new one →
        </Link>
      </div>
    );
  }

  return (
    <>
      {done ? (
        <div className="text-center py-4">
          <div className="w-14 h-14 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
            <svg className="w-7 h-7 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h3 className="text-base font-semibold text-gray-900 mb-2">Password updated!</h3>
          <p className="text-sm text-gray-500">Redirecting you to sign in…</p>
        </div>
      ) : (
        <>
          {error && (
            <div className="mb-4 p-3 bg-red-50 text-red-600 text-sm rounded-lg border border-red-200">
              {error}
              {error.includes('expired') && (
                <Link href="/forgot-password" className="block mt-1 font-medium underline hover:text-red-700">
                  Request a new reset link →
                </Link>
              )}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-normal text-gray-700 mb-1">
                New password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent pr-10"
                  placeholder="At least 8 characters"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((s) => !s)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? (
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                    </svg>
                  ) : (
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.477 0 8.268 2.943 9.542 7-1.274 4.057-5.065 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-normal text-gray-700 mb-1">
                Confirm new password
              </label>
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                placeholder="Repeat your new password"
              />
            </div>

            {/* Strength indicator */}
            {password.length > 0 && (
              <div className="flex gap-1">
                {[...Array(4)].map((_, i) => {
                  const strength = Math.min(
                    Math.floor(password.length / 3) +
                    (password.length >= 8 ? 1 : 0),
                    4
                  );
                  return (
                    <div
                      key={i}
                      className={`h-1 flex-1 rounded-full transition-colors ${
                        i < strength
                          ? strength <= 1 ? 'bg-red-400'
                          : strength <= 2 ? 'bg-amber-400'
                          : strength <= 3 ? 'bg-blue-400'
                          : 'bg-green-400'
                          : 'bg-gray-200'
                      }`}
                    />
                  );
                })}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 disabled:opacity-50 transition text-sm"
            >
              {loading ? 'Updating…' : 'Set new password'}
            </button>
          </form>
        </>
      )}
    </>
  );
}

export default function ResetPasswordPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="w-full max-w-md">

        <div className="text-center mb-8">
          <Link href="/" className="text-2xl font-bold text-indigo-600">
            CeremoLink
          </Link>
          <h2 className="text-xl font-semibold text-gray-900 mt-2">
            Set a new password
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            Choose a strong password for your account.
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
          <Suspense fallback={<p className="text-sm text-gray-400 text-center">Loading…</p>}>
            <ResetPasswordForm />
          </Suspense>
        </div>

        <p className="text-center text-sm text-gray-500 mt-4">
          <Link href="/login" className="text-indigo-600 font-medium hover:underline">
            ← Back to sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
