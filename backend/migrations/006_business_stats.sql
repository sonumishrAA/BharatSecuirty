-- Business Stats table for home page statistics
CREATE TABLE IF NOT EXISTS business_stats (
    id UUID PRIMARY KEY,
    value INTEGER NOT NULL DEFAULT 0,
    suffix VARCHAR(20) DEFAULT '+',
    label VARCHAR(100) NOT NULL,
    icon VARCHAR(50) DEFAULT '📊',
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert default stats data
INSERT INTO business_stats (id, value, suffix, label, icon, sort_order) VALUES
    (gen_random_uuid(), 250, '+', 'Security Audits', '🛡️', 1),
    (gen_random_uuid(), 500, '+', 'Vulnerabilities Found', '🐛', 2),
    (gen_random_uuid(), 98, '%', 'Client Satisfaction', '❤️', 3),
    (gen_random_uuid(), 24, 'h', 'Avg Response Time', '⏱️', 4);
