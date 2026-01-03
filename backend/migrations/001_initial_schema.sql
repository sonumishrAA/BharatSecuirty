-- =====================================================
-- CMS Engine Database Schema
-- PostgreSQL Migration
-- =====================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- USERS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  role VARCHAR(20) NOT NULL DEFAULT 'user',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  
  CONSTRAINT role_check CHECK (role IN ('admin', 'user'))
);

-- Create index on email for faster lookups
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

-- =====================================================
-- POSTS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS posts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title VARCHAR(255) NOT NULL,
  slug VARCHAR(255) UNIQUE NOT NULL,
  excerpt TEXT NOT NULL,
  content JSONB DEFAULT '{}',
  cover_image_url TEXT,
  meta_title VARCHAR(255),
  meta_description TEXT,
  category VARCHAR(50) NOT NULL DEFAULT 'blog',
  status VARCHAR(20) NOT NULL DEFAULT 'draft',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  
  CONSTRAINT category_check CHECK (category IN ('blog', 'scam_alert', 'osint_guide', 'resource')),
  CONSTRAINT status_check CHECK (status IN ('draft', 'published'))
);

-- Create indexes for common queries
CREATE INDEX IF NOT EXISTS idx_posts_slug ON posts(slug);
CREATE INDEX IF NOT EXISTS idx_posts_status ON posts(status);
CREATE INDEX IF NOT EXISTS idx_posts_category ON posts(category);
CREATE INDEX IF NOT EXISTS idx_posts_created_at ON posts(created_at DESC);

-- =====================================================
-- TRIGGER: Auto-update updated_at
-- =====================================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_posts_updated_at
  BEFORE UPDATE ON posts
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- SEED DATA: Default Admin User
-- Password: admin123 (bcrypt hash)
-- =====================================================
INSERT INTO users (email, password_hash, role)
VALUES (
  'admin@bharatsecurity.org',
  '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewKyNiLXCQcvuhV2',
  'admin'
)
ON CONFLICT (email) DO NOTHING;

-- =====================================================
-- SAMPLE POSTS (Optional)
-- =====================================================
INSERT INTO posts (title, slug, excerpt, content, category, status)
VALUES 
  (
    'Welcome to BharatSecurity',
    'welcome-to-bharatsecurity',
    'Your trusted source for cybersecurity awareness and OSINT guides.',
    '{"type":"doc","content":[{"type":"paragraph","content":[{"type":"text","text":"Welcome to BharatSecurity! We are dedicated to spreading cybersecurity awareness."}]}]}',
    'blog',
    'published'
  ),
  (
    'Getting Started with OSINT',
    'getting-started-with-osint',
    'Learn the basics of Open Source Intelligence gathering.',
    '{"type":"doc","content":[{"type":"heading","attrs":{"level":2},"content":[{"type":"text","text":"What is OSINT?"}]},{"type":"paragraph","content":[{"type":"text","text":"OSINT stands for Open Source Intelligence..."}]}]}',
    'osint_guide',
    'published'
  )
ON CONFLICT (slug) DO NOTHING;
