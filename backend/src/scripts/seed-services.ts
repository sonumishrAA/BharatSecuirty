
import { Pool } from 'pg';
import dotenv from 'dotenv';
import { v4 as uuidv4 } from 'uuid';

dotenv.config();

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
});

const services = [
    {
        title: 'Web Application & API Penetration Testing',
        description: 'In-depth manual testing of web applications and APIs to identify, exploit, and chain vulnerabilities in authentication, authorization, business logic, and overall application architecture.',
        icon: '🌐',
        features: ['Authentication Testing', 'Business Logic Flaws', 'API Security', 'Vulnerability Chaining']
    },
    {
        title: 'Mobile Application Security Assessment',
        description: 'Comprehensive security analysis of iOS and Android applications, focusing on API vulnerabilities, insecure data storage, cryptographic weaknesses, and platform-specific logic flaws.',
        icon: '📱',
        features: ['iOS & Android', 'API Vulnerabilities', 'Insecure Data Storage', 'Cryptographic Analysis']
    },
    {
        title: 'Cloud & Backend Infrastructure Review',
        description: 'A thorough review of your cloud configuration (AWS, GCP, Azure) and backend systems to identify misconfigurations, access control weaknesses, and opportunities for privilege escalation.',
        icon: '☁️',
        features: ['AWS / GCP / Azure', 'Misconfiguration Checks', 'IAM & Access Control', 'Privilege Escalation']
    },
    {
        title: 'Threat Modeling & Secure Design Review',
        description: 'Collaborative workshops to identify and mitigate security risks in the design phase, ensuring a secure foundation before a single line of code is written.',
        icon: '🛡️',
        features: ['Design Phase Security', 'Risk Identification', 'Mitigation Strategies', 'Secure Architecture']
    },
    {
        title: 'Red Team & Adversary Simulation',
        description: 'Goal-oriented campaigns that simulate real-world adversaries to test your organization\'s detection and response capabilities across people, process, and technology.',
        icon: '⚔️',
        features: ['Real-world Simulation', 'Detection & Response', 'Social Engineering', 'Full Scope Attack']
    }
];

async function seedServices() {
    try {
        console.log('🌱 Starting Service Seeding (Security Focused)...');

        // Clear existing services to ensure correctness
        console.log('🗑️  Clearing existing services...');
        await pool.query('DELETE FROM business_services');

        for (const service of services) {
            const id = uuidv4();
            const slug = service.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

            await pool.query(
                `INSERT INTO business_services (id, title, slug, description, icon, features, status)
                 VALUES ($1, $2, $3, $4, $5, $6, $7)`,
                [id, service.title, slug, service.description, service.icon, JSON.stringify(service.features), 'active']
            );
            console.log(`✅ Created Service: ${service.title}`);
        }

        console.log('✨ Service Seeding Completed Successfully');

    } catch (error) {
        console.error('❌ Seeding Failed:', error);
    } finally {
        await pool.end();
    }
}

seedServices();
