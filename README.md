# VoiceAI — Your Business. Your AI. Always Ready.

> **AI-Powered Voice and Chat Business Automation Platform**  
> *A production-conscious B.Tech CSE Capstone SaaS Project*

VoiceAI is a multi-tenant SaaS platform that allows businesses (clinics, computer repair shops, restaurants, salons, coaching centers, real estate agencies, etc.) to create personalized AI assistants that interact with customers through text chat and browser-based voice conversations.

---

## 🌟 Key Features

1. **Multi-Tenant SaaS Architecture**:
   - Each business has its own isolated profile, business hours, offerings, appointments, and conversation transcripts.
   - Enforced by Cloud Firestore Security Rules and server-side tenant validation.

2. **Grounded AI Assistant (Google Gemini 1.5 Flash)**:
   - Zero hallucination guarantee: The AI strictly grounds its replies in the business profile, products, services, FAQs, and hours.
   - Server-side API endpoint (`/api/ai/chat`) prevents client-side API key leakage.
   - Offline / sandbox fallback rule engine ensures full functionality during evaluations even before configuring external API keys.

3. **Browser Voice Interaction**:
   - Real-time speech-to-text recognition via Web Speech APIs with visual listening waves.
   - Speech synthesis audio feedback to speak responses aloud.
   - Automatic microphone permission detection and smooth fallback to text input.

4. **Concurrency-Safe Appointment Booking Engine**:
   - Intelligent slot calculation (`/api/appointments/availability`) respecting business opening hours, closing days, break times, and service durations.
   - Server-side double-booking prevention algorithm.
   - Booking statuses: `pending`, `confirmed`, `completed`, `cancelled`, and `rejected`.

5. **5-Step Guided Onboarding Wizard**:
   - Takes business owners from registration to a published public assistant in 5 minutes without writing a single line of code.

6. **Full Business Owner Dashboard**:
   - **Overview**: Live metrics, recent conversations, upcoming bookings, and assistant status.
   - **AI Assistant**: Customize name, tone, welcome message, custom grounding instructions, and test live in the embedded sandbox simulator.
   - **Products & Services**: Full CRUD management with availability toggles.
   - **Knowledge Base & FAQs**: Manual text knowledge grounding.
   - **Appointments**: Filter, confirm, reject, or complete bookings.
   - **Conversations**: Transcripts audit trail, voice vs. chat breakdowns, and human handoff flags.
   - **Analytics**: Real database metrics on communication channels, conversion rates, and booking requests.
   - **Settings**: Business hours, timezone, Google Maps URL, and account deletion.

7. **Dedicated Public Customer Assistant Page (`/assistant/[slug]`)**:
   - Fast, accessible customer experience with direct voice input, map directions link, and inline booking modal.

---

## 🛠️ Technology Stack

| Layer | Technology |
|---|---|
| **Frontend Framework** | Next.js 14 (App Router), React 18, TypeScript |
| **Styling & UI** | Tailwind CSS, Lucide Icons |
| **Authentication** | Firebase Authentication (Email/Password, Google OAuth, Password Recovery) |
| **Database** | Cloud Firestore with Multi-Tenant Security Rules |
| **AI Integration** | Google Generative AI (Gemini 1.5 Flash) via Server-Side API Routes |
| **Voice / Speech** | Browser Web Speech Recognition & Speech Synthesis |
| **Deployment** | Vercel or any Next.js host |

---

## 🚀 Quick Start (Local Development)

### 1. Prerequisites
- **Node.js** v18+ (tested with v24 LTS)
- **npm** or **pnpm**

### 2. Environment Variables Setup
Copy the example environment file:
```bash
cp .env.example .env.local
```

Edit `.env.local` with your credentials:
```env
# Client-side Firebase Web configuration (from Firebase Console)
NEXT_PUBLIC_FIREBASE_API_KEY=your_firebase_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id

# Server-side Gemini AI API key (from https://aistudio.google.com/app/apikey)
GEMINI_API_KEY=your_gemini_api_key
```

> **Tip for B.Tech Evaluation**: VoiceAI includes an **Instant Demo Sandbox Mode**! If you have not yet set up Firebase credentials, click **"Explore in Demo Sandbox Mode"** on the login or signup page to preview all features and test the assistant immediately.

### 3. Run Development Server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🔒 Firebase Security Rules

Deploy the included `firestore.rules` file to your Firebase project:
```bash
firebase deploy --only firestore:rules
```

These rules enforce:
1. Strict cross-tenant isolation (owners cannot view or modify data from other businesses).
2. Protection of private user roles (users cannot elevate themselves to administrators).
3. Public access restricted to published assistant profiles and services.
4. Concurrency validation for customer appointment creation.

---

## 📋 Evaluation Verification Checklist

- [x] **Authentication**: Email/Password, Google Sign-In, Password Reset, and Auth persistence.
- [x] **Business Onboarding**: 5-step guided profile, hours, initial offerings, and personality configuration.
- [x] **Products & Services**: Real-time CRUD with availability toggles and price formatting.
- [x] **Knowledge Grounding**: FAQs and policy documents fed securely to the AI context.
- [x] **Voice Assistant**: Speech-to-text microphone input with visual audio ripples and TTS playback.
- [x] **Appointments**: Interactive calendar slot selection preventing double-bookings.
- [x] **Dashboard Analytics**: Real computed metrics from Firestore records.
- [x] **Responsive Design**: Tested across mobile, tablet, and desktop viewports.

---

## 🎓 Academic Note
Developed as a capstone project for **B.Tech Computer Science & Engineering (CSE)**.
Demonstrates enterprise full-stack development, server-side LLM orchestration, voice technology integration, cloud database security, and multi-tenant software architecture.
