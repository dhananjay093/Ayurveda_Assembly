import { adminDb } from '@/firebase/admin';

export default async function handler(req, res) {
    if (req.method !== 'PUT' && req.method !== 'DELETE') {
        return res.status(405).json({ message: 'Method not allowed' });
    }

    const { id } = req.query;
    const adminPassword = req.headers['x-admin-password'];

    if (adminPassword !== process.env.ADMIN_PASSWORD) {
        return res.status(401).json({ message: 'Unauthorized' });
    }

    try {
        const docRef = adminDb.collection('products').doc(id);

        if (req.method === 'PUT') {
            const updateData = req.body;
            await docRef.update(updateData);
            return res.status(200).json({ message: 'Product updated successfully' });
        }

        if (req.method === 'DELETE') {
            await docRef.delete();
            return res.status(200).json({ message: 'Product deleted successfully' });
        }
    } catch (error) {
        console.error('Error modifying product:', error);
        return res.status(500).json({ message: 'Error modifying product' });
    }
}
