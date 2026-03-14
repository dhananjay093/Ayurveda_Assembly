import { getShippingRates } from '@/lib/shiprocket';
import { adminDb } from '@/firebase/admin';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { pincode, total_weight_grams, dimensions } = req.body;

    if (!pincode || !total_weight_grams) {
      return res.status(400).json({ message: 'Pincode and weight are required' });
    }

    // Fetch pickup pincode from settings
    const settingsSnap = await adminDb.collection('settings').doc('siteSettings').get();
    const settings = settingsSnap.exists ? settingsSnap.data() : {};
    const pickupPincode = settings.pickupPincode || '400001'; // Fallback

    const dims = dimensions || { length: 20, width: 15, height: 10 };

    const ratesData = await getShippingRates(
      pickupPincode,
      pincode,
      total_weight_grams,
      dims
    );

    if (!ratesData.data || !ratesData.data.available_courier_companies) {
      return res.status(200).json({
        available: false,
        message: 'Delivery not available to this pincode',
      });
    }

    const couriers = ratesData.data.available_courier_companies;
    const cheapest = couriers.reduce((min, c) =>
      c.rate < min.rate ? c : min, couriers[0]
    );

    res.status(200).json({
      available: true,
      shippingCost: Math.ceil(cheapest.rate),
      estimatedDelivery: cheapest.etd || '5-7 days',
      courierName: cheapest.courier_name,
      allOptions: couriers.map(c => ({
        name: c.courier_name,
        rate: Math.ceil(c.rate),
        etd: c.etd,
      })),
    });
  } catch (error) {
    console.error('Error getting shipping rates:', error);

    const fallbackRate = Math.ceil(req.body.total_weight_grams / 10);
    res.status(200).json({
      available: true,
      shippingCost: Math.max(49, Math.min(fallbackRate, 199)),
      estimatedDelivery: '5-7 business days',
      courierName: 'Standard Shipping',
      isFallback: true,
    });
  }
}
