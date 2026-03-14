/**
 * Shiprocket API Utility
 * Documentation: https://www.shiprocket.in/shiprocket-api-documentation/
 */

let shiprocketToken = null;
let tokenExpiry = null;

async function getToken() {
  if (shiprocketToken && tokenExpiry && Date.now() < tokenExpiry) {
    return shiprocketToken;
  }

  try {
    const response = await fetch('https://apiv2.shiprocket.in/v1/external/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: process.env.SHIPROCKET_EMAIL,
        password: process.env.SHIPROCKET_PASSWORD,
      }),
    });

    if (!response.ok) {
      const errData = await response.json();
      throw new Error(errData.message || 'Shiprocket Authentication failed');
    }

    const data = await response.json();
    shiprocketToken = data.token;
    // Token is valid for 10 days, we set expiry to 9 days to be safe
    tokenExpiry = Date.now() + 9 * 24 * 60 * 60 * 1000;

    return shiprocketToken;
  } catch (error) {
    console.error('Shiprocket Auth Error:', error.message);
    throw error;
  }
}

/**
 * Get shipping rates for a specific shipment
 */
export async function getShippingRates(pickupPincode, deliveryPincode, weight, dimensions) {
  const token = await getToken();

  // Ensure dimensions are provided
  const { length = 20, width = 15, height = 10 } = dimensions || {};

  const url = `https://apiv2.shiprocket.in/v1/external/courier/serviceability/?pickup_postcode=${pickupPincode}&delivery_postcode=${deliveryPincode}&weight=${weight / 1000}&cod=0&length=${length}&breadth=${width}&height=${height}`;

  const response = await fetch(url, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
  });

  const data = await response.json();
  if (!response.ok) {
    console.error('Shiprocket Serviceability Error:', data);
    throw new Error(data.message || 'Failed to get shipping rates');
  }

  return { ok: true, data: data.data };
}

/**
 * Create an adhoc order in Shiprocket
 */
export async function createShipment(orderData) {
  const token = await getToken();

  const response = await fetch('https://apiv2.shiprocket.in/v1/external/orders/create/adhoc', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify(orderData),
  });

  const data = await response.json();
  if (!response.ok) {
    console.error('Shiprocket Create Order Error:', data);
    throw new Error(data.message || (data.errors ? JSON.stringify(data.errors) : 'Failed to create shipment'));
  }

  return data;
}
