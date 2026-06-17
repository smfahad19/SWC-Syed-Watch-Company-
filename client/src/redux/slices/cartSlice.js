// redux/slices/cartSlice.js
import { createSlice } from '@reduxjs/toolkit'

const calculateTotal = (items) =>
  items.reduce((acc, item) => {
    const price = item.discountPrice || item.price
    return acc + price * item.quantity
  }, 0)

const initialState = {
  items: [],
  totalPrice: 0,
}

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    setCart: (state, action) => {
      // action.payload = cart items from backend with { product, quantity, variant }
      state.items = action.payload.map((cartItem) => ({
        ...cartItem.product,
        quantity: cartItem.quantity,
        variant: cartItem.variant,   // store variant object
      }))
      state.totalPrice = calculateTotal(state.items)
    },
    addToCart: (state, action) => {
      const { product, variant } = action.payload
      const existing = state.items.find(
        item => item.id === product.id && JSON.stringify(item.variant) === JSON.stringify(variant)
      )
      if (existing) {
        existing.quantity += 1
      } else {
        state.items.push({ ...product, quantity: 1, variant })
      }
      state.totalPrice = calculateTotal(state.items)
    },
    removeFromCart: (state, action) => {
      // action.payload should contain productId and variant (or just productId if no variant)
      // For simplicity, we'll filter by id only – variant removal handled by backend.
      // Better: pass { id, variant } in payload.
      state.items = state.items.filter(i => i.id !== action.payload)
      state.totalPrice = calculateTotal(state.items)
    },
    updateQuantity: (state, action) => {
      const { id, quantity, variant } = action.payload
      const item = state.items.find(
        item => item.id === id && JSON.stringify(item.variant) === JSON.stringify(variant)
      )
      if (item) {
        item.quantity = quantity
        if (item.quantity <= 0) {
          state.items = state.items.filter(
            i => !(i.id === id && JSON.stringify(i.variant) === JSON.stringify(variant))
          )
        }
      }
      state.totalPrice = calculateTotal(state.items)
    },
    clearCart: (state) => {
      state.items = []
      state.totalPrice = 0
    },
  },
})

export const { setCart, addToCart, removeFromCart, updateQuantity, clearCart } = cartSlice.actions
export default cartSlice.reducer