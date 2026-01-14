
import { Pool } from 'pg';
import dotenv from 'dotenv';
import { v4 as uuidv4 } from 'uuid';

dotenv.config();

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
});

const caseStudies = [
    {
        title: 'FinTech Payment Gateway Audit',
        client_name: 'PaySecure Global',
        client_logo: '💳',
        industry: 'FinTech',
        challenge: 'Frequent fraudulent transactions and potential PCI-DSS compliance failure.',
        solution: 'Conducted a deep-dive penetration test on the payment gateway API and implemented biometric multi-factor authentication.',
        impact: 'Fraud reduced by 99% and achieved full PCI-DSS compliance within 3 months.',
        result_metrics: JSON.stringify({ 'Fraud Reduction': '99%', 'Compliance': '100% PCI-DSS' }),
        featured: true,
        cover_image_url: 'https://images.unsplash.com/photo-1556742049-0cfed4f7a07d?auto=format&fit=crop&q=80&w=1920'
    },
    {
        title: 'Healthcare HIPAA Compliance',
        client_name: 'MediCare Plus',
        client_logo: '🏥',
        industry: 'Healthcare',
        challenge: 'Unsecured patient records (EHR) and vulnerable legacy servers.',
        solution: 'Implemented end-to-end encryption for patient data and fortified network segmentation.',
        impact: 'Secured 5M+ patient records and passed HIPAA audit with zero non-conformities.',
        result_metrics: JSON.stringify({ 'Records Secured': '5 Million+', 'Audit Score': '100/100' }),
        featured: true,
        cover_image_url: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&q=80&w=1920'
    },
    {
        title: 'E-Commerce Bot Mitigation',
        client_name: 'ShopSmart Inc.',
        client_logo: '🛒',
        industry: 'E-Commerce',
        challenge: 'Inventory scalping bots crashing the site during flash sales.',
        solution: 'Deployed a custom WAF rule set and behavioral analysis to block bot traffic.',
        impact: 'Website uptime increased to 99.99% during peak sales; revenue boosted by 30%.',
        result_metrics: JSON.stringify({ 'Uptime': '99.99%', 'Revenue Increase': '30%' }),
        featured: true,
        cover_image_url: 'https://images.unsplash.com/photo-1563013544-824ae1b704d3?auto=format&fit=crop&q=80&w=1920'
    },
    {
        title: 'SaaS Platform SOC2 Type II',
        client_name: 'CloudSync',
        client_logo: '☁️',
        industry: 'SaaS',
        challenge: 'Needed SOC2 Type II certification to close enterprise deals.',
        solution: 'Guided the team through extensive policy creation, access control implementation, and 24/7 monitoring setup.',
        impact: 'Achieved SOC2 Type II certification in record time (4 months), unlocking $2M in new ARR.',
        result_metrics: JSON.stringify({ 'Time to Certify': '4 Months', 'New Revenue': '$2M' }),
        featured: false,
        cover_image_url: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&q=80&w=1920'
    },
    {
        title: 'Manufacturing IoT Security',
        client_name: 'AutoWorks',
        client_logo: '🏭',
        industry: 'Manufacturing',
        challenge: 'Vulnerable IoT sensors on the assembly line exposed to potential ransomware.',
        solution: 'Network segregation for OT environments and firmware security hardening.',
        impact: 'Eliminated external attack surface for 500+ IoT devices.',
        result_metrics: JSON.stringify({ 'Devices Secured': '500+', 'Downtime Risk': 'Minimized' }),
        featured: false,
        cover_image_url: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&q=80&w=1920'
    },
    {
        title: 'Crypto Exchange Wallet Security',
        client_name: 'BitVault',
        client_logo: '💰',
        industry: 'Crypto',
        challenge: 'Hot wallet vulnerabilities risking user funds.',
        solution: 'Implemented multi-signature wallet architecture and cold storage protocols.',
        impact: 'Zero funds lost in 2 years; trusted by 100k+ users.',
        result_metrics: JSON.stringify({ 'Funds Lost': '0', 'User Trust': 'High' }),
        featured: true,
        cover_image_url: 'https://images.unsplash.com/photo-1518546305927-5a555bb7020d?auto=format&fit=crop&q=80&w=1920'
    },
    {
        title: 'Government Portal Penetration Test',
        client_name: 'E-Gov Initiative',
        client_logo: '🏛️',
        industry: 'Government',
        challenge: 'Critical SQL injection vulnerabilities in citizen portal.',
        solution: 'Identified and patched 15 critical vulnerabilities; trained dev team on secure coding.',
        impact: 'Protected sensitive data of 10M citizens.',
        result_metrics: JSON.stringify({ 'Critical Vulns Fixed': '15', 'Citizens Protected': '10M' }),
        featured: false,
        cover_image_url: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&q=80&w=1920'
    },
    {
        title: 'EdTech Data Privacy Overhaul',
        client_name: 'LearnFast',
        client_logo: '🎓',
        industry: 'Education',
        challenge: 'Complying with COPPA and protecting student data.',
        solution: 'Data anonymization implementation and strict access controls.',
        impact: 'Fully compliant with COPPA/GDPR; successfully expanded to EU market.',
        result_metrics: JSON.stringify({ 'Compliance': 'COPPA/GDPR', 'Market Expansion': 'EU' }),
        featured: false,
        cover_image_url: 'https://images.unsplash.com/photo-1509062522246-37559cc792f9?auto=format&fit=crop&q=80&w=1920'
    },
    {
        title: 'Legal Firm Ransomware Recovery',
        client_name: 'Justice & Assoc.',
        client_logo: '⚖️',
        industry: 'Legal',
        challenge: 'Ransomware locked all case files; attackers demanded $500k.',
        solution: 'Incident response team neutralized malware and recovered data from offline backups.',
        impact: 'Operations restored in 48 hours without paying ransom.',
        result_metrics: JSON.stringify({ 'Ransom Paid': '$0', 'Recovery Time': '48 Hours' }),
        featured: true,
        cover_image_url: 'https://images.unsplash.com/photo-1589829085413-56de8ae18c73?auto=format&fit=crop&q=80&w=1920'
    },
    {
        title: 'Logistics API Security',
        client_name: 'FastTrack Logistics',
        client_logo: '🚚',
        industry: 'Logistics',
        challenge: 'Competitors scraping pricing data via exposed APIs.',
        solution: 'Implemented rate limiting and API key rotation policies.',
        impact: 'Scraping traffic reduced by 95%; competitive advantage restored.',
        result_metrics: JSON.stringify({ 'Scraping Reduced': '95%' }),
        featured: false,
        cover_image_url: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&q=80&w=1920'
    },
    {
        title: 'Social Media App Privacy Audit',
        client_name: 'ConnectMe',
        client_logo: '📱',
        industry: 'Social Media',
        challenge: 'Privacy concerns regarding user data sharing.',
        solution: 'Comprehensive privacy audit and implementation of granular user consent controls.',
        impact: 'User retention improved by 15% due to increased trust.',
        result_metrics: JSON.stringify({ 'Retention Uplift': '15%' }),
        featured: false,
        cover_image_url: 'https://images.unsplash.com/photo-1611162617474-5b21e879e113?auto=format&fit=crop&q=80&w=1920'
    },
    {
        title: 'Gaming Studio Anti-Cheat',
        client_name: 'Pixel Games',
        client_logo: '🎮',
        industry: 'Gaming',
        challenge: 'Cheaters ruining multiplayer experience.',
        solution: 'Server-side validation logic and anti-tamper integration.',
        impact: 'Cheater reports dropped by 80%; active player base grew.',
        result_metrics: JSON.stringify({ 'Cheater Drop': '80%' }),
        featured: false,
        cover_image_url: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&q=80&w=1920'
    },
    {
        title: 'Real Estate Platform Secure Uploads',
        client_name: 'HomeFinder',
        client_logo: '🏠',
        industry: 'Real Estate',
        challenge: 'Malicious file uploads compromising server.',
        solution: 'Secure file upload pipeline with malware sandboxing.',
        impact: 'Blocked 100% of malicious file upload attempts.',
        result_metrics: JSON.stringify({ 'Blocked Attacks': '100%' }),
        featured: false,
        cover_image_url: 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&q=80&w=1920'
    },
    {
        title: 'Energy Grid Infrastructure Hardening',
        client_name: 'PowerGrid Co.',
        client_logo: '⚡',
        industry: 'Infrastructure',
        challenge: 'Threat of state-sponsored cyber attacks on the wider grid.',
        solution: 'Air-gapped critical control systems and implemented strict physical security.',
        impact: 'Validated resilience against advanced persistent threats (APTs).',
        result_metrics: JSON.stringify({ 'Resilience': 'Verified' }),
        featured: true,
        cover_image_url: 'https://images.unsplash.com/photo-1473341304170-971dccb5ac1e?auto=format&fit=crop&q=80&w=1920'
    },
    {
        title: 'Startup Security Bootcamp',
        client_name: 'LaunchPad',
        client_logo: '🚀',
        industry: 'Startup',
        challenge: 'Lack of security culture in fast-moving dev team.',
        solution: 'Conducted intensive security bootcamp and established DevSecOps pipeline.',
        impact: 'Vulnerabilities in production reduced by 70%.',
        result_metrics: JSON.stringify({ 'Vuln Reduction': '70%' }),
        featured: false,
        cover_image_url: 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&q=80&w=1920'
    },
    {
        title: 'Travel Booking Fraud Prevention',
        client_name: 'Wanderlust',
        client_logo: '✈️',
        industry: 'Travel',
        challenge: 'Stolen credit card testing attacks.',
        solution: 'Implemented velocity checks and 3D Secure integration.',
        impact: 'Chargebacks reduced by 85%.',
        result_metrics: JSON.stringify({ 'Chargeback Reduction': '85%' }),
        featured: false,
        cover_image_url: 'https://images.unsplash.com/photo-1436491865332-7a61a109cc05?auto=format&fit=crop&q=80&w=1920'
    },
    {
        title: 'Insurance Data Leak Prevention',
        client_name: 'SafeLife',
        client_logo: '🛡️',
        industry: 'Insurance',
        challenge: 'Internal data leaks via email.',
        solution: 'Deployed DLP (Data Loss Prevention) solutions and email filtering.',
        impact: 'Prevented 10+ potential major data leaks in first year.',
        result_metrics: JSON.stringify({ 'Leaks Prevented': '10+' }),
        featured: false,
        cover_image_url: 'https://images.unsplash.com/photo-1450101499163-c8848c66ca85?auto=format&fit=crop&q=80&w=1920'
    },
    {
        title: 'Telecom Network Auditing',
        client_name: 'TelCo X',
        client_logo: '📡',
        industry: 'Telecom',
        challenge: 'SS7 vulnerabilities risking user call interception.',
        solution: 'SS7 firewall configuration and signaling monitoring.',
        impact: 'Secured calls for 20M subscribers.',
        result_metrics: JSON.stringify({ 'Subscribers Secured': '20M' }),
        featured: false,
        cover_image_url: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&q=80&w=1920'
    },
    {
        title: 'Automotive Firmware Security',
        client_name: 'DriveTech',
        client_logo: '🚗',
        industry: 'Automotive',
        challenge: 'Insecure OTA updates for connected cars.',
        solution: 'Implemented code signing and secure boot for ECUs.',
        impact: 'Ensured integrity of updates for 100k+ vehicles.',
        result_metrics: JSON.stringify({ 'Vehicles Secured': '100k+' }),
        featured: false,
        cover_image_url: 'https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?auto=format&fit=crop&q=80&w=1920'
    },
    {
        title: 'Non-Profit Donor Protection',
        client_name: 'Global Aid',
        client_logo: '🤝',
        industry: 'Non-Profit',
        challenge: 'Targeted phishing attacks against donors.',
        solution: 'DMARC enforcement and donor awareness campaign.',
        impact: 'Phishing success rate dropped to near zero.',
        result_metrics: JSON.stringify({ 'Phishing Rate': '~0%' }),
        featured: false,
        cover_image_url: 'https://images.unsplash.com/photo-1532629345422-7515f3d16bb6?auto=format&fit=crop&q=80&w=1920'
    }
];

async function seedCaseStudies() {
    try {
        console.log('📋 Seeding 20 Case Studies with Images...');

        // Clear existing
        await pool.query('DELETE FROM case_studies');
        console.log('🗑️  Cleared existing case studies.');

        for (const cs of caseStudies) {
            const id = uuidv4();
            const slug = cs.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

            await pool.query(
                `INSERT INTO case_studies (id, title, slug, client_name, client_logo, industry, challenge, solution, impact, result_metrics, featured, status, sort_order, cover_image_url)
                 VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)`,
                [
                    id, cs.title, slug, cs.client_name, cs.client_logo, cs.industry,
                    cs.challenge, cs.solution, cs.impact, cs.result_metrics,
                    cs.featured, 'active', 0, cs.cover_image_url
                ]
            );
            console.log(`✅ Created Case Study: ${cs.title}`);
        }

        console.log('✨ All 20 case studies seeded successfully with images.');

    } catch (error) {
        console.error('❌ Seeding Failed:', error);
    } finally {
        await pool.end();
    }
}

seedCaseStudies();
