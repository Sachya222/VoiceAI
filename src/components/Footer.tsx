import React from 'react';
import Link from 'next/link';
import { Mic, Github, Shield, Sparkles, CheckCircle2 } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-slate-900 text-slate-300 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand info */}
          <div className="md:col-span-1 space-y-3">
            <div className="flex items-center gap-2 text-white font-bold text-lg">
              <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center">
                <Mic className="w-4 h-4 text-white" />
              </div>
              <span>VoiceAI</span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Your Business. Your AI. Always Ready. An enterprise-grade AI Voice & Chat SaaS automation platform.
            </p>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-slate-800 rounded-full text-[11px] text-indigo-400 font-medium">
              <Sparkles className="w-3 h-3" />
              <span>B.Tech CSE Capstone Project</span>
            </div>
          </div>

          {/* Core Technologies */}
          <div>
            <h4 className="text-xs font-semibold text-white uppercase tracking-wider mb-3">Tech Stack</h4>
            <ul className="space-y-2 text-xs text-slate-400">
              <li className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-indigo-400" /> Next.js 14 (App Router)
              </li>
              <li className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-indigo-400" /> Firebase Auth & Cloud Firestore
              </li>
              <li className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-indigo-400" /> Google Gemini AI Integration
              </li>
              <li className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-indigo-400" /> Web Speech Recognition & TTS
              </li>
              <li className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-indigo-400" /> Tailwind CSS & TypeScript
              </li>
            </ul>
          </div>

          {/* Platform Links */}
          <div>
            <h4 className="text-xs font-semibold text-white uppercase tracking-wider mb-3">Platform</h4>
            <ul className="space-y-2 text-xs text-slate-400">
              <li>
                <Link href="/dashboard" className="hover:text-white transition-colors">
                  Business Owner Dashboard
                </Link>
              </li>
              <li>
                <Link href="/assistant/apex-tech-solutions" className="hover:text-white transition-colors">
                  Live Public AI Assistant
                </Link>
              </li>
              <li>
                <Link href="/signup" className="hover:text-white transition-colors">
                  Create Business Account
                </Link>
              </li>
              <li>
                <Link href="/login" className="hover:text-white transition-colors">
                  Sign In
                </Link>
              </li>
            </ul>
          </div>

          {/* Security & Multi-tenancy */}
          <div>
            <h4 className="text-xs font-semibold text-white uppercase tracking-wider mb-3">Security & Architecture</h4>
            <p className="text-xs text-slate-400 leading-relaxed mb-3">
              Multi-tenant data isolation enforced by Firestore security rules. Server-side AI processing guarantees zero API key exposure.
            </p>
            <div className="flex items-center gap-2 text-xs text-emerald-400">
              <Shield className="w-4 h-4" />
              <span>Isolated Tenant Architecture</span>
            </div>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500">
          <p>© {new Date().getFullYear()} VoiceAI SaaS Platform. Designed for B.Tech Computer Science Engineering.</p>
          <div className="flex items-center gap-4 mt-4 sm:mt-0">
            <span>Production-conscious MVP</span>
            <span>•</span>
            <span>REST API Verified</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
