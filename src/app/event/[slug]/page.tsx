import Link from 'next/link';
import ShareButton from '@/components/ShareButton';
import { PublicEvent } from '@/types';

const BACKEND = 'http://127.0.0.1:8000';

type ErrorCode = 'expired_free' | 'expired_per_event' | 'not_available';

type EventResult =
  | { ok: true; data: PublicEvent }
  | { ok: false; code: ErrorCode };

async function getEvent(slug: string): Promise<EventResult> {
  try {
    const res = await fetch(`${BACKEND}/api/event/${slug}/`, {
      cache: 'no-store', // Always fresh — view count increments on every request
    });
    if (res.ok) return { ok: true, data: await res.json() };

    try {
      const body = await res.json();
      const code: ErrorCode = body.code ?? 'not_available';
      return { ok: false, code };
    } catch {
      return { ok: false, code: 'not_available' };
    }
  } catch {
    return { ok: false, code: 'not_available' };
  }
}

function formatEventDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });
}

const NOT_AVAILABLE_MESSAGES: Record<ErrorCode, { heading: string; body: string }> = {
  expired_free: {
    heading: 'Free Event Has Expired',
    body: 'This event was published on the free plan, which allows 3 hours of public access. The organizer can upgrade to Pro to keep events live permanently.',
  },
  expired_per_event: {
    heading: 'Event Window Has Ended',
    body: "This event's 24-hour access window has ended. The organizer can renew or upgrade to Pro for permanent, unlimited access.",
  },
  not_available: {
    heading: 'Event Not Available',
    body: 'This event may not have been published yet, may have been taken down, or the link may be incorrect. Contact the organizer for more information.',
  },
};

function EventNotAvailable({ code }: { code: ErrorCode }) {
  const { heading, body } = NOT_AVAILABLE_MESSAGES[code];
  const isExpired = code !== 'not_available';
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-6 text-center">
      <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6 ${isExpired ? 'bg-amber-100' : 'bg-gray-100'}`}>
        {isExpired ? (
          <svg className="w-8 h-8 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <circle cx="12" cy="12" r="10" />
            <path strokeLinecap="round" d="M12 6v6l4 2" />
          </svg>
        ) : (
          <svg className="w-8 h-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
          </svg>
        )}
      </div>
      <h1 className="text-2xl font-bold text-gray-900 mb-2">{heading}</h1>
      <p className="text-sm text-gray-500 max-w-sm mb-8 leading-relaxed">{body}</p>
      <Link
        href="/"
        className="px-6 py-2.5 bg-indigo-600 text-white text-sm font-semibold rounded-xl hover:bg-indigo-700 transition"
      >
        Learn about CeremoLink →
      </Link>
    </div>
  );
}

export default async function PublicEventPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const result = await getEvent(slug);

  if (!result.ok) return <EventNotAvailable code={result.code} />;

  const ev = result.data;

  return (
    <div className="min-h-screen bg-white">

      {/* Hero — full-width cover image or gradient band */}
      {ev.cover_image ? (
        <div className="relative w-full overflow-hidden bg-gray-900" style={{ height: '300px' }}>
          {/* Blurred backdrop — fills the container for any image dimension (wide, portrait, square) */}
          <img
            src={ev.cover_image}
            alt=""
            aria-hidden="true"
            className="absolute inset-0 w-full h-full object-cover scale-110 blur-2xl opacity-60"
          />
          {/* Actual image — contained so nothing is ever cropped, centered over the backdrop */}
          <img
            src={ev.cover_image}
            alt={ev.title}
            className="relative h-full w-full object-contain"
          />
          {/* Bottom gradient for smooth transition into the content area */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/25 via-transparent to-transparent pointer-events-none" />
        </div>
      ) : (
        <div className="w-full h-2 bg-gradient-to-r from-indigo-500 to-violet-500" />
      )}

      {/* Content */}
      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8">

        {/* Title block */}
        <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 leading-tight">
          {ev.title}
        </h1>

        {/* Event date */}
        {ev.event_date && (
          <div className="flex items-center gap-2 mt-3 text-sm text-gray-500">
            <svg className="w-4 h-4 text-indigo-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
              <rect x="3" y="4" width="18" height="18" rx="2" />
              <path strokeLinecap="round" d="M16 2v4M8 2v4M3 10h18" />
            </svg>
            <span>{formatEventDate(ev.event_date)}</span>
          </div>
        )}

        {/* Description */}
        {ev.description && (
          <p className="mt-3 text-gray-500 leading-relaxed">
            {ev.description}
          </p>
        )}

        {/* Meta row: view count + share */}
        <div className="flex items-center justify-between mt-5 pt-4 border-t border-gray-100">
          <div className="flex items-center gap-1.5 text-xs text-gray-400">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.477 0 8.268 2.943 9.542 7-1.274 4.057-5.065 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
            <span>{ev.view_count} {ev.view_count === 1 ? 'view' : 'views'}</span>
          </div>
          <ShareButton title={ev.title} />
        </div>

        <div className="my-7 border-t border-gray-100" />

        {/* Rich text content */}
        {ev.content && (
          <div
            className="rich-content text-gray-700"
            dangerouslySetInnerHTML={{ __html: ev.content }}
          />
        )}

        {/* PDF section */}
        {ev.pdf_file && (
          <div className={ev.content ? 'mt-10' : ''}>
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm font-semibold text-gray-700">Event Program</p>
              <a
                href={ev.pdf_file}
                download
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
              >
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M7 10l5 5 5-5M12 15V3" />
                </svg>
                Download PDF
              </a>
            </div>

            <iframe
              src={ev.pdf_file}
              title="Event Program PDF"
              className="w-full rounded-xl border border-gray-200 shadow-sm"
              style={{ height: '75vh', minHeight: '500px' }}
            />

            <p className="mt-3 text-xs text-center text-gray-400">
              Can&apos;t see the PDF?{' '}
              <a
                href={ev.pdf_file}
                target="_blank"
                rel="noopener noreferrer"
                className="text-indigo-500 hover:underline"
              >
                Open in a new tab
              </a>
              {' '}or use the Download button above.
            </p>
          </div>
        )}
      </div>

      {/* Footer */}
      <footer className="mt-12 py-6 text-center text-xs text-gray-400 border-t border-gray-100">
        Powered by{' '}
        <Link href="/" className="text-indigo-500 font-medium hover:text-indigo-700 transition">
          CeremoLink
        </Link>
      </footer>
    </div>
  );
}
