import Layout from '../components/Layout';

export default function AboutPage() {
  return (
    <Layout>
      {/* Hero */}
      <section className="bg-gradient-to-br from-emerald-700 to-emerald-900 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">About Ayurveda Assembly</h1>
          <p className="text-xl text-emerald-200 max-w-2xl mx-auto">
            Bridging ancient Ayurvedic wisdom with modern wellness needs
          </p>
        </div>
      </section>

      {/* Story */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-6">Our Story</h2>
              <p className="text-gray-600 mb-4 leading-relaxed">
                Ayurveda Assembly was born from a simple belief: that the ancient wisdom of Ayurveda
                holds the key to modern wellness challenges. Founded in 2024, we set out to make
                authentic Ayurvedic products accessible to everyone.
              </p>
              <p className="text-gray-600 mb-4 leading-relaxed">
                Our team of Ayurvedic practitioners, herbalists, and wellness experts work together
                to create products that honor traditional formulations while meeting modern quality
                standards.
              </p>
              <p className="text-gray-600 leading-relaxed">
                Every product we offer is carefully crafted using the finest natural ingredients,
                sourced directly from trusted farmers and suppliers across India.
              </p>
            </div>
            <div className="bg-gradient-to-br from-emerald-100 to-amber-100 rounded-3xl p-12 text-center">
              <span className="text-8xl">🌿</span>
              <p className="mt-4 text-emerald-800 font-medium">Rooted in Tradition</p>
            </div>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-16 bg-emerald-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">Our Values</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white rounded-2xl p-8 text-center shadow-sm">
              <div className="w-16 h-16 mx-auto mb-4 bg-emerald-100 rounded-full flex items-center justify-center">
                <span className="text-3xl">🌱</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Authenticity</h3>
              <p className="text-gray-600">
                We stay true to traditional Ayurvedic formulations, using only authentic herbs
                and ingredients.
              </p>
            </div>
            <div className="bg-white rounded-2xl p-8 text-center shadow-sm">
              <div className="w-16 h-16 mx-auto mb-4 bg-amber-100 rounded-full flex items-center justify-center">
                <span className="text-3xl">✨</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Purity</h3>
              <p className="text-gray-600">
                No artificial additives, preservatives, or fillers. Just pure, natural
                ingredients as nature intended.
              </p>
            </div>
            <div className="bg-white rounded-2xl p-8 text-center shadow-sm">
              <div className="w-16 h-16 mx-auto mb-4 bg-blue-100 rounded-full flex items-center justify-center">
                <span className="text-3xl">🔬</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Quality</h3>
              <p className="text-gray-600">
                Every batch is tested for purity and potency in certified laboratories
                to ensure safety and efficacy.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <p className="text-4xl font-bold text-emerald-600">50+</p>
              <p className="text-gray-600 mt-2">Products</p>
            </div>
            <div>
              <p className="text-4xl font-bold text-emerald-600">10K+</p>
              <p className="text-gray-600 mt-2">Happy Customers</p>
            </div>
            <div>
              <p className="text-4xl font-bold text-emerald-600">100%</p>
              <p className="text-gray-600 mt-2">Natural</p>
            </div>
            <div>
              <p className="text-4xl font-bold text-emerald-600">4.8</p>
              <p className="text-gray-600 mt-2">Average Rating</p>
            </div>
          </div>
        </div>
      </section>

      {/* Mission */}
      <section className="py-16 bg-gradient-to-br from-emerald-600 to-emerald-800 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold mb-6">Our Mission</h2>
          <p className="text-xl text-emerald-100 leading-relaxed">
            To make the healing power of Ayurveda accessible to everyone, helping people
            helping people achieve optimal health and wellness through nature&apos;s finest ingredients,
            backed by thousands of years of traditional wisdom.
          </p>
        </div>
      </section>

      {/* Contact CTA */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Have Questions?</h2>
          <p className="text-gray-600 mb-8">
            We&apos;d love to hear from you. Reach out to our team for any queries about
            our products or Ayurvedic wellness.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a href="mailto:support@ayurvedaassembly.com" className="px-8 py-4 bg-emerald-600 text-white rounded-full font-semibold hover:bg-emerald-700 transition-colors">
              Email Us
            </a>
            <a href="tel:+919876543210" className="px-8 py-4 border-2 border-emerald-600 text-emerald-600 rounded-full font-semibold hover:bg-emerald-50 transition-colors">
              Call Us
            </a>
          </div>
        </div>
      </section>
    </Layout>
  );
}
