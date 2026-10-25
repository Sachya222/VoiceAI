'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/context/AuthContext';
import { db } from '@/lib/firebase/client';
import { doc, setDoc, addDoc, collection, serverTimestamp } from 'firebase/firestore';
import {
  Building2,
  Clock,
  Package,
  Bot,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  Sparkles,
  MapPin,
  Globe,
  Phone,
  Mail,
  Loader2,
} from 'lucide-react';
import { Business, BusinessHours, DaySchedule, AssistantConfig } from '@/types';

const CATEGORIES = [
  'Computer & Electronics Repair',
  'Clinic & Healthcare',
  'Restaurant & Cafe',
  'Salon & Personal Care',
  'Coaching & Education',
  'Real Estate Agency',
  'Automobile Dealership & Service',
  'Retail & Boutique',
  'Professional Consulting',
];

const DEFAULT_HOURS: BusinessHours = {
  monday: { isOpen: true, openTime: '09:00', closeTime: '18:00', breakStart: '13:00', breakEnd: '14:00' },
  tuesday: { isOpen: true, openTime: '09:00', closeTime: '18:00', breakStart: '13:00', breakEnd: '14:00' },
  wednesday: { isOpen: true, openTime: '09:00', closeTime: '18:00', breakStart: '13:00', breakEnd: '14:00' },
  thursday: { isOpen: true, openTime: '09:00', closeTime: '18:00', breakStart: '13:00', breakEnd: '14:00' },
  friday: { isOpen: true, openTime: '09:00', closeTime: '17:00' },
  saturday: { isOpen: true, openTime: '10:00', closeTime: '15:00' },
  sunday: { isOpen: false, openTime: '00:00', closeTime: '00:00' },
};

export default function OnboardingPage() {
  const router = useRouter();
  const { user, isDemoMode, setBusiness } = useAuth();
  const [step, setStep] = useState(1);
  const [saving, setSaving] = useState(false);

  // Step 1: Business details
  const [name, setName] = useState('Apex Tech Solutions');
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [description, setDescription] = useState(
    'Certified laptop, computer, and electronic diagnostics, parts replacement, and enterprise IT support.'
  );
  const [phone, setPhone] = useState('+1 (555) 234-5678');
  const [bizEmail, setBizEmail] = useState(user?.email || 'contact@apextech.com');
  const [website, setWebsite] = useState('https://apextech.example.com');
  const [address, setAddress] = useState('104 Innovation Way, Suite 200');
  const [city, setCity] = useState('San Francisco');
  const [state, setState] = useState('CA');
  const [postalCode, setPostalCode] = useState('94105');
  const [country, setCountry] = useState('United States');
  const [mapsUrl, setMapsUrl] = useState('https://maps.google.com/?q=San+Francisco+Financial+District');
  const [timezone, setTimezone] = useState('America/Los_Angeles');

  // Step 2: Hours
  const [hours, setHours] = useState<BusinessHours>(DEFAULT_HOURS);

  // Step 3: Initial Offerings
  const [serviceName, setServiceName] = useState('Laptop Screen Replacement');
  const [servicePrice, setServicePrice] = useState(129);
  const [serviceDuration, setServiceDuration] = useState(45);
  const [serviceDescription, setServiceDescription] = useState('OEM replacement display panel for cracked or dim screens.');

  const [productName, setProductName] = useState('Samsung 990 Pro 2TB NVMe SSD');
  const [productPrice, setProductPrice] = useState(189.99);

  // Step 4: Assistant Config
  const [assistantName, setAssistantName] = useState('Apex AI');
  const [welcomeMessage, setWelcomeMessage] = useState(
    'Hi! Welcome to Apex Tech Solutions. How can I assist you with laptop repairs, hardware upgrades, or diagnostics today?'
  );
  const [tone, setTone] = useState<'professional' | 'friendly' | 'enthusiastic' | 'concise'>('friendly');
  const [language, setLanguage] = useState('English');
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  const [appointmentEnabled, setAppointmentEnabled] = useState(true);

  const generateSlug = (text: string) =>
    text
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');

  const handleFinishOnboarding = async () => {
    setSaving(true);
    const slug = generateSlug(name) || `biz-${Date.now()}`;
    const ownerId = user?.uid || 'demo-owner-123';
    const businessId = `biz-${slug}`;

    const newBusiness: Business = {
      id: businessId,
      ownerId,
      name,
      slug,
      category,
      description,
      phone,
      email: bizEmail,
      website,
      address,
      city,
      state,
      postalCode,
      country,
      mapsUrl,
      timezone,
      businessHours: hours,
      onboardingCompleted: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const newConfig: AssistantConfig = {
      businessId,
      assistantName,
      welcomeMessage,
      language,
      tone,
      voiceEnabled,
      appointmentEnabled,
      published: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    try {
      if (!isDemoMode && db) {
        // Save business doc
        await setDoc(doc(db, 'businesses', businessId), {
          ...newBusiness,
          serverCreatedAt: serverTimestamp(),
        });

        // Save assistant config
        await setDoc(doc(db, 'businesses', businessId, 'assistant', 'config'), {
          ...newConfig,
          serverCreatedAt: serverTimestamp(),
        });

        // Save initial service
        if (serviceName) {
          await addDoc(collection(db, 'businesses', businessId, 'services'), {
            businessId,
            name: serviceName,
            price: Number(servicePrice),
            durationMinutes: Number(serviceDuration),
            description: serviceDescription,
            currency: 'USD',
            available: true,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          });
        }

        // Save initial product
        if (productName) {
          await addDoc(collection(db, 'businesses', businessId, 'products'), {
            businessId,
            name: productName,
            price: Number(productPrice),
            description: 'High-speed storage component',
            currency: 'USD',
            category: 'Hardware',
            available: true,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          });
        }
      }

      setBusiness(newBusiness);
      router.push('/dashboard');
    } catch (err: any) {
      console.warn('Error saving onboarding data to Firestore:', err);
      // Fallback update in state and proceed
      setBusiness(newBusiness);
      router.push('/dashboard');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 py-10 px-4 sm:px-6 lg:px-8 flex flex-col justify-center">
      <div className="max-w-3xl mx-auto w-full">
        {/* Progress Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-200 text-indigo-700 text-xs font-semibold mb-2">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Guided Business Onboarding</span>
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900">Set Up Your VoiceAI Assistant</h1>
          <p className="text-xs text-slate-500 mt-1">
            Complete these 5 quick steps to publish your automated customer AI assistant.
          </p>

          {/* Stepper Dots */}
          <div className="flex items-center justify-center gap-2 mt-6">
            {[1, 2, 3, 4, 5].map((s) => (
              <div
                key={s}
                className={`flex items-center justify-center w-8 h-8 rounded-full text-xs font-bold transition-all ${
                  step === s
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/25 scale-110'
                    : step > s
                    ? 'bg-emerald-500 text-white'
                    : 'bg-white border border-slate-300 text-slate-500'
                }`}
              >
                {step > s ? <CheckCircle2 className="w-4 h-4" /> : s}
              </div>
            ))}
          </div>
        </div>

        {/* Step Container Card */}
        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xl shadow-slate-200/40 p-6 sm:p-10">
          {/* STEP 1: BUSINESS INFO */}
          {step === 1 && (
            <div className="space-y-4">
              <div className="border-b border-slate-100 pb-3 mb-4">
                <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  <Building2 className="w-5 h-5 text-indigo-600" />
                  <span>Step 1: Business Profile & Location</span>
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Customers and the AI assistant use this information for queries and directions.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Business Name *</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-300 focus:ring-2 focus:ring-indigo-600 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Business Category *</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-300 focus:ring-2 focus:ring-indigo-600 outline-none bg-white"
                  >
                    {CATEGORIES.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Short Description *</label>
                <textarea
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-300 focus:ring-2 focus:ring-indigo-600 outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Contact Phone *</label>
                  <input
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-300 focus:ring-2 focus:ring-indigo-600 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Contact Email *</label>
                  <input
                    type="email"
                    value={bizEmail}
                    onChange={(e) => setBizEmail(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-300 focus:ring-2 focus:ring-indigo-600 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Street Address *</label>
                <input
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-300 focus:ring-2 focus:ring-indigo-600 outline-none"
                />
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">City</label>
                  <input
                    type="text"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:ring-2 focus:ring-indigo-600 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">State</label>
                  <input
                    type="text"
                    value={state}
                    onChange={(e) => setState(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:ring-2 focus:ring-indigo-600 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Postal Code</label>
                  <input
                    type="text"
                    value={postalCode}
                    onChange={(e) => setPostalCode(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:ring-2 focus:ring-indigo-600 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Country</label>
                  <input
                    type="text"
                    value={country}
                    onChange={(e) => setCountry(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:ring-2 focus:ring-indigo-600 outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Google Maps URL</label>
                  <input
                    type="url"
                    value={mapsUrl}
                    onChange={(e) => setMapsUrl(e.target.value)}
                    placeholder="https://maps.google.com/?q=..."
                    className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-300 focus:ring-2 focus:ring-indigo-600 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Timezone</label>
                  <input
                    type="text"
                    value={timezone}
                    onChange={(e) => setTimezone(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-300 focus:ring-2 focus:ring-indigo-600 outline-none"
                  />
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: OPERATING HOURS */}
          {step === 2 && (
            <div className="space-y-4">
              <div className="border-b border-slate-100 pb-3 mb-4">
                <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  <Clock className="w-5 h-5 text-indigo-600" />
                  <span>Step 2: Operating Hours & Breaks</span>
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Configure regular opening times. The AI uses this to answer customer questions and generate valid appointment slots.
                </p>
              </div>

              <div className="space-y-2.5">
                {(Object.keys(hours) as (keyof BusinessHours)[]).map((day) => {
                  const schedule = hours[day];
                  return (
                    <div
                      key={day}
                      className="flex flex-col sm:flex-row sm:items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200/80 gap-2 text-xs"
                    >
                      <div className="flex items-center gap-3 w-32">
                        <input
                          type="checkbox"
                          checked={schedule.isOpen}
                          onChange={(e) =>
                            setHours({
                              ...hours,
                              [day]: { ...schedule, isOpen: e.target.checked },
                            })
                          }
                          className="rounded text-indigo-600 focus:ring-indigo-500"
                        />
                        <span className="font-semibold uppercase tracking-wider text-slate-800">
                          {day}
                        </span>
                      </div>

                      {schedule.isOpen ? (
                        <div className="flex flex-wrap items-center gap-2 text-slate-600">
                          <input
                            type="time"
                            value={schedule.openTime}
                            onChange={(e) =>
                              setHours({
                                ...hours,
                                [day]: { ...schedule, openTime: e.target.value },
                              })
                            }
                            className="bg-white px-2 py-1 border border-slate-300 rounded-lg text-xs"
                          />
                          <span>to</span>
                          <input
                            type="time"
                            value={schedule.closeTime}
                            onChange={(e) =>
                              setHours({
                                ...hours,
                                [day]: { ...schedule, closeTime: e.target.value },
                              })
                            }
                            className="bg-white px-2 py-1 border border-slate-300 rounded-lg text-xs"
                          />
                          <span className="text-slate-400">| Break:</span>
                          <input
                            type="time"
                            value={schedule.breakStart || ''}
                            onChange={(e) =>
                              setHours({
                                ...hours,
                                [day]: { ...schedule, breakStart: e.target.value },
                              })
                            }
                            className="bg-white px-2 py-1 border border-slate-300 rounded-lg text-xs"
                          />
                          <span>-</span>
                          <input
                            type="time"
                            value={schedule.breakEnd || ''}
                            onChange={(e) =>
                              setHours({
                                ...hours,
                                [day]: { ...schedule, breakEnd: e.target.value },
                              })
                            }
                            className="bg-white px-2 py-1 border border-slate-300 rounded-lg text-xs"
                          />
                        </div>
                      ) : (
                        <span className="text-rose-600 font-medium px-2 py-0.5 rounded bg-rose-50 text-[11px]">
                          Closed for the day
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* STEP 3: PRODUCTS & SERVICES */}
          {step === 3 && (
            <div className="space-y-5">
              <div className="border-b border-slate-100 pb-3 mb-4">
                <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  <Package className="w-5 h-5 text-indigo-600" />
                  <span>Step 3: Initial Offerings</span>
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Add your primary service and product so the AI can immediately answer pricing inquiries. You can add more in the dashboard anytime.
                </p>
              </div>

              {/* Service Box */}
              <div className="p-4 bg-indigo-50/40 rounded-xl border border-indigo-100 space-y-3">
                <h3 className="text-xs font-bold uppercase tracking-wider text-indigo-900">
                  Featured Bookable Service
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="sm:col-span-2">
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                      Service Name
                    </label>
                    <input
                      type="text"
                      value={serviceName}
                      onChange={(e) => setServiceName(e.target.value)}
                      className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:ring-2 focus:ring-indigo-600 outline-none bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                      Price ($ USD)
                    </label>
                    <input
                      type="number"
                      value={servicePrice}
                      onChange={(e) => setServicePrice(Number(e.target.value))}
                      className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:ring-2 focus:ring-indigo-600 outline-none bg-white"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                      Duration (Minutes)
                    </label>
                    <input
                      type="number"
                      value={serviceDuration}
                      onChange={(e) => setServiceDuration(Number(e.target.value))}
                      className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:ring-2 focus:ring-indigo-600 outline-none bg-white"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                      Service Description
                    </label>
                    <input
                      type="text"
                      value={serviceDescription}
                      onChange={(e) => setServiceDescription(e.target.value)}
                      className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:ring-2 focus:ring-indigo-600 outline-none bg-white"
                    />
                  </div>
                </div>
              </div>

              {/* Product Box */}
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200/80 space-y-3">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800">
                  Featured Physical/Digital Product
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="sm:col-span-2">
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                      Product Name
                    </label>
                    <input
                      type="text"
                      value={productName}
                      onChange={(e) => setProductName(e.target.value)}
                      className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:ring-2 focus:ring-indigo-600 outline-none bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                      Price ($ USD)
                    </label>
                    <input
                      type="number"
                      value={productPrice}
                      onChange={(e) => setProductPrice(Number(e.target.value))}
                      className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:ring-2 focus:ring-indigo-600 outline-none bg-white"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* STEP 4: ASSISTANT CONFIGURATION */}
          {step === 4 && (
            <div className="space-y-4">
              <div className="border-b border-slate-100 pb-3 mb-4">
                <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  <Bot className="w-5 h-5 text-indigo-600" />
                  <span>Step 4: AI Personality & Capabilities</span>
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Customize how your assistant introduces your company and answers queries.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Assistant Name *
                  </label>
                  <input
                    type="text"
                    value={assistantName}
                    onChange={(e) => setAssistantName(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-300 focus:ring-2 focus:ring-indigo-600 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Tone of Voice</label>
                  <select
                    value={tone}
                    onChange={(e) => setTone(e.target.value as any)}
                    className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-300 focus:ring-2 focus:ring-indigo-600 outline-none bg-white"
                  >
                    <option value="friendly">Friendly & Helpful</option>
                    <option value="professional">Professional & Formal</option>
                    <option value="concise">Concise & Direct</option>
                    <option value="enthusiastic">Enthusiastic & Energetic</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Default Welcome Message
                </label>
                <textarea
                  rows={3}
                  value={welcomeMessage}
                  onChange={(e) => setWelcomeMessage(e.target.value)}
                  className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-300 focus:ring-2 focus:ring-indigo-600 outline-none"
                />
              </div>

              {/* Toggles */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                <div className="flex items-center justify-between p-3 rounded-xl border border-slate-200 bg-slate-50">
                  <div>
                    <span className="text-xs font-semibold text-slate-800 block">
                      Browser Voice Calling
                    </span>
                    <span className="text-[11px] text-slate-500">
                      Enable microphone and speech synthesis
                    </span>
                  </div>
                  <input
                    type="checkbox"
                    checked={voiceEnabled}
                    onChange={(e) => setVoiceEnabled(e.target.checked)}
                    className="rounded text-indigo-600 focus:ring-indigo-500 w-4 h-4"
                  />
                </div>

                <div className="flex items-center justify-between p-3 rounded-xl border border-slate-200 bg-slate-50">
                  <div>
                    <span className="text-xs font-semibold text-slate-800 block">
                      Appointment Booking
                    </span>
                    <span className="text-[11px] text-slate-500">
                      Let customers book slots directly in chat
                    </span>
                  </div>
                  <input
                    type="checkbox"
                    checked={appointmentEnabled}
                    onChange={(e) => setAppointmentEnabled(e.target.checked)}
                    className="rounded text-indigo-600 focus:ring-indigo-500 w-4 h-4"
                  />
                </div>
              </div>
            </div>
          )}

          {/* STEP 5: PREVIEW & PUBLISH */}
          {step === 5 && (
            <div className="space-y-6">
              <div className="border-b border-slate-100 pb-3">
                <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                  <span>Step 5: Review & Publish Assistant</span>
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Confirm your details below. Once published, your assistant will be live at a dedicated public URL.
                </p>
              </div>

              <div className="bg-slate-50 rounded-2xl p-5 border border-slate-200/80 space-y-4 text-xs">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-bold text-base text-slate-900">{name}</h3>
                    <p className="text-indigo-600 font-medium">{category}</p>
                    <p className="text-slate-600 mt-1">{description}</p>
                  </div>
                  <span className="px-2.5 py-1 rounded-full text-[11px] font-semibold bg-emerald-100 text-emerald-800">
                    Ready to Publish
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-3 border-t border-slate-200">
                  <div>
                    <span className="font-semibold text-slate-700 block mb-1">Contact & Location</span>
                    <p className="text-slate-600">{phone} • {bizEmail}</p>
                    <p className="text-slate-600">{address}, {city}, {state}</p>
                  </div>
                  <div>
                    <span className="font-semibold text-slate-700 block mb-1">AI Assistant Configuration</span>
                    <p className="text-slate-600">Name: <strong>{assistantName}</strong></p>
                    <p className="text-slate-600">Tone: <strong>{tone}</strong> • Language: <strong>{language}</strong></p>
                    <p className="text-slate-600">
                      Voice: {voiceEnabled ? '✓ Enabled' : '✕ Disabled'} | Appointments: {appointmentEnabled ? '✓ Enabled' : '✕ Disabled'}
                    </p>
                  </div>
                </div>

                <div className="p-3 bg-white rounded-xl border border-indigo-100">
                  <span className="font-semibold text-indigo-900 block mb-0.5">Your Public Shareable URL:</span>
                  <p className="text-slate-600 font-mono text-[11px]">
                    /assistant/{generateSlug(name) || 'my-business'}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Stepper Navigation Buttons */}
          <div className="flex items-center justify-between pt-6 mt-6 border-t border-slate-200">
            {step > 1 ? (
              <button
                type="button"
                onClick={() => setStep(step - 1)}
                className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-slate-300 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back</span>
              </button>
            ) : (
              <div />
            )}

            {step < 5 ? (
              <button
                type="button"
                onClick={() => setStep(step + 1)}
                className="inline-flex items-center gap-1.5 px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-xs font-bold text-white shadow-sm transition-all"
              >
                <span>Continue</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                type="button"
                disabled={saving}
                onClick={handleFinishOnboarding}
                className="inline-flex items-center gap-2 px-8 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-xs font-bold text-white shadow-md shadow-emerald-500/20 disabled:opacity-50 transition-all hover:scale-105"
              >
                {saving ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Publishing Assistant...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>Publish Assistant & Open Dashboard</span>
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
