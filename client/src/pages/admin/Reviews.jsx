import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import api from '../../services/api';
import { FiStar, FiTrash2, FiUser, FiPackage, FiCalendar } from 'react-icons/fi';

const Reviews = () => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const limit = 15;

  const fetchReviews = async (p = 1) => {
    setLoading(true);
    try {
      const res = await api.get(`/admin/reviews?page=${p}&limit=${limit}`);
      setReviews(res.data.data.reviews);
      setTotalPages(res.data.data.totalPages || 1);
      setPage(p);
    } catch {
      toast.error('Failed to load reviews');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, []);

  const handleDelete = async (id) => {
    if (!confirm('Delete this review?')) return;
    try {
      await api.delete(`/admin/reviews/${id}`);
      toast.success('Review deleted');
      fetchReviews(page);
    } catch {
      toast.error('Delete failed');
    }
  };

  const renderStars = (rating) => {
    return Array.from({ length: 5 }, (_, i) => (
      <FiStar
        key={i}
        className={`inline-block text-sm ${i < rating ? 'text-yellow-400 fill-yellow-400' : 'text-white/20'}`}
      />
    ));
  };

  if (loading) {
    return <div className="text-white/40 text-sm animate-pulse">Loading reviews…</div>;
  }

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6 sm:mb-8">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-2xl bg-blue-600/20 border border-blue-500/20 flex-shrink-0">
            <FiStar className="text-blue-400 text-2xl" />
          </div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-widest text-white">Reviews</h1>
          <span className="text-xs text-white/30 bg-white/5 px-3 py-1 rounded-full">
            {reviews.length} total
          </span>
        </div>
      </div>

      {/* Table */}
      <div className="bg-[#0e1629]/60 backdrop-blur-xl border border-white/5 rounded-2xl sm:rounded-3xl shadow-xl shadow-black/20 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm min-w-[800px]">
            <thead className="border-b border-white/5">
              <tr>
                {['User', 'Product', 'Rating', 'Comment', 'Date', 'Actions'].map((h) => (
                  <th
                    key={h}
                    className="text-left px-3 sm:px-5 py-3 sm:py-3.5 text-[9px] sm:text-[10px] tracking-[0.2em] uppercase text-white/30 font-medium"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {reviews.map((review) => (
                <tr key={review.id} className="border-b border-white/5 hover:bg-white/5 transition">
                  <td className="px-3 sm:px-5 py-3 sm:py-3.5">
                    <div className="flex items-center gap-2">
                      <FiUser className="text-white/30 text-xs" />
                      <div>
                        <p className="text-white/80 text-xs sm:text-sm font-medium">{review.user.name}</p>
                        <p className="text-[10px] text-white/30">{review.user.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-3 sm:px-5 py-3 sm:py-3.5">
                    <div className="flex items-center gap-2">
                      <FiPackage className="text-white/30 text-xs" />
                      <span className="text-white/70 text-xs sm:text-sm truncate max-w-[120px]">
                        {review.product.name}
                      </span>
                    </div>
                  </td>
                  <td className="px-3 sm:px-5 py-3 sm:py-3.5">
                    <div className="flex items-center gap-1">
                      {renderStars(review.rating)}
                      <span className="text-white/40 text-xs ml-1">({review.rating})</span>
                    </div>
                  </td>
                  <td className="px-3 sm:px-5 py-3 sm:py-3.5">
                    <p className="text-white/60 text-xs sm:text-sm max-w-[200px] truncate">
                      {review.comment || '—'}
                    </p>
                  </td>
                  <td className="px-3 sm:px-5 py-3 sm:py-3.5">
                    <div className="flex items-center gap-1 text-white/30 text-xs">
                      <FiCalendar className="text-[10px]" />
                      {new Date(review.createdAt).toLocaleDateString('en-PK')}
                    </div>
                  </td>
                  <td className="px-3 sm:px-5 py-3 sm:py-3.5">
                    <button
                      onClick={() => handleDelete(review.id)}
                      className="p-1.5 sm:p-2 rounded-xl bg-white/5 border border-white/10 text-white/40 hover:text-red-400 hover:border-red-500/30 transition-all duration-200"
                    >
                      <FiTrash2 className="text-xs sm:text-sm" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {reviews.length === 0 && (
          <div className="text-center py-12 text-white/20 text-sm tracking-wider">No reviews yet.</div>
        )}
        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center gap-2 py-4 border-t border-white/5">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
              <button
                key={p}
                onClick={() => fetchReviews(p)}
                className={`px-3 py-1 rounded-xl text-xs transition ${
                  p === page
                    ? 'bg-blue-600 text-white shadow-[0_0_20px_rgba(59,130,246,0.3)]'
                    : 'text-white/40 hover:text-white hover:bg-white/5'
                }`}
              >
                {p}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Reviews;