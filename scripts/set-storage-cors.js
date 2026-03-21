const admin = require('firebase-admin');
const fs = require('fs');
const path = require('path');

const envPath = path.join(__dirname, '..', '.env.local');
const envContent = fs.readFileSync(envPath, 'utf8');

function getEnvVar(key) {
    const match = envContent.match(new RegExp(`^${key}=(.*)$`, 'm'));
    return match ? match[1].replace(/^"(.*)"$/, '$1') : null;
}

const projectId = getEnvVar('FIREBASE_PROJECT_ID');
const clientEmail = getEnvVar('FIREBASE_CLIENT_EMAIL');
const privateKey = getEnvVar('FIREBASE_PRIVATE_KEY');
const storageBucket = getEnvVar('NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET');

try {
    admin.initializeApp({
        credential: admin.credential.cert({
            projectId: projectId,
            clientEmail: clientEmail,
            privateKey: privateKey.replace(/\\n/g, '\n'),
        }),
        storageBucket: storageBucket
    });

    const bucket = admin.storage().bucket();

    console.log(`Setting CORS for default bucket: ${bucket.name}`);

    bucket.setCorsConfiguration([
        {
            origin: ['*'],
            method: ['GET', 'POST', 'PUT', 'DELETE', 'HEAD', 'OPTIONS'],
            responseHeader: ['Content-Type', 'x-goog-resumable'],
            maxAgeSeconds: 3600,
        }
    ]).then(() => {
        console.log('CORS configuration updated successfully.');
        process.exit(0);
    }).catch((err) => {
        console.error('FAILED to update CORS.');
        console.error(err);
        process.exit(1);
    });

} catch (error) {
    console.error('Initialization error:', error);
    process.exit(1);
}
