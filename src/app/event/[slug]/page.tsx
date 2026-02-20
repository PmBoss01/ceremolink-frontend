import Link from 'next/link';
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

const NOT_AVAILABLE_MESSAGES: Record<ErrorCode, { icon: string; heading: string; body: string }> = {
  expired_free: {
    icon: '⏰',
    heading: 'Free Event Has Expired',
    body: 'This event was on the free plan, which allows 3 hours of public access after publishing. The organizer can upgrade to Pro to keep events live permanently.',
  },
  expired_per_event: {
    icon: '⏰',
    heading: 'Event Window Has Ended',
    body: 'This event\'s 24-hour access window has ended. The organizer can renew or upgrade to Pro for permanent, unlimited access.',
  },
  not_available: {
    icon: '📭',
    heading: 'Event Not Available',
    body: 'This event may not have been published yet, may have been taken down, or the link may be incorrect. Contact the organizer for more information.',
  },
};

function EventNotAvailable({ code }: { code: ErrorCode }) {
  const { icon, heading, body } = NOT_AVAILABLE_MESSAGES[code];
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-4 text-center">
      <div className="text-6xl mb-4">{icon}</div>
      <h1 className="text-2xl font-bold text-gray-900 mb-2">{heading}</h1>
      <p className="text-sm text-gray-500 max-w-sm mb-6 leading-relaxed">{body}</p>
      <Link
        href="/"
        className="px-6 py-2.5 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 transition"
      >
        Learn about CeremoLink
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
      {/* Cover image */}
      {ev.cover_image && (
        <div className="w-full h-56 overflow-hidden">
          <img
            src={ev.cover_image}
            alt={ev.title}
            className="w-full h-full object-cover"
          />
        </div>
      )}

      <div className="max-w-2xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-gray-900">{ev.title}</h1>

        {ev.description && (
          <p className="text-gray-500 mt-2 text-base leading-relaxed">
            {ev.description}
          </p>
        )}

        <hr className="my-6 border-gray-200" />

        {/* Event program content */}
        {ev.content && (
          <div
            className="rich-content text-gray-700"
            dangerouslySetInnerHTML={{ __html: ev.content }}
          />
        )}

        {/* PDF viewer */}
        {ev.pdf_file && (
          <div className="mt-8">
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm font-semibold text-gray-700">Event Program</p>
              <a
                href={ev.pdf_file}
                download
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
                  <polyline points="7 10 12 15 17 10" />
                  <line x1="12" y1="15" x2="12" y2="3" />
                </svg>
                Download PDF
              </a>
            </div>

            {/* Embedded viewer — renders natively on most browsers */}
            <iframe
              src={ev.pdf_file}
              title="Event Program PDF"
              className="w-full rounded-xl border border-gray-200 shadow-sm"
              style={{ height: '75vh', minHeight: '500px' }}
            />

            {/* Fallback message shown if iframe is blocked */}
            <p className="mt-3 text-xs text-center text-gray-400">
              Can&apos;t see the PDF?{' '}
              <a
                href={ev.pdf_file}
                target="_blank"
                rel="noopener noreferrer"
                className="text-indigo-500 hover:underline"
              >
                Open it in a new tab
              </a>
              {' '}or use the Download button above.
            </p>
          </div>
        )}
      </div>

      {/* Footer */}
      <footer className="py-6 text-center text-xs text-gray-400 border-t border-gray-100 mt-8">
        Powered by{' '}
        <span className="text-indigo-500 font-medium">CeremoLink</span>
      </footer>
    </div>
  );
}
