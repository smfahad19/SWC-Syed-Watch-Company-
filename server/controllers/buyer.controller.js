import prisma from '../config/db.js'
import asyncHandler from 'express-async-handler'
import ApiResponse from '../utils/ApiResponse.js'
import sendEmail from '../utils/sendEmail.js'
import notificationEmitter from '../utils/notificationEmitter.js'

export const getProfile = asyncHandler(async (req, res) => {
  const user = await prisma.user.findUnique({
    where: { id: req.user.id },
    select: { id: true, name: true, email: true, phone: true, address: true, city: true }
  })
  res.json(new ApiResponse(200, 'Profile fetched', user))
})

export const updateProfile = asyncHandler(async (req, res) => {
  const { name, phone, address, city } = req.body
  const user = await prisma.user.update({
    where: { id: req.user.id },
    data: { name, phone, address, city },
    select: { id: true, name: true, email: true, phone: true, address: true, city: true }
  })
  res.json(new ApiResponse(200, 'Profile updated', user))
})

export const addToCart = asyncHandler(async (req, res) => {
  const { productId, quantity = 1, variant } = req.body
  const userId = Number(req.user.id)

  const product = await prisma.product.findUnique({ where: { id: Number(productId) } })
  if (!product || !product.isActive) {
    res.status(404)
    throw new Error('Product not found')
  }

  if (product.stock < quantity) {
    res.status(400)
    throw new Error(`Only ${product.stock} items in stock`)
  }

  const existing = await prisma.cart.findUnique({
    where: {
      userId_productId: {
        userId,
        productId: Number(productId),
      }
    }
  })

  if (existing) {
    const updated = await prisma.cart.update({
      where: {
        userId_productId: {
          userId,
          productId: Number(productId),
        }
      },
      data: { 
        quantity: existing.quantity + quantity,
        variant: variant || null
      }
    })
    return res.json(new ApiResponse(200, 'Cart updated', updated))
  }

  const cartItem = await prisma.cart.create({
    data: {
      userId,
      productId: Number(productId),
      quantity,
      variant: variant || null
    }
  })
  res.status(201).json(new ApiResponse(201, 'Added to cart', cartItem))
})

export const getCart = asyncHandler(async (req, res) => {
  const cart = await prisma.cart.findMany({
    where: { userId: Number(req.user.id) },
    include: {
      product: {
        select: { id: true, name: true, price: true, discountPrice: true, images: true, stock: true }
      }
    }
  })
  res.json(new ApiResponse(200, 'Cart fetched', cart))
})

export const removeFromCart = asyncHandler(async (req, res) => {
  const { productId } = req.params
  await prisma.cart.deleteMany({
    where: { userId: Number(req.user.id), productId: Number(productId) }
  })
  res.json(new ApiResponse(200, 'Removed from cart'))
})

export const clearCart = asyncHandler(async (req, res) => {
  await prisma.cart.deleteMany({ where: { userId: Number(req.user.id) } })
  res.json(new ApiResponse(200, 'Cart cleared'))
})

export const placeOrder = asyncHandler(async (req, res) => {
  const { fullName, phone, email, address, apartment, landmark, city, postalCode, province } = req.body

  if (!fullName || !phone || !address || !city || !postalCode || !province) {
    res.status(400)
    throw new Error('All required fields must be filled')
  }

  const cartItems = await prisma.cart.findMany({
    where: { userId: Number(req.user.id) },
    include: { product: true }
  })

  if (cartItems.length === 0) {
    res.status(400)
    throw new Error('Cart is empty')
  }

  for (const item of cartItems) {
    if (item.product.stock < item.quantity) {
      res.status(400)
      throw new Error(`${item.product.name} has insufficient stock`)
    }
  }

  const totalPrice = cartItems.reduce((acc, item) => {
    const price = item.product.discountPrice || item.product.price
    return acc + price * item.quantity
  }, 0)

  const order = await prisma.order.create({
    data: {
      userId: Number(req.user.id),
      totalPrice,
      fullName,
      phone,
      email,
      address,
      apartment,
      landmark,
      city,
      postalCode,
      province,
      items: {
        create: cartItems.map((item) => ({
          productId: item.productId,
          quantity: item.quantity,
          price: item.product.discountPrice || item.product.price,
          variant: item.variant   // 👈 store variant from cart
        }))
      }
    },
    include: { items: true }
  })

  // Update stock
  for (const item of cartItems) {
    await prisma.product.update({
      where: { id: item.productId },
      data: { stock: { decrement: item.quantity } }
    })
  }

  // Clear cart
  await prisma.cart.deleteMany({ where: { userId: Number(req.user.id) } })

  // Send notification to admin
  notificationEmitter.emit('new-order', {
    id: order.id,
    totalPrice: order.totalPrice,
    fullName,
    createdAt: order.createdAt,
  })

  // Send email to user
  const user = await prisma.user.findUnique({ where: { id: Number(req.user.id) } })
  await sendEmail({
    to: user.email,
    subject: 'Order Confirmed — Syed & Sons',
    html: `
      <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:40px 20px;">
        <h2 style="letter-spacing:4px;">SYED & SONS</h2>
        <p>Dear ${fullName},</p>
        <p>Your order <strong>#${order.id}</strong> has been placed successfully.</p>
        <p>Delivery to: ${address}${apartment ? ', ' + apartment : ''}, ${city}, ${province} - ${postalCode}</p>
        <p>Total: <strong>Rs. ${totalPrice.toLocaleString()}</strong></p>
        <p>Payment: Cash on Delivery</p>
        <p>We will update you when your order is shipped.</p>
      </div>
    `
  })

  res.status(201).json(new ApiResponse(201, 'Order placed successfully', order))
})

export const getMyOrders = asyncHandler(async (req, res) => {
  const orders = await prisma.order.findMany({
    where: { userId: Number(req.user.id) },
    orderBy: { createdAt: 'desc' },
    include: {
      items: {
        include: { product: { select: { id: true, name: true, images: true } } }
      }
    }
  })
  res.json(new ApiResponse(200, 'Orders fetched', orders))
})

export const getOrderById = asyncHandler(async (req, res) => {
  const order = await prisma.order.findFirst({
    where: { id: Number(req.params.id), userId: Number(req.user.id) },
    include: {
      items: {
        include: { product: { select: { id: true, name: true, images: true } } }
      }
    }
  })
  if (!order) { res.status(404); throw new Error('Order not found') }
  res.json(new ApiResponse(200, 'Order fetched', order))
})

export const cancelOrder = asyncHandler(async (req, res) => {
  const order = await prisma.order.findFirst({
    where: { id: Number(req.params.id), userId: Number(req.user.id) }
  })
  if (!order) { res.status(404); throw new Error('Order not found') }
  if (order.status !== 'PENDING') { res.status(400); throw new Error('Only PENDING orders can be cancelled') }

  const hoursPassed = (Date.now() - new Date(order.createdAt).getTime()) / (1000 * 60 * 60)
  if (hoursPassed > 6) { res.status(400); throw new Error('Cancellation window of 6 hours has passed') }

  await prisma.order.update({ where: { id: order.id }, data: { status: 'CANCELLED' } })

  const items = await prisma.orderItem.findMany({ where: { orderId: order.id } })
  for (const item of items) {
    await prisma.product.update({
      where: { id: item.productId },
      data: { stock: { increment: item.quantity } }
    })
  }
  res.json(new ApiResponse(200, 'Order cancelled'))
})

export const getProducts = asyncHandler(async (req, res) => {
  const { categoryId, sort } = req.query
  let orderBy = { createdAt: 'desc' }
  if (sort === 'price_asc') orderBy = { price: 'asc' }
  if (sort === 'price_desc') orderBy = { price: 'desc' }

  const products = await prisma.product.findMany({
    where: { isActive: true, ...(categoryId && { categoryId: Number(categoryId) }) },
    orderBy,
    include: { category: { select: { id: true, name: true } } }
  })
  res.json(new ApiResponse(200, 'Products fetched', products))
})

export const getProductById = asyncHandler(async (req, res) => {
  const product = await prisma.product.findUnique({
    where: { id: Number(req.params.id) },
    include: {
      category: { select: { id: true, name: true } },
      reviews: {
        include: { user: { select: { id: true, name: true } } },
        orderBy: { createdAt: 'desc' }
      }
    }
  })
  if (!product || !product.isActive) { res.status(404); throw new Error('Product not found') }
  res.json(new ApiResponse(200, 'Product fetched', product))
})

export const getCategories = asyncHandler(async (req, res) => {
  const categories = await prisma.category.findMany({ orderBy: { name: 'asc' } })
  res.json(new ApiResponse(200, 'Categories fetched', categories))
})

export const getCarouselSlides = asyncHandler(async (req, res) => {
  const slides = await prisma.carouselSlide.findMany({
    where: { isActive: true },
    orderBy: { order: 'asc' }
  })
  res.json(new ApiResponse(200, 'Slides fetched', slides))
})

export const addReview = asyncHandler(async (req, res) => {
  const { id } = req.params
  const { rating, comment } = req.body
  const userId = Number(req.user.id)

  const existing = await prisma.review.findUnique({
    where: { productId_userId: { productId: Number(id), userId } }
  })
  if (existing) { res.status(400); throw new Error('Already reviewed this product') }

  const review = await prisma.review.create({
    data: { rating: Number(rating), comment, productId: Number(id), userId },
    include: { user: { select: { id: true, name: true } } }
  })
  res.status(201).json(new ApiResponse(201, 'Review added', review))
})

export const getProductReviews = asyncHandler(async (req, res) => {
  const reviews = await prisma.review.findMany({
    where: { productId: Number(req.params.id) },
    include: { user: { select: { id: true, name: true } } },
    orderBy: { createdAt: 'desc' }
  })
  res.json(new ApiResponse(200, 'Reviews fetched', reviews))
})