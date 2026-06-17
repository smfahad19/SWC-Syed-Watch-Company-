import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className='bg-gray-950 text-white mt-20'>

      {/* main footer */}
      <div className='max-w-6xl mx-auto px-4 py-14 grid grid-cols-1 md:grid-cols-4 gap-10'>

        {/* brand */}
        <div className='md:col-span-2'>
          <div className='mb-4'>
            <h2 className='text-2xl font-black tracking-[6px] uppercase mb-1'>S&S</h2>
            <p className='text-xs tracking-[3px] uppercase text-gray-500'>Syed & Sons — Est. 1960s</p>
          </div>
          <p className='text-sm text-gray-400 leading-relaxed mb-4 max-w-sm'>
            Three generations of craftsmanship. We bring you Pakistan's finest timepieces and genuine leather goods — built to last, designed to impress.
          </p>
          <div className='flex flex-col gap-1'>
            <p className='text-xs text-gray-500'>Watches · Leather Wallets · Belts</p>
            <p className='text-xs text-gray-500'>60+ Years of Heritage & Trust</p>
            <p className='text-xs text-gray-500'>Lahore, Pakistan</p>
          </div>
        </div>

        {/* shop */}
        <div>
          <h3 className='text-xs font-semibold uppercase tracking-[4px] text-gray-400 mb-5'>Shop</h3>
          <div className='flex flex-col gap-3'>
            <Link to='/products' className='text-sm text-gray-400 hover:text-white transition'>All Products</Link>
            <Link to='/products?categoryId=1' className='text-sm text-gray-400 hover:text-white transition'>Watches</Link>
            <Link to='/products?categoryId=2' className='text-sm text-gray-400 hover:text-white transition'>Wallets</Link>
            <Link to='/products?categoryId=3' className='text-sm text-gray-400 hover:text-white transition'>Belts</Link>
            <Link to='/cart' className='text-sm text-gray-400 hover:text-white transition'>My Cart</Link>
          </div>
        </div>

        {/* account */}
        <div>
          <h3 className='text-xs font-semibold uppercase tracking-[4px] text-gray-400 mb-5'>Account</h3>
          <div className='flex flex-col gap-3'>
            <Link to='/profile' className='text-sm text-gray-400 hover:text-white transition'>My Profile</Link>
            <Link to='/profile' className='text-sm text-gray-400 hover:text-white transition'>My Orders</Link>
            {/* Removed Login and Create Account links */}
          </div>
        </div>

      </div>

      {/* policies strip */}
      <div className='border-t border-gray-800 py-4 px-4'>
        <div className='max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-2'>
          <p className='text-xs text-gray-600'>© 2025 Syed & Sons. All rights reserved.</p>
          <div className='flex gap-6'>
            <span className='text-xs text-gray-600'>Cash on Delivery Available</span>
            <span className='text-xs text-gray-600'>Secure Checkout</span>
            <span className='text-xs text-gray-600'>Easy Returns</span>
          </div>
        </div>
      </div>

    </footer>
  );
};

export default Footer;