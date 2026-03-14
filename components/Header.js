import Link from 'next/link';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useCart } from '../context/CartContext';

const DEFAULT_BANNER = 'Free Shipping on orders above ₹499 | Use code AYUR10 for 10% off';

export default function Header() {
  const { cartCount } = useCart();
  const router = useRouter();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userPhone, setUserPhone] = useState('');
  const [bannerText, setBannerText] = useState(DEFAULT_BANNER);
  const [concerns, setConcerns] = useState([]);

  useEffect(() => {
    const loggedIn = localStorage.getItem('isLoggedIn') === 'true';
    const phone = localStorage.getItem('userPhone') || '';
    setIsLoggedIn(loggedIn);
    setUserPhone(phone);

    // Fetch dynamic banner text from settings
    fetch('/api/settings')
      .then(r => r.ok ? r.json() : null)
      .then(data => {
        if (data?.headerBannerText) setBannerText(data.headerBannerText);
      })
      .catch(() => { });

    // Fetch concerns for navigation
    fetch('/api/concerns')
      .then(r => r.ok ? r.json() : null)
      .then(data => {
        if (data) setConcerns(data);
      })
      .catch(() => { });
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('userPhone');
    localStorage.removeItem('userId');
    setIsLoggedIn(false);
    setUserPhone('');
    router.push('/');
  };

  return (
    <header className="bg-white shadow-sm sticky top-0 z-50">
      {/* Top Banner */}
      <div className="bg-emerald-700 text-white text-center py-2 text-sm">
        <p>{bannerText}</p>
      </div>


      {/* Main Header */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="lg:hidden p-2 rounded-md text-gray-700 hover:bg-gray-100"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {isMenuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>

          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <div className="w-10 h-10 bg-emerald-600 rounded-full flex items-center justify-center">
              <span className="text-white font-bold text-lg">AA</span>
            </div>
            <span className="text-xl font-bold text-emerald-800 hidden sm:block">Ayurveda Assembly</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center space-x-8">
            <Link href="/products" className="text-gray-700 hover:text-emerald-600 font-medium transition-colors">
              Shop
            </Link>
            <div className="relative group">
              <button className="text-gray-700 hover:text-emerald-600 font-medium transition-colors flex items-center">
                Shop by Concern
                <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              <div className="absolute top-full left-0 w-56 bg-white shadow-lg rounded-lg py-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 mt-2">
                {concerns.map(c => (
                  <Link key={c.id || c.slug} href={`/concern/${c.slug}`} className="block px-4 py-2 text-gray-700 hover:bg-emerald-50 hover:text-emerald-600">
                    {c.name}
                  </Link>
                ))}
                {concerns.length === 0 && (
                  <span className="block px-4 py-2 text-gray-400 italic text-sm">Loading concerns...</span>
                )}
              </div>
            </div>
            <Link href="/about" className="text-gray-700 hover:text-emerald-600 font-medium transition-colors">
              About
            </Link>
          </nav>

          {/* Right Icons */}
          <div className="flex items-center space-x-4">
            {/* Search */}
            <button
              onClick={() => setIsSearchOpen(!isSearchOpen)}
              className="p-2 text-gray-700 hover:text-emerald-600 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </button>

            {/* Cart */}
            <Link href="/cart" className="p-2 text-gray-700 hover:text-emerald-600 transition-colors relative">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-emerald-600 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </Link>

            {/* Login/Account */}
            {isLoggedIn ? (
              <div className="hidden sm:flex items-center space-x-3">
                <div className="flex items-center space-x-2 px-3 py-2 bg-emerald-50 rounded-full">
                  <div className="w-8 h-8 bg-emerald-600 rounded-full flex items-center justify-center">
                    <span className="text-white text-sm font-medium">
                      {userPhone ? userPhone.slice(-2) : 'U'}
                    </span>
                  </div>
                  <span className="text-sm text-emerald-700 font-medium">
                    +91 {userPhone.slice(-4)}
                  </span>
                </div>
                <button
                  onClick={handleLogout}
                  className="text-sm text-gray-500 hover:text-red-500 transition-colors"
                >
                  Logout
                </button>
              </div>
            ) : (
              <Link href="/login" className="hidden sm:flex items-center space-x-1 px-4 py-2 bg-emerald-600 text-white rounded-full hover:bg-emerald-700 transition-colors">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                <span className="font-medium">Login</span>
              </Link>
            )}
          </div>
        </div>

        {/* Search Bar */}
        {isSearchOpen && (
          <div className="py-4 border-t">
            <div className="relative">
              <input
                type="text"
                placeholder="Search for products..."
                className="w-full px-4 py-3 pl-12 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              />
              <svg className="w-5 h-5 text-gray-400 absolute left-4 top-1/2 transform -translate-y-1/2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </div>
        )}
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="lg:hidden bg-white border-t">
          <nav className="px-4 py-4 space-y-2">
            <Link href="/products" className="block py-2 text-gray-700 hover:text-emerald-600 font-medium">Shop</Link>
            <div className="py-2">
              <p className="text-gray-700 font-medium mb-2">Shop by Concern</p>
              <div className="pl-4 space-y-1">
                {concerns.map(c => (
                  <Link key={c.id || c.slug} href={`/concern/${c.slug}`} className="block py-1 text-gray-600 hover:text-emerald-600">
                    {c.name}
                  </Link>
                ))}
              </div>
            </div>
            <Link href="/about" className="block py-2 text-gray-700 hover:text-emerald-600 font-medium">About</Link>
            {isLoggedIn ? (
              <div className="py-2">
                <p className="text-emerald-600 font-medium">+91 {userPhone}</p>
                <button onClick={handleLogout} className="text-red-500 text-sm mt-1">Logout</button>
              </div>
            ) : (
              <Link href="/login" className="block py-2 text-emerald-600 font-medium">Login / Register</Link>
            )}
          </nav>
        </div>
      )}
    </header>
  );
}
