import { verifyPaymentSignature } from '../../../lib/razorpay';
import { createShipment } from '../../../lib/shiprocket';
import { adminDb } from '@/firebase/admin';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      shipping_details,
      cart_items,
      subtotal,
      shipping_cost,
      total,
      is_international
    } = req.body;

    // 1. Verify Payment ONLY FOR DOMESTIC ORDERS
    if (!is_international) {
      const isValid = verifyPaymentSignature(
        razorpay_order_id,
        razorpay_payment_id,
        razorpay_signature
      );
      if (!isValid) {
        return res.status(400).json({ message: 'Invalid payment signature' });
      }
    }

    // 2. Prepare Order Data
    const orderData = {
      shipping_details,
      cart_items,
      subtotal,
      shipping_cost,
      total,
      is_international: is_international === true,
      status: is_international ? 'Pending International' : 'Confirmed',
      payment_status: is_international ? 'Pending Manual Payment' : 'Paid',
      created_at: new Date().toISOString(),
    };

    if (!is_international) {
      orderData.razorpay_order_id = razorpay_order_id;
      orderData.razorpay_payment_id = razorpay_payment_id;
    }

    // 3. Save to Firebase
    const orderRef = await adminDb.collection('orders').add(orderData);
    const orderId = orderRef.id;

    // 4. Handle Shiprocket (Only Domestic)
    let shipmentResult = null;
    if (!is_international) {
      try {
        // Fetch pickup pincode from settings
        const settingsSnap = await adminDb.collection('settings').doc('siteSettings').get();
        const settings = settingsSnap.exists ? settingsSnap.data() : {};

        if (settings.pickupPincode) {
          const pickupLocation = settings.pickupLocationNickname || "Primary";
          const totalWeight = cart_items.reduce(
            (sum, item) => sum + (item.weight || 500) * item.quantity,
            0
          );

          // Robust address parsing
          const billingAddress = shipping_details.address || "";
          const billingCity = shipping_details.city || (billingAddress.split(',').pop()?.trim() || "Unknown");
          const billingState = shipping_details.state || "India";

          const shiprocketOrder = {
            order_id: orderId,
            order_date: new Date().toISOString().split('T')[0],
            pickup_location: pickupLocation,
            billing_customer_name: (shipping_details.name || "Customer").split(' ')[0],
            billing_last_name: (shipping_details.name || "").split(' ').slice(1).join(' ') || 'Customer',
            billing_address: billingAddress,
            billing_address_2: "",
            billing_city: billingCity,
            billing_pincode: shipping_details.pincode || "400001",
            billing_state: billingState,
            billing_country: 'India',
            billing_email: shipping_details.email || 'customer@example.com',
            billing_phone: shipping_details.phone || "9999999999",
            shipping_is_billing: true,
            // Explicitly provide shipping address fields just in case
            shipping_customer_name: (shipping_details.name || "Customer").split(' ')[0],
            shipping_last_name: (shipping_details.name || "").split(' ').slice(1).join(' ') || 'Customer',
            shipping_address: billingAddress,
            shipping_address_2: "",
            shipping_city: billingCity,
            shipping_pincode: shipping_details.pincode || "400001",
            shipping_country: "India",
            shipping_state: billingState,
            shipping_email: shipping_details.email || "customer@example.com",
            shipping_phone: shipping_details.phone || "9999999999",
            order_items: cart_items.map(item => ({
              name: item.name,
              sku: item.id || item.name,
              units: item.quantity || 1,
              selling_price: item.price || 0,
              discount: 0,
            })),
            payment_method: 'Prepaid',
            sub_total: subtotal || 0,
            length: 20,
            breadth: 15,
            height: 10,
            weight: totalWeight / 1000,
          };

          shipmentResult = await createShipment(shiprocketOrder);

          await adminDb.collection('orders').doc(orderId).update({
            shiprocket_order_id: shipmentResult.order_id,
            shiprocket_shipment_id: shipmentResult.shipment_id,
            status: 'Processing',
          });
        } else {
          console.warn('Shiprocket auto-shipment skipped: No pickup pincode configured');
          await adminDb.collection('orders').doc(orderId).update({
            shipping_note: 'Auto-shipment skipped: No pickup pincode configured in Settings',
          });
        }
      } catch (shipError) {
        console.error('Shiprocket error:', shipError);
        await adminDb.collection('orders').doc(orderId).update({
          shipping_note: `Manual shipping required - Shiprocket API error: ${shipError.message}`,
        });
      }
    } else {
      await adminDb.collection('orders').doc(orderId).update({
        shipping_note: 'International order - Requires manual shipping quote and dispatch',
      });
    }

    res.status(201).json({
      message: 'Order created successfully',
      orderId,
      shipmentResult,
      isInternational: is_international,
    });
  } catch (error) {
    console.error('Error creating order:', error);
    res.status(500).json({ message: 'Error creating order', error: error.message });
  }
}
