'use client';

import { useEffect, useRef, useState } from 'react';
import api from '@/lib/api';

interface Conversation {
  id: number;
  username: string | null;
  email: string;
  guest_email: string;
  created_at: string;
  last_message: string | null;
  last_message_at: string | null;
  last_sender: 'user' | 'admin' | null;
  message_count: number;
}

interface Message {
  id: number;
  sender: 'user' | 'admin';
  body: string;
  created_at: string;
}

function formatTime(iso: string) {
  return new Date(iso).toLocaleString('en-US', {
    month: 'short', day: 'numeric',
    hour: 'numeric', minute: '2-digit', hour12: true,
  });
}

export default function AdminChatPage() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selected, setSelected] = useState<number | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [reply, setReply] = useState('');
  const [sending, setSending] = useState(false);
  const [loadingConvs, setLoadingConvs] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Load conversation list
  const loadConversations = () => {
    api.get('/admin/conversations/')
      .then((r) => setConversations(r.data))
      .finally(() => setLoadingConvs(false));
  };

  useEffect(() => {
    loadConversations();
    const interval = setInterval(loadConversations, 10000);
    return () => clearInterval(interval);
  }, []);

  // Load messages for selected conversation, with polling
  const loadMessages = (id: number) => {
    api.get(`/chat/${id}/messages/`)
      .then((r) => setMessages(r.data));
  };

  useEffect(() => {
    if (selected === null) return;
    loadMessages(selected);
    const interval = setInterval(() => loadMessages(selected), 5000);
    return () => clearInterval(interval);
  }, [selected]);

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSelectConversation = (id: number) => {
    setSelected(id);
    setMessages([]);
    setReply('');
  };

  const handleSend = async () => {
    if (!reply.trim() || selected === null) return;
    setSending(true);
    try {
      const { data } = await api.post(`/chat/${selected}/send/`, { body: reply.trim() });
      setMessages((prev) => [...prev, data]);
      setReply('');
      // Refresh conversation list to update preview
      loadConversations();
    } finally {
      setSending(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const selectedConv = conversations.find((c) => c.id === selected);

  return (
    <div className="flex h-screen -m-8">
      {/* Conversation list */}
      <div className="w-72 flex-shrink-0 border-r border-gray-200 bg-white flex flex-col">
        <div className="px-4 py-4 border-b border-gray-100">
          <h1 className="text-base font-bold text-gray-900">Chat Support</h1>
          <p className="text-xs text-gray-400 mt-0.5">{conversations.length} conversations</p>
        </div>
        <div className="flex-1 overflow-y-auto">
          {loadingConvs ? (
            <div className="p-4 text-xs text-gray-400 text-center">Loading...</div>
          ) : conversations.length === 0 ? (
            <div className="p-4 text-xs text-gray-400 text-center">No conversations yet.</div>
          ) : (
            conversations.map((c) => {
              const isActive = selected === c.id;
              const hasUnread = c.last_sender === 'user';
              return (
                <button
                  key={c.id}
                  onClick={() => handleSelectConversation(c.id)}
                  className={`w-full text-left px-4 py-3 border-b border-gray-50 transition ${
                    isActive ? 'bg-indigo-50' : 'hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-center justify-between mb-0.5">
                    <span className={`text-sm font-medium truncate ${isActive ? 'text-indigo-700' : 'text-gray-800'}`}>
                      {c.username ?? c.email}
                    </span>
                    {hasUnread && !isActive && (
                      <span className="w-2 h-2 rounded-full bg-indigo-500 flex-shrink-0" />
                    )}
                  </div>
                  {c.username && (
                    <p className="text-xs text-gray-400 truncate mb-0.5">{c.email}</p>
                  )}
                  {c.last_message && (
                    <p className="text-xs text-gray-400 truncate">
                      {c.last_sender === 'admin' ? 'You: ' : ''}{c.last_message}
                    </p>
                  )}
                  {c.last_message_at && (
                    <p className="text-xs text-gray-300 mt-0.5">
                      {formatTime(c.last_message_at)}
                    </p>
                  )}
                </button>
              );
            })
          )}
        </div>
      </div>

      {/* Message thread */}
      <div className="flex-1 flex flex-col bg-gray-50">
        {selected === null ? (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <svg className="w-12 h-12 text-gray-300 mx-auto mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
              <p className="text-sm text-gray-400">Select a conversation to view messages</p>
            </div>
          </div>
        ) : (
          <>
            {/* Thread header */}
            <div className="px-5 py-3.5 bg-white border-b border-gray-200 flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-xs font-bold text-indigo-600 flex-shrink-0">
                {(selectedConv?.username ?? selectedConv?.email ?? '?')[0].toUpperCase()}
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-900">
                  {selectedConv?.username ?? selectedConv?.email}
                </p>
                {selectedConv?.username && (
                  <p className="text-xs text-gray-400">{selectedConv.email}</p>
                )}
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto px-5 py-4 space-y-3">
              {messages.length === 0 ? (
                <div className="text-xs text-gray-400 text-center mt-8">No messages yet.</div>
              ) : (
                messages.map((m) => {
                  const isAdmin = m.sender === 'admin';
                  return (
                    <div key={m.id} className={`flex ${isAdmin ? 'justify-end' : 'justify-start'}`}>
                      <div
                        className={`max-w-sm px-3.5 py-2.5 rounded-2xl text-sm leading-relaxed ${
                          isAdmin
                            ? 'bg-indigo-600 text-white rounded-br-sm'
                            : 'bg-white text-gray-800 border border-gray-200 rounded-bl-sm shadow-sm'
                        }`}
                      >
                        <p>{m.body}</p>
                        <p className={`text-xs mt-1 ${isAdmin ? 'text-indigo-200' : 'text-gray-400'}`}>
                          {formatTime(m.created_at)}
                        </p>
                      </div>
                    </div>
                  );
                })
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Reply box */}
            <div className="px-5 py-3 bg-white border-t border-gray-200 flex items-end gap-3">
              <textarea
                value={reply}
                onChange={(e) => setReply(e.target.value)}
                onKeyDown={handleKeyDown}
                rows={2}
                placeholder="Type a reply... (Enter to send, Shift+Enter for new line)"
                className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
              />
              <button
                onClick={handleSend}
                disabled={sending || !reply.trim()}
                className="px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 disabled:opacity-40 transition flex-shrink-0"
              >
                {sending ? 'Sending...' : 'Send'}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
