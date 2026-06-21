import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import api from '../../services/api';
import Loader from '../../components/Loader';
import { FiArrowLeft, FiPackage, FiTruck, FiCheckCircle, FiClock, FiXCircle } from 'react-icons/fi';

const statusColor = (status) => {
  if (status === 'DELIVERED') return 'text-emerald-400 border-emerald-400/30 bg-emerald-500/10';
  if (status === 'CANCELLED') return 'text-red-400 border-red-400/30 bg-red-500/10';
  if (status === 'SHIPPED') return 'text-blue-400 border-blue-400/30 bg-blue-500/10';
  if (status === 'CONFIRMED') return 'text-violet-400 border-violet-400/30 bg-violet-500/10';
  return 'text-amber-400 border-amber-400/30 bg-amber-500/10';
};

const statusIcon = (status) => {
  if (status === 'DELIVERED') return FiCheckCircle;
  if (status === 'CANCELLED') return FiXCircle;
  if (status === 'SHIPPED') return FiTruck;
  if (status === 'CONFIRMED') return FiPackage;
  return FiClock;
};

const statusSteps = ['PENDING', 'CONFIRMED', 'SHIPPED', 'DELIVERED'];

const OrderDetail = () => {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState(false);

  useEffect(() => {
    fetchOrder();
  }, [id]);

  const fetchOrder = async () => {
    try {
      const res = await api.get(`/buyer/orders/${id}`);
      const orderData = res.data.data || res.data;
      setOrder(orderData);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to load order');
      setOrder(null);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async () => {
    setCancelling(true);
    try {
      await api.put(`/buyer/orders/${id}/cancel`);
      toast.success('Order cancelled successfully');
      fetchOrder();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to cancel order');
    } finally {
      setCancelling(false);
    }
  };

  if (loading) return <Loader />;

  if (!order) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 bg-white">
        <p className="text-gray-400 text-sm tracking-widest uppercase">Order not found</p>
        <Link
          to="/profile"
          className="border border-black px-6 py-2 text-xs tracking-widest uppercase hover:bg-black hover:text-white transition"
        >
          Back to Profile
        </Link>
      </div>
    );
  }

  const isCancelled = order.status === 'CANCELLED';
  const currentStep = statusSteps.indexOf(order.status);
  const StatusIcon = statusIcon(order.status);
  const statusClasses = statusColor(order.status);
  const items = Array.isArray(order.items) ? order.items : [];

  return (
    <div className="bg-white min-h-screen py-8 px-4 sm:py-14">
      <div className="max-w-3xl mx-auto">

        <Link
          to="/profile"
          className="inline-flex items-center gap-2 text-xs text-gray-400 hover:text-black transition tracking-widest uppercase mb-8"
        >
          <FiArrowLeft /> Back to My Orders
        </Link>

        <div className="flex flex-wrap items-start justify-between gap-4 mb-10">
          <div>
            <h1 className="text-2xl font-bold tracking-widest uppercase text-black">Order #{order.id}</h1>
            <p className="text-xs text-gray-400 mt-2">
              Placed on {new Date(order.createdAt).toLocaleDateString('en-PK', {
                day: 'numeric', month: 'long', year: 'numeric',
              })}
            </p>
          </div>
          <span className={`flex items-center gap-1.5 text-xs font-bold tracking-widest uppercase border px-3 py-1.5 rounded-full ${statusClasses}`}>
            <StatusIcon className="text-sm" />
            {order.status}
          </span>
        </div>

        {!isCancelled && (
          <div className="mb-10 bg-gray-50/80 backdrop-blur-sm border border-gray-100 rounded-2xl p-6 shadow-sm">
            <div className="flex items-center justify-between relative">
              <div className="absolute top-3 left-0 right-0 h-px bg-gray-200 z-0" />
              <div
                className="absolute top-3 left-0 h-px bg-black z-0 transition-all duration-500"
                style={{
                  width: currentStep === 0 ? '0%' : `${(currentStep / (statusSteps.length - 1)) * 100}%`,
                }}
              />
              {statusSteps.map((step, i) => (
                <div key={step} className="flex flex-col items-center z-10">
                  <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center text-xs transition-all ${i <= currentStep ? 'bg-black border-black text-white' : 'bg-white border-gray-300 text-gray-300'
                    }`}>
                    {i < currentStep ? '✓' : i === currentStep ? '●' : ''}
                  </div>
                  <p className={`text-xs mt-2 tracking-widest uppercase ${i <= currentStep ? 'text-black font-semibold' : 'text-gray-400'
                    }`}>
                    {step}
                  </p>
                </div>
              ))}
            </div>
            {order.trackingMessage && (
              <p className="text-xs text-gray-500 mt-4 text-center italic border-t border-gray-100 pt-3">
                📦 {order.trackingMessage}
              </p>
            )}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">

          <div className="bg-gray-50/80 backdrop-blur-sm border border-gray-100 rounded-2xl p-5 shadow-sm">
            <h2 className="text-xs font-semibold tracking-widest uppercase text-gray-400 mb-4 flex items-center gap-2">
              <FiPackage className="text-gray-500" /> Delivery Details
            </h2>
            <div className="flex flex-col gap-2 text-sm">
              {[
                { label: 'Name', value: order.fullName },
                { label: 'Phone', value: order.phone },
                order.email && { label: 'Email', value: order.email },
                { label: 'Address', value: `${order.address}${order.apartment ? `, ${order.apartment}` : ''}` },
                order.landmark && { label: 'Landmark', value: order.landmark },
                { label: 'City', value: order.city },
                { label: 'Postal Code', value: order.postalCode },
                { label: 'Province', value: order.province },
              ].filter(Boolean).map(({ label, value }) => (
                <div key={label} className="flex justify-between">
                  <span className="text-gray-400 text-xs">{label}</span>
                  <span className="font-medium text-black text-right max-w-[60%]">{value}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-gray-50/80 backdrop-blur-sm border border-gray-100 rounded-2xl p-5 shadow-sm">
            <h2 className="text-xs font-semibold tracking-widest uppercase text-gray-400 mb-4 flex items-center gap-2">
              <FiCheckCircle className="text-gray-500" /> Order Summary
            </h2>
            {items.length > 0 ? (
              <div className="flex flex-col gap-3">
                {items.map((item) => {
                  const product = item.product || {}
                  const productName = product.name || 'Product'
                  const productImage = item.variant?.image || product.images?.[0] || null
                  const price = item.price || 0
                  const quantity = item.quantity || 1
                  return (
                    <div key={item.id} className="flex items-center gap-3 bg-white/50 p-2 rounded-xl border border-gray-100">
                      <div className="w-12 h-12 bg-gray-100 flex-shrink-0 rounded-lg overflow-hidden">
                        {productImage ? (
                          <img src={productImage} alt={productName} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-gray-300 text-xs">
                            <FiPackage />
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium text-black truncate">{productName}</p>
                        {item.variant?.color && (
                          <p className="text-[10px] text-gray-400">Variant: {item.variant.color}</p>
                        )}
                        <p className="text-xs text-gray-400">× {quantity}</p>
                      </div>
                      <span className="text-xs font-semibold text-black">
                        Rs. {(price * quantity).toLocaleString()}
                      </span>
                    </div>
                  )
                })}
              </div>
            ) : (
              <p className="text-xs text-gray-400">No items found for this order.</p>
            )}

            <div className="border-t border-gray-200 mt-4 pt-4 flex flex-col gap-2">
              <div className="flex justify-between text-xs text-gray-400">
                <span>Payment</span>
                <span>Cash on Delivery</span>
              </div>
              <div className="flex justify-between font-bold text-sm text-black">
                <span>Total</span>
                <span>Rs. {order.totalPrice?.toLocaleString()}</span>
              </div>
            </div>
          </div>
        </div>

        {order.status === 'PENDING' && (
          <div className="bg-red-50/80 backdrop-blur-sm border border-red-200 rounded-2xl p-5 flex flex-wrap items-center justify-between gap-4 shadow-sm">
            <div>
              <p className="text-xs font-semibold text-red-500 uppercase tracking-widest flex items-center gap-2">
                <FiXCircle /> Cancel Order
              </p>
              <p className="text-xs text-gray-400 mt-1">Only possible within 6 hours of placing the order</p>
            </div>
            <button
              onClick={handleCancel}
              disabled={cancelling}
              className="text-xs border border-red-400 text-red-400 px-5 py-2 rounded-lg hover:bg-red-400 hover:text-white transition disabled:opacity-50"
            >
              {cancelling ? 'Cancelling...' : 'Cancel Order'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default OrderDetail;