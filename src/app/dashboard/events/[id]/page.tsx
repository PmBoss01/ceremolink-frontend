'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import api from '@/lib/api';
import { Event } from '@/types';
import Toast from '@/components/Toast';
import RichTextEditor from '@/components/RichTextEditor';
import { useAuth } from '@/lib/auth';

export default function EditEventPage() {
  const { user } = useAuth();
  const params = useParams();
  const id = params.id as string;
  const router = useRouter();
  const searchParams = useSearchParams();
  const viewMode = searchParams.get('view');       // 'qr' or null (edit)
  const paymentSuccess = searchParams.get('payment') === 'success';

  const effectivePlan = user?.plan ?? 'free';
  const isFree = effectivePlan === 'free';

  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [paying, setPaying] = useState(false);
  const [error, setError] = useState('');
  const [showToast, setShowToast] = useState(false);
  const [contentType, setContentType] = useState<'editor' | 'pdf'>('editor');
  const [form, setForm] = useState({
    title: '',
    description: '',
    content: '',
    is_published: false,
  });
  const [coverImage, setCoverImage] = useState<File | null>(null);
  const [coverPreview, setCoverPreview] = useState<string | null>(null);
  const [pdfFile, setPdfFile] = useState<File | null>(null);

  useEffect(() => {
    api
      .get(`/events/${id}/`)
      .then(({ data }) => {
        setEvent(data);
        setForm({
          title: data.title,
          description: data.description,
          content: data.content,
          // Paid events that have never been published default to checked (ready to go live)
          is_published: data.is_published || (data.is_paid && data.published_at === null),
        });
        if (data.pdf_file) setContentType('pdf');
      })
      .catch(() => router.push('/dashboard'))
      .finally(() => setLoading(false));
  }, [id, router]);

  const handlePayPerEvent = async () => {
    setPaying(true);
    setError('');
    try {
      const { data } = await api.post('/payments/create-checkout-session/', {
        type: 'per_event',
        event_id: id,
      });
      window.location.href = data.url;
    } catch {
      setError('Could not start checkout. Please try again.');
      setPaying(false);
    }
  };

  const handleDownloadQR = async () => {
    if (!event?.qr_code) return;
    try {
      const res = await fetch(event.qr_code);
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `qr-${event.slug}.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch {
      // Fallback: open in new tab
      window.open(event.qr_code, '_blank');
    }
  };

  const handleSubmit = async (e: { preventDefault: () => void }) => {
    e.preventDefault();
    setError('');
    setSaving(true);
    try {
      const formData = new FormData();
      formData.append('title', form.title);
      formData.append('description', form.description);
      formData.append('content', contentType === 'editor' ? form.content : '');
      // Free plan events are always published — never send false
      formData.append('is_published', String(isFree ? true : form.is_published));
      if (coverImage) formData.append('cover_image', coverImage);
      if (contentType === 'pdf' && pdfFile) formData.append('pdf_file', pdfFile);

      const { data } = await api.patch(`/events/${id}/`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setEvent(data);
      setShowToast(true);
      setTimeout(() => {
        router.push('/dashboard');
        router.refresh();
      }, 2500);
    } catch {
      setError('Failed to update event. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <p className="text-sm text-gray-400">Loading...</p>;
  if (!event) return null;

  /* ── QR Code view ────────────────────────────────────────────── */
  if (viewMode === 'qr') {
    return (
      <div className="max-w-2xl">
        <div className="flex items-center gap-3 mb-8">
          <Link href="/dashboard" className="text-sm text-gray-500 hover:text-gray-700">
            ← Back
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">QR Code</h1>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-8 text-center">
          {/* Event title & description */}
          <h2 className="text-lg font-bold text-gray-900 mb-1">{event.title}</h2>
          {event.description && (
            <p className="text-sm text-gray-500 mb-6">{event.description}</p>
          )}

          {event.qr_code ? (
            <>
              <img
                src={event.qr_code}
                alt="QR Code"
                className="w-56 h-56 mx-auto mb-4"
              />
              <p className="text-xs text-gray-400 mb-6">
                Share this QR code with guests — they will be taken directly to your event page.
              </p>
              <div className="flex gap-3 justify-center flex-wrap">
                <button
                  onClick={handleDownloadQR}
                  className="px-5 py-2.5 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 transition"
                >
                  Download QR Code
                </button>
                <a
                  href={`/event/${event.slug}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-5 py-2.5 bg-gray-100 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-200 transition"
                >
                  View Public Page →
                </a>
              </div>

              {/* Copyable link */}
              <div className="mt-6 flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-lg px-4 py-2.5">
                <span className="text-xs text-gray-500 truncate flex-1 text-left">
                  {typeof window !== 'undefined'
                    ? `${window.location.origin}/event/${event.slug}`
                    : `/event/${event.slug}`}
                </span>
                <button
                  onClick={() => {
                    const url = `${window.location.origin}/event/${event.slug}`;
                    navigator.clipboard.writeText(url);
                  }}
                  className="text-xs font-medium text-indigo-600 hover:text-indigo-800 flex-shrink-0"
                >
                  Copy
                </button>
              </div>
            </>
          ) : (
            <p className="text-sm text-gray-400 py-8">
              QR code will be generated once the event is published.
            </p>
          )}
        </div>

        <div className="mt-4 text-center">
          <Link
            href={`/dashboard/events/${id}`}
            className="text-sm text-indigo-600 hover:text-indigo-800 font-medium"
          >
            ← Edit event details
          </Link>
        </div>
      </div>
    );
  }

  /* ── Edit view ───────────────────────────────────────────────── */
  return (
    <div className="max-w-2xl">
      {showToast && (
        <Toast
          message="Event updated successfully!"
          onClose={() => setShowToast(false)}
        />
      )}

      <div className="flex items-center gap-3 mb-8">
        <Link href="/dashboard" className="text-sm text-gray-500 hover:text-gray-700">
          ← Back
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">Edit Event</h1>
      </div>

      {/* Payment success banner — shown when redirected back from Stripe */}
      {paymentSuccess && (
        <div className="mb-6 flex items-start gap-3 bg-green-50 border border-green-200 rounded-xl px-5 py-4">
          <span className="text-xl mt-0.5">✅</span>
          <div>
            <p className="text-sm font-semibold text-green-800">Payment confirmed!</p>
            <p className="text-xs text-green-600 mt-0.5">
              Review your event details below, then click <strong>Update Event</strong> to publish it and go live.
              Your 24-hour window starts the moment you save.
            </p>
          </div>
        </div>
      )}

      {/* Plan-specific publish window notice */}
      {event.paid_per_event && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-5 mb-6">
          <p className="text-sm font-semibold text-amber-800 mb-1">Pay Per Event — 24-Hour Publish Window</p>
          <p className="text-xs text-amber-700">
            Your event is live and accessible via QR code for 24 hours from the moment it is published.
            After that, guests will see an &quot;event expired&quot; page.{' '}
            <a href="/pricing" className="underline font-medium hover:text-amber-900">
              Upgrade to Pro
            </a>{' '}
            to keep your event live permanently.
          </p>
        </div>
      )}
      {isFree && !event.paid_per_event && (
        <div className="bg-indigo-50 border border-indigo-200 rounded-xl p-5 mb-6">
          <p className="text-sm font-semibold text-indigo-800 mb-1">Free Plan — 3-Hour Publish Window</p>
          <p className="text-xs text-indigo-700">
            Your event is live and accessible via QR code for 3 hours from the moment it was published.
            After that, guests will see an &quot;event expired&quot; page.{' '}
            <a href="/pricing" className="underline font-medium hover:text-indigo-900">
              Upgrade to Pro
            </a>{' '}
            to keep your event live permanently.
          </p>
        </div>
      )}

      {/* Payment notice — only for non-free users who haven't paid yet */}
      {!isFree && !event.is_paid && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-5 mb-6">
          <p className="text-sm font-semibold text-amber-800 mb-1">Payment required to publish</p>
          <p className="text-xs text-amber-700 mb-4">
            Activate this event to publish it and generate a QR code for your guests.
          </p>
          <button
            onClick={handlePayPerEvent}
            disabled={paying}
            className="px-4 py-2 bg-amber-500 text-white text-sm font-semibold rounded-lg hover:bg-amber-600 disabled:opacity-50 transition"
          >
            {paying ? 'Redirecting...' : 'Pay $9.99 & Activate →'}
          </button>
        </div>
      )}

      <div className="bg-white rounded-xl border border-gray-200 p-8">
        {error && (
          <div className="mb-4 p-3 bg-red-50 text-red-600 text-sm rounded-lg border border-red-200">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Event Title <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              value={form.description}
              onChange={(e) =>
                setForm({ ...form, description: e.target.value })
              }
              rows={3}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Cover Image
            </label>
            {/* Show new preview if user selected a file, otherwise show existing */}
            {coverPreview ? (
              <img
                src={coverPreview}
                alt="Cover preview"
                className="w-full h-40 object-cover rounded-lg mb-2 border border-gray-200"
              />
            ) : event.cover_image ? (
              <img
                src={event.cover_image}
                alt="Current cover"
                className="w-full h-40 object-cover rounded-lg mb-2"
              />
            ) : null}
            <input
              type="file"
              accept="image/*"
              onChange={(e) => {
                const file = e.target.files?.[0] ?? null;
                setCoverImage(file);
                setCoverPreview(file ? URL.createObjectURL(file) : null);
              }}
              className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-indigo-50 file:text-indigo-700"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Event Content
            </label>
            <div className="flex gap-3 mb-4">
              <button
                type="button"
                onClick={() => setContentType('editor')}
                className={`px-4 py-2 text-sm font-medium rounded-lg border transition ${
                  contentType === 'editor'
                    ? 'bg-indigo-600 text-white border-indigo-600'
                    : 'bg-white text-gray-600 border-gray-300'
                }`}
              >
                ✏️ Use Editor
              </button>
              <button
                type="button"
                onClick={() => setContentType('pdf')}
                className={`px-4 py-2 text-sm font-medium rounded-lg border transition ${
                  contentType === 'pdf'
                    ? 'bg-indigo-600 text-white border-indigo-600'
                    : 'bg-white text-gray-600 border-gray-300'
                }`}
              >
                📄 Upload PDF
              </button>
            </div>

            {contentType === 'editor' ? (
              <RichTextEditor
                value={form.content}
                onChange={(html) => setForm({ ...form, content: html })}
              />
            ) : (
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                {event.pdf_file && (
                  <p className="text-xs text-gray-500 mb-3">
                    Current:{' '}
                    <a
                      href={event.pdf_file}
                      className="text-indigo-600 underline"
                      target="_blank"
                      rel="noreferrer"
                    >
                      View PDF
                    </a>
                  </p>
                )}
                <input
                  type="file"
                  accept=".pdf"
                  onChange={(e) => setPdfFile(e.target.files?.[0] ?? null)}
                  className="text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-indigo-50 file:text-indigo-700"
                />
                {pdfFile && (
                  <p className="text-xs text-green-600 mt-2">✓ {pdfFile.name}</p>
                )}
              </div>
            )}
          </div>

          {/* Publish toggle */}
          {isFree ? (
            /* Free plan: permanently published — lock the toggle */
            <div className="flex items-center gap-3 p-4 bg-indigo-50 border border-indigo-100 rounded-lg">
              <input
                type="checkbox"
                id="is_published"
                checked={true}
                disabled={true}
                readOnly
                className="w-4 h-4 text-indigo-600 rounded"
              />
              <label htmlFor="is_published" className="text-sm font-medium text-indigo-700">
                Published
                <span className="ml-2 text-xs text-indigo-500 font-normal">
                  — free plan events are always live (cannot be changed)
                </span>
              </label>
            </div>
          ) : event.is_paid ? (
            /* Paid event (per_event or pro): enabled, user controls publish state */
            <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
              <input
                type="checkbox"
                id="is_published"
                checked={form.is_published}
                onChange={(e) => setForm({ ...form, is_published: e.target.checked })}
                className="w-4 h-4 text-indigo-600 rounded cursor-pointer"
              />
              <label htmlFor="is_published" className="text-sm font-medium text-gray-700 cursor-pointer">
                Publish this event (makes it accessible via QR code)
              </label>
            </div>
          ) : (
            /* Unpaid event: disabled until payment */
            <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
              <input
                type="checkbox"
                id="is_published"
                checked={form.is_published}
                disabled={true}
                readOnly
                className="w-4 h-4 text-indigo-600 rounded"
              />
              <label htmlFor="is_published" className="text-sm font-medium text-gray-400">
                Publish this event (makes it accessible via QR code)
                <span className="ml-2 text-xs text-amber-600">— Payment required first</span>
              </label>
            </div>
          )}

          <div className="flex gap-3">
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-2.5 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 disabled:opacity-50 transition"
            >
              {saving ? 'Saving...' : 'Update Event'}
            </button>
            <Link
              href="/dashboard"
              className="px-6 py-2.5 bg-gray-100 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-200 transition"
            >
              Cancel
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
