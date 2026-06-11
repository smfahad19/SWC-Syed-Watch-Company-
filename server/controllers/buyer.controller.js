import prisma from '../config/db.js'
import asyncHandler from 'express-async-handler'
import ApiResponse from '../utils/ApiResponse.js'
import sendEmail from '../utils/sendEmail.js'

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
  const { productId, quantity } = req.body

  const product = await prisma.product.findUnique({ where: { id: productId } })
  if (!product || !product.isActive) {
    res.status(404)
    throw new Error('Product nahi mila')
  }

  if (product.stock < quantity) {
    res.status(400)
    throw new Error('Itna stock available nahi hai')
  }

  const existing = await prisma.cart.findUnique({
    where: { userId_productId: { userId: req.user.id, productId } }
  })

  if (existing) {
    const updated = await prisma.cart.update({
      where: { userId_productId: { userId: req.user.id, productId } },
      data: { quantity: existing.quantity + quantity }
    })
    return res.json(new ApiResponse(200, 'Cart updated', updated))
  }

  const cartItem = await prisma.cart.create({
    data: { userId: req.user.id, productId, quantity }
  })
  res.status(201).json(new ApiResponse(201, 'Added to cart', cartItem))
})

export const getCart = asyncHandler(async (req, res) => {
  const cart = await prisma.cart.findMany({
    where: { userId: req.user.id },
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
    where: { userId: req.user.id, productId: parseInt(productId) }
  })
  res.json(new ApiResponse(200, 'Removed from cart'))
})

export const clearCart = asyncHandler(async (req, res) => {
  await prisma.cart.deleteMany({ where: { userId: req.user.id } })
  res.json(new ApiResponse(200, 'Cart cleared'))
})

export const placeOrder = asyncHandler(async (req, res) => {
  const { fullName, phone, email, address, apartment, landmark, city, postalCode, province } = req.body

  if (!fullName || !phone || !address || !city || !postalCode || !province) {
    res.status(400)
    throw new Error('Sab zaroori fields fill karo')
  }

  const cartItems = await prisma.cart.findMany({
    where: { userId: req.user.id },
    include: { product: true }
  })

  if (cartItems.length === 0) {
    res.status(400)
    throw new Error('Cart empty hai')
  }

  for (const item of cartItems) {
    if (item.product.stock < item.quantity) {
      res.status(400)
      throw new Error(`${item.product.name} ka stock kam hai`)
    }
  }

  const totalPrice = cartItems.reduce((acc, item) => {
    const price = item.product.discountPrice || item.product.price
    return acc + price * item.quantity
  }, 0)

  const order = await prisma.order.create({
    data: {
      userId: req.user.id,
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
          price: item.product.discountPrice || item.product.price
        }))
      }
    },
    include: { items: true }
  })

  for (const item of cartItems) {
    await prisma.product.update({
      where: { id: item.productId },
      data: { stock: { decrement: item.quantity } }
    })
  }

  await prisma.cart.deleteMany({ where: { userId: req.user.id } })

  const user = await prisma.user.findUnique({ where: { id: req.user.id } })
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
    where: { userId: req.user.id },
    orderBy: { createdAt: 'desc' },
    include: {
      items: {
        include: {
          product: { select: { id: true, name: true, images: true } }
        }
      }
    }
  })
  res.json(new ApiResponse(200, 'Orders fetched', orders))
})

export const getOrderById = asyncHandler(async (req, res) => {
  const order = await prisma.order.findFirst({
    where: { id: parseInt(req.params.id), userId: req.user.id },
    include: {
      items: {
        include: {
          product: { select: { id: true, name: true, images: true } }
        }
      }
    }
  })

  if (!order) {
    res.status(404)
    throw new Error('Order nahi mila')
  }

  res.json(new ApiResponse(200, 'Order fetched', order))
})

export const cancelOrder = asyncHandler(async (req, res) => {
  const order = await prisma.order.findFirst({
    where: { id: parseInt(req.params.id), userId: req.user.id }
  })

  if (!order) {
    res.status(404)
    throw new Error('Order nahi mila')
  }

  if (order.status !== 'PENDING') {
    res.status(400)
    throw new Error('Sirf PENDING orders cancel ho sakte hain')
  }

  const hoursPassed = (Date.now() - new Date(order.createdAt).getTime()) / (1000 * 60 * 60)
  if (hoursPassed > 6) {
    res.status(400)
    throw new Error('6 ghante guzar gaye, ab cancel nahi ho sakta')
  }

  await prisma.order.update({
    where: { id: order.id },
    data: { status: 'CANCELLED' }
  })

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
    where: {
      isActive: true,
      ...(categoryId && { categoryId: parseInt(categoryId) })
    },
    orderBy,
    include: {
      category: { select: { id: true, name: true } }
    }
  })

  res.json(new ApiResponse(200, 'Products fetched', products))
})

export const getProductById = asyncHandler(async (req, res) => {
  const product = await prisma.product.findUnique({
    where: { id: parseInt(req.params.id) },
    include: {
      category: { select: { id: true, name: true } },
      reviews: {               // ✅ Reviews include kar diye
        include: { user: { select: { id: true, name: true } } },
        orderBy: { createdAt: 'desc' }
      }
    }
  })

  if (!product || !product.isActive) {
    res.status(404)
    throw new Error('Product nahi mila')
  }

  res.json(new ApiResponse(200, 'Product fetched', product))
})

export const getCategories = asyncHandler(async (req, res) => {
  const categories = await prisma.category.findMany({
    orderBy: { name: 'asc' }
  })
  res.json(new ApiResponse(200, 'Categories fetched', categories))
})

export const getCarouselSlides = asyncHandler(async (req, res) => {
  const slides = await prisma.carouselSlide.findMany({
    where: { isActive: true },
    orderBy: { order: 'asc' }
  })
  res.json(new ApiResponse(200, 'Slides fetched', slides))
})

// ============ REVIEWS FUNCTIONS (New) ============

// Add a review (logged in user only)
export const addReview = asyncHandler(async (req, res) => {
  const { id } = req.params // productId
  const { rating, comment } = req.body
  const userId = req.user.id

  // Check if user already reviewed this product
  const existing = await prisma.review.findUnique({
    where: { productId_userId: { productId: parseInt(id), userId } }
  })
  if (existing) {
    res.status(400)
    throw new Error('You have already reviewed this product')
  }

  const review = await prisma.review.create({
    data: {
      rating: parseInt(rating),
      comment,
      productId: parseInt(id),
      userId
    },
    include: { user: { select: { id: true, name: true } } }
  })

  res.status(201).json(new ApiResponse(201, 'Review added', review))
})

// Get all reviews for a product (public)
export const getProductReviews = asyncHandler(async (req, res) => {
  const { id } = req.params
  const reviews = await prisma.review.findMany({
    where: { productId: parseInt(id) },
    include: { user: { select: { id: true, name: true } } },
    orderBy: { createdAt: 'desc' }
  })
  res.json(new ApiResponse(200, 'Reviews fetched', reviews))
})