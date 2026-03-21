/**
 * Diagnostic: List all GCS buckets and try to find the correct bucket name.
 * Run: node scripts/set-cors.js
 */

const https = require('https');
const crypto = require('crypto');
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

const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n');
const projectId = process.env.FIREBASE_PROJECT_ID;
const bucketName = process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET;

console.log('Project:', projectId);
console.log('Bucket:', bucketName);

function base64url(input) {
    return Buffer.from(input).toString('base64').replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
}

function createJWT(email, key) {
    const now = Math.floor(Date.now() / 1000);
    const header = JSON.stringify({ alg: 'RS256', typ: 'JWT' });
    const payload = JSON.stringify({
        iss: email,
        scope: 'https://www.googleapis.com/auth/cloud-platform',
        aud: 'https://oauth2.googleapis.com/token',
        exp: now + 3600,
        iat: now,
    });
    const signingInput = `${base64url(header)}.${base64url(payload)}`;
    const sign = crypto.createSign('RSA-SHA256');
    sign.update(signingInput);
    const sig = sign.sign(key, 'base64').replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
    return `${signingInput}.${sig}`;
}

function httpsRequest(method, url, body, headers) {
    return new Promise((resolve, reject) => {
        const u = new URL(url);
        const req = https.request({
            hostname: u.hostname,
            path: u.pathname + u.search,
            method,
            headers,
        }, (res) => {
            let data = '';
            res.on('data', (chunk) => data += chunk);
            res.on('end', () => resolve({ status: res.statusCode, body: data }));
        });
        req.on('error', reject);
        if (body) req.write(body);
        req.end();
    });
}

async function getToken() {
    const jwt = createJWT(clientEmail, privateKey);
    const body = `grant_type=urn%3Aietf%3Aparams%3Aoauth%3Agrant-type%3Ajwt-bearer&assertion=${jwt}`;
    const res = await httpsRequest('POST', 'https://oauth2.googleapis.com/token', body, {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Content-Length': Buffer.byteLength(body),
    });
    if (res.status !== 200) throw new Error(`Token ${res.status}: ${res.body}`);
    return JSON.parse(res.body).access_token;
}

async function run() {
    const token = await getToken();
    console.log('Got access token ✅');

    // List all buckets in the project
    console.log('\n--- Listing all buckets ---');
    const listRes = await httpsRequest('GET', `https://storage.googleapis.com/storage/v1/b?project=${projectId}`, null, {
        Authorization: `Bearer ${token}`,
    });
    console.log(`Status: ${listRes.status}`);
    const listData = JSON.parse(listRes.body);
    if (listData.items) {
        console.log('Buckets found:');
        listData.items.forEach(b => console.log(' -', b.name));
    } else {
        console.log(listRes.body);
    }

    // Try CORS PATCH on the configured bucket name
    console.log('\n--- Trying CORS PATCH ---');
    const corsBody = JSON.stringify({
        cors: [{
            origin: ['http://localhost:3000', 'https://ayurveda-assembly.web.app', 'https://ayurveda-assembly.firebaseapp.com'],
            method: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'HEAD'],
            responseHeader: ['Content-Type', 'Authorization', 'Content-Length', 'X-Requested-With'],
            maxAgeSeconds: 3600,
        }]
    });

    const patchRes = await httpsRequest(
        'PATCH',
        `https://storage.googleapis.com/storage/v1/b/${encodeURIComponent(bucketName)}?fields=cors`,
        corsBody,
        { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(corsBody) }
    );
    console.log(`PATCH status: ${patchRes.status}`);
    console.log('Response:', patchRes.body);
}

run().catch(e => { console.error('Fatal:', e.message); process.exit(1); });
