const fs = require('fs');
const path = require('path');
const admin = require('firebase-admin');

function getEnv() {
    const envPath = path.join(process.cwd(), '.env.local');
    const envContent = fs.readFileSync(envPath, 'utf8');
    const env = {};
    envContent.split('\n').forEach(line => {
        const [key, ...valueParts] = line.split('=');
        if (key && valueParts.length > 0) {
            let value = valueParts.join('=').trim();
            if ((value.startsWith("'") && value.endsWith("'")) || (value.startsWith('"') && value.endsWith('"'))) {
                value = value.slice(1, -1);
            }
            env[key.trim()] = value;
        }
    });
    return env;
}

const env = getEnv();

if (!admin.apps.length) {
    const serviceAccount = {
        projectId: env.FIREBASE_PROJECT_ID,
        clientEmail: env.FIREBASE_CLIENT_EMAIL,
        privateKey: env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    };

    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
    });
}

const adminDb = admin.firestore();

async function inspectLastOrder() {
    try {
        const orderSnap = await adminDb.collection('orders').orderBy('created_at', 'desc').limit(1).get();
        if (orderSnap.empty) {
            console.log('No orders found.');
            return;
        }
        const order = orderSnap.docs[0].data();
        console.log('Order ID:', orderSnap.docs[0].id);
        console.log('Full Order Object:', JSON.stringify(order, null, 2));
    } catch (error) {
        console.error('Error:', error);
    }
}

inspectLastOrder();
