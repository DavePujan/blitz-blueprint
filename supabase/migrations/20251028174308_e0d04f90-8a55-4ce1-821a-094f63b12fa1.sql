-- Sprint 2: Room cleanup triggers

-- Function to update room player count
CREATE OR REPLACE FUNCTION public.update_room_player_count()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  -- Update the current_players count for the affected room
  UPDATE public.rooms
  SET current_players = (
    SELECT COUNT(*)
    FROM public.room_players
    WHERE room_id = COALESCE(NEW.room_id, OLD.room_id)
  )
  WHERE id = COALESCE(NEW.room_id, OLD.room_id);
  
  RETURN COALESCE(NEW, OLD);
END;
$$;

-- Trigger to update player count on insert/delete
CREATE TRIGGER update_room_count_on_player_change
AFTER INSERT OR DELETE ON public.room_players
FOR EACH ROW
EXECUTE FUNCTION public.update_room_player_count();

-- Function to auto-delete empty waiting rooms
CREATE OR REPLACE FUNCTION public.cleanup_empty_rooms()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  -- Delete rooms that are empty and in waiting status
  DELETE FROM public.rooms
  WHERE id = OLD.room_id
    AND status = 'waiting'
    AND current_players = 0;
  
  RETURN OLD;
END;
$$;

-- Trigger to cleanup empty rooms after player leaves
CREATE TRIGGER cleanup_empty_rooms_trigger
AFTER DELETE ON public.room_players
FOR EACH ROW
EXECUTE FUNCTION public.cleanup_empty_rooms();