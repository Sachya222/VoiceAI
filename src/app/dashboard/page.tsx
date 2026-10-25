'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/context/AuthContext';
import { db } from '@/lib/firebase/client';
import {
  collection,
  query,
  where,
  getDocs,
  orderBy,
  limit,
} from 'firebase/firestore';
import {
  MessageSquare,
  Mic,
  Calendar,
  CheckCircle2,
  Clock,
  ExternalLink,
  Bot,
  Plus,
  ArrowRight,
  TrendingUp,
  Sparkles,
  Users,
  Shield,
  AlertCircle,
} from 'lucide-react';
import { Conversation, Appointment } from '@/types';

export default function DashboardOverviewPage() {
  const { business, isDemoMode } = useAuth();

  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);

  // Computed summary metrics
  const [metrics, setMetrics] = useState({
    totalConversations: 0,
    voiceSessions: 0,
    pendingAppointments: 0,
    confirmedAppointments: 0,
  });

  const businessId = business?.id || 'demo-biz-apex';
  const businessSlug = business?.slug || 'apex-tech-solutions';

  useEffect(() => {
    async function loadData() {
      setLoading(true);

      if (isDemoMode || !db) {
        // Load demo realistic dataset
        const demoConvs: Conversation[] = [
          {
            id: 'c1',
            businessId: 'demo-biz-apex',
            channel: 'voice',
            status: 'active',
            startedAt: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
            lastMessageAt: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
            customerReference: 'Voice Caller (Browser)',
            previewMessage: 'Asked about laptop screen replacement cost and 60-day warranty.',
          },
          {
            id: 'c2',
            businessId: 'demo-biz-apex',
            channel: 'chat',
            status: 'closed',
            startedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
            lastMessageAt: new Date(Date.now() - 90 * 60 * 1000).toISOString(),
            customerReference: 'David Miller',
            previewMessage: 'Inquired regarding opening hours on Saturday and wheelchair access.',
          },
          {
            id: 'c3',
            businessId: 'demo-biz-apex',
            channel: 'voice',
            status: 'active',
            startedAt: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
            lastMessageAt: new Date(Date.now() - 3.8 * 60 * 60 * 1000).toISOString(),
            customerReference: 'Elena Rostova',
            previewMessage: 'Booked diagnostic appointment for thermal throttling issue.',
          },
        ];

        const demoAppts: Appointment[] = [
          {
            id: 'a1',
            businessId: 'demo-biz-apex',
            customerName: 'Marcus Vance',
            customerEmail: 'marcus@example.com',
            customerPhone: '+1 (555) 789-0123',
            serviceId: 's1',
            serviceName: 'Laptop Screen Replacement',
            startAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
            endAt: new Date(Date.now() + (24 * 60 + 45) * 60 * 1000).toISOString(),
            status: 'confirmed',
            notes: 'Dell XPS 15 4K panel flickers',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          },
          {
            id: 'a2',
            businessId: 'demo-biz-apex',
            customerName: 'Sarah Jenkins',
            customerEmail: 'sarah.j@example.com',
            customerPhone: '+1 (555) 456-7890',
            serviceId: 's2',
            serviceName: 'Comprehensive Hardware Diagnostic',
            startAt: new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString(),
            endAt: new Date(Date.now() + (48 * 60 + 30) * 60 * 1000).toISOString(),
            status: 'pending',
            notes: 'Random reboot under high GPU load',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          },
        ];

        setConversations(demoConvs);
        setAppointments(demoAppts);
        setMetrics({
          totalConversations: 18,
          voiceSessions: 7,
          pendingAppointments: 1,
          confirmedAppointments: 8,
        });
        setLoading(false);
        return;
      }

      try {
        // Real Firestore query
        const convCol = collection(db, 'businesses', businessId, 'conversations');
        const convSnap = await getDocs(query(convCol, limit(10)));
        const loadedConvs = convSnap.docs.map((d: any) => ({ id: d.id, ...d.data() } as Conversation));
        setConversations(loadedConvs);

        const apptCol = collection(db, 'businesses', businessId, 'appointments');
        const apptSnap = await getDocs(query(apptCol, limit(10)));
        const loadedAppts = apptSnap.docs.map((d: any) => ({ id: d.id, ...d.data() } as Appointment));
        setAppointments(loadedAppts);

        const voiceCount = loadedConvs.filter((c: any) => c.channel === 'voice').length;
        const pendingCount = loadedAppts.filter((a: any) => a.status === 'pending').length;
        const confirmedCount = loadedAppts.filter((a: any) => a.status === 'confirmed').length;

        setMetrics({
          totalConversations: loadedConvs.length,
          voiceSessions: voiceCount,
          pendingAppointments: pendingCount,
          confirmedAppointments: confirmedCount,
        });
      } catch (err) {
        console.warn('Firestore load overview error:', err);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [businessId, isDemoMode]);

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-indigo-700 via-indigo-600 to-violet-600 rounded-2xl p-6 sm:p-8 text-white shadow-lg shadow-indigo-600/10 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2 max-w-xl">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-white/15 backdrop-blur-md text-white border border-white/20">
              {isDemoMode ? 'Sandbox Evaluation Mode' : 'Live Production'}
            </span>
            <span className="inline-flex items-center gap-1 text-[11px] text-emerald-300 font-medium">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
              Assistant Published
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Welcome back, {business?.name || 'Apex Tech Solutions'}!
          </h1>
          <p className="text-xs sm:text-sm text-indigo-100 leading-relaxed">
            Your customer AI assistant is handling live enquiries and scheduling appointments. Review real-time conversations and upcoming bookings below.
          </p>
        </div>

        {/* Quick Launch Button */}
        <div className="shrink-0 flex flex-col sm:flex-row gap-3">
          <Link
            href={`/assistant/${businessSlug}`}
            target="_blank"
            className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-white text-indigo-700 hover:bg-indigo-50 font-bold text-xs shadow-md transition-all hover:scale-105"
          >
            <Bot className="w-4 h-4" />
            <span>Launch Public Assistant</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </Link>
          <Link
            href="/dashboard/assistant"
            className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-indigo-800/60 hover:bg-indigo-800 text-white font-medium text-xs border border-indigo-400/40 transition-colors"
          >
            <span>Configure AI</span>
          </Link>
        </div>
      </div>

      {/* Metrics Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Total Conversations
            </p>
            <h3 className="text-2xl font-extrabold text-slate-900 mt-1">
              {metrics.totalConversations}
            </h3>
            <p className="text-[11px] text-indigo-600 font-medium mt-1 flex items-center gap-1">
              <TrendingUp className="w-3 h-3" />
              <span>Real Firestore records</span>
            </p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
            <MessageSquare className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Voice Sessions
            </p>
            <h3 className="text-2xl font-extrabold text-slate-900 mt-1">
              {metrics.voiceSessions}
            </h3>
            <p className="text-[11px] text-violet-600 font-medium mt-1 flex items-center gap-1">
              <Mic className="w-3 h-3" />
              <span>Speech recognition</span>
            </p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-violet-50 text-violet-600 flex items-center justify-center">
            <Mic className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Pending Bookings
            </p>
            <h3 className="text-2xl font-extrabold text-amber-600 mt-1">
              {metrics.pendingAppointments}
            </h3>
            <p className="text-[11px] text-slate-500 font-medium mt-1">Requires manual review</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
            <Clock className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Confirmed Bookings
            </p>
            <h3 className="text-2xl font-extrabold text-emerald-600 mt-1">
              {metrics.confirmedAppointments}
            </h3>
            <p className="text-[11px] text-emerald-600 font-medium mt-1 flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3" />
              <span>Verified slots</span>
            </p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <Calendar className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Main Content Grid: Recent Conversations & Upcoming Appointments */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Conversations Card */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-indigo-600" />
              <h2 className="font-bold text-slate-900 text-sm">Recent Customer Conversations</h2>
            </div>
            <Link
              href="/dashboard/conversations"
              className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 flex items-center gap-1"
            >
              <span>View All</span>
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          {conversations.length === 0 ? (
            <div className="text-center py-8 bg-slate-50 rounded-xl border border-dashed border-slate-200">
              <MessageSquare className="w-8 h-8 text-slate-400 mx-auto mb-2" />
              <p className="text-xs font-semibold text-slate-700">No conversations recorded yet</p>
              <p className="text-[11px] text-slate-500 max-w-xs mx-auto mt-1">
                Open your public assistant link and ask a test question or use microphone voice chat!
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {conversations.slice(0, 4).map((c) => (
                <div
                  key={c.id}
                  className="p-3.5 rounded-xl bg-slate-50 hover:bg-slate-100/80 border border-slate-200/70 transition-colors space-y-1.5"
                >
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-slate-800">
                      {c.customerReference || 'Anonymous Customer'}
                    </span>
                    <div className="flex items-center gap-2">
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-semibold ${
                          c.channel === 'voice'
                            ? 'bg-violet-100 text-violet-700'
                            : 'bg-indigo-100 text-indigo-700'
                        }`}
                      >
                        {c.channel === 'voice' ? <Mic className="w-2.5 h-2.5" /> : <MessageSquare className="w-2.5 h-2.5" />}
                        {c.channel.toUpperCase()}
                      </span>
                      <span className="text-[10px] text-slate-400">
                        {new Date(c.lastMessageAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  </div>
                  <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                    {c.previewMessage || 'Active session'}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Upcoming Appointments Card */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-emerald-600" />
              <h2 className="font-bold text-slate-900 text-sm">Upcoming Scheduled Appointments</h2>
            </div>
            <Link
              href="/dashboard/appointments"
              className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 flex items-center gap-1"
            >
              <span>Manage</span>
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          {appointments.length === 0 ? (
            <div className="text-center py-8 bg-slate-50 rounded-xl border border-dashed border-slate-200">
              <Calendar className="w-8 h-8 text-slate-400 mx-auto mb-2" />
              <p className="text-xs font-semibold text-slate-700">No appointments scheduled</p>
              <p className="text-[11px] text-slate-500 max-w-xs mx-auto mt-1">
                When customers schedule slots through the AI assistant, they will appear here in real time.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {appointments.slice(0, 4).map((a) => (
                <div
                  key={a.id}
                  className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/70 space-y-2"
                >
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-slate-900">{a.customerName}</span>
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-semibold uppercase ${
                        a.status === 'confirmed'
                          ? 'bg-emerald-100 text-emerald-800'
                          : a.status === 'pending'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-slate-200 text-slate-700'
                      }`}
                    >
                      {a.status}
                    </span>
                  </div>
                  <div className="text-xs text-slate-600 flex items-center justify-between">
                    <span className="font-medium text-indigo-700">{a.serviceName}</span>
                    <span className="text-[11px] text-slate-500">
                      {new Date(a.startAt).toLocaleString([], {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </div>
                  {a.notes && (
                    <p className="text-[11px] text-slate-500 italic bg-white p-1.5 rounded border border-slate-200/60">
                      Note: {a.notes}
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
