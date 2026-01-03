-- =====================================================
-- business_services Table
-- =====================================================
CREATE TABLE IF NOT EXISTS business_services (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title VARCHAR(255) NOT NULL,
  slug VARCHAR(255) UNIQUE NOT NULL,
  icon VARCHAR(255),
  description TEXT,
  features JSONB DEFAULT '[]', -- Array of strings
  status VARCHAR(20) NOT NULL DEFAULT 'active', -- active, inactive
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TRIGGER update_business_services_updated_at
  BEFORE UPDATE ON business_services
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- business_clients Table
-- =====================================================
CREATE TABLE IF NOT EXISTS business_clients (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  logo_url TEXT,
  website_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TRIGGER update_business_clients_updated_at
  BEFORE UPDATE ON business_clients
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- business_testimonials Table
-- =====================================================
CREATE TABLE IF NOT EXISTS business_testimonials (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  client_name VARCHAR(255) NOT NULL,
  company VARCHAR(255),
  content TEXT NOT NULL,
  rating INTEGER DEFAULT 5,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TRIGGER update_business_testimonials_updated_at
  BEFORE UPDATE ON business_testimonials
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- business_bookings Table
-- =====================================================
CREATE TABLE IF NOT EXISTS business_bookings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  service_id UUID REFERENCES business_services(id),
  user_id UUID REFERENCES users(id), -- Nullable if user not yet created/logged in? No, we plan to auto-create.
  
  -- Contact Details (captured at submission)
  contact_name VARCHAR(255) NOT NULL,
  contact_email VARCHAR(255) NOT NULL,
  message TEXT,
  attachment_url TEXT, -- For 50MB file upload
  
  -- Status tracking
  status VARCHAR(20) NOT NULL DEFAULT 'pending', -- pending, in_progress, completed, cancelled
  
  -- Temp credentials (if auto-generated) - Storing cleartext temporarily as requested, 
  -- but ideally should be short-lived or hashed. 
  -- User requested: "auto matic jwt auth se wo apna email jo dalega and passwrod auto genrate a strong passwrod and jwt auth hoke save ho jae direct admin panel me"
  temp_password VARCHAR(255), 
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TRIGGER update_business_bookings_updated_at
  BEFORE UPDATE ON business_bookings
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_business_services_slug ON business_services(slug);
CREATE INDEX IF NOT EXISTS idx_business_bookings_user_id ON business_bookings(user_id);
CREATE INDEX IF NOT EXISTS idx_business_bookings_status ON business_bookings(status);
