import Layout from '../components/Layout';
import ProductCard from '../components/ProductCard';
import Link from 'next/link';
import { adminDb } from '@/firebase/admin';

const categories = [
  { name: 'Powders', image: '🥣', count: 12 },
  { name: 'Capsules', image: '💊', count: 24 },
  { name: 'Syrups', image: '🍯', count: 8 },
  { name: 'Oils', image: '🫒', count: 15 },
];

export default function Home({ topProducts, concerns }) {
  const featuredProducts = topProducts.filter(p => p.featured);

  return (
    <Layout>
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-emerald-50 via-white to-amber-50 overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-10 w-72 h-72 bg-emerald-400 rounded-full blur-3xl"></div>
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-amber-400 rounded-full blur-3xl"></div>
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24 relative">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <span className="inline-block px-4 py-2 bg-emerald-100 text-emerald-700 rounded-full text-sm font-medium mb-6">
                🌿 100% Natural & Ayurvedic
              </span>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 leading-tight">
                Ancient Wisdom for <span className="text-emerald-600">Modern Wellness</span>
              </h1>
              <p className="mt-6 text-lg text-gray-600 leading-relaxed">
                Discover the power of Ayurveda with our carefully crafted herbal supplements.
                Backed by 5000 years of tradition and modern science.
              </p>
              <div className="mt-8 flex flex-wrap gap-4">
                <Link href="/products" className="px-8 py-4 bg-emerald-600 text-white rounded-full font-semibold hover:bg-emerald-700 transition-colors shadow-lg shadow-emerald-200">
                  Shop Now
                </Link>
                <Link href="/about" className="px-8 py-4 border-2 border-emerald-600 text-emerald-600 rounded-full font-semibold hover:bg-emerald-50 transition-colors">
                  Learn More
                </Link>
              </div>
              <div className="mt-10 flex items-center space-x-8">
                <div className="text-center">
                  <p className="text-3xl font-bold text-gray-900">50+</p>
                  <p className="text-sm text-gray-500">Products</p>
                </div>
                <div className="w-px h-12 bg-gray-200"></div>
                <div className="text-center">
                  <p className="text-3xl font-bold text-gray-900">10K+</p>
                  <p className="text-sm text-gray-500">Happy Customers</p>
                </div>
                <div className="w-px h-12 bg-gray-200"></div>
                <div className="text-center">
                  <p className="text-3xl font-bold text-gray-900">4.8</p>
                  <p className="text-sm text-gray-500">Average Rating</p>
                </div>
              </div>
            </div>
            <div className="relative">
              <div className="aspect-square bg-gradient-to-br from-emerald-200 to-amber-200 rounded-3xl flex items-center justify-center shadow-2xl">
                <div className="text-center p-8">
                  <span className="text-8xl">🌿</span>
                  <p className="mt-4 text-emerald-800 font-medium">Premium Ayurvedic Products</p>
                </div>
              </div>
              <div className="absolute -bottom-6 -left-6 bg-white p-4 rounded-2xl shadow-xl">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center">
                    <span className="text-2xl">🚚</span>
                  </div>
                  <div>
                    <p className="font-semibold text-gray-800">Free Shipping</p>
                    <p className="text-sm text-gray-500">On orders above ₹499</p>
                  </div>
                </div>
              </div>
              <div className="absolute -top-4 -right-4 bg-white p-4 rounded-2xl shadow-xl">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center">
                    <span className="text-2xl">✓</span>
                  </div>
                  <div>
                    <p className="font-semibold text-gray-800">100% Natural</p>
                    <p className="text-sm text-gray-500">No side effects</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Shop by Concern */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900">Shop by Concern</h2>
            <p className="mt-4 text-gray-600">Find the perfect solution for your wellness needs</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {concerns.map((concern) => (
              <Link
                key={concern.slug}
                href={`/concern/${concern.slug}`}
                className="group p-6 bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl hover:shadow-lg transition-all duration-300 text-center"
              >
                <div className={`w-16 h-16 mx-auto mb-4 bg-gradient-to-br ${concern.color} rounded-2xl flex items-center justify-center text-3xl shadow-lg group-hover:scale-110 transition-transform`}>
                  {concern.icon}
                </div>
                <h3 className="font-semibold text-gray-800 group-hover:text-emerald-600 transition-colors">
                  {concern.name}
                </h3>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-16 bg-gradient-to-b from-white to-emerald-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center mb-12">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900">Bestsellers</h2>
              <p className="mt-2 text-gray-600">Most loved by our customers</p>
            </div>
            <Link href="/products" className="hidden md:flex items-center text-emerald-600 font-semibold hover:text-emerald-700 transition-colors">
              View All
              <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
          <div className="mt-8 text-center md:hidden">
            <Link href="/products" className="inline-flex items-center text-emerald-600 font-semibold">
              View All Products
              <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </Link>
          </div>
        </div>
      </section>

      {/* Shop by Category */}
      <section className="py-16 bg-emerald-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900">Shop by Category</h2>
            <p className="mt-4 text-gray-600">Browse our wide range of product formats</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {categories.map((category) => (
              <Link
                key={category.name}
                href={`/category/${category.name.toLowerCase()}`}
                className="group bg-white rounded-2xl p-8 text-center hover:shadow-xl transition-all duration-300"
              >
                <div className="text-6xl mb-4 group-hover:scale-110 transition-transform">
                  {category.image}
                </div>
                <h3 className="text-xl font-semibold text-gray-800 group-hover:text-emerald-600 transition-colors">
                  {category.name}
                </h3>
                <p className="mt-1 text-gray-500">{category.count} products</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900">Why Choose Ayurveda Assembly?</h2>
            <p className="mt-4 text-gray-600">We&apos;re committed to your wellness journey</p>
          </div>
          <div className="grid md:grid-cols-4 gap-8">
            <div className="text-center p-6">
              <div className="w-20 h-20 mx-auto mb-6 bg-emerald-100 rounded-full flex items-center justify-center">
                <span className="text-4xl">🌿</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">100% Natural</h3>
              <p className="text-gray-600">All our products are made from pure, natural ingredients with no synthetic additives.</p>
            </div>
            <div className="text-center p-6">
              <div className="w-20 h-20 mx-auto mb-6 bg-amber-100 rounded-full flex items-center justify-center">
                <span className="text-4xl">🔬</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">Lab Tested</h3>
              <p className="text-gray-600">Every batch is rigorously tested for purity, potency, and safety.</p>
            </div>
            <div className="text-center p-6">
              <div className="w-20 h-20 mx-auto mb-6 bg-blue-100 rounded-full flex items-center justify-center">
                <span className="text-4xl">📜</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">GMP Certified</h3>
              <p className="text-gray-600">Manufactured in GMP-certified facilities following strict quality standards.</p>
            </div>
            <div className="text-center p-6">
              <div className="w-20 h-20 mx-auto mb-6 bg-purple-100 rounded-full flex items-center justify-center">
                <span className="text-4xl">💯</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">Satisfaction Guaranteed</h3>
              <p className="text-gray-600">Not happy? We offer hassle-free returns within 30 days.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-16 bg-gradient-to-br from-emerald-600 to-emerald-800 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold">What Our Customers Say</h2>
            <p className="mt-4 text-emerald-200">Real experiences from real people</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                name: "Priya Sharma",
                location: "Mumbai",
                text: "The Ashwagandha powder has been a game changer for my stress levels. I sleep better and feel more energized!",
                rating: 5
              },
              {
                name: "Rajesh Kumar",
                location: "Delhi",
                text: "Best quality Ayurvedic products I've found. The Triphala has improved my digestion significantly.",
                rating: 5
              },
              {
                name: "Anita Patel",
                location: "Bangalore",
                text: "Love the Chyawanprash! My whole family takes it daily and we've noticed fewer seasonal illnesses.",
                rating: 5
              }
            ].map((testimonial, index) => (
              <div key={index} className="bg-white/10 backdrop-blur-sm rounded-2xl p-6">
                <div className="flex items-center mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <svg key={i} className="w-5 h-5 text-amber-400" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
                <p className="text-emerald-100 mb-4">"{testimonial.text}"</p>
                <div>
                  <p className="font-semibold">{testimonial.name}</p>
                  <p className="text-emerald-300 text-sm">{testimonial.location}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-amber-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Start Your Wellness Journey Today
          </h2>
          <p className="text-lg text-gray-600 mb-8">
            Join thousands of happy customers who have transformed their health with Ayurveda Assembly
          </p>
          <Link href="/products" className="inline-block px-8 py-4 bg-emerald-600 text-white rounded-full font-semibold hover:bg-emerald-700 transition-colors shadow-lg">
            Explore All Products
          </Link>
        </div>
      </section>
    </Layout>
  );
}

export async function getServerSideProps() {
  try {
    // Fetch Products
    const productSnapshot = await adminDb.collection('products').where('featured', '==', true).limit(8).get();
    const topProducts = [];
    productSnapshot.forEach(doc => {
      const data = doc.data();
      if (data.createdAt) {
        data.createdAt = typeof data.createdAt.toDate === 'function' ? data.createdAt.toDate().toISOString() : new Date(data.createdAt).toISOString();
      }
      topProducts.push({ id: doc.id, ...data });
    });

    // Fetch Concerns
    const concernSnapshot = await adminDb.collection('concerns').orderBy('name', 'asc').get();
    let concerns = [];
    concernSnapshot.forEach(doc => {
      concerns.push({ id: doc.id, ...doc.data() });
    });

    // Fallback if no concerns in DB
    if (concerns.length === 0) {
      concerns = [
        { name: 'Immunity', icon: '🛡️', color: 'from-blue-400 to-blue-600', slug: 'immunity' },
        { name: 'Digestion', icon: '🌱', color: 'from-green-400 to-green-600', slug: 'digestion' },
        { name: 'Stress & Anxiety', icon: '🧘', color: 'from-purple-400 to-purple-600', slug: 'stress-anxiety' },
        { name: 'Skin Health', icon: '✨', color: 'from-pink-400 to-pink-600', slug: 'skin-health' },
        { name: 'Energy', icon: '⚡', color: 'from-amber-400 to-amber-600', slug: 'energy' },
        { name: 'Sleep', icon: '🌙', color: 'from-indigo-400 to-indigo-600', slug: 'sleep' },
      ];
    }

    return {
      props: { topProducts, concerns },
    };
  } catch (error) {
    console.error("Error fetching Homepage Data:", error);
    return {
      props: { topProducts: [], concerns: [] },
    };
  }
}
