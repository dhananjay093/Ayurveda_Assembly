import { adminDb } from '@/firebase/admin';

export default async function handler(req, res) {
    const adminPassword = req.headers['x-admin-password'];
    if (adminPassword !== process.env.ADMIN_PASSWORD) {
        return res.status(401).json({ message: 'Unauthorized' });
    }

    const concernsRef = adminDb.collection('concerns');

    if (req.method === 'GET') {
        try {
            const snap = await concernsRef.orderBy('name', 'asc').get();
            const concerns = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            return res.status(200).json(concerns);
        } catch (e) {
            console.error(e);
            return res.status(500).json({ message: 'Failed to fetch concerns' });
        }
    }

    if (req.method === 'POST') {
        try {
            const { name, icon, color } = req.body;
            if (!name) return res.status(400).json({ message: 'Name is required' });
            const slug = name.toLowerCase().replace(/[&]/g, '').replace(/\s+/g, '-').replace(/-+/g, '-').trim();
            // Check if slug already exists
            const existing = await concernsRef.where('slug', '==', slug).get();
            if (!existing.empty) {
                return res.status(409).json({ message: 'Concern with this name already exists' });
            }
            const docRef = await concernsRef.add({
                name: name.trim(),
                slug,
                icon: icon || '🌿',
                color: color || 'from-emerald-400 to-emerald-600',
                createdAt: new Date().toISOString(),
            });
            return res.status(201).json({ id: docRef.id, message: 'Concern created' });
        } catch (e) {
            console.error(e);
            return res.status(500).json({ message: 'Failed to create concern' });
        }
    }

    return res.status(405).json({ message: 'Method not allowed' });
}
