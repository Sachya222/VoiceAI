'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/lib/context/AuthContext';
import { db } from '@/lib/firebase/client';
import { collection, getDocs, query, orderBy, doc } from 'firebase/firestore';
import {
  MessageSquare,
  Mic,
  Calendar,
  Search,
  Filter,
  User,
  AlertTriangle,
  Bot,
  Clock,
  ChevronRight,
  X,
} from 'lucide-react';
import { Conversation, ChatMessage } from '@/types';

export default function ConversationsPage() {
  const { business, isDemoMode } = useAuth();
  const businessId = business?.id || 'demo-biz-apex';

  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [channelFilter, setChannelFilter] = useState<'all' | 'chat' | 'voice'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadConversations() {
      setLoading(true);
      if (isDemoMode || !db) {
        setConversations([
          {
            id: 'c1',
            businessId,
            channel: 'voice',
            status: 'active',
            startedAt: new Date(Date.now() - 20 * 60 * 1000).toISOString(),
            lastMessageAt: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
            customerReference: 'Voice Caller (Browser)',
            previewMessage: 'Asked about laptop screen replacement cost and 60-day warranty.',
          },
          {
            id: 'c2',
            businessId,
            channel: 'chat',
            status: 'closed',
            startedAt: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
            lastMessageAt: new Date(Date.now() - 2.5 * 60 * 60 * 1000).toISOString(),
            customerReference: 'David Miller',
            previewMessage: 'Inquired regarding opening hours on Saturday and wheelchair access.',
          },
          {
            id: 'c3',
            businessId,
            channel: 'voice',
            status: 'needs_human',
            startedAt: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
            lastMessageAt: new Date(Date.now() - 4.5 * 60 * 60 * 1000).toISOString(),
            customerReference: 'Elena Rostova',
            previewMessage: 'Requested human representative for custom B2B server rack maintenance.',
          },
        ]);
        setLoading(false);
        return;
      }

      try {
        const snap = await getDocs(collection(db, 'businesses', businessId, 'conversations'));
        setConversations(snap.docs.map((d: any) => ({ id: d.id, ...d.data() } as Conversation)));
      } catch (err) {
        console.warn('Error fetching conversations:', err);
      } finally {
        setLoading(false);
      }
    }

    loadConversations();
  }, [businessId, isDemoMode]);

  const handleSelectConversation = async (conv: Conversation) => {
    setSelectedConversation(conv);
    if (isDemoMode || !db) {
      if (conv.id === 'c1') {
        setMessages([
          {
            id: 'm1',
            conversationId: 'c1',
            sender: 'assistant',
            content:
              'Hello! I am the automated assistant for Apex Tech Solutions. How can I assist you with repairs or appointments today?',
            timestamp: conv.startedAt,
          },
          {
            id: 'm2',
            conversationId: 'c1',
            sender: 'user',
            content: 'Hi! What are your laptop repair charges and do you offer warranty?',
            timestamp: new Date(Date.now() - 10 * 60 * 1000).toISOString(),
            isVoice: true,
          },
          {
            id: 'm3',
            conversationId: 'c1',
            sender: 'assistant',
            content:
              'Our Laptop Screen Replacement starts at $129 (45 mins) and Hardware Diagnostics is $49 (30 mins). All parts and labor include a 60-day replacement warranty!',
            timestamp: conv.lastMessageAt,
          },
        ]);
      } else if (conv.id === 'c3') {
        setMessages([
          {
            id: 'm1',
            conversationId: 'c3',
            sender: 'assistant',
            content: 'Hello! Welcome to Apex Tech Solutions. How may I help you today?',
            timestamp: conv.startedAt,
          },
          {
            id: 'm2',
            conversationId: 'c3',
            sender: 'user',
            content: 'Can I speak with a human engineer regarding enterprise server maintenance?',
            timestamp: conv.lastMessageAt,
            isVoice: true,
          },
          {
            id: 'm3',
            conversationId: 'c3',
            sender: 'assistant',
            content:
              'Certainly! You can reach our enterprise specialist directly at +1 (555) 234-5678 or support@apextech.demo. I have also flagged this enquiry for staff follow-up.',
            timestamp: conv.lastMessageAt,
          },
        ]);
      } else {
        setMessages([
          {
            id: 'm1',
            conversationId: conv.id,
            sender: 'assistant',
            content: 'Hello! How can I help you today?',
            timestamp: conv.startedAt,
          },
          {
            id: 'm2',
            conversationId: conv.id,
            sender: 'user',
            content: conv.previewMessage || 'Customer message',
            timestamp: conv.lastMessageAt,
          },
        ]);
      }
      return;
    }

    try {
      const msgSnap = await getDocs(
        collection(db, 'businesses', businessId, 'conversations', conv.id, 'messages')
      );
      setMessages(msgSnap.docs.map((d: any) => ({ id: d.id, ...d.data() } as ChatMessage)));
    } catch (err) {
      console.warn('Error fetching messages:', err);
    }
  };

  const filteredConversations = conversations.filter((c) => {
    const matchChannel = channelFilter === 'all' || c.channel === channelFilter;
    const matchSearch =
      (c.customerReference || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (c.previewMessage || '').toLowerCase().includes(searchTerm.toLowerCase());
    return matchChannel && matchSearch;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
          <MessageSquare className="w-5 h-5 text-indigo-600" />
          <span>Customer Conversations & Transcripts</span>
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Audit customer voice sessions and text chat interactions, review transcripts, and identify handoff requests.
        </p>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-3 rounded-2xl border border-slate-200/80 shadow-xs">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setChannelFilter('all')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
              channelFilter === 'all' ? 'bg-indigo-600 text-white shadow-xs' : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            All Channels
          </button>
          <button
            onClick={() => setChannelFilter('voice')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
              channelFilter === 'voice'
                ? 'bg-violet-600 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Mic className="w-3 h-3" />
            <span>Voice Sessions</span>
          </button>
          <button
            onClick={() => setChannelFilter('chat')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
              channelFilter === 'chat'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <MessageSquare className="w-3 h-3" />
            <span>Text Chat</span>
          </button>
        </div>

        <div className="relative w-full sm:w-64">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
            <Search className="w-3.5 h-3.5" />
          </div>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search transcripts..."
            className="w-full pl-9 pr-3 py-1.5 text-xs rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-600 outline-none"
          />
        </div>
      </div>

      {/* Conversation List */}
      <div className="space-y-3">
        {filteredConversations.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-2xl border border-slate-200/80">
            <MessageSquare className="w-8 h-8 text-slate-300 mx-auto mb-2" />
            <p className="text-xs font-semibold text-slate-700">No conversations recorded</p>
            <p className="text-[11px] text-slate-500 mt-0.5">
              Customer enquiries through the public assistant will be preserved and accessible here.
            </p>
          </div>
        ) : (
          filteredConversations.map((c) => (
            <div
              key={c.id}
              onClick={() => handleSelectConversation(c)}
              className="bg-white hover:bg-slate-50/80 cursor-pointer rounded-2xl p-5 border border-slate-200/80 shadow-xs transition-all flex items-center justify-between gap-4 group"
            >
              <div className="space-y-1.5 flex-1 min-w-0">
                <div className="flex items-center gap-3">
                  <span className="font-bold text-slate-900 text-sm">
                    {c.customerReference || 'Anonymous Visitor'}
                  </span>
                  <span
                    className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold uppercase ${
                      c.channel === 'voice'
                        ? 'bg-violet-100 text-violet-700'
                        : 'bg-indigo-100 text-indigo-700'
                    }`}
                  >
                    {c.channel === 'voice' ? <Mic className="w-2.5 h-2.5" /> : <MessageSquare className="w-2.5 h-2.5" />}
                    {c.channel}
                  </span>
                  {c.status === 'needs_human' && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold bg-rose-100 text-rose-700">
                      <AlertTriangle className="w-2.5 h-2.5" />
                      Human Handoff Requested
                    </span>
                  )}
                </div>

                <p className="text-xs text-slate-600 truncate leading-relaxed">
                  {c.previewMessage || 'Open to view message history.'}
                </p>

                <div className="flex items-center gap-3 text-[11px] text-slate-400">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    Last active: {new Date(c.lastMessageAt).toLocaleString([], {
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>
                </div>
              </div>

              <ChevronRight className="w-5 h-5 text-slate-400 group-hover:text-indigo-600 group-hover:translate-x-1 transition-all shrink-0" />
            </div>
          ))
        )}
      </div>

      {/* Transcript Modal / Drawer */}
      {selectedConversation && (
        <div className="fixed inset-0 bg-slate-900/40 z-50 flex items-center justify-center p-4 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-2xl border border-slate-200 flex flex-col h-[520px]">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 shrink-0">
              <div>
                <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                  <MessageSquare className="w-4 h-4 text-indigo-600" />
                  <span>Transcript — {selectedConversation.customerReference}</span>
                </h3>
                <p className="text-[11px] text-slate-500">
                  Channel: {selectedConversation.channel.toUpperCase()} • Session ID: {selectedConversation.id}
                </p>
              </div>
              <button
                onClick={() => setSelectedConversation(null)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Messages Body */}
            <div className="flex-1 overflow-y-auto py-4 space-y-3">
              {messages.map((m) => (
                <div
                  key={m.id}
                  className={`flex items-start gap-2 ${
                    m.sender === 'user' ? 'justify-end' : 'justify-start'
                  }`}
                >
                  {m.sender === 'assistant' && (
                    <div className="w-7 h-7 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center text-xs font-bold shrink-0">
                      AI
                    </div>
                  )}
                  <div
                    className={`p-3.5 rounded-2xl max-w-[82%] text-xs leading-relaxed ${
                      m.sender === 'user'
                        ? 'bg-indigo-600 text-white rounded-tr-none'
                        : 'bg-slate-100 text-slate-800 rounded-tl-none'
                    }`}
                  >
                    {m.content}
                    {m.isVoice && (
                      <span className="block text-[10px] opacity-75 mt-1 font-medium">
                        🎤 Captured via Voice Input
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-end shrink-0">
              <button
                onClick={() => setSelectedConversation(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
              >
                Close Transcript
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
