import { pool } from '../config/database';
import { v4 as uuidv4 } from 'uuid';
import { PostCategory, PostStatus } from '../models/Post';

const categories: PostCategory[] = ['blog', 'scam_alert', 'osint_guide', 'resource'];

const titles = {
    blog: [
        "The Future of Cybersecurity in 2026",
        "Why Zero Trust Architecture Matters",
        "Top 5 Password Managers Reviewed",
        "Understanding Phishing Attacks",
        "Securing Your Home Network",
        "The Rise of AI in Cyber Defense",
        "Remote Work Security Best Practices"
    ],
    scam_alert: [
        "Urgent: New UPI Payment Fraud Detected",
        "Fake Job Offers on LinkedIn: What to Watch",
        "Crypto Investment Scams Spiking",
        "IRS Tax Refund Scam Emails",
        "Tech Support Scams: Don't Let Them In",
        "Lottery Winner Scams via WhatsApp"
    ],
    osint_guide: [
        "Beginner's Guide to Open Source Intelligence",
        "Using Google Dorks for Investigation",
        "Tracking Digital Footprints",
        "Social Media Intelligence Gathering",
        "Geolocation Techniques for Images",
        "Best OSINT Tools for 2026"
    ],
    resource: [
        "Cybersecurity Checklist for Small Business",
        "Incident Response Plan Template",
        "List of Free Security Tools",
        "GDPR Compliance Guide PDF",
        "Network Security Policy Framework",
        "Ethical Hacking Learning Roadmap"
    ]
};

const generateContent = (title: string, category: string) => {
    return {
        type: 'doc',
        content: [
            {
                type: 'heading',
                attrs: { level: 2 },
                content: [{ type: 'text', text: `Introduction to ${title}` }]
            },
            {
                type: 'paragraph',
                content: [{ type: 'text', text: `This is a detailed post about ${title}. In the world of ${category}, staying informed is crucial. We will explore the key aspects and provide actionable advice.` }]
            },
            {
                type: 'heading',
                attrs: { level: 3 },
                content: [{ type: 'text', text: 'Key Takeaways' }]
            },
            {
                type: 'bulletList',
                content: [
                    {
                        type: 'listItem',
                        content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Understanding the core concepts.' }] }]
                    },
                    {
                        type: 'listItem',
                        content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Implementing security measures.' }] }]
                    },
                    {
                        type: 'listItem',
                        content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Staying vigilant against threats.' }] }]
                    }
                ]
            },
            {
                type: 'paragraph',
                content: [{ type: 'text', text: 'Conclusion: Always verify information and stay safe online.' }]
            }
        ]
    };
};

const seed = async () => {
    try {
        console.log('🌱 Starting seed...');

        // Verify connection
        const client = await pool.connect();
        console.log('✅ DB Connected');
        client.release();

        let count = 0;

        for (const category of categories) {
            const catTitles = titles[category] || [];

            for (const title of catTitles) {
                const id = uuidv4();
                const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
                const content = generateContent(title, category);
                // Use a consistent but random-looking image
                const cover = `https://picsum.photos/seed/${slug}/800/600`;
                const now = new Date();

                await pool.query(
                    `INSERT INTO posts (
                        id, title, slug, excerpt, content, cover_image_url,
                        meta_title, meta_description, category, status,
                        created_at, updated_at
                    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)`,
                    [
                        id,
                        title,
                        slug,
                        `A comprehensive guide about ${title}. Read more to learn about ${category}.`,
                        JSON.stringify(content),
                        cover,
                        title,
                        `Learn everything about ${title} in this detailed ${category} post.`,
                        category,
                        'published',
                        now,
                        now
                    ]
                );

                console.log(`Created post: ${title} (${category})`);
                count++;
            }
        }

        console.log(`\n✨ Successfully seeded ${count} posts!`);
        process.exit(0);

    } catch (error) {
        console.error('❌ Seed failed:', error);
        process.exit(1);
    }
};

seed();
