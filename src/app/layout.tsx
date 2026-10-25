import type { Metadata } from 'next';
import './globals.css';
import { AuthProvider } from '@/lib/context/AuthContext';

export const metadata: Metadata = {
  title: 'VoiceAI — Your Business. Your AI. Always Ready.',
  description:
    'AI-powered voice and chat business automation platform. Enable customers to ask questions, check products and services, get directions, and schedule appointments instantly.',
  keywords: ['AI assistant', 'Voice AI', 'Business automation', 'Chatbot', 'Appointment booking', 'SaaS'],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full scroll-smooth">
      <body className="min-h-full flex flex-col bg-slate-50 text-slate-900 antialiased">
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
