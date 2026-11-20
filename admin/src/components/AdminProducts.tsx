import React, { useEffect, useMemo, useState } from 'react';
import {
  Package,
  Plus,
  Pencil,
  Trash2,
  RefreshCw,
  X,
  Check,
  Search,
  AlertCircle,
  Sparkles,
  Upload,
} from 'lucide-react';
import { adminApi } from '../services/adminApi';

interface ProductItem {
  id: number;
  name: string;
  slug?: string;
  category: string;
  type: string;
  finish: string;
  price: number;
  badge?: string | null;
  description?: string;
  inStock: boolean;
  stockQuantity?: number;
  isFeatured?: boolean;
  purity?: string;
  image?: string;
  primaryImage?: string;
  gallery?: string[];
  sizes?: string[];
}

const defaultForm = {
  name: '',
  category: 'Men',
  type: 'Rings',
  finish: 'High Polish',
  price: 12000,
  badge: '',
  description: '',
  inStock: true,
  stockQuantity: 50,
  isFeatured: false,
  purity: '925 Sterling Silver',
  image: '',
  gallery: '',
  sizes: '16, 18, 20, 22',
};

export default function AdminProducts() {
  const [products, setProducts] = useState<ProductItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalMode, setModalMode] = useState<'create' | 'edit' | null>(null);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<ProductItem | null>(null);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  // Search and Filter State
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [stockFilter, setStockFilter] = useState<'all' | 'in_stock' | 'out_of_stock'>('all');

  // Form State
  const [form, setForm] = useState(defaultForm);
  const [uploadingImage, setUploadingImage] = useState(false);

  const handleImageFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingImage(true);
    try {
      const res = await adminApi.uploadProductImage(file);
      if (res && res.success && res.imageUrl) {
        const fullUrl = `http://localhost:5000${res.imageUrl}`;
        setForm((prev) => ({ ...prev, image: fullUrl }));
        showToast('Image uploaded and set as primary photo!');
      } else {
        showToast(res?.message || 'Failed to upload image', 'error');
      }
    } catch (err: any) {
      showToast(err.message || 'Image upload failed', 'error');
    } finally {
      setUploadingImage(false);
    }
  };

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const res = await adminApi.getProducts();
      if (res.success && Array.isArray(res.data)) {
        setProducts(res.data);
      }
    } catch (e) {
      console.error('Failed to load products:', e);
      showToast('Error connecting to product database.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  // Filtered Products
  const filteredProducts = useMemo(() => {
    return products.filter((item) => {
      // Search term
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesName = item.name?.toLowerCase().includes(q);
        const matchesDesc = item.description?.toLowerCase().includes(q);
        const matchesType = item.type?.toLowerCase().includes(q);
        const matchesFinish = item.finish?.toLowerCase().includes(q);
        if (!matchesName && !matchesDesc && !matchesType && !matchesFinish) {
          return false;
        }
      }

      // Category filter
      if (categoryFilter !== 'All' && item.category !== categoryFilter) {
        return false;
      }

      // Stock filter
      if (stockFilter === 'in_stock' && !item.inStock) return false;
      if (stockFilter === 'out_of_stock' && item.inStock) return false;

      return true;
    });
  }, [products, searchQuery, categoryFilter, stockFilter]);

  // Stock Summary Counts
  const totalCount = products.length;
  const inStockCount = products.filter((p) => p.inStock).length;
  const outOfStockCount = totalCount - inStockCount;

  // Toggle Stock API call
  const handleToggleStock = async (id: number) => {
    try {
      const res = await adminApi.toggleStock(id);
      if (res.success) {
        setProducts((prev) =>
          prev.map((p) => (p.id === id ? { ...p, inStock: res.inStock } : p))
        );
        showToast(
          `Stock status updated to ${res.inStock ? 'In Stock' : 'Out of Stock'}.`,
          'success'
        );
      }
    } catch (e: any) {
      showToast(e.message || 'Error updating stock', 'error');
    }
  };

  // Open Create Modal
  const handleOpenCreate = () => {
    setEditingId(null);
    setForm(defaultForm);
    setModalMode('create');
  };

  // Open Edit Modal prefilled with product data
  const handleOpenEdit = (product: ProductItem) => {
    setEditingId(product.id);
    const primaryImg = product.image || product.primaryImage || (product.gallery && product.gallery[0]) || '';
    const galleryString = Array.isArray(product.gallery) && product.gallery.length > 0
      ? product.gallery.join(', ')
      : primaryImg;
    const sizesString = Array.isArray(product.sizes) && product.sizes.length > 0
      ? product.sizes.join(', ')
      : (product.type === 'Rings' ? '16, 18, 20, 22' : 'One size');

    setForm({
      name: product.name || '',
      category: product.category || 'Men',
      type: product.type || 'Rings',
      finish: product.finish || 'High Polish',
      price: Number(product.price) || 12000,
      badge: product.badge || '',
      description: product.description || '',
      inStock: Boolean(product.inStock),
      stockQuantity: Number(product.stockQuantity) || 50,
      isFeatured: Boolean(product.isFeatured),
      purity: product.purity || '925 Sterling Silver',
      image: primaryImg,
      gallery: galleryString,
      sizes: sizesString,
    });
    setModalMode('edit');
  };

  // Form Submit for Create & Edit
  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const galleryArray = form.gallery
        ? form.gallery.split(/[\n,]+/).map((s) => s.trim()).filter(Boolean)
        : form.image
        ? [form.image.trim()]
        : [];

      const sizesArray = form.sizes
        ? form.sizes.split(',').map((s) => s.trim()).filter(Boolean)
        : form.type === 'Rings'
        ? ['16', '18', '20', '22']
        : ['One size'];

      const payload = {
        name: form.name.trim(),
        category: form.category,
        type: form.type,
        finish: form.finish,
        price: Number(form.price),
        badge: form.badge && form.badge !== '' && form.badge !== 'None' ? form.badge : null,
        description: form.description,
        inStock: Boolean(form.inStock),
        stockQuantity: Number(form.stockQuantity) || 50,
        isFeatured: Boolean(form.isFeatured),
        purity: form.purity || '925 Sterling Silver',
        image: form.image.trim(),
        gallery: galleryArray,
        sizes: sizesArray,
      };

      if (modalMode === 'edit' && editingId) {
        // CALL EDIT / UPDATE API
        const res = await adminApi.updateProduct(editingId, payload);
        if (res.success) {
          showToast(`"${form.name}" updated successfully!`, 'success');
          setModalMode(null);
          setEditingId(null);
          fetchProducts();
        } else {
          showToast(res.message || 'Error updating product', 'error');
        }
      } else {
        // CALL CREATE API
        const res = await adminApi.createProduct(payload);
        if (res.success) {
          showToast(`"${form.name}" added to catalog!`, 'success');
          setModalMode(null);
          setForm(defaultForm);
          fetchProducts();
        } else {
          showToast(res.message || 'Error creating product', 'error');
        }
      }
    } catch (err: any) {
      showToast(err.message || 'Operation failed', 'error');
    } finally {
      setSaving(false);
    }
  };

  // Delete Confirmation and Execution
  const handleExecuteDelete = async () => {
    if (!deleteTarget) return;
    try {
      const res = await adminApi.deleteProduct(deleteTarget.id);
      if (res.success) {
        setProducts((prev) => prev.filter((p) => p.id !== deleteTarget.id));
        showToast(`Piece "${deleteTarget.name}" deleted from catalog.`, 'success');
      } else {
        showToast(res.message || 'Failed to delete piece', 'error');
      }
    } catch (err: any) {
      showToast(err.message || 'Error deleting piece', 'error');
    } finally {
      setDeleteTarget(null);
    }
  };

  const formatPKR = (val: number) => {
    return new Intl.NumberFormat('en-PK', {
      style: 'currency',
      currency: 'PKR',
      maximumFractionDigits: 0,
    }).format(val || 0);
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6">
      {/* Toast Notification Alert */}
      {toast && (
        <div
          className={`fixed top-6 right-6 z-50 flex items-center gap-3 px-4 py-3 rounded-xl shadow-2xl border transition-all animate-in fade-in slide-in-from-top-4 duration-300 ${
            toast.type === 'success'
              ? 'bg-emerald-950/95 border-emerald-700/80 text-emerald-200'
              : 'bg-rose-950/95 border-rose-700/80 text-rose-200'
          }`}
        >
          {toast.type === 'success' ? <Check size={18} /> : <AlertCircle size={18} />}
          <span className="text-xs font-medium tracking-wide">{toast.message}</span>
          <button
            onClick={() => setToast(null)}
            className="p-1 hover:opacity-75 rounded transition"
          >
            <X size={14} />
          </button>
        </div>
      )}

      {/* Header with Stats & Actions */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-zinc-800/80 pb-6">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-semibold tracking-wide text-white">Product Catalog</h1>
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-zinc-800 text-zinc-300 border border-zinc-700">
              {totalCount} Pieces Total
            </span>
          </div>
          <p className="text-xs text-zinc-400 mt-1">
            Certified 925 sterling silver inventory · Real-time add, edit, update & delete operations
          </p>
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <button
            onClick={fetchProducts}
            disabled={loading}
            className="flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-medium bg-zinc-900 border border-zinc-700/80 text-zinc-300 hover:text-white hover:bg-zinc-800 transition shadow-sm"
          >
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
            <span>Refresh</span>
          </button>
          <button
            onClick={handleOpenCreate}
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold bg-white hover:bg-zinc-200 text-zinc-950 transition shadow-sm"
          >
            <Plus size={16} />
            <span>Add New Piece</span>
          </button>
        </div>
      </div>

      {/* Search & Filter Toolbar */}
      <div className="glass-panel p-4 rounded-xl border silver-border flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Search Input */}
        <div className="relative w-full md:w-80">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by name, type, finish..."
            className="w-full bg-zinc-900/90 border border-zinc-800 rounded-lg pl-9 pr-8 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-zinc-500 transition"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-white"
            >
              <X size={13} />
            </button>
          )}
        </div>

        {/* Filters Group */}
        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto justify-start md:justify-end">
          {/* Category Filter */}
          <div className="flex items-center bg-zinc-900/90 rounded-lg p-1 border border-zinc-800 text-[11px]">
            {['All', 'Men', 'Women', 'Unisex'].map((cat) => (
              <button
                key={cat}
                onClick={() => setCategoryFilter(cat)}
                className={`px-3 py-1 rounded-md font-medium transition ${
                  categoryFilter === cat
                    ? 'bg-zinc-700 text-white shadow-sm'
                    : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Stock Filter */}
          <div className="flex items-center bg-zinc-900/90 rounded-lg p-1 border border-zinc-800 text-[11px]">
            <button
              onClick={() => setStockFilter('all')}
              className={`px-3 py-1 rounded-md font-medium transition ${
                stockFilter === 'all'
                  ? 'bg-zinc-700 text-white shadow-sm'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              All ({totalCount})
            </button>
            <button
              onClick={() => setStockFilter('in_stock')}
              className={`px-3 py-1 rounded-md font-medium transition ${
                stockFilter === 'in_stock'
                  ? 'bg-emerald-950 text-emerald-300 border border-emerald-800/50 shadow-sm'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              In Stock ({inStockCount})
            </button>
            <button
              onClick={() => setStockFilter('out_of_stock')}
              className={`px-3 py-1 rounded-md font-medium transition ${
                stockFilter === 'out_of_stock'
                  ? 'bg-rose-950 text-rose-300 border border-rose-800/50 shadow-sm'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              Out of Stock ({outOfStockCount})
            </button>
          </div>
        </div>
      </div>

      {/* Catalog Table */}
      <div className="glass-panel rounded-xl border silver-border overflow-hidden shadow-xl">
        {loading ? (
          <div className="p-16 text-center text-zinc-400 text-xs flex flex-col items-center gap-3">
            <div className="w-7 h-7 border-2 border-zinc-600 border-t-white rounded-full animate-spin" />
            <span>Loading pieces from TiDB Cloud database...</span>
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="p-16 text-center text-zinc-400 text-xs space-y-2">
            <Package size={32} className="mx-auto text-zinc-600 mb-2" />
            <p className="text-zinc-300 font-medium">No products match your current filters</p>
            <p className="text-zinc-500">
              Try adjusting your search query or click "Add New Piece" to insert one.
            </p>
            {(searchQuery || categoryFilter !== 'All' || stockFilter !== 'all') && (
              <button
                onClick={() => {
                  setSearchQuery('');
                  setCategoryFilter('All');
                  setStockFilter('all');
                }}
                className="mt-3 px-3 py-1.5 rounded-lg text-xs bg-zinc-800 hover:bg-zinc-700 text-white transition"
              >
                Clear Filters
              </button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-zinc-900/80 border-b border-zinc-800 text-zinc-400 uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="py-3 px-4 font-semibold">Piece</th>
                  <th className="py-3 px-4 font-semibold">Classification</th>
                  <th className="py-3 px-4 font-semibold">Finish</th>
                  <th className="py-3 px-4 font-semibold">Price</th>
                  <th className="py-3 px-4 font-semibold">Badge</th>
                  <th className="py-3 px-4 font-semibold">Stock Status</th>
                  <th className="py-3 px-4 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/60">
                {filteredProducts.map((item) => (
                  <tr key={item.id} className="hover:bg-zinc-900/40 transition group">
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        <div className="relative w-12 h-12 rounded-lg border border-zinc-800 overflow-hidden bg-zinc-950 shrink-0">
                          <img
                            src={
                              item.image ||
                              item.primaryImage ||
                              (item.gallery && item.gallery[0]) ||
                              'https://images.unsplash.com/photo-1656010280162-772358d9f4ed?auto=format&fit=crop&w=400&q=80'
                            }
                            alt={item.name}
                            className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                            onError={(e: any) => {
                              e.currentTarget.src =
                                'https://images.unsplash.com/photo-1656010280162-772358d9f4ed?auto=format&fit=crop&w=400&q=80';
                            }}
                          />
                          {item.isFeatured && (
                            <span
                              title="Featured piece"
                              className="absolute top-1 left-1 p-0.5 rounded bg-amber-500/90 text-zinc-950"
                            >
                              <Sparkles size={10} />
                            </span>
                          )}
                        </div>
                        <div>
                          <p className="font-semibold text-white text-sm tracking-wide">
                            {item.name}
                          </p>
                          <p className="text-[11px] text-zinc-400 line-clamp-1 max-w-xs mt-0.5">
                            {item.description || '925 Sterling Silver hand-crafted piece.'}
                          </p>
                          <div className="flex items-center gap-2 mt-1">
                            {item.slug && (
                              <span className="text-[10px] text-zinc-500 font-mono">
                                /{item.slug}
                              </span>
                            )}
                            {item.sizes && item.sizes.length > 0 && (
                              <span className="text-[10px] text-zinc-400 bg-zinc-900 px-1.5 py-0.5 rounded border border-zinc-800">
                                Sizes: {item.sizes.join(', ')}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-zinc-300">
                      <span className="font-medium text-white">{item.category}</span>
                      <span className="block text-[11px] text-zinc-400 mt-0.5">{item.type}</span>
                    </td>
                    <td className="py-3.5 px-4 text-zinc-300 font-medium">{item.finish}</td>
                    <td className="py-3.5 px-4 font-semibold text-white text-sm">
                      {formatPKR(item.price)}
                    </td>
                    <td className="py-3.5 px-4">
                      {item.badge ? (
                        <span
                          className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider border ${
                            item.badge === 'Bestseller'
                              ? 'bg-amber-950/60 text-amber-300 border-amber-700/50'
                              : item.badge === 'New'
                              ? 'bg-sky-950/60 text-sky-300 border-sky-700/50'
                              : 'bg-purple-950/60 text-purple-300 border-purple-700/50'
                          }`}
                        >
                          {item.badge}
                        </span>
                      ) : (
                        <span className="text-zinc-600 text-[11px]">—</span>
                      )}
                    </td>
                    <td className="py-3.5 px-4">
                      <button
                        onClick={() => handleToggleStock(item.id)}
                        title="Click to toggle stock status"
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-semibold uppercase tracking-wider transition shadow-sm ${
                          item.inStock
                            ? 'bg-emerald-950/70 text-emerald-400 border border-emerald-800/60 hover:bg-emerald-900/60'
                            : 'bg-rose-950/70 text-rose-400 border border-rose-800/60 hover:bg-rose-900/60'
                        }`}
                      >
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${
                            item.inStock ? 'bg-emerald-400 animate-pulse' : 'bg-rose-400'
                          }`}
                        />
                        <span>{item.inStock ? 'In Stock' : 'Out of Stock'}</span>
                      </button>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {/* EDIT PRODUCT BUTTON */}
                        <button
                          onClick={() => handleOpenEdit(item)}
                          className="p-2 rounded-lg text-zinc-300 hover:text-white hover:bg-zinc-800 border border-zinc-800 hover:border-zinc-700 transition"
                          title="Edit this piece (Update price, details, images, sizes)"
                        >
                          <Pencil size={14} />
                        </button>

                        {/* DELETE PRODUCT BUTTON */}
                        <button
                          onClick={() => setDeleteTarget(item)}
                          className="p-2 rounded-lg text-zinc-400 hover:text-rose-400 hover:bg-rose-950/40 border border-zinc-800 hover:border-rose-900/60 transition"
                          title="Delete piece from catalog"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* CREATE & EDIT PRODUCT MODAL */}
      {modalMode && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
          <div className="glass-panel w-full max-w-2xl rounded-2xl border silver-border p-6 max-h-[92vh] overflow-y-auto space-y-5 shadow-2xl bg-[#111214]">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                {modalMode === 'edit' ? (
                  <>
                    <Pencil size={18} className="text-amber-400" />
                    <span>Edit Piece: {form.name || 'Untitled Piece'}</span>
                  </>
                ) : (
                  <>
                    <Package size={18} className="text-zinc-400" />
                    <span>Add 925 Sterling Silver Piece</span>
                  </>
                )}
              </h2>
              <button
                onClick={() => setModalMode(null)}
                className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition"
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleFormSubmit} className="space-y-4 text-xs">
              {/* Piece Name */}
              <div>
                <label className="block text-zinc-300 mb-1 font-medium">Piece Name *</label>
                <input
                  required
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
                  placeholder="e.g. Damascus Signet Ring"
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-lg p-2.5 text-white text-xs focus:outline-none focus:border-zinc-500 silver-glow transition"
                />
              </div>

              {/* Classification Row: Gender, Type, Finish */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-zinc-300 mb-1 font-medium">Classification</label>
                  <select
                    value={form.category}
                    onChange={(e) => setForm((prev) => ({ ...prev, category: e.target.value }))}
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-lg p-2.5 text-white text-xs focus:outline-none focus:border-zinc-500"
                  >
                    <option value="Men">Men</option>
                    <option value="Women">Women</option>
                    <option value="Unisex">Unisex</option>
                  </select>
                </div>

                <div>
                  <label className="block text-zinc-300 mb-1 font-medium">Piece Type</label>
                  <select
                    value={form.type}
                    onChange={(e) => setForm((prev) => ({ ...prev, type: e.target.value }))}
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-lg p-2.5 text-white text-xs focus:outline-none focus:border-zinc-500"
                  >
                    <option value="Rings">Rings</option>
                    <option value="Necklaces">Necklaces</option>
                    <option value="Earrings">Earrings</option>
                    <option value="Bracelets">Bracelets</option>
                    <option value="Chains">Chains</option>
                  </select>
                </div>

                <div>
                  <label className="block text-zinc-300 mb-1 font-medium">Silver Finish</label>
                  <select
                    value={form.finish}
                    onChange={(e) => setForm((prev) => ({ ...prev, finish: e.target.value }))}
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-lg p-2.5 text-white text-xs focus:outline-none focus:border-zinc-500"
                  >
                    <option value="High Polish">High Polish</option>
                    <option value="Oxidized Silver">Oxidized Silver</option>
                    <option value="Brushed Matte">Brushed Matte</option>
                    <option value="Textured">Textured</option>
                  </select>
                </div>
              </div>

              {/* Price, Badge, Stock Quantity */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-zinc-300 mb-1 font-medium">Price (PKR) *</label>
                  <input
                    required
                    type="number"
                    min="0"
                    step="100"
                    value={form.price}
                    onChange={(e) =>
                      setForm((prev) => ({ ...prev, price: Number(e.target.value) }))
                    }
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-lg p-2.5 text-white text-xs focus:outline-none focus:border-zinc-500 silver-glow transition"
                  />
                </div>

                <div>
                  <label className="block text-zinc-300 mb-1 font-medium">Badge</label>
                  <select
                    value={form.badge}
                    onChange={(e) => setForm((prev) => ({ ...prev, badge: e.target.value }))}
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-lg p-2.5 text-white text-xs focus:outline-none focus:border-zinc-500"
                  >
                    <option value="">None</option>
                    <option value="Bestseller">Bestseller</option>
                    <option value="New">New</option>
                    <option value="Limited">Limited</option>
                  </select>
                </div>

                <div>
                  <label className="block text-zinc-300 mb-1 font-medium">Stock Quantity</label>
                  <input
                    type="number"
                    min="0"
                    value={form.stockQuantity}
                    onChange={(e) =>
                      setForm((prev) => ({ ...prev, stockQuantity: Number(e.target.value) }))
                    }
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-lg p-2.5 text-white text-xs focus:outline-none focus:border-zinc-500"
                  />
                </div>
              </div>

              {/* Sizes Field */}
              <div>
                <label className="block text-zinc-300 mb-1 font-medium">
                  Sizes Available (Comma-separated)
                </label>
                <input
                  type="text"
                  value={form.sizes}
                  onChange={(e) => setForm((prev) => ({ ...prev, sizes: e.target.value }))}
                  placeholder="e.g. 16, 18, 20, 22 or One size"
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-lg p-2.5 text-white text-xs focus:outline-none focus:border-zinc-500"
                />
              </div>

              {/* Image URL & Live Preview */}
              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="text-zinc-300 font-medium">Primary Piece Image</label>
                  <label className="cursor-pointer text-[11px] text-zinc-300 hover:text-white flex items-center gap-1 bg-zinc-800 hover:bg-zinc-700 px-2 py-0.5 rounded border border-zinc-700">
                    <Upload size={12} />
                    <span>{uploadingImage ? 'Uploading...' : 'Upload File'}</span>
                    <input
                      type="file"
                      accept=".png,.jpg,.jpeg,.webp"
                      className="hidden"
                      disabled={uploadingImage}
                      onChange={handleImageFileChange}
                    />
                  </label>
                </div>
                <div className="flex gap-3 items-start">
                  <div className="flex-1">
                    <input
                      type="url"
                      value={form.image}
                      onChange={(e) => setForm((prev) => ({ ...prev, image: e.target.value }))}
                      placeholder="https://images.unsplash.com/... or click Upload File above"
                      className="w-full bg-zinc-900 border border-zinc-800 rounded-lg p-2.5 text-white text-xs focus:outline-none focus:border-zinc-500 silver-glow"
                    />
                    <p className="text-[11px] text-zinc-500 mt-1">
                      Paste a direct URL or click "Upload File" to store locally in server/uploads.
                    </p>
                  </div>
                  {/* Live Image Preview Thumbnail */}
                  <div className="w-14 h-14 rounded-lg border border-zinc-700 bg-zinc-950 overflow-hidden shrink-0 flex items-center justify-center relative">
                    {form.image ? (
                      <img
                        src={form.image}
                        alt="Preview"
                        className="w-full h-full object-cover"
                        onError={(e: any) => {
                          e.currentTarget.style.display = 'none';
                        }}
                      />
                    ) : (
                      <Package size={20} className="text-zinc-600" />
                    )}
                    <span className="absolute bottom-0 right-0 bg-black/70 text-[9px] font-mono px-1 text-zinc-300">
                      925
                    </span>
                  </div>
                </div>
              </div>

              {/* Gallery Image URLs */}
              <div>
                <label className="block text-zinc-300 mb-1 font-medium">
                  Additional Gallery Images (Comma or newline separated)
                </label>
                <textarea
                  rows={2}
                  value={form.gallery}
                  onChange={(e) => setForm((prev) => ({ ...prev, gallery: e.target.value }))}
                  placeholder="https://images.unsplash.com/photo-1..., https://images.unsplash.com/photo-2..."
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-lg p-2.5 text-white text-xs focus:outline-none focus:border-zinc-500"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-zinc-300 mb-1 font-medium">Description</label>
                <textarea
                  rows={3}
                  value={form.description}
                  onChange={(e) => setForm((prev) => ({ ...prev, description: e.target.value }))}
                  placeholder="Crafted in 925 sterling silver with hand-applied satin matte grain..."
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-lg p-2.5 text-white text-xs focus:outline-none focus:border-zinc-500"
                />
              </div>

              {/* Checkboxes: inStock & isFeatured */}
              <div className="flex flex-wrap items-center gap-6 pt-2 border-t border-zinc-800/80">
                <label className="flex items-center gap-2 cursor-pointer text-zinc-300 font-medium">
                  <input
                    type="checkbox"
                    checked={form.inStock}
                    onChange={(e) => setForm((prev) => ({ ...prev, inStock: e.target.checked }))}
                    className="w-4 h-4 rounded border-zinc-700 bg-zinc-900 text-white accent-white cursor-pointer"
                  />
                  <span>Available in Stock immediately</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer text-zinc-300 font-medium">
                  <input
                    type="checkbox"
                    checked={form.isFeatured}
                    onChange={(e) =>
                      setForm((prev) => ({ ...prev, isFeatured: e.target.checked }))
                    }
                    className="w-4 h-4 rounded border-zinc-700 bg-zinc-900 text-white accent-white cursor-pointer"
                  />
                  <span className="flex items-center gap-1.5">
                    <Sparkles size={13} className="text-amber-400" />
                    <span>Feature on homepage / curated collections</span>
                  </span>
                </label>
              </div>

              {/* Modal Actions */}
              <div className="flex justify-end gap-3 pt-4 border-t border-zinc-800">
                <button
                  type="button"
                  onClick={() => setModalMode(null)}
                  className="px-4 py-2 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-zinc-300 border border-zinc-800 transition font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2 rounded-lg bg-white hover:bg-zinc-200 text-zinc-950 font-semibold flex items-center gap-1.5 transition shadow-md"
                >
                  {saving ? (
                    <>
                      <div className="w-4 h-4 border-2 border-zinc-950 border-t-transparent rounded-full animate-spin" />
                      <span>Saving changes...</span>
                    </>
                  ) : modalMode === 'edit' ? (
                    <>
                      <Check size={16} />
                      <span>Update Piece</span>
                    </>
                  ) : (
                    <>
                      <Check size={16} />
                      <span>Publish to Store</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DELETE CONFIRMATION MODAL */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
          <div className="glass-panel w-full max-w-md rounded-2xl border border-rose-900/60 p-6 space-y-4 shadow-2xl bg-[#131011]">
            <div className="flex items-center gap-3 text-rose-400">
              <div className="p-2 rounded-full bg-rose-950/80 border border-rose-800/60">
                <Trash2 size={20} />
              </div>
              <h3 className="text-base font-semibold text-white">Delete Product Piece</h3>
            </div>
            <p className="text-xs text-zinc-300 leading-relaxed">
              Are you sure you want to permanently remove{' '}
              <strong className="text-white">"{deleteTarget.name}"</strong> from your catalog? This
              will remove it from the online store and all collections.
            </p>
            <div className="flex justify-end gap-3 pt-3 border-t border-zinc-800">
              <button
                type="button"
                onClick={() => setDeleteTarget(null)}
                className="px-4 py-2 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-zinc-300 border border-zinc-800 transition font-medium text-xs"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleExecuteDelete}
                className="px-5 py-2 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-semibold transition text-xs flex items-center gap-1.5 shadow-md"
              >
                <Trash2 size={14} />
                <span>Delete Permanently</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
