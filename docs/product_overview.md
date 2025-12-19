# SupportAI Product Overview (MVP)

This document explains the current features and behavior of the SupportAI web app, with a special focus on the AI system.

## What the app does

SupportAI is an AI-assisted customer support workspace. It lets a support team:
- Manage incoming tickets and customer profiles.
- Generate and review AI drafts before sending a reply.
- Track analytics for resolution rates and volumes.
- Configure AI behavior, templates, and automation.

The backend is powered by Supabase (Postgres + Auth + Edge Functions), and the UI is built with Next.js + React Query.

## Main areas of the product

### 1) Dashboard
- Uses analytics data (last 7 days) instead of mock stats.
- Shows ticket volume and estimated resolution activity.
- Displays real counts for open tickets and human-needed tickets.

### 2) Inbox (Tickets)
- Lists tickets with search, tab filters, and cursor-based pagination.
- Tabs include: All, Priority, Drafts Ready, Human Needed, Resolved, Archived.
- Soft archive hides tickets from active tabs and moves them to Archived.
- Row actions: open detail panel, quick archive.
- Displays AI status, confidence indicator, sentiment, and priority.

### 3) Ticket Detail Panel (Thread view)
- Shows full message thread for the ticket (customer + agent messages).
- Reply editor lets an agent edit a draft and send a reply.
- Sending a reply:
  - Creates an agent message in the thread.
  - Marks the ticket as resolved.
  - Updates the draft content on the ticket.
- Regenerate triggers a new AI run in the background.

### 4) Customers
- List view with search and cursor pagination.
- Add, edit, and delete customers.
- Customer drawer shows profile stats and last ticket date.

### 5) AI Settings + Templates
- AI Settings are persisted and configurable:
  - aiEnabled
  - autoReply
  - learningMode (stored, not yet used in logic)
  - confidenceThreshold
  - maxResponseLength
  - toneValue
  - selectedPersona
- Templates are stored and managed in the database.
- The AI status card uses analytics (tickets in 7d, AI resolution rate) and reflects aiEnabled.

### 6) Notifications
- List notifications with read/unread state.
- Mark single notification as read.

### 7) Analytics
- Charts and summaries use backend analytics data:
  - Ticket volume (daily buckets)
  - AI vs human resolution split
  - Category breakdown
  - Summary metrics (open tickets, resolved, human-needed, AI resolution rate)

### 8) Auth and routing
- Supabase email + password login.
- Unauthenticated users are redirected to /login.
- Each user has an implicit "current org" for scoping.

### 9) Integrations and Feedback (MVP placeholder)
- Integrations and Feedback pages are present but currently show a Coming Soon placeholder.

## AI system: how it works

The AI system is built around an asynchronous run pipeline.

### AI pipeline stages
- A ticket can be AI-enabled or not. If AI is disabled for the org, aiStatus stays null.
- When AI is enabled and a run is triggered, the ticket aiStatus becomes "pending".
- Once the run finishes, aiStatus becomes "draft_ready" or "human_needed".

### AI run lifecycle
1) User creates a ticket or clicks Regenerate.
2) The API enqueues an ai_run row.
3) A Supabase Edge Function worker processes the run.
4) The worker stores its output in ai_runs and then updates the ticket if safe.

### AI output fields
Each AI run produces:
- intent (string)
- urgency (low|medium|high)
- confidence (0..100)
- sentiment (1..10)
- draftResponse (string)

### Draft safety and "latest run wins"
To prevent overwriting human work:
- Each ticket stores latest_run_id.
- The worker only writes to the ticket if the runId matches latest_run_id.
- If a human edited the draft after a run started, the worker does not overwrite the draft.

### Auto-reply behavior
If autoReply is enabled and confidence >= confidenceThreshold:
- The worker auto-resolves the ticket.
- It inserts an agent message using the AI draft.
- It creates a notification: "Auto-resolved by AI".

### Failure handling
If the AI run fails:
- The run status is marked "error".
- The ticket remains open.
- aiStatus becomes "human_needed" (or null if AI is disabled).
- A notification is created to alert the team.

### AI settings that affect behavior
- aiEnabled: gates whether any run is enqueued.
- autoReply + confidenceThreshold: controls auto resolution.
- maxResponseLength, toneValue, selectedPersona: passed into the AI prompt.
- learningMode: stored for future use (no behavior change yet).

### Model and fallback
- Primary model: Gemini (gemini-2.5-flash).
- If the model is unavailable, the worker generates a fallback draft based on rules.

### Live updates (Realtime)
- The UI subscribes to Supabase Realtime for tickets, ai_runs, ticket_messages, and notifications.
- When the worker updates a ticket or inserts a message, the UI updates automatically.

## Ticket message rules (thread consistency)
To make the ticket thread reflect reality:
- On ticket creation, a customer message is inserted with the initial content.
- When an agent resolves a ticket, an agent message is inserted with the draft content.

## Data and security notes
- All data is scoped by org_id.
- Supabase RLS enforces access.
- Server-side API routes use the session-aware client (RLS enforced).
- The Edge Function uses the service role key for background processing.

## Known MVP limitations
- Integrations and Feedback are placeholders.
- Settings page (non-AI) is UI-only right now.
- Some dashboard elements are simplified estimates (based on analytics summary).

## Quick feature checklist (user perspective)
- Create a ticket and see it in the Inbox.
- Open ticket detail to view the thread and reply.
- Trigger AI run and watch the status update live.
- Manage customers, templates, and notifications.
- See analytics for the last 7 or 30 days.

---

If you want this doc adapted for investors, user onboarding, or a hackathon demo script, I can generate those versions too.
