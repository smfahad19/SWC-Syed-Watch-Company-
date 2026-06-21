import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import api from '../../services/api';
import {
    FiTrendingUp, FiTruck, FiPieChart, FiPackage,
    FiDollarSign, FiShoppingCart, FiUsers, FiClock, FiBarChart2,
} from 'react-icons/fi';

const Analytics = () => {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => { fetchAnalytics(); }, []);

    const fetchAnalytics = async () => {
        try {
            const res = await api.get('/admin/analytics');
            setData(res.data.data);
        } catch {
            toast.error('Failed to load analytics');
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <div className="text-white/40 text-sm animate-pulse">Loading analytics…</div>;
    if (!data) return <div className="text-white/40 text-sm">No data available.</div>;

    const stats = [
        { label: 'Total Revenue', value: `Rs. ${(data.totalRevenue || 0).toLocaleString()}`, icon: FiDollarSign, color: 'text-blue-400' },
        { label: 'Delivered Orders', value: data.totalDeliveredOrders || 0, icon: FiTruck, color: 'text-emerald-400' },
        { label: 'Total Orders', value: data.totalOrders || 0, icon: FiShoppingCart, color: 'text-violet-400' },
        { label: 'Total Users', value: data.totalUsers || 0, icon: FiUsers, color: 'text-amber-400' },
    ];

    return (
        <div>
            <div className="flex items-center gap-3 mb-6 sm:mb-8 flex-wrap">
                <div className="p-2.5 rounded-2xl bg-blue-600/20 border border-blue-500/20">
                    <FiBarChart2 className="text-blue-400 text-2xl" />
                </div>
                <h1 className="text-xl sm:text-2xl font-bold tracking-widest text-white">Analytics</h1>
                <span className="ml-auto text-[10px] tracking-[0.2em] uppercase text-white/30 bg-white/5 px-3 sm:px-4 py-1.5 rounded-full border border-white/5">
                    Real-time
                </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6 sm:mb-8">
                {stats.map((s, i) => {
                    const Icon = s.icon;
                    return (
                        <div key={i} className="bg-[#0e1629]/60 backdrop-blur-xl border border-white/5 rounded-2xl sm:rounded-3xl p-4 sm:p-6 shadow-xl shadow-black/20 hover:border-blue-500/20 transition-all duration-300">
                            <div className="flex items-start justify-between gap-2">
                                <div className="min-w-0">
                                    <p className="text-[9px] sm:text-[10px] tracking-[0.2em] uppercase text-white/30 font-medium truncate">{s.label}</p>
                                    <p className="text-lg sm:text-2xl font-bold text-white mt-1 truncate">{s.value}</p>
                                </div>
                                <div className={`p-2 sm:p-2.5 rounded-2xl bg-white/5 border border-white/5 flex-shrink-0 ${s.color}`}>
                                    <Icon className="text-base sm:text-xl" />
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">

                <div className="bg-[#0e1629]/60 backdrop-blur-xl border border-white/5 rounded-2xl sm:rounded-3xl p-4 sm:p-6 shadow-xl shadow-black/20">
                    <div className="flex items-center gap-2.5 mb-4 sm:mb-5">
                        <FiPieChart className="text-blue-400 text-lg" />
                        <h2 className="text-xs sm:text-sm font-semibold tracking-widest text-white/80">Orders by Status</h2>
                    </div>
                    <div className="flex flex-col gap-2 sm:gap-2.5">
                        {data.ordersByStatus?.length > 0 ? data.ordersByStatus.map((s) => (
                            <div key={s.status} className="flex flex-col sm:flex-row sm:justify-between sm:items-center py-2 border-b border-white/5 gap-1 sm:gap-0">
                                <span className="text-[10px] sm:text-xs uppercase tracking-wider text-white/40">{s.status}</span>
                                <div className="flex items-center gap-2 sm:gap-3">
                                    <div className="w-20 sm:w-32 h-1.5 bg-white/5 rounded-full overflow-hidden">
                                        <div
                                            className="h-full bg-blue-500/60 rounded-full"
                                            style={{ width: `${Math.min((s._count.id / (data.totalOrders || 1)) * 100, 100)}%` }}
                                        />
                                    </div>
                                    <span className="text-xs sm:text-sm font-bold text-white/80">{s._count.id}</span>
                                </div>
                            </div>
                        )) : (
                            <p className="text-white/20 text-xs">No orders yet.</p>
                        )}
                    </div>
                </div>

                <div className="bg-[#0e1629]/60 backdrop-blur-xl border border-white/5 rounded-2xl sm:rounded-3xl p-4 sm:p-6 shadow-xl shadow-black/20">
                    <div className="flex items-center gap-2.5 mb-4 sm:mb-5">
                        <FiPackage className="text-emerald-400 text-lg" />
                        <h2 className="text-xs sm:text-sm font-semibold tracking-widest text-white/80">Top Products</h2>
                    </div>
                    <div className="flex flex-col gap-2 sm:gap-2.5">
                        {data.topProducts?.length > 0 ? data.topProducts.slice(0, 5).map((p, i) => (
                            <div key={p.productId} className="flex justify-between items-center py-2 border-b border-white/5">
                                <div className="flex items-center gap-2 sm:gap-3 min-w-0">
                                    <span className="text-[10px] sm:text-xs font-bold text-white/20 w-4 sm:w-5 flex-shrink-0">{i + 1}.</span>
                                    <span className="text-xs sm:text-sm text-white/70 truncate">{p.product?.name || 'Unknown'}</span>
                                </div>
                                <span className="text-xs sm:text-sm font-bold text-white/60 flex-shrink-0">Rs. {p._sum?.price?.toLocaleString()}</span>
                            </div>
                        )) : (
                            <p className="text-white/20 text-xs">No sales yet.</p>
                        )}
                    </div>
                </div>

                <div className="md:col-span-2 bg-[#0e1629]/60 backdrop-blur-xl border border-white/5 rounded-2xl sm:rounded-3xl p-4 sm:p-6 shadow-xl shadow-black/20">
                    <div className="flex items-center gap-2.5 mb-4 sm:mb-5">
                        <FiTrendingUp className="text-amber-400 text-lg" />
                        <h2 className="text-xs sm:text-sm font-semibold tracking-widest text-white/80">Revenue Trend (Last 7 Days)</h2>
                    </div>
                    <div className="flex items-end justify-between gap-1 h-20 sm:h-28 pt-2">
                        {[42, 68, 55, 89, 73, 94, 81].map((val, i) => (
                            <div key={i} className="flex-1 flex flex-col items-center gap-1 sm:gap-1.5">
                                <div
                                    className="w-full max-w-[30px] sm:max-w-[40px] rounded-lg sm:rounded-xl bg-blue-500/60 hover:bg-blue-400/80 transition-all duration-300"
                                    style={{ height: `${val}%` }}
                                />
                                <span className="text-[7px] sm:text-[9px] text-white/20 tracking-wider">Day {i + 1}</span>
                            </div>
                        ))}
                    </div>
                    <p className="text-[8px] sm:text-[10px] text-white/20 text-center mt-3 sm:mt-4 tracking-wider">Mock trend data</p>
                </div>
            </div>
        </div>
    );
};

export default Analytics;