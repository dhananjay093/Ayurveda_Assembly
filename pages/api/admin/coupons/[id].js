import { adminDb } from '@/firebase/admin';

export default async function handler(req, res) {
    const adminPassword = req.headers['x-admin-password'];
    if (adminPassword !== process.env.ADMIN_PASSWORD) {
        return res.status(401).json({ message: 'Unauthorized' });
    }

    const { id } = req.query;
    const docRef = adminDb.collection('coupons').doc(id);

    if (req.method === 'PUT') {
        try {
            const { code, type, value, minOrderValue, isActive } = req.body;
            await docRef.update({
                ...(code && { code: code.toUpperCase().trim() }),
                ...(type && { type }),
                ...(value !== undefined && { value: Number(value) }),
                ...(minOrderValue !== undefined && { minOrderValue: Number(minOrderValue) }),
                ...(isActive !== undefined && { isActive }),
                updatedAt: new Date().toISOString(),
            });
            return res.status(200).json({ message: 'Coupon updated' });
        } catch (e) {
            console.error(e);
            return res.status(500).json({ message: 'Failed to update coupon' });
        }
    }

    if (req.method === 'DELETE') {
        try {
            await docRef.delete();
            return res.status(200).json({ message: 'Coupon deleted' });
        } catch (e) {
            console.error(e);
            return res.status(500).json({ message: 'Failed to delete coupon' });
        }
    }

    return res.status(405).json({ message: 'Method not allowed' });
}
