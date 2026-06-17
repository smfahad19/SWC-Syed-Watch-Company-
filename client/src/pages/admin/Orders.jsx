import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import api from '../../services/api';
import { FiShoppingBag, FiEdit3, FiCheck, FiX, FiTruck, FiPackage, FiClock, FiImage, FiMapPin, FiPhone, FiMail, FiUser } from 'react-icons/fi';

const statusColors = {
    PENDING: 'bg-amber-500/20 text-amber-400 border border-amber-500/20',
    CONFIRMED: 'bg-blue-500/20 text-blue-400 border border-blue-500/20',
    SHIPPED: 'bg-violet-500/20 text-violet-400 border border-violet-500/20',
    DELIVERED: 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/20',
    CANCELLED: 'bg-red-500/20 text-red-400 border border-red-500/20',
};

const statusIcons = {
    PENDING: FiClock,
    CONFIRMED: FiCheck,
    SHIPPED: FiTruck,
    DELIVERED: FiPackage,
    CANCELLED: FiX,
};

const Orders = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [statusForm, setStatusForm] = useState({ status: '', trackingMessage: '' });

    useEffect(() => { fetchOrders(); }, []);

    const fetchOrders = async () => {
        try {
            const res = await api.get('/admin/orders');
            setOrders(res.data.data.orders);
        } catch {
            toast.error('Failed to load orders');
        } finally {
            setLoading(false);
        }
    };

    const handleStatusUpdate = async (id) => {
        try {
            await api.put(`/admin/orders/${id}/status`, statusForm);
            toast.success('Order status updated');
            setSelectedOrder(null);
            fetchOrders();
        } catch {
            toast.error('Failed to update status');
        }
    };

    if (loading) return <div className="text-white/40 text-sm animate-pulse">Loading orders…</div>;

    return (
        <div>

            {/* Header */}
            <div className="flex items-center gap-3 mb-6 sm:mb-8 flex-wrap">
                <div className="p-2.5 rounded-2xl bg-blue-600/20 border border-blue-500/20">
                    <FiShoppingBag className="text-blue-400 text-2xl" />
                </div>
                <h1 className="text-xl sm:text-2xl font-bold tracking-widest text-white">Orders</h1>
                <span className="ml-auto text-[10px] tracking-[0.2em] uppercase text-white/30 bg-white/5 px-3 sm:px-4 py-1.5 rounded-full border border-white/5">
                    {orders.length} total
                </span>
            </div>

            {/* Table */}
            <div className="bg-[#0e1629]/60 backdrop-blur-xl border border-white/5 rounded-2xl sm:rounded-3xl shadow-xl shadow-black/20 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm min-w-[700px]">
                        <thead className="border-b border-white/5">
                            <tr>
                                {['Order', 'Customer', 'Total', 'Status', 'Date', 'Actions'].map((h) => (
                                    <th key={h} className="text-left px-3 sm:px-5 py-3 sm:py-3.5 text-[9px] sm:text-[10px] tracking-[0.2em] uppercase text-white/30 font-medium">
                                        {h}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {orders.map((order) => {
                                const StatusIcon = statusIcons[order.status] || FiClock;
                                const isExpanded = selectedOrder?.id === order.id;

                                return (
                                    <>
                                        <tr key={order.id} className="border-b border-white/5 hover:bg-white/5 transition cursor-pointer"
                                            onClick={() => setSelectedOrder(isExpanded ? null : order)}>
                                            <td className="px-3 sm:px-5 py-3 sm:py-3.5 font-medium text-white/80 text-xs sm:text-sm">#{order.id}</td>
                                            <td className="px-3 sm:px-5 py-3 sm:py-3.5">
                                                <p className="font-medium text-white/80 text-xs sm:text-sm truncate max-w-[80px] sm:max-w-none">{order.user?.name || 'Guest'}</p>
                                                <p className="text-[10px] sm:text-xs text-white/30 truncate max-w-[100px] sm:max-w-none">{order.user?.email || '—'}</p>
                                            </td>
                                            <td className="px-3 sm:px-5 py-3 sm:py-3.5 font-bold text-white/90 text-xs sm:text-sm">Rs. {order.totalPrice?.toLocaleString()}</td>
                                            <td className="px-3 sm:px-5 py-3 sm:py-3.5">
                                                <span className={`text-[8px] sm:text-[10px] font-semibold px-2 sm:px-3 py-0.5 sm:py-1 rounded-full inline-flex items-center gap-1 ${statusColors[order.status]}`}>
                                                    <StatusIcon className="text-[10px] sm:text-xs" />
                                                    <span className="hidden sm:inline">{order.status}</span>
                                                    <span className="sm:hidden">{order.status.slice(0, 4)}</span>
                                                </span>
                                            </td>
                                            <td className="px-3 sm:px-5 py-3 sm:py-3.5 text-white/30 text-[10px] sm:text-xs">
                                                {new Date(order.createdAt).toLocaleDateString('en-PK', { day: '2-digit', month: 'short', year: 'numeric' })}
                                            </td>
                                            <td className="px-3 sm:px-5 py-3 sm:py-3.5">
                                                <button
                                                    onClick={(e) => { e.stopPropagation(); setSelectedOrder(isExpanded ? null : order); }}
                                                    className="flex items-center gap-1 px-2 sm:px-3.5 py-1 sm:py-1.5 rounded-xl bg-white/5 border border-white/10 text-white/40 hover:text-white hover:border-blue-500/30 text-[10px] sm:text-xs transition-all duration-200"
                                                >
                                                    <FiEdit3 className="text-xs sm:text-sm" />
                                                    <span className="hidden sm:inline">Update</span>
                                                    <span className="sm:hidden">{isExpanded ? 'Close' : 'Open'}</span>
                                                </button>
                                            </td>
                                        </tr>

                                        {/* Expanded row: Status update + Delivery Details + Order Items */}
                                        {isExpanded && (
                                            <tr className="bg-white/5">
                                                <td colSpan={6} className="px-3 sm:px-5 py-3 sm:py-4">
                                                    <div className="space-y-4">

                                                        {/* Status update form */}
                                                        <div className="flex flex-col sm:flex-row flex-wrap items-start sm:items-end gap-3 sm:gap-4">
                                                            <div className="w-full sm:w-auto min-w-[140px] sm:min-w-[160px]">
                                                                <label className="text-[10px] tracking-[0.2em] uppercase text-white/30 block mb-1.5">Status</label>
                                                                <select
                                                                    value={statusForm.status}
                                                                    onChange={(e) => setStatusForm({ ...statusForm, status: e.target.value })}
                                                                    className="w-full bg-[#0e1629] border border-white/10 rounded-2xl px-3 sm:px-4 py-2 sm:py-2.5 text-xs sm:text-sm text-white outline-none focus:border-blue-500/50 transition"
                                                                >
                                                                    <option value="">Select Status</option>
                                                                    {['PENDING', 'CONFIRMED', 'SHIPPED', 'DELIVERED', 'CANCELLED'].map((s) => (
                                                                        <option key={s} value={s}>{s}</option>
                                                                    ))}
                                                                </select>
                                                            </div>
                                                            <div className="flex-1 w-full sm:w-auto min-w-[160px] sm:min-w-[200px]">
                                                                <label className="text-[10px] tracking-[0.2em] uppercase text-white/30 block mb-1.5">Tracking Message</label>
                                                                <input
                                                                    type="text"
                                                                    value={statusForm.trackingMessage}
                                                                    onChange={(e) => setStatusForm({ ...statusForm, trackingMessage: e.target.value })}
                                                                    placeholder="e.g. Order dispatched via TCS"
                                                                    className="w-full bg-[#0e1629] border border-white/10 rounded-2xl px-3 sm:px-4 py-2 sm:py-2.5 text-xs sm:text-sm text-white outline-none focus:border-blue-500/50 transition"
                                                                />
                                                            </div>
                                                            <div className="flex gap-2 w-full sm:w-auto">
                                                                <button
                                                                    onClick={() => handleStatusUpdate(order.id)}
                                                                    className="bg-blue-600 text-white px-4 sm:px-6 py-2 sm:py-2.5 rounded-2xl text-[10px] sm:text-xs tracking-widest uppercase font-medium shadow-[0_0_30px_rgba(59,130,246,0.2)] hover:shadow-[0_0_40px_rgba(59,130,246,0.3)] hover:bg-blue-500 transition-all duration-200 flex-1 sm:flex-none"
                                                                >
                                                                    Save
                                                                </button>
                                                                <button
                                                                    onClick={() => setSelectedOrder(null)}
                                                                    className="border border-white/10 text-white/40 hover:text-white px-4 sm:px-5 py-2 sm:py-2.5 rounded-2xl text-[10px] sm:text-xs tracking-widest uppercase transition-all duration-200 flex-1 sm:flex-none"
                                                                >
                                                                    Close
                                                                </button>
                                                            </div>
                                                        </div>

                                                        {/* 👇 NEW: Delivery Details */}
                                                        <div>
                                                            <h4 className="text-xs font-semibold tracking-widest text-white/50 uppercase mb-2 flex items-center gap-2">
                                                                <FiMapPin className="text-blue-400" />
                                                                Delivery Details
                                                            </h4>
                                                            <div className="bg-[#0e1629]/40 rounded-xl border border-white/5 p-4 grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
                                                                <div className="flex items-center gap-2">
                                                                    <FiUser className="text-white/30 text-xs" />
                                                                    <span className="text-white/50 text-xs">Name:</span>
                                                                    <span className="text-white/80 font-medium">{order.fullName || '—'}</span>
                                                                </div>
                                                                <div className="flex items-center gap-2">
                                                                    <FiPhone className="text-white/30 text-xs" />
                                                                    <span className="text-white/50 text-xs">Phone:</span>
                                                                    <span className="text-white/80">{order.phone || '—'}</span>
                                                                </div>
                                                                {order.email && (
                                                                    <div className="flex items-center gap-2 col-span-1 sm:col-span-2">
                                                                        <FiMail className="text-white/30 text-xs" />
                                                                        <span className="text-white/50 text-xs">Email:</span>
                                                                        <span className="text-white/80">{order.email}</span>
                                                                    </div>
                                                                )}
                                                                <div className="flex items-start gap-2 col-span-1 sm:col-span-2">
                                                                    <FiMapPin className="text-white/30 text-xs mt-0.5" />
                                                                    <span className="text-white/50 text-xs">Address:</span>
                                                                    <span className="text-white/80">
                                                                        {order.address}
                                                                        {order.apartment ? `, ${order.apartment}` : ''}
                                                                        {order.landmark ? ` (${order.landmark})` : ''}
                                                                    </span>
                                                                </div>
                                                                <div className="flex items-center gap-2">
                                                                    <span className="text-white/50 text-xs">City:</span>
                                                                    <span className="text-white/80">{order.city || '—'}</span>
                                                                </div>
                                                                <div className="flex items-center gap-2">
                                                                    <span className="text-white/50 text-xs">Postal Code:</span>
                                                                    <span className="text-white/80">{order.postalCode || '—'}</span>
                                                                </div>
                                                                <div className="flex items-center gap-2">
                                                                    <span className="text-white/50 text-xs">Province:</span>
                                                                    <span className="text-white/80">{order.province || '—'}</span>
                                                                </div>
                                                                <div className="flex items-center gap-2">
                                                                    <span className="text-white/50 text-xs">Payment:</span>
                                                                    <span className="text-white/80">Cash on Delivery</span>
                                                                </div>
                                                            </div>
                                                        </div>

                                                        {/* Order Items with Image */}
                                                        <div>
                                                            <h4 className="text-xs font-semibold tracking-widest text-white/50 uppercase mb-2 flex items-center gap-2">
                                                                <FiPackage className="text-blue-400" />
                                                                Order Items
                                                            </h4>
                                                            <div className="bg-[#0e1629]/40 rounded-xl border border-white/5 overflow-hidden">
                                                                <div className="overflow-x-auto">
                                                                    <table className="w-full text-xs min-w-[400px]">
                                                                        <thead className="border-b border-white/5">
                                                                            <tr>
                                                                                <th className="px-3 py-2 text-left text-white/30 font-medium">Product</th>
                                                                                <th className="px-3 py-2 text-left text-white/30 font-medium">Qty</th>
                                                                                <th className="px-3 py-2 text-left text-white/30 font-medium">Price</th>
                                                                                <th className="px-3 py-2 text-left text-white/30 font-medium">Subtotal</th>
                                                                            </tr>
                                                                        </thead>
                                                                        <tbody>
                                                                            {order.items?.map((item) => {
                                                                                const variantImage = item.variant?.image || null;
                                                                                const imageUrl = variantImage || item.product?.images?.[0] || null;
                                                                                return (
                                                                                    <tr key={item.id} className="border-b border-white/5 last:border-0">
                                                                                        <td className="px-3 py-2">
                                                                                            <div className="flex items-center gap-2.5">
                                                                                                {imageUrl ? (
                                                                                                    <img
                                                                                                        src={imageUrl}
                                                                                                        alt={item.product?.name || 'Product'}
                                                                                                        className="w-8 h-8 sm:w-10 sm:h-10 object-cover rounded-lg border border-white/10 flex-shrink-0"
                                                                                                    />
                                                                                                ) : (
                                                                                                    <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center flex-shrink-0">
                                                                                                        <FiImage className="text-white/20 text-sm" />
                                                                                                    </div>
                                                                                                )}
                                                                                                <span className="text-white/70 truncate max-w-[120px] sm:max-w-[200px]">
                                                                                                    {item.product?.name || 'Product'}
                                                                                                </span>
                                                                                                {item.variant?.color && (
                                                                                                    <span className="text-[10px] text-white/30">
                                                                                                        ({item.variant.color})
                                                                                                    </span>
                                                                                                )}
                                                                                            </div>
                                                                                        </td>
                                                                                        <td className="px-3 py-2 text-white/50">{item.quantity}</td>
                                                                                        <td className="px-3 py-2 text-white/50">Rs. {item.price?.toLocaleString()}</td>
                                                                                        <td className="px-3 py-2 text-white/80 font-semibold">
                                                                                            Rs. {(item.quantity * item.price)?.toLocaleString()}
                                                                                        </td>
                                                                                    </tr>
                                                                                );
                                                                            })}
                                                                            {(!order.items || order.items.length === 0) && (
                                                                                <tr>
                                                                                    <td colSpan={4} className="px-3 py-4 text-center text-white/20 text-xs">
                                                                                        No items found for this order.
                                                                                    </td>
                                                                                </tr>
                                                                            )}
                                                                        </tbody>
                                                                        <tfoot className="border-t border-white/5">
                                                                            <tr>
                                                                                <td colSpan={3} className="px-3 py-2 text-right text-white/40 text-xs font-medium tracking-widest">
                                                                                    Order Total
                                                                                </td>
                                                                                <td className="px-3 py-2 text-white font-bold text-sm">
                                                                                    Rs. {order.totalPrice?.toLocaleString()}
                                                                                </td>
                                                                            </tr>
                                                                        </tfoot>
                                                                    </table>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </td>
                                            </tr>
                                        )}
                                    </>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
                {orders.length === 0 && (
                    <div className="text-center py-12 sm:py-16 text-white/20 text-sm tracking-wider">No orders yet.</div>
                )}
            </div>
        </div>
    );
};

export default Orders;