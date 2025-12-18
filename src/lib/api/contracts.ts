export type TicketCategory = "refund" | "shipping" | "product" | "billing" | "general";
export type TicketPriority = "low" | "medium" | "high";
export type TicketStatus = "open" | "resolved";
export type TicketAIStatus = "pending" | "draft_ready" | "human_needed";

export type TicketDTO = {
  id: string;
  ticketNumber: string;

  subject: string;
  excerpt: string;
  content: string;

  category: TicketCategory;
  priority: TicketPriority;

  status: TicketStatus;

  aiStatus: TicketAIStatus | null;
  latestRunId: string | null;

  confidence: number | null;
  sentiment: number | null;
  draftResponse: string | null;

  customer: { id: string; name: string; email: string };

  archivedAt: string | null;
  createdAt: string;
  updatedAt: string;
};

export type CustomerDTO = {
  id: string;
  name: string;
  email: string;

  orders: number;
  ltv: number;
  lastTicketAt: string | null;

  createdAt: string;
  updatedAt: string;
};

export type AIRunStatus = "queued" | "running" | "done" | "error";
export type AIUrgency = "low" | "medium" | "high";

export type AIRunDTO = {
  id: string;
  ticketId: string;

  status: AIRunStatus;

  intent: string | null;
  urgency: AIUrgency | null;
  confidence: number | null;
  sentiment: number | null;
  draftResponse: string | null;

  error: string | null;

  createdAt: string;
  startedAt: string | null;
  finishedAt: string | null;
};

export type AIPersona = "professional" | "friendly" | "concise";

export type AISettingsDTO = {
  id: string;
  orgId: string;

  aiEnabled: boolean;
  autoReply: boolean;
  learningMode: boolean;

  confidenceThreshold: number;
  maxResponseLength: number;
  toneValue: number;
  selectedPersona: AIPersona;

  createdAt: string;
  updatedAt: string;
};

export type TemplateDTO = {
  id: string;
  orgId: string;

  title: string;
  category: string;
  content: string;

  archivedAt: string | null;
  createdAt: string;
  updatedAt: string;
};

export type NotificationType = "ticket" | "ai" | "system" | "team";
export type NotificationPriority = "normal" | "high";

export type NotificationDTO = {
  id: string;
  orgId: string;

  type: NotificationType;
  priority: NotificationPriority;

  title: string;
  message: string;

  ticketId: string | null;

  readAt: string | null;
  createdAt: string;
};

export type AnalyticsDTO = {
  range: { from: string; to: string; timezone: string };

  summary: {
    totalTickets: number;
    openTickets: number;
    resolvedTickets: number;
    humanNeededTickets: number;

    aiResolutionRate: number | null;
    avgHandleTimeSeconds: number | null;
    csatScore: number | null;
  };

  ticketVolume: Array<{ bucketStart: string; tickets: number }>;
  resolutionSplit: { aiResolved: number; humanResolved: number };
  categories: Array<{ category: TicketCategory; count: number }>;
};

export type ListResponse<T> = {
  items: T[];
  nextCursor: string | null;
};

export type TicketMessageAuthor = "customer" | "agent" | "system";

export type TicketMessageDTO = {
  id: string;
  ticketId: string;
  authorType: TicketMessageAuthor;
  authorName: string | null;
  content: string;
  createdAt: string;
};

// Request bodies (frozen v1 contract)

export type CreateTicketRequest = {
  subject: string;
  content: string;
  category: TicketCategory;
  priority?: TicketPriority;
  customerId?: string;
  customer?: { name: string; email: string };
  runAI?: boolean;
};

export type PatchTicketRequest = {
  subject?: string;
  content?: string;
  category?: TicketCategory;
  priority?: TicketPriority;
  status?: TicketStatus;
  draftResponse?: string | null;
};

export type TriggerAIRunRequest = {
  force?: boolean;
};

export type CreateCustomerRequest = {
  name: string;
  email: string;
};

export type PatchCustomerRequest = {
  name?: string;
  email?: string;
  orders?: number;
  ltv?: number;
};

export type CreateTemplateRequest = {
  title: string;
  category: string;
  content: string;
};

export type PatchTemplateRequest = {
  title?: string;
  category?: string;
  content?: string;
  archivedAt?: string | null;
};

export type PatchAISettingsRequest = Partial<{
  aiEnabled: boolean;
  autoReply: boolean;
  learningMode: boolean;
  confidenceThreshold: number;
  maxResponseLength: number;
  toneValue: number;
  selectedPersona: AIPersona;
}>;
