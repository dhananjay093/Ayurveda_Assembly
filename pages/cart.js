import { useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import Layout from '../components/Layout';
import { useCart } from '../context/CartContext';

export default function CartPage() {
  const router = useRouter();
  const { items, removeItem, updateQuantity, cartCount, cartTotal, totalWeight } = useCart();
  const [pincode, setPincode] = useState('');
  const [shippingInfo, setShippingInfo] = useState(null);
  const [loadingShipping, setLoadingShipping] = useState(false);

  const checkShipping = async () => {
    if (!pincode || pincode.length !== 6) {
      alert('Please enter a valid 6-digit pincode');
      return;
    }

    setLoadingShipping(true);
    try {
      const response = await fetch('/api/shiprocket/rate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          pincode,
          total_weight_grams: totalWeight || 500,
          dimensions: { length: 20, width: 15, height: 10 },
        }),
      });
      const data = await response.json();
      setShippingInfo(data);
    } catch (error) {
      console.error('Error checking shipping:', error);
      setShippingInfo({ available: true, shippingCost: 49, estimatedDelivery: '5-7 days' });
    }
    setLoadingShipping(false);
  };

  const finalTotal = cartTotal + (shippingInfo?.shippingCost || 0);
  const freeShipping = cartTotal >= 499;

  if (items.length === 0) {
    return (
      <Layout>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <div className="text-8xl mb-6">🛒</div>
            <h1 className="text-2xl font-bold text-gray-800 mb-2">Your cart is empty</h1>
            <p className="text-gray-600 mb-6">Looks like you haven't added any products yet</p>
            <Link href="/products" className="px-8 py-3 bg-emerald-600 text-white rounded-full font-semibold hover:bg-emerald-700 transition-colors">
              Start Shopping
            </Link>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="bg-gray-50 min-h-screen py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">Shopping Cart</h1>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Cart Items */}
            <div className="lg:col-span-2 space-y-4">
              {items.map(item => (
                <div key={item.id} className="bg-white rounded-xl p-6 shadow-sm flex gap-6">
                  {/* Image */}
                  <div className="w-24 h-24 bg-gradient-to-br from-emerald-100 to-emerald-200 rounded-lg flex-shrink-0 flex items-center justify-center">
                    <span className="text-4xl">🌿</span>
                  </div>

                  {/* Details */}
                  <div className="flex-1">
                    <Link href={`/products/${item.id}`} className="font-semibold text-gray-800 hover:text-emerald-600">
                      {item.name}
                    </Link>
                    <p className="text-sm text-gray-500 mt-1">{item.category}</p>
                    
                    <div className="flex items-center justify-between mt-4">
                      {/* Quantity */}
                      <div className="flex items-center border border-gray-200 rounded-lg">
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          className="px-3 py-1 text-gray-600 hover:bg-gray-100"
                        >
                          -
                        </button>
                        <span className="px-3 py-1 font-medium">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          className="px-3 py-1 text-gray-600 hover:bg-gray-100"
                        >
                          +
                        </button>
                      </div>

                      {/* Price */}
                      <div className="text-right">
                        <p className="font-semibold text-gray-900">₹{item.price * item.quantity}</p>
                        {item.quantity > 1 && (
                          <p className="text-sm text-gray-500">₹{item.price} each</p>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Remove */}
                  <button
                    onClick={() => removeItem(item.id)}
                    className="text-gray-400 hover:text-red-500 transition-colors"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              ))}
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-xl p-6 shadow-sm sticky top-24">
                <h2 className="text-xl font-bold text-gray-900 mb-6">Order Summary</h2>

                {/* Pincode Check */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Check Delivery
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Enter Pincode"
                      value={pincode}
                      onChange={(e) => setPincode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                    <button
                      onClick={checkShipping}
                      disabled={loadingShipping}
                      className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 disabled:opacity-50"
                    >
                      {loadingShipping ? '...' : 'Check'}
                    </button>
                  </div>
                  {shippingInfo && (
                    <div className={`mt-2 p-3 rounded-lg ${shippingInfo.available ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                      {shippingInfo.available ? (
                        <>
                          <p className="font-medium">✓ Delivery available!</p>
                          <p className="text-sm">Est. delivery: {shippingInfo.estimatedDelivery}</p>
                        </>
                      ) : (
                        <p>Delivery not available to this pincode</p>
                      )}
                    </div>
                  )}
                </div>

                {/* Price Breakdown */}
                <div className="space-y-3 border-t pt-4">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Subtotal ({cartCount} items)</span>
                    <span className="font-medium">₹{cartTotal}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Shipping</span>
                    {freeShipping ? (
                      <span className="text-emerald-600 font-medium">FREE</span>
                    ) : shippingInfo ? (
                      <span className="font-medium">₹{shippingInfo.shippingCost}</span>
                    ) : (
                      <span className="text-gray-400">Calculate above</span>
                    )}
                  </div>
                  {!freeShipping && cartTotal < 499 && (
                    <p className="text-sm text-emerald-600">
                      Add ₹{499 - cartTotal} more for free shipping!
                    </p>
                  )}
                </div>

                {/* Total */}
                <div className="border-t mt-4 pt-4">
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-bold">Total</span>
                    <span className="text-2xl font-bold text-emerald-600">
                      ₹{freeShipping ? cartTotal : finalTotal}
                    </span>
                  </div>
                </div>

                {/* Checkout Button */}
                <button
                  onClick={() => router.push('/checkout')}
                  className="w-full mt-6 py-4 bg-emerald-600 text-white rounded-lg font-semibold hover:bg-emerald-700 transition-colors"
                >
                  Proceed to Checkout
                </button>

                {/* Continue Shopping */}
                <Link href="/products" className="block text-center mt-4 text-emerald-600 hover:text-emerald-700 font-medium">
                  Continue Shopping
                </Link>

                {/* Trust Badges */}
                <div className="mt-6 pt-6 border-t grid grid-cols-2 gap-4 text-center text-sm">
                  <div>
                    <span className="text-2xl">🔒</span>
                    <p className="text-gray-600 mt-1">Secure Checkout</p>
                  </div>
                  <div>
                    <span className="text-2xl">↩️</span>
                    <p className="text-gray-600 mt-1">Easy Returns</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
