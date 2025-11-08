-- Enable pgcrypto extension in the standard Supabase schema
create extension if not exists pgcrypto with schema extensions;

-- Update function: set_room_password to use schema-qualified pgcrypto functions
create or replace function public.set_room_password(room_id uuid, new_password text)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  -- Verify caller is the room creator
  if not exists (
    select 1 from public.rooms 
    where id = room_id and created_by = auth.uid()
  ) then
    raise exception 'Unauthorized: Only room creator can set password';
  end if;
  
  update public.rooms
  set hashed_password = case 
    when new_password is null then null
    else extensions.crypt(new_password, extensions.gen_salt('bf'))
  end
  where id = room_id;
end;
$$;

-- Update function: verify_room_password to use schema-qualified pgcrypto
create or replace function public.verify_room_password(room_id uuid, password_attempt text)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  stored_hash text;
begin
  -- Only allow verification if room exists and is joinable
  if not exists (
    select 1 from public.rooms 
    where id = room_id and status = 'waiting'
  ) then
    return false;
  end if;
  
  select hashed_password into stored_hash
  from public.rooms
  where id = room_id;
  
  if stored_hash is null then
    return true;
  end if;
  
  return stored_hash = extensions.crypt(password_attempt, stored_hash);
end;
$$;