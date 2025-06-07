/*
  # Create agent_landlords table and RLS policies

  1. New Tables
    - `agent_landlords`
      - `agent_id` (uuid, foreign key to users.id)
      - `landlord_id` (uuid, foreign key to users.id)
      - Composite primary key on both columns

  2. Security
    - Enable RLS on `agent_landlords` table
    - Add policies for agents to manage their own associations
    - Add policies for authenticated users to view relevant associations
*/

-- Create agent_landlords table
CREATE TABLE IF NOT EXISTS public.agent_landlords (
  agent_id uuid NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  landlord_id uuid NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  PRIMARY KEY (agent_id, landlord_id)
);

-- Enable RLS
ALTER TABLE public.agent_landlords ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Agents can insert own associations"
  ON public.agent_landlords
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = agent_id);

CREATE POLICY "Agents can delete own associations"
  ON public.agent_landlords
  FOR DELETE
  TO authenticated
  USING (auth.uid() = agent_id);

CREATE POLICY "Users can view relevant associations"
  ON public.agent_landlords
  FOR SELECT
  TO authenticated
  USING (auth.uid() = agent_id OR auth.uid() = landlord_id);

-- Create index for performance
CREATE INDEX IF NOT EXISTS idx_agent_landlords_agent_id ON public.agent_landlords(agent_id);
CREATE INDEX IF NOT EXISTS idx_agent_landlords_landlord_id ON public.agent_landlords(landlord_id);