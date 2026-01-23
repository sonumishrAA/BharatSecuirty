import pg from 'pg';
import { v4 as uuidv4 } from 'uuid';

const { Pool } = pg;

// Production Connection String
const connectionString = 'postgresql://bharatsec_user:YB52hy7bk8iSiO07ZYAeTpcmcOBAiM7M@dpg-d5plh8shg0os739lk3gg-a.singapore-postgres.render.com:5432/bharatsecurity?ssl=true';

const pool = new Pool({
    connectionString,
    ssl: { rejectUnauthorized: false }
});

// Image Placeholders (Cyberpunk/Tech style)
const COVER_IMAGES = [
    'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&w=1200&q=80', // Cyber lock
    'https://images.unsplash.com/photo-1555949963-ff9fe0c870eb?auto=format&fit=crop&w=1200&q=80', // Code screen
    'https://images.unsplash.com/photo-1563986768609-322da13575f3?auto=format&fit=crop&w=1200&q=80', // Matrix
    'https://images.unsplash.com/photo-1510511459019-5dda7724fd87?auto=format&fit=crop&w=1200&q=80', // Tech abstract
    'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=1200&q=80', // Matrix code
    'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=1200&q=80', // Server
    'https://images.unsplash.com/photo-1531297461136-82lwDe43ZJm?auto=format&fit=crop&w=1200&q=80', // AI
    'https://images.unsplash.com/photo-1614064641938-3bcee529cfc3?auto=format&fit=crop&w=1200&q=80', // Network
    'https://images.unsplash.com/photo-1510915228340-29c85a43dcfe?auto=format&fit=crop&w=1200&q=80'  // Programmer
];

// Helper to create ProseMirror JSON content
const createContent = (title: string, bodyText: string) => {
    return {
        type: 'doc',
        content: [
            {
                type: 'heading',
                attrs: { level: 2 },
                content: [{ type: 'text', text: title }]
            },
            {
                type: 'paragraph',
                content: [{ type: 'text', text: bodyText }]
            },
            {
                type: 'paragraph',
                content: [{ type: 'text', text: 'In today’s digital age, security is not just an option but a necessity. At Bharat Security, we believe in empowering users with knowledge.' }]
            },
            {
                type: 'heading',
                attrs: { level: 3 },
                content: [{ type: 'text', text: 'Key Takeaways' }]
            },
            {
                type: 'bullet_list',
                content: [
                    { type: 'list_item', content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Always verify source authenticity.' }] }] },
                    { type: 'list_item', content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Enable 2FA wherever possible.' }] }] },
                    { type: 'list_item', content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Keep your software updated.' }] }] }
                ]
            }
        ]
    };
};

const CATEGORIES = {
    BLOG: 'blog',
    SCAM: 'scam_alert',
    OSINT: 'osint_guide',
    RESOURCE: 'resource'
};

const SAMPLE_DATA = [
    // --- BLOG (10) ---
    {
        title: "The Future of Cybersecurity: AI and Automation",
        cat: CATEGORIES.BLOG,
        desc: "How Artificial Intelligence is reshaping the landscape of digital defense and the new threats it brings.",
        body: "Artificial Intelligence is a double-edged sword in cybersecurity. While it helps in detecting anomalies faster than any human, hackers are also using AI to generate sophisticated phishing emails and malware..."
    },
    {
        title: "Zero Trust Architecture: Explained",
        cat: CATEGORIES.BLOG,
        desc: "Why 'Never Trust, Always Verify' is becoming the gold standard for enterprise security.",
        body: "The traditional perimeter-based security model is dead. Zero Trust assumes that threats exist both inside and outside the network. Every request must be authenticated..."
    },
    {
        title: "The Rise of Ransomware as a Service (RaaS)",
        cat: CATEGORIES.BLOG,
        desc: "Understanding the business model behind the dark web's most profitable crime syndicate.",
        body: "Ransomware groups are now operating like legitimate software companies, offering affiliate programs and support centers. RaaS allows even non-technical criminals to launch attacks..."
    },
    {
        title: "Securing the Internet of Things (IoT)",
        cat: CATEGORIES.BLOG,
        desc: "Smart homes are vulnerable. Here is how to lock down your connected devices.",
        body: "From smart bulbs to refrigerators, IoT devices often lack basic security features. This article explores how to segregate networks and manage default passwords..."
    },
    {
        title: "Cloud Security Misconfigurations: A Silent Killer",
        cat: CATEGORIES.BLOG,
        desc: "Most cloud breaches are not hacks, but simple mistakes in permissions and storage settings.",
        body: "AWS S3 buckets left open to the public have exposed millions of records. Understanding the shared responsibility model is crucial for any cloud admin..."
    },
    {
        title: "Ethical Hacking: A Career Roadmap",
        cat: CATEGORIES.BLOG,
        desc: "How to start your journey from a script kiddie to a certified penetration tester.",
        body: "The demand for white-hat hackers is at an all-time high. Certifications like OSCP and CEH are valuable, but hands-on experience on platforms like HackTheBox is key..."
    },
    {
        title: "5G Networks and Privacy Concerns",
        cat: CATEGORIES.BLOG,
        desc: "Does faster internet come at the cost of user privacy? An in-depth analysis.",
        body: "The rollout of 5G brings incredible speed but also requires more cell towers, leading to precise location tracking. We analyze the privacy trade-offs..."
    },
    {
        title: "Social Engineering: Hacking the Human",
        cat: CATEGORIES.BLOG,
        desc: "Why the human element remains the weakest link in any security chain.",
        body: "You can have the best firewalls, but if an employee clicks a malicious link, it's game over. Social engineering exploits human psychology..."
    },
    {
        title: "Blockchain Security Beyond Crypto",
        cat: CATEGORIES.BLOG,
        desc: "How decentralized ledgers are being used to secure supply chains and identity.",
        body: "Blockchain is not just for Bitcoin. It provides an immutable record that can prevent tampering in logistics, voting systems, and digital identity cards..."
    },
    {
        title: "Data Privacy Laws in India (DPDP Act)",
        cat: CATEGORIES.BLOG,
        desc: "What the new Digital Personal Data Protection Act means for businesses and citizens.",
        body: "India's new privacy law imposes strict penalties for data breaches. This guide breaks down the compliance requirements for startups and enterprises..."
    },

    // --- SCAM ALERT (10) ---
    {
        title: "Exposing the 'Digital Arrest' Scam",
        cat: CATEGORIES.SCAM,
        desc: "Fraudsters posing as police or CBI are putting victims under 'digital house arrest' via Skype.",
        body: "A terrifying new trend where scammers wear uniforms and use fake police backdrops on video calls to accuse victims of money laundering, forcing them to transfer funds..."
    },
    {
        title: "The FedEx/Courier Parcel Scam",
        cat: CATEGORIES.SCAM,
        desc: "Received a call about a package containing illegal items? It’s a classic trap.",
        body: "You get a call saying a parcel in your name contains drugs. They transfer you to a fake 'Cyber Crime' officer who demands money to 'settle' the case..."
    },
    {
        title: "WhatsApp Mallu/Part-Time Job Scam",
        cat: CATEGORIES.SCAM,
        desc: "Like a YouTube video and get paid 50 rupees? Beware of this ponzi scheme.",
        body: "It starts with small payments for simple tasks. Once you trust them, they ask you to invest in a 'prepaid merchant task' which promises huge returns, but you never get your money back..."
    },
    {
        title: "UPI Wrong Transfer Fraud",
        cat: CATEGORIES.SCAM,
        desc: "Scammers send you money 'by mistake' and ask for a refund. Here creates the trap.",
        body: "If you refund the money directly, they also raise a chargeback claim with the bank, causing you to lose money twice. Always ask the bank to reverse the transaction..."
    },
    {
        title: "Deepfake Video Call Scams",
        cat: CATEGORIES.SCAM,
        desc: "That video call from your friend asking for urgent money might be AI-generated.",
        body: "Scammers are using deepfake technology to clone faces and voices of relatives. Always verify by asking a personal question before sending money..."
    },
    {
        title: "Electricity Bill Disconnection SMS",
        cat: CATEGORIES.SCAM,
        desc: "Your power will be cut tonight? Don't call the number in the message.",
        body: "Panic is the scammer's best friend. They send urgent SMS about bill dues. Downloading their 'support app' often gives them remote access to your phone..."
    },
    {
        title: "Instant Loan App Harassment",
        cat: CATEGORIES.SCAM,
        desc: "Quick money comes with hidden costs: Data theft and public shaming.",
        body: "Illegal loan apps access your contact list and gallery. If you miss a payment (or even if you pay), they morph your photos and threaten to send them to your contacts..."
    },
    {
        title: "OLX/QR Code Scanning Fraud",
        cat: CATEGORIES.SCAM,
        desc: "Trying to sell furniture? Don't scan a QR code to 'receive' money.",
        body: "QR codes are only for SENDING money. If someone asks you to scan a code and enter your PIN to receive payment, it is 100% a scam..."
    },
    {
        title: "Fake Charity and Crowdfunding",
        cat: CATEGORIES.SCAM,
        desc: "Emotional manipulation used to steal money for non-existent medical emergencies.",
        body: "Scammers create fake campaigns with stolen photos of sick children. Always verify the hospital and patient details before donating..."
    },
    {
        title: "Sextortion and Video Call Blackmail",
        cat: CATEGORIES.SCAM,
        desc: "A random video call from a stranger can ruin your reputation. How to stay safe.",
        body: "The scam involves a video call where an explicit video is played. They record your face watching it and threaten to upload it to social media unless you pay..."
    },

    // --- OSINT GUIDE (10) ---
    {
        title: "Google Dorks: Master the Search",
        cat: CATEGORIES.OSINT,
        desc: "Advanced search operators to find open webcams, passwords, and PDF documents.",
        body: "Google is more powerful than you think. Using operators like 'filetype:pdf', 'inurl:admin', and 'site:target.com' can reveal sensitive information exposed publicly..."
    },
    {
        title: "Reverse Image Search Techniques",
        cat: CATEGORIES.OSINT,
        desc: "How to verify profiles and find the origin of an image using Yandex, Tineye, and PimEyes.",
        body: "Catfishing is common. Tools like PimEyes (face search) and Yandex Images are superior to Google Lens for finding people and locations..."
    },
    {
        title: "Username Enumeration Tools",
        cat: CATEGORIES.OSINT,
        desc: "Find a target's presence across hundreds of social media sites instantly.",
        body: "Tools like Sherlock and Maigret can check if a username exists across 300+ platforms, helping you build a digital profile of a target..."
    },
    {
        title: "Geolocation Intelligence (GEOINT)",
        cat: CATEGORIES.OSINT,
        desc: "Finding exactly where a photo was taken using shadows, landmarks, and satellite data.",
        body: "From analyzing sun angles to identifying street signs, GEOINT is an art. We explore tools like Google Earth Pro and SunCalc..."
    },
    {
        title: "Shodan: The Search Engine for IoT",
        cat: CATEGORIES.OSINT,
        desc: "Scanning the internet for connected devices, webcams, and industrial control systems.",
        body: "Shodan crawls the internet for devices, not websites. It reveals open ports, vulnerable databases, and unsecured cameras around the world..."
    },
    {
        title: "Exploring the Wayback Machine",
        cat: CATEGORIES.OSINT,
        desc: "How to find deleted tweets, old website versions, and hidden history.",
        body: " The Internet Archive is an invaluable tool for investigators. It allows you to see what a webpage looked like years ago, even if it has been taken down..."
    },
    {
        title: "Email Header Analysis",
        cat: CATEGORIES.OSINT,
        desc: "Tracing the origin IP of an email to verify its authenticity.",
        body: "Email headers contain the path an email took. Analyzing 'Received-SPF' and 'DKIM' signatures helps detect spoofing and phishing attempts..."
    },
    {
        title: "Metadata Analysis with ExifTool",
        cat: CATEGORIES.OSINT,
        desc: "Hidden data in photos can reveal GPS coordinates, camera model, and edit history.",
        body: "Every photo you click stores metadata. ExifTool lets you extract this data to find out when, where, and with what device a photo was taken..."
    },
    {
        title: "Social Media Intelligence (SOCMINT)",
        cat: CATEGORIES.OSINT,
        desc: "Extracting actionable intelligence from public social media profiles.",
        body: "Facebook, Twitter, and Instagram are goldmines of information. We discuss ethical ways to gather connections, interests, and activity patterns..."
    },
    {
        title: "Public Records and People Search",
        cat: CATEGORIES.OSINT,
        desc: "Searching court records, voter lists, and property data (Open Databases).",
        body: "Many countries have open public records. Knowing where to look can reveal business ownership, legal history, and residency details..."
    },

    // --- RESOURCES (10) ---
    {
        title: "The Ultimate Password Security Checklist",
        cat: CATEGORIES.RESOURCE,
        desc: "Stop using 'Password@123'. Here is how to create and manage unbreakable credentials.",
        body: "We recommend using a password manager like Bitwarden. Enable 2FA on every account. Use passphrases instead of complex short passwords..."
    },
    {
        title: "Top 5 Privacy-Focused Browsers in 2026",
        cat: CATEGORIES.RESOURCE,
        desc: "Chrome tracks you. Here are the best alternatives for privacy (Brave, Firefox, Librewolf).",
        body: "Browsers are your window to the web. Switching to Firefox with uBlock Origin or using Brave can significantly reduce your digital footprint..."
    },
    {
        title: "Incident Response Plan Template",
        cat: CATEGORIES.RESOURCE,
        desc: "What to do immediately after you get hacked. A step-by-step guide for businesses.",
        body: "Panic leads to mistakes. This template covers containment, eradication, and recovery steps to minimize damage during a cyberattack..."
    },
    {
        title: "Personal Data Removal Guide",
        cat: CATEGORIES.RESOURCE,
        desc: "How to delete yourself from the internet and data broker databases.",
        body: "Data brokers sell your info. We list the opt-out links for major brokers like Whitepages, Spokeo, and steps to clean up old social media accounts..."
    },
    {
        title: "Secure Messaging Apps Ranking",
        cat: CATEGORIES.RESOURCE,
        desc: "WhatsApp vs Signal vs Telegram. Which one is truly secure?",
        body: "Signal is the gold standard for E2E encryption. Telegram is cloud-based by default. We rank them based on privacy features and metadata collection..."
    },
    {
        title: "Home Router Hardening Guide",
        cat: CATEGORIES.RESOURCE,
        desc: "Your router is the gateway to your home. Secure it to prevent neighbors and hackers from entry.",
        body: "Change default credentials, disable WPS, enable WPA3, and set up a guest network for IoT devices to keep your main network safe..."
    },
    {
        title: "Best 2FA Authenticator Apps",
        cat: CATEGORIES.RESOURCE,
        desc: "SMS OTPs are insecure. Switch to TOTP apps like Aegis, Raivo, or Google Authenticator.",
        body: "SIM swapping makes SMS 2FA risky. App-based authenticators generate codes locally and are immune to network interception..."
    },
    {
        title: "Free vs Paid VPNs: What to Choose?",
        cat: CATEGORIES.RESOURCE,
        desc: "If the product is free, you are the product. Why you should avoid free VPNs.",
        body: "Free VPNs often sell your browsing data. We recommend reputable paid services like ProtonVPN or Mullvad that have strict no-logs policies..."
    },
    {
        title: "Mobile Security for Android & iOS",
        cat: CATEGORIES.RESOURCE,
        desc: "Essential settings to lock down your smartphone against spyware and theft.",
        body: "Permissions management is key. Don't let a flashlight app access your location. We also cover 'Find My Device' setup and biometric security..."
    },
    {
        title: "Phishing Identification Cheat Sheet",
        cat: CATEGORIES.RESOURCE,
        desc: "A quick reference graphic to help you spot fake emails and malicious links instantly.",
        body: "Look for urgency, check the sender domain carefully, hover over links before clicking. This cheat sheet is perfect for employee training..."
    }
];

async function seed() {
    try {
        console.log('🌱 Starting Seed Process on Render DB...');
        const client = await pool.connect();
        console.log('✅ Connected to Database');

        // Fix Schema if columns are missing
        console.log('🔧 Verifying Schema...');
        await client.query(`
            ALTER TABLE posts ADD COLUMN IF NOT EXISTS author_name VARCHAR(100);
            ALTER TABLE posts ADD COLUMN IF NOT EXISTS author_bio TEXT;
            ALTER TABLE posts ADD COLUMN IF NOT EXISTS meta_title VARCHAR(255);
            ALTER TABLE posts ADD COLUMN IF NOT EXISTS meta_description TEXT;
        `);

        let count = 0;
        for (const post of SAMPLE_DATA) {
            const slug = post.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') + '-' + Math.floor(Math.random() * 1000);

            // Random cover image
            const cover = COVER_IMAGES[Math.floor(Math.random() * COVER_IMAGES.length)];

            // Standard JSON editor format
            const contentJson = createContent(post.title, post.body);

            // Editor JSON (with empty floating layer)
            const editorJson = {
                meta: { canvasWidth: 1200, canvasPadding: 40, version: 1 },
                flow: contentJson,
                floating: []
            };

            await client.query(`
                INSERT INTO posts (
                    id, title, slug, excerpt, content, editor_json, 
                    cover_image_url, category, status, author_name, 
                    meta_title, meta_description, created_at
                ) VALUES (
                    $1, $2, $3, $4, $5, $6, 
                    $7, $8, 'published', 'Bharat Security Team',
                    $2, $4, NOW()
                )
            `, [
                uuidv4(),
                post.title,
                slug,
                post.desc,
                JSON.stringify(contentJson),
                JSON.stringify(editorJson),
                cover,
                post.cat,
                // published status hardcoded in query
            ]);

            process.stdout.write('.'); // Progress dot
            count++;
        }

        console.log(`\n\n🎉 Successfully inserted ${count} articles across 4 categories!`);
        client.release();
    } catch (err) {
        console.error('\n❌ Seeding Failed:', err);
    } finally {
        await pool.end();
    }
}

seed();
