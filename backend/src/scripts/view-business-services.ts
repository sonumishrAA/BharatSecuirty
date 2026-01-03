import { query } from '../config/database.js';

async function viewServices() {
    console.log('Fetching ALL Business Services details...\n');

    const result = await query("SELECT * FROM business_services ORDER BY created_at ASC");

    if (result.rows.length === 0) {
        console.log('No services found.');
    } else {
        for (const s of result.rows) {
            console.log("\n=================================");
            console.log(`SERVICE: ${s.title}`);
            console.log(`SUBTITLE: ${s.subtitle}`);
            console.log("=================================");

            console.log("--- START OFFERINGS ---");
            s.offerings.forEach((o: any) => console.log(`[Icon: ${o.icon}] ${o.title}: ${o.description}`));
            console.log("--- END OFFERINGS ---");

            console.log("--- PROCESS ---");
            s.process.forEach((p: any) => console.log(`Step ${p.step}: ${p.title}`));

            console.log("--- SCOPE ---");
            console.log(s.scope.slice(0, 3) + (s.scope.length > 3 ? "...and more" : "")); // Truncate for readability

            console.log("--- BENEFITS ---");
            s.benefits.forEach((b: any) => console.log(`* ${b.title}`));
        }
    }

    process.exit(0);
}

viewServices().catch(console.error);
