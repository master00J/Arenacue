-- ArenaCue website: reviews
-- Run dit in Supabase SQL Editor.

create table if not exists public.reviews (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  name text not null,
  club text not null,
  role text,
  rating int not null default 5,
  quote text not null,
  status text not null default 'pending',
  source text not null default 'website',
  constraint reviews_rating_check check (rating between 1 and 5),
  constraint reviews_status_check check (status in ('pending', 'published', 'rejected'))
);

alter table public.reviews enable row level security;

drop policy if exists "Anyone can submit reviews" on public.reviews;
create policy "Anyone can submit reviews"
on public.reviews
for insert
to anon
with check (
  source = 'website'
  and status = 'pending'
  and length(trim(name)) >= 2
  and length(trim(club)) >= 2
  and length(trim(quote)) >= 20
);

drop policy if exists "Anyone can read published reviews" on public.reviews;
create policy "Anyone can read published reviews"
on public.reviews
for select
to anon
using (status = 'published');

create index if not exists reviews_created_at_idx
on public.reviews (created_at desc);

create index if not exists reviews_status_idx
on public.reviews (status);
