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
      // DB se cart load hogi — action.payload = cart items array from backend
      state.items = action.payload.map((cartItem) => ({
        ...cartItem.product,
        quantity: cartItem.quantity,
      }))
      state.totalPrice = calculateTotal(state.items)
    },
    addToCart: (state, action) => {
      const existing = state.items.find(i => i.id === action.payload.id)
      if (existing) {
        existing.quantity += 1
      } else {
        state.items.push({ ...action.payload, quantity: 1 })
      }
      state.totalPrice = calculateTotal(state.items)
    },
    removeFromCart: (state, action) => {
      state.items = state.items.filter(i => i.id !== action.payload)
      state.totalPrice = calculateTotal(state.items)
    },
    updateQuantity: (state, action) => {
      const { id, quantity } = action.payload
      const item = state.items.find(i => i.id === id)
      if (item) {
        item.quantity = quantity
        if (item.quantity <= 0) {
          state.items = state.items.filter(i => i.id !== id)
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