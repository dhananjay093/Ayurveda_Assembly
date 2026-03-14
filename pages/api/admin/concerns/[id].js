import { adminDb } from '@/firebase/admin';

export default async function handler(req, res) {
    const adminPassword = req.headers['x-admin-password'];
    if (adminPassword !== process.env.ADMIN_PASSWORD) {
        return res.status(401).json({ message: 'Unauthorized' });
    }

    const { id } = req.query;
    const docRef = adminDb.collection('concerns').doc(id);

    if (req.method === 'DELETE') {
        try {
            await docRef.delete();
            return res.status(200).json({ message: 'Concern deleted' });
        } catch (e) {
            console.error(e);
            return res.status(500).json({ message: 'Failed to delete concern' });
        }
    }

    return res.status(405).json({ message: 'Method not allowed' });
}
