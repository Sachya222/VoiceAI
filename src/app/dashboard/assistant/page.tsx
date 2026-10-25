'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/lib/context/AuthContext';
import { db } from '@/lib/firebase/client';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import {
  Bot,
  Sparkles,
  Save,
  Mic,
  Send,
  Volume2,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Settings2,
  RefreshCw,
} from 'lucide-react';
import { AssistantConfig, AssistantTone } from '@/types';

export default function AssistantConfigPage() {
  const { business, isDemoMode } = useAuth();
  const businessId = business?.id || 'demo-biz-apex';

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Form state
  const [assistantName, setAssistantName] = useState('Apex AI Assistant');
  const [welcomeMessage, setWelcomeMessage] = useState(
    'Hi! Welcome to Apex Tech Solutions. How can I assist you with laptop repairs, hardware upgrades, or diagnostics today?'
  );
  const [tone, setTone] = useState<AssistantTone>('friendly');
  const [language, setLanguage] = useState('English');
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  const [appointmentEnabled, setAppointmentEnabled] = useState(true);
  const [published, setPublished] = useState(true);
  const [customInstructions, setCustomInstructions] = useState(
    'Always mention our 60-day warranty on all repairs and recommend booking an appointment for immediate bench diagnostics.'
  );

  // Test Chat Simulator State
  const [testMessages, setTestMessages] = useState<Array<{ sender: 'user' | 'assistant'; content: string }>>([
    {
      sender: 'assistant',
      content:
        'Hi! Welcome to Apex Tech Solutions. How can I assist you with laptop repairs, hardware upgrades, or diagnostics today?',
    },
  ]);
  const [testInput, setTestInput] = useState('');
  const [testLoading, setTestLoading] = useState(false);

  useEffect(() => {
    async function loadConfig() {
      if (isDemoMode || !db) {
        setLoading(false);
        return;
      }
      try {
        const snap = await getDoc(doc(db, 'businesses', businessId, 'assistant', 'config'));
        if (snap.exists()) {
          const data = snap.data() as AssistantConfig;
          setAssistantName(data.assistantName || 'Apex AI Assistant');
          setWelcomeMessage(data.welcomeMessage || '');
          setTone(data.tone || 'friendly');
          setLanguage(data.language || 'English');
          setVoiceEnabled(data.voiceEnabled ?? true);
          setAppointmentEnabled(data.appointmentEnabled ?? true);
          setPublished(data.published ?? true);
          setCustomInstructions(data.customInstructions || '');
        }
      } catch (err) {
        console.warn('Error loading assistant config:', err);
      } finally {
        setLoading(false);
      }
    }
    loadConfig();
  }, [businessId, isDemoMode]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSaveSuccess(false);

    const configData: AssistantConfig = {
      businessId,
      assistantName,
      welcomeMessage,
      tone,
      language,
      voiceEnabled,
      appointmentEnabled,
      published,
      customInstructions,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    try {
      if (!isDemoMode && db) {
        await setDoc(doc(db, 'businesses', businessId, 'assistant', 'config'), {
          ...configData,
          serverUpdatedAt: serverTimestamp(),
        });
      }
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err) {
      console.error('Error saving config:', err);
    } finally {
      setSaving(false);
    }
  };

  const handleSendTestMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!testInput.trim() || testLoading) return;

    const userText = testInput.trim();
    setTestMessages((prev) => [...prev, { sender: 'user', content: userText }]);
    setTestInput('');
    setTestLoading(true);

    try {
      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          businessId,
          message: userText,
          history: testMessages,
          channel: 'chat',
        }),
      });

      const data = await res.json();
      if (data.reply) {
        setTestMessages((prev) => [...prev, { sender: 'assistant', content: data.reply }]);
      } else {
        setTestMessages((prev) => [
          ...prev,
          { sender: 'assistant', content: 'I received your query. How else may I assist you with our services?' },
        ]);
      }
    } catch (err) {
      console.warn('Test chat error:', err);
      setTestMessages((prev) => [
        ...prev,
        {
          sender: 'assistant',
          content: 'I am here to assist with services, products, hours, and booking requests.',
        },
      ]);
    } finally {
      setTestLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Title & Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            <Bot className="w-5 h-5 text-indigo-600" />
            <span>AI Assistant Configuration & Simulator</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Customize your AI's name, tone, custom instructions, and test grounded responses live.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left column: Configuration form */}
        <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs">
          {saveSuccess && (
            <div className="mb-4 p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Assistant configuration saved successfully!</span>
            </div>
          )}

          <form onSubmit={handleSave} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Assistant Name *
                </label>
                <input
                  type="text"
                  required
                  value={assistantName}
                  onChange={(e) => setAssistantName(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:ring-2 focus:ring-indigo-600 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Tone</label>
                <select
                  value={tone}
                  onChange={(e) => setTone(e.target.value as AssistantTone)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:ring-2 focus:ring-indigo-600 outline-none bg-white"
                >
                  <option value="friendly">Friendly & Helpful</option>
                  <option value="professional">Professional & Direct</option>
                  <option value="concise">Concise & Brief</option>
                  <option value="empathetic">Empathetic & Attentive</option>
                  <option value="enthusiastic">Enthusiastic & Welcoming</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Default Welcome Message
              </label>
              <textarea
                rows={2}
                value={welcomeMessage}
                onChange={(e) => setWelcomeMessage(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:ring-2 focus:ring-indigo-600 outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Business-Specific Grounding Instructions
              </label>
              <textarea
                rows={3}
                value={customInstructions}
                onChange={(e) => setCustomInstructions(e.target.value)}
                placeholder="e.g. Highlight our 60-day warranty. If asked about student discount, say we give 10% off with ID."
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:ring-2 focus:ring-indigo-600 outline-none"
              />
              <p className="text-[11px] text-slate-500 mt-1">
                These rules are securely injected into the system prompt behind server-side routes.
              </p>
            </div>

            {/* Feature Toggles */}
            <div className="space-y-2.5 pt-2 border-t border-slate-100">
              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200/70">
                <div>
                  <span className="text-xs font-semibold text-slate-800 block">
                    Public Publication Status
                  </span>
                  <span className="text-[11px] text-slate-500">
                    When enabled, customers can access the assistant at /assistant/[slug]
                  </span>
                </div>
                <input
                  type="checkbox"
                  checked={published}
                  onChange={(e) => setPublished(e.target.checked)}
                  className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500"
                />
              </div>

              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200/70">
                <div>
                  <span className="text-xs font-semibold text-slate-800 block">
                    Browser Voice Support
                  </span>
                  <span className="text-[11px] text-slate-500">
                    Enable speech recognition & voice playback
                  </span>
                </div>
                <input
                  type="checkbox"
                  checked={voiceEnabled}
                  onChange={(e) => setVoiceEnabled(e.target.checked)}
                  className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500"
                />
              </div>

              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200/70">
                <div>
                  <span className="text-xs font-semibold text-slate-800 block">
                    Appointment Booking Flow
                  </span>
                  <span className="text-[11px] text-slate-500">
                    Allow scheduling slots directly through natural conversation
                  </span>
                </div>
                <input
                  type="checkbox"
                  checked={appointmentEnabled}
                  onChange={(e) => setAppointmentEnabled(e.target.checked)}
                  className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500"
                />
              </div>
            </div>

            <div className="pt-3">
              <button
                type="submit"
                disabled={saving}
                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-sm transition-all disabled:opacity-50"
              >
                {saving ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Saving...</span>
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    <span>Save Assistant Configuration</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Right column: Interactive Live Test Simulator */}
        <div className="lg:col-span-5 bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden flex flex-col h-[580px]">
          {/* Simulator Header */}
          <div className="bg-slate-900 p-4 text-white flex items-center justify-between shrink-0">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-indigo-600 flex items-center justify-center text-white">
                <Bot className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-xs font-bold text-white">{assistantName}</h3>
                <p className="text-[10px] text-slate-400">Live Grounded Sandbox Test</p>
              </div>
            </div>
            <button
              onClick={() =>
                setTestMessages([
                  {
                    sender: 'assistant',
                    content: welcomeMessage,
                  },
                ])
              }
              className="p-1.5 text-slate-400 hover:text-white rounded-lg transition-colors"
              title="Reset Test Conversation"
            >
              <RefreshCw className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Chat Stream */}
          <div className="flex-1 p-4 bg-slate-50/70 overflow-y-auto space-y-3">
            {testMessages.map((msg, i) => (
              <div
                key={i}
                className={`flex items-start gap-2 ${
                  msg.sender === 'user' ? 'justify-end' : 'justify-start'
                }`}
              >
                {msg.sender === 'assistant' && (
                  <div className="w-6 h-6 rounded-md bg-indigo-100 text-indigo-700 flex items-center justify-center text-[10px] font-bold shrink-0">
                    AI
                  </div>
                )}
                <div
                  className={`p-3 rounded-xl max-w-[85%] text-xs leading-relaxed ${
                    msg.sender === 'user'
                      ? 'bg-indigo-600 text-white rounded-tr-none'
                      : 'bg-white border border-slate-200 text-slate-800 rounded-tl-none shadow-2xs'
                  }`}
                >
                  {msg.content}
                </div>
              </div>
            ))}
            {testLoading && (
              <div className="flex items-center gap-2 text-xs text-slate-400">
                <Loader2 className="w-3.5 h-3.5 animate-spin text-indigo-600" />
                <span>Generating grounded response...</span>
              </div>
            )}
          </div>

          {/* Simulator Input Form */}
          <form
            onSubmit={handleSendTestMessage}
            className="p-3 bg-white border-t border-slate-200 flex items-center gap-2 shrink-0"
          >
            <input
              type="text"
              value={testInput}
              onChange={(e) => setTestInput(e.target.value)}
              placeholder="Ask a question (e.g. repair cost, hours)..."
              className="flex-1 px-3 py-2 text-xs rounded-xl border border-slate-300 focus:ring-2 focus:ring-indigo-600 outline-none"
            />
            <button
              type="submit"
              disabled={testLoading || !testInput.trim()}
              className="p-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white disabled:opacity-50 transition-colors"
            >
              <Send className="w-3.5 h-3.5" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
