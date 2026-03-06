-- ZGNAL Infographic Lab: Generations telemetry table
-- Run this in Supabase SQL Editor or via `supabase db push`

create table if not exists public.generations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete set null,
  seed text not null,
  content_hash text not null,
  preset text,
  style text,
  layout text,
  aspect_ratio text default '16:9',
  compliance_score integer,
  research_queries integer default 0,
  research_findings integer default 0,
  source_urls text[] default '{}',
  topics text[] default '{}',
  pipeline_trace jsonb,
  duration_ms integer,
  ip_hash text,
  created_at timestamptz default now()
);

-- Indexes for analytics queries
create index if not exists idx_generations_created on public.generations(created_at desc);
create index if not exists idx_generations_user on public.generations(user_id) where user_id is not null;

-- RLS: anon/authenticated can insert, users can read their own
alter table public.generations enable row level security;

create policy "Anyone can insert generations" on public.generations
  for insert with check (true);

create policy "Users read own generations" on public.generations
  for select using (auth.uid() = user_id);
