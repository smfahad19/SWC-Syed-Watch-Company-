import { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { toast } from 'react-toastify'
import api from '../../services/api'

const VerifyOtp = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const email = location.state?.email || ''
  const [code, setCode] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      await api.post('/auth/verify-otp', { email, code })
      toast.success('Email verified! Please login')
      navigate('/login')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Invalid OTP')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className='min-h-screen bg-white flex items-center justify-center px-4'>
      <div className='w-full max-w-md'>

        <h1 className='text-3xl font-bold text-black mb-1 tracking-widest uppercase'>
          SWC
        </h1>
        <p className='text-gray-500 text-sm mb-2'>Verify your email</p>
        <p className='text-sm text-gray-400 mb-8'>
          OTP sent to <span className='text-black font-medium'>{email}</span>. Check your inbox.
        </p>

        <form onSubmit={handleSubmit} className='space-y-4'>

          <div>
            <label className='text-sm text-gray-600 block mb-1'>Enter OTP</label>
            <input
              type='text'
              value={code}
              onChange={(e) => setCode(e.target.value)}
              required
              maxLength={6}
              placeholder='6 digit code'
              className='w-full border border-gray-300 px-4 py-3 text-sm outline-none focus:border-black transition tracking-widest text-center text-lg'
            />
          </div>

          <button
            type='submit'
            disabled={loading}
            className='w-full bg-black text-white py-3 text-sm tracking-widest uppercase hover:bg-gray-900 transition disabled:opacity-50'
          >
            {loading ? 'Verifying...' : 'Verify OTP'}
          </button>

        </form>

      </div>
    </div>
  )
}

export default VerifyOtp