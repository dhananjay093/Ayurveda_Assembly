import { useState } from 'react';
import { useRouter } from 'next/router';
import Layout from '../../components/Layout';
import ProductCard from '../../components/ProductCard';
import { useCart } from '../../context/CartContext';
import { adminDb } from '@/firebase/admin';

export default function ProductPage({ product, relatedProducts }) {
  const router = useRouter();
  const { addItem } = useCart();
  const [quantity, setQuantity] = useState(1);
  const [addedToCart, setAddedToCart] = useState(false);
  const [activeImage, setActiveImage] = useState(0);

  const images = product?.images?.length > 0 ? product.images : (product?.image ? [product.image] : []);

  if (router.isFallback || !product) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="text-6xl mb-4">🔍</div>
            <h1 className="text-2xl font-bold text-gray-800">Product not found</h1>
            <button
              onClick={() => router.push('/products')}
              className="mt-4 px-6 py-2 bg-emerald-600 text-white rounded-full hover:bg-emerald-700"
            >
              Browse Products
            </button>
          </div>
        </div>
      </Layout>
    );
  }

  const discount = Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100);

  const handleAddToCart = () => {
    for (let i = 0; i < quantity; i++) {
      addItem(product);
    }
    setAddedToCart(true);
    setTimeout(() => setAddedToCart(false), 2000);
  };

  return (
    <Layout>
      <div className="bg-white min-h-screen">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Breadcrumb */}
          <nav className="flex items-center space-x-2 text-sm mb-8">
            <button onClick={() => router.push('/')} className="text-gray-500 hover:text-emerald-600">Home</button>
            <span className="text-gray-400">/</span>
            <button onClick={() => router.push('/products')} className="text-gray-500 hover:text-emerald-600">Products</button>
            <span className="text-gray-400">/</span>
            <span className="text-gray-800">{product.name}</span>
          </nav>

          {/* Product Details */}
          <div className="grid md:grid-cols-2 gap-12">
            {/* Image Gallery */}
            <div className="relative flex flex-col gap-4">
              {discount > 0 && (
                <span className="absolute top-4 left-4 bg-red-500 text-white text-sm font-bold px-3 py-1 rounded-full z-10 shadow-sm">
                  {discount}% OFF
                </span>
              )}
              {/* Main Image */}
              <div className="aspect-square bg-gradient-to-br from-emerald-50 to-emerald-100 rounded-3xl flex items-center justify-center overflow-hidden border border-emerald-100/50 relative shadow-sm">
                {images.length > 0 ? (
                  <img src={images[activeImage]} alt={product.name} className="object-cover w-full h-full transition-opacity duration-300" />
                ) : (
                  <div className="w-3/4 h-3/4 bg-emerald-100/50 rounded-2xl flex items-center justify-center">
                    <span className="text-9xl text-emerald-600/40">🌿</span>
                  </div>
                )}
              </div>

              {/* Thumbnails */}
              {images.length > 1 && (
                <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide py-1">
                  {images.map((img, idx) => (
                    <button
                      key={idx}
                      onClick={() => setActiveImage(idx)}
                      className={`relative w-20 h-20 rounded-xl overflow-hidden flex-shrink-0 border-2 transition-all duration-200 ${activeImage === idx ? 'border-emerald-600 shadow-md transform scale-100' : 'border-transparent opacity-60 hover:opacity-100 hover:scale-95'}`}
                    >
                      <img src={img} alt={`${product.name} thumbnail ${idx + 1}`} className="object-cover w-full h-full" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Info */}
            <div>
              <span className="text-sm text-emerald-600 font-medium uppercase tracking-wide">
                {product.category}
              </span>
              <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mt-2">
                {product.name}
              </h1>

              {/* Rating */}
              <div className="flex items-center mt-4 space-x-2">
                <div className="flex items-center">
                  {[...Array(5)].map((_, i) => (
                    <svg
                      key={i}
                      className={`w-5 h-5 ${i < Math.floor(product.rating || 4.5) ? 'text-amber-400' : 'text-gray-200'}`}
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
                <span className="text-gray-600">{product.rating || 4.5} ({product.reviews || 0} reviews)</span>
              </div>

              {/* Price */}
              <div className="mt-6 flex items-baseline space-x-3">
                <span className="text-4xl font-bold text-gray-900">₹{product.price}</span>
                {product.originalPrice > product.price && (
                  <>
                    <span className="text-xl text-gray-400 line-through">₹{product.originalPrice}</span>
                    <span className="text-emerald-600 font-semibold">Save ₹{product.originalPrice - product.price}</span>
                  </>
                )}
              </div>

              {/* Description */}
              <p className="mt-6 text-gray-600 leading-relaxed">
                {product.description}
              </p>

              {/* Concerns */}
              {product.concern && product.concern.length > 0 && (
                <div className="mt-6">
                  <p className="text-sm font-medium text-gray-700 mb-2">Good for:</p>
                  <div className="flex flex-wrap gap-2">
                    {product.concern.map(c => (
                      <span key={c} className="px-3 py-1 bg-emerald-100 text-emerald-700 rounded-full text-sm">
                        {c}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Quantity & Add to Cart */}
              <div className="mt-8 flex items-center space-x-4">
                <div className="flex items-center border border-gray-300 rounded-lg">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="px-4 py-3 text-gray-600 hover:bg-gray-100"
                  >
                    -
                  </button>
                  <span className="px-4 py-3 font-medium">{quantity}</span>
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    className="px-4 py-3 text-gray-600 hover:bg-gray-100"
                  >
                    +
                  </button>
                </div>
                <button
                  onClick={handleAddToCart}
                  className={`flex-1 py-4 rounded-lg font-semibold transition-all ${addedToCart
                    ? 'bg-green-500 text-white'
                    : 'bg-emerald-600 text-white hover:bg-emerald-700'
                    }`}
                >
                  {addedToCart ? '✓ Added to Cart!' : 'Add to Cart'}
                </button>
              </div>

              {/* Features */}
              <div className="mt-8 grid grid-cols-2 gap-4">
                <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                  <span className="text-2xl">🚚</span>
                  <div>
                    <p className="font-medium text-gray-800">Free Shipping</p>
                    <p className="text-sm text-gray-500">On orders above ₹499</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                  <span className="text-2xl">↩️</span>
                  <div>
                    <p className="font-medium text-gray-800">Easy Returns</p>
                    <p className="text-sm text-gray-500">30-day return policy</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                  <span className="text-2xl">🌿</span>
                  <div>
                    <p className="font-medium text-gray-800">100% Natural</p>
                    <p className="text-sm text-gray-500">No side effects</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                  <span className="text-2xl">✓</span>
                  <div>
                    <p className="font-medium text-gray-800">Lab Tested</p>
                    <p className="text-sm text-gray-500">Quality assured</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Related Products */}
          {relatedProducts && relatedProducts.length > 0 && (
            <div className="mt-16">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">You May Also Like</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {relatedProducts.map(p => (
                  <ProductCard key={p.id} product={p} />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}

export async function getServerSideProps(context) {
  const { id } = context.params;

  try {
    const docRef = adminDb.collection('products').doc(id);
    const docSnap = await docRef.get();

    if (!docSnap.exists) {
      return { notFound: true };
    }

    const data = docSnap.data();
    if (data.createdAt) data.createdAt = typeof data.createdAt.toDate === 'function' ? data.createdAt.toDate().toISOString() : new Date(data.createdAt).toISOString();
    const product = { id: docSnap.id, ...data };

    // Fetch related products (same category)
    const relatedSnap = await adminDb.collection('products')
      .where('category', '==', product.category)
      .limit(5)
      .get();

    const relatedProducts = [];
    relatedSnap.forEach(doc => {
      if (doc.id !== product.id) {
        const rData = doc.data();
        if (rData.createdAt) rData.createdAt = typeof rData.createdAt.toDate === 'function' ? rData.createdAt.toDate().toISOString() : new Date(rData.createdAt).toISOString();
        relatedProducts.push({ id: doc.id, ...rData });
      }
    });

    return {
      props: {
        product,
        relatedProducts: relatedProducts.slice(0, 4)
      },
    };
  } catch (error) {
    console.error("Error fetching product:", error);
    return { notFound: true };
  }
}
