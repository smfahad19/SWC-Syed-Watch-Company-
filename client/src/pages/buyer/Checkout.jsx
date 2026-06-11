import { useState } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { useNavigate, Link } from 'react-router-dom'
import { toast } from 'react-toastify'
import { clearCart } from '../../redux/slices/cartSlice'
import api from '../../services/api'

const PROVINCES = [
  'Punjab', 'Sindh', 'Khyber Pakhtunkhwa', 'Balochistan',
  'Gilgit-Baltistan', 'Azad Kashmir', 'Islamabad Capital Territory'
]

const Checkout = () => {
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const { items, totalPrice } = useSelector((state) => state.cart)
  const { user } = useSelector((state) => state.auth)
  const [loading, setLoading] = useState(false)

  const [form, setForm] = useState({
    fullName: user?.name || '',
    phone: user?.phone || '',
    email: user?.email || '',
    address: user?.address || '',
    apartment: '',
    landmark: '',
    city: user?.city || '',
    postalCode: '',
    province: '',
  })

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleOrder = async (e) => {
    e.preventDefault()
    if (!items || items.length === 0) {
      toast.error('Cart is empty')
      return
    }
    setLoading(true)
    try {
      await api.post('/buyer/orders', form)
      dispatch(clearCart())
      toast.success('Order placed successfully!')
      navigate('/profile')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Order failed')
    } finally {
      setLoading(false)
    }
  }

  if (items.length === 0) {
    return (
      <div className='min-h-screen flex flex-col items-center justify-center gap-4'>
        <p className='text-gray-400 text-sm tracking-widest uppercase'>Your cart is empty</p>
        <Link
          to='/products'
          className='border border-black px-6 py-2 text-xs tracking-widest uppercase hover:bg-black hover:text-white transition'
        >
          Shop Now
        </Link>
      </div>
    )
  }

  return (
    <div className='max-w-5xl mx-auto px-4 py-14'>
      <h1 className='text-2xl font-bold tracking-widest uppercase mb-10'>Checkout</h1>

      <div className='grid grid-cols-1 lg:grid-cols-2 gap-12'>

        <form onSubmit={handleOrder} className='flex flex-col gap-5'>
          <h2 className='text-xs font-semibold tracking-widest uppercase text-gray-400 mb-1'>Delivery Information</h2>

          {/* Full Name */}
          <div>
            <label className='text-xs text-gray-500 mb-1 block'>Full Name *</label>
            <input
              type='text'
              name='fullName'
              value={form.fullName}
              onChange={handleChange}
              required
              placeholder='As per CNIC'
              className='w-full border border-gray-300 px-4 py-3 text-sm outline-none focus:border-black transition'
            />
          </div>

          {/* Phone + Email */}
          <div className='grid grid-cols-2 gap-3'>
            <div>
              <label className='text-xs text-gray-500 mb-1 block'>Phone *</label>
              <input
                type='text'
                name='phone'
                value={form.phone}
                onChange={handleChange}
                required
                placeholder='03xxxxxxxxx'
                className='w-full border border-gray-300 px-4 py-3 text-sm outline-none focus:border-black transition'
              />
            </div>
            <div>
              <label className='text-xs text-gray-500 mb-1 block'>Email</label>
              <input
                type='email'
                name='email'
                value={form.email}
                onChange={handleChange}
                placeholder='optional'
                className='w-full border border-gray-300 px-4 py-3 text-sm outline-none focus:border-black transition'
              />
            </div>
          </div>

          {/* Street Address */}
          <div>
            <label className='text-xs text-gray-500 mb-1 block'>Street Address *</label>
            <input
              type='text'
              name='address'
              value={form.address}
              onChange={handleChange}
              required
              placeholder='House no., street, area'
              className='w-full border border-gray-300 px-4 py-3 text-sm outline-none focus:border-black transition'
            />
          </div>

          {/* Apartment + Landmark */}
          <div className='grid grid-cols-2 gap-3'>
            <div>
              <label className='text-xs text-gray-500 mb-1 block'>Flat / Floor / Unit</label>
              <input
                type='text'
                name='apartment'
                value={form.apartment}
                onChange={handleChange}
                placeholder='optional'
                className='w-full border border-gray-300 px-4 py-3 text-sm outline-none focus:border-black transition'
              />
            </div>
            <div>
              <label className='text-xs text-gray-500 mb-1 block'>Landmark</label>
              <input
                type='text'
                name='landmark'
                value={form.landmark}
                onChange={handleChange}
                placeholder='Near mosque, school...'
                className='w-full border border-gray-300 px-4 py-3 text-sm outline-none focus:border-black transition'
              />
            </div>
          </div>

          {/* City + Postal Code */}
          <div className='grid grid-cols-2 gap-3'>
            <div>
              <label className='text-xs text-gray-500 mb-1 block'>City *</label>
              <input
                type='text'
                name='city'
                value={form.city}
                onChange={handleChange}
                required
                placeholder='Lahore, Karachi...'
                className='w-full border border-gray-300 px-4 py-3 text-sm outline-none focus:border-black transition'
              />
            </div>
            <div>
              <label className='text-xs text-gray-500 mb-1 block'>Postal Code *</label>
              <input
                type='text'
                name='postalCode'
                value={form.postalCode}
                onChange={handleChange}
                required
                placeholder='54000'
                className='w-full border border-gray-300 px-4 py-3 text-sm outline-none focus:border-black transition'
              />
            </div>
          </div>

          {/* Province */}
          <div>
            <label className='text-xs text-gray-500 mb-1 block'>Province *</label>
            <select
              name='province'
              value={form.province}
              onChange={handleChange}
              required
              className='w-full border border-gray-300 px-4 py-3 text-sm outline-none focus:border-black transition bg-white'
            >
              <option value=''>Select Province</option>
              {PROVINCES.map((p) => (
                <option key={p} value={p}>{p}</option>
              ))}
            </select>
          </div>

          {/* Payment */}
          <div className='border border-gray-200 bg-gray-50 p-4 flex items-center justify-between'>
            <div>
              <p className='text-xs text-gray-400 tracking-widest uppercase mb-1'>Payment Method</p>
              <p className='text-sm font-semibold'>Cash on Delivery</p>
            </div>
            <span className='text-2xl'>💵</span>
          </div>

          <button
            type='submit'
            disabled={loading}
            className='bg-black text-white py-3.5 text-xs tracking-widest uppercase hover:bg-gray-900 transition disabled:opacity-50'
          >
            {loading ? 'Placing Order...' : 'Place Order'}
          </button>
        </form>

        {/* Order Summary */}
        <div>
          <h2 className='text-xs font-semibold tracking-widest uppercase text-gray-400 mb-5'>Order Summary</h2>
          <div className='border border-gray-100 p-6'>
            <div className='flex flex-col gap-4 mb-6'>
              {items.map((item) => (
                <div key={item.id} className='flex items-center gap-3'>
                  <div className='w-12 h-12 bg-gray-100 flex-shrink-0 overflow-hidden'>
                    {item.images?.[0] ? (
                      <img src={item.images[0]} alt={item.name} className='w-full h-full object-cover' />
                    ) : null}
                  </div>
                  <div className='flex-1 min-w-0'>
                    <p className='text-xs font-medium truncate'>{item.name}</p>
                    <p className='text-xs text-gray-400'>Qty: {item.quantity}</p>
                  </div>
                  <span className='text-xs font-semibold'>
                    Rs. {((item.discountPrice || item.price) * item.quantity).toLocaleString()}
                  </span>
                </div>
              ))}
            </div>

            <div className='border-t border-gray-100 pt-4 flex flex-col gap-2'>
              <div className='flex justify-between text-xs text-gray-400'>
                <span>Subtotal</span>
                <span>Rs. {totalPrice.toLocaleString()}</span>
              </div>
              <div className='flex justify-between text-xs text-gray-400'>
                <span>Delivery</span>
                <span>Cash on Delivery</span>
              </div>
              <div className='flex justify-between font-bold text-sm border-t border-gray-100 pt-3 mt-1'>
                <span>Total</span>
                <span>Rs. {totalPrice.toLocaleString()}</span>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  )
}

export default Checkout