import Razorpay from 'razorpay';

let razorpayInstance = null;

export function getRazorpayInstance() {
  if (!razorpayInstance) {
    razorpayInstance = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET,
    });
  }
  return razorpayInstance;
}

export async function createOrder(amount, currency = 'INR', receipt = null) {
  const razorpay = getRazorpayInstance();
  
  const options = {
    amount: amount * 100,
    currency,
    receipt: receipt || `order_${Date.now()}`,
  };

  return razorpay.orders.create(options);
}

export function verifyPaymentSignature(orderId, paymentId, signature) {
  const crypto = require('crypto');
  
  const body = orderId + '|' + paymentId;
  const expectedSignature = crypto
    .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
    .update(body.toString())
    .digest('hex');

  return expectedSignature === signature;
}
