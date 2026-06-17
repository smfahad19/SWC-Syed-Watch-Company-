import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { toast } from 'react-toastify';
import { fetchSuccess, setCategories } from '../../redux/slices/productSlice';
import { addToCart } from '../../redux/slices/cartSlice';
import api from '../../services/api';

const fallbackSlides = [
  {
    id: 'f1',
    title: 'Timeless Precision',
    subtitle: 'Men & Women Watches',
    desc: 'Six decades of watchmaking heritage. Every piece we carry has been chosen with the same eye for quality our founder had in 1955.',
    bgColor: '#18181b',
    image: null,
    link: '/products',
  },
  {
    id: 'f2',
    title: 'Genuine Leather',
    subtitle: 'Wallets & Belts',
    desc: 'Hand-stitched. Built to last. Our leather goods have been trusted by Pakistani families for three generations.',
    bgColor: '#1c1917',
    image: null,
    link: '/products',
  },
  {
    id: 'f3',
    title: 'Now Online',
    subtitle: 'Syed & Sons — Est. 1955',
    desc: 'What started as a small watch repair shop in the bazaar is now at your doorstep. Same quality, same trust — delivered nationwide.',
    bgColor: '#0f172a',
    image: null,
    link: '/products',
  },
];

const Home = () => {
  const dispatch = useDispatch();
  const { isLoggedIn } = useSelector((state) => state.auth);
  const { products, categories } = useSelector((state) => state.product);
  const [slides, setSlides] = useState([]);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [activeCategory, setActiveCategory] = useState('All');
  const intervalRef = useRef(null);

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    const activeSlides = slides.length > 0 ? slides : fallbackSlides;
    if (activeSlides.length === 0) return;
    intervalRef.current = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % activeSlides.length);
    }, 5000);
    return () => clearInterval(intervalRef.current);
  }, [slides]);

  const fetchData = async () => {
    try {
      const [productsRes, categoriesRes, slidesRes] = await Promise.all([
        api.get('/buyer/products'),
        api.get('/buyer/categories'),
        api.get('/buyer/carousel'),
      ]);
      dispatch(fetchSuccess(productsRes.data.data));
      dispatch(setCategories(categoriesRes.data.data));
      if (slidesRes.data.data && slidesRes.data.data.length > 0) {
        setSlides(slidesRes.data.data);
      }
    } catch {
      toast.error('Failed to load data');
    }
  };

  const activeSlides = slides.length > 0 ? slides : fallbackSlides;

  const goToSlide = (index) => {
    setCurrentSlide(index);
    clearInterval(intervalRef.current);
    intervalRef.current = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % activeSlides.length);
    }, 5000);
  };

  const handleAddToCart = async (product) => {
    if (!isLoggedIn) {
      toast.error('Please login to add items to cart');
      return;
    }
    try {
      await api.post('/buyer/cart', { productId: product.id, quantity: 1 });
      dispatch(addToCart(product));
      toast.success(`${product.name} added to cart`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not add to cart');
    }
  };

  const filtered =
    activeCategory === 'All'
      ? products
      : products.filter((p) => p.category?.name === activeCategory);

  return (
    <div className="bg-white min-h-screen">

      {/* Carousel */}
      <div className="relative overflow-hidden h-[90vh]">
        {activeSlides.map((slide, index) => (
          <div
            key={slide.id}
            className="absolute inset-0 flex flex-col items-center justify-center text-white text-center px-6 transition-opacity duration-1000"
            style={{
              backgroundColor: slide.bgColor || '#18181b',
              backgroundImage: slide.image ? `url(${slide.image})` : undefined,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              opacity: index === currentSlide ? 1 : 0,
              zIndex: index === currentSlide ? 10 : 0,
            }}
          >
            {slide.image && <div className="absolute inset-0 bg-black/60" />}

            {/* subtle grain overlay */}
            <div
              className="absolute inset-0 opacity-[0.03]"
              style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='1'/%3E%3C/svg%3E")`,
              }}
            />

            {/* Glass overlay on text for readability (optional) */}
            <div className="relative z-10 max-w-3xl px-4 py-8 rounded-2xl bg-black/20 backdrop-blur-sm border border-white/10">
              <p className="text-xs tracking-[8px] uppercase text-gray-400 mb-6">
                Syed &amp; Sons &nbsp;·&nbsp; Est. 1955
              </p>
              <h1 className="text-5xl md:text-7xl font-bold tracking-widest uppercase mb-5 leading-tight">
                {slide.title}
              </h1>
              {slide.subtitle && (
                <p className="text-gray-300 text-sm md:text-base tracking-[4px] uppercase mb-5">
                  {slide.subtitle}
                </p>
              )}
              {slide.desc && (
                <p className="text-gray-400 text-sm max-w-xl mx-auto mb-10 leading-relaxed">
                  {slide.desc}
                </p>
              )}
              <div className="flex gap-4 justify-center flex-wrap">
                <Link
                  to={slide.link || '/products'}
                  className="border border-white text-white px-10 py-3 text-xs tracking-widest uppercase hover:bg-white hover:text-black transition duration-300"
                >
                  Shop Now
                </Link>
                {!isLoggedIn && (
                  <Link
                    to="/signup"
                    className="bg-white text-black px-10 py-3 text-xs tracking-widest uppercase hover:bg-gray-100 transition duration-300"
                  >
                    Create Account
                  </Link>
                )}
              </div>
            </div>
          </div>
        ))}

        {/* Dots */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-2 z-20">
          {activeSlides.map((_, i) => (
            <button
              key={i}
              onClick={() => goToSlide(i)}
              className={`h[3px] rounded-full transition-all duration-300 ${
                i === currentSlide ? 'bg-white w-8' : 'bg-white/30 w-4'
              }`}
            />
          ))}
        </div>

        {/* Arrows */}
        <button
          onClick={() => goToSlide((currentSlide - 1 + activeSlides.length) % activeSlides.length)}
          className="absolute left-5 top-1/2 -translate-y-1/2 z-20 text-white/50 hover:text-white text-3xl transition px-2 py-3"
        >
          ‹
        </button>
        <button
          onClick={() => goToSlide((currentSlide + 1) % activeSlides.length)}
          className="absolute right-5 top-1/2 -translate-y-1/2 z-20 text-white/50 hover:text-white text-3xl transition px-2 py-3"
        >
          ›
        </button>
      </div>

      {/* Marquee strip */}
      <div className="bg-black text-white py-4 overflow-hidden">
        <div className="flex whitespace-nowrap animate-marquee gap-16 text-xs tracking-[6px] uppercase text-gray-400">
          {[...Array(4)].map((_, i) => (
            <span key={i} className="flex gap-16 shrink-0">
              <span>Syed &amp; Sons</span>
              <span>·</span>
              <span>Est. 1955</span>
              <span>·</span>
              <span>Watches</span>
              <span>·</span>
              <span>Wallets</span>
              <span>·</span>
              <span>Belts</span>
              <span>·</span>
              <span>Now Delivering Nationwide</span>
              <span>·</span>
            </span>
          ))}
        </div>
      </div>

      {/* Our Story */}
      <div className="max-w-6xl mx-auto px-4 py-20 grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
        <div>
          <p className="text-xs tracking-[6px] uppercase text-gray-400 mb-4">Our Story</p>
          <h2 className="text-3xl font-bold tracking-widest uppercase mb-6 leading-snug">
            From a Small Bazaar Shop to Your Doorstep
          </h2>
          <p className="text-gray-500 text-sm leading-relaxed mb-4">
            In 1955, our grandfather opened a humble watch repair shop in the heart of the bazaar. With steady hands and an eye for precision, he built a reputation that spread by word of mouth alone.
          </p>
          <p className="text-gray-500 text-sm leading-relaxed mb-4">
            Decades passed, the shop grew, and two more generations joined the craft. Today, Syed &amp; Sons carries the same values — genuine quality, honest pricing, and lasting relationships — into the digital age.
          </p>
          <p className="text-gray-500 text-sm leading-relaxed mb-8">
            We are now online, but nothing else has changed. Every watch, wallet, and belt you order has been selected with the same care our founder gave to every customer who walked through his door.
          </p>
          <Link
            to="/products"
            className="border border-black text-black px-8 py-3 text-xs tracking-widest uppercase hover:bg-black hover:text-white transition inline-block"
          >
            Explore Collection
          </Link>
        </div>

        {/* Stats with glass effect */}
        <div className="grid grid-cols-2 gap-4">
          {[
            { value: '70+', label: 'Years of Heritage' },
            { value: '3', label: 'Generations' },
            { value: '1000+', label: 'Happy Customers' },
            { value: '1955', label: 'Established' },
          ].map((stat) => (
            <div
              key={stat.label}
              className="border border-gray-100 p-8 text-center hover:border-black transition bg-white/40 backdrop-blur-sm shadow-sm hover:shadow-md"
            >
              <p className="text-3xl font-bold mb-2">{stat.value}</p>
              <p className="text-xs text-gray-400 tracking-widest uppercase">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Categories with glass effect */}
      <div className="bg-gray-50/80 backdrop-blur-sm py-16 px-4">
        <div className="max-w-6xl mx-auto">
          <p className="text-xs tracking-[6px] uppercase text-gray-400 text-center mb-3">Browse By</p>
          <h2 className="text-2xl font-bold text-center tracking-widest uppercase mb-10">Categories</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {categories.map((cat) => (
              <div
                key={cat.id}
                onClick={() => setActiveCategory(cat.name)}
                className={`cursor-pointer p-10 text-center border transition duration-300 ${
                  activeCategory === cat.name
                    ? 'border-black bg-black text-white'
                    : 'border-gray-200 bg-white/60 backdrop-blur-sm hover:border-black hover:bg-white/80'
                }`}
              >
                {cat.image && (
                  <img src={cat.image} alt={cat.name} className="w-10 h-10 object-cover mx-auto mb-4 opacity-70" />
                )}
                <h3 className="text-base font-bold tracking-widest uppercase mb-2">{cat.name}</h3>
                {cat.description && (
                  <p className={`text-xs leading-relaxed ${activeCategory === cat.name ? 'text-gray-400' : 'text-gray-500'}`}>
                    {cat.description}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Products */}
      <div className="max-w-6xl mx-auto px-4 py-16">
        <p className="text-xs tracking-[6px] uppercase text-gray-400 text-center mb-3">Our Collection</p>
        <h2 className="text-2xl font-bold text-center tracking-widest uppercase mb-4">Featured Products</h2>
        <p className="text-center text-gray-400 text-sm mb-10 max-w-lg mx-auto">
          Handpicked pieces from our store — the same quality our customers have trusted since 1955.
        </p>

        {/* Filter tabs */}
        <div className="flex justify-center gap-2 mb-10 flex-wrap">
          <button
            onClick={() => setActiveCategory('All')}
            className={`text-xs px-5 py-2 tracking-widest uppercase border transition ${
              activeCategory === 'All' ? 'bg-black text-white border-black' : 'border-gray-300 text-gray-500 hover:border-black'
            }`}
          >
            All
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.name)}
              className={`text-xs px-5 py-2 tracking-widest uppercase border transition ${
                activeCategory === cat.name ? 'bg-black text-white border-black' : 'border-gray-300 text-gray-500 hover:border-black'
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>

        {filtered.length === 0 ? (
          <p className="text-center text-gray-400 text-sm py-16">No products found</p>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {filtered.map((product) => (
              <div key={product.id} className="group bg-white/40 backdrop-blur-sm border border-gray-100 rounded-lg p-4 hover:border-black hover:shadow-md transition-all duration-300">
                <Link to={`/products/${product.id}`}>
                  <div className="bg-gray-50 aspect-square mb-3 flex items-center justify-center overflow-hidden rounded-md">
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

                <p className="text-xs text-gray-400 tracking-widest uppercase mb-1">{product.category?.name}</p>

                <Link to={`/products/${product.id}`}>
                  <h3 className="text-sm font-semibold text-black mb-2 group-hover:underline underline-offset-2">
                    {product.name}
                  </h3>
                </Link>

                <div className="flex items-center gap-2 mb-3">
                  {product.discountPrice ? (
                    <>
                      <span className="text-sm font-bold">Rs. {product.discountPrice.toLocaleString()}</span>
                      <span className="text-xs text-gray-400 line-through">Rs. {product.price.toLocaleString()}</span>
                    </>
                  ) : (
                    <span className="text-sm font-bold">Rs. {product.price.toLocaleString()}</span>
                  )}
                </div>

                <button
                  onClick={() => handleAddToCart(product)}
                  disabled={product.stock === 0}
                  className="w-full border border-black text-black text-xs py-2.5 tracking-widest uppercase hover:bg-black hover:text-white transition duration-300 disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  {product.stock === 0 ? 'Out of Stock' : isLoggedIn ? 'Add to Cart' : 'Login to Buy'}
                </button>
              </div>
            ))}
          </div>
        )}

        <div className="text-center mt-12">
          <Link
            to="/products"
            className="border border-black text-black px-10 py-3 text-xs tracking-widest uppercase hover:bg-black hover:text-white transition inline-block"
          >
            View All Products
          </Link>
        </div>
      </div>

      {/* Why Us with glass effect */}
      <div className="bg-gray-50/80 backdrop-blur-sm py-16 px-4">
        <div className="max-w-6xl mx-auto">
          <p className="text-xs tracking-[6px] uppercase text-gray-400 text-center mb-3">Why Syed &amp; Sons</p>
          <h2 className="text-2xl font-bold text-center tracking-widest uppercase mb-12">The Difference You Can Feel</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                title: 'Authenticity Guaranteed',
                desc: 'Every product we sell is genuine. No replicas, no shortcuts. Our reputation has been built on this promise since 1955.',
              },
              {
                title: 'Cash on Delivery',
                desc: 'Order with confidence. Pay when your package arrives at your door — no upfront risk, no hidden charges.',
              },
              {
                title: 'Nationwide Delivery',
                desc: 'From Karachi to Gilgit, we deliver across Pakistan. What once required a trip to the bazaar now comes to you.',
              },
            ].map((item) => (
              <div key={item.title} className="text-center px-6 py-8 bg-white/40 backdrop-blur-sm border border-gray-100 rounded-lg hover:border-black transition-all duration-300 hover:shadow-md">
                <h3 className="text-sm font-bold tracking-widest uppercase mb-3">{item.title}</h3>
                <p className="text-gray-500 text-xs leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom CTA */}
      <div className="bg-black text-white py-20 px-4 text-center">
        <p className="text-xs tracking-[8px] uppercase text-gray-500 mb-4">Join the Family</p>
        <h2 className="text-3xl md:text-4xl font-bold tracking-widest uppercase mb-5">
          70 Years of Trust, Now at Your Door
        </h2>
        <p className="text-gray-400 text-sm max-w-xl mx-auto mb-10 leading-relaxed">
          Create an account and be part of a legacy that has stood the test of time. Exclusive deals, order tracking, and a shopping experience built on trust.
        </p>
        <div className="flex gap-4 justify-center flex-wrap">
          <Link
            to="/products"
            className="border border-white text-white px-10 py-3 text-xs tracking-widest uppercase hover:bg-white hover:text-black transition"
          >
            Shop Now
          </Link>
          {!isLoggedIn && (
            <Link
              to="/signup"
              className="bg-white text-black px-10 py-3 text-xs tracking-widest uppercase hover:bg-gray-200 transition"
            >
              Create Account
            </Link>
          )}
        </div>
      </div>

    </div>
  );
};

export default Home;