'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { AxiosError } from 'axios';
import api from '@/lib/api';
import { useAuth } from '@/lib/auth';
import RichTextEditor from '@/components/RichTextEditor';
import Toast from '@/components/Toast';

export default function NewEventPage() {
  const { user, refreshUser } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [paying, setPaying] = useState(false);
  const [toast, setToast] = useState<{ message: string; type?: 'success' | 'error' } | null>(null);
  const [contentType, setContentType] = useState<'editor' | 'pdf'>('editor');
  const [form, setForm] = useState({ title: '', description: '', content: '' });
  const [coverImage, setCoverImage] = useState<File | null>(null);
  const [coverPreview, setCoverPreview] = useState<string | null>(null);
  const [pdfFile, setPdfFile] = useState<File | null>(null);

  const effectivePlan = user?.plan ?? 'free';
  const isFree = effectivePlan === 'free';
  const isPerEvent = effectivePlan === 'per_event';

  // Builds a FormData payload from the current form state
  const buildFormData = () => {
    const formData = new FormData();
    formData.append('title', form.title);
    formData.append('description', form.description);
    formData.append('content', contentType === 'editor' ? form.content : '');
    if (coverImage) formData.append('cover_image', coverImage);
    if (contentType === 'pdf' && pdfFile) formData.append('pdf_file', pdfFile);
    return formData;
  };

  // Per-event flow: save as draft first, then redirect to Stripe for that specific event.
  // On return (?payment=success) the edit page shows a banner and the user clicks Save to go live.
  const handlePayAndActivate = async () => {
    if (!form.title.trim()) {
      setToast({ message: 'Please enter an event title before proceeding to payment.', type: 'error' });
      return;
    }
    setPaying(true);
    try {
      const { data: draft } = await api.post('/events/', buildFormData(), {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      const { data: checkout } = await api.post('/payments/create-checkout-session/', {
        type: 'per_event',
        event_id: draft.id,
      });
      window.location.href = checkout.url;
    } catch {
      setToast({ message: 'Could not start payment. Please try again.', type: 'error' });
      setPaying(false);
    }
  };

  const handlePdfTabClick = () => {
    if (isFree) {
      setToast({
        message: 'PDF upload is not available on the free plan. Upgrade to Pro or pay $9.99 per event to unlock this feature.',
        type: 'error',
      });
      return;
    }
    setContentType('pdf');
  };

  const handleSubmit = async (e: { preventDefault: () => void }) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post('/events/', buildFormData(), {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      await refreshUser();
      setToast({ message: 'Event created successfully!', type: 'success' });
      setTimeout(() => {
        router.push('/dashboard');
        router.refresh();
      }, 2000);
    } catch (err) {
      const axiosErr = err as AxiosError<{ detail?: string }>;
      if (axiosErr.response?.status === 403) {
        setToast({
          message:
            "You're on the free plan which allows only 1 event lifetime. " +
            "You've already used your free event. Upgrade to Pro or pay $9.99 to activate another event.",
          type: 'error',
        });
      } else {
        setToast({ message: 'Failed to create event. Please try again.', type: 'error' });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl">
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          duration={6000}
          onClose={() => setToast(null)}
        />
      )}

      <div className="flex items-center gap-3 mb-8">
        <Link href="/dashboard" className="text-sm text-gray-500 hover:text-gray-700">
          ← Back
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">Create New Event</h1>
      </div>

      {/* Free plan eligibility notice */}
      {isFree && (
        <div className="mb-5 flex items-start gap-3 bg-indigo-50 border border-indigo-200 rounded-xl px-5 py-4">
          <span className="text-lg mt-0.5">🎟️</span>
          <div>
            <p className="text-sm font-semibold text-indigo-800">
              {(user?.event_count ?? 0) >= 1
                ? "You've already used your free event"
                : 'You have 1 free event available'}
            </p>
            <p className="text-xs text-indigo-600 mt-0.5">
              {(user?.event_count ?? 0) >= 1
                ? 'The free plan only allows 1 lifetime event. Creating another will be blocked — upgrade to Pro or pay $9.99 per event.'
                : 'Your event will be published immediately when you save it. It will be live for 3 hours — after that, guests will see an expired page. Upgrade to Pro for permanent, unlimited events.'}
            </p>
            {(user?.event_count ?? 0) >= 1 && (
              <Link
                href="/pricing"
                className="inline-block mt-2 text-xs font-semibold text-indigo-700 underline hover:text-indigo-900"
              >
                View upgrade options →
              </Link>
            )}
          </div>
        </div>
      )}

      <div className="bg-white rounded-xl border border-gray-200 p-8">
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
              placeholder="e.g. Memorial Service for John Doe"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              rows={3}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
              placeholder="Brief description of the event"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Cover Image
            </label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => {
                const file = e.target.files?.[0] ?? null;
                setCoverImage(file);
                setCoverPreview(file ? URL.createObjectURL(file) : null);
              }}
              className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
            />
            {coverPreview && (
              <img
                src={coverPreview}
                alt="Cover preview"
                className="mt-3 w-full h-40 object-cover rounded-lg border border-gray-200"
              />
            )}
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
                    : 'bg-white text-gray-600 border-gray-300 hover:border-indigo-300'
                }`}
              >
                ✏️ Use Editor
              </button>
              <button
                type="button"
                onClick={handlePdfTabClick}
                className={`px-4 py-2 text-sm font-medium rounded-lg border transition ${
                  contentType === 'pdf'
                    ? 'bg-indigo-600 text-white border-indigo-600'
                    : isFree
                    ? 'bg-gray-50 text-gray-400 border-gray-200 cursor-not-allowed'
                    : 'bg-white text-gray-600 border-gray-300 hover:border-indigo-300'
                }`}
              >
                📄 Upload PDF {isFree && <span className="ml-1 text-xs">🔒</span>}
              </button>
            </div>

            {contentType === 'editor' ? (
              <RichTextEditor
                value={form.content}
                onChange={(html) => setForm({ ...form, content: html })}
                placeholder="Start writing your event program here..."
              />
            ) : (
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                <div className="text-3xl mb-2">📄</div>
                <p className="text-sm text-gray-500 mb-3">
                  Upload your event program as a PDF
                </p>
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

          {/* Per-event payment section */}
          {isPerEvent && (
            <div className="rounded-xl border border-amber-200 bg-amber-50 p-5">
              <div className="flex items-start gap-3">
                <span className="text-xl mt-0.5">💳</span>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-amber-800 mb-1">
                    Payment required to go live
                  </p>
                  <p className="text-xs text-amber-700 mb-4">
                    Your event details will be saved, then you&apos;ll complete a $9.99 payment.
                    Once confirmed, you&apos;ll return here to review and publish — your event will be live for 24 hours.
                  </p>
                  <button
                    type="button"
                    onClick={handlePayAndActivate}
                    disabled={paying || loading}
                    className="px-5 py-2.5 bg-amber-500 text-white text-sm font-semibold rounded-lg hover:bg-amber-600 disabled:opacity-50 transition"
                  >
                    {paying ? 'Saving & redirecting to payment...' : 'Pay $9.99 & Activate →'}
                  </button>
                </div>
              </div>
            </div>
          )}

          <div className="flex gap-3 pt-2">
            <button
              type="submit"
              disabled={loading || paying}
              className="px-6 py-2.5 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 disabled:opacity-50 transition"
            >
              {loading ? 'Saving...' : isPerEvent ? 'Save as Draft' : 'Save Event'}
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
