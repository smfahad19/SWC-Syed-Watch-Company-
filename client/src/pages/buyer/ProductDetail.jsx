import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import { fetchStart, fetchFail, setSelectedProduct } from '../../redux/slices/productSlice';
import { addToCart } from '../../redux/slices/cartSlice';
import api from '../../services/api';
import Loader from '../../components/Loader';
import { FiArrowLeft, FiShoppingCart, FiImage } from 'react-icons/fi';

const ProductDetail = () => {
  const { id } = useParams();
  const dispatch = useDispatch();
  const { selectedProduct: product, loading } = useSelector((state) => state.product);
  const { isLoggedIn } = useSelector((state) => state.auth);
  const [reviews, setReviews] = useState([]);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [selectedImage, setSelectedImage] = useState('');
  const [selectedVariant, setSelectedVariant] = useState(null);

  useEffect(() => {
    loadProduct();
    loadReviews();
  }, [id]);

  const loadProduct = async () => {
    dispatch(fetchStart());
    try {
      const res = await api.get(`/buyer/products/${id}`);
      const productData = res.data.data;
      dispatch(setSelectedProduct(productData));
      if (productData.images && productData.images.length > 0) {
        setSelectedImage(productData.images[0]);
        setSelectedVariant({
          color: 'Default',
          design: 'Standard',
          image: productData.images[0],
        });
      }
    } catch (err) {
      dispatch(fetchFail('Product not found'));
      toast.error(err.response?.data?.message || 'Product not found');
    }
  };

  const loadReviews = async () => {
    try {
      const res = await api.get(`/buyer/products/${id}/reviews`);
      setReviews(res.data.data);
    } catch {
      console.error('Failed to load reviews');
    }
  };

  const handleImageClick = (img, index) => {
    setSelectedImage(img);
    const variantName = `Design ${index + 1}`;
    setSelectedVariant({
      color: variantName,
      design: variantName,
      image: img,
    });
  };

  const handleAddToCart = async () => {
    if (!isLoggedIn) {
      toast.error('Please login first');
      return;
    }
    try {
      await api.post('/buyer/cart', {
        productId: product.id,
        quantity: 1,
        variant: selectedVariant,   // 👈 send the selected variant
      });
      dispatch(addToCart({ ...product, selectedVariant }));
      toast.success(`Added to cart: ${selectedVariant?.color || product.name}`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to add to cart');
    }
  };

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    if (!isLoggedIn) {
      toast.error('Please login to write a review');
      return;
    }
    setSubmitting(true);
    try {
      const res = await api.post(`/buyer/products/${id}/review`, { rating, comment });
      setReviews([res.data.data, ...reviews]);
      setComment('');
      setRating(5);
      toast.success('Review added successfully');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to add review');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <Loader />;

  if (!product) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 bg-white">
        <p className="text-gray-400 text-sm tracking-widest uppercase">Product not found</p>
        <Link
          to="/products"
          className="border border-black text-black px-6 py-2 text-xs tracking-widest uppercase hover:bg-black hover:text-white transition"
        >
          Back to Products
        </Link>
      </div>
    );
  }

  const discount = product.discountPrice
    ? Math.round(((product.price - product.discountPrice) / product.price) * 100)
    : null;

  const avgRating = reviews.length
    ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
    : 0;

  const allImages = product.images || [];

  return (
    <div className="bg-white py-8 px-4 sm:py-14">
      <div className="max-w-5xl mx-auto">

        <Link
          to="/products"
          className="inline-flex items-center gap-2 text-xs text-gray-400 hover:text-black transition tracking-widest uppercase mb-8"
        >
          <FiArrowLeft /> Back to Products
        </Link>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12">

          {/* Image Gallery */}
          <div>
            <div className="bg-gray-50 border border-gray-100 rounded-2xl aspect-square mb-4 flex items-center justify-center overflow-hidden">
              {selectedImage ? (
                <img src={selectedImage} alt={product.name} className="w-full h-full object-cover" />
              ) : (
                <FiImage className="text-gray-300 text-4xl" />
              )}
            </div>

            {allImages.length > 0 && (
              <div>
                <p className="text-[10px] text-gray-400 tracking-widest uppercase mb-2">Select Variant</p>
                <div className="flex gap-2 overflow-x-auto pb-2">
                  {allImages.map((img, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleImageClick(img, idx)}
                      className={`w-16 h-16 sm:w-20 sm:h-20 flex-shrink-0 rounded-xl overflow-hidden border-2 transition ${
                        selectedImage === img ? 'border-black' : 'border-gray-200 hover:border-gray-400'
                      }`}
                    >
                      <img src={img} alt={`Variant ${idx + 1}`} className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
                {selectedVariant && (
                  <p className="text-sm text-gray-500 mt-3">
                    Selected: <span className="text-black font-semibold">{selectedVariant.color}</span>
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="flex flex-col justify-center">
            <p className="text-[10px] text-gray-400 tracking-widest uppercase mb-2">{product.category?.name}</p>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-wide text-black mb-4">{product.name}</h1>
            <p className="text-sm text-gray-600 leading-relaxed mb-6">{product.description}</p>

            <div className="flex items-center gap-3 mb-2">
              {product.discountPrice ? (
                <>
                  <span className="text-2xl font-bold text-black">Rs. {product.discountPrice.toLocaleString()}</span>
                  <span className="text-gray-400 line-through text-sm">Rs. {product.price.toLocaleString()}</span>
                  <span className="bg-black text-white text-[10px] px-2 py-0.5 rounded-full">
                    {discount}% OFF
                  </span>
                </>
              ) : (
                <span className="text-2xl font-bold text-black">Rs. {product.price.toLocaleString()}</span>
              )}
            </div>

            <p className={`text-xs mb-6 tracking-widest uppercase ${product.stock > 0 ? 'text-green-600' : 'text-red-500'}`}>
              {product.stock > 0 ? `${product.stock} in stock` : 'Out of Stock'}
            </p>

            <button
              onClick={handleAddToCart}
              disabled={product.stock === 0}
              className="flex items-center justify-center gap-2 bg-black text-white px-8 py-3.5 rounded-xl text-xs tracking-widest uppercase font-medium hover:bg-gray-900 transition disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <FiShoppingCart />
              {product.stock === 0 ? 'Out of Stock' : isLoggedIn ? 'Add to Cart' : 'Login to Buy'}
            </button>
          </div>
        </div>

        {/* Reviews */}
        <div className="mt-16 pt-8 border-t border-gray-200">
          <h2 className="text-xl font-bold tracking-wider text-black mb-2">Customer Reviews</h2>
          <div className="flex items-center gap-3 mb-8">
            <div className="text-3xl font-bold text-black">{avgRating}</div>
            <div className="text-yellow-500 text-lg">
              {'★'.repeat(Math.round(avgRating))}{'☆'.repeat(5 - Math.round(avgRating))}
            </div>
            <div className="text-gray-400 text-sm">({reviews.length} reviews)</div>
          </div>

          {isLoggedIn ? (
            <div className="bg-gray-50 border border-gray-200 rounded-2xl p-6 mb-10">
              <h3 className="font-semibold text-black mb-3">Write a Review</h3>
              <form onSubmit={handleSubmitReview}>
                <div className="mb-3 flex items-center gap-4">
                  <label className="text-sm text-gray-600">Rating:</label>
                  <select
                    value={rating}
                    onChange={(e) => setRating(Number(e.target.value))}
                    className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm text-black outline-none focus:border-black"
                  >
                    {[5, 4, 3, 2, 1].map((r) => (
                      <option key={r}>{r} Star{r > 1 ? 's' : ''}</option>
                    ))}
                  </select>
                </div>
                <textarea
                  rows="3"
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Share your experience..."
                  className="w-full border border-gray-300 rounded-lg p-3 text-sm text-black outline-none focus:border-black transition resize-none"
                  required
                />
                <button
                  type="submit"
                  disabled={submitting}
                  className="mt-3 bg-black text-white px-6 py-2.5 rounded-xl text-xs tracking-widest uppercase font-medium hover:bg-gray-800 transition disabled:opacity-50"
                >
                  {submitting ? 'Submitting...' : 'Submit Review'}
                </button>
              </form>
            </div>
          ) : (
            <div className="bg-gray-50 border border-gray-200 rounded-2xl p-6 mb-10 text-center text-sm text-gray-500">
              <Link to="/login" className="text-black font-medium hover:underline">Login</Link> to write a review
            </div>
          )}

          <div className="space-y-6">
            {reviews.length === 0 ? (
              <p className="text-gray-400 text-sm">No reviews yet. Be the first!</p>
            ) : (
              reviews.map((review) => (
                <div key={review.id} className="border-b border-gray-100 pb-5">
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-sm text-black">{review.user?.name || 'User'}</span>
                      <span className="text-yellow-500 text-sm">
                        {'★'.repeat(review.rating)}{'☆'.repeat(5 - review.rating)}
                      </span>
                    </div>
                    <span className="text-xs text-gray-400">
                      {new Date(review.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  {review.comment && <p className="text-gray-600 text-sm mt-1">{review.comment}</p>}
                </div>
              ))
            )}
          </div>
        </div>

      </div>
    </div>
  );
};

export default ProductDetail;