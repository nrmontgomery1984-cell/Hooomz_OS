-- Hooomz OS Database Schema
-- Run this in your Supabase SQL Editor

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- ============================================
-- ORGANIZATIONS TABLE
-- ============================================
create table if not exists organizations (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  slug text unique not null,
  logo_url text,
  settings jsonb default '{}',
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- ============================================
-- PROFILES TABLE (extends Supabase auth.users)
-- ============================================
create table if not exists profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  organization_id uuid references organizations(id) on delete set null,
  email text not null,
  full_name text,
  avatar_url text,
  role text default 'member' check (role in ('owner', 'admin', 'member')),
  phone text,
  job_title text,
  is_active boolean default true,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- ============================================
-- ORGANIZATION INVITES TABLE
-- ============================================
create table if not exists organization_invites (
  id uuid primary key default uuid_generate_v4(),
  organization_id uuid references organizations(id) on delete cascade not null,
  email text not null,
  role text default 'member' check (role in ('admin', 'member')),
  invited_by uuid references profiles(id) on delete set null,
  token text unique not null default encode(gen_random_bytes(32), 'hex'),
  expires_at timestamp with time zone default (now() + interval '7 days'),
  accepted_at timestamp with time zone,
  created_at timestamp with time zone default now(),

  unique(organization_id, email)
);

-- ============================================
-- PROJECTS TABLE (with org scoping)
-- ============================================
create table if not exists projects (
  id uuid primary key default uuid_generate_v4(),
  organization_id uuid references organizations(id) on delete cascade not null,
  name text not null,
  client_name text,
  client_email text,
  client_phone text,
  address text,
  city text,
  province text,
  postal_code text,
  status text default 'intake',
  phase text default 'intake',
  intake_type text,
  intake_data jsonb default '{}',
  estimate_low numeric,
  estimate_high numeric,
  contract_value numeric,
  health_score integer default 100,
  target_completion date,
  actual_completion date,
  notes text,
  created_by uuid references profiles(id) on delete set null,
  assigned_to uuid references profiles(id) on delete set null,
  deleted_at timestamp with time zone,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- ============================================
-- ROW LEVEL SECURITY POLICIES
-- ============================================

-- Enable RLS on all tables
alter table organizations enable row level security;
alter table profiles enable row level security;
alter table organization_invites enable row level security;
alter table projects enable row level security;

-- Profiles policies
create policy "Users can view own profile"
  on profiles for select
  using (auth.uid() = id);

create policy "Users can update own profile"
  on profiles for update
  using (auth.uid() = id);

create policy "Users can view profiles in same org"
  on profiles for select
  using (
    organization_id in (
      select organization_id from profiles where id = auth.uid()
    )
  );

-- Organizations policies
create policy "Users can view their organization"
  on organizations for select
  using (
    id in (
      select organization_id from profiles where id = auth.uid()
    )
  );

create policy "Org owners can update their organization"
  on organizations for update
  using (
    id in (
      select organization_id from profiles
      where id = auth.uid() and role = 'owner'
    )
  );

-- Organization invites policies
create policy "Org admins can view invites"
  on organization_invites for select
  using (
    organization_id in (
      select organization_id from profiles
      where id = auth.uid() and role in ('owner', 'admin')
    )
  );

create policy "Org admins can create invites"
  on organization_invites for insert
  with check (
    organization_id in (
      select organization_id from profiles
      where id = auth.uid() and role in ('owner', 'admin')
    )
  );

create policy "Org admins can delete invites"
  on organization_invites for delete
  using (
    organization_id in (
      select organization_id from profiles
      where id = auth.uid() and role in ('owner', 'admin')
    )
  );

-- Projects policies
create policy "Users can view projects in their org"
  on projects for select
  using (
    organization_id in (
      select organization_id from profiles where id = auth.uid()
    )
    and deleted_at is null
  );

create policy "Users can create projects in their org"
  on projects for insert
  with check (
    organization_id in (
      select organization_id from profiles where id = auth.uid()
    )
  );

create policy "Users can update projects in their org"
  on projects for update
  using (
    organization_id in (
      select organization_id from profiles where id = auth.uid()
    )
  );

create policy "Admins can delete projects in their org"
  on projects for delete
  using (
    organization_id in (
      select organization_id from profiles
      where id = auth.uid() and role in ('owner', 'admin')
    )
  );

-- ============================================
-- FUNCTIONS
-- ============================================

-- Function to create organization and set user as owner
create or replace function create_organization_for_user(
  org_name text,
  org_slug text,
  user_id uuid
)
returns uuid
language plpgsql
security definer
as $$
declare
  new_org_id uuid;
begin
  -- Create organization
  insert into organizations (name, slug)
  values (org_name, org_slug)
  returning id into new_org_id;

  -- Update user's profile with org and owner role
  update profiles
  set organization_id = new_org_id, role = 'owner'
  where id = user_id;

  return new_org_id;
end;
$$;

-- Function to handle new user signup
create or replace function handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, email, full_name)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1))
  );
  return new;
end;
$$;

-- Trigger for new user signup
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function handle_new_user();

-- Function to accept invite
create or replace function accept_organization_invite(invite_token text)
returns boolean
language plpgsql
security definer
as $$
declare
  invite_record organization_invites%rowtype;
begin
  -- Find valid invite
  select * into invite_record
  from organization_invites
  where token = invite_token
    and expires_at > now()
    and accepted_at is null;

  if invite_record.id is null then
    return false;
  end if;

  -- Update user's profile
  update profiles
  set organization_id = invite_record.organization_id,
      role = invite_record.role
  where id = auth.uid();

  -- Mark invite as accepted
  update organization_invites
  set accepted_at = now()
  where id = invite_record.id;

  return true;
end;
$$;

-- ============================================
-- INDEXES
-- ============================================
create index if not exists idx_profiles_organization on profiles(organization_id);
create index if not exists idx_projects_organization on projects(organization_id);
create index if not exists idx_projects_status on projects(status);
create index if not exists idx_projects_phase on projects(phase);
create index if not exists idx_organization_invites_token on organization_invites(token);
create index if not exists idx_organization_invites_email on organization_invites(email);
