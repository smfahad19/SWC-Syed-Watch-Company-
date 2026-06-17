import { Link, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { toast } from 'react-toastify';
import { FiShoppingCart, FiUser, FiMenu, FiX } from 'react-icons/fi';
import { useState } from 'react';
import { logout } from '../redux/slices/authSlice';
import { clearCart } from '../redux/slices/cartSlice';
import api from '../services/api';

const Navbar = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { isLoggedIn, user } = useSelector((state) => state.auth);
  const { items } = useSelector((state) => state.cart);
  const [menuOpen, setMenuOpen] = useState(false);

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
    <nav className="sticky top-0 z-50 bg-[#0e1629]/80 backdrop-blur-xl border-b border-white/10 shadow-2xl shadow-black/20">
      <div className="max-w-6xl mx-auto px-4 py-3.5 flex items-center justify-between">

        {/* logo */}
        <Link to="/" className="flex flex-col leading-none">
          <span className="text-xl font-black tracking-[6px] uppercase text-white drop-shadow-[0_0_20px_rgba(255,255,255,0.05)]">
            S<span className="text-blue-400">&</span>S
          </span>
          <span className="text-[9px] tracking-[3px] uppercase text-white/50">Syed & Sons</span>
        </Link>

        {/* desktop nav */}
        <div className="hidden md:flex items-center gap-8">
          <Link to="/" className="text-xs tracking-widest uppercase text-white/80 hover:text-white transition">
            Home
          </Link>
          <Link to="/products" className="text-xs tracking-widest uppercase text-white/80 hover:text-white transition">
            Products
          </Link>
          {isLoggedIn && user?.role === 'BUYER' && (
            <Link to="/profile" className="text-xs tracking-widest uppercase text-white/80 hover:text-white transition">
              My Orders
            </Link>
          )}
        </div>

        {/* right side */}
        <div className="flex items-center gap-3">

          {isLoggedIn && user?.role === 'BUYER' && (
            <Link
              to="/cart"
              className="relative flex items-center gap-1.5 bg-blue-600/90 backdrop-blur-sm text-white px-3 py-2 text-xs tracking-widest uppercase rounded-xl shadow-[0_0_30px_rgba(59,130,246,0.25)] hover:shadow-[0_0_40px_rgba(59,130,246,0.35)] hover:bg-blue-500/90 transition border border-white/10"
            >
              <FiShoppingCart size={14} />
              <span>Cart</span>
              {items.length > 0 && (
                <span className="absolute -top-1.5 -right-1.5 bg-red-500 text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center font-bold shadow-lg shadow-red-500/30">
                  {items.length}
                </span>
              )}
            </Link>
          )}

          {isLoggedIn ? (
            <div className="hidden md:flex items-center gap-3">
              <Link
                to="/profile"
                className="flex items-center gap-1.5 text-xs tracking-widest uppercase text-white/80 hover:text-white transition"
              >
                <FiUser size={14} />
                <span>{user?.name?.split(' ')[0]}</span>
              </Link>
              <button
                onClick={handleLogout}
                className="text-xs tracking-widest uppercase text-white/50 hover:text-red-400 transition"
              >
                Logout
              </button>
            </div>
          ) : (
            <div className="hidden md:flex items-center gap-2">
              <Link
                to="/login"
                className="text-xs tracking-widest uppercase text-white/80 hover:text-white transition px-3 py-2 rounded-xl border border-white/10 hover:border-white/30 backdrop-blur-sm"
              >
                Login
              </Link>
              <Link
                to="/signup"
                className="text-xs tracking-widest uppercase bg-blue-600/90 backdrop-blur-sm text-white px-3 py-2 rounded-xl shadow-[0_0_30px_rgba(59,130,246,0.2)] hover:shadow-[0_0_40px_rgba(59,130,246,0.3)] hover:bg-blue-500/90 transition border border-white/10"
              >
                Sign Up
              </Link>
            </div>
          )}

          {/* mobile toggle */}
          <button
            className="md:hidden p-1 text-white/60 hover:text-white transition"
            onClick={() => setMenuOpen(!menuOpen)}
          >
            {menuOpen ? <FiX size={22} /> : <FiMenu size={22} />}
          </button>

        </div>
      </div>

      {/* mobile menu */}
      {menuOpen && (
        <div className="md:hidden bg-[#0e1629]/90 backdrop-blur-xl border-t border-white/10 px-4 py-5 flex flex-col gap-4 shadow-2xl shadow-black/30">
          <Link to="/" onClick={() => setMenuOpen(false)} className="text-sm tracking-widest uppercase text-white/80 hover:text-white transition">Home</Link>
          <Link to="/products" onClick={() => setMenuOpen(false)} className="text-sm tracking-widest uppercase text-white/80 hover:text-white transition">Products</Link>
          {isLoggedIn && user?.role === 'BUYER' && (
            <>
              <Link to="/cart" onClick={() => setMenuOpen(false)} className="text-sm tracking-widest uppercase text-white/80 hover:text-white transition">Cart ({items.length})</Link>
              <Link to="/profile" onClick={() => setMenuOpen(false)} className="text-sm tracking-widest uppercase text-white/80 hover:text-white transition">My Orders</Link>
            </>
          )}
          {!isLoggedIn && (
            <>
              <Link to="/login" onClick={() => setMenuOpen(false)} className="text-sm tracking-widest uppercase text-white/80 hover:text-white transition">Login</Link>
              <Link to="/signup" onClick={() => setMenuOpen(false)} className="text-sm tracking-widest uppercase text-white/80 hover:text-white transition">Sign Up</Link>
            </>
          )}
          {isLoggedIn && (
            <button onClick={() => { handleLogout(); setMenuOpen(false); }} className="text-sm tracking-widest uppercase text-red-400 hover:text-red-300 transition text-left">
              Logout
            </button>
          )}
        </div>
      )}
    </nav>
  );
};

export default Navbar;