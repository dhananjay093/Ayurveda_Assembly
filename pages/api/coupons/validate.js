import { adminDb } from '@/firebase/admin';

// Public endpoint — customers use this to validate a coupon code at checkout
export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Method not allowed' });
    }

    const { code, orderTotal } = req.body;
    if (!code) {
        return res.status(400).json({ message: 'Coupon code is required' });
    }

    try {
        const snap = await adminDb.collection('coupons')
            .where('code', '==', code.toUpperCase().trim())
            .where('isActive', '==', true)
            .get();

        if (snap.empty) {
            return res.status(404).json({ message: 'Invalid or expired coupon code' });
        }

        const coupon = { id: snap.docs[0].id, ...snap.docs[0].data() };

        if (coupon.minOrderValue && orderTotal < coupon.minOrderValue) {
            return res.status(400).json({
                message: `Minimum order of ₹${coupon.minOrderValue} required for this coupon`
            });
        }

        // Calculate discount amount
        let discountAmount = 0;
        if (coupon.type === 'percent') {
            discountAmount = Math.round((orderTotal * coupon.value) / 100);
        } else if (coupon.type === 'amount') {
            discountAmount = Math.min(coupon.value, orderTotal);
        }

        return res.status(200).json({
            valid: true,
            discountAmount,
            coupon: {
                code: coupon.code,
                type: coupon.type,
                value: coupon.value,
            },
        });
    } catch (e) {
        console.error(e);
        return res.status(500).json({ message: 'Failed to validate coupon' });
    }
}
