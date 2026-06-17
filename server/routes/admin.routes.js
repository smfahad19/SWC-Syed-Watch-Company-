import express from 'express'
import multer from 'multer'
import protect from '../middleware/auth.middleware.js'
import notificationEmitter from '../utils/notificationEmitter.js'
import {
  getDashboardStats,
  getAllProducts, getProductById, createProduct, updateProduct, deleteProduct,
  getAllCategories, createCategory, updateCategory, deleteCategory,
  getAllOrders, getOrderById, updateOrderStatus,
  getAllSlides, createSlide, updateSlide, deleteSlide, reorderSlides,
  getAllReviews, deleteReview,
  getAllUsers, updateUserRole, deleteUser,
  getNewOrderNotifications, getSalesAnalytics,
} from '../controllers/admin.controller.js'

const router = express.Router()

const storage = multer.memoryStorage()
const upload = multer({ storage, limits: { fileSize: 5 * 1024 * 1024 } })

const adminOnly = (req, res, next) => {
  if (req.user.role !== 'SELLER')
    return res.status(403).json({ success: false, message: 'Admin only' })
  next()
}

router.use(protect, adminOnly)

router.get('/dashboard', getDashboardStats)

router.get('/products', getAllProducts)
router.get('/products/:id', getProductById)
router.post('/products', upload.array('images', 5), createProduct)
router.put('/products/:id', upload.array('images', 5), updateProduct)
router.delete('/products/:id', deleteProduct)

router.get('/categories', getAllCategories)
router.post('/categories', upload.single('image'), createCategory)
router.put('/categories/:id', upload.single('image'), updateCategory)
router.delete('/categories/:id', deleteCategory)

router.get('/orders', getAllOrders)
router.get('/orders/:id', getOrderById)
router.put('/orders/:id/status', updateOrderStatus)

// ─── CAROUSEL ────────────────────────────────────────────
router.get('/carousel', getAllSlides)
router.post('/carousel', upload.single('image'), createSlide)     // 👈 single image
router.put('/carousel/reorder', reorderSlides)
router.put('/carousel/:id', upload.single('image'), updateSlide)   // 👈 single image
router.delete('/carousel/:id', deleteSlide)

router.get('/reviews', getAllReviews)
router.delete('/reviews/:id', deleteReview)

router.get('/users', getAllUsers)
router.put('/users/:id/role', updateUserRole)
router.delete('/users/:id', deleteUser)

router.get('/notifications', getNewOrderNotifications)
router.get('/analytics', getSalesAnalytics)

// live SSE notifications
router.get('/notifications/stream', (req, res) => {
  res.setHeader('Content-Type', 'text/event-stream')
  res.setHeader('Cache-Control', 'no-cache')
  res.setHeader('Connection', 'keep-alive')
  res.flushHeaders()

  const ping = setInterval(() => res.write('event: ping\ndata: {}\n\n'), 30000)

  const onNewOrder = (order) => {
    res.write(`event: new-order\ndata: ${JSON.stringify(order)}\n\n`)
  }

  notificationEmitter.on('new-order', onNewOrder)

  req.on('close', () => {
    clearInterval(ping)
    notificationEmitter.off('new-order', onNewOrder)
  })
})

export default router