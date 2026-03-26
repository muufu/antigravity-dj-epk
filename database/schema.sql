-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Profiles table
create table public.profiles (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users on delete cascade not null unique,
  
  -- Required fields
  dj_name text not null,
  slug text unique not null,
  
  -- Optional fields
  profile_image_url text,
  logo_url text,
  bio text,
  genres text[] default '{}',
  cities_played text[] default '{}',
  contact_email text,
  instagram_url text,
  soundcloud_url text,

  -- Audio fields (reserved for future Mux upgrade)
  mux_asset_id text,
  mux_playback_id text,
  audio_status text check (audio_status in ('none', 'uploading', 'processing', 'ready', 'error')) default 'none',
  
  -- Publishing status
  status text check (status in ('draft', 'published')) default 'draft',
  
  -- Timestamps
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Index for fast slug lookups
create index profiles_slug_idx on public.profiles(slug);
create index profiles_user_id_idx on public.profiles(user_id);

-- Enable Row Level Security
alter table public.profiles enable row level security;

-- RLS Policies
-- Authenticated users can manage their own profile
create policy "Users can view own profile"
  on public.profiles for select
  to authenticated
  using (auth.uid() = user_id);

create policy "Users can insert own profile"
  on public.profiles for insert
  to authenticated
  with check (auth.uid() = user_id);

create policy "Users can update own profile"
  on public.profiles for update
  to authenticated
  using (auth.uid() = user_id);

create policy "Users can delete own profile"
  on public.profiles for delete
  to authenticated
  using (auth.uid() = user_id);

-- Public users can view published profiles only
create policy "Public can view published profiles"
  on public.profiles for select
  to anon
  using (status = 'published');

-- Function to update updated_at timestamp
create or replace function public.handle_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- Trigger to auto-update updated_at
create trigger set_updated_at
  before update on public.profiles
  for each row
  execute function public.handle_updated_at();

-- ============================================
-- Storage bucket for profile images
-- ============================================

insert into storage.buckets (id, name, public)
values ('profile-images', 'profile-images', true);

-- Policy: Anyone can view
create policy "Public Access"
on storage.objects for select
using ( bucket_id = 'profile-images' );

-- Policy: Authenticated users can upload
create policy "Authenticated users can upload"
on storage.objects for insert
with check (
  bucket_id = 'profile-images' 
  AND auth.role() = 'authenticated'
);

-- Policy: Users can update their own files
create policy "Users can update own files"
on storage.objects for update
using ( 
  bucket_id = 'profile-images'
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Policy: Users can delete their own files
create policy "Users can delete own files"
on storage.objects for delete
using ( 
  bucket_id = 'profile-images'
  AND auth.uid()::text = (storage.foldername(name))[1]
);
