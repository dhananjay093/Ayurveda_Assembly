const admin = require('firebase-admin');
const fs = require('fs');
const path = require('path');

// Initialize Firebase Admin
try {
    let envContent = fs.readFileSync(path.join(__dirname, '../.env.local'), 'utf8');
    let privateKey = '';
    let clientEmail = '';
    let projectId = '';

    envContent.split('\n').forEach(line => {
        if (line.startsWith('FIREBASE_PRIVATE_KEY=')) {
            privateKey = line.replace('FIREBASE_PRIVATE_KEY=', '').trim().replace(/^"|"$/g, '').replace(/\\n/g, '\n');
        }
        if (line.startsWith('FIREBASE_CLIENT_EMAIL=')) {
            clientEmail = line.replace('FIREBASE_CLIENT_EMAIL=', '').trim();
        }
        if (line.startsWith('NEXT_PUBLIC_FIREBASE_PROJECT_ID=')) {
            projectId = line.replace('NEXT_PUBLIC_FIREBASE_PROJECT_ID=', '').trim();
        }
    });

    if (!admin.apps.length) {
        admin.initializeApp({
            credential: admin.credential.cert({
                projectId,
                clientEmail,
                privateKey,
            }),
        });
    }
} catch (e) {
    console.error('Failed to init firebase admin', e);
    process.exit(1);
}

const db = admin.firestore();

async function run() {
    const productsSnap = await db.collection('products').get();
    const products = [];
    productsSnap.forEach(doc => {
        const d = doc.data();
        products.push({ id: doc.id, name: d.name, category: d.category, concern: d.concern || [] });
    });

    const concernsSnap = await db.collection('concerns').get();
    const concerns = [];
    concernsSnap.forEach(doc => {
        concerns.push({ id: doc.id, name: doc.data().name });
    });

    fs.writeFileSync(path.join(__dirname, 'catalog_export.json'), JSON.stringify({ products, concerns }, null, 2));
    console.log('Exported catalog to catalog_export.json');
}

run();
