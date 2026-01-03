import { query } from '../config/database.js';
import { v4 as uuidv4 } from 'uuid';

const detailedServices = [
    {
        title: 'Web & App Pentesting',
        subtitle: 'Uncover vulnerabilities before hackers do',
        description: 'Our expert security engineers perform comprehensive penetration testing on your web applications, identifying critical vulnerabilities and providing actionable remediation guidance.',
        icon: '🌐',
        features: ['Vulnerability Assessment', 'Penetration Testing', 'Code Review', 'API Security'],
        offerings: [
            { title: 'Deep Analysis', description: 'Manual testing beyond automated scans', icon: '🔍' },
            { title: 'OWASP Top 10', description: 'Complete coverage of critical vulnerabilities', icon: '🎯' },
            { title: 'Auth Testing', description: 'Authentication & authorization bypass attempts', icon: '🔐' },
            { title: 'Injection Attacks', description: 'SQL, XSS, Command injection testing', icon: '💉' },
            { title: 'API Security', description: 'REST & GraphQL API vulnerability assessment', icon: '📊' },
            { title: 'Business Logic', description: 'Testing for logic flaws & race conditions', icon: '🛡️' }
        ],
        process: [
            { step: 1, title: 'Scoping', description: 'Define targets, rules of engagement', icon: '📋' },
            { step: 2, title: 'Reconnaissance', description: 'Information gathering & mapping', icon: '🔭' },
            { step: 3, title: 'Exploitation', description: 'Manual vulnerability exploitation', icon: '⚡' },
            { step: 4, title: 'Reporting', description: 'Detailed findings with proof', icon: '📄' },
            { step: 5, title: 'Remediation', description: 'Fix guidance & retest', icon: '✅' }
        ],
        scope: [
            'Authentication & Session Management',
            'Authorization & Access Control',
            'Input Validation & Sanitization',
            'Business Logic Vulnerabilities',
            'API Security & Rate Limiting',
            'File Upload & Download Security',
            'Cryptographic Implementation',
            'Third-party Integrations'
        ],
        deliverables: [
            'Executive Summary Report',
            'Technical Vulnerability Details',
            'Risk Ratings (CVSS)',
            'Proof of Concept Screenshots',
            'Remediation Recommendations',
            'Retest Confirmation'
        ],
        benefits: [
            { title: 'Prevent data breaches', icon: '🎯' },
            { title: 'Meet compliance requirements', icon: '📋' },
            { title: 'Protect customer trust', icon: '🛡️' },
            { title: 'Reduce security costs', icon: '💰' }
        ]
    },
    {
        title: 'Mobile Pentesting',
        subtitle: 'Secure your iOS and Android applications',
        description: 'In-depth security analysis of Android/iOS apps ensuring data protection, secure communication, and resilience against reverse engineering.',
        icon: '📱',
        features: ['Static Analysis', 'Dynamic Analysis', 'API Integrity', 'Data Storage Security'],
        offerings: [
            { title: 'Static Analysis', description: 'Source code and binary analysis', icon: '📜' },
            { title: 'Dynamic Analysis', description: 'Runtime manipulation and hooking', icon: '🏃' },
            { title: 'API & Network', description: 'Man-in-the-Middle (MitM) testing', icon: '📡' },
            { title: 'Storage Security', description: 'Insecure data storage checks', icon: '💾' },
            { title: 'Reverse Engineering', description: 'Code obfuscation verification', icon: '🔄' },
            { title: 'Hardcoded Secrets', description: 'Finding keys and tokens in binary', icon: '🔑' }
        ],
        process: [
            { step: 1, title: 'Preparation', description: 'IPA/APK acquisition setup', icon: '📦' },
            { step: 2, title: 'Static Scan', description: 'Automated tools & manual code review', icon: '🔍' },
            { step: 3, title: 'Dynamic Tests', description: 'Runtime attacks on device/emulator', icon: '⚡' },
            { step: 4, title: 'Reporting', description: 'Vulnerability report with CVSS', icon: '📄' },
            { step: 5, title: 'Re-verification', description: 'Testing applied fixes', icon: '✅' }
        ],
        scope: [
            'Insecure Data Storage',
            'Insecure Communication (SSL Pinning)',
            'Authentication & Authorization',
            'Client Code Quality',
            'Code Tampering',
            'Reverse Engineering',
            'Extraneous Functionality'
        ],
        deliverables: [
            'Mobile Security Assessment Report',
            'Proof of Concept (PoC) Videos/Images',
            'Remediation Code Snippets',
            'Executive Presentation'
        ],
        benefits: [
            { title: 'Secure User Data', icon: '🔒' },
            { title: 'App Store Compliance', icon: '✅' },
            { title: 'Brand Protection', icon: '🛡️' },
            { title: 'Prevent Fraud', icon: '🚫' }
        ]
    },
    {
        title: 'OSINT',
        subtitle: 'Know what the internet knows about you',
        description: 'Open Source Intelligence gathering to uncover public exposure, data leaks, and potential threat vectors targeting your organization.',
        icon: '🕵️',
        features: ['Digital Footprint Analysis', 'Dark Web Monitoring', 'Social Engineering Risk', 'Asset Discovery'],
        offerings: [
            { title: 'Dark Web Scan', description: 'Monitoring underground forums', icon: '🌑' },
            { title: 'Data Leak Check', description: 'Finding exposed credentials', icon: '💧' },
            { title: 'Asset Discovery', description: 'Mapping forgotten subdomains', icon: '🗺️' },
            { title: 'Social Profiling', description: 'Analysis of key employee exposure', icon: 'busts_in_silhouette' }
        ],
        process: [
            { step: 1, title: 'Targeting', description: 'Defining scope and keywords', icon: '🎯' },
            { step: 2, title: 'Harvesting', description: 'Automated data collection', icon: '🚜' },
            { step: 3, title: 'Processing', description: 'Filtering noise from intelligence', icon: '⚙️' },
            { step: 4, title: 'Analysis', description: 'Connecting the dots', icon: '🧠' },
            { step: 5, title: 'Reporting', description: 'Actionable intelligence report', icon: '📄' }
        ],
        scope: [
            'Corporate Domains & Subdomains',
            'Employee Email Addresses',
            'Leaked Credentials',
            'Social Media Presence',
            'Code Repositories (GitHub/GitLab)',
            'Cloud Buckets'
        ],
        deliverables: [
            'Digital Footprint Report',
            'Threat Exposure Matrix',
            'Credential Leak Database',
            'Takedown Recommendations'
        ],
        benefits: [
            { title: 'Proactive Defense', icon: '🛡️' },
            { title: 'Reduced Phishing Risk', icon: '📉' },
            { title: 'Brand Reputation Management', icon: '🌟' },
            { title: 'Early Warning System', icon: '🚨' }
        ]
    },
    {
        title: 'Incident Response',
        subtitle: 'Rapid recovery when every second counts',
        description: 'Rapid response team to handle security breaches, minimize damage, and recover operations with forensic precision.',
        icon: '🚨',
        features: ['24/7 Response', 'Forensic Analysis', 'Malware Analysis', 'Recovery Planning'],
        offerings: [
            { title: 'Breach Containment', description: 'Stopping the spread of attack', icon: '🛑' },
            { title: 'Forensics', description: 'Deep dive into logs and artifacts', icon: '🔎' },
            { title: 'Malware Reversing', description: 'Understanding the payload', icon: '🦠' },
            { title: 'Root Cause', description: 'Identifying entry point (Patient Zero)', icon: '📍' }
        ],
        process: [
            { step: 1, title: 'Identification', description: 'Detecting and verifying the incident', icon: '🚨' },
            { step: 2, title: 'Containment', description: 'Isolating affected systems', icon: '🚧' },
            { step: 3, title: 'Eradication', description: 'Removing the threat', icon: '🧹' },
            { step: 4, title: 'Recovery', description: 'Restoring services safely', icon: '♻️' },
            { step: 5, title: 'Lessons Learned', description: 'Post-mortem analysis', icon: '🎓' }
        ],
        scope: [
            'Compromised Endpoints',
            'Server Logs',
            'Network Traffic',
            'Malicious Files',
            'Active Directory'
        ],
        deliverables: [
            'Incident Timeline',
            'Root Cause Analysis (RCA)',
            'Compromise Assessment',
            'Strategic Improvements Plan'
        ],
        benefits: [
            { title: 'Minimize Downtime', icon: '⏱️' },
            { title: 'Limit Financial Impact', icon: '💰' },
            { title: 'Legal & Regulatory Compliance', icon: '⚖️' },
            { title: 'Preserve Evidence', icon: '🔍' }
        ]
    },
    {
        title: 'Training',
        subtitle: 'Build your human firewall',
        description: 'Empower your team with cybersecurity awareness and technical training to recognize and stop attacks.',
        icon: '🎓',
        features: ['Phishing Simulations', 'Security Awareness', 'Secure Coding', 'Compliance Training'],
        offerings: [
            { title: 'Phishing Sims', description: 'Real-world attack simulation', icon: '🎣' },
            { title: 'DevSecOps', description: 'Secure coding for developers', icon: '👨‍💻' },
            { title: 'Awareness', description: 'General staff security hygiene', icon: '🧠' },
            { title: 'Tabletop', description: 'Crisis simulation for executives', icon: '♟️' }
        ],
        process: [
            { step: 1, title: 'Assessment', description: 'Baseline knowledge check', icon: '📝' },
            { step: 2, title: 'Curriculum', description: 'Tailored content creation', icon: '📚' },
            { step: 3, title: 'Delivery', description: 'Workshops and automated modules', icon: '🎤' },
            { step: 4, title: 'Simulation', description: 'Testing applied knowledge', icon: '🧪' },
            { step: 5, title: 'Metrics', description: 'Progress tracking', icon: '📈' }
        ],
        scope: [
            'All Employees',
            'Development Teams',
            'IT Operations',
            'C-Suite Executives'
        ],
        deliverables: [
            'Performance Analytics Dashboard',
            'Completion Certificates',
            'Vulnerable User List',
            'Training Materials'
        ],
        benefits: [
            { title: 'Reduce Human Error', icon: '📉' },
            { title: 'Cultivate Security Culture', icon: '🌱' },
            { title: 'Meet Compliance Standards', icon: '✅' },
            { title: 'Lower Phishing Click Rate', icon: '🎣' }
        ]
    }
];

async function seedDetailedServices() {
    console.log('Seeding Detailed Business Services (All 5)...');
    console.log('Clearing existing entries...');

    for (const s of detailedServices) {
        const slug = s.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

        // Delete existing to update with new schema
        await query('DELETE FROM business_services WHERE slug = $1', [slug]);

        const id = uuidv4();
        await query(
            `INSERT INTO business_services (
                id, title, slug, description, features, icon, status,
                subtitle, offerings, process, scope, deliverables, benefits
            )
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)`,
            [
                id, s.title, slug, s.description, JSON.stringify(s.features), s.icon, 'active',
                s.subtitle,
                JSON.stringify(s.offerings),
                JSON.stringify(s.process),
                JSON.stringify(s.scope),
                JSON.stringify(s.deliverables),
                JSON.stringify(s.benefits)
            ]
        );
        console.log(`Updated detailed service: ${s.title}`);
    }

    console.log('Seeding complete.');
    process.exit(0);
}

seedDetailedServices().catch(console.error);
