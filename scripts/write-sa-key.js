/**
 * Write the service account key to a temp file for gcloud authentication.
 * Run: node scripts/write-sa-key.js
 */

const path = require('path');
const fs = require('fs');

// Load .env.local manually
const envPath = path.join(__dirname, '..', '.env.local');
const envContent = fs.readFileSync(envPath, 'utf8');
envContent.split(/\r?\n/).forEach((line) => {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) return;
    const eqIndex = trimmed.indexOf('=');
    if (eqIndex === -1) return;
    const key = trimmed.slice(0, eqIndex).trim();
    let value = trimmed.slice(eqIndex + 1).trim();
    if ((value.startsWith("'") && value.endsWith("'")) || (value.startsWith('"') && value.endsWith('"'))) {
        value = value.slice(1, -1);
    }
    if (!process.env[key]) process.env[key] = value;
});

const keyJson = {
    type: 'service_account',
    project_id: process.env.FIREBASE_PROJECT_ID,
    client_email: process.env.FIREBASE_CLIENT_EMAIL,
    private_key: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
};

const outPath = path.join(__dirname, 'sa-key.json');
fs.writeFileSync(outPath, JSON.stringify(keyJson, null, 2));
console.log('Service account key written to:', outPath);
