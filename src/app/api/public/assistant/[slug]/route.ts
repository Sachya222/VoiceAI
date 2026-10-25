import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/firebase/client';
import { collection, query, where, getDocs, doc, getDoc } from 'firebase/firestore';
import { Business, AssistantConfig, ServiceItem, Product, FAQ } from '@/types';

export const dynamic = 'force-dynamic';

const DEMO_BUSINESS: Business = {
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
};

const DEMO_ASSISTANT: AssistantConfig = {
  businessId: 'demo-biz-apex',
  assistantName: 'Apex AI Assistant',
  welcomeMessage: 'Hi! Welcome to Apex Tech Solutions. How can I assist you with laptop repairs, hardware upgrades, or diagnostics today?',
  language: 'English',
  tone: 'friendly',
  voiceEnabled: true,
  appointmentEnabled: true,
  published: true,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

export async function GET(
  req: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const slug = params.slug;

    if (slug === 'apex-tech-solutions' || slug === 'demo') {
      return NextResponse.json({
        business: DEMO_BUSINESS,
        assistant: DEMO_ASSISTANT,
        services: [
          {
            id: 's1',
            name: 'Laptop Screen Replacement',
            description: 'OEM display panel replacement for broken screens. Includes 60-day warranty.',
            price: 129.0,
            durationMinutes: 45,
            available: true,
          },
          {
            id: 's2',
            name: 'Hardware Diagnostic',
            description: 'Comprehensive motherboard, battery, and component diagnostic.',
            price: 49.0,
            durationMinutes: 30,
            available: true,
          },
        ],
        faqs: [
          {
            question: 'What is your warranty policy?',
            answer: 'All our repairs come with a standard 60-day parts and labor warranty.',
          },
          {
            question: 'Do I need an appointment for diagnostic?',
            answer: 'Walk-ins are welcome, but booking an appointment guarantees immediate technician bench time.',
          },
        ],
      });
    }

    // Query Firestore by slug
    const bizQuery = query(collection(db, 'businesses'), where('slug', '==', slug));
    const bizSnap = await getDocs(bizQuery);

    if (bizSnap.empty) {
      return NextResponse.json({ error: 'Business assistant not found' }, { status: 404 });
    }

    const businessDoc = bizSnap.docs[0];
    const bizData = businessDoc.data() as Business;
    const businessId = businessDoc.id;

    // Fetch assistant config
    const configSnap = await getDoc(doc(db, 'businesses', businessId, 'assistant', 'config'));
    let assistantConfig: AssistantConfig | null = null;
    if (configSnap.exists()) {
      assistantConfig = configSnap.data() as AssistantConfig;
    }

    if (assistantConfig && !assistantConfig.published) {
      return NextResponse.json(
        { error: 'This business assistant is currently undergoing maintenance and is not published.' },
        { status: 403 }
      );
    }

    // Fetch public services
    const srvSnap = await getDocs(collection(db, 'businesses', businessId, 'services'));
    const services = srvSnap.docs
      .map((d: any) => ({ id: d.id, ...d.data() } as ServiceItem))
      .filter((s: any) => s.available);

    // Fetch public FAQs
    const faqSnap = await getDocs(collection(db, 'businesses', businessId, 'faqs'));
    const faqs = faqSnap.docs.map((d: any) => ({ id: d.id, ...d.data() } as FAQ));

    // Strip any sensitive private data
    const publicBusiness = {
      id: businessId,
      name: bizData.name,
      slug: bizData.slug,
      category: bizData.category,
      description: bizData.description,
      phone: bizData.phone,
      email: bizData.email,
      website: bizData.website,
      address: bizData.address,
      city: bizData.city,
      state: bizData.state,
      postalCode: bizData.postalCode,
      country: bizData.country,
      mapsUrl: bizData.mapsUrl,
      timezone: bizData.timezone,
      businessHours: bizData.businessHours,
    };

    return NextResponse.json({
      business: publicBusiness,
      assistant: assistantConfig || {
        assistantName: `${bizData.name} Assistant`,
        welcomeMessage: `Welcome to ${bizData.name}! How can I help you today?`,
        voiceEnabled: true,
        appointmentEnabled: true,
        published: true,
      },
      services,
      faqs,
    });
  } catch (err: any) {
    console.error('Public assistant retrieval error:', err);
    return NextResponse.json({ error: 'Failed to retrieve assistant profile' }, { status: 500 });
  }
}
