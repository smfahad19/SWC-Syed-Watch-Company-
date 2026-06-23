import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="bg-[#0a0a0a] text-white">

      {/* main */}
      <div className="max-w-6xl mx-auto px-6 py-16 grid grid-cols-1 md:grid-cols-3 gap-12">

        {/* brand */}
        <div className="md:col-span-1">
          <div className="mb-6">
            <h2 className="text-2xl font-black tracking-[8px] uppercase text-white mb-1">S&S</h2>
            <p className="text-[10px] tracking-[3px] uppercase text-gray-600">Syed & Sons — Est. 1975</p>
          </div>
          <p className="text-sm text-gray-500 leading-relaxed max-w-xs">
            Three generations of craftsmanship. Genuine quality, honest pricing — since 1975.
          </p>
          <div className="mt-6 flex flex-col gap-1.5">
            <p className="text-xs text-gray-700">Watches · Wallets · Belts</p>
            <p className="text-xs text-gray-700">Lahore, Pakistan</p>
          </div>
        </div>

        {/* shop */}
        <div>
          <p className="text-[10px] tracking-[3px] uppercase text-gray-600 mb-6">Shop</p>
          <div className="flex flex-col gap-3.5">
            <Link to="/products" className="text-sm text-gray-500 hover:text-white transition-colors duration-200">All Products</Link>
            <Link to="/products?categoryId=1" className="text-sm text-gray-500 hover:text-white transition-colors duration-200">Watches</Link>
            <Link to="/products?categoryId=2" className="text-sm text-gray-500 hover:text-white transition-colors duration-200">Wallets</Link>
            <Link to="/products?categoryId=3" className="text-sm text-gray-500 hover:text-white transition-colors duration-200">Belts</Link>
            <Link to="/cart" className="text-sm text-gray-500 hover:text-white transition-colors duration-200">My Cart</Link>
          </div>
        </div>

        {/* account */}
        <div>
          <p className="text-[10px] tracking-[3px] uppercase text-gray-600 mb-6">Account</p>
          <div className="flex flex-col gap-3.5">
            <Link to="/profile" className="text-sm text-gray-500 hover:text-white transition-colors duration-200">My Profile</Link>
            <Link to="/profile" className="text-sm text-gray-500 hover:text-white transition-colors duration-200">My Orders</Link>
          </div>

          <div className="mt-10">
            <p className="text-[10px] tracking-[3px] uppercase text-gray-600 mb-4">We Offer</p>
            <div className="flex flex-col gap-2">
              <p className="text-xs text-gray-600">— Cash on Delivery</p>
              <p className="text-xs text-gray-600">— Nationwide Shipping</p>
              <p className="text-xs text-gray-600">— Easy Returns</p>
            </div>
          </div>
        </div>

      </div>

      {/* bottom bar */}
      <div className="border-t border-white/5">
        <div className="max-w-6xl mx-auto px-6 py-5 flex flex-col md:flex-row justify-between items-center gap-2">
          <p className="text-xs text-gray-700">© 2025 Syed & Sons. All rights reserved.</p>
          <p className="text-xs text-gray-700 tracking-[2px] uppercase">Lahore, Pakistan</p>
        </div>
      </div>

    </footer>
  );
};

export default Footer;