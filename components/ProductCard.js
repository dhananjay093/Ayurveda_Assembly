import Link from 'next/link';
import Image from 'next/image';

export default function ProductCard({ product }) {
  const discount = Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100);

  return (
    <Link href={`/products/${product.id}`} className="group">
      <div className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100">
        {/* Image Container */}
        <div className="relative aspect-square bg-gradient-to-br from-emerald-50 to-amber-50 overflow-hidden">
          {discount > 0 && (
            <span className="absolute top-3 left-3 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full z-10">
              {discount}% OFF
            </span>
          )}
          <div className="w-full h-full flex items-center justify-center p-6 group-hover:scale-105 transition-transform duration-300">
            {product.images?.[0] || product.image ? (
              <img src={product.images?.[0] || product.image} alt={product.name} className="object-cover w-full h-full rounded-xl" />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-emerald-100 to-emerald-200 rounded-xl flex items-center justify-center">
                <span className="text-emerald-600 text-4xl">🌿</span>
              </div>
            )}
          </div>
          {/* Quick Add Button */}
          <button className="absolute bottom-3 left-1/2 transform -translate-x-1/2 translate-y-full opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300 bg-emerald-600 text-white px-6 py-2 rounded-full font-medium hover:bg-emerald-700">
            Quick Add
          </button>
        </div>

        {/* Content */}
        <div className="p-4">
          {/* Category Tag */}
          <span className="text-xs text-emerald-600 font-medium uppercase tracking-wide">
            {product.category}
          </span>

          {/* Product Name */}
          <h3 className="mt-1 font-semibold text-gray-800 group-hover:text-emerald-600 transition-colors line-clamp-2">
            {product.name}
          </h3>

          {/* Rating */}
          <div className="flex items-center mt-2 space-x-1">
            <div className="flex items-center">
              {[...Array(5)].map((_, i) => (
                <svg
                  key={i}
                  className={`w-4 h-4 ${i < Math.floor(product.rating) ? 'text-amber-400' : 'text-gray-200'}`}
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
              ))}
            </div>
            <span className="text-sm text-gray-500">({product.reviews})</span>
          </div>

          {/* Price */}
          <div className="mt-3 flex items-center space-x-2">
            <span className="text-xl font-bold text-gray-900">₹{product.price}</span>
            {product.originalPrice > product.price && (
              <span className="text-sm text-gray-400 line-through">₹{product.originalPrice}</span>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}
