import { adminDb } from '@/firebase/admin';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { category, concern, featured, search } = req.query;

    // In a production scenario with millions of items, you'd want to build the query dynamically.
    // For this catalogue size, fetching all and filtering is acceptable and supports complex search.
    const snapshot = await adminDb.collection('products').get();
    let filteredProducts = [];

    snapshot.forEach(doc => {
      filteredProducts.push({ id: doc.id, ...doc.data() });
    });

    if (category) {
      filteredProducts = filteredProducts.filter(
        p => p.category.toLowerCase() === category.toLowerCase()
      );
    }

    if (concern) {
      filteredProducts = filteredProducts.filter(
        p => p.concern && p.concern.some(c => c.toLowerCase().includes(concern.toLowerCase()))
      );
    }

    if (featured === 'true') {
      filteredProducts = filteredProducts.filter(p => p.featured);
    }

    if (search) {
      const searchLower = search.toLowerCase();
      filteredProducts = filteredProducts.filter(
        p =>
          p.name.toLowerCase().includes(searchLower) ||
          p.description.toLowerCase().includes(searchLower)
      );
    }

    res.status(200).json(filteredProducts);
  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).json({ message: 'Error fetching products form Database' });
  }
}
