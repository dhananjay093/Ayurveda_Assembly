import { adminDb } from '@/firebase/admin';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const adminPassword = req.headers['x-admin-password'];
  if (adminPassword !== (process.env.ADMIN_PASSWORD || 'admin123')) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  try {
    const { name, description, price, originalPrice, category, concern, weight, dimensions, image, inStock, featured } = req.body;

    if (!name || !description || !price || !category) {
      return res.status(400).json({ message: 'Missing required fields: name, description, price, category' });
    }

    const productData = {
      name,
      description,
      price: Number(price),
      originalPrice: Number(originalPrice) || Number(price),
      category,
      concern: Array.isArray(concern) ? concern : (concern ? concern.split(',').map(c => c.trim()) : []),
      weight: Number(weight) || 100,
      dimensions: dimensions || { length: 10, width: 10, height: 10 },
      image: image || '',
      inStock: inStock !== undefined ? inStock : true,
      featured: featured !== undefined ? featured : false,
      rating: 0,
      reviews: 0,
      createdAt: new Date(), // using JS date to parse correctly into firestore or string
    };

    const docRef = await adminDb.collection('products').add(productData);

    return res.status(201).json({
      message: 'Product added successfully',
      id: docRef.id,
      product: productData
    });

  } catch (error) {
    console.error('Error adding product:', error);
    res.status(500).json({ message: 'Error adding product', error: error.message });
  }
}
