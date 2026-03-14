import { adminDb } from '@/firebase/admin';

export default async function handler(req, res) {
    const adminPassword = req.headers['x-admin-password'];

    if (adminPassword !== process.env.ADMIN_PASSWORD) {
        return res.status(401).json({ message: 'Unauthorized' });
    }

    if (req.method === 'GET') {
        try {
            const snapshot = await adminDb.collection('products').get();
            const products = [];
            snapshot.forEach(doc => {
                const data = doc.data();
                if (data.createdAt) data.createdAt = typeof data.createdAt.toDate === 'function' ? data.createdAt.toDate().toISOString() : new Date(data.createdAt).toISOString();
                products.push({ id: doc.id, ...data });
            });
            return res.status(200).json(products);
        } catch (error) {
            console.error('Error fetching admin products:', error);
            return res.status(500).json({ message: 'Error fetching products' });
        }
    }

    return res.status(405).json({ message: 'Method not allowed' });
}
