// Dashboard.jsx
import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import api from '../../services/api';
import {
    FiHome,
    FiUsers,
    FiPackage,
    FiShoppingCart,
    FiDollarSign,
    FiClock,
    FiTruck,
    FiXCircle,
    FiCheckCircle,
    FiActivity,
} from 'react-icons/fi';

const StatCard = ({ label, value, icon: Icon, color = 'text-blue-400' }) => (
    <div className="bg-[#0e1629]/60 backdrop-blur-xl border border-white/5 rounded-2xl sm:rounded-3xl p-4 sm:p-6 shadow-xl shadow-black/20 hover:border-blue-500/20 transition-all duration-300 group">
        <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
                <p className="text-[8px] sm:text-[10px] tracking-[0.2em] uppercase text-white/30 font-medium truncate">{label}</p>
                <p className="text-base sm:text-2xl font-bold text-white mt-1 group-hover:text-blue-400 transition-colors truncate">{value}</p>
            </div>
            <div className={`p-1.5 sm:p-2.5 rounded-2xl bg-white/5 border border-white/5 flex-shrink-0 ${color}`}>
                <Icon className="text-base sm:text-xl" />
            </div>
        </div>
    </div>
);

const Dashboard = () => {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchStats();
        const interval = setInterval(fetchStats, 30000);
        return () => clearInterval(interval);
    }, []);

    const fetchStats = async () => {
        try {
            const res = await api.get('/admin/dashboard');
            setStats(res.data.data);
        } catch {
            toast.error('Failed to load dashboard');
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <div className="text-white/40 text-sm animate-pulse">Loading dashboard…</div>;
    if (!stats) return null;

    const statConfigs = [
        { label: 'Total Users', value: stats.totalUsers, icon: FiUsers, color: 'text-blue-400' },
        { label: 'Total Products', value: stats.totalProducts, icon: FiPackage, color: 'text-emerald-400' },
        { label: 'Total Orders', value: stats.totalOrders, icon: FiShoppingCart, color: 'text-violet-400' },
        { label: 'Revenue', value: `Rs. ${stats.totalRevenue?.toLocaleString()}`, icon: FiDollarSign, color: 'text-amber-400' },
        { label: 'Pending', value: stats.pendingOrders, icon: FiClock, color: 'text-yellow-400' },
        { label: 'In Progress', value: stats.inProgressOrders, icon: FiActivity, color: 'text-indigo-400' },
        { label: 'Delivered', value: stats.deliveredOrders, icon: FiCheckCircle, color: 'text-emerald-400' },
        { label: 'Cancelled', value: stats.cancelledOrders, icon: FiXCircle, color: 'text-red-400' },
        { label: 'Live Users', value: stats.activeUsers || 0, icon: FiActivity, color: 'text-cyan-400' },
    ];

    return (
        <div>

            {/* Header */}
            <div className="flex items-center gap-3 mb-6 sm:mb-8 flex-wrap">
                <div className="p-2.5 rounded-2xl bg-blue-600/20 border border-blue-500/20">
                    <FiHome className="text-blue-400 text-2xl" />
                </div>
                <h1 className="text-xl sm:text-2xl font-bold tracking-widest text-white">Dashboard</h1>
                <span className="ml-auto text-[10px] tracking-[0.2em] uppercase text-white/30 bg-white/5 px-3 sm:px-4 py-1.5 rounded-full border border-white/5">
                    Live
                </span>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-2 sm:gap-3 md:gap-4 mb-6 sm:mb-10">
                {statConfigs.map((s, i) => (
                    <StatCard key={i} {...s} />
                ))}
            </div>

            {/* Bottom Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">

                {/* Recent Orders */}
                <div className="bg-[#0e1629]/60 backdrop-blur-xl border border-white/5 rounded-2xl sm:rounded-3xl p-4 sm:p-6 shadow-xl shadow-black/20 hover:border-blue-500/20 transition-all duration-300">
                    <div className="flex items-center gap-2.5 mb-4 sm:mb-5">
                        <FiShoppingCart className="text-violet-400 text-lg" />
                        <h2 className="text-xs sm:text-sm font-semibold tracking-widest text-white/80">Recent Orders</h2>
                        <span className="ml-auto text-[8px] sm:text-[10px] text-white/20">{stats.recentOrders?.length || 0} orders</span>
                    </div>
                    <div className="flex flex-col gap-2 sm:gap-3">
                        {stats.recentOrders?.slice(0, 5).map((order) => (
                            <div key={order.id} className="flex flex-col sm:flex-row sm:justify-between sm:items-center py-2 sm:py-2.5 border-b border-white/5 last:border-0 gap-1 sm:gap-0">
                                <div className="min-w-0">
                                    <p className="text-xs sm:text-sm font-medium text-white/80 truncate">{order.user?.name || 'Guest'}</p>
                                    <p className="text-[10px] sm:text-xs text-white/30 truncate">{order.user?.email || '—'}</p>
                                </div>
                                <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
                                    <p className="text-xs sm:text-sm font-bold text-white/90">Rs. {order.totalPrice?.toLocaleString()}</p>
                                    <span className={`text-[8px] sm:text-[10px] px-2 py-0.5 rounded-full ${order.status === 'DELIVERED' ? 'bg-emerald-500/20 text-emerald-400' :
                                            order.status === 'CANCELLED' ? 'bg-red-500/20 text-red-400' :
                                            'bg-blue-500/20 text-blue-400'
                                        }`}>
                                        {order.status}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Low Stock Products */}
                <div className="bg-[#0e1629]/60 backdrop-blur-xl border border-white/5 rounded-2xl sm:rounded-3xl p-4 sm:p-6 shadow-xl shadow-black/20 hover:border-blue-500/20 transition-all duration-300">
                    <div className="flex items-center gap-2.5 mb-4 sm:mb-5">
                        <FiPackage className="text-amber-400 text-lg" />
                        <h2 className="text-xs sm:text-sm font-semibold tracking-widest text-white/80">Low Stock Products</h2>
                        <span className="ml-auto text-[8px] sm:text-[10px] text-white/20">⚠️ needs attention</span>
                    </div>
                    <div className="flex flex-col gap-2 sm:gap-3">
                        {stats.lowStockProducts?.length > 0 ? (
                            stats.lowStockProducts.slice(0, 5).map((product) => (
                                <div key={product.id} className="flex justify-between items-center py-2 sm:py-2.5 border-b border-white/5 last:border-0">
                                    <p className="text-xs sm:text-sm text-white/70 truncate">{product.name}</p>
                                    <span className={`text-[8px] sm:text-xs font-bold px-2 sm:px-3 py-0.5 sm:py-1 rounded-full ${product.stock === 0
                                            ? 'bg-red-500/20 text-red-400 border border-red-500/20'
                                            : 'bg-amber-500/20 text-amber-400 border border-amber-500/20'
                                        }`}>
                                        {product.stock} left
                                    </span>
                                </div>
                            ))
                        ) : (
                            <p className="text-xs sm:text-sm text-white/30 text-center py-4">All products have healthy stock levels.</p>
                        )}
                    </div>
                </div>

            </div>
        </div>
    );
};

export default Dashboard;