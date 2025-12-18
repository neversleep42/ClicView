-- Ensure new signups get demo data in their personal org (hackathon MVP).
-- Seeding is best-effort and should never block user creation.

create or replace function public.seed_mock_data_for_org(p_org_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $seed$
begin
  -- Customers
  insert into public.customers (org_id, name, email, orders, ltv, last_ticket_at)
  select p_org_id, 'Emma Johnson', 'emma.j@email.com', 12, 2450, '2024-06-27T10:00:00Z'::timestamptz
  where not exists (select 1 from public.customers c where c.org_id = p_org_id and lower(c.email) = lower('emma.j@email.com'));

  insert into public.customers (org_id, name, email, orders, ltv, last_ticket_at)
  select p_org_id, 'Michael Chen', 'm.chen@email.com', 8, 1890, '2024-06-27T09:30:00Z'::timestamptz
  where not exists (select 1 from public.customers c where c.org_id = p_org_id and lower(c.email) = lower('m.chen@email.com'));

  insert into public.customers (org_id, name, email, orders, ltv, last_ticket_at)
  select p_org_id, 'Sarah Miller', 'sarah.m@email.com', 15, 3200, '2024-06-26T16:00:00Z'::timestamptz
  where not exists (select 1 from public.customers c where c.org_id = p_org_id and lower(c.email) = lower('sarah.m@email.com'));

  insert into public.customers (org_id, name, email, orders, ltv, last_ticket_at)
  select p_org_id, 'James Wilson', 'j.wilson@email.com', 5, 890, '2024-06-24T14:00:00Z'::timestamptz
  where not exists (select 1 from public.customers c where c.org_id = p_org_id and lower(c.email) = lower('j.wilson@email.com'));

  insert into public.customers (org_id, name, email, orders, ltv, last_ticket_at)
  select p_org_id, 'Lisa Park', 'lisa.p@email.com', 23, 4560, '2024-06-24T12:00:00Z'::timestamptz
  where not exists (select 1 from public.customers c where c.org_id = p_org_id and lower(c.email) = lower('lisa.p@email.com'));

  insert into public.customers (org_id, name, email, orders, ltv, last_ticket_at)
  select p_org_id, 'Robert Davis', 'r.davis@email.com', 7, 1200, '2024-06-23T11:00:00Z'::timestamptz
  where not exists (select 1 from public.customers c where c.org_id = p_org_id and lower(c.email) = lower('r.davis@email.com'));

  insert into public.customers (org_id, name, email, orders, ltv, last_ticket_at)
  select p_org_id, 'Anna Thompson', 'anna.t@email.com', 31, 6780, '2024-06-22T11:00:00Z'::timestamptz
  where not exists (select 1 from public.customers c where c.org_id = p_org_id and lower(c.email) = lower('anna.t@email.com'));

  insert into public.customers (org_id, name, email, orders, ltv, last_ticket_at)
  select p_org_id, 'David Kim', 'd.kim@email.com', 4, 650, '2024-06-21T11:00:00Z'::timestamptz
  where not exists (select 1 from public.customers c where c.org_id = p_org_id and lower(c.email) = lower('d.kim@email.com'));

  -- Tickets
  insert into public.tickets (org_id, customer_id, ticket_number, subject, content, category, priority, status, ai_status, sentiment, draft_response, archived_at, created_at, updated_at)
  select
    p_org_id,
    (select c.id from public.customers c where c.org_id = p_org_id and lower(c.email) = lower('emma.j@email.com') limit 1),
    '#61391',
    'Request for refund on damaged item',
    $$Hi Support Team,

I received my order #61391 yesterday, but unfortunately the package arrived with visible damage. The product inside (Flexy Chair) has a bent leg and scratches on the surface.

I would like to request a full refund or a replacement. I've attached photos of the damage.

Please advise on the next steps.

Best regards,
Emma$$,
    'refund'::public.ticket_category,
    'high'::public.ticket_priority,
    'resolved'::public.ticket_status,
    null,
    4,
    $$Dear Emma,

I'm so sorry about the damaged item you received. This isn't the experience we want for our customers.

I've processed a full refund of $183 to your original payment method. You should see it within 3-5 business days.

You don't need to return the damaged chair - please dispose of it as you see fit or donate it if possible.

As an apology, I'm also adding a 15% discount code for your next order: SORRY15

Best regards,
Support Team$$,
    null,
    '2024-06-27T10:00:00Z'::timestamptz,
    '2024-06-27T10:00:00Z'::timestamptz
  where not exists (select 1 from public.tickets t where t.org_id = p_org_id and t.ticket_number = '#61391');

  insert into public.tickets (org_id, customer_id, ticket_number, subject, content, category, priority, status, ai_status, sentiment, draft_response, archived_at, created_at, updated_at)
  select
    p_org_id,
    (select c.id from public.customers c where c.org_id = p_org_id and lower(c.email) = lower('m.chen@email.com') limit 1),
    '#61390',
    'Where is my package? Order delayed',
    $$Hello,

I placed order #61390 two weeks ago and the tracking still shows "Processing". This is unacceptable as I paid for express shipping.

Items ordered:
- Cascade Bookshelf
- Zenith Sofa
- Nova Bar Stool
- Harmony Wardrobe

When will my order ship? I need these for my new apartment.

Thanks,
Michael$$,
    'shipping'::public.ticket_category,
    'high'::public.ticket_priority,
    'open'::public.ticket_status,
    'draft_ready'::public.ticket_ai_status,
    3,
    $$Hi Michael,

I apologize for the delay with your order. I've looked into this and found that the Harmony Wardrobe is currently backordered, which has held up your entire shipment.

Here's what I can do:
1. Ship the available items (Cascade Bookshelf, Zenith Sofa, Nova Bar Stool) today with overnight delivery at no extra cost
2. Ship the Wardrobe separately when it's back in stock (est. 5 days)
3. Refund your express shipping fee ($45)

Would this work for you? Please let me know and I'll process it immediately.

Best,
Support Team$$,
    null,
    '2024-06-27T09:30:00Z'::timestamptz,
    '2024-06-27T09:30:00Z'::timestamptz
  where not exists (select 1 from public.tickets t where t.org_id = p_org_id and t.ticket_number = '#61390');

  insert into public.tickets (org_id, customer_id, ticket_number, subject, content, category, priority, status, ai_status, sentiment, draft_response, archived_at, created_at, updated_at)
  select
    p_org_id,
    (select c.id from public.customers c where c.org_id = p_org_id and lower(c.email) = lower('sarah.m@email.com') limit 1),
    '#61389',
    'Product assembly instructions missing',
    $$Hi,

I just received my Nova Bar Stool order but there were no assembly instructions in the box. I've tried looking online but can't find the right manual.

Can you send me a PDF or link to the assembly guide?

Thanks,
Sarah$$,
    'product'::public.ticket_category,
    'low'::public.ticket_priority,
    'resolved'::public.ticket_status,
    null,
    7,
    $$Hi Sarah,

Here's the assembly guide for your Nova Bar Stool: [link]

Quick tips:
- Start with Step 3 (base assembly)
- The allen key included works for all bolts
- Don't fully tighten bolts until final step

If you need any help, just reply to this email!

Happy assembling,
Support Team$$,
    null,
    '2024-06-26T16:00:00Z'::timestamptz,
    '2024-06-26T16:00:00Z'::timestamptz
  where not exists (select 1 from public.tickets t where t.org_id = p_org_id and t.ticket_number = '#61389');

  insert into public.tickets (org_id, customer_id, ticket_number, subject, content, category, priority, status, ai_status, sentiment, draft_response, archived_at, created_at, updated_at)
  select
    p_org_id,
    (select c.id from public.customers c where c.org_id = p_org_id and lower(c.email) = lower('j.wilson@email.com') limit 1),
    '#61388',
    'Billing issue - double charged',
    $$URGENT!

I was charged TWICE for order #61388:
- $112 on June 24
- $112 on June 25

Please fix this immediately. I want a refund for the duplicate charge.

Haven Armchair was the item.

- James$$,
    'billing'::public.ticket_category,
    'high'::public.ticket_priority,
    'open'::public.ticket_status,
    'human_needed'::public.ticket_ai_status,
    2,
    null,
    null,
    '2024-06-24T14:00:00Z'::timestamptz,
    '2024-06-24T14:00:00Z'::timestamptz
  where not exists (select 1 from public.tickets t where t.org_id = p_org_id and t.ticket_number = '#61388');

  insert into public.tickets (org_id, customer_id, ticket_number, subject, content, category, priority, status, ai_status, sentiment, draft_response, archived_at, created_at, updated_at)
  select
    p_org_id,
    (select c.id from public.customers c where c.org_id = p_org_id and lower(c.email) = lower('lisa.p@email.com') limit 1),
    '#61387',
    'Love the new collection!',
    $$Hi there!

Just wanted to reach out and say how much I LOVE my new Nova Coffee Table! The quality is amazing and it looks exactly like the pictures.

The delivery was also super fast. Will definitely be ordering more!

Best,
Lisa$$,
    'general'::public.ticket_category,
    'low'::public.ticket_priority,
    'resolved'::public.ticket_status,
    null,
    10,
    $$Hi Lisa!

Thank you so much for the kind words! It means a lot to our team to hear you're loving your Nova Coffee Table.

As a thank you, here's a 10% discount on your next order: THANKYOU10

We can't wait to see what you add to your home next!

Warmly,
Support Team$$,
    null,
    '2024-06-24T12:00:00Z'::timestamptz,
    '2024-06-24T12:00:00Z'::timestamptz
  where not exists (select 1 from public.tickets t where t.org_id = p_org_id and t.ticket_number = '#61387');

  insert into public.tickets (org_id, customer_id, ticket_number, subject, content, category, priority, status, ai_status, sentiment, draft_response, archived_at, created_at, updated_at)
  select
    p_org_id,
    (select c.id from public.customers c where c.org_id = p_org_id and lower(c.email) = lower('r.davis@email.com') limit 1),
    '#61386',
    'Warranty claim for defective motor',
    $$Hello Support,

I purchased the Zenith Console recliner 3 months ago and the motor has stopped working. The chair won't recline anymore.

This should be covered under warranty. How do I get this fixed?

Order #61386
Purchase date: March 23, 2024

Thanks,
Robert$$,
    'product'::public.ticket_category,
    'medium'::public.ticket_priority,
    'open'::public.ticket_status,
    'draft_ready'::public.ticket_ai_status,
    5,
    $$Hi Robert,

Your Zenith Console is definitely covered under our 2-year warranty. I'm sorry about the motor issue.

Here's what happens next:
1. I'm scheduling a technician visit to your address (confirm: 123 Main St?)
2. They'll either repair or replace the motor on-site
3. If replacement is needed, we'll provide a brand new recliner

Available slots:
- Thursday, June 27, 10am-12pm
- Friday, June 28, 2pm-4pm

Which works best?

Best,
Support Team$$,
    null,
    '2024-06-23T11:00:00Z'::timestamptz,
    '2024-06-23T11:00:00Z'::timestamptz
  where not exists (select 1 from public.tickets t where t.org_id = p_org_id and t.ticket_number = '#61386');

  -- Templates
  insert into public.response_templates (org_id, title, category, content)
  select
    p_org_id,
    'Order Status Update',
    'Shipping',
    $$Thank you for reaching out! I can see your order {{order_id}} is currently being processed.

Here’s the latest update from our carrier: {{tracking_status}}.

If anything changes, we’ll notify you right away. If you have a deadline, tell us and we’ll do our best to help.$$ 
  where not exists (select 1 from public.response_templates t where t.org_id = p_org_id and t.title = 'Order Status Update');

  insert into public.response_templates (org_id, title, category, content)
  select
    p_org_id,
    'Refund Confirmation',
    'Returns',
    $$Your refund request has been approved.

Refund amount: {{amount}}
Original payment method: {{payment_method}}
Estimated time: 3-5 business days

If you have any questions, just reply to this message.$$ 
  where not exists (select 1 from public.response_templates t where t.org_id = p_org_id and t.title = 'Refund Confirmation');

  insert into public.response_templates (org_id, title, category, content)
  select
    p_org_id,
    'Product Inquiry',
    'General',
    $$Great question! The {{product_name}} is available in multiple sizes and finishes.

If you tell me your space constraints and preferred style, I can recommend the best option and share sizing details.$$ 
  where not exists (select 1 from public.response_templates t where t.org_id = p_org_id and t.title = 'Product Inquiry');

  -- Notifications
  insert into public.notifications (org_id, type, priority, title, message, ticket_id, read_at, created_at)
  select
    p_org_id,
    'system'::public.notification_type,
    'normal'::public.notification_priority,
    'Welcome',
    'Your workspace is ready. Create a ticket or run AI to generate a draft response.',
    null,
    null,
    now() - interval '1 hour'
  where not exists (select 1 from public.notifications n where n.org_id = p_org_id and n.title = 'Welcome');

  -- Keep ticket_number_seq ahead of seeded ticket numbers.
  perform setval(
    'public.ticket_number_seq',
    greatest(
      (
        select coalesce(
          max(nullif(regexp_replace(ticket_number, '\\D', '', 'g'), '')::int),
          0
        )
        from public.tickets
      ),
      61391
    ),
    true
  );
exception
  when others then
    raise notice 'seed_mock_data_for_org failed: %', sqlerrm;
end;
$seed$;

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $handle_new_user$
declare
  org_id uuid;
  org_name text;
begin
  org_name := coalesce(new.raw_user_meta_data->>'full_name', new.email, 'Personal');

  insert into public.organizations (name)
    values (org_name)
    returning id into org_id;

  insert into public.profiles (user_id, current_org_id)
    values (new.id, org_id);

  insert into public.memberships (org_id, user_id, role)
    values (org_id, new.id, 'owner');

  insert into public.ai_settings (
    org_id,
    ai_enabled,
    auto_reply,
    learning_mode,
    confidence_threshold,
    max_response_length,
    tone_value,
    selected_persona
  ) values (
    org_id,
    true,
    false,
    false,
    70,
    250,
    50,
    'professional'
  );

  begin
    perform public.seed_mock_data_for_org(org_id);
  exception
    when others then
      raise notice 'seed_mock_data_for_org failed during signup: %', sqlerrm;
  end;

  return new;
end;
$handle_new_user$;
