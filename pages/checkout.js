import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Script from 'next/script';
import Layout from '../components/Layout';
import { useCart } from '../context/CartContext';

export default function CheckoutPage() {
  const router = useRouter();
  const { items, cartTotal, totalWeight, clearCart } = useCart();
  const [loading, setLoading] = useState(false);
  const [shippingCost, setShippingCost] = useState(0);
  const [intlShippingRate, setIntlShippingRate] = useState(1500); // Default placeholder

  // Coupon state
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState(null); // { code, type, value, discountAmount }
  const [couponError, setCouponError] = useState('');
  const [couponLoading, setCouponLoading] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    pincode: '',
    country: 'IN', // Default to India
  });

  const isInternational = formData.country !== 'IN';
  const freeShipping = !isInternational && cartTotal >= 499;
  const shippingToAdd = isInternational ? intlShippingRate : (freeShipping ? 0 : shippingCost);
  const discount = appliedCoupon ? appliedCoupon.discountAmount : 0;
  const finalTotal = cartTotal + shippingToAdd - discount;

  // Fetch Site Settings for International Rate on mount
  useEffect(() => {
    async function fetchSettings() {
      try {
        const res = await fetch('/api/settings');
        if (res.ok) {
          const data = await res.json();
          if (data?.internationalShippingRate) {
            setIntlShippingRate(data.internationalShippingRate);
          }
        }
      } catch (e) {
        console.error("Failed to fetch settings", e);
      }
    }
    fetchSettings();
  }, []);

  useEffect(() => {
    if (!isInternational && formData.pincode.length >= 6) {
      fetchShippingCost();
    } else if (isInternational) {
      setShippingCost(0); // Explicitly zero out domestic shipping cost state
    }
  }, [formData.pincode, isInternational]);

  const fetchShippingCost = async () => {
    try {
      const response = await fetch('/api/shiprocket/rate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          pincode: formData.pincode,
          total_weight_grams: totalWeight || 500,
          dimensions: { length: 20, width: 15, height: 10 },
        }),
      });
      const data = await response.json();
      if (data.available) {
        setShippingCost(data.shippingCost);
      }
    } catch (error) {
      console.error('Error fetching shipping:', error);
      setShippingCost(49);
    }
  };

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) return;
    setCouponError('');
    setCouponLoading(true);
    try {
      const res = await fetch('/api/coupons/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: couponCode, orderTotal: cartTotal }),
      });
      const data = await res.json();
      if (res.ok && data.valid) {
        setAppliedCoupon({ ...data.coupon, discountAmount: data.discountAmount });
        setCouponError('');
      } else {
        setCouponError(data.message || 'Invalid coupon code');
        setAppliedCoupon(null);
      }
    } catch (e) {
      setCouponError('Failed to validate coupon. Please try again.');
    }
    setCouponLoading(false);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const validateForm = () => {
    const required = ['name', 'phone', 'address', 'city', 'country'];
    // State and pincode validation constraints relaxed for international
    if (!isInternational && !formData.state) required.push('state');
    if (!isInternational && !formData.pincode) required.push('pincode');

    for (const field of required) {
      if (!formData[field]) {
        alert(`Please fill in ${field}`);
        return false;
      }
    }

    // Looser length checks for international phones/zips
    if (!isInternational && formData.phone.length !== 10) {
      alert('Please enter a valid 10-digit phone number');
      return false;
    }
    if (!isInternational && formData.pincode.length !== 6) {
      alert('Please enter a valid 6-digit pincode');
      return false;
    }
    return true;
  };

  const handlePayment = async () => {
    if (!validateForm()) return;
    if (items.length === 0) {
      alert('Your cart is empty');
      return;
    }

    setLoading(true);

    if (isInternational) {
      // 🌏 INTERNATIONAL FLOW: Bypass Razorpay & Shiprocket -> Send as Pending
      try {
        const createOrderResponse = await fetch('/api/orders/create', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            shipping_details: formData,
            cart_items: items,
            subtotal: cartTotal,
            shipping_cost: intlShippingRate,
            total: finalTotal,
            is_international: true
          }),
        });

        const result = await createOrderResponse.json();

        if (createOrderResponse.ok) {
          clearCart();
          router.push(`/order-success?orderId=${result.orderId}&intl=true`);
        } else {
          alert('Order creation failed. Please contact support.');
        }
      } catch (error) {
        console.error('Error creating international order:', error);
        alert('Something went wrong. Please contact support.');
      }
    } else {
      // 🇮🇳 DOMESTIC FLOW: Shiprocket -> Razorpay
      try {
        const orderResponse = await fetch('/api/razorpay/order', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ cart_total: finalTotal }),
        });
        const orderData = await orderResponse.json();

        if (!orderData.orderId) {
          throw new Error('Failed to create order');
        }

        const options = {
          key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
          amount: orderData.amount,
          currency: orderData.currency,
          name: 'Ayurveda Assembly',
          description: 'Order Payment',
          order_id: orderData.orderId,
          handler: async function (response) {
            try {
              const createOrderResponse = await fetch('/api/orders/create', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  razorpay_order_id: response.razorpay_order_id,
                  razorpay_payment_id: response.razorpay_payment_id,
                  razorpay_signature: response.razorpay_signature,
                  shipping_details: formData,
                  cart_items: items,
                  subtotal: cartTotal,
                  shipping_cost: freeShipping ? 0 : shippingCost,
                  total: finalTotal,
                  is_international: false
                }),
              });

              const result = await createOrderResponse.json();

              if (createOrderResponse.ok) {
                clearCart();
                router.push(`/order-success?orderId=${result.orderId}`);
              } else {
                alert('Order creation failed. Please contact support.');
              }
            } catch (error) {
              console.error('Error creating order:', error);
              alert('Something went wrong. Please contact support.');
            }
          },
          prefill: {
            name: formData.name,
            email: formData.email,
            contact: formData.phone,
          },
          theme: {
            color: '#059669',
          },
        };

        const rzp = new window.Razorpay(options);
        rzp.open();
      } catch (error) {
        console.error('Payment error:', error);
        alert('Failed to initiate payment. Please try again.');
      }
    }
    setLoading(false);
  };

  if (items.length === 0) {
    return (
      <Layout>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-800 mb-4">No items to checkout</h1>
            <button
              onClick={() => router.push('/products')}
              className="px-6 py-3 bg-emerald-600 text-white rounded-full hover:bg-emerald-700"
            >
              Continue Shopping
            </button>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <Script src="https://checkout.razorpay.com/v1/checkout.js" />

      <div className="bg-gray-50 min-h-screen py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">Checkout</h1>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Shipping Form */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-xl p-6 shadow-sm">
                <h2 className="text-xl font-bold text-gray-900 mb-6">Shipping Address</h2>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Country *</label>
                    <select
                      name="country"
                      value={formData.country}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
                    >
                      <option value="IN">India</option>
                      <option value="US">United States</option>
                      <option value="UK">United Kingdom</option>
                      <option value="AE">United Arab Emirates</option>
                      <option value="OTHER">Other International</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Full Name *</label>
                    <input
                      type="text" name="name" value={formData.name} onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500" placeholder="Enter your full name"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number *</label>
                    <input
                      type="tel" name="phone" value={formData.phone} onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      placeholder={isInternational ? "+CountryCode..." : "10-digit mobile number"}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email (Optional)</label>
                    <input
                      type="email" name="email" value={formData.email} onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500" placeholder="For order updates"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Address *</label>
                    <textarea
                      name="address" value={formData.address} onChange={handleInputChange} rows={3}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      placeholder="House/Flat No., Building, Street, Landmark"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">City *</label>
                    <input
                      type="text" name="city" value={formData.city} onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500" placeholder="City"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">{isInternational ? 'State/Province' : 'State *'}</label>
                    <input
                      type="text" name="state" value={formData.state} onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500" placeholder="State"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">{isInternational ? 'Zip/Postal Code' : 'Pincode *'}</label>
                    <input
                      type="text" name="pincode" value={formData.pincode} onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500" placeholder={isInternational ? "Zip code" : "6-digit pincode"}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-xl p-6 shadow-sm sticky top-24">
                <h2 className="text-xl font-bold text-gray-900 mb-4">Order Summary</h2>

                {/* Items */}
                <div className="space-y-3 max-h-60 overflow-y-auto">
                  {items.map(item => (
                    <div key={item.id} className="flex justify-between items-center">
                      <div className="flex items-center space-x-3">
                        <div className="w-12 h-12 bg-emerald-100 rounded-lg flex items-center justify-center text-xl">🌿</div>
                        <div>
                          <p className="font-medium text-sm max-w-[150px] truncate" title={item.name}>{item.name}</p>
                          <p className="text-gray-500 text-xs">Qty: {item.quantity}</p>
                        </div>
                      </div>
                      <p className="font-medium">₹{item.price * item.quantity}</p>
                    </div>
                  ))}
                </div>

                {/* Price Breakdown */}
                <div className="border-t mt-4 pt-4 space-y-2">
                  <div className="flex justify-between text-gray-600">
                    <span>Subtotal</span>
                    <span>₹{cartTotal}</span>
                  </div>
                  <div className="flex justify-between text-gray-600">
                    <span>Shipping {isInternational && '(Intl Flate Rate)'}</span>
                    {!isInternational && freeShipping ? (
                      <span className="text-emerald-600">FREE</span>
                    ) : (
                      <span>₹{isInternational ? intlShippingRate : shippingCost}</span>
                    )}
                  </div>
                  {appliedCoupon && (
                    <div className="flex justify-between text-emerald-600 font-medium">
                      <span className="flex items-center gap-1">
                        🎉 Coupon ({appliedCoupon.code})
                        <button onClick={() => { setAppliedCoupon(null); setCouponCode(''); }} className="text-gray-400 hover:text-red-500 ml-1 text-xs">✕</button>
                      </span>
                      <span>-₹{appliedCoupon.discountAmount}</span>
                    </div>
                  )}
                </div>

                {/* Coupon Code Input */}
                <div className="border-t mt-4 pt-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Have a coupon code?</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={couponCode}
                      onChange={e => { setCouponCode(e.target.value.toUpperCase()); if (appliedCoupon) setAppliedCoupon(null); setCouponError(''); }}
                      placeholder="Enter code"
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm font-mono font-bold tracking-widest uppercase focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                    />
                    <button
                      type="button"
                      onClick={handleApplyCoupon}
                      disabled={couponLoading || !couponCode.trim() || !!appliedCoupon}
                      className="px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm font-semibold hover:bg-emerald-700 disabled:opacity-50 transition-colors"
                    >
                      {couponLoading ? '...' : appliedCoupon ? '✓' : 'Apply'}
                    </button>
                  </div>
                  {couponError && <p className="text-red-500 text-xs mt-1">{couponError}</p>}
                  {appliedCoupon && <p className="text-emerald-600 text-xs mt-1 font-medium">✓ Coupon applied! You save ₹{appliedCoupon.discountAmount}</p>}
                </div>

                {/* Total */}
                <div className="border-t mt-4 pt-4">
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-bold">Total</span>
                    <span className="text-2xl font-bold text-emerald-600">₹{finalTotal}</span>
                  </div>
                </div>

                {/* Info block for International */}
                {isInternational && (
                  <div className="mt-4 p-3 bg-amber-50 text-amber-800 text-sm rounded-lg border border-amber-200">
                    <strong>Note:</strong> International orders are manually reviewed. You will not be charged immediately. We will contact you to confirm shipping dispatch and final payment securely online.
                  </div>
                )}

                {/* Pay Button */}
                <button
                  onClick={handlePayment}
                  disabled={loading}
                  className="w-full mt-6 py-4 bg-emerald-600 text-white rounded-lg font-semibold hover:bg-emerald-700 transition-colors disabled:opacity-50"
                >
                  {loading ? 'Processing...' : (isInternational ? 'Submit Order for Review' : `Pay ₹${finalTotal}`)}
                </button>

                {/* Security Note */}
                {!isInternational && (
                  <p className="mt-4 text-center text-sm text-gray-500 flex items-center justify-center">
                    <span className="mr-2">🔒</span>
                    Secured by Razorpay
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
