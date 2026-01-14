
import { Pool } from 'pg';
import dotenv from 'dotenv';
import { v4 as uuidv4 } from 'uuid';

dotenv.config();

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
});

const generateContent = (title: string, body: string) => {
    return {
        type: 'doc',
        content: [
            { type: 'heading', attrs: { level: 2 }, content: [{ type: 'text', text: title }] },
            { type: 'paragraph', content: [{ type: 'text', text: body }] },
            { type: 'paragraph', content: [{ type: 'text', text: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.' }] },
            { type: 'heading', attrs: { level: 3 }, content: [{ type: 'text', text: 'Key Takeaways' }] },
            {
                type: 'bulletList', content: [
                    { type: 'listItem', content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Understand the core concepts.' }] }] },
                    { type: 'listItem', content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Implement security best practices.' }] }] },
                    { type: 'listItem', content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Stay updated with the latest trends.' }] }] }
                ]
            }
        ]
    };
};

const posts = [
    // === OSINT GUIDES ===
    {
        title: 'Advanced Google Dorking Techniques',
        category: 'osint_guide',
        excerpt: 'Master the art of Google hacking to find sensitive files, login pages, and exposed databases.',
        image: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&q=80&w=800',
        content: 'Google Dorking involves using advanced search operators to find information that is not readily available.'
    },
    {
        title: 'Social Media Intelligence Gathering',
        category: 'osint_guide',
        excerpt: 'How to extract and analyze data from social media platforms for investigations.',
        image: 'https://images.unsplash.com/photo-1611162617474-5b21e879e113?auto=format&fit=crop&q=80&w=800',
        content: 'Social media platforms are a goldmine for OSINT investigators. Learn how to pivot from a username to a full profile.'
    },
    {
        title: 'Geolocation Verification Tools',
        category: 'osint_guide',
        excerpt: 'A guide to tools and techniques for verifying the location of images and videos.',
        image: 'https://images.unsplash.com/photo-1569336415962-a4bd9f69cd83?auto=format&fit=crop&q=80&w=800',
        content: 'Geolocation is critical for verifying news and tracking events. We explore tools like Google Earth and SunCalc.'
    },
    {
        title: 'Corporate Reconnaissance 101',
        category: 'osint_guide',
        excerpt: 'Step-by-step guide to mapping out a company\'s digital footprint and employee structure.',
        image: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&q=80&w=800',
        content: 'Corporate recon involves finding subdomains, email patterns, and tech stacks used by a target organization.'
    },
    {
        title: 'Tracking Crypto Transactions',
        category: 'osint_guide',
        excerpt: 'Introduction to blockchain analysis and tracking illicit funds across ledgers.',
        image: 'https://images.unsplash.com/photo-1518546305927-5a555bb7020d?auto=format&fit=crop&q=80&w=800',
        content: 'Blockchain is transparent but pseudonymous. Learn how to trace funds using block explorers and visualization tools.'
    },

    // === SCAM ALERTS ===
    {
        title: 'UPI Payment Fraud Rising',
        category: 'scam_alert',
        excerpt: 'Attackers are using fake QR codes and "collect request" scams to drain bank accounts.',
        image: 'https://images.unsplash.com/photo-1556742049-0cfed4f7a07d?auto=format&fit=crop&q=80&w=800',
        content: 'UPI fraud is on the rise. Scammers send "collect" requests disguised as payments or lottery winnings.'
    },
    {
        title: 'Deepfake CEO Fraud',
        category: 'scam_alert',
        excerpt: 'AI-generated voice and video are being used to impersonate executives and authorize wire transfers.',
        image: 'https://images.unsplash.com/photo-1633419461186-7d40a2e50594?auto=format&fit=crop&q=80&w=800',
        content: 'Deepfakes are the new frontier of social engineering. Verify all high-value transaction requests via a secondary channel.'
    },
    {
        title: 'Fake Job Offer Scams',
        category: 'scam_alert',
        excerpt: 'Beware of "work from home" offers that require an initial payment for training or equipment.',
        image: 'https://images.unsplash.com/photo-1586281380349-632531db7ed4?auto=format&fit=crop&q=80&w=800',
        content: 'Job scams prey on the unemployed. Legitimate companies never ask for money to hire you.'
    },
    {
        title: 'Tech Support Pop-up Scam',
        category: 'scam_alert',
        excerpt: 'Your computer is NOT infected. Do not call the toll-free number flashing on your screen.',
        image: 'https://images.unsplash.com/photo-1563986768609-322da13575f3?auto=format&fit=crop&q=80&w=800',
        content: 'Tech support scams use fear tactics. The pop-ups are just HTML code, not actual malware.'
    },
    {
        title: 'Crypto Investment Schemes',
        category: 'scam_alert',
        excerpt: 'Ponzi schemes disguised as high-yield crypto trading bots are collapsing.',
        image: 'https://images.unsplash.com/photo-1605792657660-596af9009e82?auto=format&fit=crop&q=80&w=800',
        content: 'If an investment guarantees 20% monthly returns, it is a scam. Do your due diligence before investing.'
    },

    // === BLOG (General Security) ===
    {
        title: 'The Future of Zero Trust',
        category: 'blog',
        excerpt: 'Why "never trust, always verify" is becoming the gold standard for enterprise security.',
        image: 'https://images.unsplash.com/photo-1558346490-a72e53ae2d4f?auto=format&fit=crop&q=80&w=800',
        content: 'Zero Trust Architecture (ZTA) assumes the network is already compromised and requires strict identity verification.'
    },
    {
        title: 'Passwordless Authentication',
        category: 'blog',
        excerpt: 'Moving beyond passwords with biometrics, FIDO2, and passkeys.',
        image: 'https://images.unsplash.com/photo-1614064641938-3bbee52942c7?auto=format&fit=crop&q=80&w=800',
        content: 'Passwords are the weakest link. Passkeys provide a phishing-resistant alternative using public key cryptography.'
    },
    {
        title: 'Cybersecurity in Healthcare',
        category: 'blog',
        excerpt: 'Protecting patient data against ransomware attacks which are targeting hospitals.',
        image: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&q=80&w=800',
        content: 'Healthcare is a prime target for ransomware due to the critical nature of patient care and sensitive data.'
    },
    {
        title: 'Supply Chain Attacks Explained',
        category: 'blog',
        excerpt: 'How attackers compromise software vendors to infiltrate their downstream customers.',
        image: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&q=80&w=800',
        content: 'SolarWinds was a wake-up call. Supply chain security focuses on vetting third-party vendors and dependencies.'
    },
    {
        title: 'The Rise of Ransomware-as-a-Service',
        category: 'blog',
        excerpt: 'RaaS models allow non-technical criminals to launch sophisticated attacks.',
        image: 'https://images.unsplash.com/photo-1603791440384-56cd371ee9a7?auto=format&fit=crop&q=80&w=800',
        content: 'RaaS operators develop the malware and rent it out to affiliates, splitting the ransom profits.'
    },

    // === RESOURCES ===
    {
        title: 'Top 10 Kali Linux Tools',
        category: 'resource',
        excerpt: 'Essential tools every penetration tester should have in their arsenal.',
        image: 'https://images.unsplash.com/photo-1629654297299-c8506221ca97?auto=format&fit=crop&q=80&w=800',
        content: 'Kali Linux is the industry standard. Tools like Nmap, Metasploit, and Burp Suite are fundamental.'
    },
    {
        title: 'GDPR Compliance Checklist',
        category: 'resource',
        excerpt: 'A quick reference guide for ensuring your application meets EU data privacy standards.',
        image: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&q=80&w=800',
        content: 'GDPR compliance isn\'t just for Europe. It sets the bar for data privacy globally. Check your data handling.'
    },
    {
        title: 'Secure Coding Best Practices',
        category: 'resource',
        excerpt: 'Cheat sheet for developers to avoid common vulnerabilities like SQLi and XSS.',
        image: 'https://images.unsplash.com/photo-1542831371-29b0f74f9713?auto=format&fit=crop&q=80&w=800',
        content: 'Security starts at the code level. Sanitize inputs, use prepared statements, and encode outputs.'
    },
    {
        title: 'Incident Response Playbook',
        category: 'resource',
        excerpt: 'A template for handling security incidents, from detection to post-mortem.',
        image: 'https://images.unsplash.com/photo-1504384308090-c54be3855833?auto=format&fit=crop&q=80&w=800',
        content: 'Don\'t improvise during a breach. Follow a predefined playbook to contain and remediate threats effectively.'
    },
    {
        title: 'List of Bug Bounty Platforms',
        category: 'resource',
        excerpt: 'Where to legally hack companies and get paid for finding vulnerabilities.',
        image: 'https://images.unsplash.com/photo-1563013544-824ae1b704d3?auto=format&fit=crop&q=80&w=800',
        content: 'HackerOne, Bugcrowd, and Integrity are top platforms. Start with VDPs to build reputation.'
    }
];

async function seedBlogPosts() {
    try {
        console.log('📝 Seeding 20 Blog Posts...');

        // Clear existing posts
        await pool.query('DELETE FROM posts');
        console.log('🗑️  Cleared existing posts.');

        for (const post of posts) {
            const id = uuidv4();
            const slug = post.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
            const richContent = generateContent(post.title, post.content);

            await pool.query(
                `INSERT INTO posts (id, title, slug, excerpt, content, cover_image_url, category, status, meta_title, meta_description)
                 VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
                [
                    id,
                    post.title,
                    slug,
                    post.excerpt,
                    JSON.stringify(richContent),
                    post.image,
                    post.category,
                    'published',
                    post.title,
                    post.excerpt
                ]
            );
            console.log(`✅ Created Post: ${post.title} [${post.category}]`);
        }

        console.log('✨ All 20 posts seeded successfully.');

    } catch (error) {
        console.error('❌ Seeding Failed:', error);
    } finally {
        await pool.end();
    }
}

seedBlogPosts();
