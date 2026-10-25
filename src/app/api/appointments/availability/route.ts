import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/firebase/client';
import { doc, getDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { computeAvailableSlots } from '@/lib/appointments/scheduling';
import { Business, ServiceItem, Appointment } from '@/types';

export const dynamic = 'force-dynamic';

const DEMO_BUSINESS: Business = {
  id: 'demo-biz-apex',
  ownerId: 'demo-owner-123',
  name: 'Apex Tech Solutions & Repairs',
  slug: 'apex-tech-solutions',
  category: 'Computer & Electronics Repair',
  description: 'Certified diagnostics and repairs.',
  phone: '+1 (555) 234-5678',
  email: 'support@apextech.demo',
  address: '104 Innovation Way',
  city: 'San Francisco',
  state: 'CA',
  postalCode: '94105',
  country: 'United States',
  timezone: 'America/Los_Angeles',
  businessHours: {
    monday: { isOpen: true, openTime: '09:00', closeTime: '18:00', breakStart: '13:00', breakEnd: '14:00' },
    tuesday: { isOpen: true, openTime: '09:00', closeTime: '18:00', breakStart: '13:00', breakEnd: '14:00' },
    wednesday: { isOpen: true, openTime: '09:00', closeTime: '18:00', breakStart: '13:00', breakEnd: '14:00' },
    thursday: { isOpen: true, openTime: '09:00', closeTime: '18:00', breakStart: '13:00', breakEnd: '14:00' },
    friday: { isOpen: true, openTime: '09:00', closeTime: '17:00' },
    saturday: { isOpen: true, openTime: '10:00', closeTime: '15:00' },
    sunday: { isOpen: false, openTime: '00:00', closeTime: '00:00' },
  },
  onboardingCompleted: true,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

const DEMO_SERVICES: Record<string, ServiceItem> = {
  s1: {
    id: 's1',
    businessId: 'demo-biz-apex',
    name: 'Laptop Screen Replacement',
    description: 'OEM display panel replacement.',
    price: 129.0,
    currency: 'USD',
    durationMinutes: 45,
    available: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  s2: {
    id: 's2',
    businessId: 'demo-biz-apex',
    name: 'Hardware Diagnostic',
    description: 'Full diagnostic analysis.',
    price: 49.0,
    currency: 'USD',
    durationMinutes: 30,
    available: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
};

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const businessId = searchParams.get('businessId') || 'demo-biz-apex';
    const serviceId = searchParams.get('serviceId');
    const date = searchParams.get('date'); // YYYY-MM-DD

    if (!date) {
      return NextResponse.json({ error: 'Date (YYYY-MM-DD) is required' }, { status: 400 });
    }

    let business: Business = DEMO_BUSINESS;
    let service: ServiceItem = DEMO_SERVICES[serviceId || 's1'] || {
      id: 'default',
      businessId,
      name: 'General Service Appointment',
      description: 'Standard consultation',
      price: 50,
      currency: 'USD',
      durationMinutes: 30,
      available: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    let appointments: Appointment[] = [];

    if (businessId && businessId !== 'demo-biz-apex') {
      try {
        const bizSnap = await getDoc(doc(db, 'businesses', businessId));
        if (bizSnap.exists()) {
          business = { id: bizSnap.id, ...bizSnap.data() } as Business;
        }

        if (serviceId) {
          const srvSnap = await getDoc(doc(db, 'businesses', businessId, 'services', serviceId));
          if (srvSnap.exists()) {
            service = { id: srvSnap.id, ...srvSnap.data() } as ServiceItem;
          }
        }

        // Fetch appointments on this date
        const apptQuery = query(
          collection(db, 'businesses', businessId, 'appointments'),
          where('status', 'in', ['pending', 'confirmed'])
        );
        const apptSnap = await getDocs(apptQuery);
        appointments = apptSnap.docs.map((d: any) => ({ id: d.id, ...d.data() } as Appointment));
      } catch (err) {
        console.warn('Firestore availability query fallback:', err);
      }
    }

    const slots = computeAvailableSlots(date, business, service, appointments);

    return NextResponse.json({
      date,
      businessTimezone: business.timezone,
      serviceName: service.name,
      durationMinutes: service.durationMinutes,
      slots,
    });
  } catch (err: any) {
    console.error('Availability route error:', err);
    return NextResponse.json(
      { error: err?.message || 'Error checking appointment availability' },
      { status: 500 }
    );
  }
}
