const admin = require('firebase-admin');
const fs = require('fs');
const path = require('path');

try {
    let envContent = fs.readFileSync(path.join(__dirname, '../.env.local'), 'utf8');
    let privateKey = '';
    let clientEmail = '';
    let projectId = '';
    let storageBucket = '';

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
        if (line.startsWith('NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=')) {
            storageBucket = line.replace('NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=', '').trim();
        }
    });

    if (!admin.apps.length) {
        admin.initializeApp({
            credential: admin.credential.cert({
                projectId,
                clientEmail,
                privateKey,
            }),
            storageBucket: storageBucket
        });
    }
} catch (e) {
    console.error('Failed to init firebase admin', e);
    process.exit(1);
}

const db = admin.firestore();
const bucket = admin.storage().bucket();

const concernImages = {
    "Immunity": "C:\\Users\\dhana\\.gemini\\antigravity\\brain\\50cf4f1a-a2f1-4c73-8eb2-7de780008ef7\\concern_immunity_1774082553182.png",
    "Hair": "C:\\Users\\dhana\\.gemini\\antigravity\\brain\\50cf4f1a-a2f1-4c73-8eb2-7de780008ef7\\concern_hair_1774082607052.png",
    "Digestion": "C:\\Users\\dhana\\.gemini\\antigravity\\brain\\50cf4f1a-a2f1-4c73-8eb2-7de780008ef7\\concern_digestion_1774082624594.png",
    "Skin": "C:\\Users\\dhana\\.gemini\\antigravity\\brain\\50cf4f1a-a2f1-4c73-8eb2-7de780008ef7\\concern_skin_1774082690889.png",
    "Heart Health": "C:\\Users\\dhana\\.gemini\\antigravity\\brain\\50cf4f1a-a2f1-4c73-8eb2-7de780008ef7\\concern_heart_1774082711462.png"
};

async function uploadAndAssign() {
    const concernsSnap = await db.collection('concerns').get();

    for (const doc of concernsSnap.docs) {
        const data = doc.data();
        const name = data.name;

        if (concernImages[name]) {
            console.log(`Uploading image for ${name}...`);
            const localPath = concernImages[name];
            const destPath = `concerns/${Date.now()}_${name.toLowerCase().replace(/ /g, '_')}.png`;

            try {
                await bucket.upload(localPath, {
                    destination: destPath,
                    metadata: {
                        contentType: 'image/png'
                    }
                });

                const file = bucket.file(destPath);
                await file.makePublic();
                const url = `https://storage.googleapis.com/${bucket.name}/${destPath}`;

                console.log(`Uploaded ${name} to ${url}`);

                await db.collection('concerns').doc(doc.id).update({
                    image: url
                });
                console.log(`Updated Firestore for ${name}`);
            } catch (err) {
                console.error(`Failed for ${name}:`, err.message);
            }
        }
    }
}

uploadAndAssign().then(() => {
    console.log('Done!');
    process.exit(0);
}).catch(e => {
    console.error(e);
    process.exit(1);
});
