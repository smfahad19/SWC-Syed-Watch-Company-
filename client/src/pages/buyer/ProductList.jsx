// ProductList.jsx
import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import { Link } from 'react-router-dom';
import { fetchStart, fetchSuccess, fetchFail, setCategories } from '../../redux/slices/productSlice';
import { addToCart } from '../../redux/slices/cartSlice';
import api from '../../services/api';
import Loader from '../../components/Loader';
import { FiFilter, FiShoppingCart } from 'react-icons/fi';

const ProductList = () => {
  const dispatch = useDispatch();
  const { products, categories, loading } = useSelector((state) => state.product);
  const { isLoggedIn } = useSelector((state) => state.auth);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [sort, setSort] = useState('');

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [selectedCategory, sort]);

  const fetchCategories = async () => {
    try {
      const res = await api.get('/buyer/categories');
      dispatch(setCategories(res.data.data));
    } catch {
      toast.error('Categories load nahi huin');
    }
  };

  const fetchProducts = async () => {
    dispatch(fetchStart());
    try {
      const params = new URLSearchParams();
      if (selectedCategory) params.append('categoryId', selectedCategory);
      if (sort) params.append('sort', sort);
      const res = await api.get(`/buyer/products?${params.toString()}`);
      dispatch(fetchSuccess(res.data.data));
    } catch {
      dispatch(fetchFail('Products load nahi hue'));
      toast.error('Products load nahi hue');
    }
  };

  const handleAddToCart = async (product) => {
    if (!isLoggedIn) {
      toast.error('Pehle login karo');
      return;
    }
    try {
      await api.post('/buyer/cart', { productId: product.id, quantity: 1 });
      dispatch(addToCart(product));
      toast.success('Cart mein add ho gaya');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Cart mein add nahi hua');
    }
  };

  if (loading) return <Loader />;

  return (
    <div className="bg-white min-h-screen py-10 px-4">
      <div className="max-w-6xl mx-auto">

        {/* Header */}
        <div className="flex items-center gap-3 mb-8">
          <div className="p-2.5 rounded-full bg-gray-100 border border-gray-200">
            <FiFilter className="text-gray-700 text-xl" />
          </div>
          <h1 className="text-2xl font-bold tracking-widest text-black">All Products</h1>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-3 mb-8">
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="border border-gray-300 rounded-lg px-4 py-2.5 text-sm text-gray-700 outline-none focus:border-black bg-white"
          >
            <option value="">All Categories</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>{cat.name}</option>
            ))}
          </select>

          <select
            value={sort}
            onChange={(e) => setSort(e.target.value)}
            className="border border-gray-300 rounded-lg px-4 py-2.5 text-sm text-gray-700 outline-none focus:border-black bg-white"
          >
            <option value="">Latest First</option>
            <option value="price_asc">Price: Low to High</option>
            <option value="price_desc">Price: High to Low</option>
          </select>
        </div>

        {/* Products Grid */}
        {products.length === 0 ? (
          <div className="text-center py-16 text-gray-400 text-sm">No products found</div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
            {products.map((product) => (
              <div key={product.id} className="group bg-white border border-gray-100 rounded-xl p-3 sm:p-4 shadow-sm hover:shadow-md transition-shadow duration-300">
                <Link to={`/products/${product.id}`}>
                  <div className="bg-gray-50 aspect-square rounded-lg overflow-hidden mb-3 flex items-center justify-center">
                    {product.images?.[0] ? (
                      <img
                        src={product.images[0]}
                        alt={product.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                      />
                    ) : (
                      <span className="text-gray-300 text-xs tracking-widest uppercase">{product.category?.name}</span>
                    )}
                  </div>
                </Link>

                <p className="text-[10px] text-gray-400 tracking-widest uppercase mb-1">{product.category?.name}</p>

                <Link to={`/products/${product.id}`}>
                  <h3 className="text-sm font-semibold text-black mb-2 hover:text-blue-600 transition truncate">{product.name}</h3>
                </Link>

                <div className="flex items-center gap-2 mb-3">
                  {product.discountPrice ? (
                    <>
                      <span className="text-sm font-bold text-black">Rs. {product.discountPrice.toLocaleString()}</span>
                      <span className="text-xs text-gray-400 line-through">Rs. {product.price.toLocaleString()}</span>
                    </>
                  ) : (
                    <span className="text-sm font-bold text-black">Rs. {product.price.toLocaleString()}</span>
                  )}
                </div>

                <button
                  onClick={() => handleAddToCart(product)}
                  disabled={product.stock === 0}
                  className="w-full flex items-center justify-center gap-2 border border-black text-black text-xs py-2.5 rounded-lg tracking-widest uppercase hover:bg-black hover:text-white transition duration-300 disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  <FiShoppingCart className="text-sm" />
                  {product.stock === 0 ? 'Out of Stock' : isLoggedIn ? 'Add to Cart' : 'Login to Buy'}
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductList;