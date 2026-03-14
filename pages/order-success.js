import { useRouter } from 'next/router';
import Link from 'next/link';
import Layout from '../components/Layout';

export default function OrderSuccessPage() {
  const router = useRouter();
  const { orderId, intl } = router.query;
  const isInternational = intl === 'true';

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-b from-emerald-50 to-white flex items-center justify-center py-16">
        <div className="max-w-md w-full mx-auto text-center px-4">
          {/* Success Animation */}
          <div className="w-24 h-24 mx-auto mb-6 bg-emerald-100 rounded-full flex items-center justify-center">
            {isInternational ? (
              <span className="text-4xl">🌍</span>
            ) : (
              <svg className="w-12 h-12 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            )}
          </div>

          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {isInternational ? 'Order Received for Review!' : 'Order Placed Successfully!'}
          </h1>
          <p className="text-gray-600 mb-6 font-medium">
            Thank you for shopping with Ayurveda Assembly.
          </p>

          {orderId && (
            <div className="bg-white rounded-lg p-4 mb-6 shadow-sm border border-gray-100">
              <p className="text-sm text-gray-500">Order ID</p>
              <p className="text-lg font-mono font-bold text-gray-900">{orderId}</p>
            </div>
          )}

          {isInternational ? (
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-5 mb-8 text-left text-sm text-amber-900 shadow-sm">
              <h3 className="font-bold text-amber-900 mb-2 flex items-center">
                <span className="mr-2">ℹ️</span> Next Steps for International Orders
              </h3>
              <ul className="list-disc pl-5 space-y-1">
                <li>Your order is currently pending manual review.</li>
                <li>Our team will calculate precise international shipping costs based on your selected country.</li>
                <li>We will contact you via email shortly with a secure payment link containing the final amount.</li>
                <li>Your items will be dispatched once payment is confirmed.</li>
              </ul>
            </div>
          ) : (
            <div className="bg-emerald-50 rounded-lg p-4 mb-8">
              <p className="text-emerald-700 font-medium">
                📧 You will receive an order confirmation and shipping updates via SMS/Email.
              </p>
            </div>
          )}

          <div className="space-y-3 mt-4">
            <Link href="/products" className="block w-full py-3 bg-emerald-600 text-white rounded-lg font-semibold hover:bg-emerald-700 transition-colors shadow-md">
              Continue Shopping
            </Link>
            <Link href="/" className="block w-full py-3 border-2 border-emerald-600 text-emerald-600 rounded-lg font-semibold hover:bg-emerald-50 transition-colors">
              Back to Home
            </Link>
          </div>
        </div>
      </div>
    </Layout>
  );
}
