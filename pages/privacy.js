import Head from 'next/head';
import Layout from '../components/Layout';

export default function Privacy() {
  return (
    <Layout>
      <Head>
        <title>Privacy - Ayurveda Assembly</title>
      </Head>
      <div className="bg-gradient-to-b from-emerald-50 to-white min-h-[60vh] py-16 flex items-center">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center bg-white p-12 rounded-3xl shadow-sm border border-gray-100 w-full">
          <div className="text-6xl mb-6">🌿</div>
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6 capitalize">
            privacy
          </h1>
          <p className="text-lg text-gray-600 mb-8 leading-relaxed">
            We are currently updating this section. Please check back later!
          </p>
          <a href="/" className="inline-flex items-center px-8 py-3 bg-emerald-600 text-white rounded-full font-semibold hover:bg-emerald-700 transition-colors shadow-sm">
            Return Home
          </a>
        </div>
      </div>
    </Layout>
  );
}
