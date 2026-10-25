'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/lib/context/AuthContext';
import { db } from '@/lib/firebase/client';
import { collection, getDocs, query, where } from 'firebase/firestore';
import {
  Calendar,
  Clock,
  User,
  Phone,
  Mail,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Filter,
  Check,
  X,
  Search,
} from 'lucide-react';
import { Appointment, AppointmentStatus } from '@/types';

export default function AppointmentsPage() {
  const { business, isDemoMode } = useAuth();
  const businessId = business?.id || 'demo-biz-apex';

  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadAppointments() {
      setLoading(true);
      if (isDemoMode || !db) {
        setAppointments([
          {
            id: 'a1',
            businessId,
            customerName: 'Marcus Vance',
            customerEmail: 'marcus@example.com',
            customerPhone: '+1 (555) 789-0123',
            serviceId: 's1',
            serviceName: 'Laptop Screen Replacement',
            startAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
            endAt: new Date(Date.now() + (24 * 60 + 45) * 60 * 1000).toISOString(),
            status: 'confirmed',
            notes: 'Dell XPS 15 4K panel flickers',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          },
          {
            id: 'a2',
            businessId,
            customerName: 'Sarah Jenkins',
            customerEmail: 'sarah.j@example.com',
            customerPhone: '+1 (555) 456-7890',
            serviceId: 's2',
            serviceName: 'Comprehensive Hardware Diagnostic',
            startAt: new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString(),
            endAt: new Date(Date.now() + (48 * 60 + 30) * 60 * 1000).toISOString(),
            status: 'pending',
            notes: 'Random reboot under high GPU load',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          },
          {
            id: 'a3',
            businessId,
            customerName: 'Ethan Cole',
            customerEmail: 'ethan@example.com',
            customerPhone: '+1 (555) 987-6543',
            serviceId: 's3',
            serviceName: 'Liquid Damage Ultrasonic Cleaning',
            startAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
            endAt: new Date(Date.now() - (24 * 60 - 60) * 60 * 1000).toISOString(),
            status: 'completed',
            notes: 'Coffee spill on keyboard tray',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          },
        ]);
        setLoading(false);
        return;
      }

      try {
        const snap = await getDocs(collection(db, 'businesses', businessId, 'appointments'));
        setAppointments(snap.docs.map((d: any) => ({ id: d.id, ...d.data() } as Appointment)));
      } catch (err) {
        console.warn('Error fetching appointments:', err);
      } finally {
        setLoading(false);
      }
    }

    loadAppointments();
  }, [businessId, isDemoMode]);

  const handleUpdateStatus = async (appointmentId: string, newStatus: AppointmentStatus) => {
    try {
      await fetch('/api/appointments', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          businessId,
          appointmentId,
          status: newStatus,
        }),
      });

      setAppointments((prev) =>
        prev.map((a) => (a.id === appointmentId ? { ...a, status: newStatus } : a))
      );
    } catch (err) {
      console.error('Failed to update status:', err);
    }
  };

  const filteredAppointments = appointments.filter((a) => {
    const matchesFilter = filterStatus === 'all' || a.status === filterStatus;
    const matchesSearch =
      a.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      a.customerPhone.includes(searchTerm) ||
      a.serviceName.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            <Calendar className="w-5 h-5 text-indigo-600" />
            <span>Appointment Scheduling System</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Confirmed and pending bookings reserved by customers through your AI voice and chat assistant.
          </p>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-3 rounded-2xl border border-slate-200/80 shadow-xs">
        <div className="flex flex-wrap items-center gap-1.5">
          {['all', 'pending', 'confirmed', 'completed', 'cancelled'].map((status) => (
            <button
              key={status}
              onClick={() => setFilterStatus(status)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold capitalize transition-all ${
                filterStatus === status
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              {status}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-64">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
            <Search className="w-3.5 h-3.5" />
          </div>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by customer or phone..."
            className="w-full pl-9 pr-3 py-1.5 text-xs rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-600 outline-none"
          />
        </div>
      </div>

      {/* Appointment Cards List */}
      <div className="space-y-3">
        {filteredAppointments.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-2xl border border-slate-200/80">
            <Calendar className="w-8 h-8 text-slate-300 mx-auto mb-2" />
            <p className="text-xs font-semibold text-slate-700">No appointments found</p>
            <p className="text-[11px] text-slate-500 mt-0.5">
              Customers can book slots anytime by visiting your public assistant URL.
            </p>
          </div>
        ) : (
          filteredAppointments.map((a) => {
            const start = new Date(a.startAt);
            const formattedDate = start.toLocaleDateString(undefined, {
              weekday: 'short',
              month: 'short',
              day: 'numeric',
              year: 'numeric',
            });
            const formattedTime = start.toLocaleTimeString(undefined, {
              hour: '2-digit',
              minute: '2-digit',
            });

            return (
              <div
                key={a.id}
                className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                <div className="space-y-2">
                  <div className="flex items-center gap-3">
                    <h3 className="font-bold text-slate-900 text-sm">{a.customerName}</h3>
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-semibold uppercase ${
                        a.status === 'confirmed'
                          ? 'bg-emerald-100 text-emerald-800'
                          : a.status === 'pending'
                          ? 'bg-amber-100 text-amber-800'
                          : a.status === 'completed'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-rose-100 text-rose-800'
                      }`}
                    >
                      {a.status}
                    </span>
                  </div>

                  <div className="flex flex-wrap items-center gap-4 text-xs text-slate-600">
                    <span className="font-semibold text-indigo-700">{a.serviceName}</span>
                    <span className="flex items-center gap-1 text-slate-500">
                      <Clock className="w-3.5 h-3.5" />
                      {formattedDate} at {formattedTime}
                    </span>
                    <span className="flex items-center gap-1 text-slate-500">
                      <Phone className="w-3.5 h-3.5" />
                      {a.customerPhone}
                    </span>
                    {a.customerEmail && (
                      <span className="flex items-center gap-1 text-slate-500">
                        <Mail className="w-3.5 h-3.5" />
                        {a.customerEmail}
                      </span>
                    )}
                  </div>

                  {a.notes && (
                    <p className="text-xs text-slate-500 italic bg-slate-50 p-2 rounded-lg border border-slate-200/50">
                      Customer Note: &ldquo;{a.notes}&rdquo;
                    </p>
                  )}
                </div>

                {/* Status Update Actions */}
                <div className="flex items-center gap-2 shrink-0">
                  {a.status === 'pending' && (
                    <>
                      <button
                        onClick={() => handleUpdateStatus(a.id, 'confirmed')}
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-xs transition-colors"
                      >
                        <Check className="w-3.5 h-3.5" />
                        <span>Confirm</span>
                      </button>
                      <button
                        onClick={() => handleUpdateStatus(a.id, 'rejected')}
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-rose-50 text-rose-700 hover:bg-rose-100 text-xs font-semibold transition-colors"
                      >
                        <X className="w-3.5 h-3.5" />
                        <span>Reject</span>
                      </button>
                    </>
                  )}

                  {a.status === 'confirmed' && (
                    <>
                      <button
                        onClick={() => handleUpdateStatus(a.id, 'completed')}
                        className="px-3 py-1.5 rounded-xl bg-blue-50 text-blue-700 hover:bg-blue-100 text-xs font-semibold transition-colors"
                      >
                        Mark Completed
                      </button>
                      <button
                        onClick={() => handleUpdateStatus(a.id, 'cancelled')}
                        className="px-3 py-1.5 rounded-xl bg-rose-50 text-rose-700 hover:bg-rose-100 text-xs font-semibold transition-colors"
                      >
                        Cancel
                      </button>
                    </>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
