export type UserRole = 'business_owner' | 'customer' | 'admin';

export interface UserProfile {
  uid: string;
  email: string;
  fullName: string;
  photoURL?: string;
  role: UserRole;
  createdAt: string;
  updatedAt: string;
}

export interface DaySchedule {
  isOpen: boolean;
  openTime: string; // e.g. "09:00"
  closeTime: string; // e.g. "18:00"
  breakStart?: string;
  breakEnd?: string;
}

export type BusinessHours = {
  monday: DaySchedule;
  tuesday: DaySchedule;
  wednesday: DaySchedule;
  thursday: DaySchedule;
  friday: DaySchedule;
  saturday: DaySchedule;
  sunday: DaySchedule;
};

export interface Business {
  id: string;
  ownerId: string;
  name: string;
  slug: string;
  category: string;
  description: string;
  phone: string;
  email: string;
  website?: string;
  address: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  mapsUrl?: string;
  timezone: string;
  businessHours: BusinessHours;
  onboardingCompleted: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Product {
  id: string;
  businessId: string;
  name: string;
  description: string;
  price: number;
  currency: string;
  category: string;
  available: boolean;
  imageUrl?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ServiceItem {
  id: string;
  businessId: string;
  name: string;
  description: string;
  price: number;
  currency: string;
  durationMinutes: number;
  available: boolean;
  bookingRequirements?: string;
  createdAt: string;
  updatedAt: string;
}

export type KnowledgeSourceType = 'manual' | 'faq' | 'policy' | 'location' | 'general';

export interface KnowledgeEntry {
  id: string;
  businessId: string;
  title: string;
  content: string;
  sourceType: KnowledgeSourceType;
  createdAt: string;
  updatedAt: string;
}

export interface FAQ {
  id: string;
  businessId: string;
  question: string;
  answer: string;
  category?: string;
  createdAt: string;
  updatedAt: string;
}

export type AssistantTone = 'professional' | 'friendly' | 'enthusiastic' | 'concise' | 'empathetic';

export interface AssistantConfig {
  businessId: string;
  assistantName: string;
  welcomeMessage: string;
  language: string;
  tone: AssistantTone;
  voiceEnabled: boolean;
  appointmentEnabled: boolean;
  published: boolean;
  customInstructions?: string;
  createdAt: string;
  updatedAt: string;
}

export type AppointmentStatus = 'pending' | 'confirmed' | 'cancelled' | 'completed' | 'rejected';

export interface Appointment {
  id: string;
  businessId: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  serviceId: string;
  serviceName: string;
  startAt: string; // ISO 8601 string
  endAt: string;   // ISO 8601 string
  status: AppointmentStatus;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export type ConversationChannel = 'chat' | 'voice';
export type ConversationStatus = 'active' | 'closed' | 'needs_human';

export interface Conversation {
  id: string;
  businessId: string;
  channel: ConversationChannel;
  status: ConversationStatus;
  startedAt: string;
  lastMessageAt: string;
  customerReference?: string;
  previewMessage?: string;
}

export interface ChatMessage {
  id: string;
  conversationId: string;
  sender: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: string;
  isVoice?: boolean;
}

export interface BusinessAnalytics {
  totalConversations: number;
  chatConversations: number;
  voiceSessions: number;
  appointmentsRequested: number;
  appointmentsConfirmed: number;
  unansweredQuestions: number;
  humanHandoffRequests: number;
}
