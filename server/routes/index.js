import express from 'express'
import authRoutes from './auth.routes.js'
import buyerRoutes from './buyer.routes.js'
import adminRoutes from './admin.routes.js'

const router = express.Router()

router.use('/auth', authRoutes)
router.use('/buyer', buyerRoutes)
router.use('/admin', adminRoutes)

export default router