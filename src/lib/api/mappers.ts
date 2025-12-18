import type { AISettingsDTO, CustomerDTO, NotificationDTO, TicketDTO, TemplateDTO, TicketMessageDTO } from "./contracts";

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

export function mapTicketRow(row: any): TicketDTO {
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
      id: row.customer?.id,
      name: row.customer?.name,
      email: row.customer?.email,
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

export function mapCustomerRow(row: any): CustomerDTO {
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

export function mapTemplateRow(row: any): TemplateDTO {
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

export function mapNotificationRow(row: any): NotificationDTO {
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

export function mapTicketMessageRow(row: any): TicketMessageDTO {
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

export function mapAISettingsRow(row: any): AISettingsDTO {
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
