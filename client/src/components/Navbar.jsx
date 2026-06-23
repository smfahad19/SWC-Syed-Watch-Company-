import { Link, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { toast } from 'react-toastify';
import { FiShoppingCart, FiUser, FiMenu, FiX, FiChevronDown } from 'react-icons/fi';
import { useState, useEffect, useRef } from 'react';
import { logout } from '../redux/slices/authSlice';
import { clearCart } from '../redux/slices/cartSlice';
import api from '../services/api';

const Navbar = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { isLoggedIn, user } = useSelector((state) => state.auth);
  const { items } = useSelector((state) => state.cart);
  const [menuOpen, setMenuOpen] = useState(false);
  const [visible, setVisible] = useState(true);
  const [scrolled, setScrolled] = useState(false);
  const lastScrollY = useRef(0);

  useEffect(() => {
    const handleScroll = () => {
      const currentY = window.scrollY;
      setScrolled(currentY > 20);
      if (currentY < 10) {
        setVisible(true);
      } else if (currentY > lastScrollY.current + 5) {
        setVisible(false);
        setMenuOpen(false);
      } else if (currentY < lastScrollY.current - 5) {
        setVisible(true);
      }
      lastScrollY.current = currentY;
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLogout = async () => {
    try {
      await api.post('/auth/logout');
      dispatch(logout());
      dispatch(clearCart());
      toast.success('Logged out successfully');
      navigate('/');
    } catch {
      toast.error('Something went wrong');
    }
  };

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        visible ? 'translate-y-0' : '-translate-y-full'
      } ${
        scrolled
          ? 'bg-white/95 backdrop-blur-xl shadow-sm border-b border-gray-100'
          : 'bg-white/60 backdrop-blur-md border-b border-white/40'
      }`}
    >
      <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">

        {/* Logo */}
        <Link to="/" className="flex items-center gap-3 group">
          <div className="flex flex-col leading-none">
            <span className="text-lg font-black tracking-[5px] uppercase text-gray-900">
              S<span className="text-amber-600">&</span>S
            </span>
            <span className="text-[8px] tracking-[2.5px] uppercase text-gray-400 font-medium">
              Syed & Sons
            </span>
          </div>
          <div className="hidden sm:block w-px h-7 bg-gray-200" />
          <span className="hidden sm:block text-[10px] tracking-[2px] uppercase text-gray-400 font-medium">
            Est. 1975
          </span>
        </Link>

        {/* Desktop Nav Links */}
        <div className="hidden md:flex items-center gap-1">
          <Link
            to="/"
            className="px-4 py-2 text-xs tracking-widest uppercase text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-all duration-200 font-medium"
          >
            Home
          </Link>
          <Link
            to="/products"
            className="px-4 py-2 text-xs tracking-widest uppercase text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-all duration-200 font-medium"
          >
            Products
          </Link>
          {isLoggedIn && user?.role === 'BUYER' && (
            <Link
              to="/profile"
              className="px-4 py-2 text-xs tracking-widest uppercase text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-all duration-200 font-medium"
            >
              My Orders
            </Link>
          )}
        </div>

        {/* Right Side */}
        <div className="flex items-center gap-2.5">

          {/* Cart */}
          {isLoggedIn && user?.role === 'BUYER' && (
            <Link
              to="/cart"
              className="relative flex items-center gap-2 px-4 py-2 text-xs tracking-widest uppercase text-gray-700 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-all duration-200 font-medium"
            >
              <FiShoppingCart size={15} />
              <span className="hidden sm:inline">Cart</span>
              {items.length > 0 && (
                <span className="absolute -top-1 -right-1 bg-amber-600 text-white text-[9px] w-4 h-4 rounded-full flex items-center justify-center font-bold">
                  {items.length}
                </span>
              )}
            </Link>
          )}

          {isLoggedIn ? (
            <div className="hidden md:flex items-center gap-2">
              {/* User pill */}
              <Link
                to="/profile"
                className="flex items-center gap-2 px-3 py-2 rounded-lg border border-gray-200 hover:border-gray-300 hover:bg-gray-50 transition-all duration-200"
              >
                <div className="w-6 h-6 rounded-full bg-amber-100 flex items-center justify-center">
                  <FiUser size={12} className="text-amber-700" />
                </div>
                <span className="text-xs tracking-wide font-medium text-gray-700">
                  {user?.name?.split(' ')[0]}
                </span>
              </Link>
              <button
                onClick={handleLogout}
                className="px-4 py-2 text-xs tracking-widest uppercase text-gray-400 hover:text-red-500 transition-all duration-200 font-medium rounded-lg hover:bg-red-50"
              >
                Logout
              </button>
            </div>
          ) : (
            <div className="hidden md:flex items-center gap-2">
              {/* Login — outlined */}
              <Link
                to="/login"
                className="px-5 py-2 text-xs tracking-widest uppercase font-medium text-gray-700 border border-gray-300 rounded-lg hover:border-gray-900 hover:text-gray-900 transition-all duration-200"
              >
                Login
              </Link>
              {/* Sign Up — filled */}
              <Link
                to="/signup"
                className="px-5 py-2 text-xs tracking-widest uppercase font-medium text-white bg-gray-900 rounded-lg hover:bg-amber-600 transition-all duration-300 shadow-sm"
              >
                Sign Up
              </Link>
            </div>
          )}

          {/* Mobile toggle */}
          <button
            className="md:hidden p-2 rounded-lg text-gray-600 hover:text-gray-900 hover:bg-gray-50 transition-all duration-200"
            onClick={() => setMenuOpen(!menuOpen)}
          >
            {menuOpen ? <FiX size={20} /> : <FiMenu size={20} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {menuOpen && (
        <div className="md:hidden bg-white/98 backdrop-blur-xl border-t border-gray-100 px-6 py-5 flex flex-col gap-1 shadow-lg">
          <Link
            to="/"
            onClick={() => setMenuOpen(false)}
            className="px-4 py-3 text-sm tracking-widest uppercase text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition font-medium"
          >
            Home
          </Link>
          <Link
            to="/products"
            onClick={() => setMenuOpen(false)}
            className="px-4 py-3 text-sm tracking-widest uppercase text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition font-medium"
          >
            Products
          </Link>

          {isLoggedIn && user?.role === 'BUYER' && (
            <>
              <Link
                to="/cart"
                onClick={() => setMenuOpen(false)}
                className="px-4 py-3 text-sm tracking-widest uppercase text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition font-medium flex items-center justify-between"
              >
                <span>Cart</span>
                {items.length > 0 && (
                  <span className="bg-amber-600 text-white text-[10px] px-2 py-0.5 rounded-full font-bold">
                    {items.length}
                  </span>
                )}
              </Link>
              <Link
                to="/profile"
                onClick={() => setMenuOpen(false)}
                className="px-4 py-3 text-sm tracking-widest uppercase text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition font-medium"
              >
                My Orders
              </Link>
            </>
          )}

          <div className="border-t border-gray-100 mt-2 pt-3 flex flex-col gap-2">
            {!isLoggedIn ? (
              <>
                <Link
                  to="/login"
                  onClick={() => setMenuOpen(false)}
                  className="px-4 py-3 text-sm tracking-widest uppercase text-center text-gray-700 border border-gray-300 rounded-lg hover:border-gray-900 transition font-medium"
                >
                  Login
                </Link>
                <Link
                  to="/signup"
                  onClick={() => setMenuOpen(false)}
                  className="px-4 py-3 text-sm tracking-widest uppercase text-center text-white bg-gray-900 rounded-lg hover:bg-amber-600 transition font-medium"
                >
                  Sign Up
                </Link>
              </>
            ) : (
              <button
                onClick={() => { handleLogout(); setMenuOpen(false); }}
                className="px-4 py-3 text-sm tracking-widest uppercase text-red-500 hover:bg-red-50 rounded-lg transition font-medium text-left"
              >
                Logout
              </button>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;