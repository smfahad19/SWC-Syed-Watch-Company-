import { useSelector } from 'react-redux'
import { Navigate, Outlet } from 'react-router-dom'

const ProtectedRoute = ({ adminOnly = false }) => {
  const { user, isLoggedIn } = useSelector((state) => state.auth)

  if (!isLoggedIn) return <Navigate to='/login' />

  if (adminOnly && user?.role !== 'SELLER') return <Navigate to='/' />

  return <Outlet />
}

export default ProtectedRoute