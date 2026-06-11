import { useDispatch, useSelector } from 'react-redux'
import { Link, useNavigate } from 'react-router-dom'
import { removeFromCart, updateQuantity, clearCart } from '../../redux/slices/cartSlice'
import { toast } from 'react-toastify'
import api from '../../services/api'

const Cart = () => {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { items, totalPrice } = useSelector((state) => state.cart)

  const handleRemove = async (id) => {
    try {
      await api.delete(`/buyer/cart/${id}`)
      dispatch(removeFromCart(id))
      toast.success('Item removed')
    } catch {
      toast.error('Remove nahi hua')
    }
  }

  const handleQuantity = async (id, quantity) => {
    if (quantity < 1) return
    try {
      await api.delete(`/buyer/cart/${id}`)
      await api.post('/buyer/cart', { productId: id, quantity })
      dispatch(updateQuantity({ id, quantity }))
    } catch {
      toast.error('Update nahi hua')
    }
  }

  const handleClearCart = async () => {
    try {
      await api.delete('/buyer/cart')
      dispatch(clearCart())
      toast.success('Cart cleared')
    } catch {
      toast.error('Clear nahi hua')
    }
  }

  if (items.length === 0) {
    return (
      <div className='min-h-screen flex flex-col items-center justify-center gap-4'>
        <p className='text-gray-400 text-sm tracking-widest uppercase'>Your cart is empty</p>
        <Link
          to='/products'
          className='border border-black px-8 py-3 text-xs tracking-widest uppercase hover:bg-black hover:text-white transition'
        >
          Shop Now
        </Link>
      </div>
    )
  }

  return (
    <div className='max-w-4xl mx-auto px-4 py-14'>
      <div className='flex items-center justify-between mb-10'>
        <h1 className='text-2xl font-bold tracking-widest uppercase'>Your Cart</h1>
        <span className='text-xs text-gray-400 tracking-widest'>{items.length} {items.length === 1 ? 'ITEM' : 'ITEMS'}</span>
      </div>

      <div className='flex flex-col divide-y divide-gray-100'>
        {items.map((item) => (
          <div key={item.id} className='flex items-center gap-5 py-5'>
            <div className='w-20 h-20 bg-gray-50 border border-gray-100 flex items-center justify-center overflow-hidden flex-shrink-0'>
              {item.images?.[0] ? (
                <img src={item.images[0]} alt={item.name} className='w-full h-full object-cover' />
              ) : (
                <span className='text-gray-300 text-xs'>No img</span>
              )}
            </div>

            <div className='flex-1 min-w-0'>
              <h3 className='text-sm font-semibold truncate'>{item.name}</h3>
              <p className='text-xs text-gray-400 mt-1'>
                Rs. {(item.discountPrice || item.price).toLocaleString()} each
              </p>
            </div>

            <div className='flex items-center gap-2'>
              <button
                onClick={() => handleQuantity(item.id, item.quantity - 1)}
                className='w-8 h-8 border border-gray-300 text-sm hover:border-black transition flex items-center justify-center'
              >
                −
              </button>
              <span className='text-sm w-6 text-center font-medium'>{item.quantity}</span>
              <button
                onClick={() => handleQuantity(item.id, item.quantity + 1)}
                className='w-8 h-8 border border-gray-300 text-sm hover:border-black transition flex items-center justify-center'
              >
                +
              </button>
            </div>

            <p className='text-sm font-bold w-28 text-right'>
              Rs. {((item.discountPrice || item.price) * item.quantity).toLocaleString()}
            </p>

            <button
              onClick={() => handleRemove(item.id)}
              className='text-gray-300 hover:text-red-500 transition ml-2'
              title='Remove'
            >
              ✕
            </button>
          </div>
        ))}
      </div>

      <div className='mt-10 flex flex-col items-end gap-5'>
        <div className='w-full max-w-xs'>
          <div className='flex justify-between text-xs text-gray-400 tracking-widest uppercase mb-2'>
            <span>Subtotal</span>
            <span>Rs. {totalPrice.toLocaleString()}</span>
          </div>
          <div className='flex justify-between text-xs text-gray-400 tracking-widest uppercase mb-4'>
            <span>Delivery</span>
            <span>Calculated at checkout</span>
          </div>
          <div className='flex justify-between font-bold text-lg border-t border-gray-100 pt-4'>
            <span>Total</span>
            <span>Rs. {totalPrice.toLocaleString()}</span>
          </div>
        </div>

        <div className='flex gap-3'>
          <button
            onClick={handleClearCart}
            className='border border-gray-300 text-gray-500 px-6 py-2.5 text-xs tracking-widest uppercase hover:border-black hover:text-black transition'
          >
            Clear Cart
          </button>
          <button
            onClick={() => navigate('/checkout')}
            className='bg-black text-white px-10 py-2.5 text-xs tracking-widest uppercase hover:bg-gray-900 transition'
          >
            Checkout
          </button>
        </div>
      </div>
    </div>
  )
}

export default Cart