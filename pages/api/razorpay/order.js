import { createOrder } from '../../../lib/razorpay';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { cart_total } = req.body;

    if (!cart_total || cart_total <= 0) {
      return res.status(400).json({ message: 'Valid cart total is required' });
    }

    const order = await createOrder(cart_total);

    res.status(200).json({
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
    });
  } catch (error) {
    console.error('Error creating Razorpay order:', error);
    res.status(500).json({ message: 'Error creating order', error: error.message });
  }
}
