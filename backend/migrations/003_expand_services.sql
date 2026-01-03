-- =====================================================
-- Expand business_services Table
-- =====================================================

ALTER TABLE business_services 
ADD COLUMN IF NOT EXISTS subtitle TEXT,
ADD COLUMN IF NOT EXISTS offerings JSONB DEFAULT '[]', -- Array of {title, description, icon}
ADD COLUMN IF NOT EXISTS process JSONB DEFAULT '[]',   -- Array of {step, title, description, icon}
ADD COLUMN IF NOT EXISTS scope JSONB DEFAULT '[]',     -- Array of strings
ADD COLUMN IF NOT EXISTS deliverables JSONB DEFAULT '[]', -- Array of strings
ADD COLUMN IF NOT EXISTS benefits JSONB DEFAULT '[]';  -- Array of {title, icon}
