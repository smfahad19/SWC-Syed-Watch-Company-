import { useEffect, useState } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { setCart, clearCart } from './redux/slices/cartSlice';
import { loginSuccess } from './redux/slices/authSlice';
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

import ProtectedRoute from './components/ProtectedRoute';
import Navbar from './components/Navbar';
import Footer from './components/Footer';

const BuyerLayout = ({ isLoggedIn }) => (
  <>
    <Navbar />
    <Routes>
      <Route path='/' element={<Home />} />
      <Route path='/products' element={<ProductList />} />
      <Route path='/products/:id' element={<ProductDetail />} />
      <Route path='/login' element={!isLoggedIn ? <Login /> : <Navigate to='/' replace />} />
      <Route path='/signup' element={!isLoggedIn ? <Signup /> : <Navigate to='/' replace />} />
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

const App = () => {
  const dispatch = useDispatch();
  const { isLoggedIn, user } = useSelector((state) => state.auth);
  const [authReady, setAuthReady] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem('swc_user');
    const token = localStorage.getItem('token');
    if (stored && token && !isLoggedIn) {
      try {
        dispatch(loginSuccess(JSON.parse(stored)));
      } catch {
        localStorage.removeItem('swc_user');
        localStorage.removeItem('token');
      }
    }
    setAuthReady(true);
  }, []);

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

  if (!authReady) {
    return (
      <div className='min-h-screen flex items-center justify-center'>
        <div className='w-6 h-6 border-2 border-black border-t-transparent rounded-full animate-spin' />
      </div>
    );
  }

  if (isLoggedIn && user?.role === 'SELLER') {
    return (
      <Routes>
        <Route path='/admin/*' element={<AdminRoutes />} />
        <Route path='*' element={<Navigate to='/admin/dashboard' replace />} />
      </Routes>
    );
  }

  return (
    <Routes>
      <Route path='/*' element={<BuyerLayout isLoggedIn={isLoggedIn} />} />
    </Routes>
  );
};

export default App;