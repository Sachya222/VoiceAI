'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/lib/context/AuthContext';
import {
  LayoutDashboard,
  Bot,
  Package,
  BookOpen,
  Calendar,
  MessageSquare,
  BarChart3,
  Settings,
  ExternalLink,
  ChevronRight,
  Menu,
  X,
  Sparkles,
  ShieldCheck,
  Building,
} from 'lucide-react';

const NAV_ITEMS = [
  { name: 'Overview', href: '/dashboard', icon: LayoutDashboard },
  { name: 'AI Assistant', href: '/dashboard/assistant', icon: Bot },
  { name: 'Products & Services', href: '/dashboard/products', icon: Package },
  { name: 'Knowledge Base', href: '/dashboard/knowledge', icon: BookOpen },
  { name: 'Appointments', href: '/dashboard/appointments', icon: Calendar },
  { name: 'Conversations', href: '/dashboard/conversations', icon: MessageSquare },
  { name: 'Analytics', href: '/dashboard/analytics', icon: BarChart3 },
  { name: 'Settings', href: '/dashboard/settings', icon: Settings },
];

export const DashboardSidebar: React.FC = () => {
  const pathname = usePathname();
  const { business, userProfile, isDemoMode } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);

  const businessSlug = business?.slug || 'apex-tech-solutions';
  const publicAssistantUrl = `/assistant/${businessSlug}`;

  const navContent = (
    <div className="flex flex-col h-full bg-white border-r border-slate-200">
      {/* Business Header */}
      <div className="p-5 border-b border-slate-200">
        <Link href="/" className="flex items-center gap-2 mb-3">
          <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white font-bold text-sm shadow-sm">
            V
          </div>
          <span className="font-bold text-slate-900 text-lg tracking-tight">VoiceAI</span>
          <span className="text-[10px] font-semibold bg-indigo-50 text-indigo-700 px-1.5 py-0.5 rounded border border-indigo-200">
            SaaS
          </span>
        </Link>

        {/* Current Business Card */}
        <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-3">
          <div className="flex items-center gap-2 mb-1">
            <Building className="w-4 h-4 text-indigo-600 shrink-0" />
            <h3 className="text-xs font-semibold text-slate-900 truncate">
              {business?.name || 'My Business'}
            </h3>
          </div>
          <p className="text-[11px] text-slate-500 truncate mb-2">
            {business?.category || 'Configure your business'}
          </p>
          <div className="flex items-center justify-between pt-1 border-t border-slate-200/60 text-[10px]">
            <span className="inline-flex items-center gap-1 text-emerald-600 font-medium">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
              {isDemoMode ? 'Demo Sandbox' : 'Online'}
            </span>
            <span className="text-slate-400 font-mono">
              {businessSlug}
            </span>
          </div>
        </div>
      </div>

      {/* Navigation List */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {NAV_ITEMS.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;
          return (
            <Link
              key={item.name}
              href={item.href}
              onClick={() => setMobileOpen(false)}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                isActive
                  ? 'bg-indigo-50 text-indigo-700 shadow-sm border border-indigo-100'
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              <Icon className={`w-4 h-4 ${isActive ? 'text-indigo-600' : 'text-slate-400'}`} />
              <span className="flex-1">{item.name}</span>
              {isActive && <ChevronRight className="w-3.5 h-3.5 text-indigo-500" />}
            </Link>
          );
        })}
      </nav>

      {/* Customer Facing Link Shortcut */}
      <div className="p-3 m-3 bg-gradient-to-br from-indigo-50 via-violet-50 to-indigo-50/40 rounded-xl border border-indigo-100">
        <div className="flex items-center gap-1.5 text-xs font-semibold text-indigo-900 mb-1">
          <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
          <span>Customer Assistant</span>
        </div>
        <p className="text-[11px] text-slate-600 mb-2.5">
          Test or share your public voice and chat assistant.
        </p>
        <Link
          href={publicAssistantUrl}
          target="_blank"
          className="inline-flex items-center justify-center gap-1.5 w-full py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-medium shadow-sm transition-colors"
        >
          <span>Open Public Link</span>
          <ExternalLink className="w-3 h-3" />
        </Link>
      </div>

      {/* User profile footer */}
      <div className="p-3 border-t border-slate-200 flex items-center justify-between text-xs text-slate-600">
        <div className="flex items-center gap-2 truncate">
          <div className="w-7 h-7 rounded-full bg-slate-200 text-slate-700 flex items-center justify-center font-bold text-xs shrink-0">
            {userProfile?.fullName?.[0] || 'U'}
          </div>
          <div className="truncate">
            <p className="font-semibold text-slate-800 truncate leading-tight">
              {userProfile?.fullName || 'Business Owner'}
            </p>
            <p className="text-[10px] text-slate-400 truncate">{userProfile?.email || 'owner@voiceai'}</p>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile Top Bar */}
      <div className="lg:hidden flex items-center justify-between bg-white border-b border-slate-200 px-4 py-3 sticky top-0 z-40">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-indigo-600 flex items-center justify-center text-white font-bold text-xs">
            V
          </div>
          <span className="font-bold text-slate-900 text-base">VoiceAI</span>
        </div>
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="p-2 text-slate-600 hover:bg-slate-100 rounded-lg"
        >
          {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Mobile Backdrop */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-slate-900/40 z-40 lg:hidden backdrop-blur-sm"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Mobile Slide-over */}
      <div
        className={`fixed inset-y-0 left-0 w-72 z-50 transform transition-transform duration-200 ease-in-out lg:hidden ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {navContent}
      </div>

      {/* Desktop Persistent Sidebar */}
      <aside className="hidden lg:block w-64 h-screen sticky top-0 shrink-0">
        {navContent}
      </aside>
    </>
  );
};
