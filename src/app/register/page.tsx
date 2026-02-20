'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/lib/auth';
import api from '@/lib/api';
import { AxiosError } from 'axios';
import GoogleButton from '@/components/GoogleButton';

export default function RegisterPage() {
  const { login, loginWithTokens, refreshUser } = useAuth();
  const router = useRouter();
  const [form, setForm] = useState({ username: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  // After auth succeeds, check sessionStorage for a pending plan and route accordingly
  const handlePostAuth = async () => {
    const pendingPlan = sessionStorage.getItem('pendingPlan');
    sessionStorage.removeItem('pendingPlan');

    if (pendingPlan === 'pro' || pendingPlan === 'pro_yearly') {
      // Immediately start the subscription checkout
      const interval = pendingPlan === 'pro_yearly' ? 'year' : 'month';
      const { data } = await api.post('/payments/create-checkout-session/', { type: 'subscription', interval });
      window.location.href = data.url;
    } else if (pendingPlan === 'per_event') {
      // Mark the account as per_event plan then go straight to the dashboard.
      // Payment happens later when the user chooses to publish a specific event.
      await api.post('/auth/set-plan/', { plan: 'per_event' });
      await refreshUser(); // sync the in-memory user before navigating
      sessionStorage.setItem('justLoggedIn', '1');
      router.push('/dashboard');
    } else {
      sessionStorage.setItem('justLoggedIn', '1');
      router.push('/dashboard');
    }
  };

  const handleSubmit = async (e: { preventDefault: () => void }) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await api.post('/auth/register/', form);
      await login(form.username, form.password);
      await handlePostAuth();
    } catch (err) {
      const axiosErr = err as AxiosError<Record<string, string[]>>;
      const data = axiosErr.response?.data;
      if (data) {
        const messages = Object.values(data).flat();
        setError(messages[0] ?? 'Registration failed.');
      } else {
        setError('Registration failed. Please try again.');
      }
      setLoading(false);
    }
  };

  const handleGoogleSuccess = async (accessToken: string) => {
    setError('');
    setGoogleLoading(true);

    const attemptLogin = async () => {
      const { data } = await api.post('/auth/google/', { access_token: accessToken });
      await loginWithTokens(data.access, data.refresh);
    };

    try {
      await attemptLogin();
    } catch {
      try {
        await new Promise((r) => setTimeout(r, 600));
        await attemptLogin();
      } catch {
        setError('Google sign-up failed. Please try again.');
        setGoogleLoading(false);
        return;
      }
    }

    try {
      await handlePostAuth();
    } catch {
      setError('Google sign-up failed. Please try again.');
      setGoogleLoading(false);
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
            Create your account
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            Start managing your events digitally
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
          {error && (
            <div className="mb-4 p-3 bg-red-50 text-red-600 text-sm rounded-lg border border-red-200">
              {error}
            </div>
          )}

          {/* Google Sign-Up */}
          <div className="mb-6">
            <GoogleButton
              label="Sign up with Google"
              onSuccess={handleGoogleSuccess}
              onError={() => setError('Google sign-up failed. Please try again.')}
              disabled={googleLoading || loading}
            />
          </div>

          {/* Divider */}
          <div className="flex items-center gap-3 mb-6">
            <hr className="flex-1 border-gray-200" />
            <span className="text-xs text-gray-400">or register with email</span>
            <hr className="flex-1 border-gray-200" />
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-normal text-gray-700 mb-1">
                Username
              </label>
              <input
                type="text"
                required
                value={form.username}
                onChange={(e) => setForm({ ...form, username: e.target.value })}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="Choose a username"
              />
            </div>
            <div>
              <label className="block text-sm font-normal text-gray-700 mb-1">
                Email
              </label>
              <input
                type="email"
                required
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="Enter your email"
              />
            </div>
            <div>
              <label className="block text-sm font-normal text-gray-700 mb-1">
                Password
              </label>
              <input
                type="password"
                required
                minLength={8}
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="At least 8 characters"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 disabled:opacity-50 transition text-sm"
            >
              {loading ? 'Creating account...' : 'Create Account'}
            </button>
          </form>
        </div>

        <p className="text-center text-sm text-gray-500 mt-4">
          Already have an account?{' '}
          <Link
            href="/login"
            className="text-indigo-600 font-medium hover:underline"
          >
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
