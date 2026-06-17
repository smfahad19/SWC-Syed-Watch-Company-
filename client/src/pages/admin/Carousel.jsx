import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import api from '../../services/api';
import { FiPlus, FiX, FiEdit2, FiTrash2, FiImage as FiImageIcon, FiChevronUp, FiChevronDown } from 'react-icons/fi';

// API base for local fallback only
const API_BASE = import.meta.env.VITE_API_BASE_URL || 'https://swc-syed-watch-company-backend.vercel.app/api/v1';

// ─── Helper: handles both Cloudinary absolute URLs and local relative paths ──
const getImageUrl = (image) => {
  if (!image) return null;
  // If it's already an absolute URL (http/https), use it as-is
  if (image.startsWith('http://') || image.startsWith('https://')) {
    return image;
  }
  // Otherwise, treat as local relative path
  return `${API_BASE}${image}`;
};

const Carousel = () => {
  const [slides, setSlides] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [form, setForm] = useState({
    title: '',
    subtitle: '',
    desc: '',
    bgColor: '#0e1629',
    link: '',
    order: 0,
    isActive: true,
  });

  useEffect(() => { fetchSlides(); }, []);

  const fetchSlides = async () => {
    try {
      const res = await api.get('/admin/carousel');
      setSlides(res.data.data);
    } catch {
      toast.error('Failed to load carousel');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const val = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    setForm({ ...form, [e.target.name]: val });
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const resetForm = () => {
    setShowForm(false);
    setEditing(null);
    setImageFile(null);
    setImagePreview('');
    setForm({ title: '', subtitle: '', desc: '', bgColor: '#0e1629', link: '', order: 0, isActive: true });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append('title', form.title);
    formData.append('subtitle', form.subtitle || '');
    formData.append('desc', form.desc || '');
    formData.append('bgColor', form.bgColor);
    formData.append('link', form.link || '');
    formData.append('order', form.order);
    formData.append('isActive', form.isActive);
    if (imageFile) {
      formData.append('image', imageFile);
    }

    try {
      if (editing) {
        await api.put(`/admin/carousel/${editing}`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        toast.success('Slide updated');
      } else {
        await api.post('/admin/carousel', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        toast.success('Slide created');
      }
      resetForm();
      fetchSlides();
    } catch {
      toast.error('Failed to save slide');
    }
  };

  const handleEdit = (slide) => {
    setEditing(slide.id);
    setForm({
      title: slide.title || '',
      subtitle: slide.subtitle || '',
      desc: slide.desc || '',
      bgColor: slide.bgColor || '#0e1629',
      link: slide.link || '',
      order: slide.order || 0,
      isActive: slide.isActive !== undefined ? slide.isActive : true,
    });
    setImagePreview('');
    setImageFile(null);
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this slide?')) return;
    try {
      await api.delete(`/admin/carousel/${id}`);
      toast.success('Slide deleted');
      fetchSlides();
    } catch {
      toast.error('Failed to delete');
    }
  };

  const handleReorder = async (dragIndex, hoverIndex) => {
    const newSlides = [...slides];
    const dragged = newSlides[dragIndex];
    newSlides.splice(dragIndex, 1);
    newSlides.splice(hoverIndex, 0, dragged);
    const reordered = newSlides.map((slide, idx) => ({ ...slide, order: idx }));
    setSlides(reordered);
    try {
      await api.put('/admin/carousel/reorder', { slides: reordered.map(s => ({ id: s.id, order: s.order })) });
      toast.success('Order saved');
    } catch {
      toast.error('Reorder failed');
      fetchSlides();
    }
  };

  if (loading) return <div className="text-white/40 text-sm animate-pulse">Loading slides…</div>;

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6 sm:mb-8">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-2xl bg-blue-600/20 border border-blue-500/20 flex-shrink-0">
            <FiImageIcon className="text-blue-400 text-2xl" />
          </div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-widest text-white">Carousel</h1>
        </div>
        <button
          onClick={() => { resetForm(); setShowForm(!showForm); }}
          className={`flex items-center justify-center gap-2 px-4 sm:px-5 py-2.5 rounded-2xl text-[10px] sm:text-xs tracking-widest uppercase font-medium transition-all duration-200 w-full sm:w-auto ${
            showForm
              ? 'bg-white/5 text-white/40 hover:text-white border border-white/10 hover:border-white/20'
              : 'bg-blue-600 text-white shadow-[0_0_30px_rgba(59,130,246,0.25)] hover:shadow-[0_0_40px_rgba(59,130,246,0.35)] hover:bg-blue-500'
          }`}
        >
          {showForm ? <FiX className="text-lg" /> : <FiPlus className="text-lg" />}
          {showForm ? 'Cancel' : 'Add Slide'}
        </button>
      </div>

      {/* Form */}
      {showForm && (
        <form onSubmit={handleSubmit} className="bg-[#0e1629]/60 backdrop-blur-xl border border-white/5 rounded-2xl sm:rounded-3xl p-4 sm:p-6 mb-6 sm:mb-8 shadow-xl shadow-black/20 grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
          <div className="sm:col-span-2 md:col-span-1">
            <label className="text-[10px] tracking-[0.2em] uppercase text-white/30 block mb-1.5">Title *</label>
            <input type="text" name="title" value={form.title} onChange={handleChange} required
              className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-2.5 text-sm text-white outline-none focus:border-blue-500/50 transition" />
          </div>
          <div className="sm:col-span-2 md:col-span-1">
            <label className="text-[10px] tracking-[0.2em] uppercase text-white/30 block mb-1.5">Subtitle</label>
            <input type="text" name="subtitle" value={form.subtitle} onChange={handleChange}
              className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-2.5 text-sm text-white outline-none focus:border-blue-500/50 transition" />
          </div>
          <div className="sm:col-span-2">
            <label className="text-[10px] tracking-[0.2em] uppercase text-white/30 block mb-1.5">Description</label>
            <textarea name="desc" value={form.desc} onChange={handleChange} rows={2}
              className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-2.5 text-sm text-white outline-none focus:border-blue-500/50 transition resize-none" />
          </div>
          <div className="sm:col-span-2 md:col-span-1">
            <label className="text-[10px] tracking-[0.2em] uppercase text-white/30 block mb-1.5">Image</label>
            <input type="file" accept="image/*" onChange={handleFileChange}
              className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-2.5 text-sm text-white outline-none focus:border-blue-500/50 transition file:mr-4 file:py-1.5 file:px-3 file:rounded-xl file:border-0 file:bg-white/10 file:text-white/70 file:text-xs file:font-medium hover:file:bg-white/20" />
            {imagePreview && (
              <div className="mt-2">
                <p className="text-[10px] text-white/30 mb-1">Preview:</p>
                <img src={imagePreview} alt="Preview" className="w-20 h-20 object-cover rounded-xl border border-white/10" />
              </div>
            )}
            {editing && !imagePreview && form.image && (
              <div className="mt-2">
                <p className="text-[10px] text-white/30 mb-1">Current:</p>
                <img 
                  src={getImageUrl(form.image)}   // ✅ Use helper
                  alt="Current" 
                  className="w-20 h-20 object-cover rounded-xl border border-white/10" 
                />
              </div>
            )}
          </div>
          <div className="sm:col-span-2 md:col-span-1">
            <label className="text-[10px] tracking-[0.2em] uppercase text-white/30 block mb-1.5">Background Color</label>
            <input type="text" name="bgColor" value={form.bgColor} onChange={handleChange}
              className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-2.5 text-sm text-white outline-none focus:border-blue-500/50 transition" />
          </div>
          <div className="sm:col-span-2 md:col-span-1">
            <label className="text-[10px] tracking-[0.2em] uppercase text-white/30 block mb-1.5">Link</label>
            <input type="text" name="link" value={form.link} onChange={handleChange} placeholder="/products"
              className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-2.5 text-sm text-white outline-none focus:border-blue-500/50 transition" />
          </div>
          <div className="sm:col-span-2 md:col-span-1">
            <label className="text-[10px] tracking-[0.2em] uppercase text-white/30 block mb-1.5">Order</label>
            <input type="number" name="order" value={form.order} onChange={handleChange}
              className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-2.5 text-sm text-white outline-none focus:border-blue-500/50 transition" />
          </div>
          <div className="sm:col-span-2 flex items-center gap-3">
            <input type="checkbox" name="isActive" checked={form.isActive} onChange={handleChange} id="isActive"
              className="w-4 h-4 accent-blue-500 rounded border-white/10 bg-white/5" />
            <label htmlFor="isActive" className="text-sm text-white/50 tracking-wide">Active</label>
          </div>
          <div className="sm:col-span-2 flex flex-col sm:flex-row gap-3 pt-1">
            <button type="submit"
              className="bg-blue-600 text-white px-6 sm:px-8 py-2.5 rounded-2xl text-[10px] sm:text-xs tracking-widest uppercase font-medium shadow-[0_0_30px_rgba(59,130,246,0.2)] hover:shadow-[0_0_40px_rgba(59,130,246,0.3)] hover:bg-blue-500 transition-all duration-200 w-full sm:w-auto">
              {editing ? 'Update Slide' : 'Create Slide'}
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
          <table className="w-full text-sm min-w-[600px]">
            <thead className="border-b border-white/5">
              <tr>
                {['Order', 'Image', 'Title', 'Active', 'Actions'].map((h) => (
                  <th key={h} className="text-left px-3 sm:px-5 py-3 sm:py-3.5 text-[9px] sm:text-[10px] tracking-[0.2em] uppercase text-white/30 font-medium">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {slides.map((slide, idx) => (
                <tr key={slide.id} className="border-b border-white/5 hover:bg-white/5 transition">
                  <td className="px-3 sm:px-5 py-3 sm:py-3.5 text-white/40 text-xs">{slide.order}</td>
                  <td className="px-3 sm:px-5 py-3 sm:py-3.5">
                    {slide.image ? (
                      <img 
                        src={getImageUrl(slide.image)}   // ✅ Use helper
                        alt={slide.title} 
                        className="w-10 sm:w-14 h-10 sm:h-14 object-cover rounded-xl border border-white/10" 
                      />
                    ) : (
                      <div className="w-10 sm:w-14 h-10 sm:h-14 rounded-xl bg-white/5 border border-white/5 flex items-center justify-center">
                        <FiImageIcon className="text-white/20 text-sm sm:text-base" />
                      </div>
                    )}
                  </td>
                  <td className="px-3 sm:px-5 py-3 sm:py-3.5 font-medium text-white/80 text-xs sm:text-sm truncate max-w-[100px] sm:max-w-none">{slide.title}</td>
                  <td className="px-3 sm:px-5 py-3 sm:py-3.5">
                    <span className={`text-[8px] sm:text-[10px] font-semibold px-2 sm:px-3 py-0.5 sm:py-1 rounded-full ${
                      slide.isActive
                        ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/20'
                        : 'bg-white/5 text-white/30 border border-white/10'
                    }`}>
                      {slide.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-3 sm:px-5 py-3 sm:py-3.5">
                    <div className="flex items-center gap-1 sm:gap-2">
                      <button onClick={() => handleEdit(slide)}
                        className="p-1.5 sm:p-2 rounded-xl bg-white/5 border border-white/10 text-white/40 hover:text-white hover:border-blue-500/30 transition-all duration-200">
                        <FiEdit2 className="text-xs sm:text-sm" />
                      </button>
                      <button onClick={() => handleDelete(slide.id)}
                        className="p-1.5 sm:p-2 rounded-xl bg-white/5 border border-white/10 text-white/40 hover:text-red-400 hover:border-red-500/30 transition-all duration-200">
                        <FiTrash2 className="text-xs sm:text-sm" />
                      </button>
                      <div className="flex flex-col ml-0.5 sm:ml-1">
                        <button onClick={() => idx > 0 && handleReorder(idx, idx - 1)}
                          className="text-white/20 hover:text-white/60 transition p-0.5">
                          <FiChevronUp className="text-[10px] sm:text-xs" />
                        </button>
                        <button onClick={() => idx < slides.length - 1 && handleReorder(idx, idx + 1)}
                          className="text-white/20 hover:text-white/60 transition p-0.5">
                          <FiChevronDown className="text-[10px] sm:text-xs" />
                        </button>
                      </div>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {slides.length === 0 && (
          <div className="text-center py-12 text-white/20 text-sm tracking-wider">No slides yet. Create one above.</div>
        )}
      </div>
    </div>
  );
};

export default Carousel;