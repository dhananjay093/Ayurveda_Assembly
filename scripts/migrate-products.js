const fs = require('fs');

// Basic dotenv parser to handle the specific format
const envFile = fs.readFileSync('.env.local', 'utf8');
const env = {};
envFile.split('\n').forEach(line => {
    const [key, ...valueChunks] = line.split('=');
    if (key && valueChunks.length) {
        let val = valueChunks.join('=').trim();
        // Handle quotes around private key
        if (val.startsWith('"') && val.endsWith('"')) {
            val = val.slice(1, -1);
        }
        env[key.trim()] = val;
    }
});

const { initializeApp, cert } = require('firebase-admin/app');
const { getFirestore, FieldValue } = require('firebase-admin/firestore');

// Properly handle newlines in the private key
const rawKey = env.FIREBASE_PRIVATE_KEY || '';
const privateKey = rawKey.replace(/\\n/g, '\n');

const serviceAccount = {
    projectId: env.FIREBASE_PROJECT_ID,
    clientEmail: env.FIREBASE_CLIENT_EMAIL,
    privateKey: privateKey
};

initializeApp({
    credential: cert(serviceAccount)
});

const db = getFirestore();

async function migrate() {
    try {
        const productsData = JSON.parse(fs.readFileSync('./db/products.json', 'utf8'));

        // 1. Migrate Products
        console.log('Migrating products...');
        const batch = db.batch();
        for (const product of productsData) {
            const docRef = db.collection('products').doc(product.id);
            batch.set(docRef, {
                ...product,
                createdAt: FieldValue.serverTimestamp()
            });
        }
        await batch.commit();
        console.log(`Successfully migrated ${productsData.length} products to Firestore.`);

        // 2. Initialize Settings
        console.log('Initializing site settings...');
        await db.collection('settings').doc('siteSettings').set({
            headerBannerText: 'Free Shipping on orders above ₹499 | Use code AYUR10 for 10% off',
            freeShippingThreshold: 499,
            internationalShippingRate: 1500, // Fixed placeholder for out of India
            updatedAt: FieldValue.serverTimestamp()
        }, { merge: true });
        console.log('Site settings initialized.');

    } catch (error) {
        console.error('Migration failed:', error);
    }
}

migrate();
