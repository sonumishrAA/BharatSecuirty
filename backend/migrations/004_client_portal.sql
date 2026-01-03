-- Add missing contact form fields to business_bookings
ALTER TABLE business_bookings 
  ADD COLUMN IF NOT EXISTS company VARCHAR(255),
  ADD COLUMN IF NOT EXISTS phone VARCHAR(50),
  ADD COLUMN IF NOT EXISTS service_type VARCHAR(100),
  ADD COLUMN IF NOT EXISTS additional_info TEXT,
  ADD COLUMN IF NOT EXISTS progress INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS admin_notes TEXT,
  ADD COLUMN IF NOT EXISTS must_change_password BOOLEAN DEFAULT true;

-- Add must_change_password to users table
ALTER TABLE users 
  ADD COLUMN IF NOT EXISTS must_change_password BOOLEAN DEFAULT false;

-- Messages table for chat between admin and client
CREATE TABLE IF NOT EXISTS booking_messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  booking_id UUID REFERENCES business_bookings(id) ON DELETE CASCADE,
  sender_id UUID REFERENCES users(id),
  sender_role VARCHAR(20) NOT NULL, -- 'admin' or 'user'
  content TEXT,
  attachment_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_booking_messages_booking_id ON booking_messages(booking_id);
