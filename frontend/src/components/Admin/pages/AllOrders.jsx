import React, { useEffect, useState, useRef } from 'react';
import { getAllOrdersAdminApi } from '../../../utils/adminApi';
import { useNavigate } from 'react-router-dom';
import gsap from 'gsap';
import toast from 'react-hot-toast';
import { RiSearchLine, RiFilterLine, RiCloseLine, RiEyeLine } from '@remixicon/react';

const AllOrders = () => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  
  // Filter states
  const [filters, setFilters] = useState({
    orderStatus: 'ALL',
    paymentStatus: 'ALL',
    paymentMethod: 'ALL',
  });

  const ordersRef = useRef([]);
  const filterPanelRef = useRef(null);

  useEffect(() => {
    fetchOrders();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [orders, filters, searchTerm]);

  useEffect(() => {
    // Animate orders on mount
    if (filteredOrders.length > 0) {
      gsap.fromTo(
        ordersRef.current,
        { opacity: 0, y: 20 },
        {
          opacity: 1,
          y: 0,
          duration: 0.5,
          stagger: 0.05,
          ease: 'power2.out',
        }
      );
    }
  }, [filteredOrders]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const res = await getAllOrdersAdminApi();
      console.log("Res Orders ",res);
      
      setOrders(res.data);
    } catch (err) {
      toast.error('Failed to fetch orders');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...orders];

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(
        (order) =>
          order._id.toLowerCase().includes(searchTerm.toLowerCase()) ||
          order.user?.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          order.user?.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          order.shippingAddress?.phone?.includes(searchTerm)
      );
    }

    // Order status filter
    if (filters.orderStatus !== 'ALL') {
      filtered = filtered.filter((order) => order.orderStatus === filters.orderStatus);
    }

    // Payment status filter
    if (filters.paymentStatus !== 'ALL') {
      filtered = filtered.filter((order) => order.paymentStatus === filters.paymentStatus);
    }

    // Payment method filter
    if (filters.paymentMethod !== 'ALL') {
      filtered = filtered.filter((order) => order.paymentMethod === filters.paymentMethod);
    }

    setFilteredOrders(filtered);
  };

  const toggleFilters = () => {
    if (!showFilters) {
      setShowFilters(true);
      setTimeout(() => {
        gsap.fromTo(
          filterPanelRef.current,
          { height: 0, opacity: 0 },
          { height: 'auto', opacity: 1, duration: 0.3, ease: 'power2.out' }
        );
      }, 0);
    } else {
      gsap.to(filterPanelRef.current, {
        height: 0,
        opacity: 0,
        duration: 0.3,
        ease: 'power2.in',
        onComplete: () => setShowFilters(false),
      });
    }
  };

  const resetFilters = () => {
    setFilters({
      orderStatus: 'ALL',
      paymentStatus: 'ALL',
      paymentMethod: 'ALL',
    });
    setSearchTerm('');
  };

  const getStatusColor = (status) => {
    const colors = {
      PLACED: 'bg-blue-100 text-blue-800',
      CONFIRMED: 'bg-cyan-100 text-cyan-800',
      PROCESSING: 'bg-yellow-100 text-yellow-800',
      SHIPPED: 'bg-purple-100 text-purple-800',
      DELIVERED: 'bg-green-100 text-green-800',
      CANCELLED: 'bg-red-100 text-red-800',
      RETURNED: 'bg-gray-100 text-gray-800',
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const getPaymentStatusColor = (status) => {
    const colors = {
      PENDING: 'bg-yellow-100 text-yellow-800',
      PAID: 'bg-green-100 text-green-800',
      FAILED: 'bg-red-100 text-red-800',
      REFUNDED: 'bg-orange-100 text-orange-800',
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-16 h-16 border-4 border-primary5 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-primary5 mb-2">All Orders</h1>
        <p className="text-primary5/70">Manage and track all customer orders</p>
      </div>

      {/* Search and Filter Bar */}
      <div className="bg-white rounded-xl shadow-sm p-4 mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Search */}
          <div className="flex-1 relative">
            <RiSearchLine className="absolute left-3 top-1/2 -translate-y-1/2 text-primary5/50 w-5 h-5" />
            <input
              type="text"
              placeholder="Search by Order ID, Customer, Email, Phone..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-primary2/20 rounded-lg focus:outline-none focus:border-primary5"
            />
          </div>

          {/* Filter Button */}
          <button
            onClick={toggleFilters}
            className="px-4 py-2 bg-primary5 text-white rounded-lg flex items-center gap-2 hover:bg-primary5/90 transition"
          >
            <RiFilterLine className="w-5 h-5" />
            Filters
          </button>
        </div>

        {/* Filter Panel */}
        {showFilters && (
          <div ref={filterPanelRef} className="overflow-hidden">
            <div className="mt-4 pt-4 border-t border-primary2/20">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Order Status */}
                <div>
                  <label className="block text-sm font-medium text-primary5 mb-2">
                    Order Status
                  </label>
                  <select
                    value={filters.orderStatus}
                    onChange={(e) => setFilters({ ...filters, orderStatus: e.target.value })}
                    className="w-full px-3 py-2 border border-primary2/20 rounded-lg focus:outline-none focus:border-primary5"
                  >
                    <option value="ALL">All Status</option>
                    <option value="PLACED">Placed</option>
                    <option value="CONFIRMED">Confirmed</option>
                    <option value="PROCESSING">Processing</option>
                    <option value="SHIPPED">Shipped</option>
                    <option value="DELIVERED">Delivered</option>
                    <option value="CANCELLED">Cancelled</option>
                    <option value="RETURNED">Returned</option>
                  </select>
                </div>

                {/* Payment Status */}
                <div>
                  <label className="block text-sm font-medium text-primary5 mb-2">
                    Payment Status
                  </label>
                  <select
                    value={filters.paymentStatus}
                    onChange={(e) => setFilters({ ...filters, paymentStatus: e.target.value })}
                    className="w-full px-3 py-2 border border-primary2/20 rounded-lg focus:outline-none focus:border-primary5"
                  >
                    <option value="ALL">All Status</option>
                    <option value="PENDING">Pending</option>
                    <option value="PAID">Paid</option>
                    <option value="FAILED">Failed</option>
                    <option value="REFUNDED">Refunded</option>
                  </select>
                </div>

                {/* Payment Method */}
                <div>
                  <label className="block text-sm font-medium text-primary5 mb-2">
                    Payment Method
                  </label>
                  <select
                    value={filters.paymentMethod}
                    onChange={(e) => setFilters({ ...filters, paymentMethod: e.target.value })}
                    className="w-full px-3 py-2 border border-primary2/20 rounded-lg focus:outline-none focus:border-primary5"
                  >
                    <option value="ALL">All Methods</option>
                    <option value="COD">Cash on Delivery</option>
                    <option value="ONLINE">Online Payment</option>
                  </select>
                </div>
              </div>

              {/* Reset Button */}
              <div className="mt-4 flex justify-end">
                <button
                  onClick={resetFilters}
                  className="px-4 py-2 text-primary5 hover:bg-primary1/50 rounded-lg transition flex items-center gap-2"
                >
                  <RiCloseLine className="w-5 h-5" />
                  Reset Filters
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Results Count */}
      <div className="mb-4 text-primary5/70">
        Showing {filteredOrders.length} of {orders.length} orders
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        {filteredOrders.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-primary5/70 text-lg">No orders found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-primary1/30">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-primary5">Order ID</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-primary5">Customer</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-primary5">Items</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-primary5">Amount</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-primary5">Payment</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-primary5">Order Status</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-primary5">Date</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-primary5">Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredOrders.map((order, index) => (
                  <tr
                    key={order._id}
                    ref={(el) => (ordersRef.current[index] = el)}
                    className="border-b border-primary2/10 hover:bg-primary1/20 transition cursor-pointer"
                    onClick={() => navigate(`/admin/orders/${order._id}`)}
                  >
                    <td className="px-6 py-4">
                      <span className="font-mono text-sm text-primary5">
                        #{order._id.slice(-8).toUpperCase()}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-medium text-primary5">{order.user?.fullName || 'N/A'}</p>
                        <p className="text-sm text-primary5/70">{order.user?.email || 'N/A'}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-primary5">{order.items.length} item(s)</td>
                    <td className="px-6 py-4">
                      <span className="font-semibold text-primary5">₹{order.totalAmount}</span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col gap-1">
                        <span className="text-sm font-medium text-primary5">{order.paymentMethod}</span>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium inline-block w-fit ${getPaymentStatusColor(order.paymentStatus)}`}>
                          {order.paymentStatus}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(order.orderStatus)}`}>
                        {order.orderStatus}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-primary5/70">
                      {new Date(order.createdAt).toLocaleDateString('en-IN', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                      })}
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/admin/orders/${order._id}`);
                        }}
                        className="p-2 hover:bg-primary5 hover:text-white rounded-lg transition group"
                      >
                        <RiEyeLine className="w-5 h-5 text-primary5 group-hover:text-white" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default AllOrders;
