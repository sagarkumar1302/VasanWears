import React, { useState, useEffect, useRef } from "react";
import {
  RiCheckLine,
  RiStarLine,
  RiDownloadLine,
  RiChat1Line,
} from "@remixicon/react";
import { Link, useParams } from "react-router-dom";
import { getOrderByIdApi } from "../../utils/orderApi";
import Invoice from "./Invoice";
import { downloadInvoiceAsPDF } from "../../utils/invoiceUtils";

const SingleOrder = () => {
  const [showUpdates, setShowUpdates] = useState(false);
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isDownloading, setIsDownloading] = useState(false);
  const { orderId } = useParams();
  const invoiceRef = useRef(null);

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        setLoading(true);
        const response = await getOrderByIdApi(orderId);
        setOrder(response?.data?.data || response?.data);
        setError(null);
      } catch (err) {
        console.error("Error fetching order:", err);
        setError("Failed to load order details. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    if (orderId) {
      fetchOrder();
    }
  }, [orderId]);

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  };

  const handleDownloadInvoice = async () => {
    if (!invoiceRef.current || !order) return;

    setIsDownloading(true);
    try {
      const fileName = `Invoice_${order._id?.slice(-8).toUpperCase()}_VasanVastra.pdf`;
      await downloadInvoiceAsPDF(invoiceRef.current, fileName);
    } catch (error) {
      console.error("Failed to download invoice:", error);
      alert("Failed to download invoice. Please try again.");
    } finally {
      setIsDownloading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary2 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading order details...</p>
        </div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="text-center">
          <p className="text-red-500">{error || "Order not found"}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="">
      <div className="mx-auto grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* LEFT SECTION */}
        <div className="lg:col-span-2 space-y-4">
          {/* TRACKING INFO */}
          {order.trackingId && (
            <div className="bg-white p-4 rounded">
              <p className="text-sm">
                Order can be tracked by{" "}
                <a target="_blank" className="font-medium" href={`https://courierupdates.com/?awb=${order.trackingId}`}>{order.trackingId}</a>.
              </p>
              {order.courierName && (
                <p className="text-xs text-primary5 mt-1">
                  Courier: {order.courierName}
                </p>
              )}
            </div>
          )}

          {/* DELIVERY STATUS */}
          {order.orderStatus === "DELIVERED" && order.deliveredAt && (
            <div className="bg-white p-4 rounded flex gap-3">
              <div className="w-10 h-10 flex items-center justify-center border rounded">
                📦
              </div>
              <div>
                <p className="font-medium">Order Delivered</p>
                <p className="text-sm text-primary5">
                  Delivered on {formatDate(order.deliveredAt)}
                </p>
              </div>
            </div>
          )}

          {/* PRODUCT DETAILS */}
          {order.items?.map((item, index) => {
            const product = item.product;
            const design = item.design;
            const color = item.color || design?.color;
            const size = item.size || design?.size;

            return (
              <div key={index} className="bg-primary3/60 p-4 rounded mb-4">
                <div className="flex gap-4">
                  <div className="flex-1">
                    <h3 className="font-medium text-sm">
                      {product?.title || design?.title || "Product"}
                    </h3>

                    <p className="text-xs text-primary5 mt-1">
                      {size?.name && `Size: ${size.name}`}
                      {size?.name && color?.name && ", "}
                      {color?.name && `Color: ${color.name}`}
                    </p>

                    {item.quantity && (
                      <p className="text-xs mt-1">
                        Quantity:{" "}
                        <span className="text-primary5">{item.quantity}</span>
                      </p>
                    )}

                    <p className="font-semibold mt-2">
                      ₹{item.price || product?.price}
                    </p>
                  </div>

                  <img
                    src={
                      product?.featuredImage ||
                      design?.images?.front ||
                      product?.images?.[0] ||
                      "/images/placeholder.jpg"
                    }
                    alt={product?.title || "product"}
                    className="w-20 h-20 rounded object-cover"
                  />
                </div>

                {/* ORDER STATUS */}
                <div className="mt-4 space-y-2">
                  <div className="flex items-center gap-2 text-sm">
                    <span className="bg-primary5 text-white rounded-full w-5 h-5 flex items-center justify-center">
                      <RiCheckLine size={14} />
                    </span>
                    Order Placed, {formatDate(order.createdAt)}
                  </div>

                  {order.orderStatus === "PROCESSING" && (
                    <div className="flex items-center gap-2 text-sm">
                      <span className="bg-primary5 text-white rounded-full w-5 h-5 flex items-center justify-center">
                        <RiCheckLine size={14} />
                      </span>
                      Processing
                    </div>
                  )}

                  {(order.orderStatus === "SHIPPED" ||
                    order.orderStatus === "DELIVERED") && (
                    <div className="flex items-center gap-2 text-sm">
                      <span className="bg-primary5 text-white rounded-full w-5 h-5 flex items-center justify-center">
                        <RiCheckLine size={14} />
                      </span>
                      Shipped
                    </div>
                  )}

                  {order.orderStatus === "DELIVERED" && order.deliveredAt && (
                    <div className="flex items-center gap-2 text-sm">
                      <span className="bg-primary5 text-white rounded-full w-5 h-5 flex items-center justify-center">
                        <RiCheckLine size={14} />
                      </span>
                      Delivered, {formatDate(order.deliveredAt)}
                    </div>
                  )}

                  {order.orderStatus === "CANCELLED" && (
                    <div className="flex items-center gap-2 text-sm text-red-600">
                      <span className="bg-red-600 text-white rounded-full w-5 h-5 flex items-center justify-center">
                        ✕
                      </span>
                      Cancelled
                      {order.cancellationReason && (
                        <span className="text-xs">
                          - {order.cancellationReason}
                        </span>
                      )}
                    </div>
                  )}
                </div>

                <div className="border-t mt-4 pt-3 flex items-center gap-2 text-sm cursor-pointer border-t-primary2/20">
                  <RiChat1Line />
                  Contact with us
                </div>
              </div>
            );
          })}

          {/* RATE EXPERIENCE */}
          {order.orderStatus === "DELIVERED" && order.items?.[0]?.product && (
            <div className="bg-white p-4 rounded-xl border border-primary5/10">
              <Link
                to={`/shop/${order.items[0].product._id}/${
                  order.items[0].product.slug || order.items[0].product.name
                }#review`}
              >
                <h4 className="font-medium mb-3">Rate your experience</h4>

                <div className="border rounded p-3">
                  <p className="text-sm mb-2">Rate the product</p>
                  <div className="flex gap-2 text-gray-400">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <RiStarLine
                        key={i}
                        className="cursor-pointer hover:text-primary5"
                      />
                    ))}
                  </div>
                </div>
              </Link>
              {/* ORDER ID */}
              <p className="text-sm text-primary5 font-semibold mt-4">
                Order #{order._id}
              </p>
            </div>
          )}
        </div>

        {/* RIGHT SECTION */}
        <div className="space-y-4">
          {/* DELIVERY DETAILS */}
          <div className="bg-primary3/60 p-4 rounded-xl">
            <h4 className="font-medium mb-3">Delivery details</h4>

            <div className="p-3 rounded text-sm">
              <p className="font-medium">
                🏠 {order.shippingAddress?.addressType || "Address"}
              </p>
              <p className="text-primary5 mt-1">
                {order.shippingAddress?.addressLine1},
                {order.shippingAddress?.landmark &&
                  `Landmark ${order.shippingAddress?.landmark}`}
                {order.shippingAddress?.city}
                {order.shippingAddress?.state &&
                  `, ${order.shippingAddress.state}`}
                {order.shippingAddress?.pincode &&
                  ` - ${order.shippingAddress.pincode}`}
              </p>

              <p className="mt-3 font-medium">
                👤{" "}
                {order.shippingAddress?.fullName || order.shippingAddress?.name}
              </p>
              <p className="text-gray-600">{order.shippingAddress?.phone}
                {order.shippingAddress?.alternatePhone && `, ${order.shippingAddress?.alternatePhone}`}
              </p>
            </div>
          </div>

          {/* PRICE DETAILS */}
          <div className="bg-primary3/60 p-4 rounded-xl">
            <h4 className="font-medium mb-3">Price details</h4>

            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span>₹{order.subtotal}</span>
              </div>

              {order.discount > 0 && (
                <div className="flex justify-between text-primary5 font-semibold">
                  <span>Discount</span>
                  <span>-₹{order.discount}</span>
                </div>
              )}

              <div className="flex justify-between">
                <span>Delivery charge</span>
                <span>
                  {order.deliveryCharge > 0
                    ? `₹${order.deliveryCharge}`
                    : "FREE"}
                </span>
              </div>

              <hr className="border-t-primary2/20" />

              <div className="flex justify-between font-bold">
                <span>Total amount</span>
                <span>₹{order.totalAmount}</span>
              </div>
            </div>

            <div className="mt-3 text-sm text-primary5">
              Payment method: {order.paymentMethod}
            </div>
            <div className="mt-1 text-sm">
              Payment status:{" "}
              <span
                className={`font-semibold ${
                  order.isPaid ? "text-green-600" : "text-orange-600"
                }`}
              >
                {order.isPaid ? "Paid" : order.paymentStatus}
              </span>
            </div>

            <button
              onClick={handleDownloadInvoice}
              disabled={order.orderStatus !== "DELIVERED" || isDownloading}
              className={`mt-4 w-full py-2.5 px-8 rounded-xl font-semibold text-primary2 
             transition-all duration-300 btn-slide md:text-base text-sm flex items-center justify-center gap-4 
             ${
               order.orderStatus !== "DELIVERED"
                 ? "opacity-50 cursor-not-allowed bg-gray-300"
                 : "cursor-pointer hover:scale-105"
             }`}
            >
              <RiDownloadLine />
              {isDownloading ? "Generating..." : "Download Invoice"}
            </button>
            {order.orderStatus !== "DELIVERED" && (
              <p className="text-xs text-gray-500 text-center mt-2">
                Invoice available after delivery
              </p>
            )}
          </div>

          {/* OFFERS */}
          {/* <div className="bg-white p-4 rounded flex justify-between items-center cursor-pointer">
            <span className="flex items-center gap-2">🏆 Offers earned</span>⌄
          </div> */}
        </div>
      </div>

      {/* HIDDEN INVOICE FOR PDF GENERATION */}
      <div style={{ position: "absolute", left: "-9999px", top: 0 }}>
        <Invoice ref={invoiceRef} order={order} />
      </div>
    </div>
  );
};

export default SingleOrder;
