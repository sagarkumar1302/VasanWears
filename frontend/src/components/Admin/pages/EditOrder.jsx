import React, { useEffect, useState, useRef } from 'react';
import { getOrderByIdAdminApi, updateOrderByAdminApi } from '../../../utils/adminApi';
import { useParams, useNavigate } from 'react-router-dom';
import gsap from 'gsap';
import toast from 'react-hot-toast';
import {
  RiArrowLeftLine,
  RiSaveLine,
  RiTruckLine,
  RiMoneyDollarCircleLine,
  RiInformationLine,
  RiMapPinLine,
} from '@remixicon/react';

const EditOrder = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const formRef = useRef(null);
  const sectionsRef = useRef([]);

  // Form state
  const [formData, setFormData] = useState({
    orderStatus: '',
    paymentStatus: '',
    trackingId: '',
    courierName: '',
    estimatedDelivery: '',
    deliveredAt: '',
    cancellationReason: '',
    returnedAt: '',
    notes: '',
    discount: 0,
    deliveryCharge: 0,
    shippingAddress: {
      fullName: '',
      phone: '',
      alternatePhone: '',
      addressLine1: '',
      landmark: '',
      city: '',
      state: '',
      pincode: '',
      country: 'India',
    },
  });

  useEffect(() => {
    fetchOrder();
  }, [orderId]);

  useEffect(() => {
    if (order) {
      // Animate sections on mount
      gsap.fromTo(
        sectionsRef.current,
        { opacity: 0, y: 30 },
        {
          opacity: 1,
          y: 0,
          duration: 0.6,
          stagger: 0.1,
          ease: 'power3.out',
        }
      );
    }
  }, [order]);

  const fetchOrder = async () => {
    try {
      setLoading(true);
      const res = await getOrderByIdAdminApi(orderId);
      setOrder(res.data);

      // Populate form data
      setFormData({
        orderStatus: res.data.orderStatus || '',
        paymentStatus: res.data.paymentStatus || '',
        trackingId: res.data.trackingId || '',
        courierName: res.data.courierName || '',
        estimatedDelivery: res.data.estimatedDelivery
          ? new Date(res.data.estimatedDelivery).toISOString().split('T')[0]
          : '',
        deliveredAt: res.data.deliveredAt
          ? new Date(res.data.deliveredAt).toISOString().split('T')[0]
          : '',
        cancellationReason: res.data.cancellationReason || '',
        returnedAt: res.data.returnedAt
          ? new Date(res.data.returnedAt).toISOString().split('T')[0]
          : '',
        notes: res.data.notes || '',
        discount: res.data.discount || 0,
        deliveryCharge: res.data.deliveryCharge || 0,
        shippingAddress: res.data.shippingAddress || {
          fullName: '',
          phone: '',
          alternatePhone: '',
          addressLine1: '',
          landmark: '',
          city: '',
          state: '',
          pincode: '',
          country: 'India',
        },
      });
    } catch (err) {
      toast.error('Failed to fetch order');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleAddressChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      shippingAddress: {
        ...prev.shippingAddress,
        [name]: value,
      },
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setSaving(true);

      // Prepare data for update
      const updateData = {
        orderStatus: formData.orderStatus,
        paymentStatus: formData.paymentStatus,
        trackingId: formData.trackingId || null,
        courierName: formData.courierName || null,
        estimatedDelivery: formData.estimatedDelivery || null,
        deliveredAt: formData.deliveredAt || null,
        cancellationReason: formData.cancellationReason || null,
        returnedAt: formData.returnedAt || null,
        notes: formData.notes || null,
        discount: Number(formData.discount),
        deliveryCharge: Number(formData.deliveryCharge),
        shippingAddress: formData.shippingAddress,
      };

      const res = await updateOrderByAdminApi(id, updateData);
      
      toast.success('Order updated successfully');
      
      // Animate success
      gsap.to(formRef.current, {
        scale: 0.98,
        duration: 0.1,
        yoyo: true,
        repeat: 1,
      });

      // Refresh order data
      setOrder(res.data);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update order');
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      PLACED: 'bg-blue-100 text-blue-800 border-blue-300',
      CONFIRMED: 'bg-cyan-100 text-cyan-800 border-cyan-300',
      PROCESSING: 'bg-yellow-100 text-yellow-800 border-yellow-300',
      SHIPPED: 'bg-purple-100 text-purple-800 border-purple-300',
      DELIVERED: 'bg-green-100 text-green-800 border-green-300',
      CANCELLED: 'bg-red-100 text-red-800 border-red-300',
      RETURNED: 'bg-gray-100 text-gray-800 border-gray-300',
    };
    return colors[status] || 'bg-gray-100 text-gray-800 border-gray-300';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-16 h-16 border-4 border-primary5 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-primary5/70">Order not found</p>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/admin/orders')}
            className="p-2 hover:bg-primary1/50 rounded-lg transition"
          >
            <RiArrowLeftLine className="w-6 h-6 text-primary5" />
          </button>
          <div>
            <h1 className="text-3xl font-bold text-primary5">
              Edit Order #{order._id.slice(-8).toUpperCase()}
            </h1>
            <p className="text-primary5/70 mt-1">
              Update order details and track shipping
            </p>
          </div>
        </div>
        <span className={`px-4 py-2 rounded-full text-sm font-medium border ${getStatusColor(order.orderStatus)}`}>
          {order.orderStatus}
        </span>
      </div>

      <form onSubmit={handleSubmit} ref={formRef}>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Order Items & Customer Info */}
          <div className="lg:col-span-2 space-y-6">
            {/* Order Items */}
            <div
              ref={(el) => (sectionsRef.current[0] = el)}
              className="bg-white rounded-xl shadow-sm p-6"
            >
              <h2 className="text-xl font-semibold text-primary5 mb-4">Order Items</h2>
              <div className="space-y-4">
                {order.items.map((item, index) => (
                  <div key={index} className="flex gap-4 p-4 border border-primary2/20 rounded-lg">
                    {item.itemType === 'catalog' ? (
                      <>
                        <img
                          src={item.product?.featuredImage || '/placeholder.jpg'}
                          alt={item.product?.title}
                          className="w-20 h-20 object-cover rounded-lg"
                        />
                        <div className="flex-1">
                          <h3 className="font-medium text-primary5">{item.product?.title}</h3>
                          <p className="text-sm text-primary5/70">
                            Color: {item.color?.name} | Size: {item.size?.name}
                          </p>
                          <p className="text-sm text-primary5/70">Quantity: {item.quantity}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-primary5">₹{item.total}</p>
                          <p className="text-sm text-primary5/70">₹{item.price} each</p>
                        </div>
                      </>
                    ) : (
                      <>
                        <img
                          src={item.design?.images?.front || '/placeholder.jpg'}
                          alt={item.design?.title}
                          className="w-20 h-20 object-cover rounded-lg"
                        />
                        <div className="flex-1">
                          <h3 className="font-medium text-primary5">{item.design?.title}</h3>
                          <p className="text-sm text-primary5/70">
                            Custom Design | Size: {item.design?.size?.name}
                          </p>
                          <p className="text-sm text-primary5/70">Quantity: {item.quantity}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-primary5">₹{item.total}</p>
                          <p className="text-sm text-primary5/70">₹{item.price} each</p>
                        </div>
                      </>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Order & Payment Status */}
            <div
              ref={(el) => (sectionsRef.current[1] = el)}
              className="bg-white rounded-xl shadow-sm p-6"
            >
              <div className="flex items-center gap-2 mb-4">
                <RiInformationLine className="w-5 h-5 text-primary5" />
                <h2 className="text-xl font-semibold text-primary5">Order & Payment Status</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-primary5 mb-2">
                    Order Status *
                  </label>
                  <select
                    name="orderStatus"
                    value={formData.orderStatus}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-2 border border-primary2/20 rounded-lg focus:outline-none focus:border-primary5"
                  >
                    <option value="PLACED">Placed</option>
                    <option value="CONFIRMED">Confirmed</option>
                    <option value="PROCESSING">Processing</option>
                    <option value="SHIPPED">Shipped</option>
                    <option value="DELIVERED">Delivered</option>
                    <option value="CANCELLED">Cancelled</option>
                    <option value="RETURNED">Returned</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-primary5 mb-2">
                    Payment Status *
                  </label>
                  <select
                    name="paymentStatus"
                    value={formData.paymentStatus}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-2 border border-primary2/20 rounded-lg focus:outline-none focus:border-primary5"
                  >
                    <option value="PENDING">Pending</option>
                    <option value="PAID">Paid</option>
                    <option value="FAILED">Failed</option>
                    <option value="REFUNDED">Refunded</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Shipping Information */}
            <div
              ref={(el) => (sectionsRef.current[2] = el)}
              className="bg-white rounded-xl shadow-sm p-6"
            >
              <div className="flex items-center gap-2 mb-4">
                <RiTruckLine className="w-5 h-5 text-primary5" />
                <h2 className="text-xl font-semibold text-primary5">Shipping Information</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-primary5 mb-2">
                    Tracking ID
                  </label>
                  <input
                    type="text"
                    name="trackingId"
                    value={formData.trackingId}
                    onChange={handleInputChange}
                    placeholder="Enter tracking number"
                    className="w-full px-4 py-2 border border-primary2/20 rounded-lg focus:outline-none focus:border-primary5"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-primary5 mb-2">
                    Courier Name
                  </label>
                  <input
                    type="text"
                    name="courierName"
                    value={formData.courierName}
                    onChange={handleInputChange}
                    placeholder="e.g., BlueDart, Delhivery"
                    className="w-full px-4 py-2 border border-primary2/20 rounded-lg focus:outline-none focus:border-primary5"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-primary5 mb-2">
                    Estimated Delivery
                  </label>
                  <input
                    type="date"
                    name="estimatedDelivery"
                    value={formData.estimatedDelivery}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-primary2/20 rounded-lg focus:outline-none focus:border-primary5"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-primary5 mb-2">
                    Delivered At
                  </label>
                  <input
                    type="date"
                    name="deliveredAt"
                    value={formData.deliveredAt}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-primary2/20 rounded-lg focus:outline-none focus:border-primary5"
                  />
                </div>
              </div>
            </div>

            {/* Shipping Address */}
            <div
              ref={(el) => (sectionsRef.current[3] = el)}
              className="bg-white rounded-xl shadow-sm p-6"
            >
              <div className="flex items-center gap-2 mb-4">
                <RiMapPinLine className="w-5 h-5 text-primary5" />
                <h2 className="text-xl font-semibold text-primary5">Shipping Address</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-primary5 mb-2">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    name="fullName"
                    value={formData.shippingAddress.fullName}
                    onChange={handleAddressChange}
                    required
                    className="w-full px-4 py-2 border border-primary2/20 rounded-lg focus:outline-none focus:border-primary5"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-primary5 mb-2">
                    Phone *
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.shippingAddress.phone}
                    onChange={handleAddressChange}
                    required
                    className="w-full px-4 py-2 border border-primary2/20 rounded-lg focus:outline-none focus:border-primary5"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-primary5 mb-2">
                    Alternate Phone
                  </label>
                  <input
                    type="tel"
                    name="alternatePhone"
                    value={formData.shippingAddress.alternatePhone}
                    onChange={handleAddressChange}
                    className="w-full px-4 py-2 border border-primary2/20 rounded-lg focus:outline-none focus:border-primary5"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-primary5 mb-2">
                    Pincode *
                  </label>
                  <input
                    type="text"
                    name="pincode"
                    value={formData.shippingAddress.pincode}
                    onChange={handleAddressChange}
                    required
                    className="w-full px-4 py-2 border border-primary2/20 rounded-lg focus:outline-none focus:border-primary5"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-primary5 mb-2">
                    Address Line 1 *
                  </label>
                  <input
                    type="text"
                    name="addressLine1"
                    value={formData.shippingAddress.addressLine1}
                    onChange={handleAddressChange}
                    required
                    className="w-full px-4 py-2 border border-primary2/20 rounded-lg focus:outline-none focus:border-primary5"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-primary5 mb-2">
                    Landmark
                  </label>
                  <input
                    type="text"
                    name="landmark"
                    value={formData.shippingAddress.landmark}
                    onChange={handleAddressChange}
                    className="w-full px-4 py-2 border border-primary2/20 rounded-lg focus:outline-none focus:border-primary5"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-primary5 mb-2">
                    City *
                  </label>
                  <input
                    type="text"
                    name="city"
                    value={formData.shippingAddress.city}
                    onChange={handleAddressChange}
                    required
                    className="w-full px-4 py-2 border border-primary2/20 rounded-lg focus:outline-none focus:border-primary5"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-primary5 mb-2">
                    State *
                  </label>
                  <input
                    type="text"
                    name="state"
                    value={formData.shippingAddress.state}
                    onChange={handleAddressChange}
                    required
                    className="w-full px-4 py-2 border border-primary2/20 rounded-lg focus:outline-none focus:border-primary5"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-primary5 mb-2">
                    Country
                  </label>
                  <input
                    type="text"
                    name="country"
                    value={formData.shippingAddress.country}
                    onChange={handleAddressChange}
                    className="w-full px-4 py-2 border border-primary2/20 rounded-lg focus:outline-none focus:border-primary5"
                  />
                </div>
              </div>
            </div>

            {/* Additional Information */}
            <div
              ref={(el) => (sectionsRef.current[4] = el)}
              className="bg-white rounded-xl shadow-sm p-6"
            >
              <h2 className="text-xl font-semibold text-primary5 mb-4">Additional Information</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-primary5 mb-2">
                    Cancellation Reason
                  </label>
                  <textarea
                    name="cancellationReason"
                    value={formData.cancellationReason}
                    onChange={handleInputChange}
                    rows="3"
                    placeholder="If cancelled, provide reason"
                    className="w-full px-4 py-2 border border-primary2/20 rounded-lg focus:outline-none focus:border-primary5"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-primary5 mb-2">
                    Returned At
                  </label>
                  <input
                    type="date"
                    name="returnedAt"
                    value={formData.returnedAt}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-primary2/20 rounded-lg focus:outline-none focus:border-primary5"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-primary5 mb-2">
                    Admin Notes
                  </label>
                  <textarea
                    name="notes"
                    value={formData.notes}
                    onChange={handleInputChange}
                    rows="4"
                    placeholder="Internal notes (not visible to customer)"
                    className="w-full px-4 py-2 border border-primary2/20 rounded-lg focus:outline-none focus:border-primary5"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Summary & Actions */}
          <div className="space-y-6">
            {/* Order Summary */}
            <div
              ref={(el) => (sectionsRef.current[5] = el)}
              className="bg-white rounded-xl shadow-sm p-6 sticky top-6"
            >
              <div className="flex items-center gap-2 mb-4">
                <RiMoneyDollarCircleLine className="w-5 h-5 text-primary5" />
                <h2 className="text-xl font-semibold text-primary5">Order Summary</h2>
              </div>

              <div className="space-y-3 mb-4">
                <div className="flex justify-between text-primary5">
                  <span>Subtotal:</span>
                  <span className="font-medium">₹{order.subtotal}</span>
                </div>

                <div>
                  <label className="block text-sm font-medium text-primary5 mb-2">
                    Discount
                  </label>
                  <input
                    type="number"
                    name="discount"
                    value={formData.discount}
                    onChange={handleInputChange}
                    min="0"
                    className="w-full px-4 py-2 border border-primary2/20 rounded-lg focus:outline-none focus:border-primary5"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-primary5 mb-2">
                    Delivery Charge
                  </label>
                  <input
                    type="number"
                    name="deliveryCharge"
                    value={formData.deliveryCharge}
                    onChange={handleInputChange}
                    min="0"
                    className="w-full px-4 py-2 border border-primary2/20 rounded-lg focus:outline-none focus:border-primary5"
                  />
                </div>

                <div className="pt-3 border-t border-primary2/20">
                  <div className="flex justify-between text-lg font-bold text-primary5">
                    <span>Total:</span>
                    <span>
                      ₹{order.subtotal - Number(formData.discount) + Number(formData.deliveryCharge)}
                    </span>
                  </div>
                </div>
              </div>

              <div className="space-y-2 text-sm text-primary5/70 mb-4">
                <div className="flex justify-between">
                  <span>Payment Method:</span>
                  <span className="font-medium">{order.paymentMethod}</span>
                </div>
                <div className="flex justify-between">
                  <span>Order Date:</span>
                  <span>
                    {new Date(order.createdAt).toLocaleDateString('en-IN', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric',
                    })}
                  </span>
                </div>
              </div>

              <button
                type="submit"
                disabled={saving}
                className="w-full py-3 bg-primary5 text-white rounded-lg font-semibold hover:bg-primary5/90 transition flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {saving ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Saving...
                  </>
                ) : (
                  <>
                    <RiSaveLine className="w-5 h-5" />
                    Save Changes
                  </>
                )}
              </button>
            </div>

            {/* Customer Info */}
            <div
              ref={(el) => (sectionsRef.current[6] = el)}
              className="bg-white rounded-xl shadow-sm p-6"
            >
              <h2 className="text-xl font-semibold text-primary5 mb-4">Customer Info</h2>
              <div className="space-y-2 text-sm">
                <div>
                  <span className="text-primary5/70">Name:</span>
                  <p className="font-medium text-primary5">{order.user?.fullName || 'N/A'}</p>
                </div>
                <div>
                  <span className="text-primary5/70">Email:</span>
                  <p className="font-medium text-primary5">{order.user?.email || 'N/A'}</p>
                </div>
                <div>
                  <span className="text-primary5/70">Phone:</span>
                  <p className="font-medium text-primary5">{order.shippingAddress?.phone || 'N/A'}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};

export default EditOrder;
