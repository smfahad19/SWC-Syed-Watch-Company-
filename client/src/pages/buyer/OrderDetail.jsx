import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { toast } from 'react-toastify'
import api from '../../services/api'
import Loader from '../../components/Loader'

const statusColor = (status) => {
  if (status === 'DELIVERED') return 'text-green-600'
  if (status === 'CANCELLED') return 'text-red-500'
  if (status === 'SHIPPED') return 'text-blue-500'
  if (status === 'CONFIRMED') return 'text-purple-500'
  return 'text-yellow-600'
}

const statusSteps = ['PENDING', 'CONFIRMED', 'SHIPPED', 'DELIVERED']

const OrderDetail = () => {
  const { id } = useParams()
  const [order, setOrder] = useState(null)
  const [loading, setLoading] = useState(true)
  const [cancelling, setCancelling] = useState(false)

  useEffect(() => {
    fetchOrder()
  }, [id])

  const fetchOrder = async () => {
    try {
      const res = await api.get(`/buyer/orders/${id}`)
      setOrder(res.data.data)
    } catch {
      toast.error('Order load nahi hua')
    } finally {
      setLoading(false)
    }
  }

  const handleCancel = async () => {
    setCancelling(true)
    try {
      await api.put(`/buyer/orders/${id}/cancel`)
      toast.success('Order cancel ho gaya')
      fetchOrder()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Cancel nahi hua')
    } finally {
      setCancelling(false)
    }
  }

  if (loading) return <Loader />

  if (!order) return (
    <div className='min-h-screen flex flex-col items-center justify-center gap-4'>
      <p className='text-gray-400 text-sm tracking-widest uppercase'>Order not found</p>
      <Link to='/profile' className='border border-black px-6 py-2 text-xs tracking-widest uppercase hover:bg-black hover:text-white transition'>
        Back to Profile
      </Link>
    </div>
  )

  const isCancelled = order.status === 'CANCELLED'
  const currentStep = statusSteps.indexOf(order.status)

  return (
    <div className='max-w-3xl mx-auto px-4 py-14'>

      <Link to='/profile' className='text-xs text-gray-400 hover:text-black transition tracking-widest uppercase mb-8 inline-block'>
        ← Back to My Orders
      </Link>

      {/* Header */}
      <div className='flex items-start justify-between mb-10'>
        <div>
          <h1 className='text-2xl font-bold tracking-widest uppercase'>Order #{order.id}</h1>
          <p className='text-xs text-gray-400 mt-2'>
            Placed on {new Date(order.createdAt).toLocaleDateString('en-PK', {
              day: 'numeric', month: 'long', year: 'numeric'
            })}
          </p>
        </div>
        <span className={`text-xs font-bold tracking-widest uppercase border px-3 py-1.5 ${
          isCancelled ? 'border-red-300 text-red-500' : 'border-gray-200 ' + statusColor(order.status)
        }`}>
          {order.status}
        </span>
      </div>

      {/* Progress tracker — only if not cancelled */}
      {!isCancelled && (
        <div className='mb-10'>
          <div className='flex items-center justify-between relative'>
            <div className='absolute top-3 left-0 right-0 h-px bg-gray-200 z-0' />
            <div
              className='absolute top-3 left-0 h-px bg-black z-0 transition-all duration-500'
              style={{ width: currentStep === 0 ? '0%' : `${(currentStep / (statusSteps.length - 1)) * 100}%` }}
            />
            {statusSteps.map((step, i) => (
              <div key={step} className='flex flex-col items-center z-10'>
                <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center text-xs transition-all ${
                  i <= currentStep
                    ? 'bg-black border-black text-white'
                    : 'bg-white border-gray-300 text-gray-300'
                }`}>
                  {i < currentStep ? '✓' : i === currentStep ? '●' : ''}
                </div>
                <p className={`text-xs mt-2 tracking-widest uppercase ${i <= currentStep ? 'text-black font-semibold' : 'text-gray-400'}`}>
                  {step}
                </p>
              </div>
            ))}
          </div>
          {order.trackingMessage && (
            <p className='text-xs text-gray-500 mt-4 text-center'>{order.trackingMessage}</p>
          )}
        </div>
      )}

      <div className='grid grid-cols-1 md:grid-cols-2 gap-6 mb-8'>

        {/* Delivery Details */}
        <div className='border border-gray-100 p-5'>
          <h2 className='text-xs font-semibold tracking-widest uppercase text-gray-400 mb-4'>Delivery Details</h2>
          <div className='flex flex-col gap-2 text-sm'>
            <div className='flex justify-between'>
              <span className='text-gray-400 text-xs'>Name</span>
              <span className='font-medium'>{order.fullName}</span>
            </div>
            <div className='flex justify-between'>
              <span className='text-gray-400 text-xs'>Phone</span>
              <span>{order.phone}</span>
            </div>
            {order.email && (
              <div className='flex justify-between'>
                <span className='text-gray-400 text-xs'>Email</span>
                <span>{order.email}</span>
              </div>
            )}
            <div className='flex justify-between'>
              <span className='text-gray-400 text-xs'>Address</span>
              <span className='text-right max-w-[60%]'>
                {order.address}
                {order.apartment ? `, ${order.apartment}` : ''}
              </span>
            </div>
            {order.landmark && (
              <div className='flex justify-between'>
                <span className='text-gray-400 text-xs'>Landmark</span>
                <span>{order.landmark}</span>
              </div>
            )}
            <div className='flex justify-between'>
              <span className='text-gray-400 text-xs'>City</span>
              <span>{order.city}</span>
            </div>
            <div className='flex justify-between'>
              <span className='text-gray-400 text-xs'>Postal Code</span>
              <span>{order.postalCode}</span>
            </div>
            <div className='flex justify-between'>
              <span className='text-gray-400 text-xs'>Province</span>
              <span>{order.province}</span>
            </div>
          </div>
        </div>

        {/* Payment & Summary */}
        <div className='border border-gray-100 p-5'>
          <h2 className='text-xs font-semibold tracking-widest uppercase text-gray-400 mb-4'>Order Summary</h2>
          <div className='flex flex-col gap-3'>
            {order.items.map((item) => (
              <div key={item.id} className='flex items-center gap-3'>
                <div className='w-10 h-10 bg-gray-100 flex-shrink-0 overflow-hidden'>
                  {item.product.images?.[0] ? (
                    <img src={item.product.images[0]} alt={item.product.name} className='w-full h-full object-cover' />
                  ) : null}
                </div>
                <div className='flex-1 min-w-0'>
                  <p className='text-xs font-medium truncate'>{item.product.name}</p>
                  <p className='text-xs text-gray-400'>× {item.quantity}</p>
                </div>
                <span className='text-xs font-semibold'>
                  Rs. {(item.price * item.quantity).toLocaleString()}
                </span>
              </div>
            ))}
          </div>

          <div className='border-t border-gray-100 mt-4 pt-4 flex flex-col gap-2'>
            <div className='flex justify-between text-xs text-gray-400'>
              <span>Payment</span>
              <span>Cash on Delivery</span>
            </div>
            <div className='flex justify-between font-bold text-sm'>
              <span>Total</span>
              <span>Rs. {order.totalPrice.toLocaleString()}</span>
            </div>
          </div>
        </div>

      </div>

      {/* Cancel button */}
      {order.status === 'PENDING' && (
        <div className='border border-red-100 bg-red-50 p-4 flex items-center justify-between'>
          <div>
            <p className='text-xs font-semibold text-red-500 uppercase tracking-widest'>Cancel Order</p>
            <p className='text-xs text-gray-400 mt-1'>Only possible within 6 hours of placing the order</p>
          </div>
          <button
            onClick={handleCancel}
            disabled={cancelling}
            className='text-xs border border-red-400 text-red-400 px-5 py-2 hover:bg-red-400 hover:text-white transition disabled:opacity-50'
          >
            {cancelling ? 'Cancelling...' : 'Cancel Order'}
          </button>
        </div>
      )}

    </div>
  )
}

export default OrderDetail