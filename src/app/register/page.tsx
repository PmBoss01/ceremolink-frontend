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
  const [confirm, setConfirm] = useState('');
  const [showPassword, setShowPassword] = useState(false);
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

    if (form.password !== confirm) {
      setError('Passwords do not match.');
      return;
    }

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

  // Eye icon helpers (same as reset-password page)
  const EyeOff = () => (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
    </svg>
  );
  const EyeOn = () => (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.477 0 8.268 2.943 9.542 7-1.274 4.057-5.065 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
    </svg>
  );

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
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
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
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="Enter your email"
              />
            </div>
            <div>
              <label className="block text-sm font-normal text-gray-700 mb-1">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  minLength={8}
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 pr-10"
                  placeholder="At least 8 characters"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((s) => !s)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff /> : <EyeOn />}
                </button>
              </div>
              {/* Strength indicator */}
              {form.password.length > 0 && (
                <div className="flex gap-1 mt-2">
                  {[...Array(4)].map((_, i) => {
                    const strength = Math.min(
                      Math.floor(form.password.length / 3) +
                      (form.password.length >= 8 ? 1 : 0),
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
            </div>
            <div>
              <label className="block text-sm font-normal text-gray-700 mb-1">
                Confirm password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 pr-10"
                  placeholder="Repeat your password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((s) => !s)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff /> : <EyeOn />}
                </button>
              </div>
              {confirm.length > 0 && form.password !== confirm && (
                <p className="text-xs text-red-500 mt-1">Passwords do not match.</p>
              )}
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
