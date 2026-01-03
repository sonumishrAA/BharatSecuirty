-- Case Studies table for showcasing security projects
CREATE TABLE IF NOT EXISTS case_studies (
    id UUID PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    client_name VARCHAR(255) NOT NULL,
    client_logo VARCHAR(50) DEFAULT '🏢',
    industry VARCHAR(100) NOT NULL,
    challenge TEXT NOT NULL,
    solution TEXT NOT NULL,
    impact VARCHAR(255) NOT NULL,
    result_metrics TEXT,
    cover_image_url TEXT,
    featured BOOLEAN DEFAULT FALSE,
    sort_order INTEGER DEFAULT 0,
    status VARCHAR(20) DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert sample case studies
INSERT INTO case_studies (id, title, slug, client_name, client_logo, industry, challenge, solution, impact, result_metrics, featured, sort_order) VALUES
    (gen_random_uuid(), 'FinTech Platform Security Overhaul', 'fintech-security-overhaul', 'PaySecure India', '💳', 'Financial Services', 
     'Critical vulnerabilities in payment gateway exposed customer financial data to potential breaches.',
     'Conducted comprehensive penetration testing, implemented WAF, and redesigned authentication flow with MFA.',
     '100% Vulnerability Remediation', 'Reduced attack surface by 85%, Zero breaches post-implementation', true, 1),
    
    (gen_random_uuid(), 'Healthcare Data Protection', 'healthcare-data-protection', 'MediCare Plus', '🏥', 'Healthcare',
     'HIPAA compliance gaps and unencrypted patient records in legacy systems.',
     'End-to-end encryption implementation, access control overhaul, and staff security awareness training.',
     '100% HIPAA Compliant', 'Passed 3 consecutive audits, 95% staff training completion', true, 2),
    
    (gen_random_uuid(), 'E-Commerce Fraud Prevention', 'ecommerce-fraud-prevention', 'ShopKart', '🛒', 'Retail',
     'Rising fraudulent transactions costing ₹2Cr monthly in chargebacks.',
     'Deployed ML-based fraud detection, implemented 3D Secure, and enhanced transaction monitoring.',
     '87% Fraud Reduction', 'Saved ₹1.7Cr monthly, Customer trust score up 40%', true, 3),
    
    (gen_random_uuid(), 'Government Portal Security', 'government-portal-security', 'State IT Department', '🏛️', 'Government',
     'Citizen portal vulnerable to SQL injection and XSS attacks.',
     'Complete code audit, vulnerability patching, and implementation of security headers and CSP.',
     'Zero Critical Vulnerabilities', 'Handled 10M+ secure transactions, A+ SSL rating', true, 4),
    
    (gen_random_uuid(), 'Startup Security Foundation', 'startup-security-foundation', 'TechNova AI', '🚀', 'Technology',
     'Fast-growing startup with no security infrastructure or policies.',
     'Built security framework from ground up - policies, tools, training, and incident response plan.',
     'Enterprise-Grade Security', 'SOC 2 Type II certified in 6 months', false, 5);
