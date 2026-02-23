'use client';

import { useState } from 'react';
import Link from 'next/link';
import api from '@/lib/api';
import { AxiosError } from 'axios';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: { preventDefault: () => void }) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await api.post('/auth/forgot-password/', { email });
      setSent(true);
    } catch (err) {
      const axiosErr = err as AxiosError<{ error?: string }>;
      const msg = axiosErr.response?.data?.error;
      setError(msg ?? 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="w-full max-w-md">

        <div className="text-center mb-8">
          <Link href="/" className="text-2xl font-bold text-indigo-600">
            CeremoLink
          </Link>
          <h2 className="text-xl font-semibold text-gray-900 mt-2">
            Forgot your password?
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            Enter your email and we&apos;ll send you a reset link.
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
          {sent ? (
            <div className="text-center py-4">
              <div className="w-14 h-14 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
                <svg className="w-7 h-7 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="text-base font-semibold text-gray-900 mb-2">Check your inbox</h3>
              <p className="text-sm text-gray-500 leading-relaxed">
                A password reset link has been sent to <strong>{email}</strong>.
                The link expires in 3 days.
              </p>
              <p className="text-xs text-gray-400 mt-3">
                Didn&apos;t receive it? Check your spam folder.
              </p>
            </div>
          ) : (
            <>
              {error && (
                <div className="mb-4 p-3 bg-red-50 text-red-600 text-sm rounded-lg border border-red-200">
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-normal text-gray-700 mb-1">
                    Email address
                  </label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    placeholder="you@example.com"
                  />
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-2.5 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 disabled:opacity-50 transition text-sm"
                >
                  {loading ? 'Sending…' : 'Send reset link'}
                </button>
              </form>
            </>
          )}
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
