import prisma from '../config/db.js'
import ApiResponse from '../utils/ApiResponse.js'
import uploadToCloudinary from '../utils/uploadToCloudinary.js'
import { getActiveUsersCount } from '../utils/activeUsers.js'

// ─── DASHBOARD ────────────────────────────────────────────
export const getDashboardStats = async (req, res, next) => {
  try {
    const [
      totalUsers, totalProducts, totalOrders,
      pendingOrders, inProgressOrders, deliveredOrders, cancelledOrders,
      revenueResult, recentOrders, lowStockProducts, recentReviews,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.product.count(),
      prisma.order.count(),
      prisma.order.count({ where: { status: 'PENDING' } }),
      prisma.order.count({ where: { status: { in: ['CONFIRMED', 'SHIPPED'] } } }),
      prisma.order.count({ where: { status: 'DELIVERED' } }),
      prisma.order.count({ where: { status: 'CANCELLED' } }),
      prisma.order.aggregate({ _sum: { totalPrice: true }, where: { status: 'DELIVERED', isPaid: true } }),
      prisma.order.findMany({
        take: 10, orderBy: { createdAt: 'desc' },
        include: {
          user: { select: { name: true, email: true } },
          items: { include: { product: { select: { name: true } } } },
        },
      }),
      prisma.product.findMany({
        where: { stock: { lte: 5 } },
        select: { id: true, name: true, stock: true },
        orderBy: { stock: 'asc' }, take: 10,
      }),
      prisma.review.findMany({
        take: 10, orderBy: { createdAt: 'desc' },
        include: {
          user: { select: { name: true } },
          product: { select: { name: true } },
        },
      }),
    ])

    const activeUsers = getActiveUsersCount()

    res.status(200).json(new ApiResponse(200, 'Dashboard stats', {
      totalUsers, totalProducts, totalOrders,
      pendingOrders, inProgressOrders, deliveredOrders, cancelledOrders,
      totalRevenue: revenueResult._sum.totalPrice || 0,
      recentOrders, lowStockProducts, recentReviews, activeUsers,
    }))
  } catch (err) { next(err) }
}

// ─── PRODUCTS ────────────────────────────────────────────
export const getAllProducts = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, search = '', categoryId } = req.query
    const skip = (Number(page) - 1) * Number(limit)
    const where = {
      ...(search && { name: { contains: search, mode: 'insensitive' } }),
      ...(categoryId && { categoryId: Number(categoryId) }),
    }
    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where, skip, take: Number(limit), orderBy: { createdAt: 'desc' },
        include: { category: { select: { name: true } }, _count: { select: { reviews: true, orderItems: true } } },
      }),
      prisma.product.count({ where }),
    ])
    res.status(200).json(new ApiResponse(200, 'Products fetched', { products, total, page: Number(page), totalPages: Math.ceil(total / Number(limit)) }))
  } catch (err) { next(err) }
}

export const getProductById = async (req, res, next) => {
  try {
    const product = await prisma.product.findUnique({
      where: { id: Number(req.params.id) },
      include: { category: true, reviews: { include: { user: { select: { name: true } } }, orderBy: { createdAt: 'desc' } } },
    })
    if (!product) return res.status(404).json(new ApiResponse(404, 'Product not found'))
    res.status(200).json(new ApiResponse(200, 'Product fetched', product))
  } catch (err) { next(err) }
}

export const createProduct = async (req, res, next) => {
  try {
    const { name, description, price, discountPrice, stock, categoryId, isActive } = req.body
    if (!name || !price || !stock || !categoryId)
      return res.status(400).json(new ApiResponse(400, 'Missing required fields'))

    const category = await prisma.category.findUnique({ where: { id: Number(categoryId) } })
    if (!category) return res.status(400).json(new ApiResponse(400, 'Category not found'))

    let images = []
    if (req.files && req.files.length > 0) {
      images = await Promise.all(req.files.map(file => uploadToCloudinary(file.buffer, 'swc/products')))
    }

    const product = await prisma.product.create({
      data: {
        name, description: description || '', images,
        price: Number(price),
        discountPrice: discountPrice ? Number(discountPrice) : null,
        stock: Number(stock),
        categoryId: Number(categoryId),
        isActive: isActive !== undefined ? Boolean(isActive) : true,
      },
    })
    res.status(201).json(new ApiResponse(201, 'Product created', product))
  } catch (err) { next(err) }
}

export const updateProduct = async (req, res, next) => {
  try {
    const { name, description, price, discountPrice, stock, categoryId, isActive } = req.body
    let images
    if (req.files && req.files.length > 0) {
      images = await Promise.all(req.files.map(file => uploadToCloudinary(file.buffer, 'swc/products')))
    }
    const product = await prisma.product.update({
      where: { id: Number(req.params.id) },
      data: {
        ...(name && { name }),
        ...(description && { description }),
        ...(price !== undefined && { price: Number(price) }),
        ...(discountPrice !== undefined && { discountPrice: discountPrice ? Number(discountPrice) : null }),
        ...(stock !== undefined && { stock: Number(stock) }),
        ...(categoryId && { categoryId: Number(categoryId) }),
        ...(isActive !== undefined && { isActive: Boolean(isActive) }),
        ...(images && { images }),
      },
    })
    res.status(200).json(new ApiResponse(200, 'Product updated', product))
  } catch (err) { next(err) }
}

export const deleteProduct = async (req, res, next) => {
  try {
    await prisma.product.delete({ where: { id: Number(req.params.id) } })
    res.status(200).json(new ApiResponse(200, 'Product deleted'))
  } catch (err) { next(err) }
}

// ─── CATEGORIES ──────────────────────────────────────────
export const getAllCategories = async (req, res, next) => {
  try {
    const categories = await prisma.category.findMany({
      include: { _count: { select: { products: true } } },
      orderBy: { createdAt: 'desc' },
    })
    res.status(200).json(new ApiResponse(200, 'Categories fetched', categories))
  } catch (err) { next(err) }
}

export const createCategory = async (req, res, next) => {
  try {
    const { name, description } = req.body
    let image = null
    if (req.file) image = await uploadToCloudinary(req.file.buffer, 'swc/categories')
    const category = await prisma.category.create({ data: { name, description, image } })
    res.status(201).json(new ApiResponse(201, 'Category created', category))
  } catch (err) { next(err) }
}

export const updateCategory = async (req, res, next) => {
  try {
    const { name, description } = req.body
    let image
    if (req.file) image = await uploadToCloudinary(req.file.buffer, 'swc/categories')
    const category = await prisma.category.update({
      where: { id: Number(req.params.id) },
      data: {
        ...(name && { name }),
        ...(description && { description }),
        ...(image && { image }),
      },
    })
    res.status(200).json(new ApiResponse(200, 'Category updated', category))
  } catch (err) { next(err) }
}

export const deleteCategory = async (req, res, next) => {
  try {
    await prisma.category.delete({ where: { id: Number(req.params.id) } })
    res.status(200).json(new ApiResponse(200, 'Category deleted'))
  } catch (err) { next(err) }
}

// ─── ORDERS ──────────────────────────────────────────────
export const getAllOrders = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, status, search = '' } = req.query
    const skip = (Number(page) - 1) * Number(limit)
    const where = {
      ...(status && { status }),
      ...(search && { OR: [{ fullName: { contains: search, mode: 'insensitive' } }, { email: { contains: search, mode: 'insensitive' } }] }),
    }
    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        where, skip, take: Number(limit), orderBy: { createdAt: 'desc' },
        include: {
          user: { select: { name: true, email: true } },
          items: { include: { product: { select: { name: true, images: true } } } },
        },
      }),
      prisma.order.count({ where }),
    ])
    res.status(200).json(new ApiResponse(200, 'Orders fetched', { orders, total, page: Number(page), totalPages: Math.ceil(total / Number(limit)) }))
  } catch (err) { next(err) }
}

export const getOrderById = async (req, res, next) => {
  try {
    const order = await prisma.order.findUnique({
      where: { id: Number(req.params.id) },
      include: { user: { select: { name: true, email: true, phone: true } }, items: { include: { product: true } } },
    })
    if (!order) return res.status(404).json(new ApiResponse(404, 'Order not found'))
    res.status(200).json(new ApiResponse(200, 'Order fetched', order))
  } catch (err) { next(err) }
}

export const updateOrderStatus = async (req, res, next) => {
  try {
    const { status, trackingMessage } = req.body
    const valid = ['PENDING', 'CONFIRMED', 'SHIPPED', 'DELIVERED', 'CANCELLED']
    if (!valid.includes(status)) return res.status(400).json(new ApiResponse(400, 'Invalid status'))
    const order = await prisma.order.update({
      where: { id: Number(req.params.id) },
      data: {
        status,
        ...(trackingMessage && { trackingMessage }),
        ...(status === 'DELIVERED' && { isPaid: true }),
      },
    })
    res.status(200).json(new ApiResponse(200, 'Order status updated', order))
  } catch (err) { next(err) }
}

// ─── CAROUSEL ────────────────────────────────────────────
export const getAllSlides = async (req, res, next) => {
  try {
    const slides = await prisma.carouselSlide.findMany({ orderBy: { order: 'asc' } })
    res.status(200).json(new ApiResponse(200, 'Slides fetched', slides))
  } catch (err) { next(err) }
}

export const createSlide = async (req, res, next) => {
  try {
    const { title, subtitle, desc, bgColor, link, order, isActive } = req.body
    let image = null
    if (req.file) image = await uploadToCloudinary(req.file.buffer, 'carousel')
    const slide = await prisma.carouselSlide.create({
      data: { title, subtitle, desc, image, bgColor: bgColor || '#18181b', link, order: Number(order || 0), isActive: isActive !== undefined ? Boolean(isActive) : true },
    })
    res.status(201).json(new ApiResponse(201, 'Slide created', slide))
  } catch (err) { next(err) }
}

export const updateSlide = async (req, res, next) => {
  try {
    const existingSlide = await prisma.carouselSlide.findUnique({ where: { id: Number(req.params.id) } })
    if (!existingSlide) return res.status(404).json(new ApiResponse(404, 'Slide not found'))
    let image = existingSlide.image
    if (req.file) image = await uploadToCloudinary(req.file.buffer, 'carousel')
    const { title, subtitle, desc, bgColor, link, order, isActive } = req.body
    const slide = await prisma.carouselSlide.update({
      where: { id: Number(req.params.id) },
      data: {
        ...(title !== undefined && { title }),
        ...(subtitle !== undefined && { subtitle }),
        ...(desc !== undefined && { desc }),
        ...(image !== undefined && { image }),
        ...(bgColor !== undefined && { bgColor }),
        ...(link !== undefined && { link }),
        ...(order !== undefined && { order: Number(order) }),
        ...(isActive !== undefined && { isActive: Boolean(isActive) }),
      },
    })
    res.status(200).json(new ApiResponse(200, 'Slide updated', slide))
  } catch (err) { next(err) }
}

export const deleteSlide = async (req, res, next) => {
  try {
    await prisma.carouselSlide.delete({ where: { id: Number(req.params.id) } })
    res.status(200).json(new ApiResponse(200, 'Slide deleted'))
  } catch (err) { next(err) }
}

export const reorderSlides = async (req, res, next) => {
  try {
    const { slides } = req.body
    await Promise.all(slides.map(({ id, order }) => prisma.carouselSlide.update({ where: { id }, data: { order } })))
    res.status(200).json(new ApiResponse(200, 'Slides reordered'))
  } catch (err) { next(err) }
}

// ─── REVIEWS ─────────────────────────────────────────────
export const getAllReviews = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, productId } = req.query
    const skip = (Number(page) - 1) * Number(limit)
    const where = productId ? { productId: Number(productId) } : {}
    const [reviews, total] = await Promise.all([
      prisma.review.findMany({
        where, skip, take: Number(limit), orderBy: { createdAt: 'desc' },
        include: { user: { select: { name: true, email: true } }, product: { select: { name: true } } },
      }),
      prisma.review.count({ where }),
    ])
    res.status(200).json(new ApiResponse(200, 'Reviews fetched', { reviews, total, page: Number(page), totalPages: Math.ceil(total / Number(limit)) }))
  } catch (err) { next(err) }
}

export const deleteReview = async (req, res, next) => {
  try {
    await prisma.review.delete({ where: { id: Number(req.params.id) } })
    res.status(200).json(new ApiResponse(200, 'Review deleted'))
  } catch (err) { next(err) }
}

// ─── USERS ───────────────────────────────────────────────
export const getAllUsers = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, search = '' } = req.query
    const skip = (Number(page) - 1) * Number(limit)
    const where = search ? { OR: [{ name: { contains: search, mode: 'insensitive' } }, { email: { contains: search, mode: 'insensitive' } }] } : {}
    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where, skip, take: Number(limit), orderBy: { createdAt: 'desc' },
        select: { id: true, name: true, email: true, role: true, isVerified: true, createdAt: true, _count: { select: { orders: true, reviews: true } } },
      }),
      prisma.user.count({ where }),
    ])
    res.status(200).json(new ApiResponse(200, 'Users fetched', { users, total, page: Number(page), totalPages: Math.ceil(total / Number(limit)) }))
  } catch (err) { next(err) }
}

export const updateUserRole = async (req, res, next) => {
  try {
    const { role } = req.body
    if (!['BUYER', 'SELLER'].includes(role)) return res.status(400).json(new ApiResponse(400, 'Invalid role'))
    const user = await prisma.user.update({ where: { id: Number(req.params.id) }, data: { role } })
    res.status(200).json(new ApiResponse(200, 'Role updated', { id: user.id, role: user.role }))
  } catch (err) { next(err) }
}

export const deleteUser = async (req, res, next) => {
  try {
    await prisma.user.delete({ where: { id: Number(req.params.id) } })
    res.status(200).json(new ApiResponse(200, 'User deleted'))
  } catch (err) { next(err) }
}

// ─── NOTIFICATIONS ───────────────────────────────────────
export const getNewOrderNotifications = async (req, res, next) => {
  try {
    const { since } = req.query
    const fromDate = since ? new Date(since) : new Date(Date.now() - 60 * 1000)
    const newOrders = await prisma.order.findMany({
      where: { createdAt: { gt: fromDate } },
      orderBy: { createdAt: 'desc' },
      include: { user: { select: { name: true } }, items: { include: { product: { select: { name: true } } } } },
    })
    res.status(200).json(new ApiResponse(200, 'Notifications fetched', { count: newOrders.length, orders: newOrders, checkedAt: new Date().toISOString() }))
  } catch (err) { next(err) }
}

// ─── ANALYTICS ───────────────────────────────────────────
export const getSalesAnalytics = async (req, res, next) => {
  try {
    const { from, to } = req.query
    const fromDate = from ? new Date(from) : new Date(new Date().setDate(new Date().getDate() - 30))
    const toDate = to ? new Date(to) : new Date()

    const [totalSales, ordersByStatus, topProducts, revenueByDate, totalOrders, totalUsers] = await Promise.all([
      prisma.order.aggregate({ _sum: { totalPrice: true }, _count: { id: true }, where: { status: 'DELIVERED', createdAt: { gte: fromDate, lte: toDate } } }),
      prisma.order.groupBy({ by: ['status'], _count: { id: true }, where: { createdAt: { gte: fromDate, lte: toDate } } }),
      prisma.orderItem.groupBy({ by: ['productId'], _sum: { quantity: true, price: true }, orderBy: { _sum: { price: 'desc' } }, take: 5 }),
      prisma.order.findMany({ where: { status: 'DELIVERED', createdAt: { gte: fromDate, lte: toDate } }, select: { createdAt: true, totalPrice: true }, orderBy: { createdAt: 'asc' } }),
      prisma.order.count(),
      prisma.user.count(),
    ])

    const productIds = topProducts.map(p => p.productId)
    const products = await prisma.product.findMany({ where: { id: { in: productIds } }, select: { id: true, name: true, images: true } })
    const productMap = Object.fromEntries(products.map(p => [p.id, p]))
    const enrichedTopProducts = topProducts.map(p => ({ ...p, product: productMap[p.productId] || null }))

    res.status(200).json(new ApiResponse(200, 'Analytics fetched', {
      totalRevenue: totalSales._sum.totalPrice || 0,
      totalDeliveredOrders: totalSales._count.id,
      totalOrders, totalUsers,
      ordersByStatus, revenueByDate,
      topProducts: enrichedTopProducts,
      range: { from: fromDate, to: toDate },
    }))
  } catch (err) { next(err) }
}