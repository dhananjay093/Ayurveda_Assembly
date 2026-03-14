import { adminDb } from '@/firebase/admin';

export default async function handler(req, res) {
    if (req.method !== 'GET') {
        return res.status(405).json({ message: 'Method not allowed' });
    }

    try {
        const settingsDocRef = adminDb.collection('settings').doc('siteSettings');
        const settingsSnap = await settingsDocRef.get();

        if (settingsSnap.exists) {
            res.status(200).json(settingsSnap.data());
        } else {
            res.status(404).json({ message: 'Settings not found' });
        }
    } catch (e) {
        console.error('Error fetching settings:', e);
        res.status(500).json({ message: 'Failed to fetch settings' });
    }
}
