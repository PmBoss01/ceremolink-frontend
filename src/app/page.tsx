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

      {/* ── Navbar ── */}
      <nav className="flex items-center justify-between px-6 py-4 border-b border-gray-100 sticky top-0 bg-white/90 backdrop-blur z-50">
        <div>
          <span className="text-xl font-bold text-indigo-600">CeremoLink</span>
          <span className="text-xs text-gray-400 ml-2">by IndoorTech</span>
        </div>
        <div className="flex items-center gap-1 sm:gap-3">
          <button
            onClick={() => document.getElementById('pricing')?.scrollIntoView({ behavior: 'smooth', block: 'start' })}
            className="px-3 py-2 text-sm text-gray-600 hover:text-indigo-600 font-medium transition hidden sm:block"
          >
            Pricing
          </button>
          <button
            onClick={() => document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth', block: 'start' })}
            className="px-3 py-2 text-sm text-gray-600 hover:text-indigo-600 font-medium transition hidden sm:block"
          >
            Contact Us
          </button>
          <Link href="/login" className="px-3 py-2 text-sm text-gray-600 hover:text-indigo-600 font-medium transition">
            Login
          </Link>
          <Link href="/register" className="px-4 py-2 text-sm bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium transition">
            Get Started
          </Link>
        </div>
      </nav>

      {/* ── Hero ── */}
      <section className="relative overflow-hidden bg-gradient-to-br from-indigo-950 via-indigo-900 to-indigo-800 text-white">
        {/* Subtle grid overlay */}
        <div className="absolute inset-0 opacity-10" style={{
          backgroundImage: 'linear-gradient(rgba(255,255,255,.15) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.15) 1px,transparent 1px)',
          backgroundSize: '40px 40px',
        }} />

        <div className="relative max-w-6xl mx-auto px-6 py-20 lg:py-28 flex flex-col lg:flex-row items-center gap-14">

          {/* Left: copy */}
          <div className="flex-1 text-center lg:text-left">
            <span className="inline-block bg-indigo-700 border border-indigo-600 text-indigo-200 text-xs font-semibold px-3 py-1 rounded-full mb-5">
              No printing. No hassle.
            </span>
            <h1 className="text-4xl sm:text-5xl font-bold leading-tight mb-5">
              Digital Event Programs
              <br />
              <span className="text-indigo-300">Guests Scan with a QR Code</span>
            </h1>
            <p className="text-lg text-indigo-200 mb-8 max-w-lg mx-auto lg:mx-0 leading-relaxed">
              Create a beautiful program for weddings, memorials, graduations, and more.
              Share it via QR code — guests open it instantly on any phone.
            </p>
            <div className="flex gap-4 justify-center lg:justify-start flex-wrap">
              <Link href="/register" className="px-7 py-3 bg-white text-indigo-700 font-semibold rounded-xl hover:bg-indigo-50 transition shadow-lg shadow-indigo-900/30">
                Create Your Event — Free
              </Link>
              <Link href="/pricing" className="px-7 py-3 border border-indigo-500 text-indigo-200 font-semibold rounded-xl hover:bg-indigo-800 transition">
                View Pricing
              </Link>
            </div>
            <p className="text-xs text-indigo-400 mt-4">No credit card required · 1 free event included</p>
          </div>

          {/* Right: mock event card (browser-chrome style) */}
          <div className="flex-shrink-0 w-full max-w-sm lg:max-w-xs">
            <div className="bg-white rounded-2xl overflow-hidden shadow-2xl shadow-indigo-900/50 ring-1 ring-white/10">
              {/* Browser bar */}
              <div className="bg-gray-100 px-3 py-2 flex items-center gap-2 border-b border-gray-200">
                <div className="flex gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-red-400" />
                  <div className="w-2.5 h-2.5 rounded-full bg-yellow-400" />
                  <div className="w-2.5 h-2.5 rounded-full bg-green-400" />
                </div>
                <div className="flex-1 bg-white rounded text-xs text-gray-400 px-2 py-0.5 text-center truncate">
                  ceremolink.app/event/…
                </div>
              </div>

              {/* Cover image mock */}
              <div className="h-24 bg-gradient-to-br from-violet-500 via-indigo-500 to-blue-400 flex items-center justify-center relative">
                <svg className="w-8 h-8 text-white/50" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
              </div>

              {/* Event details */}
              <div className="px-4 py-4">
                <h3 className="text-base font-bold text-gray-900 leading-snug mb-1">
                  Memorial Service for John Doe
                </h3>
                <div className="flex items-center gap-1.5 text-xs text-gray-500 mb-3">
                  <svg className="w-3.5 h-3.5 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                    <rect x="3" y="4" width="18" height="18" rx="2" />
                    <path strokeLinecap="round" d="M16 2v4M8 2v4M3 10h18" />
                  </svg>
                  Saturday, March 15, 2025 · 10:00 AM
                </div>

                {/* Meta row */}
                <div className="flex items-center justify-between border-t border-gray-100 pt-3 mb-3">
                  <div className="flex items-center gap-1 text-xs text-gray-400">
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0zM2.458 12C3.732 7.943 7.523 5 12 5c4.477 0 8.268 2.943 9.542 7-1.274 4.057-5.065 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                    142 views
                  </div>
                  <div className="text-xs text-indigo-600 font-medium flex items-center gap-1">
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                    </svg>
                    Share
                  </div>
                </div>

                {/* Content lines mock */}
                <div className="space-y-1.5">
                  <div className="h-2 bg-gray-100 rounded-full w-full" />
                  <div className="h-2 bg-gray-100 rounded-full w-5/6" />
                  <div className="h-2 bg-gray-100 rounded-full w-4/5" />
                  <div className="h-2 bg-gray-100 rounded-full w-full" />
                  <div className="h-2 bg-gray-100 rounded-full w-3/4" />
                </div>

                <div className="mt-3 pt-3 border-t border-gray-100 text-center text-xs text-gray-400">
                  Powered by <span className="text-indigo-500 font-medium">CeremoLink</span>
                </div>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* ── Perfect for ── */}
      <section className="py-16 px-6 bg-white border-b border-gray-100">
        <div className="max-w-4xl mx-auto">
          <p className="text-center text-xs font-semibold text-gray-400 uppercase tracking-widest mb-8">
            Perfect for every ceremony
          </p>
          <div className="grid grid-cols-3 sm:grid-cols-6 gap-6 text-center">
            {[
              { label: 'Weddings', icon: '💍' },
              { label: 'Memorials', icon: '🕊️' },
              { label: 'Graduations', icon: '🎓' },
              { label: 'Corporate', icon: '🏢' },
              { label: 'Religious', icon: '⛪' },
              { label: 'Birthdays', icon: '🎂' },
            ].map(({ label, icon }) => (
              <div key={label} className="flex flex-col items-center gap-2">
                <div className="w-12 h-12 rounded-xl bg-indigo-50 flex items-center justify-center text-2xl">
                  {icon}
                </div>
                <span className="text-xs font-medium text-gray-600">{label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Features ── */}
      <section className="py-20 px-6 bg-gray-50">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-3xl font-bold text-gray-900 mb-3">Everything you need</h2>
            <p className="text-gray-500 max-w-xl mx-auto">
              A complete platform for creating, publishing, and sharing digital event programs.
            </p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                title: 'Rich Text Editor',
                desc: 'Write your program with headings, images, tables, and custom formatting — no design skills needed.',
                icon: (
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                ),
              },
              {
                title: 'PDF Upload',
                desc: 'Already have a designed program? Upload your PDF directly — guests view it in-browser.',
                icon: (
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                  </svg>
                ),
              },
              {
                title: 'Instant QR Code',
                desc: 'Get a unique QR code per event. Print it on banners, programs, or share it digitally.',
                icon: (
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
                  </svg>
                ),
              },
              {
                title: 'Cover Images',
                desc: 'Upload a beautiful cover photo or design — shown full-width on the public event page.',
                icon: (
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                ),
              },
              {
                title: 'View Analytics',
                desc: 'See exactly how many guests opened your program. Track engagement in real time.',
                icon: (
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0zM2.458 12C3.732 7.943 7.523 5 12 5c4.477 0 8.268 2.943 9.542 7-1.274 4.057-5.065 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                ),
              },
              {
                title: 'Works on Any Device',
                desc: "No app required. Guests open the link on any phone, tablet, or computer — it just works.",
                icon: (
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
                  </svg>
                ),
              },
            ].map((f) => (
              <div key={f.title} className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200">
                <div className="w-9 h-9 bg-indigo-50 text-indigo-600 rounded-lg flex items-center justify-center mb-4">
                  {f.icon}
                </div>
                <h3 className="text-base font-semibold text-gray-900 mb-1.5">{f.title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── How it works ── */}
      <section className="py-20 px-6">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-3xl font-bold text-gray-900 mb-3">How it works</h2>
            <p className="text-gray-500">From sign-up to your guests scanning the QR code — in minutes.</p>
          </div>
          <div className="relative grid md:grid-cols-3 gap-8">
            {/* Connector line (desktop) */}
            <div className="hidden md:block absolute top-5 left-[calc(16.67%+20px)] right-[calc(16.67%+20px)] h-px bg-indigo-100" />
            {[
              { step: '1', title: 'Create Your Event', desc: 'Sign up free, add your event details, upload a cover image, and write your program or upload a PDF.' },
              { step: '2', title: 'Publish & Get QR Code', desc: 'Choose a plan, publish your event, and instantly receive a unique QR code to share with guests.' },
              { step: '3', title: 'Guests Scan & Read', desc: 'Guests scan the QR code at the venue and view your beautiful digital program — no app needed.' },
            ].map((s) => (
              <div key={s.step} className="text-center relative">
                <div className="w-10 h-10 bg-indigo-600 text-white rounded-full flex items-center justify-center text-sm font-bold mx-auto mb-4 relative z-10 ring-4 ring-white">
                  {s.step}
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">{s.title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Pricing preview ── */}
      <section id="pricing" className="py-20 px-6 bg-gray-50">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-3">Simple, transparent pricing</h2>
          <p className="text-gray-500 mb-8">Start free. Pay only when you need more.</p>

          {/* Billing toggle */}
          <div className="flex items-center justify-center gap-3 mb-12">
            <span className={`text-sm font-medium transition-colors ${billing === 'monthly' ? 'text-gray-900' : 'text-gray-400'}`}>Monthly</span>
            <button
              onClick={() => setBilling(billing === 'monthly' ? 'yearly' : 'monthly')}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 focus:outline-none ${billing === 'yearly' ? 'bg-indigo-600' : 'bg-gray-300'}`}
              aria-label="Toggle billing period"
            >
              <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform duration-200 ${billing === 'yearly' ? 'translate-x-6' : 'translate-x-1'}`} />
            </button>
            <span className={`text-sm font-medium transition-colors ${billing === 'yearly' ? 'text-gray-900' : 'text-gray-400'}`}>Yearly</span>
            {billing === 'yearly' ? (
              <span className="text-xs bg-green-100 text-green-700 font-semibold px-2.5 py-1 rounded-full">Save 33%</span>
            ) : (
              <span className="text-xs text-gray-400">Switch to yearly and save 33%</span>
            )}
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {/* Free */}
            <div className="bg-white rounded-2xl border border-gray-200 p-8 text-left shadow-sm hover:-translate-y-1 hover:shadow-lg hover:border-indigo-300 transition-all duration-200">
              <p className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-2">Free</p>
              <p className="text-4xl font-bold text-gray-900 mb-1">$0</p>
              <p className="text-sm text-gray-400 mb-6">Forever</p>
              <ul className="space-y-2 text-sm text-gray-600 mb-8">
                <li className="flex items-center gap-2"><span className="text-green-500">✓</span> 1 event lifetime</li>
                <li className="flex items-center gap-2"><span className="text-green-500">✓</span> Rich text editor</li>
                <li className="flex items-center gap-2"><span className="text-green-500">✓</span> QR code generation</li>
                <li className="flex items-center gap-2"><span className="text-gray-300">✗</span> PDF upload</li>
              </ul>
              <Link href="/register" className="block text-center py-2.5 border border-gray-300 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50 transition">Get Started Free</Link>
            </div>

            {/* Per Event */}
            <div className="bg-white rounded-2xl border border-gray-200 p-8 text-left shadow-sm hover:-translate-y-1 hover:shadow-lg hover:border-indigo-300 transition-all duration-200">
              <p className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-2">Pay Per Event</p>
              <p className="text-4xl font-bold text-gray-900 mb-1">$9.99</p>
              <p className="text-sm text-gray-400 mb-6">Per event, one-time</p>
              <ul className="space-y-2 text-sm text-gray-600 mb-8">
                <li className="flex items-center gap-2"><span className="text-green-500">✓</span> Single event activation</li>
                <li className="flex items-center gap-2"><span className="text-green-500">✓</span> PDF upload</li>
                <li className="flex items-center gap-2"><span className="text-green-500">✓</span> QR code & analytics</li>
                <li className="flex items-center gap-2"><span className="text-green-500">✓</span> 24-hour live window</li>
              </ul>
              <Link
                href="/register"
                onClick={() => sessionStorage.setItem('pendingPlan', 'per_event')}
                className="block text-center py-2.5 border border-indigo-500 text-indigo-600 rounded-lg text-sm font-medium hover:bg-indigo-50 transition"
              >Pay Per Event</Link>
            </div>

            {/* Pro */}
            <div className="bg-indigo-600 rounded-2xl p-8 text-left shadow-lg relative hover:-translate-y-1 hover:shadow-2xl transition-all duration-200">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs bg-white text-indigo-700 font-semibold px-2 py-0.5 rounded-full">Popular</span>
                {billing === 'yearly' && (
                  <span className="text-xs bg-green-400 text-green-900 font-semibold px-2 py-0.5 rounded-full">Best Value</span>
                )}
              </div>
              <p className="text-sm font-semibold text-indigo-200 uppercase tracking-wide mb-2">Pro</p>
              <p className="text-4xl font-bold text-white mb-1">{proPrice}</p>
              <p className="text-sm text-indigo-300 mb-1">{proPeriod}</p>
              {proSubtext && <p className="text-xs text-indigo-400 mb-5">{proSubtext}</p>}
              <ul className={`space-y-2 text-sm text-indigo-100 mb-8 ${!proSubtext ? 'mt-5' : ''}`}>
                <li className="flex items-center gap-2"><span className="text-indigo-300">✓</span> Unlimited events</li>
                <li className="flex items-center gap-2"><span className="text-indigo-300">✓</span> PDF upload on all events</li>
                <li className="flex items-center gap-2"><span className="text-indigo-300">✓</span> Permanent live access</li>
                <li className="flex items-center gap-2"><span className="text-indigo-300">✓</span> Priority support</li>
              </ul>
              <Link
                href="/register"
                onClick={() => sessionStorage.setItem('pendingPlan', billing === 'yearly' ? 'pro_yearly' : 'pro')}
                className="block text-center py-2.5 bg-white text-indigo-700 rounded-lg text-sm font-semibold hover:bg-indigo-50 transition"
              >{billing === 'yearly' ? 'Start Pro — Best Value' : 'Start Pro'}</Link>
            </div>
          </div>

          <p className="mt-8 text-sm text-gray-400">
            <Link href="/pricing" className="text-indigo-500 hover:underline">See full pricing details →</Link>
          </p>
        </div>
      </section>

      {/* ── CTA banner ── */}
      <section className="py-16 bg-gradient-to-r from-indigo-600 to-violet-600 text-center px-6">
        <h2 className="text-3xl font-bold text-white mb-3">Ready to go paperless?</h2>
        <p className="text-indigo-200 mb-8 max-w-md mx-auto">
          Join event organizers saving money and delighting guests with digital programs.
        </p>
        <Link href="/register" className="inline-block px-8 py-3 bg-white text-indigo-700 font-semibold rounded-xl hover:bg-indigo-50 transition shadow-lg">
          Create Your First Event — Free
        </Link>
      </section>

      {/* ── Contact ── */}
      <section id="contact" className="py-16 px-6 bg-white">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Get in Touch</h2>
          <p className="text-gray-500 text-sm mb-10">Have a question or need help? We&apos;re happy to assist.</p>
          <div className="grid sm:grid-cols-3 gap-6">
            <a href="tel:+233555710390" className="group flex flex-col items-center gap-3 p-6 rounded-2xl border border-gray-200 hover:border-indigo-300 hover:shadow-md transition">
              <div className="w-12 h-12 bg-indigo-50 group-hover:bg-indigo-100 rounded-full flex items-center justify-center transition">
                <svg className="w-5 h-5 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
              </div>
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-0.5">Call Us</p>
                <p className="text-sm font-medium text-gray-900">+233 555 710 390</p>
              </div>
            </a>

            <a href="https://wa.me/233555710390" target="_blank" rel="noopener noreferrer" className="group flex flex-col items-center gap-3 p-6 rounded-2xl border border-gray-200 hover:border-green-300 hover:shadow-md transition">
              <div className="w-12 h-12 bg-green-50 group-hover:bg-green-100 rounded-full flex items-center justify-center transition">
                <svg className="w-5 h-5 text-green-600" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                </svg>
              </div>
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-0.5">WhatsApp</p>
                <p className="text-sm font-medium text-gray-900">+233 555 710 390</p>
              </div>
            </a>

            <a href="mailto:indoortech001@gmail.com" className="group flex flex-col items-center gap-3 p-6 rounded-2xl border border-gray-200 hover:border-indigo-300 hover:shadow-md transition">
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

      {/* ── Footer ── */}
      <footer className="py-8 text-center text-sm text-gray-400 border-t border-gray-100">
        © 2025 CeremoLink by IndoorTech. All rights reserved.
      </footer>

    </div>
  );
}
