import { adminDb } from '@/firebase/admin';

export default async function handler(req, res) {
    const adminPassword = req.headers['x-admin-password'];
    if (adminPassword !== process.env.ADMIN_PASSWORD) {
        return res.status(401).json({ message: 'Unauthorized' });
    }

    const couponsRef = adminDb.collection('coupons');

    if (req.method === 'GET') {
        try {
            const snap = await couponsRef.orderBy('createdAt', 'desc').get();
            const coupons = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            return res.status(200).json(coupons);
        } catch (e) {
            console.error(e);
            return res.status(500).json({ message: 'Failed to fetch coupons' });
        }
    }

    if (req.method === 'POST') {
        try {
            const { code, type, value, minOrderValue, isActive } = req.body;
            if (!code || !type || !value) {
                return res.status(400).json({ message: 'code, type, and value are required' });
            }
            // Check if code already exists
            const existing = await couponsRef.where('code', '==', code.toUpperCase().trim()).get();
            if (!existing.empty) {
                return res.status(409).json({ message: 'Coupon code already exists' });
            }
            const docRef = await couponsRef.add({
                code: code.toUpperCase().trim(),
                type, // 'percent' or 'amount'
                value: Number(value),
                minOrderValue: Number(minOrderValue) || 0,
                isActive: isActive !== false,
                createdAt: new Date().toISOString(),
            });
            return res.status(201).json({ id: docRef.id, message: 'Coupon created' });
        } catch (e) {
            console.error(e);
            return res.status(500).json({ message: 'Failed to create coupon' });
        }
    }

    return res.status(405).json({ message: 'Method not allowed' });
}
