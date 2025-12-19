import type { AISettingsDTO, CustomerDTO, NotificationDTO, TicketDTO, TemplateDTO, TicketMessageDTO } from "./contracts";

type CustomerRefRow = {
  id: string;
  name: string;
  email: string;
};

type TicketRow = {
  id: string;
  ticket_number: string;
  subject: string;
  excerpt: string;
  content: string;
  category: TicketDTO["category"];
  priority: TicketDTO["priority"];
  status: TicketDTO["status"];
  ai_status: TicketDTO["aiStatus"];
  latest_run_id: string | null;
  confidence: number | string | null;
  sentiment: number | string | null;
  draft_response: string | null;
  archived_at: string | null;
  created_at: string;
  updated_at: string;
  customer?: CustomerRefRow | CustomerRefRow[] | null;
};

type CustomerRow = {
  id: string;
  name: string;
  email: string;
  orders: number;
  ltv: number | string | null;
  last_ticket_at: string | null;
  created_at: string;
  updated_at: string;
};

type TemplateRow = {
  id: string;
  org_id: string;
  title: string;
  category: string;
  content: string;
  archived_at: string | null;
  created_at: string;
  updated_at: string;
};

type NotificationRow = {
  id: string;
  org_id: string;
  type: NotificationDTO["type"];
  priority: NotificationDTO["priority"];
  title: string;
  message: string;
  ticket_id: string | null;
  read_at: string | null;
  created_at: string;
};

type TicketMessageRow = {
  id: string;
  ticket_id: string;
  author_type: TicketMessageDTO["authorType"];
  author_name: string | null;
  content: string;
  created_at: string;
};

type AISettingsRow = {
  id: string;
  org_id: string;
  ai_enabled: boolean;
  auto_reply: boolean;
  learning_mode: boolean;
  confidence_threshold: number;
  max_response_length: number;
  tone_value: number;
  selected_persona: AISettingsDTO["selectedPersona"];
  created_at: string;
  updated_at: string;
};

export const TICKET_SELECT = `
  id,
  ticket_number,
  subject,
  excerpt,
  content,
  category,
  priority,
  status,
  ai_status,
  latest_run_id,
  confidence,
  sentiment,
  draft_response,
  archived_at,
  created_at,
  updated_at,
  customer:customers (
    id,
    name,
    email
  )
`;

export function mapTicketRow(row: TicketRow): TicketDTO {
  const customer = Array.isArray(row.customer) ? row.customer[0] : row.customer;
  if (!customer) throw new Error("Ticket row missing customer.");

  return {
    id: row.id,
    ticketNumber: row.ticket_number,
    subject: row.subject,
    excerpt: row.excerpt,
    content: row.content,
    category: row.category,
    priority: row.priority,
    status: row.status,
    aiStatus: row.ai_status,
    latestRunId: row.latest_run_id,
    confidence: row.confidence == null ? null : Number(row.confidence),
    sentiment: row.sentiment == null ? null : Number(row.sentiment),
    draftResponse: row.draft_response,
    customer: {
      id: customer.id,
      name: customer.name,
      email: customer.email,
    },
    archivedAt: row.archived_at,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export const CUSTOMER_SELECT = `
  id,
  name,
  email,
  orders,
  ltv,
  last_ticket_at,
  created_at,
  updated_at
`;

export function mapCustomerRow(row: CustomerRow): CustomerDTO {
  return {
    id: row.id,
    name: row.name,
    email: row.email,
    orders: row.orders,
    ltv: row.ltv == null ? 0 : Number(row.ltv),
    lastTicketAt: row.last_ticket_at,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export const TEMPLATE_SELECT = `
  id,
  org_id,
  title,
  category,
  content,
  archived_at,
  created_at,
  updated_at
`;

export function mapTemplateRow(row: TemplateRow): TemplateDTO {
  return {
    id: row.id,
    orgId: row.org_id,
    title: row.title,
    category: row.category,
    content: row.content,
    archivedAt: row.archived_at,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export const NOTIFICATION_SELECT = `
  id,
  org_id,
  type,
  priority,
  title,
  message,
  ticket_id,
  read_at,
  created_at
`;

export function mapNotificationRow(row: NotificationRow): NotificationDTO {
  return {
    id: row.id,
    orgId: row.org_id,
    type: row.type,
    priority: row.priority,
    title: row.title,
    message: row.message,
    ticketId: row.ticket_id,
    readAt: row.read_at,
    createdAt: row.created_at,
  };
}

export const TICKET_MESSAGE_SELECT = `
  id,
  ticket_id,
  author_type,
  author_name,
  content,
  created_at
`;

export function mapTicketMessageRow(row: TicketMessageRow): TicketMessageDTO {
  return {
    id: row.id,
    ticketId: row.ticket_id,
    authorType: row.author_type,
    authorName: row.author_name,
    content: row.content,
    createdAt: row.created_at,
  };
}

export const AI_SETTINGS_SELECT = `
  id,
  org_id,
  ai_enabled,
  auto_reply,
  learning_mode,
  confidence_threshold,
  max_response_length,
  tone_value,
  selected_persona,
  created_at,
  updated_at
`;

export function mapAISettingsRow(row: AISettingsRow): AISettingsDTO {
  return {
    id: row.id,
    orgId: row.org_id,
    aiEnabled: row.ai_enabled,
    autoReply: row.auto_reply,
    learningMode: row.learning_mode,
    confidenceThreshold: row.confidence_threshold,
    maxResponseLength: row.max_response_length,
    toneValue: row.tone_value,
    selectedPersona: row.selected_persona,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}
