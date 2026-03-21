import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import ConcernIcon from '../../components/ConcernIcon';
import { storage } from '@/firebase/config';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';

export default function AdminDashboard() {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [activeTab, setActiveTab] = useState('orders'); // Default to orders
  const [loading, setLoading] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);

  // Products State
  const [products, setProducts] = useState([]);
  const [editingProduct, setEditingProduct] = useState(null);
  const [newProduct, setNewProduct] = useState({
    name: '', description: '', price: '', originalPrice: '', category: 'Capsules', concern: '', weight: '', images: [], inStock: true, featured: false
  });

  // Orders State
  const [orders, setOrders] = useState([]);
  const [updatingOrderId, setUpdatingOrderId] = useState(null);

  // Customers State
  const [customers, setCustomers] = useState([]);

  // Coupons State
  const [coupons, setCoupons] = useState([]);
  const [newCoupon, setNewCoupon] = useState({
    code: '', type: 'percent', value: '', minOrderValue: '', isActive: true
  });

  // Concerns State
  const [concerns, setConcerns] = useState([]);
  const [newConcernName, setNewConcernName] = useState('');
  const [newConcernIcon, setNewConcernIcon] = useState('🌿');

  // Settings State
  const [settings, setSettings] = useState({
    headerBannerText: '',
    freeShippingThreshold: 499,
    internationalShippingRate: 1500,
    pickupPincode: '',
    pickupLocationNickname: '', // Added for Shiprocket
  });

  const fetchProducts = async () => {
    try {
      const res = await fetch('/api/admin/products', { headers: { 'x-admin-password': password || localStorage.getItem('adminAuthPwd') } });
      if (res.ok) setProducts(await res.json());
    } catch (e) { console.error(e); }
  };

  const fetchOrders = async () => {
    try {
      const res = await fetch('/api/admin/orders', { headers: { 'x-admin-password': password || localStorage.getItem('adminAuthPwd') } });
      if (res.ok) setOrders(await res.json());
    } catch (e) { console.error(e); }
  };

  const fetchCustomers = async () => {
    try {
      const res = await fetch('/api/admin/customers', { headers: { 'x-admin-password': password || localStorage.getItem('adminAuthPwd') } });
      if (res.ok) setCustomers(await res.json());
    } catch (e) { console.error(e); }
  };

  const fetchSettings = async () => {
    try {
      const res = await fetch('/api/admin/settings', { headers: { 'x-admin-password': password || localStorage.getItem('adminAuthPwd') } });
      if (res.ok) {
        const data = await res.json();
        setSettings(prev => ({ ...prev, ...data }));
      }
    } catch (e) { console.error(e); }
  };

  const fetchCoupons = async () => {
    try {
      const res = await fetch('/api/admin/coupons', { headers: { 'x-admin-password': password || localStorage.getItem('adminAuthPwd') } });
      if (res.ok) setCoupons(await res.json());
    } catch (e) { console.error(e); }
  };

  const fetchConcerns = async () => {
    try {
      const res = await fetch('/api/admin/concerns', { headers: { 'x-admin-password': password || localStorage.getItem('adminAuthPwd') } });
      if (res.ok) setConcerns(await res.json());
    } catch (e) { console.error(e); }
  };

  const loadDashboardData = () => {
    fetchProducts();
    fetchOrders();
    fetchCustomers();
    fetchSettings();
    fetchCoupons();
    fetchConcerns();
  };

  const handleLogin = (e) => {
    e.preventDefault();
    if (password === 'admin123') {
      setIsAuthenticated(true);
      localStorage.setItem('adminAuth', 'true');
      localStorage.setItem('adminAuthPwd', password);
      loadDashboardData();
    } else {
      alert('Invalid password');
    }
  };

  useEffect(() => {
    const auth = localStorage.getItem('adminAuth');
    const savedPwd = localStorage.getItem('adminAuthPwd');
    if (auth === 'true' && savedPwd) {
      setPassword(savedPwd);
      setIsAuthenticated(true);
      loadDashboardData();
    }
  }, []);

  const handleLogout = () => {
    setIsAuthenticated(false);
    setPassword('');
    localStorage.removeItem('adminAuth');
    localStorage.removeItem('adminAuthPwd');
  };

  // --- Products Handlers ---
  const handleDeleteProduct = async (id) => {
    if (!confirm("Are you sure you want to delete this product?")) return;
    try {
      const res = await fetch(`/api/admin/products/${id}`, { method: 'DELETE', headers: { 'x-admin-password': password } });
      if (res.ok) setProducts(products.filter(p => p.id !== id));
      else alert("Failed to delete");
    } catch (e) { console.error(e); }
  };

  const handleSaveProduct = async (e) => {
    e.preventDefault();
    setLoading(true);
    const isEditing = !!editingProduct;
    const url = isEditing ? `/api/admin/products/${editingProduct.id}` : '/api/admin/products/add';
    const method = isEditing ? 'PUT' : 'POST';
    const payload = isEditing ? { ...editingProduct } : { ...newProduct };

    if (typeof payload.concern === 'string') {
      payload.concern = payload.concern.split(',').map(c => c.trim()).filter(Boolean);
    }
    try {
      const response = await fetch(url, { method, headers: { 'Content-Type': 'application/json', 'x-admin-password': password }, body: JSON.stringify(payload) });
      if (response.ok) {
        alert(isEditing ? 'Product updated!' : 'Product added!');
        fetchProducts();
        if (!isEditing) setNewProduct({ name: '', description: '', price: '', originalPrice: '', category: 'Capsules', concern: '', weight: '', images: [], inStock: true, featured: false });
        else setEditingProduct(null);
      } else {
        const data = await response.json();
        alert(data.message || 'Failed to save');
      }
    } catch (error) { alert('Failed to save product'); }
    setLoading(false);
  };

  // --- Orders Handlers ---
  const updateOrderStatus = async (id, field, value) => {
    setUpdatingOrderId(id);
    try {
      const res = await fetch(`/api/admin/orders/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'x-admin-password': password },
        body: JSON.stringify({ [field]: value })
      });
      if (res.ok) {
        setOrders(orders.map(o => o.id === id ? { ...o, [field]: value } : o));
      } else {
        alert('Failed to update order');
      }
    } catch (e) { console.error(e); }
    setUpdatingOrderId(null);
  };

  // --- Settings Handlers ---
  const handleSaveSettings = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/settings`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'x-admin-password': password },
        body: JSON.stringify(settings)
      });
      if (res.ok) {
        alert('Settings updated successfully!');
      } else {
        alert('Failed to update settings');
      }
    } catch (e) {
      console.error(e);
      alert('Failed to update settings');
    }
    setLoading(false);
  };

  // --- Coupon Handlers ---
  const handleAddCoupon = async (e) => {
    e.preventDefault();
    if (!newCoupon.code || !newCoupon.value) return alert('Code and value are required');
    setLoading(true);
    try {
      const res = await fetch('/api/admin/coupons', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-admin-password': password },
        body: JSON.stringify(newCoupon),
      });
      const data = await res.json();
      if (res.ok) {
        alert('Coupon created!');
        setNewCoupon({ code: '', type: 'percent', value: '', minOrderValue: '', isActive: true });
        fetchCoupons();
      } else {
        alert(data.message || 'Failed to create coupon');
      }
    } catch (e) {
      console.error(e);
      alert('Failed to create coupon');
    }
    setLoading(false);
  };

  const handleToggleCoupon = async (id, currentActive) => {
    try {
      await fetch(`/api/admin/coupons/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'x-admin-password': password },
        body: JSON.stringify({ isActive: !currentActive }),
      });
      setCoupons(coupons.map(c => c.id === id ? { ...c, isActive: !currentActive } : c));
    } catch (e) { console.error(e); }
  };

  const handleDeleteCoupon = async (id) => {
    if (!confirm('Delete this coupon?')) return;
    try {
      await fetch(`/api/admin/coupons/${id}`, {
        method: 'DELETE',
        headers: { 'x-admin-password': password },
      });
      setCoupons(coupons.filter(c => c.id !== id));
    } catch (e) { console.error(e); }
  };

  const handleShipOrder = async (orderId) => {
    if (!confirm('Push this order to Shiprocket for fulfillment?')) return;
    setLoading(true);
    try {
      const res = await fetch('/api/admin/orders/ship', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-password': password || localStorage.getItem('adminAuthPwd')
        },
        body: JSON.stringify({ orderId })
      });
      const data = await res.json();
      if (res.ok) {
        alert('Shipment request sent to Shiprocket!');
        fetchOrders();
      } else {
        const detailStr = data.details ? (typeof data.details === 'object' ? JSON.stringify(data.details) : data.details) : '';
        alert(`${data.message || 'Failed to create shipment'}${detailStr ? '\n\nDetails: ' + detailStr : ''}`);
      }
    } catch (e) {
      console.error(e);
      alert('Failed to ship order');
    }
    setLoading(false);
  };

  // --- Concern Handlers ---
  const handleAddConcern = async (e) => {
    e.preventDefault();
    if (!newConcernName.trim()) return alert('Name is required');
    setLoading(true);
    try {
      const res = await fetch('/api/admin/concerns', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-admin-password': password },
        body: JSON.stringify({ name: newConcernName, icon: newConcernIcon }),
      });
      const data = await res.json();
      if (res.ok) {
        setNewConcernName('');
        setNewConcernIcon('🌿');
        fetchConcerns();
      } else { alert(data.message || 'Failed'); }
    } catch (e) { console.error(e); }
    setLoading(false);
  };

  const handleDeleteConcern = async (id) => {
    if (!confirm('Delete this concern? Products using it will still keep the tag.')) return;
    try {
      await fetch(`/api/admin/concerns/${id}`, { method: 'DELETE', headers: { 'x-admin-password': password } });
      setConcerns(concerns.filter(c => c.id !== id));
    } catch (e) { console.error(e); }
  };

  // Helper to toggle a concern on/off in the product form
  const toggleConcernInForm = (concernName, formData, setFormData) => {
    const current = Array.isArray(formData.concern) ? formData.concern : (typeof formData.concern === 'string' && formData.concern ? formData.concern.split(',').map(s => s.trim()) : []);
    if (current.includes(concernName)) {
      setFormData({ ...formData, concern: current.filter(c => c !== concernName) });
    } else {
      setFormData({ ...formData, concern: [...current, concernName] });
    }
  };

  // Helper to get concern array from formData
  const getConcernArray = (formData) => {
    return Array.isArray(formData.concern) ? formData.concern : (typeof formData.concern === 'string' && formData.concern ? formData.concern.split(',').map(s => s.trim()).filter(Boolean) : []);
  };

  const handleImageUpload = async (e, formData, setFormData) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;

    setUploadingImage(true);
    let newUrls = [];

    try {
      const uploadPromises = files.map(file => {
        return new Promise((resolve, reject) => {
          const storageRef = ref(storage, `products/${Date.now()}_${file.name.replace(/[^a-zA-Z0-9.]/g, '_')}`);
          const uploadTask = uploadBytesResumable(storageRef, file);

          uploadTask.on('state_changed',
            null,
            (error) => reject(error),
            async () => {
              try {
                const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
                resolve(downloadURL);
              } catch (urlError) {
                reject(urlError);
              }
            }
          );
        });
      });

      newUrls = await Promise.all(uploadPromises);

      setFormData(prev => {
        const currentImages = Array.isArray(prev.images) ? prev.images : (prev.image ? [prev.image] : []);
        return { ...prev, images: [...currentImages, ...newUrls] };
      });
      console.log('Successfully uploaded:', newUrls.length, 'images');

    } catch (err) {
      console.error('Upload Error:', err);
      alert('Failed to upload one or more images.');
    } finally {
      setUploadingImage(false);
      // Reset the file input so the same files can be selected again if needed
      e.target.value = null;
    }
  };

  const removeImage = (indexToRemove, formData, setFormData) => {
    const currentImages = Array.isArray(formData.images) ? formData.images : (formData.image ? [formData.image] : []);
    const newImages = currentImages.filter((_, idx) => idx !== indexToRemove);
    setFormData(prev => ({ ...prev, images: newImages }));
  };


  if (!isAuthenticated) return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-gray-100 flex items-center justify-center p-4">
      <div className="bg-white p-8 rounded-2xl shadow-xl max-w-md w-full border border-gray-100">
        <div className="text-center mb-8">
          <div className="w-20 h-20 mx-auto bg-emerald-100/50 rounded-full flex items-center justify-center mb-4">
            <div className="w-12 h-12 bg-emerald-600 rounded-full flex items-center justify-center text-white font-bold text-xl shadow-inner">
              AA
            </div>
          </div>
          <h1 className="text-3xl font-bold text-gray-900">Ayurveda Admin</h1>
          <p className="text-gray-500 mt-2">Secure Dashboard Access</p>
        </div>
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full px-4 py-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500" placeholder="Enter administrative password" />
          </div>
          <button type="submit" className="w-full py-4 bg-emerald-600 text-white rounded-xl font-bold hover:bg-emerald-700 transition-all shadow-md hover:shadow-lg active:transform active:scale-[0.98]">
            Authenticate →
          </button>
        </form>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50/50">
      <header className="bg-white shadow-sm border-b sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-emerald-700 rounded-lg flex items-center justify-center text-white font-bold shadow-sm">AA</div>
            <h1 className="font-bold text-gray-900 text-lg tracking-tight">Ayurveda Assembly</h1>
            <span className="hidden sm:inline-block px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-md font-medium tracking-wide">ADMIN</span>
          </div>
          <div className="flex items-center space-x-6">
            <button onClick={() => router.push('/')} className="text-gray-500 hover:text-emerald-600 text-sm font-medium transition-colors flex items-center">
              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
              View Store
            </button>
            <div className="w-px h-6 bg-gray-200"></div>
            <button onClick={handleLogout} className="text-red-500 hover:text-red-700 text-sm font-medium transition-colors">Logout</button>
          </div>
        </div>
      </header>

      <div className="flex max-w-7xl mx-auto">
        {/* Sidebar Nav (Desktop view approach for tabs) */}
        <div className="hidden md:block w-64 pt-8 pr-8">
          <nav className="space-y-1">
            {['Orders', 'Products', 'Add Product', 'Customers', 'Coupons', 'Concerns', 'Settings'].map(tab => {
              const isActive = activeTab === tab.toLowerCase();
              return (
                <button
                  key={tab}
                  onClick={() => { setActiveTab(tab.toLowerCase()); setEditingProduct(null); }}
                  className={`w-full text-left px-4 py-3 rounded-xl font-medium transition-all ${isActive ? 'bg-emerald-50 text-emerald-700 shadow-sm border border-emerald-100' : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'}`}
                >
                  {tab}
                </button>
              )
            })}
          </nav>
        </div>

        {/* Mobile Nav */}
        <div className="md:hidden w-full px-4 pt-4">
          <div className="flex space-x-2 overflow-x-auto pb-2 scrollbar-hide">
            {['Orders', 'Products', 'Add', 'Customers', 'Coupons', 'Concerns', 'Settings'].map(tab => (
              <button
                key={tab}
                onClick={() => { setActiveTab(tab.toLowerCase().replace('add', 'add product')); setEditingProduct(null); }}
                className={`px-4 py-2 font-medium whitespace-nowrap rounded-full text-sm transition-all ${activeTab.includes(tab.toLowerCase()) ? 'bg-emerald-600 text-white shadow-md' : 'bg-white text-gray-600 border border-gray-200 shadow-sm'}`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 px-4 py-8">

          {/* Headers usually aren't needed if sidebar shows context, but we keep it inside tabs. */}

          {/* --- PRODUCTS TAB --- */}
          {activeTab === 'products' && !editingProduct && (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-8">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 tracking-tight">Products Inventory</h2>
                  <p className="text-gray-500 mt-1">Manage your catalog, stock, and pricing.</p>
                </div>
                <span className="bg-emerald-50 border border-emerald-100 text-emerald-700 text-sm font-semibold px-4 py-1.5 rounded-full shadow-sm">{products.length} Items</span>
              </div>
              <div className="overflow-x-auto rounded-xl border border-gray-100">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-gray-50/80 text-gray-500 text-xs uppercase tracking-wider">
                      <th className="p-4 font-semibold">Name</th><th className="p-4 font-semibold">Category</th><th className="p-4 font-semibold">Price</th><th className="p-4 font-semibold">Status</th><th className="p-4 font-semibold text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {products.map(product => (
                      <tr key={product.id} className="hover:bg-gray-50/50 transition-colors">
                        <td className="p-4">
                          <div className="font-semibold text-gray-900">{product.name}</div>
                          {product.featured && <span className="text-[10px] text-emerald-600 font-bold tracking-wide uppercase">Featured</span>}
                        </td>
                        <td className="p-4 text-gray-600 text-sm">{product.category}</td>
                        <td className="p-4 text-gray-900 font-medium">₹{product.price}</td>
                        <td className="p-4"><span className={`px-2.5 py-1 inline-flex text-xs font-bold rounded-md ${product.inStock ? 'bg-green-100/50 text-green-700 border border-green-200' : 'bg-red-100/50 text-red-700 border border-red-200'}`}>{product.inStock ? 'In Stock' : 'Out of Stock'}</span></td>
                        <td className="p-4 text-right space-x-4">
                          <button onClick={() => setEditingProduct(product)} className="text-emerald-600 hover:text-emerald-700 font-medium text-sm transition-colors">Edit</button>
                          <button onClick={() => handleDeleteProduct(product.id)} className="text-red-500 hover:text-red-700 font-medium text-sm transition-colors">Delete</button>
                        </td>
                      </tr>
                    ))}
                    {products.length === 0 && <tr><td colSpan="5" className="p-12 text-center text-gray-400">Inventory is empty. Add your first product.</td></tr>}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* --- ADD / EDIT PRODUCT TAB --- */}
          {(activeTab === 'add product' || editingProduct) && (() => {
            const formData = editingProduct || newProduct;
            const setFormData = editingProduct ? setEditingProduct : setNewProduct;
            const isEditing = !!editingProduct;
            const selectedConcerns = getConcernArray(formData);
            return (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-8 max-w-4xl">
                <form onSubmit={handleSaveProduct} className="space-y-4">
                  <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-bold text-gray-900">{isEditing ? 'Edit Product' : 'Add New Product'}</h2>
                    {isEditing && <button type="button" onClick={() => setEditingProduct(null)} className="text-gray-500 hover:text-gray-700">Cancel Edit</button>}
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Product Name *</label>
                      <input type="text" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className="w-full px-4 py-2 border rounded-lg focus:ring-emerald-500 focus:outline-none" required />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Category *</label>
                      <select value={formData.category} onChange={(e) => setFormData({ ...formData, category: e.target.value })} className="w-full px-4 py-2 border rounded-lg focus:ring-emerald-500">
                        <option value="Capsules">Capsules</option>
                        <option value="Powders">Powders</option>
                        <option value="Tablets">Tablets</option>
                        <option value="Drops & Syrups">Drops &amp; Syrups</option>
                        <option value="Jams & Syrups">Jams &amp; Syrups</option>
                        <option value="Oils">Oils</option>
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Description *</label>
                    <textarea value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} rows={3} className="w-full px-4 py-2 border rounded-lg focus:ring-emerald-500 focus:outline-none" required />
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Price (₹) *</label>
                      <input type="number" value={formData.price} onChange={(e) => setFormData({ ...formData, price: e.target.value })} className="w-full px-4 py-2 border rounded-lg focus:ring-emerald-500 focus:outline-none" required />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Original Price (₹)</label>
                      <input type="number" value={formData.originalPrice} onChange={(e) => setFormData({ ...formData, originalPrice: e.target.value })} className="w-full px-4 py-2 border rounded-lg focus:ring-emerald-500 focus:outline-none" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Weight (g)</label>
                      <input type="number" value={formData.weight} onChange={(e) => setFormData({ ...formData, weight: e.target.value })} className="w-full px-4 py-2 border rounded-lg focus:outline-none" />
                    </div>
                    <div className="flex flex-col space-y-2 mt-6">
                      <label className="flex items-center space-x-2"><input type="checkbox" checked={formData.inStock} onChange={(e) => setFormData({ ...formData, inStock: e.target.checked })} className="rounded text-emerald-600" /><span className="text-sm cursor-pointer">In Stock</span></label>
                      <label className="flex items-center space-x-2"><input type="checkbox" checked={formData.featured} onChange={(e) => setFormData({ ...formData, featured: e.target.checked })} className="rounded text-emerald-600" /><span className="text-sm cursor-pointer">Featured</span></label>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Health Concerns</label>
                      <p className="text-xs text-gray-500 mb-2">Select applicable concerns (managed in the Concerns tab).</p>
                      {concerns.length > 0 ? (
                        <div className="flex flex-wrap gap-2">
                          {concerns.map(c => (
                            <button
                              key={c.id || c.slug}
                              type="button"
                              onClick={() => toggleConcernInForm(c.name, formData, setFormData)}
                              className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-all ${selectedConcerns.includes(c.name)
                                ? 'bg-emerald-100 text-emerald-700 border-emerald-300 shadow-sm' : 'bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100'}`}
                            >
                              {selectedConcerns.includes(c.name) ? '✓ ' : ''}
                              <ConcernIcon slug={c.slug || c.name} className="w-4 h-4 inline-block mr-1" />
                              {c.name}
                            </button>
                          ))}
                        </div>
                      ) : (
                        <p className="text-xs text-gray-400 italic">No concerns defined yet. Add some in the Concerns tab.</p>
                      )}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Product Images *</label>
                      <p className="text-xs text-gray-500 mb-2">Upload multiple high-quality product images (JPEG, PNG, WebP). Square format recommended.</p>

                      <div className="flex flex-wrap gap-3 mb-3">
                        {(() => {
                          const currentImages = Array.isArray(formData.images) ? formData.images : (formData.image ? [formData.image] : []);
                          return currentImages.map((imgUrl, idx) => (
                            <div key={idx} className="relative w-24 h-24 border rounded-lg overflow-hidden flex items-center justify-center bg-gray-50 shadow-sm group">
                              <img src={imgUrl} alt={`Preview ${idx}`} className="object-contain w-full h-full" />
                              <button
                                type="button"
                                onClick={() => removeImage(idx, formData, setFormData)}
                                className="absolute top-1 right-1 bg-white/90 rounded-full p-1 shadow hover:bg-red-50 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
                              >
                                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                              </button>
                            </div>
                          ));
                        })()}
                      </div>

                      <div className="relative">
                        <input
                          type="file"
                          multiple
                          accept="image/jpeg, image/png, image/webp"
                          onChange={(e) => handleImageUpload(e, formData, setFormData)}
                          disabled={uploadingImage}
                          className="block w-full text-sm text-gray-500 file:mr-4 file:py-2.5 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-emerald-50 file:text-emerald-700 hover:file:bg-emerald-100 transition-all border border-gray-300 rounded-lg cursor-pointer focus:outline-none"
                        />
                        {uploadingImage && (
                          <div className="absolute inset-y-0 right-3 flex items-center">
                            <span className="text-xs text-emerald-600 font-medium mr-2">Uploading...</span>
                            <svg className="animate-spin h-4 w-4 text-emerald-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  <button type="submit" disabled={loading || uploadingImage} className="w-full md:w-auto px-8 py-3 bg-emerald-600 text-white rounded-lg font-semibold hover:bg-emerald-700 disabled:opacity-50 transition-colors shadow-sm">
                    {loading ? 'Saving...' : (isEditing ? 'Update Product' : 'Add Product')}
                  </button>
                </form>
              </div>
            );
          })()}


          {/* --- ORDERS TAB --- */}
          {activeTab === 'orders' && (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-8">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 tracking-tight">Order Management</h2>
                  <p className="text-gray-500 mt-1">Review, process, and update customer orders.</p>
                </div>
                <span className="bg-blue-50 border border-blue-100 text-blue-700 text-sm font-semibold px-4 py-1.5 rounded-full shadow-sm">{orders.length} Orders</span>
              </div>
              <div className="overflow-x-auto rounded-xl border border-gray-100 shadow-sm">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-gray-50/80 text-gray-500 text-xs uppercase tracking-wider">
                      <th className="p-4 font-semibold">ID & Date</th>
                      <th className="p-4 font-semibold">Customer info</th>
                      <th className="p-4 font-semibold">Items</th>
                      <th className="p-4 font-semibold">Total</th>
                      <th className="p-4 font-semibold">Status</th>
                      <th className="p-4 font-semibold">Payment</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {orders.map(order => (
                      <tr key={order.id} className={`hover:bg-gray-50/50 transition-colors ${order.is_international ? 'bg-amber-50/10' : ''}`}>
                        <td className="p-4 align-top">
                          <div className="font-mono text-xs font-bold text-gray-700 bg-gray-100 px-2 py-1 rounded inline-block mb-1 border border-gray-200" title={order.id}>#{order.id}</div>
                          <div className="text-xs text-gray-500 font-medium">{new Date(order.created_at).toLocaleDateString()}</div>
                          {order.is_international && <span className="inline-block mt-1.5 px-1.5 py-0.5 text-[10px] font-bold bg-amber-100 text-amber-800 rounded border border-amber-200 shadow-sm">Intl. Order</span>}
                        </td>
                        <td className="p-4 align-top">
                          <div className="font-semibold text-gray-900 text-sm">{order.shipping_details?.name}</div>
                          <div className="text-xs text-gray-500 mt-0.5">{order.shipping_details?.email || order.shipping_details?.phone}</div>
                          <div className="text-xs text-gray-400 mt-0.5">{order.shipping_details?.city}, {order.is_international ? order.shipping_details?.country : 'IN'}</div>
                        </td>
                        <td className="p-4 align-top">
                          <div className="text-sm font-medium text-gray-700">{order.cart_items?.length || 0} items</div>
                          <div className="text-xs text-gray-400 mt-1 line-clamp-2 max-w-[150px] leading-relaxed">
                            {order.cart_items?.map(i => `${i.quantity}x ${i.name}`).join(', ')}
                          </div>
                        </td>
                        <td className="p-4 align-top">
                          <div className="font-bold text-gray-900">₹{order.total}</div>
                          <div className="text-xs text-gray-400 line-through">₹{order.subtotal}</div>
                        </td>
                        <td className="p-4 align-top">
                          <select
                            value={order.status}
                            onChange={(e) => updateOrderStatus(order.id, 'status', e.target.value)}
                            disabled={updatingOrderId === order.id}
                            className={`text-sm font-medium rounded-lg border-0 ring-1 ring-inset shadow-sm focus:ring-2 focus:ring-emerald-500 py-1.5 pl-3 pr-8 ${order.status === 'Confirmed' ? 'text-blue-700 bg-blue-50 ring-blue-200' :
                              order.status === 'Processing' ? 'text-indigo-700 bg-indigo-50 ring-indigo-200' :
                                order.status === 'Shipped' ? 'text-purple-700 bg-purple-50 ring-purple-200' :
                                  order.status === 'Delivered' ? 'text-green-700 bg-green-50 ring-green-200' :
                                    order.status.includes('Pending') ? 'text-amber-700 bg-amber-50 ring-amber-200' :
                                      'text-gray-700 bg-gray-50 ring-gray-200'
                              }`}
                          >
                            <option value="Confirmed">Confirmed</option>
                            <option value="Processing">Processing</option>
                            <option value="Shipped">Shipped</option>
                            <option value="Delivered">Delivered</option>
                            <option value="Cancelled">Cancelled</option>
                            <option value="Pending International">Pending Intl Review</option>
                          </select>
                        </td>
                        <td className="p-4 align-top text-right space-y-2">
                          <select
                            value={order.payment_status}
                            onChange={(e) => updateOrderStatus(order.id, 'payment_status', e.target.value)}
                            disabled={updatingOrderId === order.id}
                            className={`text-sm font-medium rounded-lg border-0 ring-1 ring-inset shadow-sm focus:ring-2 focus:ring-emerald-500 py-1.5 pl-3 pr-8 w-full ${order.payment_status === 'Paid' ? 'text-green-800 bg-green-50 ring-green-200' :
                              order.payment_status.includes('Pending') ? 'text-amber-800 bg-amber-50 ring-amber-200' :
                                'text-red-800 bg-red-50 ring-red-200'
                              }`}
                          >
                            <option value="Paid">Paid</option>
                            <option value="Pending Manual Payment">Pending Manual</option>
                            <option value="Refunded">Refunded</option>
                          </select>

                          {!order.is_international && !order.shiprocket_order_id && order.payment_status === 'Paid' && (
                            <button
                              onClick={() => handleShipOrder(order.id)}
                              disabled={loading}
                              className="w-full mt-2 px-3 py-1.5 bg-emerald-600 text-white text-xs font-bold rounded-lg hover:bg-emerald-700 transition-colors shadow-sm disabled:opacity-50"
                            >
                              Ship via Shiprocket
                            </button>
                          )}
                          {order.shiprocket_order_id && (
                            <div className="mt-2 text-right">
                              <span className="text-[10px] font-bold text-gray-400 block uppercase tracking-tighter">Shiprocket ID</span>
                              <a
                                href={`https://app.shiprocket.in/orders/${order.shiprocket_order_id}`}
                                target="_blank"
                                rel="noreferrer"
                                className="text-xs font-mono font-bold text-emerald-600 hover:underline"
                              >
                                {order.shiprocket_order_id} ↗
                              </a>
                            </div>
                          )}
                        </td>
                      </tr>
                    ))}
                    {orders.length === 0 && <tr><td colSpan="6" className="p-12 text-center text-gray-400">No orders placed yet.</td></tr>}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* --- CUSTOMERS TAB --- */}
          {activeTab === 'customers' && (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-8">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 tracking-tight">Customer Database</h2>
                  <p className="text-gray-500 mt-1">Automatically derived from historical orders.</p>
                </div>
                <span className="bg-purple-50 border border-purple-100 text-purple-700 text-sm font-semibold px-4 py-1.5 rounded-full shadow-sm">{customers.length} Customers</span>
              </div>
              <div className="overflow-x-auto rounded-xl border border-gray-100">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-gray-50/80 text-gray-500 text-xs uppercase tracking-wider">
                      <th className="p-4 font-semibold">Name</th>
                      <th className="p-4 font-semibold">Contact</th>
                      <th className="p-4 font-semibold">Location</th>
                      <th className="p-4 font-semibold">Orders</th>
                      <th className="p-4 font-semibold">Total Value</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {customers.map(c => (
                      <tr key={c.id} className="hover:bg-gray-50/50 transition-colors">
                        <td className="p-4 font-medium text-gray-900">{c.name}</td>
                        <td className="p-4">
                          <div className="text-sm text-gray-700">{c.email}</div>
                          <div className="text-xs text-gray-500 mt-0.5">{c.phone}</div>
                        </td>
                        <td className="p-4 text-sm text-gray-600">{c.city}, {c.country}</td>
                        <td className="p-4">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                            {c.orderCount} Orders
                          </span>
                        </td>
                        <td className="p-4 font-bold text-emerald-600">₹{c.totalSpent}</td>
                      </tr>
                    ))}
                    {customers.length === 0 && <tr><td colSpan="5" className="p-12 text-center text-gray-400">No customers found.</td></tr>}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* --- SETTINGS TAB --- */}
          {activeTab === 'settings' && (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-8 max-w-3xl">
              <h2 className="text-2xl font-bold text-gray-900 tracking-tight mb-2">Global Site Settings</h2>
              <p className="text-gray-500 mb-8">Configure global parameters like shipping rules and banners.</p>

              <form onSubmit={handleSaveSettings} className="space-y-6">
                <div className="bg-gray-50 p-6 rounded-xl border border-gray-100">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">Shipping Adjustments</h3>
                  <div className="space-y-5">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Free Shipping Threshold (₹)</label>
                      <p className="text-xs text-gray-500 mb-2">Cart minimum required in India to bypass shipping cost calculations.</p>
                      <input
                        type="number"
                        value={settings.freeShippingThreshold}
                        onChange={(e) => setSettings({ ...settings, freeShippingThreshold: Number(e.target.value) })}
                        className="w-full md:max-w-xs px-4 py-2.5 bg-white border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 font-medium text-gray-900"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Flat International Rate (₹)</label>
                      <p className="text-xs text-gray-500 mb-2">Flat shipping placeholder for non-India orders placed pending manual review.</p>
                      <input
                        type="number"
                        value={settings.internationalShippingRate}
                        onChange={(e) => setSettings({ ...settings, internationalShippingRate: Number(e.target.value) })}
                        className="w-full md:max-w-xs px-4 py-2.5 bg-white border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 font-medium text-gray-900"
                        required
                      />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Shiprocket Pickup Pincode</label>
                        <p className="text-xs text-gray-500 mb-2">Required for domestic shipping rate calculation (6 digits).</p>
                        <input
                          type="text"
                          maxLength="6"
                          value={settings.pickupPincode || ''}
                          onChange={(e) => setSettings({ ...settings, pickupPincode: e.target.value })}
                          placeholder="110001"
                          className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 font-medium text-gray-900 font-mono"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Shiprocket Pickup Nickname</label>
                        <p className="text-xs text-gray-500 mb-2">Nickname for the pickup location (e.g., "Warehouse", "Office").</p>
                        <input
                          type="text"
                          value={settings.pickupLocationNickname || ''}
                          onChange={(e) => setSettings({ ...settings, pickupLocationNickname: e.target.value })}
                          placeholder="Primary Warehouse"
                          className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 font-medium text-gray-900"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-50 p-6 rounded-xl border border-gray-100">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">Promotional Header Banner</h3>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Banner Text Content</label>
                    <p className="text-xs text-gray-500 mb-2">Text displayed dynamically at the very top of all pages.</p>
                    <input
                      type="text"
                      value={settings.headerBannerText || ''}
                      onChange={(e) => setSettings({ ...settings, headerBannerText: e.target.value })}
                      placeholder="FREE SHIPPING ON ALL ORDERS OVER ₹499"
                      className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-gray-900"
                    />
                  </div>
                </div>

                <div className="pt-2">
                  <button type="submit" disabled={loading} className="px-8 py-3 bg-emerald-600 text-white rounded-lg font-bold hover:bg-emerald-700 disabled:opacity-50 transition-colors shadow-sm">
                    {loading ? 'Saving...' : 'Save Settings'}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* --- COUPONS TAB --- */}
          {activeTab === 'coupons' && (
            <div className="space-y-6 max-w-4xl">
              {/* Add new coupon form */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-8">
                <h2 className="text-2xl font-bold text-gray-900 tracking-tight mb-2">Create Coupon</h2>
                <p className="text-gray-500 mb-6">Add a new discount coupon for customers to use at checkout.</p>
                <form onSubmit={handleAddCoupon} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Coupon Code *</label>
                      <input
                        type="text"
                        value={newCoupon.code}
                        onChange={e => setNewCoupon({ ...newCoupon, code: e.target.value.toUpperCase() })}
                        placeholder="e.g. SAVE20"
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg font-mono font-bold tracking-widest uppercase focus:ring-2 focus:ring-emerald-500"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Discount Type *</label>
                      <select
                        value={newCoupon.type}
                        onChange={e => setNewCoupon({ ...newCoupon, type: e.target.value })}
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
                      >
                        <option value="percent">Percentage (%) off</option>
                        <option value="amount">Flat Amount (₹) off</option>
                      </select>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        {newCoupon.type === 'percent' ? 'Discount % *' : 'Discount Amount (₹) *'}
                      </label>
                      <input
                        type="number"
                        min="1"
                        max={newCoupon.type === 'percent' ? 100 : undefined}
                        value={newCoupon.value}
                        onChange={e => setNewCoupon({ ...newCoupon, value: e.target.value })}
                        placeholder={newCoupon.type === 'percent' ? '20' : '100'}
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Min. Order Value (₹)</label>
                      <input
                        type="number"
                        min="0"
                        value={newCoupon.minOrderValue}
                        onChange={e => setNewCoupon({ ...newCoupon, minOrderValue: e.target.value })}
                        placeholder="0 (no minimum)"
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
                      />
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <input type="checkbox" id="couponActive" checked={newCoupon.isActive} onChange={e => setNewCoupon({ ...newCoupon, isActive: e.target.checked })} className="rounded text-emerald-600 w-4 h-4" />
                    <label htmlFor="couponActive" className="text-sm text-gray-700 cursor-pointer">Active (customers can use it immediately)</label>
                  </div>
                  <button type="submit" disabled={loading} className="px-8 py-3 bg-emerald-600 text-white rounded-lg font-bold hover:bg-emerald-700 disabled:opacity-50 transition-colors shadow-sm">
                    {loading ? 'Creating...' : 'Create Coupon'}
                  </button>
                </form>
              </div>

              {/* Existing coupons table */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-8">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-bold text-gray-900">Existing Coupons</h2>
                  <span className="bg-orange-50 border border-orange-100 text-orange-700 text-sm font-semibold px-4 py-1.5 rounded-full">{coupons.length} Total</span>
                </div>
                <div className="overflow-x-auto rounded-xl border border-gray-100">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wider">
                        <th className="p-4 font-semibold">Code</th>
                        <th className="p-4 font-semibold">Type</th>
                        <th className="p-4 font-semibold">Value</th>
                        <th className="p-4 font-semibold">Min. Order</th>
                        <th className="p-4 font-semibold">Status</th>
                        <th className="p-4 font-semibold text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {coupons.map(coupon => (
                        <tr key={coupon.id} className="hover:bg-gray-50/50 transition-colors">
                          <td className="p-4 font-mono font-bold text-gray-900 tracking-wider">{coupon.code}</td>
                          <td className="p-4 text-sm text-gray-600 capitalize">{coupon.type === 'percent' ? 'Percentage' : 'Flat Amount'}</td>
                          <td className="p-4 font-semibold text-emerald-700">{coupon.type === 'percent' ? `${coupon.value}%` : `₹${coupon.value}`}</td>
                          <td className="p-4 text-sm text-gray-600">{coupon.minOrderValue > 0 ? `₹${coupon.minOrderValue}` : 'None'}</td>
                          <td className="p-4">
                            <button
                              onClick={() => handleToggleCoupon(coupon.id, coupon.isActive)}
                              className={`px-3 py-1 text-xs font-bold rounded-full transition-colors ${coupon.isActive ? 'bg-green-100 text-green-700 hover:bg-green-200' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}`}
                            >
                              {coupon.isActive ? 'Active' : 'Inactive'}
                            </button>
                          </td>
                          <td className="p-4 text-right">
                            <button onClick={() => handleDeleteCoupon(coupon.id)} className="text-red-500 hover:text-red-700 font-medium text-sm transition-colors">Delete</button>
                          </td>
                        </tr>
                      ))}
                      {coupons.length === 0 && <tr><td colSpan="6" className="p-12 text-center text-gray-400">No coupons created yet.</td></tr>}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* --- CONCERNS TAB --- */}
          {activeTab === 'concerns' && (
            <div className="space-y-6 max-w-4xl">
              {/* Add new concern form */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-8">
                <h2 className="text-2xl font-bold text-gray-900 tracking-tight mb-2">Manage Concerns</h2>
                <p className="text-gray-500 mb-6">Create and manage health concerns for product categorization.</p>
                <form onSubmit={handleAddConcern} className="flex flex-wrap gap-4 items-end">
                  <div className="flex-1 min-w-[200px]">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Concern Name *</label>
                    <input
                      type="text"
                      value={newConcernName}
                      onChange={e => setNewConcernName(e.target.value)}
                      placeholder="e.g. Immunity"
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                      required
                    />
                  </div>
                  {/* Icon input hidden, we use SVG professional icons automatically mapping to name */}

                  <button type="submit" disabled={loading} className="px-8 py-3 bg-emerald-600 text-white rounded-lg font-bold hover:bg-emerald-700 disabled:opacity-50 transition-colors shadow-sm">
                    {loading ? 'Adding...' : 'Add Concern'}
                  </button>
                </form>
              </div>

              {/* Existing concerns grid */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-8">
                <h2 className="text-xl font-bold text-gray-900 mb-6">Existing Concerns</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                  {concerns.map(c => (
                    <div key={c.id} className="flex justify-between items-center p-4 bg-gray-50 rounded-xl border border-gray-100">
                      <div className="flex items-center space-x-3">
                        <ConcernIcon slug={c.slug || c.name} className="w-8 h-8 text-emerald-600" />
                        <div>
                          <div className="font-bold text-gray-900">{c.name}</div>
                          <div className="text-[10px] text-gray-400 font-mono uppercase tracking-wider">{c.slug}</div>
                        </div>
                      </div>
                      <button onClick={() => handleDeleteConcern(c.id)} className="p-2 text-gray-400 hover:text-red-500 transition-colors">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                      </button>
                    </div>
                  ))}
                  {concerns.length === 0 && <p className="col-span-full text-center text-gray-400 py-8">No concerns defined yet.</p>}
                </div>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
