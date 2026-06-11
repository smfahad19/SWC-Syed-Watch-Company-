import { createSlice } from '@reduxjs/toolkit'

const initialState = {
  products: [],
  categories: [],
  selectedProduct: null,
  loading: false,
  error: null,
}

const productSlice = createSlice({
  name: 'product',
  initialState,
  reducers: {
    fetchStart: (state) => {
      state.loading = true
      state.error = null
      state.selectedProduct = null
    },
    fetchSuccess: (state, action) => {
      state.loading = false
      state.products = action.payload
    },
    fetchFail: (state, action) => {
      state.loading = false
      state.error = action.payload
    },
    setCategories: (state, action) => {
      state.categories = action.payload
    },
    setSelectedProduct: (state, action) => {
      state.selectedProduct = action.payload
      state.loading = false
    },
  },
})

export const { fetchStart, fetchSuccess, fetchFail, setCategories, setSelectedProduct } = productSlice.actions
export default productSlice.reducer