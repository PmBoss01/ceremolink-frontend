'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function LandingPage() {
  const [billing, setBilling] = useState<'monthly' | 'yearly'>('monthly');

  const proPrice = billing === 'yearly' ? '$199' : '$24.99';
  const proPeriod = billing === 'yearly' ? 'per year' : 'per month';
  const proSubtext = billing === 'yearly' ? '$16.58/mo · billed annually' : null;

  return (
    <div className="min-h-screen bg-white">
      {/* Navbar */}
      <nav className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
        <div>
          <span className="text-xl font-bold text-indigo-600">CeremoLink</span>
          <span className="text-xs text-gray-400 ml-2">by IndoorTech</span>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/pricing"
            className="px-4 py-2 text-sm text-gray-600 hover:text-indigo-600 font-medium transition"
          >
            Pricing
          </Link>
          <Link
            href="/login"
            className="px-4 py-2 text-sm text-gray-600 hover:text-indigo-600 font-medium transition"
          >
            Login
          </Link>
          <Link
            href="/register"
            className="px-4 py-2 text-sm bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium transition"
          >
            Get Started
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="bg-gradient-to-br from-indigo-900 via-indigo-800 to-indigo-700 text-white py-24 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-5xl font-bold leading-tight mb-6">
            Modern Digital Programs
            <br />
            for Every Ceremony
          </h1>
          <p className="text-xl text-indigo-200 mb-10 max-w-2xl mx-auto">
            Say goodbye to expensive printed programs. Create a beautiful
            digital event program, generate a QR code, and let guests scan and
            read instantly.
          </p>
          <div className="flex gap-4 justify-center flex-wrap">
            <Link
              href="/register"
              className="px-8 py-3 bg-white text-indigo-700 font-semibold rounded-xl hover:bg-indigo-50 transition"
            >
              Create Your Event
            </Link>
            <Link
              href="/login"
              className="px-8 py-3 border border-indigo-300 text-white font-semibold rounded-xl hover:bg-indigo-800 transition"
            >
              Sign In
            </Link>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 px-6 bg-gray-50">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
            Everything You Need
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: '📱',
                title: 'Mobile-First',
                desc: 'Guests scan and read on any phone. No app download needed.',
              },
              {
                icon: '🔳',
                title: 'Instant QR Code',
                desc: 'Get a unique QR code for each event. Print it or share digitally.',
              },
              {
                icon: '📊',
                title: 'View Analytics',
                desc: 'See how many guests scanned and viewed your event program.',
              },
            ].map((f) => (
              <div
                key={f.title}
                className="bg-white rounded-2xl p-8 border border-gray-200 shadow-sm text-center"
              >
                <div className="text-4xl mb-4">{f.icon}</div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {f.title}
                </h3>
                <p className="text-gray-500 text-sm">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-20 px-6">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
            How It Works
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                step: '1',
                title: 'Create Your Event',
                desc: 'Add your event details, upload a PDF, or write your program using our editor.',
              },
              {
                step: '2',
                title: 'Pay & Publish',
                desc: 'Choose a plan and publish your event to make it live and accessible.',
              },
              {
                step: '3',
                title: 'Share the QR Code',
                desc: 'Print your unique QR code on banners, cards, or share it digitally.',
              },
            ].map((s) => (
              <div key={s.step} className="text-center">
                <div className="w-12 h-12 bg-indigo-600 text-white rounded-full flex items-center justify-center text-xl font-bold mx-auto mb-4">
                  {s.step}
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">{s.title}</h3>
                <p className="text-sm text-gray-500">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing preview */}
      <section className="py-20 px-6 bg-gray-50">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Simple, Transparent Pricing
          </h2>
          <p className="text-gray-500 mb-8">
            Start free. Pay only when you need more.
          </p>

          {/* Billing toggle */}
          <div className="flex items-center justify-center gap-3 mb-12">
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
            {billing === 'yearly' ? (
              <span className="text-xs bg-green-100 text-green-700 font-semibold px-2.5 py-1 rounded-full">
                Save 33%
              </span>
            ) : (
              <span className="text-xs text-gray-400 font-medium">
                Switch to yearly and save 33%
              </span>
            )}
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {/* Free */}
            <div className="bg-white rounded-2xl border border-gray-200 p-8 text-left shadow-sm transition-all duration-200 hover:-translate-y-1 hover:shadow-lg hover:border-indigo-300">
              <p className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-2">Free</p>
              <p className="text-4xl font-bold text-gray-900 mb-1">$0</p>
              <p className="text-sm text-gray-400 mb-6">Forever</p>
              <ul className="space-y-2 text-sm text-gray-600 mb-8">
                <li className="flex items-center gap-2"><span className="text-green-500">✓</span> 1 event</li>
                <li className="flex items-center gap-2"><span className="text-green-500">✓</span> Rich text editor</li>
                <li className="flex items-center gap-2"><span className="text-green-500">✓</span> QR code generation</li>
                <li className="flex items-center gap-2"><span className="text-gray-300">✗</span> PDF upload</li>
              </ul>
              <Link href="/register" className="block text-center py-2.5 border border-gray-300 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50 transition">
                Get Started
              </Link>
            </div>
            {/* Per Event */}
            <div className="bg-white rounded-2xl border border-gray-200 p-8 text-left shadow-sm transition-all duration-200 hover:-translate-y-1 hover:shadow-lg hover:border-indigo-300">
              <p className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-2">Pay Per Event</p>
              <p className="text-4xl font-bold text-gray-900 mb-1">$9.99</p>
              <p className="text-sm text-gray-400 mb-6">Per event, one-time</p>
              <ul className="space-y-2 text-sm text-gray-600 mb-8">
                <li className="flex items-center gap-2"><span className="text-green-500">✓</span> Single event activation</li>
                <li className="flex items-center gap-2"><span className="text-green-500">✓</span> PDF upload</li>
                <li className="flex items-center gap-2"><span className="text-green-500">✓</span> QR code & analytics</li>
                <li className="flex items-center gap-2"><span className="text-green-500">✓</span> Unlimited updates</li>
              </ul>
              <Link
                href="/register"
                onClick={() => sessionStorage.setItem('pendingPlan', 'per_event')}
                className="block text-center py-2.5 border border-indigo-500 text-indigo-600 rounded-lg text-sm font-medium hover:bg-indigo-50 transition"
              >
                Pay Per Event
              </Link>
            </div>
            {/* Pro */}
            <div className="bg-indigo-600 rounded-2xl p-8 text-left shadow-lg relative transition-all duration-200 hover:-translate-y-1 hover:shadow-2xl">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs bg-white text-indigo-700 font-semibold px-2 py-0.5 rounded-full">Popular</span>
                {billing === 'yearly' && (
                  <span className="text-xs bg-green-400 text-green-900 font-semibold px-2 py-0.5 rounded-full">Best Value</span>
                )}
              </div>
              <p className="text-sm font-semibold text-indigo-200 uppercase tracking-wide mb-2">Pro</p>
              <p className="text-4xl font-bold text-white mb-1">{proPrice}</p>
              <p className="text-sm text-indigo-300 mb-1">{proPeriod}</p>
              {proSubtext && (
                <p className="text-xs text-indigo-400 mb-5">{proSubtext}</p>
              )}
              <ul className={`space-y-2 text-sm text-indigo-100 mb-8 ${!proSubtext ? 'mt-5' : ''}`}>
                <li className="flex items-center gap-2"><span className="text-indigo-300">✓</span> Unlimited events</li>
                <li className="flex items-center gap-2"><span className="text-indigo-300">✓</span> PDF upload on all events</li>
                <li className="flex items-center gap-2"><span className="text-indigo-300">✓</span> QR code & analytics</li>
                <li className="flex items-center gap-2"><span className="text-indigo-300">✓</span> Priority support</li>
              </ul>
              <Link
                href="/register"
                onClick={() => sessionStorage.setItem('pendingPlan', billing === 'yearly' ? 'pro_yearly' : 'pro')}
                className="block text-center py-2.5 bg-white text-indigo-700 rounded-lg text-sm font-semibold hover:bg-indigo-50 transition"
              >
                {billing === 'yearly' ? 'Start Pro — Best Value' : 'Start Pro'}
              </Link>
            </div>
          </div>
          <p className="mt-8 text-sm text-gray-400">
            <Link href="/pricing" className="text-indigo-500 hover:underline">See full pricing details →</Link>
          </p>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-indigo-600 text-center px-6">
        <h2 className="text-3xl font-bold text-white mb-4">
          Ready to Go Paperless?
        </h2>
        <p className="text-indigo-200 mb-8">
          Join event organizers who are saving money and delighting guests.
        </p>
        <Link
          href="/register"
          className="px-8 py-3 bg-white text-indigo-700 font-semibold rounded-xl hover:bg-indigo-50 transition"
        >
          Create Your First Event
        </Link>
      </section>

      {/* Contact */}
      <section className="py-16 px-6 bg-white">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Get in Touch</h2>
          <p className="text-gray-500 text-sm mb-10">
            Have a question or need help? Reach us by phone, WhatsApp, or email — we&apos;re happy to assist.
          </p>
          <div className="grid sm:grid-cols-3 gap-6">
            {/* Phone */}
            <a
              href="tel:+233555710390"
              className="group flex flex-col items-center gap-3 p-6 rounded-2xl border border-gray-200 hover:border-indigo-300 hover:shadow-md transition"
            >
              <div className="w-12 h-12 bg-indigo-50 group-hover:bg-indigo-100 rounded-full flex items-center justify-center transition">
                <svg className="w-5 h-5 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
              </div>
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-0.5">Call Us</p>
                <p className="text-sm font-medium text-gray-900">+233 555710390</p>
              </div>
            </a>

            {/* WhatsApp */}
            <a
              href="https://wa.me/233555710390"
              target="_blank"
              rel="noopener noreferrer"
              className="group flex flex-col items-center gap-3 p-6 rounded-2xl border border-gray-200 hover:border-green-300 hover:shadow-md transition"
            >
              <div className="w-12 h-12 bg-green-50 group-hover:bg-green-100 rounded-full flex items-center justify-center transition">
                <svg className="w-5 h-5 text-green-600" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                </svg>
              </div>
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-0.5">WhatsApp</p>
                <p className="text-sm font-medium text-gray-900">+233 555710390</p>
              </div>
            </a>

            {/* Email */}
            <a
              href="mailto:indoortech001@gmail.com"
              className="group flex flex-col items-center gap-3 p-6 rounded-2xl border border-gray-200 hover:border-indigo-300 hover:shadow-md transition"
            >
              <div className="w-12 h-12 bg-indigo-50 group-hover:bg-indigo-100 rounded-full flex items-center justify-center transition">
                <svg className="w-5 h-5 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-0.5">Email Us</p>
                <p className="text-sm font-medium text-gray-900">indoortech001@gmail.com</p>
              </div>
            </a>
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
