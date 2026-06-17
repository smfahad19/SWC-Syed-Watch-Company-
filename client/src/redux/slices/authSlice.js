import { createSlice } from '@reduxjs/toolkit'

const userFromStorage = localStorage.getItem('swc_user')
  ? JSON.parse(localStorage.getItem('swc_user'))
  : null

const initialState = {
  user: userFromStorage,
  isLoggedIn: !!userFromStorage,
  loading: false,
  error: null,
}

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    loginStart: (state) => {
      state.loading = true
      state.error = null
    },
    loginSuccess: (state, action) => {
      state.loading = false
      state.user = action.payload
      state.isLoggedIn = true
      localStorage.setItem('swc_user', JSON.stringify(action.payload))
      localStorage.setItem('token', action.payload.token)
    },
    loginFail: (state, action) => {
      state.loading = false
      state.error = action.payload
    },
    logout: (state) => {
      state.user = null
      state.isLoggedIn = false
      localStorage.removeItem('swc_user')
      localStorage.removeItem('token')
    },
  },
})

export const { loginStart, loginSuccess, loginFail, logout } = authSlice.actions
export default authSlice.reducer