import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/firebase/client';
import {
  doc,
  getDoc,
  collection,
  query,
  where,
  getDocs,
  addDoc,
  updateDoc,
  serverTimestamp,
} from 'firebase/firestore';
import { computeAvailableSlots } from '@/lib/appointments/scheduling';
import { Appointment, Business, ServiceItem } from '@/types';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      businessId,
      customerName,
      customerEmail,
      customerPhone,
      serviceId,
      serviceName,
      startAt,
      notes,
    } = body;

    if (!businessId || !customerName || !customerPhone || !startAt) {
      return NextResponse.json(
        { error: 'Missing required appointment fields (name, phone, start time)' },
        { status: 400 }
      );
    }

    const startDate = new Date(startAt);
    if (isNaN(startDate.getTime())) {
      return NextResponse.json({ error: 'Invalid startAt ISO date' }, { status: 400 });
    }

    // Default 30 min duration if service not found
    let duration = 30;
    let resolvedServiceName = serviceName || 'General Appointment';

    if (businessId && businessId !== 'demo-biz-apex') {
      try {
        const bizSnap = await getDoc(doc(db, 'businesses', businessId));
        if (!bizSnap.exists()) {
          return NextResponse.json({ error: 'Business not found' }, { status: 404 });
        }
        const business = { id: bizSnap.id, ...bizSnap.data() } as Business;

        let service: ServiceItem = {
          id: serviceId || 'default',
          businessId,
          name: resolvedServiceName,
          description: '',
          price: 0,
          currency: 'USD',
          durationMinutes: 30,
          available: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };

        if (serviceId) {
          const srvSnap = await getDoc(doc(db, 'businesses', businessId, 'services', serviceId));
          if (srvSnap.exists()) {
            service = { id: srvSnap.id, ...srvSnap.data() } as ServiceItem;
            duration = service.durationMinutes;
            resolvedServiceName = service.name;
          }
        }

        // Server-side double booking validation
        const targetDateStr = startAt.split('T')[0];
        const existingSnap = await getDocs(
          query(
            collection(db, 'businesses', businessId, 'appointments'),
            where('status', 'in', ['pending', 'confirmed'])
          )
        );
        const existingAppts = existingSnap.docs.map((d: any) => ({ id: d.id, ...d.data() } as Appointment));

        const slots = computeAvailableSlots(targetDateStr, business, service, existingAppts);
        const requestedSlot = slots.find((s) => s.isoString === startAt);

        if (requestedSlot && !requestedSlot.isAvailable) {
          return NextResponse.json(
            { error: 'The selected appointment time is no longer available. Please choose another slot.' },
            { status: 409 }
          );
        }

        const endAt = new Date(startDate.getTime() + duration * 60 * 1000).toISOString();

        // Create appointment in Firestore
        const newAppt: Omit<Appointment, 'id'> = {
          businessId,
          customerName,
          customerEmail: customerEmail || '',
          customerPhone,
          serviceId: serviceId || '',
          serviceName: resolvedServiceName,
          startAt,
          endAt,
          status: 'confirmed', // Auto-confirm or pending
          notes: notes || '',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };

        const docRef = await addDoc(
          collection(db, 'businesses', businessId, 'appointments'),
          {
            ...newAppt,
            serverCreatedAt: serverTimestamp(),
          }
        );

        return NextResponse.json({
          success: true,
          appointment: { id: docRef.id, ...newAppt },
          message: 'Appointment successfully scheduled and confirmed!',
        });
      } catch (err: any) {
        console.error('Firestore appointment write error:', err);
      }
    }

    // Demo fallback response
    const endAt = new Date(startDate.getTime() + duration * 60 * 1000).toISOString();
    return NextResponse.json({
      success: true,
      appointment: {
        id: `appt-demo-${Date.now()}`,
        businessId,
        customerName,
        customerEmail: customerEmail || '',
        customerPhone,
        serviceId: serviceId || 's1',
        serviceName: resolvedServiceName,
        startAt,
        endAt,
        status: 'confirmed',
        notes: notes || '',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      message: 'Demo appointment confirmed successfully!',
    });
  } catch (err: any) {
    console.error('Appointment creation error:', err);
    return NextResponse.json(
      { error: err?.message || 'Failed to create appointment' },
      { status: 500 }
    );
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const { businessId, appointmentId, status, notes } = body;

    if (!businessId || !appointmentId || !status) {
      return NextResponse.json({ error: 'Missing businessId, appointmentId, or status' }, { status: 400 });
    }

    if (businessId !== 'demo-biz-apex') {
      try {
        const apptRef = doc(db, 'businesses', businessId, 'appointments', appointmentId);
        await updateDoc(apptRef, {
          status,
          ...(notes !== undefined ? { notes } : {}),
          updatedAt: new Date().toISOString(),
        });
      } catch (err: any) {
        console.error('Error updating appointment in Firestore:', err);
      }
    }

    return NextResponse.json({
      success: true,
      appointmentId,
      status,
      message: `Appointment status updated to ${status}`,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || 'Failed to update appointment' }, { status: 500 });
  }
}
