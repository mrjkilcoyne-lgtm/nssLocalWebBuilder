CREATE TABLE conversations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  region text DEFAULT 'US',
  experience_level int,
  intent text,
  encrypted_messages text,
  iv text,
  stack_recommendation jsonb,
  noob_score int,
  created_at timestamptz DEFAULT now(),
  expires_at timestamptz DEFAULT (now() + interval '30 days')
);
CREATE INDEX idx_conversations_expires ON conversations(expires_at);
