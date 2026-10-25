import { GoogleGenerativeAI } from '@google/generative-ai';
import { Business, Product, ServiceItem, KnowledgeEntry, FAQ, AssistantConfig } from '@/types';

export interface GroundedBusinessContext {
  business: Business;
  assistantConfig?: AssistantConfig | null;
  products: Product[];
  services: ServiceItem[];
  faqs: FAQ[];
  knowledge: KnowledgeEntry[];
}

export interface ChatHistoryMessage {
  sender: 'user' | 'assistant' | 'system';
  content: string;
}

export interface AIResponseOutput {
  reply: string;
  suggestedAction?: 'BOOK_APPOINTMENT' | 'GET_DIRECTIONS' | 'VIEW_PRODUCTS' | 'HUMAN_HANDOFF' | null;
  metadata?: {
    modelUsed: string;
    isFallback: boolean;
  };
}

export async function generateGroundedAIResponse(
  userMessage: string,
  history: ChatHistoryMessage[],
  context: GroundedBusinessContext
): Promise<AIResponseOutput> {
  const { business, assistantConfig, products, services, faqs, knowledge } = context;

  // Compile detailed, structured facts
  const businessHoursFormatted = Object.entries(business.businessHours || {})
    .map(([day, sched]) => {
      if (!sched.isOpen) return `${day.toUpperCase()}: Closed`;
      return `${day.toUpperCase()}: ${sched.openTime} to ${sched.closeTime}${
        sched.breakStart ? ` (Break: ${sched.breakStart} - ${sched.breakEnd})` : ''
      }`;
    })
    .join('\n');

  const productsList = products.length
    ? products
        .map(
          (p) =>
            `- ${p.name} (${p.category}): $${p.price} [${p.available ? 'In Stock' : 'Out of Stock'}] - ${p.description}`
        )
        .join('\n')
    : 'No specific products registered.';

  const servicesList = services.length
    ? services
        .map(
          (s) =>
            `- ${s.name}: $${s.price} (${s.durationMinutes} mins) [${s.available ? 'Available' : 'Unavailable'}] - ${s.description}`
        )
        .join('\n')
    : 'No specific services registered.';

  const faqsList = faqs.length
    ? faqs.map((f) => `Q: ${f.question}\nA: ${f.answer}`).join('\n\n')
    : 'No custom FAQs provided.';

  const knowledgeList = knowledge.length
    ? knowledge.map((k) => `[${k.sourceType.toUpperCase()}] ${k.title}:\n${k.content}`).join('\n\n')
    : 'No additional knowledge documents.';

  const tone = assistantConfig?.tone || 'friendly and professional';
  const language = assistantConfig?.language || 'English';
  const assistantName = assistantConfig?.assistantName || `${business.name} AI Assistant`;
  const customInstructions = assistantConfig?.customInstructions || '';

  const systemPrompt = `You are ${assistantName}, the dedicated customer-facing AI assistant for "${business.name}".
Your tone should be ${tone}.
Your primary response language is ${language}.

BUSINESS INFORMATION:
- Name: ${business.name}
- Category / Industry: ${business.category}
- Description: ${business.description}
- Phone: ${business.phone}
- Email: ${business.email}
- Website: ${business.website || 'Not specified'}
- Full Address: ${business.address}, ${business.city}, ${business.state} ${business.postalCode}, ${business.country}
- Google Maps: ${business.mapsUrl || 'Not specified'}
- Timezone: ${business.timezone}

BUSINESS HOURS:
${businessHoursFormatted}

SERVICES OFFERED:
${servicesList}

PRODUCTS OFFERED:
${productsList}

FREQUENTLY ASKED QUESTIONS (FAQs):
${faqsList}

ADDITIONAL KNOWLEDGE BASE:
${knowledgeList}

SPECIAL BUSINESS OWNER INSTRUCTIONS:
${customInstructions}

CRITICAL RULES & SAFETY GUIDELINES:
1. ONLY answer questions using the facts provided above.
2. NEVER invent or hallucinate prices, business locations, phone numbers, or opening hours.
3. If the user asks a question whose answer is NOT in the provided business context, politely inform them that you do not have that information and suggest contacting ${business.name} directly at ${business.phone} or ${business.email}.
4. If a customer wants to schedule or book an appointment:
   - Check if the service they mention is in the SERVICES list.
   - Mention the duration and price if applicable.
   - Politely ask for their preferred date, time, and contact info, or encourage them to click the "Book Appointment" button.
   - Do NOT confirm an appointment as permanently booked yourself, as availability must be verified in the reservation system.
5. If the customer asks for directions or location, provide the address and mention the Google Maps link.
6. If the customer is frustrated, confused, or asks to speak with a human, provide the phone number (${business.phone}) and offer a human handoff.
7. Keep responses concise, clear, and easy to read.

FORMATTING:
Provide a helpful, direct response to the user.`;

  const apiKey = process.env.GEMINI_API_KEY;

  if (apiKey && apiKey.trim() !== '' && !apiKey.includes('Placeholder')) {
    try {
      const genAI = new GoogleGenerativeAI(apiKey);
      const model = genAI.getGenerativeModel({
        model: 'gemini-3.1-flash-lite',
        systemInstruction: systemPrompt,
      });

      // Format previous chat history
      const formattedHistory = history.slice(-8).map((msg) => ({
        role: msg.sender === 'user' ? 'user' : 'model',
        parts: [{ text: msg.content }],
      }));

      const chat = model.startChat({
        history: formattedHistory,
      });

      const result = await chat.sendMessage(userMessage);
      const text = result.response.text();

      // Detect action intent
      let action: AIResponseOutput['suggestedAction'] = null;
      const lower = userMessage.toLowerCase();
      if (lower.includes('book') || lower.includes('appointment') || lower.includes('schedule') || lower.includes('slot')) {
        action = 'BOOK_APPOINTMENT';
      } else if (lower.includes('where') || lower.includes('direction') || lower.includes('map') || lower.includes('address')) {
        action = 'GET_DIRECTIONS';
      } else if (lower.includes('product') || lower.includes('buy') || lower.includes('price') || lower.includes('catalog')) {
        action = 'VIEW_PRODUCTS';
      } else if (lower.includes('human') || lower.includes('agent') || lower.includes('manager') || lower.includes('speak to')) {
        action = 'HUMAN_HANDOFF';
      }

      return {
        reply: text,
        suggestedAction: action,
        metadata: {
          modelUsed: 'gemini-3.1-flash-lite',
          isFallback: false,
        },
      };
    } catch (err: any) {
      console.warn('Gemini API call warning, falling back to grounded rule engine:', err?.message || err);
    }
  }

  // Robust Grounded Local Rule Engine Fallback (Zero external dependencies needed for evaluation)
  return generateLocalGroundedResponse(userMessage, context);
}

function generateLocalGroundedResponse(
  userMessage: string,
  context: GroundedBusinessContext
): AIResponseOutput {
  const { business, products, services, faqs } = context;
  const msg = userMessage.toLowerCase().trim();

  // Location / Address / Directions
  if (msg.includes('where') || msg.includes('address') || msg.includes('location') || msg.includes('reach') || msg.includes('map')) {
    const address = `${business.address}, ${business.city}, ${business.state} ${business.postalCode}, ${business.country}`;
    return {
      reply: `We are located at ${address}.${business.mapsUrl ? ` You can view directions on Google Maps here: ${business.mapsUrl}` : ''}`,
      suggestedAction: 'GET_DIRECTIONS',
      metadata: { modelUsed: 'grounded-engine-v1', isFallback: true },
    };
  }

  // Hours / Timings / Open
  if (msg.includes('hour') || msg.includes('timing') || msg.includes('open') || msg.includes('close') || msg.includes('today')) {
    const todayIndex = new Date().getDay(); // 0 is Sunday
    const dayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'] as const;
    const currentDay = dayNames[todayIndex];
    const todaySched = business.businessHours?.[currentDay];

    let todayInfo = '';
    if (todaySched) {
      todayInfo = todaySched.isOpen
        ? `Today (${currentDay.toUpperCase()}), we are open from ${todaySched.openTime} to ${todaySched.closeTime}.`
        : `Today (${currentDay.toUpperCase()}), we are currently closed.`;
    }

    return {
      reply: `${todayInfo} Feel free to ask if you would like our schedule for any other day or to book an appointment!`,
      suggestedAction: 'BOOK_APPOINTMENT',
      metadata: { modelUsed: 'grounded-engine-v1', isFallback: true },
    };
  }

  // Appointment / Booking
  if (msg.includes('book') || msg.includes('appointment') || msg.includes('schedule') || msg.includes('slot') || msg.includes('reserve')) {
    const serviceNames = services.map((s) => `${s.name} ($${s.price})`).join(', ');
    return {
      reply: `I would be happy to help you schedule an appointment! We offer: ${serviceNames || 'our standard services'}. Please select your preferred service and time using the booking tool.`,
      suggestedAction: 'BOOK_APPOINTMENT',
      metadata: { modelUsed: 'grounded-engine-v1', isFallback: true },
    };
  }

  // Products inquiry
  if (msg.includes('product') || msg.includes('item') || msg.includes('buy') || msg.includes('catalog') || msg.includes('stock')) {
    if (products.length > 0) {
      const items = products
        .slice(0, 4)
        .map((p) => `• ${p.name}: $${p.price} (${p.available ? 'In Stock' : 'Out of Stock'})`)
        .join('\n');
      return {
        reply: `Here are some of our available products:\n${items}\n\nLet me know if you need more details about any product!`,
        suggestedAction: 'VIEW_PRODUCTS',
        metadata: { modelUsed: 'grounded-engine-v1', isFallback: true },
      };
    }
  }

  // Services inquiry / Pricing
  if (msg.includes('service') || msg.includes('cost') || msg.includes('price') || msg.includes('charge') || msg.includes('fee')) {
    if (services.length > 0) {
      const servList = services
        .slice(0, 4)
        .map((s) => `• ${s.name}: $${s.price} (${s.durationMinutes} mins)`)
        .join('\n');
      return {
        reply: `Here are our popular services and pricing:\n${servList}\n\nWould you like to schedule an appointment for any of these?`,
        suggestedAction: 'BOOK_APPOINTMENT',
        metadata: { modelUsed: 'grounded-engine-v1', isFallback: true },
      };
    }
  }

  // Check matching FAQs
  for (const faq of faqs) {
    const qLower = faq.question.toLowerCase();
    const words = msg.split(' ').filter((w) => w.length > 3);
    const matches = words.filter((w) => qLower.includes(w));
    if (matches.length >= 2 || qLower.includes(msg) || msg.includes(qLower)) {
      return {
        reply: faq.answer,
        metadata: { modelUsed: 'grounded-faq-engine', isFallback: true },
      };
    }
  }

  // Human handoff / Contact
  if (msg.includes('human') || msg.includes('person') || msg.includes('speak') || msg.includes('call') || msg.includes('contact') || msg.includes('phone')) {
    return {
      reply: `You can reach a team member directly by phone at ${business.phone} or by email at ${business.email}. Our team is always ready to assist you.`,
      suggestedAction: 'HUMAN_HANDOFF',
      metadata: { modelUsed: 'grounded-engine-v1', isFallback: true },
    };
  }

  // General helpful grounded default
  return {
    reply: `Hello! I am the AI Assistant for ${business.name}. ${business.description} You can ask me about our services, products, pricing, location, or opening hours, or book an appointment anytime. How can I help you today?`,
    metadata: { modelUsed: 'grounded-engine-v1', isFallback: true },
  };
}
