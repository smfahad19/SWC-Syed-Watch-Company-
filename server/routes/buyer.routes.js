import express from 'express'
import {
  getProfile,
  updateProfile,
  addToCart,
  getCart,
  removeFromCart,
  clearCart,
  placeOrder,
  getMyOrders,
  getOrderById,
  cancelOrder,
  getProducts,
  getProductById,
  getCategories,
  getCarouselSlides,
  addReview,           // ✅ new
  getProductReviews    // ✅ new
} from '../controllers/buyer.controller.js'
import protect from '../middleware/auth.middleware.js'

const router = express.Router()

// public
router.get('/products', getProducts)
router.get('/products/:id', getProductById)
router.get('/categories', getCategories)
router.get('/carousel', getCarouselSlides)

// public reviews (anyone can see)
router.get('/products/:id/reviews', getProductReviews)

// protected (login required)
router.get('/profile', protect, getProfile)
router.put('/profile', protect, updateProfile)

router.get('/cart', protect, getCart)
router.post('/cart', protect, addToCart)
router.delete('/cart/:productId', protect, removeFromCart)
router.delete('/cart', protect, clearCart)

router.post('/orders', protect, placeOrder)
router.get('/orders', protect, getMyOrders)
router.get('/orders/:id', protect, getOrderById)
router.put('/orders/:id/cancel', protect, cancelOrder)

// add review (protected)
router.post('/products/:id/review', protect, addReview)

export default router