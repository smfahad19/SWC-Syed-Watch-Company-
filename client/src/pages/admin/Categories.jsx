// Categories.jsx
import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import api from '../../services/api';
import { FiGrid, FiPlus, FiX, FiEdit2, FiTrash2, FiFolder } from 'react-icons/fi';

const Categories = () => {
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [editing, setEditing] = useState(null);
    const [form, setForm] = useState({ name: '', description: '', image: '' });

    useEffect(() => { fetchCategories(); }, []);

    const fetchCategories = async () => {
        try {
            const res = await api.get('/admin/categories');
            setCategories(res.data.data);
        } catch {
            toast.error('Failed to load categories');
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editing) {
                await api.put(`/admin/categories/${editing}`, form);
                toast.success('Category updated');
            } else {
                await api.post('/admin/categories', form);
                toast.success('Category created');
            }
            setShowForm(false);
            setEditing(null);
            setForm({ name: '', description: '', image: '' });
            fetchCategories();
        } catch {
            toast.error('Failed to save category');
        }
    };

    const handleEdit = (cat) => {
        setEditing(cat.id);
        setForm({ name: cat.name, description: cat.description || '', image: cat.image || '' });
        setShowForm(true);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleDelete = async (id) => {
        if (!confirm('Delete this category?')) return;
        try {
            await api.delete(`/admin/categories/${id}`);
            toast.success('Category deleted');
            fetchCategories();
        } catch {
            toast.error('Failed to delete — remove products first');
        }
    };

    if (loading) return <div className="text-white/40 text-sm animate-pulse">Loading categories…</div>;

    return (
        <div>

            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6 sm:mb-8">
                <div className="flex items-center gap-3 flex-wrap">
                    <div className="p-2.5 rounded-2xl bg-blue-600/20 border border-blue-500/20 flex-shrink-0">
                        <FiGrid className="text-blue-400 text-2xl" />
                    </div>
                    <h1 className="text-xl sm:text-2xl font-bold tracking-widest text-white">Categories</h1>
                    <span className="text-[10px] tracking-[0.2em] uppercase text-white/30 bg-white/5 px-3 sm:px-4 py-1.5 rounded-full border border-white/5">
                        {categories.length} total
                    </span>
                </div>
                <button
                    onClick={() => { setShowForm(!showForm);
                        setEditing(null); }}
                    className={`
                        flex items-center justify-center gap-2 px-4 sm:px-5 py-2.5 rounded-2xl text-[10px] sm:text-xs tracking-widest uppercase font-medium transition-all duration-200 w-full sm:w-auto
                        ${showForm
                            ? 'bg-white/5 text-white/40 hover:text-white border border-white/10 hover:border-white/20'
                            : 'bg-blue-600 text-white shadow-[0_0_30px_rgba(59,130,246,0.25)] hover:shadow-[0_0_40px_rgba(59,130,246,0.35)] hover:bg-blue-500'
                        }
                    `}
                >
                    {showForm ? <FiX className="text-lg" /> : <FiPlus className="text-lg" />}
                    {showForm ? 'Cancel' : 'Add Category'}
                </button>
            </div>

            {/* Form */}
            {showForm && (
                <form onSubmit={handleSubmit} className="bg-[#0e1629]/60 backdrop-blur-xl border border-white/5 rounded-2xl sm:rounded-3xl p-4 sm:p-6 mb-6 sm:mb-8 shadow-xl shadow-black/20 max-w-2xl mx-auto">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                        <div>
                            <label className="text-[10px] tracking-[0.2em] uppercase text-white/30 block mb-1.5">Name *</label>
                            <input type="text" name="name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
                                className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-2.5 text-sm text-white outline-none focus:border-blue-500/50 transition" />
                        </div>
                        <div>
                            <label className="text-[10px] tracking-[0.2em] uppercase text-white/30 block mb-1.5">Image URL</label>
                            <input type="text" name="image" value={form.image} onChange={(e) => setForm({ ...form, image: e.target.value })}
                                className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-2.5 text-sm text-white outline-none focus:border-blue-500/50 transition" />
                        </div>
                        <div className="sm:col-span-2">
                            <label className="text-[10px] tracking-[0.2em] uppercase text-white/30 block mb-1.5">Description</label>
                            <input type="text" name="description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })}
                                className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-2.5 text-sm text-white outline-none focus:border-blue-500/50 transition" />
                        </div>
                    </div>
                    <div className="flex flex-col sm:flex-row gap-3 mt-4">
                        <button type="submit"
                            className="bg-blue-600 text-white px-6 sm:px-8 py-2.5 rounded-2xl text-[10px] sm:text-xs tracking-widest uppercase font-medium shadow-[0_0_30px_rgba(59,130,246,0.2)] hover:shadow-[0_0_40px_rgba(59,130,246,0.3)] hover:bg-blue-500 transition-all duration-200 w-full sm:w-auto">
                            {editing ? 'Update' : 'Create'}
                        </button>
                        <button type="button" onClick={() => { setShowForm(false);
                            setEditing(null); }}
                            className="border border-white/10 text-white/40 hover:text-white px-6 py-2.5 rounded-2xl text-[10px] sm:text-xs tracking-widest uppercase transition-all duration-200 w-full sm:w-auto">
                            Cancel
                        </button>
                    </div>
                </form>
            )}

            {/* Cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                {categories.map((cat) => (
                    <div
                        key={cat.id}
                        className="bg-[#0e1629]/60 backdrop-blur-xl border border-white/5 rounded-2xl sm:rounded-3xl p-4 sm:p-6 shadow-xl shadow-black/20 hover:border-blue-500/20 transition-all duration-300 group"
                    >
                        <div className="flex flex-wrap items-start justify-between gap-2">
                            <div className="flex items-center gap-3 min-w-0">
                                <div className="p-2 sm:p-2.5 rounded-2xl bg-white/5 border border-white/5 flex-shrink-0">
                                    <FiFolder className="text-blue-400 text-base sm:text-lg" />
                                </div>
                                <div className="min-w-0">
                                    <h3 className="font-bold tracking-wide text-white text-sm sm:text-base truncate">{cat.name}</h3>
                                    <p className="text-[10px] sm:text-xs text-white/30 truncate">{cat.description || 'No description'}</p>
                                </div>
                            </div>
                            <span className="text-[8px] sm:text-[10px] font-semibold text-white/30 bg-white/5 px-2 sm:px-3 py-0.5 sm:py-1 rounded-full border border-white/5 flex-shrink-0">
                                {cat._count?.products || 0} products
                            </span>
                        </div>
                        <div className="flex gap-2 mt-4 pt-4 border-t border-white/5">
                            <button onClick={() => handleEdit(cat)}
                                className="flex items-center gap-1 px-3 sm:px-3.5 py-1.5 rounded-xl bg-white/5 border border-white/10 text-white/40 hover:text-white hover:border-blue-500/30 text-[10px] sm:text-xs transition-all duration-200">
                                <FiEdit2 className="text-xs sm:text-sm" /> Edit
                            </button>
                            <button onClick={() => handleDelete(cat.id)}
                                className="flex items-center gap-1 px-3 sm:px-3.5 py-1.5 rounded-xl bg-white/5 border border-white/10 text-white/40 hover:text-red-400 hover:border-red-500/30 text-[10px] sm:text-xs transition-all duration-200">
                                <FiTrash2 className="text-xs sm:text-sm" /> Delete
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            {categories.length === 0 && (
                <div className="text-center py-12 sm:py-16 text-white/20 text-sm tracking-wider">No categories yet. Create one above.</div>
            )}
        </div>
    );
};

export default Categories;