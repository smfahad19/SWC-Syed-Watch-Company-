import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { toast } from 'react-toastify'
import { fetchStart, fetchFail, setSelectedProduct } from '../../redux/slices/productSlice'
import { addToCart } from '../../redux/slices/cartSlice'
import api from '../../services/api'
import Loader from '../../components/Loader'

const ProductDetail = () => {
  const { id } = useParams()
  const dispatch = useDispatch()
  const { selectedProduct: product, loading } = useSelector((state) => state.product)
  const { isLoggedIn, user } = useSelector((state) => state.auth)
  const [reviews, setReviews] = useState([])
  const [rating, setRating] = useState(5)
  const [comment, setComment] = useState('')
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    loadProduct()
    loadReviews()
  }, [id])

  const loadProduct = async () => {
    dispatch(fetchStart())
    try {
      const res = await api.get(`/buyer/products/${id}`)
      dispatch(setSelectedProduct(res.data.data))
    } catch (err) {
      dispatch(fetchFail('Product not found'))
      toast.error(err.response?.data?.message || 'Product not found')
    }
  }

  const loadReviews = async () => {
    try {
      const res = await api.get(`/buyer/products/${id}/reviews`)
      setReviews(res.data.data)
    } catch (err) {
      console.error('Failed to load reviews')
    }
  }

  const handleAddToCart = async () => {
    if (!isLoggedIn) {
      toast.error('Please login first')
      return
    }
    try {
      await api.post('/buyer/cart', { productId: product.id, quantity: 1 })
      dispatch(addToCart(product))
      toast.success('Added to cart')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Cart mein add nahi hua')
    }
  }

  const handleSubmitReview = async (e) => {
    e.preventDefault()
    if (!isLoggedIn) {
      toast.error('Please login to write a review')
      return
    }
    setSubmitting(true)
    try {
      const res = await api.post(`/buyer/products/${id}/review`, { rating, comment })
      setReviews([res.data.data, ...reviews]) // add new review at top
      setComment('')
      setRating(5)
      toast.success('Review added successfully')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to add review')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) return <Loader />

  if (!product) return (
    <div className='min-h-screen flex flex-col items-center justify-center gap-4'>
      <p className='text-gray-400 text-sm tracking-widest uppercase'>Product not found</p>
      <Link to='/products' className='border border-black px-6 py-2 text-xs tracking-widest uppercase hover:bg-black hover:text-white transition'>
        Back to Products
      </Link>
    </div>
  )

  const discount = product.discountPrice
    ? Math.round(((product.price - product.discountPrice) / product.price) * 100)
    : null

  // average rating
  const avgRating = reviews.length
    ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
    : 0

  return (
    <div className='max-w-5xl mx-auto px-4 py-14'>
      <Link to='/products' className='text-xs text-gray-400 hover:text-black transition tracking-widest uppercase mb-8 inline-block'>
        ← Back to Products
      </Link>

      <div className='grid grid-cols-1 md:grid-cols-2 gap-12'>
        {/* Product Image */}
        <div className='bg-gray-100 aspect-square flex items-center justify-center overflow-hidden'>
          {product.images?.[0] ? (
            <img src={product.images[0]} alt={product.name} className='w-full h-full object-cover' />
          ) : (
            <span className='text-gray-300 text-xs tracking-widest uppercase'>No Image</span>
          )}
        </div>

        {/* Product Details */}
        <div className='flex flex-col justify-center'>
          <p className='text-xs text-gray-400 tracking-widest uppercase mb-2'>{product.category?.name}</p>
          <h1 className='text-2xl font-bold tracking-wide mb-4'>{product.name}</h1>
          <p className='text-sm text-gray-600 leading-relaxed mb-6'>{product.description}</p>

          <div className='flex items-center gap-3 mb-2'>
            {product.discountPrice ? (
              <>
                <span className='text-2xl font-bold'>Rs. {product.discountPrice.toLocaleString()}</span>
                <span className='text-gray-400 line-through text-sm'>Rs. {product.price.toLocaleString()}</span>
                <span className='bg-black text-white text-xs px-2 py-1'>{discount}% OFF</span>
              </>
            ) : (
              <span className='text-2xl font-bold'>Rs. {product.price.toLocaleString()}</span>
            )}
          </div>

          <p className={`text-xs mb-6 tracking-widest uppercase ${product.stock > 0 ? 'text-green-600' : 'text-red-500'}`}>
            {product.stock > 0 ? `${product.stock} in stock` : 'Out of Stock'}
          </p>

          <button
            onClick={handleAddToCart}
            disabled={product.stock === 0}
            className='border border-black text-black px-8 py-3.5 text-xs tracking-widest uppercase hover:bg-black hover:text-white transition disabled:opacity-40 disabled:cursor-not-allowed'
          >
            {product.stock === 0 ? 'Out of Stock' : isLoggedIn ? 'Add to Cart' : 'Login to Buy'}
          </button>
        </div>
      </div>

      {/* ============ REVIEWS SECTION ============ */}
      <div className='mt-16 pt-8 border-t border-gray-200'>
        <h2 className='text-xl font-bold tracking-wider mb-2'>Customer Reviews</h2>
        <div className='flex items-center gap-3 mb-8'>
          <div className='text-3xl font-bold'>{avgRating}</div>
          <div className='text-yellow-500 text-lg'>
            {'★'.repeat(Math.round(avgRating))}{'☆'.repeat(5 - Math.round(avgRating))}
          </div>
          <div className='text-gray-400 text-sm'>({reviews.length} reviews)</div>
        </div>

        {/* Write Review Form (only if logged in) */}
        {isLoggedIn ? (
          <div className='bg-gray-50 p-6 mb-10'>
            <h3 className='font-semibold mb-3'>Write a Review</h3>
            <form onSubmit={handleSubmitReview}>
              <div className='mb-3 flex items-center gap-4'>
                <label className='text-sm'>Rating:</label>
                <select value={rating} onChange={e => setRating(Number(e.target.value))} className='border px-2 py-1 text-sm'>
                  {[5,4,3,2,1].map(r => <option key={r}>{r} Star{r>1?'s':''}</option>)}
                </select>
              </div>
              <textarea
                rows='3'
                value={comment}
                onChange={e => setComment(e.target.value)}
                placeholder='Share your experience with this product...'
                className='w-full border border-gray-300 p-3 text-sm mb-3'
                required
              />
              <button
                type='submit'
                disabled={submitting}
                className='bg-black text-white px-6 py-2 text-xs tracking-widest uppercase hover:bg-gray-800 transition disabled:opacity-50'
              >
                {submitting ? 'Submitting...' : 'Submit Review'}
              </button>
            </form>
          </div>
        ) : (
          <div className='bg-gray-50 p-6 mb-10 text-center text-sm text-gray-500'>
            <Link to='/login' className='text-black underline font-medium'>Login</Link> to write a review
          </div>
        )}

        {/* Reviews List */}
        <div className='space-y-6'>
          {reviews.length === 0 ? (
            <p className='text-gray-400 text-sm'>No reviews yet. Be the first to review!</p>
          ) : (
            reviews.map(review => (
              <div key={review.id} className='border-b border-gray-100 pb-5'>
                <div className='flex items-center justify-between mb-1'>
                  <div className='flex items-center gap-2'>
                    <span className='font-medium text-sm'>{review.user.name}</span>
                    <span className='text-yellow-500 text-sm'>
                      {'★'.repeat(review.rating)}{'☆'.repeat(5 - review.rating)}
                    </span>
                  </div>
                  <span className='text-xs text-gray-400'>
                    {new Date(review.createdAt).toLocaleDateString()}
                  </span>
                </div>
                {review.comment && <p className='text-gray-600 text-sm mt-1'>{review.comment}</p>}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}

export default ProductDetail