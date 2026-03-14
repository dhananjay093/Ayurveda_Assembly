// Force rebuild comment: v2-relative-path
import { adminDb } from '../../../firebase/admin';

// Public endpoint — returns all active health concerns
export default async function handler(req, res) {
    if (req.method !== 'GET') {
        return res.status(405).json({ message: 'Method not allowed' });
    }

    try {
        const snap = await adminDb.collection('concerns').orderBy('name', 'asc').get();
        if (snap.empty) {
            return res.status(200).json([
                { name: 'Immunity', slug: 'immunity', icon: '🛡️', color: 'from-blue-400 to-blue-600' },
                { name: 'Digestion', slug: 'digestion', icon: '🌱', color: 'from-green-400 to-green-600' },
                { name: 'Stress & Anxiety', slug: 'stress-anxiety', icon: '🧘', color: 'from-purple-400 to-purple-600' },
                { name: 'Skin Health', slug: 'skin-health', icon: '✨', color: 'from-pink-400 to-pink-600' },
                { name: 'Energy', slug: 'energy', icon: '⚡', color: 'from-amber-400 to-amber-600' },
                { name: 'Sleep', slug: 'sleep', icon: '🌙', color: 'from-indigo-400 to-indigo-600' },
            ]);
        }
        const concerns = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        return res.status(200).json(concerns);
    } catch (e) {
        console.error('Error fetching concerns:', e);
        return res.status(500).json({ message: 'Failed to fetch concerns' });
    }
}
