import { Link, useNavigate } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'
import { toast } from 'react-toastify'
import { FiShoppingCart, FiUser, FiMenu, FiX } from 'react-icons/fi'
import { useState } from 'react'
import { logout } from '../redux/slices/authSlice'
import { clearCart } from '../redux/slices/cartSlice'
import api from '../services/api'

const Navbar = () => {
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const { isLoggedIn, user } = useSelector((state) => state.auth)
  const { items } = useSelector((state) => state.cart)
  const [menuOpen, setMenuOpen] = useState(false)

  const handleLogout = async () => {
    try {
      await api.post('/auth/logout')
      dispatch(logout())
      dispatch(clearCart())
      toast.success('Logged out')
      navigate('/')
    } catch {
      toast.error('Something went wrong')
    }
  }

  return (
    <nav className='bg-white border-b border-gray-200 sticky top-0 z-50'>
      <div className='max-w-6xl mx-auto px-4 py-4 flex items-center justify-between'>

        <Link to='/' className='text-xl font-bold tracking-widest uppercase text-black'>
          SWC
        </Link>

        {/* desktop links */}
        <div className='hidden md:flex items-center gap-8'>
          <Link to='/' className='text-sm text-gray-600 hover:text-black transition'>Home</Link>
          <Link to='/products' className='text-sm text-gray-600 hover:text-black transition'>Products</Link>

          {isLoggedIn && user?.role === 'SELLER' && (
            <Link to='/admin/dashboard' className='text-sm text-gray-600 hover:text-black transition'>
              Admin
            </Link>
          )}
        </div>

        {/* right icons */}
        <div className='flex items-center gap-4'>

          {isLoggedIn && user?.role === 'BUYER' && (
            <Link to='/cart' className='relative'>
              <FiShoppingCart size={20} className='text-gray-700 hover:text-black transition' />
              {items.length > 0 && (
                <span className='absolute -top-2 -right-2 bg-black text-white text-xs w-4 h-4 rounded-full flex items-center justify-center'>
                  {items.length}
                </span>
              )}
            </Link>
          )}

          {isLoggedIn ? (
            <div className='flex items-center gap-3'>
              <Link to='/profile'>
                <FiUser size={20} className='text-gray-700 hover:text-black transition' />
              </Link>
              <button
                onClick={handleLogout}
                className='text-sm text-gray-600 hover:text-black transition'
              >
                Logout
              </button>
            </div>
          ) : (
            <Link
              to='/login'
              className='text-sm bg-black text-white px-4 py-2 hover:bg-gray-900 transition'
            >
              Login
            </Link>
          )}

          {/* mobile menu toggle */}
          <button
            className='md:hidden'
            onClick={() => setMenuOpen(!menuOpen)}
          >
            {menuOpen ? <FiX size={22} /> : <FiMenu size={22} />}
          </button>

        </div>
      </div>

      {/* mobile menu */}
      {menuOpen && (
        <div className='md:hidden border-t border-gray-100 px-4 py-4 flex flex-col gap-4'>
          <Link to='/' onClick={() => setMenuOpen(false)} className='text-sm text-gray-700'>Home</Link>
          <Link to='/products' onClick={() => setMenuOpen(false)} className='text-sm text-gray-700'>Products</Link>
          {isLoggedIn && user?.role === 'SELLER' && (
            <Link to='/admin/dashboard' onClick={() => setMenuOpen(false)} className='text-sm text-gray-700'>Admin</Link>
          )}
        </div>
      )}

    </nav>
  )
}

export default Navbar