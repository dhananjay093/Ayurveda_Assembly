import { adminDb } from '@/firebase/admin';

export default async function handler(req, res) {
    const adminPassword = req.headers['x-admin-password'];

    if (adminPassword !== process.env.ADMIN_PASSWORD) {
        return res.status(401).json({ message: 'Unauthorized' });
    }

    if (req.method === 'GET') {
        try {
            // Fetch users from a hypothetical 'users' collection or derive from orders.
            // Since we don't have explicit user registration yet beyond orders,
            // let's derive unique customers from orders for this list
            const snapshot = await adminDb.collection('orders').orderBy('created_at', 'desc').get();
            const customersMap = new Map();

            snapshot.forEach(doc => {
                const order = doc.data();
                const details = order.shipping_details;
                if (details && details.email) {
                    if (!customersMap.has(details.email)) {
                        customersMap.set(details.email, {
                            id: doc.id + "_cust",
                            name: details.name,
                            email: details.email,
                            phone: details.phone,
                            city: details.city,
                            country: order.is_international ? details.country : 'India',
                            totalSpent: order.total,
                            orderCount: 1,
                            lastOrderDate: order.created_at
                        });
                    } else {
                        const existing = customersMap.get(details.email);
                        existing.totalSpent += order.total;
                        existing.orderCount += 1;
                    }
                }
            });

            return res.status(200).json(Array.from(customersMap.values()));
        } catch (error) {
            console.error('Error fetching admin customers:', error);
            return res.status(500).json({ message: 'Error fetching customers' });
        }
    }

    return res.status(405).json({ message: 'Method not allowed' });
}
