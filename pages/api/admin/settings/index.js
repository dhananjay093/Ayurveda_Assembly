import { adminDb } from '@/firebase/admin';

export default async function handler(req, res) {
    const adminPassword = req.headers['x-admin-password'];
    if (adminPassword !== process.env.ADMIN_PASSWORD) {
        return res.status(401).json({ message: 'Unauthorized' });
    }

    const settingsDocRef = adminDb.collection('settings').doc('siteSettings');

    if (req.method === 'GET') {
        try {
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
    } else if (req.method === 'PUT') {
        try {
            const updateData = req.body;
            await settingsDocRef.update({
                ...updateData,
                updatedAt: new Date().toISOString()
            });
            res.status(200).json({ message: 'Settings updated successfully' });
        } catch (e) {
            console.error('Error updating settings:', e);
            res.status(500).json({ message: 'Failed to update settings' });
        }
    } else {
        res.status(405).json({ message: 'Method not allowed' });
    }
}
