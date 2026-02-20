'use client';

import { useEffect, useRef, useState } from 'react';
import api from '@/lib/api';
import { useAuth } from '@/lib/auth';

interface Message {
  id: number;
  sender: 'user' | 'admin';
  body: string;
  created_at: string;
}

const STORAGE_KEY = 'chat_session'; // { id, token }

function loadSession(): { id: number; token: string } | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function saveSession(id: number, token: string) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify({ id, token }));
}

function clearSession() {
  localStorage.removeItem(STORAGE_KEY);
}

export default function ChatWidget() {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [phase, setPhase] = useState<'idle' | 'email-form' | 'chat'>('idle');
  const [email, setEmail] = useState('');
  const [firstMessage, setFirstMessage] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [convId, setConvId] = useState<number | null>(null);
  const [convToken, setConvToken] = useState<string>('');
  const [starting, setStarting] = useState(false);
  const [sending, setSending] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Restore session from localStorage on mount
  useEffect(() => {
    const session = loadSession();
    if (session) {
      setConvId(session.id);
      setConvToken(session.token);
    }
  }, []);

  // When widget opens, decide which phase to show
  useEffect(() => {
    if (!open) return;

    if (convId) {
      // Existing session — go straight to chat and load messages
      setPhase('chat');
      fetchMessages(convId, convToken);
    } else if (user) {
      // Logged-in user with no session — start conversation immediately
      startConversation();
    } else {
      // Guest — show email collection form
      setPhase('email-form');
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  // Poll for new messages every 5 seconds while chat is open
  useEffect(() => {
    if (phase === 'chat' && convId) {
      pollRef.current = setInterval(() => fetchMessages(convId, convToken), 5000);
    }
    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, convId]);

  // Scroll to bottom whenever messages change
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  async function fetchMessages(id: number, token: string) {
    try {
      const params = user ? {} : { token };
      const { data } = await api.get(`/chat/${id}/messages/`, { params });
      setMessages(data);
    } catch {
      // ignore — could be an expired session
    }
  }

  async function startConversation(guestEmail?: string, openingMessage?: string) {
    setStarting(true);
    try {
      const payload: Record<string, string> = {};
      if (guestEmail) payload.email = guestEmail;
      if (openingMessage) payload.message = openingMessage;

      const { data } = await api.post('/chat/start/', payload);
      setConvId(data.id);
      setConvToken(data.token);
      saveSession(data.id, data.token);
      setPhase('chat');
      await fetchMessages(data.id, data.token);
    } catch {
      // ignore
    } finally {
      setStarting(false);
    }
  }

  async function handleEmailSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim()) return;
    await startConversation(email.trim(), firstMessage.trim() || undefined);
  }

  async function handleSend(e: React.FormEvent) {
    e.preventDefault();
    if (!input.trim() || !convId) return;
    setSending(true);
    try {
      const payload: Record<string, string> = { body: input.trim() };
      if (!user) payload.token = convToken;
      await api.post(`/chat/${convId}/send/`, payload);
      setInput('');
      await fetchMessages(convId, convToken);
    } catch {
      // ignore
    } finally {
      setSending(false);
    }
  }

  function handleClose() {
    setOpen(false);
  }

  function handleNewChat() {
    clearSession();
    setConvId(null);
    setConvToken('');
    setMessages([]);
    setEmail('');
    setFirstMessage('');
    setPhase('idle');
    setOpen(false);
  }

  return (
    <>
      {/* Chat panel */}
      {open && (
        <div className="fixed bottom-20 right-4 z-50 w-80 sm:w-96 bg-white rounded-2xl shadow-2xl border border-gray-200 flex flex-col overflow-hidden"
          style={{ maxHeight: '520px' }}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 bg-indigo-600">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
                <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8 10h.01M12 10h.01M16 10h.01M21 16c0 1.1-.9 2-2 2H7l-4 4V6a2 2 0 012-2h14a2 2 0 012 2v10z" />
                </svg>
              </div>
              <div>
                <p className="text-sm font-semibold text-white">CeremoLink Support</p>
                <p className="text-xs text-indigo-200">We reply as soon as possible</p>
              </div>
            </div>
            <div className="flex items-center gap-1">
              {phase === 'chat' && (
                <button
                  onClick={handleNewChat}
                  className="p-1.5 text-indigo-200 hover:text-white transition"
                  title="Start new chat"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                  </svg>
                </button>
              )}
              <button
                onClick={handleClose}
                className="p-1.5 text-indigo-200 hover:text-white transition"
                aria-label="Close chat"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>

          {/* Body */}
          {phase === 'email-form' && (
            <form onSubmit={handleEmailSubmit} className="flex flex-col gap-3 p-4 flex-1">
              <p className="text-sm text-gray-600 leading-relaxed">
                Hi there! 👋 Before we start, please share your email so we can follow up if needed.
              </p>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Your email address"
                className="w-full px-3 py-2.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              <textarea
                value={firstMessage}
                onChange={(e) => setFirstMessage(e.target.value)}
                placeholder="How can we help? (optional)"
                rows={3}
                className="w-full px-3 py-2.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
              />
              <button
                type="submit"
                disabled={starting}
                className="w-full py-2.5 bg-indigo-600 text-white text-sm font-semibold rounded-lg hover:bg-indigo-700 disabled:opacity-60 transition"
              >
                {starting ? 'Starting chat...' : 'Start Chat'}
              </button>
            </form>
          )}

          {(phase === 'idle' && starting) && (
            <div className="flex-1 flex items-center justify-center py-10">
              <p className="text-sm text-gray-400 animate-pulse">Connecting...</p>
            </div>
          )}

          {phase === 'chat' && (
            <>
              {/* Messages */}
              <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3" style={{ minHeight: 0 }}>
                {messages.length === 0 ? (
                  <p className="text-xs text-center text-gray-400 py-6">
                    No messages yet. Say hello!
                  </p>
                ) : (
                  messages.map((msg) => (
                    <div
                      key={msg.id}
                      className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-[75%] px-3 py-2 rounded-2xl text-sm leading-relaxed ${
                          msg.sender === 'user'
                            ? 'bg-indigo-600 text-white rounded-br-sm'
                            : 'bg-gray-100 text-gray-800 rounded-bl-sm'
                        }`}
                      >
                        {msg.sender === 'admin' && (
                          <p className="text-xs font-semibold text-indigo-500 mb-0.5">Support</p>
                        )}
                        {msg.body}
                      </div>
                    </div>
                  ))
                )}
                <div ref={bottomRef} />
              </div>

              {/* Input */}
              <form onSubmit={handleSend} className="flex items-center gap-2 px-3 py-3 border-t border-gray-100">
                <input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Type a message..."
                  className="flex-1 px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
                <button
                  type="submit"
                  disabled={sending || !input.trim()}
                  className="p-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 transition flex-shrink-0"
                  aria-label="Send"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                  </svg>
                </button>
              </form>
            </>
          )}
        </div>
      )}

      {/* Floating button */}
      <button
        onClick={() => setOpen((v) => !v)}
        className="fixed bottom-4 right-4 z-50 w-14 h-14 bg-indigo-600 text-white rounded-full shadow-lg hover:bg-indigo-700 transition-all duration-200 flex items-center justify-center hover:scale-105"
        aria-label="Open support chat"
      >
        {open ? (
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
          </svg>
        ) : (
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M8 10h.01M12 10h.01M16 10h.01M21 16c0 1.1-.9 2-2 2H7l-4 4V6a2 2 0 012-2h14a2 2 0 012 2v10z" />
          </svg>
        )}
      </button>
    </>
  );
}
