-- =====================================================
-- Canvas Editor Schema Migration
-- Adds support for hybrid canvas document (flow + floating)
-- =====================================================

-- Add new columns to posts table for canvas editor
ALTER TABLE posts 
ADD COLUMN IF NOT EXISTS editor_json JSONB DEFAULT '{"meta":{"canvasWidth":760,"canvasPadding":24,"version":1},"flow":{"type":"doc","content":[]},"floating":[]}',
ADD COLUMN IF NOT EXISTS html_snapshot TEXT DEFAULT '';

-- Create index on editor_json for faster JSONB queries
CREATE INDEX IF NOT EXISTS idx_posts_editor_json ON posts USING GIN (editor_json);

-- =====================================================
-- POST VERSIONS TABLE
-- Tracks draft/published versions for history
-- =====================================================
CREATE TABLE IF NOT EXISTS post_versions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  post_id UUID NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  version_type VARCHAR(20) NOT NULL DEFAULT 'draft',
  editor_json JSONB NOT NULL,
  html_snapshot TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  
  CONSTRAINT version_type_check CHECK (version_type IN ('draft', 'published', 'autosave'))
);

-- Create indexes for common queries
CREATE INDEX IF NOT EXISTS idx_post_versions_post_id ON post_versions(post_id);
CREATE INDEX IF NOT EXISTS idx_post_versions_created_at ON post_versions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_post_versions_type ON post_versions(version_type);

-- =====================================================
-- MIGRATE EXISTING CONTENT TO NEW FORMAT
-- Converts old TipTap content to editor_json format
-- =====================================================
UPDATE posts 
SET editor_json = jsonb_build_object(
  'meta', jsonb_build_object(
    'canvasWidth', 760,
    'canvasPadding', 24,
    'version', 1
  ),
  'flow', COALESCE(content, '{"type":"doc","content":[]}'::jsonb),
  'floating', '[]'::jsonb
)
WHERE editor_json IS NULL OR editor_json = '{}'::jsonb;

-- Add category 'case_studies' to constraint if not exists
-- (Safe re-run: drops and recreates the constraint)
DO $$
BEGIN
  ALTER TABLE posts DROP CONSTRAINT IF EXISTS category_check;
  ALTER TABLE posts ADD CONSTRAINT category_check 
    CHECK (category IN ('blog', 'scam_alert', 'osint_guide', 'resource', 'case_studies'));
EXCEPTION WHEN OTHERS THEN
  NULL;
END $$;
