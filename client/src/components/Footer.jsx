import { Link } from 'react-router-dom'

const Footer = () => {
  return (
    <footer className='bg-white border-t border-gray-200 mt-16'>
      <div className='max-w-6xl mx-auto px-4 py-10 grid grid-cols-1 md:grid-cols-3 gap-8'>

        <div>
          <h2 className='text-lg font-bold tracking-widest uppercase mb-3'>SWC</h2>
          <p className='text-sm text-gray-500 leading-relaxed'>
            Premium watches, leather wallets and belts. Quality you can trust.
          </p>
        </div>

        <div>
          <h3 className='text-sm font-semibold uppercase tracking-widest mb-3'>Quick Links</h3>
          <div className='flex flex-col gap-2'>
            <Link to='/' className='text-sm text-gray-500 hover:text-black transition'>Home</Link>
            <Link to='/products' className='text-sm text-gray-500 hover:text-black transition'>Products</Link>
            <Link to='/cart' className='text-sm text-gray-500 hover:text-black transition'>Cart</Link>
          </div>
        </div>

        <div>
          <h3 className='text-sm font-semibold uppercase tracking-widest mb-3'>Account</h3>
          <div className='flex flex-col gap-2'>
            <Link to='/login' className='text-sm text-gray-500 hover:text-black transition'>Login</Link>
            <Link to='/signup' className='text-sm text-gray-500 hover:text-black transition'>Sign Up</Link>
            <Link to='/profile' className='text-sm text-gray-500 hover:text-black transition'>Profile</Link>
          </div>
        </div>

      </div>

      <div className='border-t border-gray-100 py-4 text-center'>
        <p className='text-xs text-gray-400'>© 2025 Syed Watch Company. All rights reserved.</p>
      </div>

    </footer>
  )
}

export default Footer