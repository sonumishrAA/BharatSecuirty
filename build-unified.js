const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const rootDir = process.cwd();
const distDir = path.join(rootDir, 'dist_final');
const tempDir = path.join(rootDir, 'dist_temp');

// Helper to run commands
const run = (cmd, cwd) => {
    console.log(`> Running: ${cmd} in ${cwd || '.'}`);
    try {
        execSync(cmd, { stdio: 'inherit', cwd: cwd || rootDir });
    } catch (error) {
        console.error(`Command failed: ${cmd}`);
        process.exit(1);
    }
};

// Helper to copy directory recursively
const copyRecursiveSync = (src, dest) => {
    if (fs.existsSync(src)) {
        if (!fs.existsSync(dest)) {
            fs.mkdirSync(dest, { recursive: true });
        }

        fs.readdirSync(src).forEach((childItemName) => {
            const srcPath = path.join(src, childItemName);
            const destPath = path.join(dest, childItemName);
            const stats = fs.statSync(srcPath);

            if (stats.isDirectory()) {
                copyRecursiveSync(srcPath, destPath);
            } else {
                fs.copyFileSync(srcPath, destPath);
            }
        });
    }
};

// 1. Clean
console.log('--- Cleaning dist directories ---');
if (fs.existsSync(distDir)) {
    fs.rmSync(distDir, { recursive: true, force: true });
}
if (fs.existsSync(tempDir)) {
    fs.rmSync(tempDir, { recursive: true, force: true });
}
fs.mkdirSync(distDir);
fs.mkdirSync(tempDir);

// 2. Build Main App (net-business)
console.log('--- Building Main Site (net-business) ---');
const mainPath = path.join(rootDir, 'apps/net-business');
const mainOut = path.join(tempDir, 'net-business');
run(`npx ng build --configuration production --base-href / --output-path "${mainOut}"`, mainPath);

let mainSrc = path.join(mainOut, 'browser');
if (!fs.existsSync(mainSrc)) mainSrc = mainOut;
copyRecursiveSync(mainSrc, path.join(distDir, 'net-business'));


// 3. Build Admin (net-admin)
console.log('--- Building Admin Panel (net-admin) ---');
const adminPath = path.join(rootDir, 'apps/net-admin');
const adminOut = path.join(tempDir, 'net-admin');
// Using base-href / so it can be hosted on a separate port/subdomain
run(`npx ng build --configuration production --base-href / --output-path "${adminOut}"`, adminPath);

let adminSrc = path.join(adminOut, 'browser');
if (!fs.existsSync(adminSrc)) adminSrc = adminOut;
copyRecursiveSync(adminSrc, path.join(distDir, 'net-admin'));


// 4. Build User (net-user)
console.log('--- Building User Portal (net-user) ---');
const userPath = path.join(rootDir, 'apps/net-user');
const userOut = path.join(tempDir, 'net-user');
run(`npx ng build --configuration production --base-href / --output-path "${userOut}"`, userPath);

let userSrc = path.join(userOut, 'browser');
if (!fs.existsSync(userSrc)) userSrc = userOut;
copyRecursiveSync(userSrc, path.join(distDir, 'net-user'));


// 5. Build Blog (org-blog)
console.log('--- Building Blog (org-blog) ---');
const blogPath = path.join(rootDir, 'apps/org-blog');
const blogOut = path.join(tempDir, 'org-blog');
run(`npx ng build --configuration production --base-href / --output-path "${blogOut}"`, blogPath);

let blogSrc = path.join(blogOut, 'browser');
if (!fs.existsSync(blogSrc)) blogSrc = blogOut;
copyRecursiveSync(blogSrc, path.join(distDir, 'org-blog'));


// Cleanup
console.log('--- Cleaning temp files ---');
fs.rmSync(tempDir, { recursive: true, force: true });

console.log('--- Final Build Complete ---');
console.log(`Separate builds are in: ${distDir}`);
console.log(`- dist_final/net-business`);
console.log(`- dist_final/net-admin`);
console.log(`- dist_final/net-user`);
console.log(`- dist_final/org-blog`);
