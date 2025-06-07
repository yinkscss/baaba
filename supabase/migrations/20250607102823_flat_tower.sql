/*
  # Implement orphaned conversation cleanup

  1. Functions
    - Function to clean up conversations with no participants
    - Trigger function to handle participant removal

  2. Triggers
    - Automatically clean up orphaned conversations
    - Use transactional logic to prevent race conditions
*/

-- Create function to clean up orphaned conversations
CREATE OR REPLACE FUNCTION cleanup_orphaned_conversations()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Delete conversations that have no participants
  DELETE FROM public.conversations
  WHERE id NOT IN (
    SELECT DISTINCT conversation_id 
    FROM public.conversation_participants
  );
END;
$$;

-- Create trigger function for participant removal
CREATE OR REPLACE FUNCTION trigger_cleanup_orphaned_conversations()
RETURNS trigger
LANGUAGE plpgsql
AS $$
DECLARE
  participant_count integer;
BEGIN
  -- Check if the conversation still has participants
  SELECT COUNT(*) INTO participant_count
  FROM public.conversation_participants
  WHERE conversation_id = OLD.conversation_id;
  
  -- If no participants remain, delete the conversation
  IF participant_count = 0 THEN
    DELETE FROM public.conversations
    WHERE id = OLD.conversation_id;
  END IF;
  
  RETURN OLD;
END;
$$;

-- Create trigger on conversation_participants
DROP TRIGGER IF EXISTS cleanup_orphaned_conversations_trigger ON public.conversation_participants;
CREATE TRIGGER cleanup_orphaned_conversations_trigger
  AFTER DELETE ON public.conversation_participants
  FOR EACH ROW
  EXECUTE FUNCTION trigger_cleanup_orphaned_conversations();