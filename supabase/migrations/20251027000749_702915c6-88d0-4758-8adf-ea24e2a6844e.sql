-- Add pgcrypto extension for password hashing
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Add a hashed_password column
ALTER TABLE public.rooms ADD COLUMN hashed_password text;

-- Migrate existing plaintext passwords to hashed (one-time operation)
UPDATE public.rooms 
SET hashed_password = crypt(password, gen_salt('bf'))
WHERE password IS NOT NULL;

-- Drop the plaintext password column
ALTER TABLE public.rooms DROP COLUMN password;

-- Create a function to verify room passwords
CREATE OR REPLACE FUNCTION public.verify_room_password(room_id uuid, password_attempt text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  stored_hash text;
BEGIN
  SELECT hashed_password INTO stored_hash
  FROM public.rooms
  WHERE id = room_id;
  
  -- If no password is set, return true
  IF stored_hash IS NULL THEN
    RETURN true;
  END IF;
  
  -- Verify the password
  RETURN stored_hash = crypt(password_attempt, stored_hash);
END;
$$;

-- Create a function to set room password (hashes it automatically)
CREATE OR REPLACE FUNCTION public.set_room_password(room_id uuid, new_password text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.rooms
  SET hashed_password = CASE 
    WHEN new_password IS NULL THEN NULL
    ELSE crypt(new_password, gen_salt('bf'))
  END
  WHERE id = room_id;
END;
$$;