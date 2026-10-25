'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import {
  Mic,
  MessageSquare,
  Calendar,
  Sparkles,
  ShieldCheck,
  Zap,
  ArrowRight,
  CheckCircle,
  Building2,
  Clock,
  Layers,
  Bot,
  MapPin,
  TrendingUp,
} from 'lucide-react';

const USE_CASES = [
  {
    title: 'Computer & Repair Shops',
    example: 'Apex Tech Solutions',
    description: 'Explain diagnostics, screen repair fees, warranty policies, and book workbench time.',
    icon: '💻',
    tag: 'Hardware & Tech',
  },
  {
    title: 'Healthcare & Clinics',
    example: 'Apex Wellness Clinic',
    description: 'Explain specialized treatments, physician availability, and schedule patient appointments.',
    icon: '🩺',
    tag: 'Healthcare',
  },
  {
    title: 'Restaurants & Cafes',
    example: 'Urban Bistro & Grill',
    description: 'Share dietary menus, chef specials, opening hours, directions, and table reservations.',
    icon: '🍽️',
    tag: 'Hospitality',
  },
  {
    title: 'Salons & Spas',
    example: 'Glow Wellness Studio',
    description: 'Display styling packages, pricing, durations, and manage staff slot bookings.',
    icon: '✂️',
    tag: 'Personal Care',
  },
  {
    title: 'Coaching & Education',
    example: 'Apex Academy',
    description: 'Answer questions about course curricula, batch timings, fees, and trial classes.',
    icon: '📚',
    tag: 'Education',
  },
  {
    title: 'Real Estate Agencies',
    example: 'Prime Horizon Realty',
    description: 'Share property specs, price brackets, neighborhood details, and schedule site visits.',
    icon: '🏢',
    tag: 'Real Estate',
  },
];

const FEATURES = [
  {
    title: 'Browser Voice Interaction',
    description: 'Hands-free speech-to-text recognition and text-to-speech audio feedback powered by Web Speech APIs.',
    icon: Mic,
  },
  {
    title: 'Grounded AI Intelligence',
    description: 'Zero hallucinations. The AI strictly references your configured products, pricing, hours, and business documents.',
    icon: Bot,
  },
  {
    title: 'Smart Appointment Scheduling',
    description: 'Server-side double-booking prevention, business timezone handling, breaks, and customizable duration slots.',
    icon: Calendar,
  },
  {
    title: 'Multi-Tenant Firestore Isolation',
    description: 'Strict security boundaries ensure each business operates within its own encrypted database partition.',
    icon: ShieldCheck,
  },
  {
    title: 'Live Conversation Audit',
    description: 'Inspect full message histories, voice sessions, and identify customers requesting human handoff.',
    icon: MessageSquare,
  },
  {
    title: 'Real Database Analytics',
    description: 'Track conversation metrics, channel breakdowns, conversion rates, and booking requests in real time.',
    icon: TrendingUp,
  },
];

export default function HomePage() {
  const [demoQuery, setDemoQuery] = useState('');
  const [demoAnswer, setDemoAnswer] = useState<string | null>(null);

  const sampleQuestions = [
    'What are your laptop repair charges?',
    'What are your opening hours today?',
    'Where is your shop located?',
    'How do I book an appointment?',
  ];

  const handleQuickAsk = (q: string) => {
    setDemoQuery(q);
    if (q.includes('repair')) {
      setDemoAnswer(
        'Our Laptop Screen Replacement starts at $129 (45 mins) and Comprehensive Hardware Diagnostic is $49 (30 mins). All parts include a 60-day warranty!'
      );
    } else if (q.includes('hours')) {
      setDemoAnswer(
        'We are open Monday to Friday from 9:00 AM to 6:00 PM (1:00 PM - 2:00 PM lunch break) and Saturday from 10:00 AM to 3:00 PM.'
      );
    } else if (q.includes('located')) {
      setDemoAnswer(
        'Apex Tech Solutions is located at 104 Innovation Way, Suite 200, San Francisco, CA. Free customer parking is available in the back!'
      );
    } else {
      setDemoAnswer(
        'You can book an appointment directly through our online scheduler! Simply pick your service, choose an available time slot, and receive instant confirmation.'
      );
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-12 pb-20 md:pt-20 md:pb-32 bg-gradient-to-b from-indigo-50/50 via-white to-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto space-y-6">
            {/* Pill Badge */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-50 border border-indigo-200/80 text-indigo-700 text-xs font-semibold shadow-xs">
              <Sparkles className="w-3.5 h-3.5 text-indigo-600 animate-spin-slow" />
              <span>VoiceAI 1.0 — Multi-Tenant AI Business Platform</span>
            </div>

            {/* Main Headline */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 tracking-tight leading-[1.15]">
              Your Business. Your AI.{' '}
              <span className="bg-gradient-to-r from-indigo-600 via-indigo-700 to-violet-600 bg-clip-text text-transparent">
                Always Ready.
              </span>
            </h1>

            {/* Subheading */}
            <p className="text-base sm:text-lg text-slate-600 leading-relaxed max-w-2xl mx-auto">
              Empower your business with an autonomous AI voice & chat assistant. Answer customer queries, showcase products, explain service fees, share map directions, and book appointments 24/7.
            </p>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
              <Link
                href="/signup"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-medium text-sm shadow-md shadow-indigo-500/25 transition-all hover:scale-[1.02]"
              >
                <span>Create Business Assistant</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="/assistant/apex-tech-solutions"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-white hover:bg-slate-50 border border-slate-300 text-slate-700 font-medium text-sm shadow-sm transition-all"
              >
                <Mic className="w-4 h-4 text-indigo-600" />
                <span>Try Live Demo Assistant</span>
              </Link>
            </div>

            {/* Trust Points */}
            <div className="pt-6 flex flex-wrap items-center justify-center gap-6 text-xs text-slate-500">
              <div className="flex items-center gap-1.5">
                <CheckCircle className="w-4 h-4 text-emerald-500" />
                <span>No credit card required</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle className="w-4 h-4 text-emerald-500" />
                <span>Zero AI hallucinations guarantee</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle className="w-4 h-4 text-emerald-500" />
                <span>Voice input & Speech synthesis</span>
              </div>
            </div>
          </div>

          {/* Interactive Live Assistant Sandbox */}
          <div className="mt-14 max-w-4xl mx-auto">
            <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xl shadow-slate-200/50 overflow-hidden">
              {/* Header Bar */}
              <div className="bg-slate-900 px-6 py-4 flex items-center justify-between text-white">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-indigo-600 flex items-center justify-center text-white">
                    <Bot className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-white">Apex Tech Solutions Assistant</h3>
                    <p className="text-[11px] text-slate-400">Public Customer Interaction Preview</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center gap-1 text-[11px] text-emerald-400 bg-emerald-950/60 px-2.5 py-0.5 rounded-full border border-emerald-800">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                    Voice Enabled
                  </span>
                </div>
              </div>

              {/* Chat Simulation Body */}
              <div className="p-6 bg-slate-50/70 space-y-4">
                {/* Assistant greeting */}
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center text-xs font-bold shrink-0">
                    AI
                  </div>
                  <div className="bg-white border border-slate-200 rounded-2xl rounded-tl-none p-4 max-w-lg shadow-xs text-sm text-slate-800 leading-relaxed">
                    Hello! I am the automated assistant for <strong>Apex Tech Solutions</strong>. I can answer questions regarding laptop repair prices, our location on Innovation Way, opening hours, or help schedule your diagnostic appointment. How may I assist you today?
                  </div>
                </div>

                {/* Simulated response if question clicked */}
                {demoAnswer && (
                  <>
                    <div className="flex items-start justify-end gap-3">
                      <div className="bg-indigo-600 text-white rounded-2xl rounded-tr-none p-3.5 max-w-md shadow-xs text-sm">
                        {demoQuery}
                      </div>
                      <div className="w-8 h-8 rounded-lg bg-slate-200 text-slate-700 flex items-center justify-center text-xs font-bold shrink-0">
                        You
                      </div>
                    </div>
                    <div className="flex items-start gap-3 animate-fade-in">
                      <div className="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center text-xs font-bold shrink-0">
                        AI
                      </div>
                      <div className="bg-white border border-slate-200 rounded-2xl rounded-tl-none p-4 max-w-lg shadow-xs text-sm text-slate-800 leading-relaxed">
                        {demoAnswer}
                      </div>
                    </div>
                  </>
                )}

                {/* Quick Prompts */}
                <div className="pt-2">
                  <p className="text-xs font-medium text-slate-500 mb-2">Click to test instant grounded answers:</p>
                  <div className="flex flex-wrap gap-2">
                    {sampleQuestions.map((q) => (
                      <button
                        key={q}
                        onClick={() => handleQuickAsk(q)}
                        className="text-xs bg-white hover:bg-indigo-50 hover:text-indigo-700 hover:border-indigo-200 border border-slate-200 text-slate-700 px-3 py-1.5 rounded-lg transition-all shadow-xs text-left"
                      >
                        {q}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Bottom bar */}
              <div className="p-4 bg-white border-t border-slate-200 flex items-center justify-between">
                <span className="text-xs text-slate-500">
                  Try full voice recognition on the dedicated page:
                </span>
                <Link
                  href="/assistant/apex-tech-solutions"
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-indigo-600 hover:text-indigo-700"
                >
                  <span>Open Dedicated Assistant Page</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section id="features" className="py-20 bg-white border-t border-slate-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-xs font-bold uppercase tracking-wider text-indigo-600 mb-2">
              Engineered for Real-World Businesses
            </h2>
            <h3 className="text-3xl font-extrabold text-slate-900 tracking-tight sm:text-4xl">
              Everything Your Business Needs to Automate Front-Desk Operations
            </h3>
            <p className="mt-4 text-sm text-slate-600">
              From speech-to-text to conflict-free appointment booking, VoiceAI combines complete SaaS tooling into one coherent system.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {FEATURES.map((feat) => {
              const Icon = feat.icon;
              return (
                <div
                  key={feat.title}
                  className="bg-slate-50/60 hover:bg-white rounded-2xl p-6 border border-slate-200/80 hover:border-indigo-200 hover:shadow-lg hover:shadow-indigo-500/5 transition-all group"
                >
                  <div className="w-12 h-12 rounded-xl bg-indigo-100/70 text-indigo-600 flex items-center justify-center mb-5 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                    <Icon className="w-6 h-6" />
                  </div>
                  <h4 className="text-base font-bold text-slate-900 mb-2">{feat.title}</h4>
                  <p className="text-xs text-slate-600 leading-relaxed">{feat.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Use Cases Section */}
      <section id="use-cases" className="py-20 bg-slate-50 border-t border-slate-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-xs font-bold uppercase tracking-wider text-indigo-600 mb-2">
              Universal Applicability
            </h2>
            <h3 className="text-3xl font-extrabold text-slate-900 tracking-tight sm:text-4xl">
              Custom-Tailored for Every Industry
            </h3>
            <p className="mt-4 text-sm text-slate-600">
              Each registered business gets an isolated AI personality configured with its exact products, hours, and appointment rules.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {USE_CASES.map((uc) => (
              <div
                key={uc.title}
                className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs hover:border-indigo-300 transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-2xl">{uc.icon}</span>
                    <span className="text-[10px] font-semibold uppercase px-2 py-0.5 rounded bg-slate-100 text-slate-600">
                      {uc.tag}
                    </span>
                  </div>
                  <h4 className="font-bold text-slate-900 text-base mb-1">{uc.title}</h4>
                  <p className="text-xs font-medium text-indigo-600 mb-3">Example: {uc.example}</p>
                  <p className="text-xs text-slate-600 leading-relaxed">{uc.description}</p>
                </div>
                <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between text-xs">
                  <span className="text-slate-400">Ready in 5 minutes</span>
                  <Link href="/signup" className="text-indigo-600 font-semibold hover:underline">
                    Create Assistant →
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Architecture Highlights */}
      <section id="architecture" className="py-20 bg-white border-t border-slate-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-violet-50 text-violet-700 text-xs font-semibold mb-4 border border-violet-200">
                <Layers className="w-3.5 h-3.5" />
                <span>B.Tech CSE Capstone Architecture</span>
              </div>
              <h3 className="text-3xl font-extrabold text-slate-900 tracking-tight sm:text-4xl mb-6">
                Separation of Concerns: Owner, Customer, and Platform Admin
              </h3>
              <p className="text-sm text-slate-600 leading-relaxed mb-6">
                The architecture prevents customer requests from ever leaking business owner credentials or adjacent tenant records. Server-side API endpoints orchestrate Google Gemini models, Cloud Firestore transactions, and browser voice interfaces safely.
              </p>

              <div className="space-y-4 text-xs text-slate-700">
                <div className="flex items-start gap-3 p-3 bg-slate-50 rounded-xl border border-slate-200/80">
                  <div className="w-6 h-6 rounded-lg bg-indigo-600 text-white flex items-center justify-center font-bold text-xs shrink-0">
                    1
                  </div>
                  <div>
                    <h5 className="font-bold text-slate-900">Owner Experience</h5>
                    <p className="text-slate-600 mt-0.5">Guided onboarding, products & services CRUD, business hours, and analytics.</p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 bg-slate-50 rounded-xl border border-slate-200/80">
                  <div className="w-6 h-6 rounded-lg bg-violet-600 text-white flex items-center justify-center font-bold text-xs shrink-0">
                    2
                  </div>
                  <div>
                    <h5 className="font-bold text-slate-900">Customer Public Experience</h5>
                    <p className="text-slate-600 mt-0.5">Fast, responsive voice & text chat, directions, and validated appointment requests.</p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 bg-slate-50 rounded-xl border border-slate-200/80">
                  <div className="w-6 h-6 rounded-lg bg-emerald-600 text-white flex items-center justify-center font-bold text-xs shrink-0">
                    3
                  </div>
                  <div>
                    <h5 className="font-bold text-slate-900">Secure Server Backend</h5>
                    <p className="text-slate-600 mt-0.5">Strict Firestore Security Rules, UTC timestamping, and double-booking prevention.</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Architecture Card */}
            <div className="bg-slate-900 rounded-2xl p-6 text-white border border-slate-800 shadow-xl font-mono text-xs space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-rose-500"></div>
                  <div className="w-3 h-3 rounded-full bg-amber-500"></div>
                  <div className="w-3 h-3 rounded-full bg-emerald-500"></div>
                </div>
                <span className="text-slate-400 text-[11px]">architecture-flow.json</span>
              </div>
              <div className="text-emerald-400">// Client-to-AI Secure Pipeline</div>
              <p className="text-slate-300">
                [Client Browser / Microphone]
                <br />
                &nbsp;&nbsp;↓ Web Speech API (Speech-to-Text)
                <br />
                &nbsp;&nbsp;↓ POST /api/ai/chat
                <br />
                [Next.js Server API Layer]
                <br />
                &nbsp;&nbsp;↓ Verifies Tenant Isolation & Published Status
                <br />
                &nbsp;&nbsp;↓ Loads Grounded Business Context (Firestore)
                <br />
                &nbsp;&nbsp;↓ Calls Gemini 1.5 Flash Model
                <br />
                &nbsp;&nbsp;↓ Anti-Hallucination & Action Intent Parsing
                <br />
                [Customer Assistant Interface]
                <br />
                &nbsp;&nbsp;↓ Web Speech Synthesis (Spoken Response)
                <br />
                &nbsp;&nbsp;↓ Interactive Appointment Booking Modal
              </p>
              <div className="pt-2 text-indigo-400">
                ✓ Zero Client API Key Leakage
                <br />
                ✓ Anti-double booking algorithms enabled
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-20 bg-indigo-700 text-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
          <h3 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
            Ready to give your business an AI assistant?
          </h3>
          <p className="text-indigo-100 max-w-xl mx-auto text-sm sm:text-base leading-relaxed">
            Create an account, enter your business details, and test your new voice and chat assistant in minutes.
          </p>
          <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/signup"
              className="px-8 py-3.5 rounded-xl bg-white text-indigo-700 hover:bg-indigo-50 font-bold text-sm shadow-lg transition-transform hover:scale-105"
            >
              Get Started Free Now
            </Link>
            <Link
              href="/assistant/apex-tech-solutions"
              className="px-8 py-3.5 rounded-xl bg-indigo-800/80 hover:bg-indigo-800 text-white font-medium text-sm border border-indigo-500/50 transition-colors"
            >
              View Public Live Demo
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
