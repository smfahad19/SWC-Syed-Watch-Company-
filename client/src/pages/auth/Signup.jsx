import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { toast } from 'react-toastify'
import api from '../../services/api'

const Signup = () => {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
  })

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      await api.post('/auth/signup', form)
      toast.success('OTP sent to your email')
      navigate('/verify-otp', { state: { email: form.email } })
    } catch (err) {
      toast.error(err.response?.data?.message || 'Something went wrong')
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
        <p className='text-gray-500 text-sm mb-8'>Create your account</p>

        <form onSubmit={handleSubmit} className='space-y-4'>

          <div>
            <label className='text-sm text-gray-600 block mb-1'>Full Name</label>
            <input
              type='text'
              name='name'
              value={form.name}
              onChange={handleChange}
              required
              placeholder='Enter your name'
              className='w-full border border-gray-300 px-4 py-3 text-sm outline-none focus:border-black transition'
            />
          </div>

          <div>
            <label className='text-sm text-gray-600 block mb-1'>Email Address</label>
            <input
              type='email'
              name='email'
              value={form.email}
              onChange={handleChange}
              required
              placeholder='Enter your real email — OTP will be sent here'
              className='w-full border border-gray-300 px-4 py-3 text-sm outline-none focus:border-black transition'
            />
          </div>

          <div>
            <label className='text-sm text-gray-600 block mb-1'>Password</label>
            <input
              type='password'
              name='password'
              value={form.password}
              onChange={handleChange}
              required
              placeholder='Choose any password'
              className='w-full border border-gray-300 px-4 py-3 text-sm outline-none focus:border-black transition'
            />
          </div>

          <button
            type='submit'
            disabled={loading}
            className='w-full bg-black text-white py-3 text-sm tracking-widest uppercase hover:bg-gray-900 transition disabled:opacity-50'
          >
            {loading ? 'Sending OTP...' : 'Create Account'}
          </button>

        </form>

        <p className='text-sm text-gray-500 mt-6 text-center'>
          Already have an account?{' '}
          <Link to='/login' className='text-black font-medium underline'>
            Login
          </Link>
        </p>

      </div>
    </div>
  )
}

export default Signup