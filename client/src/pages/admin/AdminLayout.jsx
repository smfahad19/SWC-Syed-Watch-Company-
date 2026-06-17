// AdminLayout.jsx
import { Link, Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { toast } from 'react-toastify';
import { logout } from '../../redux/slices/authSlice';
import { clearCart } from '../../redux/slices/cartSlice';
import api from '../../services/api';
import {
    FiLayout,
    FiPackage,
    FiGrid,
    FiShoppingBag,
    FiImage,
    FiUsers,
    FiBarChart2,
    FiLogOut,
    FiBell,
    FiHome,
    FiMenu,
    FiX,
    FiStar,   // added
} from 'react-icons/fi';

const navLinks = [
    { path: '/admin/dashboard', label: 'Dashboard', icon: FiHome },
    { path: '/admin/products', label: 'Products', icon: FiPackage },
    { path: '/admin/categories', label: 'Categories', icon: FiGrid },
    { path: '/admin/orders', label: 'Orders', icon: FiShoppingBag },
    { path: '/admin/carousel', label: 'Carousel', icon: FiImage },
    { path: '/admin/reviews', label: 'Reviews', icon: FiStar },   // added
    { path: '/admin/users', label: 'Users', icon: FiUsers },
    { path: '/admin/analytics', label: 'Analytics', icon: FiBarChart2 },
];

const AdminLayout = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const location = useLocation();
    const [notifications, setNotifications] = useState([]);
    const [unread, setUnread] = useState(0);
    const [showNotif, setShowNotif] = useState(false);
    const [sidebarOpen, setSidebarOpen] = useState(false);

    useEffect(() => {
        const base = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1';
        const es = new EventSource(`${base}/admin/notifications/stream`, { withCredentials: true });

        es.addEventListener('new-order', (e) => {
            const order = JSON.parse(e.data);
            setNotifications((prev) => [order, ...prev].slice(0, 20));
            setUnread((prev) => prev + 1);
            toast.info(`New order #${order.id} — Rs. ${order.totalPrice?.toLocaleString()}`);
        });

        es.onerror = () => es.close();
        return () => es.close();
    }, []);

    const handleLogout = async () => {
        try {
            await api.post('/auth/logout');
            dispatch(logout());
            dispatch(clearCart());
            navigate('/');
        } catch {
            toast.error('Logout failed');
        }
    };

    const currentLabel = navLinks.find((l) => l.path === location.pathname)?.label || 'Admin';

    useEffect(() => {
        setSidebarOpen(false);
    }, [location.pathname]);

    return (
        <div className="min-h-screen bg-[#080d1a] flex font-sans antialiased">
            {sidebarOpen && (
                <div
                    className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            <aside
                className={`
                    fixed lg:sticky top-0 left-0 z-50
                    w-72 lg:w-64
                    h-full
                    bg-[#0e1629]/90 lg:bg-[#0e1629]/80
                    backdrop-blur-xl
                    border-r border-white/5
                    flex flex-col
                    shadow-2xl shadow-black/30
                    rounded-r-3xl lg:rounded-r-3xl
                    transition-transform duration-300 ease-in-out
                    ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
                `}
            >
                <button
                    onClick={() => setSidebarOpen(false)}
                    className="lg:hidden absolute top-4 right-4 text-white/40 hover:text-white p-2 rounded-xl hover:bg-white/5 transition"
                >
                    <FiX className="text-2xl" />
                </button>

                <div className="px-6 py-7 border-b border-white/5">
                    <p className="text-[10px] tracking-[0.3em] uppercase text-blue-400/60 mb-1 font-medium">
                        Admin Panel
                    </p>
                    <h1 className="text-2xl font-bold tracking-widest text-white">
                        S<span className="text-blue-500">&</span>S
                    </h1>
                    <p className="text-[11px] text-white/30 mt-1 tracking-wider">Syed & Sons</p>
                </div>

                <nav className="flex-1 px-4 py-6 flex flex-col gap-1.5 overflow-y-auto">
                    {navLinks.map((link) => {
                        const Icon = link.icon;
                        const active = location.pathname === link.path;
                        return (
                            <Link
                                key={link.path}
                                to={link.path}
                                className={`
                                    flex items-center gap-3 px-4 py-3 rounded-2xl text-sm transition-all duration-200
                                    ${active
                                        ? 'bg-blue-600/20 text-white shadow-[0_0_20px_rgba(59,130,246,0.15)] border border-blue-500/20'
                                        : 'text-white/40 hover:text-white hover:bg-white/5 border border-transparent'
                                    }
                                `}
                            >
                                <Icon className={`text-lg ${active ? 'text-blue-400' : 'text-white/30'}`} />
                                <span className="font-medium tracking-wide">{link.label}</span>
                                {active && (
                                    <span className="ml-auto w-1.5 h-1.5 rounded-full bg-blue-500 shadow-[0_0_12px_rgba(59,130,246,0.6)]" />
                                )}
                            </Link>
                        );
                    })}
                </nav>

                <div className="px-4 py-5 border-t border-white/5">
                    <button
                        onClick={handleLogout}
                        className="flex items-center gap-3 w-full px-4 py-3 rounded-2xl text-sm text-white/30 hover:text-white hover:bg-white/5 transition-all duration-200"
                    >
                        <FiLogOut className="text-lg text-white/30" />
                        <span className="font-medium tracking-wide">Logout</span>
                    </button>
                </div>
            </aside>

            <main className="flex-1 min-h-screen w-full overflow-x-hidden">
                <div className="bg-[#0e1629]/60 backdrop-blur-xl border-b border-white/5 px-4 sm:px-6 lg:px-8 py-3 sm:py-4 flex justify-between items-center sticky top-0 z-30 shadow-xl shadow-black/20">
                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => setSidebarOpen(true)}
                            className="lg:hidden text-white/40 hover:text-white p-2 rounded-xl hover:bg-white/5 transition"
                        >
                            <FiMenu className="text-2xl" />
                        </button>
                        <p className="text-[10px] sm:text-xs tracking-[0.2em] uppercase text-white/40 font-medium truncate max-w-[120px] sm:max-w-none">
                            {currentLabel}
                        </p>
                    </div>

                    <div className="relative">
                        <button
                            onClick={() => { setShowNotif(!showNotif);
                                setUnread(0); }}
                            className="relative flex items-center gap-1.5 sm:gap-2 text-white/40 hover:text-white border border-white/10 hover:border-white/20 px-3 sm:px-4 py-2 rounded-2xl transition-all duration-200 backdrop-blur-sm bg-white/5"
                        >
                            <FiBell className="text-lg" />
                            <span className="text-[10px] sm:text-xs tracking-wider hidden sm:inline">Notifications</span>
                            {unread > 0 && (
                                <span className="absolute -top-1 -right-1 bg-blue-600 text-white text-[10px] w-5 h-5 rounded-full flex items-center justify-center font-bold shadow-[0_0_16px_rgba(59,130,246,0.5)]">
                                    {unread}
                                </span>
                            )}
                        </button>

                        {showNotif && (
                            <div className="absolute right-0 top-12 sm:top-14 w-[280px] sm:w-80 max-h-[70vh] bg-[#0e1629]/95 backdrop-blur-2xl border border-white/10 rounded-3xl shadow-2xl shadow-black/50 z-50 overflow-y-auto">
                                <div className="px-4 sm:px-5 py-3 sm:py-4 border-b border-white/5 sticky top-0 bg-[#0e1629]/90 backdrop-blur-sm">
                                    <p className="text-[10px] font-semibold tracking-[0.25em] uppercase text-blue-400/60">
                                        Live Notifications
                                    </p>
                                </div>
                                {notifications.length === 0 ? (
                                    <p className="text-sm text-white/30 p-5 text-center">No new orders yet</p>
                                ) : (
                                    notifications.map((n, i) => (
                                        <div key={i} className="px-4 sm:px-5 py-3 sm:py-3.5 border-b border-white/5 hover:bg-white/5 transition">
                                            <p className="text-sm font-semibold text-white">Order #{n.id}</p>
                                            <p className="text-xs text-white/50 truncate">{n.fullName} — Rs. {n.totalPrice?.toLocaleString()}</p>
                                            <p className="text-[10px] text-white/30 mt-1">
                                                {new Date(n.createdAt).toLocaleTimeString('en-PK')}
                                            </p>
                                        </div>
                                    ))
                                )}
                            </div>
                        )}
                    </div>
                </div>

                <div className="p-3 sm:p-4 md:p-6 lg:p-8">
                    <Outlet />
                </div>
            </main>
        </div>
    );
};

export default AdminLayout;