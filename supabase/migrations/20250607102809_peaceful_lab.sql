/*
  # Create conversations and messaging system

  1. New Tables
    - `conversations`
      - `id` (uuid, primary key)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
    - `conversation_participants`
      - `conversation_id` (uuid, foreign key to conversations.id)
      - `user_id` (uuid, foreign key to users.id)
      - Composite primary key
    - `messages`
      - `id` (uuid, primary key)
      - `conversation_id` (uuid, foreign key to conversations.id)
      - `sender_id` (uuid, foreign key to users.id)
      - `content` (text)
      - `created_at` (timestamp)
      - `read` (boolean)

  2. Security
    - Enable RLS on all tables
    - Users can only access conversations they participate in
    - Users can only send messages in conversations they're part of
*/

-- Create conversations table
CREATE TABLE IF NOT EXISTS public.conversations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create conversation_participants table
CREATE TABLE IF NOT EXISTS public.conversation_participants (
  conversation_id uuid NOT NULL REFERENCES public.conversations(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  joined_at timestamptz DEFAULT now(),
  PRIMARY KEY (conversation_id, user_id)
);

-- Create messages table
CREATE TABLE IF NOT EXISTS public.messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id uuid NOT NULL REFERENCES public.conversations(id) ON DELETE CASCADE,
  sender_id uuid NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  content text NOT NULL,
  created_at timestamptz DEFAULT now(),
  read boolean DEFAULT false
);

-- Enable RLS
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conversation_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

-- Policies for conversations
CREATE POLICY "Users can view conversations they participate in"
  ON public.conversations
  FOR SELECT
  TO authenticated
  USING (
    id IN (
      SELECT conversation_id 
      FROM public.conversation_participants 
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update conversations they participate in"
  ON public.conversations
  FOR UPDATE
  TO authenticated
  USING (
    id IN (
      SELECT conversation_id 
      FROM public.conversation_participants 
      WHERE user_id = auth.uid()
    )
  )
  WITH CHECK (
    id IN (
      SELECT conversation_id 
      FROM public.conversation_participants 
      WHERE user_id = auth.uid()
    )
  );

-- Policies for conversation_participants
CREATE POLICY "Users can view participants in their conversations"
  ON public.conversation_participants
  FOR SELECT
  TO authenticated
  USING (
    conversation_id IN (
      SELECT conversation_id 
      FROM public.conversation_participants 
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can add participants to conversations they're in"
  ON public.conversation_participants
  FOR INSERT
  TO authenticated
  WITH CHECK (
    conversation_id IN (
      SELECT conversation_id 
      FROM public.conversation_participants 
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can remove themselves from conversations"
  ON public.conversation_participants
  FOR DELETE
  TO authenticated
  USING (user_id = auth.uid());

-- Policies for messages
CREATE POLICY "Users can view messages in their conversations"
  ON public.messages
  FOR SELECT
  TO authenticated
  USING (
    conversation_id IN (
      SELECT conversation_id 
      FROM public.conversation_participants 
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can send messages in their conversations"
  ON public.messages
  FOR INSERT
  TO authenticated
  WITH CHECK (
    sender_id = auth.uid() 
    AND conversation_id IN (
      SELECT conversation_id 
      FROM public.conversation_participants 
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update their own messages"
  ON public.messages
  FOR UPDATE
  TO authenticated
  USING (
    sender_id = auth.uid() 
    AND conversation_id IN (
      SELECT conversation_id 
      FROM public.conversation_participants 
      WHERE user_id = auth.uid()
    )
  )
  WITH CHECK (
    sender_id = auth.uid() 
    AND conversation_id IN (
      SELECT conversation_id 
      FROM public.conversation_participants 
      WHERE user_id = auth.uid()
    )
  );

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_conversation_participants_user_id ON public.conversation_participants(user_id);
CREATE INDEX IF NOT EXISTS idx_conversation_participants_conversation_id ON public.conversation_participants(conversation_id);
CREATE INDEX IF NOT EXISTS idx_messages_conversation_id ON public.messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_messages_sender_id ON public.messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_messages_created_at ON public.messages(created_at DESC);

-- Create trigger for updating conversations.updated_at
CREATE TRIGGER update_conversations_updated_at
  BEFORE UPDATE ON public.conversations
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();