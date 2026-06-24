import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import api from '../../services/api';
import GoogleLoginButton from '../../components/GoogleLoginButton';

const Signup = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [googleData, setGoogleData] = useState(null);
  const [step, setStep] = useState(1);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post('/auth/signup', form);
      toast.success('Account created! Please login.');
      navigate('/login', { replace: true });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Signup failed');
    } finally {
      setLoading(false);
    }
  };

  // Google se credential aaya — verify karke name/email nikalo
  const handleGoogleSuccess = async (credential) => {
    try {
      const res = await fetch(
        `https://oauth2.googleapis.com/tokeninfo?id_token=${credential}`
      );
      const userInfo = await res.json();
      if (userInfo.error) {
        toast.error('Google signup failed');
        return;
      }
      setGoogleData({ email: userInfo.email, name: userInfo.name });
      setStep(2);
    } catch {
      toast.error('Google signup failed');
    }
  };

  const handleGoogleComplete = async (e) => {
    e.preventDefault();
    if (!form.password) return toast.error('Password required');
    setLoading(true);
    try {
      await api.post('/auth/google-signup-complete', {
        email: googleData.email,
        name: googleData.name,
        password: form.password,
      });
      toast.success('Account created! Please login.');
      navigate('/login', { replace: true });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Signup failed');
    } finally {
      setLoading(false);
    }
  };

  if (step === 2 && googleData) {
    return (
      <div className='min-h-screen bg-white flex items-center justify-center px-4'>
        <div className='w-full max-w-md'>
          <h1 className='text-3xl font-bold text-black mb-1 tracking-widest uppercase'>SWC</h1>
          <p className='text-gray-500 text-sm mb-8'>Almost done! Set your password</p>

          <div className='mb-4 p-4 bg-gray-50 border border-gray-200'>
            <p className='text-sm text-gray-500'>Name</p>
            <p className='text-sm font-medium text-black'>{googleData.name}</p>
            <p className='text-sm text-gray-500 mt-2'>Email</p>
            <p className='text-sm font-medium text-black'>{googleData.email}</p>
          </div>

          <form onSubmit={handleGoogleComplete} className='space-y-4'>
            <div>
              <label className='text-sm text-gray-600 block mb-1'>Set Password</label>
              <input
                type='password'
                name='password'
                value={form.password}
                onChange={handleChange}
                required
                placeholder='Create a password'
                className='w-full border border-gray-300 px-4 py-3 text-sm outline-none focus:border-black'
              />
            </div>
            <button
              type='submit'
              disabled={loading}
              className='w-full bg-black text-white py-3 text-sm tracking-widest uppercase hover:bg-gray-900 disabled:opacity-50'
            >
              {loading ? 'Creating...' : 'Create Account'}
            </button>
            <button
              type='button'
              onClick={() => { setStep(1); setGoogleData(null); }}
              className='w-full text-sm text-gray-500 underline'
            >
              Back
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className='min-h-screen bg-white flex items-center justify-center px-4'>
      <div className='w-full max-w-md'>
        <h1 className='text-3xl font-bold text-black mb-1 tracking-widest uppercase'>SWC</h1>
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
              className='w-full border border-gray-300 px-4 py-3 text-sm outline-none focus:border-black'
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
            className='w-full bg-black text-white py-3 text-sm tracking-widest uppercase hover:bg-gray-900 disabled:opacity-50'
          >
            {loading ? 'Creating...' : 'Create Account'}
          </button>
        </form>

        <div className='relative my-6'>
          <div className='absolute inset-0 flex items-center'>
            <div className='w-full border-t border-gray-300'></div>
          </div>
          <div className='relative flex justify-center text-sm'>
            <span className='px-2 bg-white text-gray-400'>or continue with</span>
          </div>
        </div>

        <GoogleLoginButton
          onSuccess={handleGoogleSuccess}
          onError={() => toast.error('Google signup failed')}
        />

        <p className='text-sm text-gray-500 mt-6 text-center'>
          Already have an account?{' '}
          <Link to='/login' className='text-black font-medium underline'>Login</Link>
        </p>
      </div>
    </div>
  );
};

export default Signup;