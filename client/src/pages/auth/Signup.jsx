import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { toast } from 'react-toastify';
import { useGoogleLogin } from '@react-oauth/google';
import api from '../../services/api';
import { loginSuccess } from '../../redux/slices/authSlice';

const Signup = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', password: '' });

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  // Email/Password Signup
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post('/auth/signup', form);
      toast.success('Account created! Please login.');
      navigate('/login');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Signup failed');
    } finally {
      setLoading(false);
    }
  };

  // Google Signup/Login
  const googleSignup = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      try {
        // Get user info from Google
        const userInfo = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
          headers: { Authorization: `Bearer ${tokenResponse.access_token}` },
        }).then(res => res.json());

        // Send to backend (same endpoint used for login/signup)
        const res = await api.post('/auth/google', {
          id_token: tokenResponse.id_token,
          email: userInfo.email,
          name: userInfo.name,
          picture: userInfo.picture,
        });

        dispatch(loginSuccess(res.data.data));
        toast.success(`Welcome ${res.data.data.name}`);

        // Redirect based on role
        if (res.data.data.role === 'SELLER') {
          navigate('/admin/dashboard');
        } else {
          navigate('/');
        }
      } catch (err) {
        toast.error(err.response?.data?.message || 'Google signup failed');
      }
    },
    onError: () => toast.error('Google signup failed'),
  });

  return (
    <div className='min-h-screen bg-white flex items-center justify-center px-4'>
      <div className='w-full max-w-md'>
        <h1 className='text-3xl font-bold text-black mb-1 tracking-widest uppercase'>SWC</h1>
        <p className='text-gray-500 text-sm mb-8'>Create your account</p>

        <form onSubmit={handleSubmit} className='space-y-4'>
          <div>
            <label className='text-sm text-gray-600 block mb-1'>Full Name</label>
            <input type='text' name='name' value={form.name} onChange={handleChange} required className='w-full border border-gray-300 px-4 py-3 text-sm outline-none focus:border-black' />
          </div>
          <div>
            <label className='text-sm text-gray-600 block mb-1'>Email Address</label>
            <input type='email' name='email' value={form.email} onChange={handleChange} required className='w-full border border-gray-300 px-4 py-3 text-sm outline-none focus:border-black' />
          </div>
          <div>
            <label className='text-sm text-gray-600 block mb-1'>Password</label>
            <input type='password' name='password' value={form.password} onChange={handleChange} required className='w-full border border-gray-300 px-4 py-3 text-sm outline-none focus:border-black' />
          </div>
          <button type='submit' disabled={loading} className='w-full bg-black text-white py-3 text-sm tracking-widest uppercase hover:bg-gray-900 disabled:opacity-50'>
            {loading ? 'Creating...' : 'Create Account'}
          </button>
        </form>

        <div className='relative my-6'>
          <div className='absolute inset-0 flex items-center'><div className='w-full border-t border-gray-300'></div></div>
          <div className='relative flex justify-center text-sm'><span className='px-2 bg-white text-gray-400'>or continue with</span></div>
        </div>

        <button
          onClick={() => googleSignup()}
          className='w-full flex items-center justify-center gap-3 border border-gray-300 px-4 py-3 rounded-md hover:bg-gray-50 transition'
        >
          <img src='https://www.google.com/favicon.ico' alt='Google' className='w-5 h-5' />
          <span className='text-sm font-medium'>Google</span>
        </button>

        <p className='text-sm text-gray-500 mt-6 text-center'>
          Already have an account? <Link to='/login' className='text-black font-medium underline'>Login</Link>
        </p>
      </div>
    </div>
  );
};

export default Signup;