import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { toast } from 'react-toastify';
import { loginSuccess } from '../../redux/slices/authSlice';
import api from '../../services/api';
import GoogleLoginButton from '../../components/GoogleLoginButton';

const Login = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ email: '', password: '' });

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await api.post('/auth/login', form);
      const userData = res.data.data;
      localStorage.setItem('token', userData.token);
      localStorage.setItem('swc_user', JSON.stringify(userData));
      dispatch(loginSuccess(userData));
      toast.success('Welcome back!');
      navigate(userData.role === 'SELLER' ? '/admin/dashboard' : '/', { replace: true });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSuccess = async (credential) => {
    setLoading(true);
    try {
      const res = await api.post('/auth/google', { credential });
      const userData = res.data.data;
      localStorage.setItem('token', userData.token);
      localStorage.setItem('swc_user', JSON.stringify(userData));
      dispatch(loginSuccess(userData));
      toast.success('Google login successful!');
      navigate(userData.role === 'SELLER' ? '/admin/dashboard' : '/', { replace: true });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Google login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className='min-h-screen bg-white flex items-center justify-center px-4'>
      <div className='w-full max-w-md'>
        <h1 className='text-3xl font-bold mb-1 tracking-widest uppercase'>SWC</h1>
        <p className='text-gray-500 text-sm mb-8'>Login to your account</p>

        <form onSubmit={handleSubmit} className='space-y-4'>
          <div>
            <label className='text-sm text-gray-600 block mb-1'>Email Address</label>
            <input
              type='email'
              name='email'
              value={form.email}
              onChange={handleChange}
              required
              className='w-full border border-gray-300 px-4 py-3 text-sm outline-none focus:border-black'
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
              className='w-full border border-gray-300 px-4 py-3 text-sm outline-none focus:border-black'
            />
          </div>
          <button
            type='submit'
            disabled={loading}
            className='w-full bg-black text-white py-3 text-sm uppercase hover:bg-gray-900 disabled:opacity-50'
          >
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>

        <div className='relative my-6'>
          <div className='absolute inset-0 flex items-center'>
            <div className='w-full border-t border-gray-300'></div>
          </div>
          <div className='relative flex justify-center text-sm'>
            <span className='bg-white px-2 text-gray-500'>Or</span>
          </div>
        </div>

        <GoogleLoginButton onSuccess={handleGoogleSuccess} onError={() => toast.error('Google login failed')} />

        <p className='text-sm text-gray-500 mt-6 text-center'>
          Don't have an account?{' '}
          <Link to='/signup' className='text-black font-medium underline'>Sign up</Link>
        </p>
      </div>
    </div>
  );
};

export default Login;