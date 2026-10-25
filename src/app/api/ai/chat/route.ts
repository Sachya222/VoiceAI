import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/firebase/client';
import {
  doc,
  getDoc,
  collection,
  getDocs,
  addDoc,
  setDoc,
  serverTimestamp,
} from 'firebase/firestore';
import { generateGroundedAIResponse, GroundedBusinessContext } from '@/lib/ai/gemini';
import { Business, AssistantConfig, Product, ServiceItem, FAQ, KnowledgeEntry } from '@/types';

export const dynamic = 'force-dynamic';

// Fallback demo business context if Firestore is not yet populated
const DEMO_CONTEXT: GroundedBusinessContext = {
  business: {
    id: 'demo-biz-apex',
    ownerId: 'demo-owner-123',
    name: 'Apex Tech Solutions & Repairs',
    slug: 'apex-tech-solutions',
    category: 'Computer & Electronics Repair',
    description: 'Certified laptop, smartphone, and desktop diagnostics, parts replacement, and enterprise IT support.',
    phone: '+1 (555) 234-5678',
    email: 'support@apextech.demo',
    website: 'https://apextech.example.com',
    address: '104 Innovation Way, Suite 200',
    city: 'San Francisco',
    state: 'CA',
    postalCode: '94105',
    country: 'United States',
    mapsUrl: 'https://maps.google.com/?q=San+Francisco+Financial+District',
    timezone: 'America/Los_Angeles',
    businessHours: {
      monday: { isOpen: true, openTime: '09:00', closeTime: '18:00' },
      tuesday: { isOpen: true, openTime: '09:00', closeTime: '18:00' },
      wednesday: { isOpen: true, openTime: '09:00', closeTime: '18:00' },
      thursday: { isOpen: true, openTime: '09:00', closeTime: '18:00' },
      friday: { isOpen: true, openTime: '09:00', closeTime: '17:00' },
      saturday: { isOpen: true, openTime: '10:00', closeTime: '15:00' },
      sunday: { isOpen: false, openTime: '00:00', closeTime: '00:00' },
    },
    onboardingCompleted: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  assistantConfig: {
    businessId: 'demo-biz-apex',
    assistantName: 'Apex AI Assistant',
    welcomeMessage: 'Hi! Welcome to Apex Tech Solutions. How can I assist you with laptop repairs, hardware upgrades, or diagnostics today?',
    language: 'English',
    tone: 'friendly',
    voiceEnabled: true,
    appointmentEnabled: true,
    published: true,
    customInstructions: 'Always offer 30-day warranty reassurance on repairs.',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  products: [
    {
      id: 'p1',
      businessId: 'demo-biz-apex',
      name: 'Samsung 990 Pro 2TB NVMe SSD',
      description: 'Ultra-fast PCIe Gen 4 NVMe Solid State Drive for high-speed computing.',
      price: 189.99,
      currency: 'USD',
      category: 'Storage',
      available: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'p2',
      businessId: 'demo-biz-apex',
      name: 'Corsair Vengeance 32GB DDR5 RAM Kit',
      description: 'Dual-channel 6000MHz low-latency performance memory for laptops/desktops.',
      price: 119.5,
      currency: 'USD',
      category: 'Memory',
      available: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  ],
  services: [
    {
      id: 's1',
      businessId: 'demo-biz-apex',
      name: 'Laptop Screen Replacement',
      description: 'OEM display panel replacement for broken, flickering, or cracked screens. Includes 60-day warranty.',
      price: 129.0,
      currency: 'USD',
      durationMinutes: 45,
      available: true,
      bookingRequirements: 'Please bring your laptop charger if possible.',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 's2',
      businessId: 'demo-biz-apex',
      name: 'Comprehensive Hardware Diagnostic',
      description: 'In-depth motherboard, memory, battery, and thermal throttling analysis.',
      price: 49.0,
      currency: 'USD',
      durationMinutes: 30,
      available: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 's3',
      businessId: 'demo-biz-apex',
      name: 'Liquid Damage Ultrasonic Cleaning',
      description: 'Ultrasonic board bath and microscopic trace repair for water or coffee spills.',
      price: 175.0,
      currency: 'USD',
      durationMinutes: 60,
      available: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  ],
  faqs: [
    {
      id: 'f1',
      businessId: 'demo-biz-apex',
      question: 'Do you offer warranty on repairs?',
      answer: 'Yes! All parts and labor include a 60-day warranty against manufacturer defects.',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'f2',
      businessId: 'demo-biz-apex',
      question: 'How long does a diagnostic take?',
      answer: 'Standard diagnostics are completed within 30 to 45 minutes.',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  ],
  knowledge: [
    {
      id: 'k1',
      businessId: 'demo-biz-apex',
      title: 'Parking and Accessibility',
      content: 'Free parking is available behind the building on Innovation Way. The facility is fully wheelchair accessible.',
      sourceType: 'location',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  ],
};

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { businessId, message, history = [], channel = 'chat', conversationId } = body;

    if (!message || typeof message !== 'string' || !message.trim()) {
      return NextResponse.json({ error: 'Message text is required' }, { status: 400 });
    }

    let context: GroundedBusinessContext = DEMO_CONTEXT;

    // If businessId is provided and not demo, attempt Firestore lookup
    if (businessId && businessId !== 'demo-biz-apex') {
      try {
        const bizRef = doc(db, 'businesses', businessId);
        const bizSnap = await getDoc(bizRef);

        if (bizSnap.exists()) {
          const businessData = { id: bizSnap.id, ...bizSnap.data() } as Business;

          // Fetch assistant config
          let assistantConfig: AssistantConfig | null = null;
          const configRef = doc(db, 'businesses', businessId, 'assistant', 'config');
          const configSnap = await getDoc(configRef);
          if (configSnap.exists()) {
            assistantConfig = configSnap.data() as AssistantConfig;
          }

          // Fetch products
          const productsSnap = await getDocs(collection(db, 'businesses', businessId, 'products'));
          const products = productsSnap.docs.map((d: any) => ({ id: d.id, ...d.data() } as Product));

          // Fetch services
          const servicesSnap = await getDocs(collection(db, 'businesses', businessId, 'services'));
          const services = servicesSnap.docs.map((d: any) => ({ id: d.id, ...d.data() } as ServiceItem));

          // Fetch faqs
          const faqsSnap = await getDocs(collection(db, 'businesses', businessId, 'faqs'));
          const faqs = faqsSnap.docs.map((d: any) => ({ id: d.id, ...d.data() } as FAQ));

          // Fetch knowledge
          const knowledgeSnap = await getDocs(collection(db, 'businesses', businessId, 'knowledge'));
          const knowledge = knowledgeSnap.docs.map((d: any) => ({ id: d.id, ...d.data() } as KnowledgeEntry));

          context = {
            business: businessData,
            assistantConfig,
            products,
            services,
            faqs,
            knowledge,
          };
        }
      } catch (err) {
        console.warn('Could not query Firestore for business context, using demo fallback:', err);
      }
    }

    // Generate grounded AI response
    const aiOutput = await generateGroundedAIResponse(message, history, context);

    // Save conversation to Firestore if not a demo run
    let activeConvId = conversationId || `conv-${Date.now()}`;
    if (businessId && businessId !== 'demo-biz-apex') {
      try {
        const convRef = doc(db, 'businesses', businessId, 'conversations', activeConvId);
        await setDoc(
          convRef,
          {
            businessId,
            channel,
            status: aiOutput.suggestedAction === 'HUMAN_HANDOFF' ? 'needs_human' : 'active',
            lastMessageAt: new Date().toISOString(),
            previewMessage: aiOutput.reply.slice(0, 100),
          },
          { merge: true }
        );

        // Add user message
        const messagesCol = collection(db, 'businesses', businessId, 'conversations', activeConvId, 'messages');
        await addDoc(messagesCol, {
          sender: 'user',
          content: message,
          timestamp: new Date().toISOString(),
          isVoice: channel === 'voice',
          serverCreatedAt: serverTimestamp(),
        });

        // Add assistant message
        await addDoc(messagesCol, {
          sender: 'assistant',
          content: aiOutput.reply,
          timestamp: new Date().toISOString(),
          serverCreatedAt: serverTimestamp(),
        });
      } catch (err) {
        console.warn('Failed saving messages to Firestore:', err);
      }
    }

    return NextResponse.json({
      reply: aiOutput.reply,
      suggestedAction: aiOutput.suggestedAction,
      conversationId: activeConvId,
      metadata: aiOutput.metadata,
    });
  } catch (error: any) {
    console.error('AI chat endpoint error:', error);
    return NextResponse.json(
      { error: error?.message || 'Internal server error processing AI response' },
      { status: 500 }
    );
  }
}
