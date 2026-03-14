import { adminDb } from '@/firebase/admin';
import { createShipment } from '@/lib/shiprocket';

export default async function handler(req, res) {
    const adminPassword = req.headers['x-admin-password'];
    if (adminPassword !== process.env.ADMIN_PASSWORD) {
        return res.status(401).json({ message: 'Unauthorized' });
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Method not allowed' });
    }

    try {
        const { orderId } = req.body;
        if (!orderId) return res.status(400).json({ message: 'Order ID is required' });

        const orderRef = adminDb.collection('orders').doc(orderId);
        const orderSnap = await orderRef.get();

        if (!orderSnap.exists) return res.status(404).json({ message: 'Order not found' });
        const order = orderSnap.data();

        if (order.shiprocket_order_id) {
            return res.status(400).json({ message: 'Shipment already created for this order' });
        }

        // Fetch settings for pickup pincode and location name
        const settingsSnap = await adminDb.collection('settings').doc('siteSettings').get();
        const settings = settingsSnap.exists ? settingsSnap.data() : {};
        const pickupPincode = settings.pickupPincode;
        const pickupLocation = settings.pickupLocationNickname || "Primary";

        if (!pickupPincode) {
            return res.status(400).json({ message: 'Please configure Pickup Pincode in Settings first' });
        }

        // Map order data to Shiprocket format
        const shippingDetails = order.shipping_details || {};

        // Robust address parsing
        const billingAddress = shippingDetails.address || "";
        const billingCity = shippingDetails.city || (billingAddress.split(',').pop()?.trim() || "Unknown");
        const billingState = shippingDetails.state || "India";

        const shiprocketOrder = {
            order_id: orderId,
            order_date: new Date(order.created_at || new Date()).toISOString().split('T')[0],
            pickup_location: pickupLocation,
            billing_customer_name: (shippingDetails.name || "Customer").split(' ')[0],
            billing_last_name: (shippingDetails.name || "").split(' ').slice(1).join(' ') || 'Customer',
            billing_address: billingAddress,
            billing_address_2: "",
            billing_city: billingCity,
            billing_pincode: shippingDetails.pincode || "400001",
            billing_state: billingState,
            billing_country: "India",
            billing_email: shippingDetails.email || "customer@example.com",
            billing_phone: shippingDetails.phone || "9999999999",
            shipping_is_billing: true,
            // Explicitly provide shipping address fields just in case
            shipping_customer_name: (shippingDetails.name || "Customer").split(' ')[0],
            shipping_last_name: (shippingDetails.name || "").split(' ').slice(1).join(' ') || 'Customer',
            shipping_address: billingAddress,
            shipping_address_2: "",
            shipping_city: billingCity,
            shipping_pincode: shippingDetails.pincode || "400001",
            shipping_country: "India",
            shipping_state: billingState,
            shipping_email: shippingDetails.email || "customer@example.com",
            shipping_phone: shippingDetails.phone || "9999999999",
            order_items: (order.cart_items || []).map(item => ({
                name: item.name,
                sku: item.id || item.name,
                units: item.quantity || 1,
                selling_price: item.price || 0,
                discount: 0
            })),
            payment_method: order.payment_status === 'Paid' ? "Prepaid" : "COD",
            sub_total: order.subtotal || 0,
            length: 20,
            breadth: 15,
            height: 10,
            weight: ((order.cart_items || []).reduce((acc, item) => acc + (item.weight || 500) * (item.quantity || 1), 0)) / 1000
        };

        const result = await createShipment(shiprocketOrder);

        if (result && result.order_id) {
            await orderRef.update({
                shiprocket_order_id: result.order_id,
                shiprocket_shipment_id: result.shipment_id,
                status: 'Processing',
                updatedAt: new Date().toISOString()
            });
            res.status(200).json({ message: 'Shipment created successfully', result });
        } else {
            console.error('Shiprocket Failure Body:', result);
            res.status(400).json({
                message: 'Shiprocket API failed to create order',
                details: result.message || result.errors || result
            });
        }

    } catch (e) {
        console.error('Shiprocket error:', e);
        res.status(500).json({ message: `Shiprocket Error: ${e.message}` });
    }
}
