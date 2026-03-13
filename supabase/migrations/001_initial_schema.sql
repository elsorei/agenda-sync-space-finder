-- ============================================
-- Agenda Multiutente Cloud - Schema Iniziale
-- ============================================

-- Enum types
CREATE TYPE friendship_status AS ENUM ('pending', 'accepted', 'rejected');
CREATE TYPE event_status AS ENUM ('draft', 'pending_confirmations', 'confirmed', 'suspended', 'cancelled');
CREATE TYPE participant_status AS ENUM ('pending', 'accepted', 'declined');
CREATE TYPE notification_type AS ENUM (
  'friendship_request',
  'friendship_accepted',
  'friendship_rejected',
  'event_invite',
  'event_updated',
  'event_cancelled',
  'event_reminder',
  'rsvp_deadline_reminder',
  'contact_registered',
  'general'
);

-- ============================================
-- PROFILES (extends auth.users)
-- ============================================
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT NOT NULL,
  phone TEXT,
  avatar_url TEXT,
  color TEXT NOT NULL DEFAULT '#9b87f5',
  bio TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Auto-create profile on user signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, email, full_name, color)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
    '#' || substr(md5(NEW.id::text), 1, 6)
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- ============================================
-- CONTACTS (rubrica personale)
-- ============================================
CREATE TABLE contacts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  notes TEXT,
  linked_user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_contacts_owner ON contacts(owner_id);
CREATE INDEX idx_contacts_email ON contacts(email);
CREATE INDEX idx_contacts_phone ON contacts(phone);
CREATE INDEX idx_contacts_linked_user ON contacts(linked_user_id);

-- ============================================
-- FRIENDSHIPS (sistema amicizia bidirezionale)
-- ============================================
CREATE TABLE friendships (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  requester_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  addressee_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  status friendship_status NOT NULL DEFAULT 'pending',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT unique_friendship UNIQUE (requester_id, addressee_id),
  CONSTRAINT no_self_friendship CHECK (requester_id != addressee_id)
);

CREATE INDEX idx_friendships_requester ON friendships(requester_id);
CREATE INDEX idx_friendships_addressee ON friendships(addressee_id);
CREATE INDEX idx_friendships_status ON friendships(status);

-- ============================================
-- EVENTS (eventi/appuntamenti)
-- ============================================
CREATE TABLE events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  creator_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  start_date TIMESTAMPTZ NOT NULL,
  end_date TIMESTAMPTZ NOT NULL,
  type TEXT NOT NULL DEFAULT 'appuntamento',
  status event_status NOT NULL DEFAULT 'draft',
  color TEXT NOT NULL DEFAULT '#9b87f5',
  rsvp_deadline TIMESTAMPTZ,
  requires_confirmation BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT valid_dates CHECK (end_date > start_date)
);

CREATE INDEX idx_events_creator ON events(creator_id);
CREATE INDEX idx_events_dates ON events(start_date, end_date);
CREATE INDEX idx_events_status ON events(status);

-- ============================================
-- EVENT_PARTICIPANTS (partecipanti registrati)
-- ============================================
CREATE TABLE event_participants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  status participant_status NOT NULL DEFAULT 'pending',
  is_reserve BOOLEAN NOT NULL DEFAULT false,
  invited_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  responded_at TIMESTAMPTZ,
  CONSTRAINT unique_participant UNIQUE (event_id, user_id)
);

CREATE INDEX idx_event_participants_event ON event_participants(event_id);
CREATE INDEX idx_event_participants_user ON event_participants(user_id);

-- ============================================
-- EVENT_EXTERNAL_INVITES (invitati non registrati)
-- ============================================
CREATE TABLE event_external_invites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  email TEXT,
  phone TEXT,
  name TEXT NOT NULL,
  status participant_status NOT NULL DEFAULT 'pending',
  token TEXT NOT NULL DEFAULT encode(gen_random_bytes(32), 'hex'),
  invited_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  responded_at TIMESTAMPTZ,
  CONSTRAINT has_contact_info CHECK (email IS NOT NULL OR phone IS NOT NULL)
);

CREATE INDEX idx_external_invites_event ON event_external_invites(event_id);
CREATE INDEX idx_external_invites_token ON event_external_invites(token);

-- ============================================
-- EVENT_ATTACHMENTS (allegati)
-- ============================================
CREATE TABLE event_attachments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  file_name TEXT NOT NULL,
  file_type TEXT NOT NULL,
  file_size BIGINT NOT NULL,
  storage_path TEXT NOT NULL,
  uploaded_by UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  uploaded_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_event_attachments_event ON event_attachments(event_id);

-- ============================================
-- NOTIFICATIONS
-- ============================================
CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  type notification_type NOT NULL DEFAULT 'general',
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  data JSONB,
  read BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_notifications_user ON notifications(user_id);
CREATE INDEX idx_notifications_unread ON notifications(user_id, read) WHERE NOT read;

-- ============================================
-- TODOS (lista cose da fare)
-- ============================================
CREATE TABLE todos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  due_date TIMESTAMPTZ,
  reminder_at TIMESTAMPTZ,
  completed BOOLEAN NOT NULL DEFAULT false,
  priority INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_todos_user ON todos(user_id);
CREATE INDEX idx_todos_due ON todos(user_id, due_date) WHERE NOT completed;

-- ============================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================

-- Profiles: visibile a tutti gli autenticati, modificabile solo dal proprietario
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Profiles are viewable by authenticated users"
  ON profiles FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id);

-- Contacts: solo il proprietario
ALTER TABLE contacts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own contacts"
  ON contacts FOR SELECT TO authenticated
  USING (owner_id = auth.uid());

CREATE POLICY "Users can insert own contacts"
  ON contacts FOR INSERT TO authenticated
  WITH CHECK (owner_id = auth.uid());

CREATE POLICY "Users can update own contacts"
  ON contacts FOR UPDATE TO authenticated
  USING (owner_id = auth.uid());

CREATE POLICY "Users can delete own contacts"
  ON contacts FOR DELETE TO authenticated
  USING (owner_id = auth.uid());

-- Friendships: visibili ai partecipanti
ALTER TABLE friendships ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own friendships"
  ON friendships FOR SELECT TO authenticated
  USING (requester_id = auth.uid() OR addressee_id = auth.uid());

CREATE POLICY "Users can create friendship requests"
  ON friendships FOR INSERT TO authenticated
  WITH CHECK (requester_id = auth.uid());

CREATE POLICY "Users can update friendships addressed to them"
  ON friendships FOR UPDATE TO authenticated
  USING (addressee_id = auth.uid());

CREATE POLICY "Users can delete own friendship requests"
  ON friendships FOR DELETE TO authenticated
  USING (requester_id = auth.uid() OR addressee_id = auth.uid());

-- Events: visibili al creatore e ai partecipanti
ALTER TABLE events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view events they participate in"
  ON events FOR SELECT TO authenticated
  USING (
    creator_id = auth.uid()
    OR id IN (SELECT event_id FROM event_participants WHERE user_id = auth.uid())
  );

CREATE POLICY "Users can create events"
  ON events FOR INSERT TO authenticated
  WITH CHECK (creator_id = auth.uid());

CREATE POLICY "Creators can update own events"
  ON events FOR UPDATE TO authenticated
  USING (creator_id = auth.uid());

CREATE POLICY "Creators can delete own events"
  ON events FOR DELETE TO authenticated
  USING (creator_id = auth.uid());

-- Event participants
ALTER TABLE event_participants ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view participants of their events"
  ON event_participants FOR SELECT TO authenticated
  USING (
    user_id = auth.uid()
    OR event_id IN (SELECT id FROM events WHERE creator_id = auth.uid())
  );

CREATE POLICY "Event creators can add participants"
  ON event_participants FOR INSERT TO authenticated
  WITH CHECK (event_id IN (SELECT id FROM events WHERE creator_id = auth.uid()));

CREATE POLICY "Participants can update own status"
  ON event_participants FOR UPDATE TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Event creators can remove participants"
  ON event_participants FOR DELETE TO authenticated
  USING (event_id IN (SELECT id FROM events WHERE creator_id = auth.uid()));

-- External invites
ALTER TABLE event_external_invites ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Event creators can manage external invites"
  ON event_external_invites FOR ALL TO authenticated
  USING (event_id IN (SELECT id FROM events WHERE creator_id = auth.uid()));

-- Event attachments
ALTER TABLE event_attachments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view attachments of their events"
  ON event_attachments FOR SELECT TO authenticated
  USING (
    event_id IN (
      SELECT id FROM events WHERE creator_id = auth.uid()
      UNION
      SELECT event_id FROM event_participants WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Event participants can upload attachments"
  ON event_attachments FOR INSERT TO authenticated
  WITH CHECK (uploaded_by = auth.uid());

CREATE POLICY "Uploaders can delete own attachments"
  ON event_attachments FOR DELETE TO authenticated
  USING (uploaded_by = auth.uid());

-- Notifications: solo il destinatario
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own notifications"
  ON notifications FOR SELECT TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can update own notifications"
  ON notifications FOR UPDATE TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "System can insert notifications"
  ON notifications FOR INSERT TO authenticated
  WITH CHECK (true);

-- Todos: solo il proprietario
ALTER TABLE todos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own todos"
  ON todos FOR ALL TO authenticated
  USING (user_id = auth.uid());

-- ============================================
-- FUNCTIONS
-- ============================================

-- Function to check availability of a user for a time range
CREATE OR REPLACE FUNCTION check_user_availability(
  p_user_id UUID,
  p_start TIMESTAMPTZ,
  p_end TIMESTAMPTZ
)
RETURNS TABLE (
  is_available BOOLEAN,
  conflicting_events JSONB
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    NOT EXISTS (
      SELECT 1 FROM events e
      JOIN event_participants ep ON e.id = ep.event_id
      WHERE ep.user_id = p_user_id
        AND ep.status IN ('accepted', 'pending')
        AND e.status IN ('confirmed', 'pending_confirmations')
        AND e.start_date < p_end
        AND e.end_date > p_start
    ) AS is_available,
    COALESCE(
      (SELECT jsonb_agg(jsonb_build_object(
        'id', e.id,
        'title', e.title,
        'start_date', e.start_date,
        'end_date', e.end_date,
        'status', e.status
      ))
      FROM events e
      JOIN event_participants ep ON e.id = ep.event_id
      WHERE ep.user_id = p_user_id
        AND ep.status IN ('accepted', 'pending')
        AND e.status IN ('confirmed', 'pending_confirmations')
        AND e.start_date < p_end
        AND e.end_date > p_start),
      '[]'::jsonb
    ) AS conflicting_events;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to find a registered user by email or phone
CREATE OR REPLACE FUNCTION find_user_by_contact(
  p_email TEXT DEFAULT NULL,
  p_phone TEXT DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
  found_id UUID;
BEGIN
  IF p_email IS NOT NULL THEN
    SELECT id INTO found_id FROM profiles WHERE email = p_email LIMIT 1;
    IF found_id IS NOT NULL THEN RETURN found_id; END IF;
  END IF;

  IF p_phone IS NOT NULL THEN
    SELECT id INTO found_id FROM profiles WHERE phone = p_phone LIMIT 1;
    IF found_id IS NOT NULL THEN RETURN found_id; END IF;
  END IF;

  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply updated_at triggers
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_contacts_updated_at
  BEFORE UPDATE ON contacts FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_friendships_updated_at
  BEFORE UPDATE ON friendships FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_events_updated_at
  BEFORE UPDATE ON events FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_todos_updated_at
  BEFORE UPDATE ON todos FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ============================================
-- STORAGE BUCKETS
-- ============================================
INSERT INTO storage.buckets (id, name, public) VALUES ('event-attachments', 'event-attachments', false);

CREATE POLICY "Authenticated users can upload event attachments"
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'event-attachments');

CREATE POLICY "Users can view event attachments they have access to"
  ON storage.objects FOR SELECT TO authenticated
  USING (bucket_id = 'event-attachments');

-- ============================================
-- REALTIME
-- ============================================
ALTER PUBLICATION supabase_realtime ADD TABLE notifications;
ALTER PUBLICATION supabase_realtime ADD TABLE event_participants;
ALTER PUBLICATION supabase_realtime ADD TABLE friendships;
