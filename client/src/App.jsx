import { useEffect } from 'react';
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { setCart, clearCart } from './redux/slices/cartSlice';
import api from './services/api';

import Login from './pages/auth/Login';
import Signup from './pages/auth/Signup';
import Home from './pages/buyer/Home';
import ProductList from './pages/buyer/ProductList';
import ProductDetail from './pages/buyer/ProductDetail';
import Cart from './pages/buyer/Cart';
import Checkout from './pages/buyer/Checkout';
import Profile from './pages/buyer/Profile';
import OrderDetail from './pages/buyer/OrderDetail';

import AdminLayout from './pages/admin/AdminLayout';
import Dashboard from './pages/admin/Dashboard';
import Products from './pages/admin/Products';
import Categories from './pages/admin/Categories';
import Orders from './pages/admin/Orders';
import Carousel from './pages/admin/Carousel';
import Users from './pages/admin/Users';
import Analytics from './pages/admin/Analytics';
import Reviews from './pages/admin/Reviews';
import { loginSuccess } from './redux/slices/authSlice';

import ProtectedRoute from './components/ProtectedRoute';
import Navbar from './components/Navbar';
import Footer from './components/Footer';

// ✅ AuthSuccess — token URL se lo, Redux mein daalo, phir navigate
const AuthSuccess = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get('token');

    if (token) {
      try {
        const decoded = JSON.parse(atob(token.split('.')[1]));
        // Pehle localStorage set karo
        localStorage.setItem('token', token);
        localStorage.setItem('swc_user', JSON.stringify({
          id: decoded.id,
          role: decoded.role,
          token,
        }));
        // Phir dispatch
        dispatch(loginSuccess({
          id: decoded.id,
          role: decoded.role,
          token,
        }));
        // Navigate
        navigate(decoded.role === 'SELLER' ? '/admin/dashboard' : '/', { replace: true });
      } catch {
        navigate('/login', { replace: true });
      }
    } else {
      navigate('/login', { replace: true });
    }
  }, []);

  return <div className='min-h-screen flex items-center justify-center text-sm text-gray-500'>Redirecting...</div>;
};

// ✅ Buyer Layout
const BuyerLayout = ({ isLoggedIn }) => (
  <>
    <Navbar />
    <Routes>
      <Route path='/' element={<Home />} />
      <Route path='/products' element={<ProductList />} />
      <Route path='/products/:id' element={<ProductDetail />} />
      <Route path='/login' element={!isLoggedIn ? <Login /> : <Navigate to='/' replace />} />
      <Route path='/signup' element={!isLoggedIn ? <Signup /> : <Navigate to='/' replace />} />
      <Route path='/auth-success' element={<AuthSuccess />} />
      <Route element={<ProtectedRoute />}>
        <Route path='/cart' element={<Cart />} />
        <Route path='/checkout' element={<Checkout />} />
        <Route path='/profile' element={<Profile />} />
        <Route path='/profile/orders/:id' element={<OrderDetail />} />
      </Route>
      <Route path='*' element={<Navigate to='/' replace />} />
    </Routes>
    <Footer />
  </>
);

// ✅ Admin Routes
const AdminRoutes = () => (
  <Routes>
    <Route path='/' element={<AdminLayout />}>
      <Route index element={<Navigate to='dashboard' replace />} />
      <Route path='dashboard' element={<Dashboard />} />
      <Route path='products' element={<Products />} />
      <Route path='categories' element={<Categories />} />
      <Route path='orders' element={<Orders />} />
      <Route path='carousel' element={<Carousel />} />
      <Route path='users' element={<Users />} />
      <Route path='analytics' element={<Analytics />} />
      <Route path='reviews' element={<Reviews />} />
    </Route>
    <Route path='*' element={<Navigate to='/admin/dashboard' replace />} />
  </Routes>
);

// ✅ App — seller check mein loading guard lagao
const App = () => {
  const dispatch = useDispatch();
  const { isLoggedIn, user } = useSelector((state) => state.auth);

  useEffect(() => {
    if (!isLoggedIn) {
      dispatch(clearCart());
      return;
    }
    const syncCart = async () => {
      try {
        const res = await api.get('/buyer/cart');
        dispatch(setCart(res.data.data));
      } catch {
        console.log('Cart sync error');
      }
    };
    syncCart();
  }, [isLoggedIn, dispatch]);

  // ✅ SELLER ho to sirf admin routes dikhao
  if (isLoggedIn && user?.role === 'SELLER') {
    return (
      <Routes>
        <Route path='/admin/*' element={<AdminRoutes />} />
        <Route path='*' element={<Navigate to='/admin/dashboard' replace />} />
      </Routes>
    );
  }

  // ✅ Buyer ya guest
  return (
    <Routes>
      <Route path='/*' element={<BuyerLayout isLoggedIn={isLoggedIn} />} />
    </Routes>
  );
};

export default App;