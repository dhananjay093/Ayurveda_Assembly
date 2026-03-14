import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Layout from '../components/Layout';

export default function LoginPage() {
  const router = useRouter();
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [step, setStep] = useState('phone');
  const [loading, setLoading] = useState(false);
  const [confirmationResult, setConfirmationResult] = useState(null);
  const [error, setError] = useState('');
  const [user, setUser] = useState(null);
  const [auth, setAuth] = useState(null);

  useEffect(() => {
    const initFirebase = async () => {
      try {
        const { auth: firebaseAuth } = await import('../firebase/config');
        const { onAuthStateChanged } = await import('firebase/auth');
        
        if (firebaseAuth) {
          setAuth(firebaseAuth);
          onAuthStateChanged(firebaseAuth, (currentUser) => {
            if (currentUser) {
              setUser(currentUser);
            }
          });
        }
      } catch (err) {
        console.error('Firebase init error:', err);
        setError('Firebase not configured properly. Using demo mode.');
      }
    };
    
    initFirebase();
  }, []);

  const handleSendOtp = async (e) => {
    e.preventDefault();
    if (phone.length !== 10) {
      setError('Please enter a valid 10-digit phone number');
      return;
    }
    
    setLoading(true);
    setError('');

    if (!auth) {
      setTimeout(() => {
        setStep('otp');
        setLoading(false);
        setError('Demo mode: Use OTP 123456');
      }, 1000);
      return;
    }

    try {
      const { RecaptchaVerifier, signInWithPhoneNumber } = await import('firebase/auth');
      const phoneNumber = '+91' + phone;
      
      if (!window.recaptchaVerifier) {
        window.recaptchaVerifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
          size: 'invisible',
          callback: () => {
            console.log('reCAPTCHA solved');
          },
        });
      }

      const result = await signInWithPhoneNumber(auth, phoneNumber, window.recaptchaVerifier);
      setConfirmationResult(result);
      setStep('otp');
      setError('');
    } catch (err) {
      console.error('Error sending OTP:', err);
      
      if (err.code === 'auth/invalid-app-credential' || err.code === 'auth/captcha-check-failed') {
        setError('reCAPTCHA failed. For localhost testing, use test phone numbers configured in Firebase Console.');
      } else {
        setError(err.message || 'Failed to send OTP. Try demo mode with OTP 123456');
      }
      
      setStep('otp');
      
      if (window.recaptchaVerifier) {
        window.recaptchaVerifier = null;
      }
    }
    
    setLoading(false);
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    if (otp.length !== 6) {
      setError('Please enter a valid 6-digit OTP');
      return;
    }

    setLoading(true);
    setError('');

    if (otp === '123456') {
      localStorage.setItem('userPhone', phone);
      localStorage.setItem('isLoggedIn', 'true');
      router.push('/');
      return;
    }

    if (confirmationResult) {
      try {
        const result = await confirmationResult.confirm(otp);
        const user = result.user;
        
        localStorage.setItem('userPhone', phone);
        localStorage.setItem('isLoggedIn', 'true');
        localStorage.setItem('userId', user.uid);
        
        router.push('/');
      } catch (err) {
        console.error('Error verifying OTP:', err);
        setError('Invalid OTP. Try 123456 for demo mode.');
      }
    } else {
      setError('Invalid OTP. Use 123456 for demo mode.');
    }
    
    setLoading(false);
  };

  const handleLogout = async () => {
    try {
      if (auth) {
        await auth.signOut();
      }
      localStorage.removeItem('userPhone');
      localStorage.removeItem('isLoggedIn');
      localStorage.removeItem('userId');
      setUser(null);
    } catch (err) {
      console.error('Error signing out:', err);
    }
  };

  if (user) {
    return (
      <Layout>
        <div className="min-h-screen bg-gradient-to-b from-emerald-50 to-white flex items-center justify-center py-12 px-4">
          <div className="max-w-md w-full">
            <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
              <div className="w-20 h-20 mx-auto bg-emerald-100 rounded-full flex items-center justify-center mb-4">
                <span className="text-4xl">✓</span>
              </div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">You're logged in!</h1>
              <p className="text-gray-500 mb-6">Phone: {user.phoneNumber}</p>
              
              <div className="space-y-3">
                <button
                  onClick={() => router.push('/products')}
                  className="w-full py-3 bg-emerald-600 text-white rounded-lg font-semibold hover:bg-emerald-700"
                >
                  Continue Shopping
                </button>
                <button
                  onClick={handleLogout}
                  className="w-full py-3 border border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50"
                >
                  Logout
                </button>
              </div>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-b from-emerald-50 to-white flex items-center justify-center py-12 px-4">
        <div className="max-w-md w-full">
          <div className="bg-white rounded-2xl shadow-xl p-8">
            {/* Header */}
            <div className="text-center mb-8">
              <div className="w-20 h-20 mx-auto bg-emerald-100 rounded-full flex items-center justify-center mb-4">
                <span className="text-4xl">🌿</span>
              </div>
              <h1 className="text-2xl font-bold text-gray-900">Welcome to Ayurveda Assembly</h1>
              <p className="text-gray-500 mt-2">Login or create an account</p>
            </div>

            {/* Error Message */}
            {error && (
              <div className="mb-4 p-3 bg-amber-50 border border-amber-200 rounded-lg text-amber-700 text-sm">
                {error}
              </div>
            )}

            {step === 'phone' ? (
              <form onSubmit={handleSendOtp}>
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Mobile Number
                  </label>
                  <div className="flex">
                    <span className="inline-flex items-center px-4 py-3 bg-gray-100 border border-r-0 border-gray-300 rounded-l-lg text-gray-600">
                      +91
                    </span>
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                      className="flex-1 px-4 py-3 border border-gray-300 rounded-r-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      placeholder="Enter 10-digit number"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading || phone.length !== 10}
                  className="w-full py-4 bg-emerald-600 text-white rounded-lg font-semibold hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Sending OTP...' : 'Get OTP'}
                </button>
              </form>
            ) : (
              <form onSubmit={handleVerifyOtp}>
                <div className="mb-4">
                  <p className="text-sm text-gray-600 mb-4">
                    Enter OTP for <span className="font-medium">+91 {phone}</span>
                    <button
                      type="button"
                      onClick={() => {
                        setStep('phone');
                        setOtp('');
                        setError('');
                        setConfirmationResult(null);
                      }}
                      className="text-emerald-600 ml-2 hover:underline"
                    >
                      Change
                    </button>
                  </p>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Enter OTP
                  </label>
                  <input
                    type="text"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 text-center text-2xl tracking-widest"
                    placeholder="• • • • • •"
                    maxLength={6}
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading || otp.length !== 6}
                  className="w-full py-4 bg-emerald-600 text-white rounded-lg font-semibold hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Verifying...' : 'Verify & Login'}
                </button>

                <button
                  type="button"
                  onClick={handleSendOtp}
                  disabled={loading}
                  className="w-full mt-4 text-emerald-600 font-medium hover:underline disabled:opacity-50"
                >
                  Resend OTP
                </button>
              </form>
            )}

            {/* reCAPTCHA container - invisible */}
            <div id="recaptcha-container"></div>

            {/* Info */}
            <div className="mt-8 pt-6 border-t text-center">
              <p className="text-sm text-gray-500">
                By continuing, you agree to our{' '}
                <a href="/terms" className="text-emerald-600 hover:underline">Terms of Service</a>
                {' '}and{' '}
                <a href="/privacy" className="text-emerald-600 hover:underline">Privacy Policy</a>
              </p>
            </div>
          </div>

          {/* Demo Note */}
          <div className="mt-4 p-4 bg-blue-50 rounded-lg">
            <p className="text-blue-800 text-sm">
              <strong>Testing?</strong> Enter any phone number and use OTP <strong>123456</strong> to login.
            </p>
          </div>
        </div>
      </div>
    </Layout>
  );
}
