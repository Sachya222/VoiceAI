'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import {
  Bot,
  Mic,
  MicOff,
  Send,
  Volume2,
  VolumeX,
  MapPin,
  Clock,
  Phone,
  Mail,
  Calendar,
  Sparkles,
  ExternalLink,
  ChevronRight,
  AlertCircle,
  CheckCircle2,
  Loader2,
  X,
  Building,
} from 'lucide-react';
import { useSpeechRecognition, useSpeechSynthesis } from '@/lib/audio/speech';
import { Business, AssistantConfig, ServiceItem, FAQ, Appointment } from '@/types';

interface TimeSlot {
  time: string;
  isoString: string;
  isAvailable: boolean;
}

export default function PublicAssistantPage({
  params,
}: {
  params: { slug: string };
}) {
  const { slug } = params;

  // Data loaded from public endpoint
  const [business, setBusiness] = useState<Business | null>(null);
  const [assistant, setAssistant] = useState<AssistantConfig | null>(null);
  const [services, setServices] = useState<ServiceItem[]>([]);
  const [faqs, setFaqs] = useState<FAQ[]>([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  // Chat message stream
  const [messages, setMessages] = useState<
    Array<{ sender: 'assistant' | 'user'; content: string; action?: string; isVoice?: boolean }>
  >([]);
  const [inputText, setInputText] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [voicePlaybackEnabled, setVoicePlaybackEnabled] = useState(true);

  // Booking Modal State
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [selectedServiceId, setSelectedServiceId] = useState<string>('');
  const [selectedDate, setSelectedDate] = useState<string>(
    new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  );
  const [availableSlots, setAvailableSlots] = useState<TimeSlot[]>([]);
  const [selectedSlot, setSelectedSlot] = useState<string>('');
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [bookingNotes, setBookingNotes] = useState('');
  const [bookingLoading, setBookingLoading] = useState(false);
  const [bookingConfirmed, setBookingConfirmed] = useState<Appointment | null>(null);
  const [slotsLoading, setSlotsLoading] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Speech Recognition & Synthesis hooks
  const {
    isListening,
    transcript,
    error: speechError,
    isSupported: isSpeechSupported,
    startListening,
    stopListening,
    resetTranscript,
  } = useSpeechRecognition();

  const { speak, stop: stopSpeaking, isSpeaking, isSupported: isTtsSupported } = useSpeechSynthesis();

  // Scroll to bottom of chat
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isProcessing]);

  // Fetch public business assistant data
  useEffect(() => {
    async function fetchAssistantProfile() {
      setLoading(true);
      try {
        const res = await fetch(`/api/public/assistant/${slug}`);
        if (!res.ok) {
          setNotFound(true);
          return;
        }
        const data = await res.json();
        setBusiness(data.business);
        setAssistant(data.assistant);
        setServices(data.services || []);
        setFaqs(data.faqs || []);

        if (data.services && data.services.length > 0) {
          setSelectedServiceId(data.services[0].id);
        }

        const greeting =
          data.assistant?.welcomeMessage ||
          `Welcome to ${data.business?.name}! How may I help you today?`;

        setMessages([
          {
            sender: 'assistant',
            content: greeting,
          },
        ]);
      } catch (err) {
        console.error('Error fetching assistant:', err);
        setNotFound(true);
      } finally {
        setLoading(false);
      }
    }

    fetchAssistantProfile();
  }, [slug]);

  // Handle Speech Recognition transcript updates
  useEffect(() => {
    if (transcript && !isListening) {
      handleSendMessage(transcript, true);
      resetTranscript();
    }
  }, [transcript, isListening]);

  // Query available slots when service or date changes in booking modal
  useEffect(() => {
    if (!isBookingModalOpen || !business || !selectedDate) return;

    async function loadSlots() {
      setSlotsLoading(true);
      setSelectedSlot('');
      try {
        const queryParams = new URLSearchParams({
          businessId: business?.id || 'demo-biz-apex',
          serviceId: selectedServiceId,
          date: selectedDate,
        });

        const res = await fetch(`/api/appointments/availability?${queryParams}`);
        if (res.ok) {
          const data = await res.json();
          setAvailableSlots(data.slots || []);
        }
      } catch (err) {
        console.warn('Error loading slots:', err);
      } finally {
        setSlotsLoading(false);
      }
    }

    loadSlots();
  }, [isBookingModalOpen, selectedDate, selectedServiceId, business]);

  // Send message to AI endpoint
  const handleSendMessage = async (text: string, isVoice = false) => {
    if (!text.trim() || isProcessing) return;

    const userMessage = text.trim();
    setMessages((prev) => [...prev, { sender: 'user', content: userMessage, isVoice }]);
    setInputText('');
    setIsProcessing(true);

    try {
      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          businessId: business?.id,
          message: userMessage,
          channel: isVoice ? 'voice' : 'chat',
          history: messages.map((m) => ({
            sender: m.sender,
            content: m.content,
          })),
        }),
      });

      const data = await res.json();
      const reply =
        data.reply ||
        'Thank you for reaching out. Please let me know how else I can assist you.';

      setMessages((prev) => [
        ...prev,
        {
          sender: 'assistant',
          content: reply,
          action: data.suggestedAction,
        },
      ]);

      // Speak response if audio enabled
      if (voicePlaybackEnabled && isTtsSupported) {
        speak(reply);
      }

      // If action is booking, trigger modal
      if (data.suggestedAction === 'BOOK_APPOINTMENT' && assistant?.appointmentEnabled) {
        // Modal will also be offered via in-chat button
      }
    } catch (err) {
      console.error('Error sending message:', err);
      setMessages((prev) => [
        ...prev,
        {
          sender: 'assistant',
          content:
            'I am currently experiencing a temporary connection issue. Please feel free to call our phone number or try again in a moment.',
        },
      ]);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleMicClick = () => {
    if (isSpeaking) {
      stopSpeaking();
    }
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  };

  // Submit appointment booking
  const handleBookAppointment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSlot || !customerName || !customerPhone || !business) {
      alert('Please fill out all required fields and select an available time slot.');
      return;
    }

    setBookingLoading(true);
    const selectedService = services.find((s) => s.id === selectedServiceId);

    try {
      const res = await fetch('/api/appointments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          businessId: business.id,
          customerName,
          customerEmail,
          customerPhone,
          serviceId: selectedServiceId,
          serviceName: selectedService?.name || 'General Appointment',
          startAt: selectedSlot,
          notes: bookingNotes,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        alert(data.error || 'The chosen appointment slot is no longer available.');
        return;
      }

      setBookingConfirmed(data.appointment);

      // Add confirmation message to chat
      const slotTime = new Date(selectedSlot).toLocaleString([], {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
      const confirmReply = `🎉 Your appointment for "${selectedService?.name || 'Service'}" has been successfully booked for ${slotTime}! We look forward to seeing you at ${business.address}.`;
      setMessages((prev) => [
        ...prev,
        {
          sender: 'assistant',
          content: confirmReply,
        },
      ]);

      if (voicePlaybackEnabled) {
        speak(confirmReply);
      }
    } catch (err) {
      console.error('Error booking appointment:', err);
      alert('An error occurred booking your appointment. Please call us directly.');
    } finally {
      setBookingLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
          <p className="text-xs font-semibold text-slate-600">Connecting to business assistant...</p>
        </div>
      </div>
    );
  }

  if (notFound || !business) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4 text-center">
        <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center mb-3">
          <AlertCircle className="w-6 h-6" />
        </div>
        <h1 className="text-xl font-bold text-slate-900">Business Assistant Not Found</h1>
        <p className="text-xs text-slate-500 max-w-sm mt-1 mb-4">
          The requested assistant slug does not exist or has not been published yet.
        </p>
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold transition-colors"
        >
          <span>Return Home</span>
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col">
      {/* Top Banner / Business Info Header */}
      <header className="bg-white border-b border-slate-200/90 shadow-xs sticky top-0 z-30">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-600 flex items-center justify-center text-white font-bold text-base shadow-sm shrink-0">
              <Bot className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h1 className="font-bold text-slate-900 text-sm sm:text-base truncate">
                  {business.name}
                </h1>
                <span className="hidden sm:inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                  Always Ready
                </span>
              </div>
              <p className="text-[11px] text-slate-500 truncate">
                {assistant?.assistantName || 'AI Assistant'} • {business.category}
              </p>
            </div>
          </div>

          {/* Quick Contact & Audio Controls */}
          <div className="flex items-center gap-2 shrink-0">
            {business.phone && (
              <a
                href={`tel:${business.phone}`}
                className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-xs font-medium text-slate-700 transition-colors"
                title="Call Business"
              >
                <Phone className="w-3.5 h-3.5 text-indigo-600" />
                <span>Call</span>
              </a>
            )}

            {business.mapsUrl && (
              <a
                href={business.mapsUrl}
                target="_blank"
                rel="noreferrer"
                className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-xs font-medium text-slate-700 transition-colors"
                title="Get Directions on Google Maps"
              >
                <MapPin className="w-3.5 h-3.5 text-indigo-600" />
                <span>Directions</span>
              </a>
            )}

            {/* Audio Speech Toggle */}
            <button
              onClick={() => {
                if (voicePlaybackEnabled) {
                  stopSpeaking();
                }
                setVoicePlaybackEnabled(!voicePlaybackEnabled);
              }}
              className={`p-2 rounded-xl border transition-colors ${
                voicePlaybackEnabled
                  ? 'bg-indigo-50 border-indigo-200 text-indigo-700'
                  : 'bg-slate-50 border-slate-200 text-slate-400'
              }`}
              title={voicePlaybackEnabled ? 'Mute AI Voice' : 'Enable AI Voice'}
            >
              {voicePlaybackEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </header>

      {/* Main Chat Interface */}
      <div className="flex-1 max-w-4xl w-full mx-auto p-4 sm:p-6 flex flex-col min-h-0">
        <div className="bg-white rounded-3xl border border-slate-200/90 shadow-lg shadow-slate-200/40 flex-1 flex flex-col overflow-hidden min-h-[550px]">
          {/* Chat Stream Area */}
          <div className="flex-1 p-4 sm:p-6 overflow-y-auto space-y-4 bg-slate-50/50">
            {messages.map((msg, index) => (
              <div
                key={index}
                className={`flex items-start gap-3 ${
                  msg.sender === 'user' ? 'justify-end' : 'justify-start'
                }`}
              >
                {msg.sender === 'assistant' && (
                  <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-600 text-white flex items-center justify-center text-xs font-bold shrink-0 shadow-xs">
                    <Bot className="w-4 h-4" />
                  </div>
                )}

                <div className="space-y-2 max-w-[85%] sm:max-w-md">
                  <div
                    className={`p-4 rounded-2xl text-xs sm:text-sm leading-relaxed ${
                      msg.sender === 'user'
                        ? 'bg-indigo-600 text-white rounded-tr-none shadow-xs'
                        : 'bg-white border border-slate-200/90 text-slate-800 rounded-tl-none shadow-xs'
                    }`}
                  >
                    <p className="whitespace-pre-line">{msg.content}</p>
                    {msg.isVoice && (
                      <span className="block text-[10px] opacity-75 mt-1 font-semibold flex items-center gap-1">
                        <Mic className="w-3 h-3" />
                        Spoken through microphone
                      </span>
                    )}
                  </div>

                  {/* Contextual Action Button rendered under assistant reply */}
                  {msg.action === 'BOOK_APPOINTMENT' && assistant?.appointmentEnabled && (
                    <button
                      onClick={() => setIsBookingModalOpen(true)}
                      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-xs transition-transform hover:scale-102"
                    >
                      <Calendar className="w-3.5 h-3.5" />
                      <span>Select Appointment Time & Book</span>
                    </button>
                  )}

                  {msg.action === 'GET_DIRECTIONS' && business.mapsUrl && (
                    <a
                      href={business.mapsUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold shadow-xs transition-colors"
                    >
                      <MapPin className="w-3.5 h-3.5" />
                      <span>Open Directions on Google Maps</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  )}

                  {msg.action === 'HUMAN_HANDOFF' && business.phone && (
                    <a
                      href={`tel:${business.phone}`}
                      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-xs transition-colors"
                    >
                      <Phone className="w-3.5 h-3.5" />
                      <span>Call Business Representative Now</span>
                    </a>
                  )}
                </div>

                {msg.sender === 'user' && (
                  <div className="w-8 h-8 rounded-xl bg-slate-200 text-slate-700 flex items-center justify-center text-xs font-bold shrink-0">
                    You
                  </div>
                )}
              </div>
            ))}

            {isProcessing && (
              <div className="flex items-center gap-2 text-xs text-slate-500 py-1">
                <Loader2 className="w-4 h-4 text-indigo-600 animate-spin" />
                <span>Thinking and verifying business facts...</span>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Quick Prompt Suggestions */}
          <div className="px-4 py-2.5 bg-white border-t border-slate-100 flex items-center gap-2 overflow-x-auto text-xs">
            <span className="text-[11px] font-semibold text-slate-400 shrink-0">Try asking:</span>
            {[
              'What are your service rates?',
              'What are your opening hours?',
              'Where are you located?',
              'Book an appointment',
            ].map((q) => (
              <button
                key={q}
                onClick={() => handleSendMessage(q)}
                className="shrink-0 px-3 py-1 rounded-full bg-slate-50 hover:bg-indigo-50 hover:text-indigo-700 border border-slate-200 text-slate-600 text-[11px] font-medium transition-colors"
              >
                {q}
              </button>
            ))}
          </div>

          {/* Active Listening Visualizer Bar */}
          {isListening && (
            <div className="px-4 py-2.5 bg-violet-600 text-white text-xs flex items-center justify-between animate-fade-in">
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full bg-white animate-ping"></div>
                <span className="font-semibold">Listening... Speak now into your microphone</span>
              </div>
              <button
                onClick={stopListening}
                className="px-2.5 py-1 rounded bg-violet-700 hover:bg-violet-800 text-[11px] font-bold"
              >
                Done Speaking
              </button>
            </div>
          )}

          {speechError && (
            <div className="px-4 py-2 bg-rose-50 text-rose-700 text-xs flex items-center justify-between border-t border-rose-200">
              <span>{speechError}</span>
              <button
                onClick={resetTranscript}
                className="text-rose-600 font-bold hover:underline"
              >
                Dismiss
              </button>
            </div>
          )}

          {/* Message Input Bar */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage(inputText);
            }}
            className="p-3 sm:p-4 bg-white border-t border-slate-200 flex items-center gap-2 shrink-0"
          >
            {/* Microphone Button */}
            {assistant?.voiceEnabled && isSpeechSupported && (
              <button
                type="button"
                onClick={handleMicClick}
                className={`p-3 rounded-2xl transition-all ${
                  isListening
                    ? 'bg-rose-500 text-white voice-active-ripple'
                    : 'bg-slate-100 hover:bg-indigo-50 text-slate-600 hover:text-indigo-600'
                }`}
                title={isListening ? 'Stop listening' : 'Start voice input'}
              >
                {isListening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
              </button>
            )}

            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Type your question or speak via microphone..."
              className="flex-1 px-4 py-3 text-xs sm:text-sm rounded-2xl border border-slate-300 focus:ring-2 focus:ring-indigo-600 focus:border-transparent outline-none transition-all"
            />

            <button
              type="submit"
              disabled={isProcessing || !inputText.trim()}
              className="p-3 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white disabled:opacity-40 transition-colors shadow-sm"
              title="Send message"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      </div>

      {/* INTERACTIVE APPOINTMENT BOOKING MODAL */}
      {isBookingModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 z-50 flex items-center justify-center p-4 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 max-h-[90vh] overflow-y-auto space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-indigo-600" />
                <h3 className="font-bold text-slate-900 text-base">Schedule an Appointment</h3>
              </div>
              <button
                onClick={() => {
                  setIsBookingModalOpen(false);
                  setBookingConfirmed(null);
                }}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {bookingConfirmed ? (
              <div className="text-center py-6 space-y-4">
                <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <h4 className="text-lg font-bold text-slate-900">Appointment Confirmed!</h4>
                <p className="text-xs text-slate-600 leading-relaxed max-w-sm mx-auto">
                  Thank you, <strong>{bookingConfirmed.customerName}</strong>. Your reservation for{' '}
                  <strong>{bookingConfirmed.serviceName}</strong> has been secured in the calendar.
                </p>
                <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 text-xs text-slate-700 space-y-1 text-left">
                  <p>
                    <strong>Date & Time:</strong>{' '}
                    {new Date(bookingConfirmed.startAt).toLocaleString([], {
                      weekday: 'short',
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </p>
                  <p>
                    <strong>Location:</strong> {business.address}, {business.city}
                  </p>
                  <p>
                    <strong>Contact Phone:</strong> {bookingConfirmed.customerPhone}
                  </p>
                </div>
                <button
                  onClick={() => {
                    setIsBookingModalOpen(false);
                    setBookingConfirmed(null);
                  }}
                  className="w-full py-2.5 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl transition-colors"
                >
                  Return to Chat
                </button>
              </div>
            ) : (
              <form onSubmit={handleBookAppointment} className="space-y-4">
                {/* Select Service */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Select Desired Service *
                  </label>
                  <select
                    value={selectedServiceId}
                    onChange={(e) => setSelectedServiceId(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-300 focus:ring-2 focus:ring-indigo-600 outline-none bg-white"
                  >
                    {services.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name} (${s.price} • {s.durationMinutes} mins)
                      </option>
                    ))}
                  </select>
                </div>

                {/* Date Picker */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Preferred Date *
                  </label>
                  <input
                    type="date"
                    required
                    min={new Date().toISOString().split('T')[0]}
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-300 focus:ring-2 focus:ring-indigo-600 outline-none bg-white"
                  />
                </div>

                {/* Available Slots Selector */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Available Time Slots ({business.timezone || 'Local Time'})
                  </label>

                  {slotsLoading ? (
                    <div className="py-4 text-center text-xs text-slate-500 flex items-center justify-center gap-2">
                      <Loader2 className="w-4 h-4 animate-spin text-indigo-600" />
                      <span>Checking business availability...</span>
                    </div>
                  ) : availableSlots.length === 0 ? (
                    <p className="text-xs text-amber-700 bg-amber-50 p-2.5 rounded-xl border border-amber-200">
                      No open slots on this date (business closed or fully booked). Please try another date.
                    </p>
                  ) : (
                    <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 max-h-36 overflow-y-auto p-1">
                      {availableSlots.map((slot) => (
                        <button
                          key={slot.isoString}
                          type="button"
                          disabled={!slot.isAvailable}
                          onClick={() => setSelectedSlot(slot.isoString)}
                          className={`p-2 rounded-xl text-xs font-semibold text-center border transition-all ${
                            selectedSlot === slot.isoString
                              ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                              : slot.isAvailable
                              ? 'bg-slate-50 hover:bg-indigo-50 border-slate-200 text-slate-700'
                              : 'bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed line-through'
                          }`}
                        >
                          {slot.time}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Customer Details */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Your Name *</label>
                    <input
                      type="text"
                      required
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      placeholder="Jane Doe"
                      className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:ring-2 focus:ring-indigo-600 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Phone Number *
                    </label>
                    <input
                      type="tel"
                      required
                      value={customerPhone}
                      onChange={(e) => setCustomerPhone(e.target.value)}
                      placeholder="+1 (555) 000-0000"
                      className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:ring-2 focus:ring-indigo-600 outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Email Address</label>
                  <input
                    type="email"
                    value={customerEmail}
                    onChange={(e) => setCustomerEmail(e.target.value)}
                    placeholder="jane@example.com"
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:ring-2 focus:ring-indigo-600 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Special Notes or Issue Description
                  </label>
                  <textarea
                    rows={2}
                    value={bookingNotes}
                    onChange={(e) => setBookingNotes(e.target.value)}
                    placeholder="Describe issue (e.g. cracked screen, noisy fan)..."
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:ring-2 focus:ring-indigo-600 outline-none"
                  />
                </div>

                <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setIsBookingModalOpen(false)}
                    className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={bookingLoading || !selectedSlot}
                    className="px-6 py-2.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-md shadow-indigo-500/20 disabled:opacity-50 transition-all"
                  >
                    {bookingLoading ? 'Reserving slot...' : 'Confirm Appointment'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
