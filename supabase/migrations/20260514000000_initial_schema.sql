-- Tennis Tracker database foundation.
-- This migration is intentionally self-contained: schema, validation helpers,
-- credit integrity triggers, RLS policies, RPC entrypoints, and storage policy
-- setup for private session media.

create extension if not exists pgcrypto;

do $$
begin
  create type public.user_role as enum ('player', 'coach');
exception
  when duplicate_object then null;
end $$;

do $$
begin
  create type public.session_status as enum ('pending', 'complete', 'cancelled', 'no_show');
exception
  when duplicate_object then null;
end $$;

do $$
begin
  create type public.match_result as enum ('W', 'L');
exception
  when duplicate_object then null;
end $$;

do $$
begin
  create type public.match_format as enum ('singles', 'doubles');
exception
  when duplicate_object then null;
end $$;

do $$
begin
  create type public.character_rarity as enum ('default', 'common', 'rare', 'epic', 'legendary');
exception
  when duplicate_object then null;
end $$;

do $$
begin
  create type public.unlock_condition_type as enum ('default', 'pack_drop', 'session_milestone', 'achievement');
exception
  when duplicate_object then null;
end $$;

do $$
begin
  create type public.pack_type as enum ('standard', 'better');
exception
  when duplicate_object then null;
end $$;

do $$
begin
  create type public.earned_via as enum ('default', 'pack', 'milestone', 'achievement');
exception
  when duplicate_object then null;
end $$;

do $$
begin
  create type public.goal_status as enum ('active', 'complete', 'abandoned');
exception
  when duplicate_object then null;
end $$;

create table if not exists public.characters (
  id text primary key,
  name text not null,
  rarity public.character_rarity not null,
  archetype text not null,
  signature_line text not null,
  unlock_condition_text text not null,
  unlock_condition_type public.unlock_condition_type not null,
  pixel_art_path text not null,
  display_order integer not null unique,
  created_at timestamptz not null default now(),
  check (length(trim(id)) > 0),
  check (length(trim(name)) > 0),
  check (length(trim(archetype)) > 0),
  check (length(trim(signature_line)) > 0),
  check (length(trim(unlock_condition_text)) > 0),
  check (length(trim(pixel_art_path)) > 0)
);

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  name text not null,
  role public.user_role not null,
  equipped_character_id text null references public.characters(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (length(trim(name)) > 0),
  check ((role = 'player') or equipped_character_id is null)
);

create table if not exists public.coach_player_links (
  coach_id uuid not null references public.profiles(id) on delete cascade,
  player_id uuid not null references public.profiles(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (coach_id, player_id),
  unique (coach_id),
  unique (player_id),
  check (coach_id <> player_id)
);

create table if not exists public.packages (
  id uuid primary key default gen_random_uuid(),
  player_id uuid not null references public.profiles(id) on delete cascade,
  total_sessions integer not null,
  sessions_used integer not null default 0,
  start_date date not null,
  end_date date null,
  price numeric(10, 2) null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (total_sessions > 0),
  check (sessions_used >= 0),
  check (sessions_used <= total_sessions),
  check (end_date is null or end_date >= start_date),
  check (price is null or price >= 0)
);

create table if not exists public.drills (
  id uuid primary key default gen_random_uuid(),
  player_id uuid null references public.profiles(id) on delete cascade,
  name text not null,
  category text not null,
  description text null,
  is_system boolean not null default false,
  created_at timestamptz not null default now(),
  check (length(trim(name)) > 0),
  check (length(trim(category)) > 0),
  check ((is_system and player_id is null) or (not is_system and player_id is not null))
);

create unique index if not exists drills_system_unique_idx
  on public.drills (lower(name), lower(category))
  where is_system;

create unique index if not exists drills_player_unique_idx
  on public.drills (player_id, lower(name), lower(category))
  where not is_system;

create table if not exists public.sessions (
  id uuid primary key default gen_random_uuid(),
  player_id uuid not null references public.profiles(id) on delete cascade,
  package_id uuid null references public.packages(id) on delete set null,
  date date not null default current_date,
  duration_minutes integer null,
  notes text null,
  status public.session_status not null default 'complete',
  no_package boolean not null default false,
  pre_self_rating jsonb null,
  pre_self_rating_submitted_at timestamptz null,
  post_self_rating jsonb null,
  post_self_rating_submitted_at timestamptz null,
  coach_rating jsonb null,
  coach_rating_submitted_at timestamptz null,
  coach_feedback text null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (duration_minutes is null or duration_minutes > 0),
  check (
    (pre_self_rating is null and pre_self_rating_submitted_at is null)
    or (pre_self_rating is not null and pre_self_rating_submitted_at is not null)
  ),
  check (
    (post_self_rating is null and post_self_rating_submitted_at is null)
    or (post_self_rating is not null and post_self_rating_submitted_at is not null)
  ),
  check (
    (coach_rating is null and coach_rating_submitted_at is null and coach_feedback is null)
    or (coach_rating is not null and coach_rating_submitted_at is not null)
  )
);

create table if not exists public.session_drills (
  session_id uuid not null references public.sessions(id) on delete cascade,
  drill_id uuid not null references public.drills(id) on delete restrict,
  created_at timestamptz not null default now(),
  primary key (session_id, drill_id)
);

create table if not exists public.matches (
  id uuid primary key default gen_random_uuid(),
  player_id uuid not null references public.profiles(id) on delete cascade,
  date date not null default current_date,
  opponent_name text not null,
  score text not null,
  surface text null,
  format public.match_format not null default 'singles',
  result public.match_result not null,
  notes text null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (length(trim(opponent_name)) > 0),
  check (length(trim(score)) > 0)
);

create table if not exists public.goals (
  id uuid primary key default gen_random_uuid(),
  player_id uuid not null references public.profiles(id) on delete cascade,
  title text not null,
  skill text null,
  target_rating numeric(3, 1) null,
  target_date date null,
  status public.goal_status not null default 'active',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (length(trim(title)) > 0),
  check (target_rating is null or (target_rating >= 1 and target_rating <= 10))
);

create table if not exists public.player_collection (
  player_id uuid not null references public.profiles(id) on delete cascade,
  character_id text not null references public.characters(id) on delete restrict,
  earned_at timestamptz not null default now(),
  earned_via public.earned_via not null,
  primary key (player_id, character_id)
);

create table if not exists public.player_packs (
  id uuid primary key default gen_random_uuid(),
  player_id uuid not null references public.profiles(id) on delete cascade,
  pack_type public.pack_type not null,
  earned_at timestamptz not null default now(),
  opened_at timestamptz null,
  dropped_character_id text null references public.characters(id) on delete set null,
  check (
    (opened_at is null and dropped_character_id is null)
    or opened_at is not null
  )
);

create table if not exists public.player_achievements (
  player_id uuid not null references public.profiles(id) on delete cascade,
  achievement_id text not null,
  character_id text null references public.characters(id) on delete set null,
  unlocked_at timestamptz not null default now(),
  primary key (player_id, achievement_id),
  check (length(trim(achievement_id)) > 0)
);

create table if not exists public.media (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references public.sessions(id) on delete cascade,
  player_id uuid not null references public.profiles(id) on delete cascade,
  storage_path text not null unique,
  mime_type text not null,
  file_size_bytes bigint null,
  uploaded_at timestamptz not null default now(),
  check (length(trim(storage_path)) > 0),
  check (mime_type in ('image/jpeg', 'image/png', 'video/mp4', 'video/quicktime')),
  check (file_size_bytes is null or (file_size_bytes > 0 and file_size_bytes <= 104857600))
);

create index if not exists coach_player_links_player_id_idx on public.coach_player_links (player_id);
create index if not exists packages_player_start_idx on public.packages (player_id, start_date desc);
create index if not exists packages_active_lookup_idx on public.packages (player_id, start_date desc, end_date) where sessions_used < total_sessions;
create index if not exists drills_player_idx on public.drills (player_id) where player_id is not null;
create index if not exists sessions_player_date_idx on public.sessions (player_id, date desc);
create index if not exists sessions_package_id_idx on public.sessions (package_id) where package_id is not null;
create index if not exists sessions_status_idx on public.sessions (status);
create index if not exists session_drills_drill_id_idx on public.session_drills (drill_id);
create index if not exists matches_player_date_idx on public.matches (player_id, date desc);
create index if not exists matches_player_opponent_idx on public.matches (player_id, lower(opponent_name));
create index if not exists matches_player_result_idx on public.matches (player_id, result);
create index if not exists goals_player_status_idx on public.goals (player_id, status);
create index if not exists player_collection_character_id_idx on public.player_collection (character_id);
create index if not exists player_packs_player_opened_idx on public.player_packs (player_id, opened_at) where opened_at is null;
create index if not exists player_achievements_character_id_idx on public.player_achievements (character_id) where character_id is not null;
create index if not exists media_session_id_idx on public.media (session_id);
create index if not exists media_player_id_idx on public.media (player_id);

create or replace function public.rubric_skill_keys()
returns text[]
language sql
immutable
set search_path = ''
as $$
  select array[
    'forehand',
    'backhand',
    'serve',
    'return',
    'volley',
    'footwork',
    'mental_game',
    'match_iq'
  ]::text[];
$$;

create or replace function public.is_valid_rubric_skill(skill text)
returns boolean
language sql
immutable
set search_path = ''
as $$
  select skill = any (public.rubric_skill_keys());
$$;

create or replace function public.is_valid_rating_json(rating jsonb)
returns boolean
language sql
immutable
set search_path = ''
as $$
  select rating is not null
    and jsonb_typeof(rating) = 'object'
    and (
      select array_agg(key order by key)
      from jsonb_object_keys(rating) as key
    ) = (
      select array_agg(key order by key)
      from unnest(public.rubric_skill_keys()) as key
    )
    and not exists (
      select 1
      from jsonb_each(rating) as item(key, value)
      where jsonb_typeof(value) <> 'number'
        or (value #>> '{}')::numeric <> trunc((value #>> '{}')::numeric)
        or (value #>> '{}')::integer < 1
        or (value #>> '{}')::integer > 10
    );
$$;

alter table public.sessions
  drop constraint if exists sessions_pre_self_rating_valid,
  add constraint sessions_pre_self_rating_valid check (pre_self_rating is null or public.is_valid_rating_json(pre_self_rating));

alter table public.sessions
  drop constraint if exists sessions_post_self_rating_valid,
  add constraint sessions_post_self_rating_valid check (post_self_rating is null or public.is_valid_rating_json(post_self_rating));

alter table public.sessions
  drop constraint if exists sessions_coach_rating_valid,
  add constraint sessions_coach_rating_valid check (coach_rating is null or public.is_valid_rating_json(coach_rating));

alter table public.goals
  drop constraint if exists goals_skill_valid,
  add constraint goals_skill_valid check (skill is null or public.is_valid_rubric_skill(skill));

create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create or replace function public.assert_profile_roles()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  if not exists (select 1 from public.profiles where id = new.coach_id and role = 'coach') then
    raise exception 'coach_player_links.coach_id must reference a coach profile';
  end if;

  if not exists (select 1 from public.profiles where id = new.player_id and role = 'player') then
    raise exception 'coach_player_links.player_id must reference a player profile';
  end if;

  return new;
end;
$$;

create or replace function public.assert_player_owner()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  if not exists (select 1 from public.profiles where id = new.player_id and role = 'player') then
    raise exception 'player_id must reference a player profile';
  end if;

  return new;
end;
$$;

create or replace function public.guard_profile_update()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  if old.role is distinct from new.role then
    raise exception 'profile role cannot be changed after creation';
  end if;

  if old.id is distinct from new.id then
    raise exception 'profile id cannot be changed';
  end if;

  if new.equipped_character_id is not null
     and not exists (
       select 1
       from public.player_collection as pc
       where pc.player_id = new.id
         and pc.character_id = new.equipped_character_id
     ) then
    raise exception 'players can only equip owned characters';
  end if;

  return new;
end;
$$;

create or replace function public.assert_session_media_owner()
returns trigger
language plpgsql
set search_path = public
as $$
declare
  session_player_id uuid;
begin
  select s.player_id into session_player_id
  from public.sessions as s
  where s.id = new.session_id;

  if session_player_id is null then
    raise exception 'media.session_id must reference an existing session';
  end if;

  if session_player_id <> new.player_id then
    raise exception 'media.player_id must match the session player_id';
  end if;

  return new;
end;
$$;

create or replace function public.session_consumes_credit(status public.session_status, package_id uuid)
returns boolean
language sql
immutable
set search_path = ''
as $$
  select package_id is not null and status not in ('cancelled', 'no_show');
$$;

create or replace function public.prepare_session_credit_fields()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  if new.package_id is not null and not exists (
    select 1
    from public.packages as p
    where p.id = new.package_id
      and p.player_id = new.player_id
  ) then
    raise exception 'session package_id must belong to the same player';
  end if;

  new.no_package = new.package_id is null and new.status not in ('cancelled', 'no_show');
  return new;
end;
$$;

create or replace function public.apply_session_credit_delta()
returns trigger
language plpgsql
set search_path = public
as $$
declare
  old_consumed boolean := false;
  new_consumed boolean := false;
begin
  if tg_op = 'DELETE' then
    old_consumed := public.session_consumes_credit(old.status, old.package_id);

    if old_consumed then
      update public.packages
      set sessions_used = sessions_used - 1
      where id = old.package_id;
    end if;

    return old;
  end if;

  if tg_op = 'INSERT' then
    new_consumed := public.session_consumes_credit(new.status, new.package_id);

    if new_consumed then
      update public.packages
      set sessions_used = sessions_used + 1
      where id = new.package_id;
    end if;

    return new;
  end if;

  old_consumed := public.session_consumes_credit(old.status, old.package_id);
  new_consumed := public.session_consumes_credit(new.status, new.package_id);

  if old_consumed and (not new_consumed or old.package_id is distinct from new.package_id) then
    update public.packages
    set sessions_used = sessions_used - 1
    where id = old.package_id;
  end if;

  if new_consumed and (not old_consumed or old.package_id is distinct from new.package_id) then
    update public.packages
    set sessions_used = sessions_used + 1
    where id = new.package_id;
  end if;

  return new;
end;
$$;

create or replace function public.get_active_package_id(for_player_id uuid, for_date date default current_date)
returns uuid
language sql
stable
set search_path = public
as $$
  select p.id
  from public.packages as p
  where p.player_id = for_player_id
    and p.sessions_used < p.total_sessions
    and p.start_date <= for_date
    and (p.end_date is null or p.end_date >= for_date)
  order by p.start_date desc, p.created_at desc
  limit 1;
$$;

create or replace function public.is_linked_player(for_player_id uuid, for_coach_id uuid default auth.uid())
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.coach_player_links as cpl
    where cpl.player_id = for_player_id
      and cpl.coach_id = for_coach_id
  );
$$;

create or replace function public.is_session_visible_to_current_user(for_session_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.sessions as s
    where s.id = for_session_id
      and (s.player_id = auth.uid() or public.is_linked_player(s.player_id))
  );
$$;

create or replace function public.award_session_rewards()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  completed_count integer;
  became_complete boolean := false;
begin
  if tg_op = 'INSERT' then
    became_complete := new.status = 'complete';
  elsif tg_op = 'UPDATE' then
    became_complete := new.status = 'complete' and old.status is distinct from new.status;
  end if;

  if became_complete then
    select count(*) into completed_count
    from public.sessions
    where player_id = new.player_id
      and status = 'complete';

    if completed_count > 0 and completed_count % 10 = 0 then
      insert into public.player_packs (player_id, pack_type)
      values (new.player_id, 'better');
    elsif completed_count > 0 and completed_count % 3 = 0 then
      insert into public.player_packs (player_id, pack_type)
      values (new.player_id, 'standard');
    end if;

    if completed_count = 25 then
      insert into public.player_collection (player_id, character_id, earned_via)
      values (new.player_id, 'court-strategist', 'milestone')
      on conflict do nothing;
    elsif completed_count = 50 then
      insert into public.player_collection (player_id, character_id, earned_via)
      values (new.player_id, 'tie-break-titan', 'milestone')
      on conflict do nothing;
    elsif completed_count = 100 then
      insert into public.player_collection (player_id, character_id, earned_via)
      values (new.player_id, 'grand-slam-guardian', 'milestone')
      on conflict do nothing;
    elsif completed_count = 250 then
      insert into public.player_collection (player_id, character_id, earned_via)
      values (new.player_id, 'legend-of-the-lines', 'milestone')
      on conflict do nothing;
    end if;
  end if;

  return new;
end;
$$;

create or replace function public.award_achievement(
  for_player_id uuid,
  achievement text,
  reward_character_id text
)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.player_achievements (player_id, achievement_id, character_id)
  values (for_player_id, achievement, reward_character_id)
  on conflict do nothing;

  insert into public.player_collection (player_id, character_id, earned_via)
  select for_player_id, reward_character_id, 'achievement'::public.earned_via
  where exists (
    select 1
    from public.player_achievements
    where player_id = for_player_id
      and achievement_id = achievement
      and character_id = reward_character_id
  )
  on conflict do nothing;
end;
$$;

create or replace function public.evaluate_session_achievements()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if coalesce(new.post_self_rating, new.coach_rating) is not null
     and exists (
       select 1
       from jsonb_each(coalesce(new.coach_rating, new.post_self_rating)) as rating(key, value)
       where (value #>> '{}')::numeric >= 8
     ) then
    perform public.award_achievement(new.player_id, 'skill_rating_8', 'the-eight-point-engine');
  end if;

  if new.coach_rating is not null
     and new.post_self_rating is not null
     and exists (
       select 1
       from jsonb_each(new.post_self_rating) as self_rating(key, value)
       join jsonb_each(new.coach_rating) as coach_rating(key, value) using (key)
       where (self_rating.value #>> '{}')::numeric - (coach_rating.value #>> '{}')::numeric >= 1
     ) then
    perform public.award_achievement(new.player_id, 'beat_coach_rating_by_1', 'confidence-captain');
  end if;

  if (
    select count(distinct s.date)
    from public.sessions as s
    where s.player_id = new.player_id
      and s.status = 'complete'
      and s.date between new.date - 6 and new.date
  ) >= 7 then
    perform public.award_achievement(new.player_id, 'seven_day_session_streak', 'streak-sprinter');
  end if;

  return new;
end;
$$;

create or replace function public.evaluate_match_achievements()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  wins_count integer;
  matches_this_month integer;
begin
  if new.result = 'W' then
    perform public.award_achievement(new.player_id, 'first_match_win', 'first-win-firebrand');

    select count(*) into wins_count
    from public.matches
    where player_id = new.player_id
      and result = 'W';

    if wins_count >= 20 then
      perform public.award_achievement(new.player_id, 'twenty_match_wins', 'victory-veteran');
    end if;
  end if;

  select count(*) into matches_this_month
  from public.matches
  where player_id = new.player_id
    and date_trunc('month', date::timestamp) = date_trunc('month', new.date::timestamp);

  if matches_this_month >= 5 then
    perform public.award_achievement(new.player_id, 'five_matches_single_month', 'calendar-crusher');
  end if;

  return new;
end;
$$;

create or replace function public.create_session_with_package_credit(
  p_player_id uuid,
  p_date date default current_date,
  p_duration_minutes integer default null,
  p_notes text default null,
  p_status public.session_status default 'complete',
  p_pre_self_rating jsonb default null,
  p_post_self_rating jsonb default null,
  p_drill_ids uuid[] default '{}'
)
returns public.sessions
language plpgsql
security definer
set search_path = public
as $$
declare
  active_package_id uuid;
  created_session public.sessions;
  drill_id uuid;
begin
  if auth.uid() is null or auth.uid() <> p_player_id then
    raise exception 'Only the player can create their own session';
  end if;

  select public.get_active_package_id(p_player_id, p_date) into active_package_id;

  insert into public.sessions (
    player_id,
    package_id,
    date,
    duration_minutes,
    notes,
    status,
    pre_self_rating,
    pre_self_rating_submitted_at,
    post_self_rating,
    post_self_rating_submitted_at
  )
  values (
    p_player_id,
    case when p_status in ('cancelled', 'no_show') then null else active_package_id end,
    p_date,
    p_duration_minutes,
    p_notes,
    p_status,
    p_pre_self_rating,
    case when p_pre_self_rating is null then null else now() end,
    p_post_self_rating,
    case when p_post_self_rating is null then null else now() end
  )
  returning * into created_session;

  foreach drill_id in array coalesce(p_drill_ids, '{}') loop
    insert into public.session_drills (session_id, drill_id)
    select created_session.id, drill_id
    where exists (
      select 1
      from public.drills as d
      where d.id = drill_id
        and (d.is_system or d.player_id = p_player_id)
    )
    on conflict do nothing;
  end loop;

  return created_session;
end;
$$;

create or replace function public.submit_coach_session_review(
  p_session_id uuid,
  p_coach_rating jsonb,
  p_coach_feedback text default null,
  p_status public.session_status default 'complete'
)
returns public.sessions
language plpgsql
security definer
set search_path = public
as $$
declare
  reviewed_session public.sessions;
begin
  if auth.uid() is null then
    raise exception 'Authentication required';
  end if;

  if not exists (
    select 1
    from public.sessions as s
    where s.id = p_session_id
      and public.is_linked_player(s.player_id, auth.uid())
  ) then
    raise exception 'Coach is not linked to this session player';
  end if;

  if p_status not in ('complete', 'cancelled', 'no_show') then
    raise exception 'Coach review status must be complete, cancelled, or no_show';
  end if;

  update public.sessions
  set coach_rating = case when p_status = 'complete' then p_coach_rating else null end,
      coach_rating_submitted_at = case when p_status = 'complete' then now() else null end,
      coach_feedback = nullif(trim(p_coach_feedback), ''),
      status = p_status
  where id = p_session_id
  returning * into reviewed_session;

  return reviewed_session;
end;
$$;

create or replace function public.open_player_pack(p_pack_id uuid)
returns table (
  pack_id uuid,
  character_id text,
  no_duplicate boolean
)
language plpgsql
security definer
set search_path = public
as $$
declare
  target_pack public.player_packs;
  rolled_rarity public.character_rarity;
  selected_character_id text;
begin
  select *
  into target_pack
  from public.player_packs
  where id = p_pack_id
  for update;

  if target_pack.id is null then
    raise exception 'Pack not found';
  end if;

  if auth.uid() is null or auth.uid() <> target_pack.player_id then
    raise exception 'Only the player can open their own pack';
  end if;

  if target_pack.opened_at is not null then
    return query select target_pack.id, target_pack.dropped_character_id, target_pack.dropped_character_id is null;
    return;
  end if;

  if target_pack.pack_type = 'standard' then
    rolled_rarity := 'common';
  elsif random() < 0.8 then
    rolled_rarity := 'common';
  else
    rolled_rarity := 'rare';
  end if;

  with rarity_order as (
    select *
    from (values
      ('common'::public.character_rarity, 1),
      ('rare'::public.character_rarity, 2),
      ('epic'::public.character_rarity, 3)
    ) as ordered(rarity, rank)
  ),
  starting_rank as (
    select rank from rarity_order where rarity = rolled_rarity
  ),
  eligible as (
    select c.id, ro.rank
    from public.characters as c
    join rarity_order as ro on ro.rarity = c.rarity
    cross join starting_rank as sr
    where ro.rank >= sr.rank
      and c.unlock_condition_type = 'pack_drop'
      and not exists (
        select 1
        from public.player_collection as pc
        where pc.player_id = target_pack.player_id
          and pc.character_id = c.id
      )
    order by ro.rank, random()
    limit 1
  )
  select id into selected_character_id
  from eligible;

  if selected_character_id is not null then
    insert into public.player_collection (player_id, character_id, earned_via)
    values (target_pack.player_id, selected_character_id, 'pack')
    on conflict do nothing;
  end if;

  update public.player_packs
  set opened_at = now(),
      dropped_character_id = selected_character_id
  where id = p_pack_id;

  return query select p_pack_id, selected_character_id, selected_character_id is null;
end;
$$;

drop trigger if exists profiles_set_updated_at on public.profiles;
create trigger profiles_set_updated_at
before update on public.profiles
for each row execute function public.set_updated_at();

drop trigger if exists profiles_guard_update on public.profiles;
create trigger profiles_guard_update
before update on public.profiles
for each row execute function public.guard_profile_update();

drop trigger if exists packages_set_updated_at on public.packages;
create trigger packages_set_updated_at
before update on public.packages
for each row execute function public.set_updated_at();

drop trigger if exists sessions_set_updated_at on public.sessions;
create trigger sessions_set_updated_at
before update on public.sessions
for each row execute function public.set_updated_at();

drop trigger if exists matches_set_updated_at on public.matches;
create trigger matches_set_updated_at
before update on public.matches
for each row execute function public.set_updated_at();

drop trigger if exists goals_set_updated_at on public.goals;
create trigger goals_set_updated_at
before update on public.goals
for each row execute function public.set_updated_at();

drop trigger if exists coach_player_links_assert_roles on public.coach_player_links;
create trigger coach_player_links_assert_roles
before insert or update on public.coach_player_links
for each row execute function public.assert_profile_roles();

drop trigger if exists packages_assert_player_owner on public.packages;
create trigger packages_assert_player_owner
before insert or update on public.packages
for each row execute function public.assert_player_owner();

drop trigger if exists sessions_assert_player_owner on public.sessions;
create trigger sessions_assert_player_owner
before insert or update on public.sessions
for each row execute function public.assert_player_owner();

drop trigger if exists matches_assert_player_owner on public.matches;
create trigger matches_assert_player_owner
before insert or update on public.matches
for each row execute function public.assert_player_owner();

drop trigger if exists goals_assert_player_owner on public.goals;
create trigger goals_assert_player_owner
before insert or update on public.goals
for each row execute function public.assert_player_owner();

drop trigger if exists player_collection_assert_player_owner on public.player_collection;
create trigger player_collection_assert_player_owner
before insert or update on public.player_collection
for each row execute function public.assert_player_owner();

drop trigger if exists player_packs_assert_player_owner on public.player_packs;
create trigger player_packs_assert_player_owner
before insert or update on public.player_packs
for each row execute function public.assert_player_owner();

drop trigger if exists player_achievements_assert_player_owner on public.player_achievements;
create trigger player_achievements_assert_player_owner
before insert or update on public.player_achievements
for each row execute function public.assert_player_owner();

drop trigger if exists media_assert_session_player on public.media;
create trigger media_assert_session_player
before insert or update on public.media
for each row execute function public.assert_session_media_owner();

drop trigger if exists sessions_prepare_credit_fields on public.sessions;
create trigger sessions_prepare_credit_fields
before insert or update of player_id, package_id, status on public.sessions
for each row execute function public.prepare_session_credit_fields();

drop trigger if exists sessions_apply_credit_delta on public.sessions;
create trigger sessions_apply_credit_delta
after insert or update of package_id, status or delete on public.sessions
for each row execute function public.apply_session_credit_delta();

drop trigger if exists sessions_award_rewards on public.sessions;
create trigger sessions_award_rewards
after insert or update of status on public.sessions
for each row execute function public.award_session_rewards();

drop trigger if exists sessions_evaluate_achievements on public.sessions;
create trigger sessions_evaluate_achievements
after insert or update of post_self_rating, coach_rating, status on public.sessions
for each row
when (new.status = 'complete')
execute function public.evaluate_session_achievements();

drop trigger if exists matches_evaluate_achievements on public.matches;
create trigger matches_evaluate_achievements
after insert or update of result, date on public.matches
for each row execute function public.evaluate_match_achievements();

alter table public.profiles enable row level security;
alter table public.coach_player_links enable row level security;
alter table public.packages enable row level security;
alter table public.drills enable row level security;
alter table public.sessions enable row level security;
alter table public.session_drills enable row level security;
alter table public.matches enable row level security;
alter table public.goals enable row level security;
alter table public.characters enable row level security;
alter table public.player_collection enable row level security;
alter table public.player_packs enable row level security;
alter table public.player_achievements enable row level security;
alter table public.media enable row level security;

drop policy if exists "profiles self and linked coach read" on public.profiles;
create policy "profiles self and linked coach read"
on public.profiles for select
to authenticated
using (id = auth.uid() or (role = 'player' and public.is_linked_player(id)));

drop policy if exists "profiles self update limited" on public.profiles;
create policy "profiles self update limited"
on public.profiles for update
to authenticated
using (id = auth.uid())
with check (id = auth.uid());

drop policy if exists "coach links participant read" on public.coach_player_links;
create policy "coach links participant read"
on public.coach_player_links for select
to authenticated
using (coach_id = auth.uid() or player_id = auth.uid());

drop policy if exists "packages player crud" on public.packages;
create policy "packages player crud"
on public.packages for all
to authenticated
using (player_id = auth.uid())
with check (player_id = auth.uid());

drop policy if exists "packages linked coach read" on public.packages;
create policy "packages linked coach read"
on public.packages for select
to authenticated
using (public.is_linked_player(player_id));

drop policy if exists "drills system read" on public.drills;
create policy "drills system read"
on public.drills for select
to authenticated
using (is_system);

drop policy if exists "drills player crud" on public.drills;
create policy "drills player crud"
on public.drills for all
to authenticated
using (player_id = auth.uid())
with check (player_id = auth.uid() and not is_system);

drop policy if exists "drills linked coach read" on public.drills;
create policy "drills linked coach read"
on public.drills for select
to authenticated
using (player_id is not null and public.is_linked_player(player_id));

drop policy if exists "sessions player crud" on public.sessions;
create policy "sessions player crud"
on public.sessions for all
to authenticated
using (player_id = auth.uid())
with check (player_id = auth.uid());

drop policy if exists "sessions linked coach read" on public.sessions;
create policy "sessions linked coach read"
on public.sessions for select
to authenticated
using (public.is_linked_player(player_id));

drop policy if exists "session drills visible read" on public.session_drills;
create policy "session drills visible read"
on public.session_drills for select
to authenticated
using (public.is_session_visible_to_current_user(session_id));

drop policy if exists "session drills player manage" on public.session_drills;
create policy "session drills player manage"
on public.session_drills for all
to authenticated
using (
  exists (
    select 1 from public.sessions as s
    where s.id = session_id
      and s.player_id = auth.uid()
  )
)
with check (
  exists (
    select 1 from public.sessions as s
    where s.id = session_id
      and s.player_id = auth.uid()
  )
);

drop policy if exists "matches player crud" on public.matches;
create policy "matches player crud"
on public.matches for all
to authenticated
using (player_id = auth.uid())
with check (player_id = auth.uid());

drop policy if exists "matches linked coach read" on public.matches;
create policy "matches linked coach read"
on public.matches for select
to authenticated
using (public.is_linked_player(player_id));

drop policy if exists "goals player crud" on public.goals;
create policy "goals player crud"
on public.goals for all
to authenticated
using (player_id = auth.uid())
with check (player_id = auth.uid());

drop policy if exists "goals linked coach read" on public.goals;
create policy "goals linked coach read"
on public.goals for select
to authenticated
using (public.is_linked_player(player_id));

drop policy if exists "characters authenticated read" on public.characters;
create policy "characters authenticated read"
on public.characters for select
to authenticated
using (true);

drop policy if exists "player collection self read" on public.player_collection;
create policy "player collection self read"
on public.player_collection for select
to authenticated
using (player_id = auth.uid());

drop policy if exists "player packs self read" on public.player_packs;
create policy "player packs self read"
on public.player_packs for select
to authenticated
using (player_id = auth.uid());

drop policy if exists "player achievements self read" on public.player_achievements;
create policy "player achievements self read"
on public.player_achievements for select
to authenticated
using (player_id = auth.uid());

drop policy if exists "media player crud" on public.media;
create policy "media player crud"
on public.media for all
to authenticated
using (player_id = auth.uid())
with check (player_id = auth.uid());

drop policy if exists "media linked coach read" on public.media;
create policy "media linked coach read"
on public.media for select
to authenticated
using (public.is_linked_player(player_id));

grant execute on function public.create_session_with_package_credit(uuid, date, integer, text, public.session_status, jsonb, jsonb, uuid[]) to authenticated;
grant execute on function public.submit_coach_session_review(uuid, jsonb, text, public.session_status) to authenticated;
grant execute on function public.open_player_pack(uuid) to authenticated;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'session-media',
  'session-media',
  false,
  104857600,
  array['image/jpeg', 'image/png', 'video/mp4', 'video/quicktime']
)
on conflict (id) do update
set public = excluded.public,
    file_size_limit = excluded.file_size_limit,
    allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "session media objects readable by player and coach" on storage.objects;
create policy "session media objects readable by player and coach"
on storage.objects for select
to authenticated
using (
  bucket_id = 'session-media'
  and exists (
    select 1
    from public.media as m
    where m.storage_path = name
      and (m.player_id = auth.uid() or public.is_linked_player(m.player_id))
  )
);

drop policy if exists "session media objects uploaded by player" on storage.objects;
create policy "session media objects uploaded by player"
on storage.objects for insert
to authenticated
with check (
  bucket_id = 'session-media'
  and split_part(name, '/', 1) = auth.uid()::text
);

drop policy if exists "session media objects deleted by player" on storage.objects;
create policy "session media objects deleted by player"
on storage.objects for delete
to authenticated
using (
  bucket_id = 'session-media'
  and exists (
    select 1
    from public.media as m
    where m.storage_path = name
      and m.player_id = auth.uid()
  )
);
