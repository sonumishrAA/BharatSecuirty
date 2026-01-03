
import { Pool } from 'pg';
import dotenv from 'dotenv';
import { v4 as uuidv4 } from 'uuid';

dotenv.config();

const pool = new Pool({
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432'),
    database: process.env.DB_NAME || 'cms_engine',
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || '',
});

async function seedCaseStudies() {
    console.log('🔌 Connecting to database...');
    try {
        const client = await pool.connect();

        const caseStudies = [
            {
                title: 'Retail PoS System Malware Analysis',
                slug: 'retail-pos-malware-analysis',
                excerpt: 'Investigated and cleaned PoS malware affecting 200+ retail locations nationwide.',
                cover_image_url: 'https://images.unsplash.com/photo-1556742049-0cfed4f7a07d?auto=format&fit=crop&q=80',
                content: {
                    type: "doc",
                    content: [
                        { type: "paragraph", content: [{ type: "text", text: "Full analysis of the BlackPOS variant found in the retail network..." }] }
                    ]
                }
            },
            {
                title: 'Manufacturing OT/IT Network Segmentation',
                slug: 'manufacturing-ot-it-segmentation',
                excerpt: 'Isolated critical SCADA systems from IT network preventing lateral movement risks.',
                cover_image_url: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&q=80',
                content: {
                    type: "doc",
                    content: [
                        { type: "paragraph", content: [{ type: "text", text: "Implemented Purdue Model segmentation for a major auto manufacturer..." }] }
                    ]
                }
            },
            {
                title: 'Agriculture AgriTech Supply Chain',
                slug: 'agritech-supply-chain-security',
                excerpt: 'Secured farm-to-fork traceability platform used by 100K+ farmers.',
                cover_image_url: 'https://images.unsplash.com/photo-1625246333195-58f21a016c68?auto=format&fit=crop&q=80',
                content: {
                    type: "doc",
                    content: [
                        { type: "paragraph", content: [{ type: "text", text: "Audited IoT sensors and cloud infrastructure for the AgriTech platform..." }] }
                    ]
                }
            },
            {
                title: 'Cryptocurrency Exchange Wallet Audit',
                slug: 'crypto-exchange-wallet-audit',
                excerpt: 'Audited cold wallet infrastructure securing $500M+ in digital assets.',
                cover_image_url: 'https://images.unsplash.com/photo-1518546305927-5a42099435d5?auto=format&fit=crop&q=80',
                content: {
                    type: "doc",
                    content: [
                        { type: "paragraph", content: [{ type: "text", text: "Review of MPC (Multi-Party Computation) implementation..." }] }
                    ]
                }
            }
        ];

        console.log(`🌱 Seeding ${caseStudies.length} case studies...`);

        for (const cs of caseStudies) {
            await client.query(
                `INSERT INTO posts (
                    id, title, slug, excerpt, content, cover_image_url, 
                    category, status, created_at, updated_at, meta_title, meta_description
                ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW(), NOW(), $2, $4)
                 ON CONFLICT (slug) DO NOTHING`,
                [
                    uuidv4(),
                    cs.title,
                    cs.slug,
                    cs.excerpt,
                    cs.content, // generic json
                    cs.cover_image_url,
                    'case_studies', // category
                    'published'     // status
                ]
            );
        }

        console.log('✅ Case Studies seeded successfully!');
        client.release();
    } catch (err) {
        console.error('❌ Error seeding DB:', err);
    } finally {
        await pool.end();
    }
}

seedCaseStudies();
