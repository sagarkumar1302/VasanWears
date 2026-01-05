import React, { useState, useEffect } from "react";
import { RiStarLine, RiDownloadLine, RiStarFill } from "@remixicon/react";
import { Link, useNavigate } from "react-router-dom";
import { getMyOrdersApi } from "../../utils/orderApi";
import Loader from "./Loader";

const Orders = () => {
  const [ordersData, setOrdersData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setLoading(true);
        const response = await getMyOrdersApi();
        // Response structure: { statusCode, message, data }
        setOrdersData(response?.data || response?.data || []);
        setError(null);
      } catch (err) {
        console.error("Error fetching orders:", err);
        setError("Failed to load orders. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);
  if (loading) {
    return (
      <Loader/>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="text-center">
          <p className="text-red-500">{error}</p>
        </div>
      </div>
    );
  }

  // Helper function to format date
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  };

  // Helper function to get order status display
  const getStatusDisplay = (order) => {
    if (order.orderStatus === "DELIVERED" && order.deliveredAt) {
      return `Delivered on ${formatDate(order.deliveredAt)}`;
    }
    if (order.orderStatus === "CANCELLED") {
      return "Cancelled";
    }
    if (order.estimatedDelivery) {
      return `Expected by ${formatDate(order.estimatedDelivery)}`;
    }
    return `Order ${order.orderStatus?.toLowerCase() || "placed"}`;
  };

  return (
    <div className="">
      <div className="mx-auto gap-6">
        <h3 className="text-xl font-semibold mb-4">Orders History</h3>

        {/* LEFT: ORDER LIST */}
        <div className="md:col-span-2 space-y-4">
          {ordersData.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500">No orders found</p>
            </div>
          ) : (
            ordersData.map((order) => {
              // Get first item for display (orders can have multiple items)
              const firstItem = order.items?.[0];
              const product = firstItem?.product;
              const color = firstItem?.color;
              const size = firstItem?.size;
              const design = firstItem?.design;
              console.log("Design ", design);

              return (
                <div
                  key={order._id}
                  onClick={() => navigate(`${order._id}`)}
                  className={`bg-white p-4 rounded-xl border cursor-pointer hover:shadow border-primary2/10`}
                >
                  <div className="flex gap-4">
                    <img
                      src={
                        product?.featuredImage ||
                        design?.images?.front ||
                        "/images/placeholder.jpg"
                      }
                      alt={product?.name || "Product"}
                      className="w-20 h-20 object-cover rounded"
                    />

                    <div className="flex gap-4 w-full md:flex-row flex-col">
                      <div className="flex-1">
                        <h3 className="font-medium text-sm product-title">
                          {product?.title || design?.title || "Product"}
                        </h3>

                        <p className="text-xs text-gray-500 mt-1">
                          {color?.name
                            ? `Color: ${color.name}`
                            : `Color: ${design?.color?.name}`}
                          {color?.name && size?.name && " | "}
                          {design?.color?.name && design?.size?.name && " | "}
                          {size?.name
                            ? `Size: ${size.name}`
                            : `Size: ${design?.size?.name}`}
                          {!color?.name &&
                            !size?.name &&
                            !design?.color?.name &&
                            !design?.size?.name &&
                            "Standard"}
                        </p>

                        {order.items.length > 1 && (
                          <p className="text-xs text-gray-400 mt-1">
                            +{order.items.length - 1} more item(s)
                          </p>
                        )}

                        <p className="font-semibold mt-2">
                          ₹{order.totalAmount}
                        </p>
                      </div>

                      <div className="text-sm md:text-right">
                        <p
                          className={`font-semibold ${
                            order.orderStatus === "DELIVERED"
                              ? "text-green-600"
                              : order.orderStatus === "CANCELLED"
                              ? "text-red-600"
                              : "text-primary2"
                          }`}
                        >
                          {getStatusDisplay(order)}
                        </p>

                        {order.orderStatus === "DELIVERED" && (
                          <Link
                            to={`/shop/${product?._id}/${
                              product?.slug || product?.name
                            }#review`}
                            onClick={(e) => e.stopPropagation()}
                            className="text-primary5 text-sm mt-2 flex items-center gap-1 z-30"
                          >
                            <RiStarFill size={15} /> Rate & Review Product
                          </Link>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* RIGHT: ORDER DETAILS */}
      </div>
    </div>
  );
};

export default Orders;
