import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { toast } from 'react-toastify'
import { Link } from 'react-router-dom'
import { fetchStart, fetchSuccess, fetchFail, setCategories } from '../../redux/slices/productSlice'
import { addToCart } from '../../redux/slices/cartSlice'
import api from '../../services/api'
import Loader from '../../components/Loader'

const ProductList = () => {
  const dispatch = useDispatch()
  const { products, categories, loading } = useSelector((state) => state.product)
  const { isLoggedIn } = useSelector((state) => state.auth)
  const [selectedCategory, setSelectedCategory] = useState('')
  const [sort, setSort] = useState('')

  useEffect(() => {
    fetchCategories()
  }, [])

  useEffect(() => {
    fetchProducts()
  }, [selectedCategory, sort])

  const fetchCategories = async () => {
    try {
      const res = await api.get('/buyer/categories')
      dispatch(setCategories(res.data.data))
    } catch {
      toast.error('Categories load nahi huin')
    }
  }

  const fetchProducts = async () => {
    dispatch(fetchStart())
    try {
      const params = new URLSearchParams()
      if (selectedCategory) params.append('categoryId', selectedCategory)
      if (sort) params.append('sort', sort)
      const res = await api.get(`/buyer/products?${params.toString()}`)
      dispatch(fetchSuccess(res.data.data))
    } catch {
      dispatch(fetchFail('Products load nahi hue'))
      toast.error('Products load nahi hue')
    }
  }

  const handleAddToCart = async (product) => {
    if (!isLoggedIn) {
      toast.error('Pehle login karo')
      return
    }
    try {
      await api.post('/buyer/cart', { productId: product.id, quantity: 1 })
      dispatch(addToCart(product))
      toast.success('Cart mein add ho gaya')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Cart mein add nahi hua')
    }
  }

  if (loading) return <Loader />

  return (
    <div className='max-w-6xl mx-auto px-4 py-10'>
      <h1 className='text-2xl font-bold tracking-widest uppercase mb-8 text-center'>All Products</h1>

      <div className='flex flex-wrap gap-3 mb-8 justify-center'>
        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className='border border-gray-300 text-sm px-4 py-2.5 outline-none focus:border-black bg-white'
        >
          <option value=''>All Categories</option>
          {categories.map((cat) => (
            <option key={cat.id} value={cat.id}>{cat.name}</option>
          ))}
        </select>

        <select
          value={sort}
          onChange={(e) => setSort(e.target.value)}
          className='border border-gray-300 text-sm px-4 py-2.5 outline-none focus:border-black bg-white'
        >
          <option value=''>Latest First</option>
          <option value='price_asc'>Price: Low to High</option>
          <option value='price_desc'>Price: High to Low</option>
        </select>
      </div>

      {products.length === 0 ? (
        <p className='text-center text-gray-400 text-sm py-16'>No products found</p>
      ) : (
        <div className='grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6'>
          {products.map((product) => (
            <div key={product.id} className='group'>
              <Link to={`/products/${product.id}`}>
                <div className='bg-gray-100 aspect-square mb-3 overflow-hidden flex items-center justify-center'>
                  {product.images?.[0] ? (
                    <img src={product.images[0]} alt={product.name} className='w-full h-full object-cover group-hover:scale-105 transition duration-300' />
                  ) : (
                    <span className='text-gray-300 text-xs tracking-widest uppercase'>{product.category?.name}</span>
                  )}
                </div>
              </Link>
              <p className='text-xs text-gray-400 tracking-widest uppercase mb-1'>{product.category?.name}</p>
              <Link to={`/products/${product.id}`}>
                <h3 className='text-sm font-semibold text-black mb-2 hover:underline'>{product.name}</h3>
              </Link>
              <div className='flex items-center gap-2 mb-3'>
                {product.discountPrice ? (
                  <>
                    <span className='text-sm font-bold'>Rs. {product.discountPrice.toLocaleString()}</span>
                    <span className='text-xs text-gray-400 line-through'>Rs. {product.price.toLocaleString()}</span>
                  </>
                ) : (
                  <span className='text-sm font-bold'>Rs. {product.price.toLocaleString()}</span>
                )}
              </div>
              <button
                onClick={() => handleAddToCart(product)}
                disabled={product.stock === 0}
                className='w-full border border-black text-black text-xs py-2 tracking-widest uppercase hover:bg-black hover:text-white transition disabled:opacity-40 disabled:cursor-not-allowed'
              >
                {product.stock === 0 ? 'Out of Stock' : isLoggedIn ? 'Add to Cart' : 'Login to Buy'}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default ProductList