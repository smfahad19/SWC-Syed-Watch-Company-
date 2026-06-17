// Products.jsx
import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import api from '../../services/api';
import {
    FiPackage,
    FiPlus,
    FiX,
    FiEdit2,
    FiTrash2,
    FiImage as FiImageIcon,
} from 'react-icons/fi';

const Products = () => {
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [editing, setEditing] = useState(null);
    const [imageFiles, setImageFiles] = useState([]);
    const [existingImages, setExistingImages] = useState([]);
    const [form, setForm] = useState({
        name: '',
        description: '',
        price: '',
        discountPrice: '',
        stock: '',
        categoryId: '',
        isActive: true,
    });

    useEffect(() => { fetchAll(); }, []);

    const fetchAll = async () => {
        try {
            const [pRes, cRes] = await Promise.all([
                api.get('/admin/products'),
                api.get('/admin/categories'),
            ]);
            setProducts(pRes.data.data.products);
            setCategories(cRes.data.data);
        } catch {
            toast.error('Failed to load products');
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e) => {
        const val = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
        setForm({ ...form, [e.target.name]: val });
    };

    const handleImageChange = (e) => {
        const files = Array.from(e.target.files);
        setImageFiles(files);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const formData = new FormData();
        formData.append('name', form.name);
        formData.append('description', form.description);
        formData.append('price', form.price);
        if (form.discountPrice) formData.append('discountPrice', form.discountPrice);
        formData.append('stock', form.stock);
        formData.append('categoryId', form.categoryId);
        formData.append('isActive', form.isActive);
        imageFiles.forEach((file) => formData.append('images', file));

        try {
            if (editing) {
                await api.put(`/admin/products/${editing}`, formData, {
                    headers: { 'Content-Type': 'multipart/form-data' },
                });
                toast.success('Product updated');
            } else {
                await api.post('/admin/products', formData, {
                    headers: { 'Content-Type': 'multipart/form-data' },
                });
                toast.success('Product created');
            }
            resetForm();
            fetchAll();
        } catch {
            toast.error('Failed to save product');
        }
    };

    const resetForm = () => {
        setShowForm(false);
        setEditing(null);
        setImageFiles([]);
        setExistingImages([]);
        setForm({ name: '', description: '', price: '', discountPrice: '', stock: '', categoryId: '', isActive: true });
    };

    const handleEdit = (product) => {
        setEditing(product.id);
        setExistingImages(product.images || []);
        setImageFiles([]);
        setForm({
            name: product.name,
            description: product.description,
            price: product.price,
            discountPrice: product.discountPrice || '',
            stock: product.stock,
            categoryId: product.categoryId,
            isActive: product.isActive,
        });
        setShowForm(true);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleDelete = async (id) => {
        if (!confirm('Delete this product?')) return;
        try {
            await api.delete(`/admin/products/${id}`);
            toast.success('Product deleted');
            fetchAll();
        } catch {
            toast.error('Failed to delete');
        }
    };

    if (loading) return <div className="text-white/40 text-sm animate-pulse">Loading products…</div>;

    return (
        <div>

            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6 sm:mb-8">
                <div className="flex items-center gap-3 flex-wrap">
                    <div className="p-2.5 rounded-2xl bg-blue-600/20 border border-blue-500/20 flex-shrink-0">
                        <FiPackage className="text-blue-400 text-2xl" />
                    </div>
                    <h1 className="text-xl sm:text-2xl font-bold tracking-widest text-white">Products</h1>
                    <span className="text-[10px] tracking-[0.2em] uppercase text-white/30 bg-white/5 px-3 sm:px-4 py-1.5 rounded-full border border-white/5">
                        {products.length} total
                    </span>
                </div>
                <button
                    onClick={() => { resetForm();
                        setShowForm(!showForm); }}
                    className={`
                        flex items-center justify-center gap-2 px-4 sm:px-5 py-2.5 rounded-2xl text-[10px] sm:text-xs tracking-widest uppercase font-medium transition-all duration-200 w-full sm:w-auto
                        ${showForm
                            ? 'bg-white/5 text-white/40 hover:text-white border border-white/10 hover:border-white/20'
                            : 'bg-blue-600 text-white shadow-[0_0_30px_rgba(59,130,246,0.25)] hover:shadow-[0_0_40px_rgba(59,130,246,0.35)] hover:bg-blue-500'
                        }
                    `}
                >
                    {showForm ? <FiX className="text-lg" /> : <FiPlus className="text-lg" />}
                    {showForm ? 'Cancel' : 'Add Product'}
                </button>
            </div>

            {/* Form */}
            {showForm && (
                <form onSubmit={handleSubmit} className="bg-[#0e1629]/60 backdrop-blur-xl border border-white/5 rounded-2xl sm:rounded-3xl p-4 sm:p-6 mb-6 sm:mb-8 shadow-xl shadow-black/20 grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                    <div className="sm:col-span-2 md:col-span-1">
                        <label className="text-[10px] tracking-[0.2em] uppercase text-white/30 block mb-1.5">Name *</label>
                        <input type="text" name="name" value={form.name} onChange={handleChange} required
                            className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-2.5 text-sm text-white outline-none focus:border-blue-500/50 transition" />
                    </div>
                    <div className="sm:col-span-2 md:col-span-1">
                        <label className="text-[10px] tracking-[0.2em] uppercase text-white/30 block mb-1.5">Category *</label>
                        <select name="categoryId" value={form.categoryId} onChange={handleChange} required
                            className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-2.5 text-sm text-white outline-none focus:border-blue-500/50 transition">
                            <option value="" className="bg-[#0e1629]">Select Category</option>
                            {categories.map((c) => (
                                <option key={c.id} value={c.id} className="bg-[#0e1629]">{c.name}</option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className="text-[10px] tracking-[0.2em] uppercase text-white/30 block mb-1.5">Price (Rs.) *</label>
                        <input type="number" name="price" value={form.price} onChange={handleChange} required
                            className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-2.5 text-sm text-white outline-none focus:border-blue-500/50 transition" />
                    </div>
                    <div>
                        <label className="text-[10px] tracking-[0.2em] uppercase text-white/30 block mb-1.5">Discount Price (Rs.)</label>
                        <input type="number" name="discountPrice" value={form.discountPrice} onChange={handleChange}
                            className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-2.5 text-sm text-white outline-none focus:border-blue-500/50 transition" />
                    </div>
                    <div>
                        <label className="text-[10px] tracking-[0.2em] uppercase text-white/30 block mb-1.5">Stock *</label>
                        <input type="number" name="stock" value={form.stock} onChange={handleChange} required
                            className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-2.5 text-sm text-white outline-none focus:border-blue-500/50 transition" />
                    </div>
                    <div className="flex items-end gap-3 pb-1">
                        <input type="checkbox" name="isActive" checked={form.isActive} onChange={handleChange} id="isActive"
                            className="w-4 h-4 accent-blue-500 rounded border-white/10 bg-white/5" />
                        <label htmlFor="isActive" className="text-sm text-white/50 tracking-wide">Active</label>
                    </div>
                    <div className="sm:col-span-2">
                        <label className="text-[10px] tracking-[0.2em] uppercase text-white/30 block mb-1.5">Description *</label>
                        <textarea name="description" value={form.description} onChange={handleChange} rows={3} required
                            className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-2.5 text-sm text-white outline-none focus:border-blue-500/50 transition resize-none" />
                    </div>
                    <div className="sm:col-span-2">
                        <label className="text-[10px] tracking-[0.2em] uppercase text-white/30 block mb-1.5">
                            Images (max 5) {editing ? '— upload new to replace' : ''}
                        </label>
                        <input type="file" multiple accept="image/*" onChange={handleImageChange}
                            className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-2.5 text-sm text-white outline-none focus:border-blue-500/50 transition file:mr-4 file:py-1.5 file:px-3 file:rounded-xl file:border-0 file:bg-white/10 file:text-white/70 file:text-xs file:font-medium hover:file:bg-white/20" />
                        {imageFiles.length > 0 && (
                            <p className="text-[10px] sm:text-xs text-white/30 mt-1.5">{imageFiles.length} new file(s) selected</p>
                        )}
                    </div>
                    {editing && existingImages.length > 0 && (
                        <div className="sm:col-span-2">
                            <p className="text-[10px] tracking-[0.2em] uppercase text-white/30 mb-2">Current Images</p>
                            <div className="flex gap-2 flex-wrap">
                                {existingImages.map((img, i) => (
                                    <img key={i} src={img} alt="product" className="w-12 sm:w-16 h-12 sm:h-16 object-cover rounded-xl border border-white/10" />
                                ))}
                            </div>
                        </div>
                    )}
                    {imageFiles.length > 0 && (
                        <div className="sm:col-span-2">
                            <p className="text-[10px] tracking-[0.2em] uppercase text-white/30 mb-2">New Images Preview</p>
                            <div className="flex gap-2 flex-wrap">
                                {imageFiles.map((file, i) => (
                                    <img key={i} src={URL.createObjectURL(file)} alt="preview"
                                        className="w-12 sm:w-16 h-12 sm:h-16 object-cover rounded-xl border border-white/10" />
                                ))}
                            </div>
                        </div>
                    )}
                    <div className="sm:col-span-2 flex flex-col sm:flex-row gap-3 pt-2">
                        <button type="submit"
                            className="bg-blue-600 text-white px-6 sm:px-8 py-2.5 rounded-2xl text-[10px] sm:text-xs tracking-widest uppercase font-medium shadow-[0_0_30px_rgba(59,130,246,0.2)] hover:shadow-[0_0_40px_rgba(59,130,246,0.3)] hover:bg-blue-500 transition-all duration-200 w-full sm:w-auto">
                            {editing ? 'Update Product' : 'Create Product'}
                        </button>
                        <button type="button" onClick={resetForm}
                            className="border border-white/10 text-white/40 hover:text-white px-6 py-2.5 rounded-2xl text-[10px] sm:text-xs tracking-widest uppercase transition-all duration-200 w-full sm:w-auto">
                            Cancel
                        </button>
                    </div>
                </form>
            )}

            {/* Table */}
            <div className="bg-[#0e1629]/60 backdrop-blur-xl border border-white/5 rounded-2xl sm:rounded-3xl shadow-xl shadow-black/20 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm min-w-[800px]">
                        <thead className="border-b border-white/5">
                            <tr>
                                {['Image', 'Name', 'Category', 'Price', 'Stock', 'Active', 'Actions'].map((h) => (
                                    <th key={h} className="text-left px-3 sm:px-5 py-3 sm:py-3.5 text-[9px] sm:text-[10px] tracking-[0.2em] uppercase text-white/30 font-medium">
                                        {h}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {products.map((product) => (
                                <tr key={product.id} className="border-b border-white/5 hover:bg-white/5 transition">
                                    <td className="px-3 sm:px-5 py-3 sm:py-3.5">
                                        {product.images?.[0] ? (
                                            <img src={product.images[0]} alt={product.name} className="w-10 sm:w-14 h-10 sm:h-14 object-cover rounded-xl border border-white/10" />
                                        ) : (
                                            <div className="w-10 sm:w-14 h-10 sm:h-14 rounded-xl bg-white/5 border border-white/5 flex items-center justify-center">
                                                <FiImageIcon className="text-white/20 text-sm sm:text-base" />
                                            </div>
                                        )}
                                    </td>
                                    <td className="px-3 sm:px-5 py-3 sm:py-3.5 font-medium text-white/80 text-xs sm:text-sm truncate max-w-[80px] sm:max-w-none">{product.name}</td>
                                    <td className="px-3 sm:px-5 py-3 sm:py-3.5 text-white/40 text-[10px] sm:text-xs truncate max-w-[60px] sm:max-w-none">{product.category?.name || '—'}</td>
                                    <td className="px-3 sm:px-5 py-3 sm:py-3.5">
                                        {product.discountPrice ? (
                                            <div className="flex flex-wrap items-center gap-1 sm:gap-2">
                                                <span className="font-bold text-white/90 text-xs sm:text-sm">Rs. {product.discountPrice?.toLocaleString()}</span>
                                                <span className="text-[8px] sm:text-xs text-white/30 line-through">Rs. {product.price?.toLocaleString()}</span>
                                            </div>
                                        ) : (
                                            <span className="text-white/80 text-xs sm:text-sm">Rs. {product.price?.toLocaleString()}</span>
                                        )}
                                    </td>
                                    <td className="px-3 sm:px-5 py-3 sm:py-3.5">
                                        <span className={`text-[8px] sm:text-xs font-semibold px-2 sm:px-3 py-0.5 sm:py-1 rounded-full ${product.stock <= 5
                                                ? 'bg-red-500/20 text-red-400 border border-red-500/20'
                                                : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/20'
                                            }`}>
                                            {product.stock} left
                                        </span>
                                    </td>
                                    <td className="px-3 sm:px-5 py-3 sm:py-3.5">
                                        <span className={`text-[8px] sm:text-[10px] font-semibold px-2 sm:px-3 py-0.5 sm:py-1 rounded-full ${product.isActive
                                                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/20'
                                                : 'bg-white/5 text-white/30 border border-white/10'
                                            }`}>
                                            {product.isActive ? 'Active' : 'Inactive'}
                                        </span>
                                    </td>
                                    <td className="px-3 sm:px-5 py-3 sm:py-3.5">
                                        <div className="flex items-center gap-1 sm:gap-2">
                                            <button onClick={() => handleEdit(product)}
                                                className="p-1.5 sm:p-2 rounded-xl bg-white/5 border border-white/10 text-white/40 hover:text-white hover:border-blue-500/30 transition-all duration-200">
                                                <FiEdit2 className="text-xs sm:text-sm" />
                                            </button>
                                            <button onClick={() => handleDelete(product.id)}
                                                className="p-1.5 sm:p-2 rounded-xl bg-white/5 border border-white/10 text-white/40 hover:text-red-400 hover:border-red-500/30 transition-all duration-200">
                                                <FiTrash2 className="text-xs sm:text-sm" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                {products.length === 0 && (
                    <div className="text-center py-12 sm:py-16 text-white/20 text-sm tracking-wider">No products yet. Create one above.</div>
                )}
            </div>
        </div>
    );
};

export default Products;