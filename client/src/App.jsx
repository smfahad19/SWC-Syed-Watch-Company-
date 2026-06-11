import { useEffect } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'
import { setCart, clearCart } from './redux/slices/cartSlice'
import api from './services/api'

import Login from './pages/auth/Login.jsx'
import Signup from './pages/auth/Signup.jsx'
import VerifyOtp from './pages/auth/VerifyOtp.jsx'
import Home from './pages/buyer/Home.jsx'
import ProductList from './pages/buyer/ProductList.jsx'
import ProductDetail from './pages/buyer/ProductDetail.jsx'
import Cart from './pages/buyer/Cart.jsx'
import Checkout from './pages/buyer/Checkout.jsx'
import Profile from './pages/buyer/Profile.jsx'
import OrderDetail from './pages/buyer/OrderDetail.jsx'

import ProtectedRoute from './components/ProtectedRoute.jsx'
import Navbar from './components/Navbar.jsx'
import Footer from './components/Footer.jsx'

const App = () => {
  const dispatch = useDispatch()
  const { isLoggedIn } = useSelector((state) => state.auth)

  useEffect(() => {
    if (!isLoggedIn) {
      dispatch(clearCart())
      return
    }
    const syncCart = async () => {
      try {
        const res = await api.get('/buyer/cart')
        dispatch(setCart(res.data.data))
      } catch {}
    }
    syncCart()
  }, [isLoggedIn])

  return (
    <>
      <Navbar />
      <Routes>
        <Route path='/' element={<Home />} />
        <Route path='/products' element={<ProductList />} />
        <Route path='/products/:id' element={<ProductDetail />} />

        <Route path='/login' element={!isLoggedIn ? <Login /> : <Navigate to='/' />} />
        <Route path='/signup' element={!isLoggedIn ? <Signup /> : <Navigate to='/' />} />
        <Route path='/verify-otp' element={<VerifyOtp />} />

        <Route element={<ProtectedRoute />}>
          <Route path='/cart' element={<Cart />} />
          <Route path='/checkout' element={<Checkout />} />
          <Route path='/profile' element={<Profile />} />
          <Route path='/orders/:id' element={<OrderDetail />} />
        </Route>

        <Route path='*' element={<Navigate to='/' />} />
      </Routes>
      <Footer />
    </>
  )
}

export default App