import { useSelector } from 'react-redux'
import { Navigate, Outlet } from 'react-router-dom'

const ProtectedRoute = ({ adminOnly = false }) => {
  const { user, isLoggedIn } = useSelector((state) => state.auth)

  if (!isLoggedIn) return <Navigate to='/login' replace />

  if (adminOnly && user?.role !== 'SELLER') return <Navigate to='/' replace />

  if (!adminOnly && user?.role === 'SELLER') return <Navigate to='/admin/dashboard' replace />

  return <Outlet />
}

export default ProtectedRoute