export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { idToken } = req.body;

    if (!idToken) {
      return res.status(400).json({ message: 'ID token is required' });
    }

    const { adminAuth } = await import('@/firebase/admin');

    const decodedToken = await adminAuth.verifyIdToken(idToken);

    const user = {
      uid: decodedToken.uid,
      phone: decodedToken.phone_number,
    };

    res.status(200).json({
      message: 'Authentication successful',
      user
    });
  } catch (error) {
    console.error('Error verifying token:', error);
    res.status(401).json({ message: 'Invalid token', error: error.message });
  }
}
