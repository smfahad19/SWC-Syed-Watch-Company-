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
import OrderDetail from './pages/buyer/OrderDetail';   // ✅ imported

import AdminLayout from './pages/admin/AdminLayout';
import Dashboard from './pages/admin/Dashboard';
import Products from './pages/admin/Products';
import Categories from './pages/admin/Categories';
import Orders from './pages/admin/Orders';
import Carousel from './pages/admin/Carousel';
import Users from './pages/admin/Users';
import Analytics from './pages/admin/Analytics';
import Reviews from './pages/admin/Reviews';

import ProtectedRoute from './components/ProtectedRoute';
import Navbar from './components/Navbar';
import Footer from './components/Footer';

const AuthSuccess = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get('token');

    if (token) {
      const decoded = JSON.parse(atob(token.split('.')[1]));
      localStorage.setItem('token', token);
      dispatch(loginSuccess({
        id: decoded.id,
        role: decoded.role,
        token,
      }));
      navigate(decoded.role === 'SELLER' ? '/admin/dashboard' : '/');
    } else {
      navigate('/login');
    }
  }, []);

  return <div className='min-h-screen flex items-center justify-center'>Loading...</div>;
};

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
        {/* 👇 CRITICAL: order detail route - exact match */}
        <Route path='/profile/orders/:id' element={<OrderDetail />} />
      </Route>
      {/* catch-all - must be LAST */}
      <Route path='*' element={<Navigate to='/' replace />} />
    </Routes>
    <Footer />
  </>
);

const AdminRoutes = () => (
  <Routes>
    <Route path='/admin' element={<AdminLayout />}>
      <Route index element={<Navigate to='/admin/dashboard' replace />} />
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
      } catch {}
    };
    syncCart();
  }, [isLoggedIn, dispatch]);

  if (isLoggedIn && user?.role === 'SELLER') {
    return <AdminRoutes />;
  }

  return (
    <Routes>
      <Route path='/*' element={<BuyerLayout isLoggedIn={isLoggedIn} />} />
    </Routes>
  );
};

export default App;