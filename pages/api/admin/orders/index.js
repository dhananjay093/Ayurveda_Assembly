import { adminDb } from '@/firebase/admin';

export default async function handler(req, res) {
    const adminPassword = req.headers['x-admin-password'];

    if (adminPassword !== process.env.ADMIN_PASSWORD) {
        return res.status(401).json({ message: 'Unauthorized' });
    }

    if (req.method === 'GET') {
        try {
            // Order by created_at descending (newest first)
            const snapshot = await adminDb.collection('orders').orderBy('created_at', 'desc').get();
            const orders = [];
            snapshot.forEach(doc => {
                orders.push({ id: doc.id, ...doc.data() });
            });
            return res.status(200).json(orders);
        } catch (error) {
            console.error('Error fetching admin orders:', error);
            return res.status(500).json({ message: 'Error fetching orders' });
        }
    }

    return res.status(405).json({ message: 'Method not allowed' });
}
