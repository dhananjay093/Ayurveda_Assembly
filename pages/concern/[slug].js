import { useRouter } from 'next/router';
import Head from 'next/head';
import Layout from '../../components/Layout';
import ProductCard from '../../components/ProductCard';
import { adminDb } from '@/firebase/admin';

export default function ConcernPage({ concernProducts, displayTitle }) {
    const router = useRouter();

    if (router.isFallback) {
        return <div>Loading...</div>;
    }

    return (
        <Layout>
            <Head>
                <title>{displayTitle} Solutions - Ayurveda Assembly</title>
            </Head>
            <div className="bg-gradient-to-b from-emerald-50 to-white min-h-screen py-12">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="mb-8">
                        <button
                            onClick={() => router.back()}
                            className="text-emerald-600 hover:text-emerald-700 font-medium mb-4 inline-flex items-center transition-colors"
                        >
                            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                            </svg>
                            Back
                        </button>
                        <h1 className="text-3xl md:text-4xl font-bold text-gray-900">
                            Solutions for {displayTitle}
                        </h1>
                        <p className="mt-2 text-gray-600">Discover natural, targeted Ayurvedic remedies carefully formulated to support your wellness journey.</p>
                    </div>

                    {concernProducts.length > 0 ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                            {concernProducts.map((product) => (
                                <ProductCard key={product.id} product={product} />
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-16 bg-white rounded-2xl shadow-sm border border-gray-100">
                            <div className="text-4xl mb-4">🌱</div>
                            <h3 className="text-xl font-semibold text-gray-800 mb-2">No products available</h3>
                            <p className="text-gray-600 mb-6">We are currently updating our collection for this specific health concern.</p>
                            <button
                                onClick={() => router.push('/products')}
                                className="inline-flex items-center px-6 py-3 bg-emerald-600 text-white font-medium rounded-full hover:bg-emerald-700 transition-colors"
                            >
                                Browse All Remedies
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </Layout>
    );
}

export async function getServerSideProps(context) {
    const { slug } = context.params;

    const matchConcern = (dbConcerns, currentSlug) => {
        if (!dbConcerns || !currentSlug) return false;
        return dbConcerns.some(c => {
            const normalizedDbConcern = c.toLowerCase().replace(/ & /g, '-').replace(/\s+/g, '-');
            const normalizedSlug = currentSlug.toLowerCase();
            return normalizedDbConcern === normalizedSlug || normalizedDbConcern.includes(normalizedSlug);
        });
    };

    try {
        const snapshot = await adminDb.collection('products').get();
        const allProducts = [];
        snapshot.forEach(doc => {
            const data = doc.data();
            if (data.createdAt) data.createdAt = typeof data.createdAt.toDate === 'function' ? data.createdAt.toDate().toISOString() : new Date(data.createdAt).toISOString();
            allProducts.push({ id: doc.id, ...data });
        });

        const concernProducts = allProducts.filter(p => matchConcern(p.concern, slug));
        const displayTitle = slug ? decodeURIComponent(slug.toString()).replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase()) : 'Health Concern';

        return {
            props: { concernProducts, displayTitle }
        };
    } catch (error) {
        console.error("Error fetching products by concern:", error);
        return {
            props: { concernProducts: [], displayTitle: 'Health Concern' }
        };
    }
}
