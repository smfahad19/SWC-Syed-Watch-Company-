import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { toast } from 'react-toastify'
import { Link } from 'react-router-dom'
import { loginSuccess } from '../../redux/slices/authSlice'
import api from '../../services/api'
import Loader from '../../components/Loader'

const statusColor = (status) => {
  if (status === 'DELIVERED') return 'text-green-600'
  if (status === 'CANCELLED') return 'text-red-500'
  if (status === 'SHIPPED') return 'text-blue-500'
  if (status === 'CONFIRMED') return 'text-purple-500'
  return 'text-yellow-600'
}

const Profile = () => {
  const dispatch = useDispatch()
  const { user } = useSelector((state) => state.auth)
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({ name: '', phone: '', address: '', city: '' })

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const [profileRes, ordersRes] = await Promise.all([
        api.get('/buyer/profile'),
        api.get('/buyer/orders')
      ])
      const p = profileRes.data.data
      setForm({ name: p.name, phone: p.phone || '', address: p.address || '', city: p.city || '' })
      setOrders(ordersRes.data.data)
    } catch {
      toast.error('Data load nahi hua')
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleSave = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      const res = await api.put('/buyer/profile', form)
      dispatch(loginSuccess({ ...user, ...res.data.data }))
      toast.success('Profile update ho gaya')
    } catch {
      toast.error('Update nahi hua')
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <Loader />

  return (
    <div className='max-w-4xl mx-auto px-4 py-12'>

      <h1 className='text-2xl font-bold tracking-widest uppercase mb-8'>My Profile</h1>

      <form onSubmit={handleSave} className='grid grid-cols-1 md:grid-cols-2 gap-4 mb-14'>
        {[
          { label: 'Full Name', name: 'name', placeholder: 'Your name' },
          { label: 'Phone', name: 'phone', placeholder: '03xxxxxxxxx' },
          { label: 'Address', name: 'address', placeholder: 'Your address' },
          { label: 'City', name: 'city', placeholder: 'Your city' },
        ].map((field) => (
          <div key={field.name}>
            <label className='text-xs text-gray-500 mb-1 block'>{field.label}</label>
            <input
              type='text'
              name={field.name}
              value={form[field.name]}
              onChange={handleChange}
              placeholder={field.placeholder}
              className='w-full border border-gray-300 px-4 py-3 text-sm outline-none focus:border-black transition'
            />
          </div>
        ))}
        <div className='md:col-span-2'>
          <button
            type='submit'
            disabled={saving}
            className='bg-black text-white px-8 py-3 text-xs tracking-widest uppercase hover:bg-gray-900 transition disabled:opacity-50'
          >
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </form>

      <h2 className='text-xl font-bold tracking-widest uppercase mb-6'>My Orders</h2>

      {orders.length === 0 ? (
        <p className='text-gray-400 text-sm'>Koi order nahi abhi tak</p>
      ) : (
        <div className='flex flex-col gap-3'>
          {orders.map((order) => (
            <Link
              key={order.id}
              to={`/orders/${order.id}`}
              className='border border-gray-200 p-5 flex items-center justify-between hover:border-black transition group'
            >
              <div>
                <p className='text-xs text-gray-400 tracking-widest uppercase'>Order #{order.id}</p>
                <p className='text-sm font-bold mt-1'>Rs. {order.totalPrice.toLocaleString()}</p>
                <p className='text-xs text-gray-400 mt-1'>
                  {new Date(order.createdAt).toLocaleDateString('en-PK', {
                    day: 'numeric', month: 'long', year: 'numeric'
                  })}
                </p>
                <p className='text-xs text-gray-400 mt-1'>
                  {order.items.length} {order.items.length === 1 ? 'item' : 'items'}
                </p>
              </div>
              <div className='flex items-center gap-4'>
                <span className={`text-xs font-semibold tracking-widest uppercase ${statusColor(order.status)}`}>
                  {order.status}
                </span>
                <span className='text-gray-300 group-hover:text-black transition text-lg'>›</span>
              </div>
            </Link>
          ))}
        </div>
      )}

    </div>
  )
}

export default Profile