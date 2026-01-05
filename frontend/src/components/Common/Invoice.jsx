import React from "react";

const Invoice = ({ order, ref }) => {
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-IN", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const formatTime = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleTimeString("en-IN", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div
      ref={ref}
      style={{
        fontFamily: "Arial, sans-serif",
        backgroundColor: "#ffffff",
        padding: "32px",
        maxWidth: "56rem",
        margin: "0 auto",
      }}
    >
      {/* HEADER */}
      <div
        style={{
          borderBottom: "4px solid #5a4a2e",
          paddingBottom: "24px",
          marginBottom: "24px",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <div>
            <img
              src="/images/logo.png"
              alt="Vasan Vastra Logo"
              style={{
                height: "150px",
                width: "auto",
                marginBottom: "12px",
                objectFit: "contain",
              }}
            />
            <p style={{ color: "#4b5563", fontSize: "14px" }}>
              Custom Apparel & Fashion
            </p>
            <p style={{ color: "#4b5563", fontSize: "14px", marginTop: "8px" }}>
              Website: www.vasanvastra.com
            </p>
            <p style={{ color: "#4b5563", fontSize: "14px" }}>
              Email: info@vasanwears.com
            </p>
            <p style={{ color: "#4b5563", fontSize: "14px" }}>
              Phone: +91 XXXXXXXXXX
            </p>
          </div>
          <div style={{ textAlign: "right" }}>
            <h2
              style={{
                fontSize: "24px",
                fontWeight: "bold",
                color: "#1f2937",
                marginBottom: "8px",
              }}
            >
              INVOICE
            </h2>
            <p style={{ fontSize: "14px", color: "#4b5563" }}>
              <span style={{ fontWeight: "600" }}>Invoice #:</span>{" "}
              {order._id?.slice(-8).toUpperCase()}
            </p>
            <p style={{ fontSize: "14px", color: "#4b5563" }}>
              <span style={{ fontWeight: "600" }}>Order #:</span> {order._id}
            </p>
            <p style={{ fontSize: "14px", color: "#4b5563", marginTop: "8px" }}>
              <span style={{ fontWeight: "600" }}>Date:</span>{" "}
              {formatDate(order.createdAt)}
            </p>
            {order.deliveredAt && (
              <p style={{ fontSize: "14px", color: "#4b5563" }}>
                <span style={{ fontWeight: "600" }}>Delivered:</span>{" "}
                {formatDate(order.deliveredAt)}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* BILLING & SHIPPING INFO */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: "24px",
          marginBottom: "32px",
        }}
      >
        {/* Bill To */}
        <div>
          <h3
            style={{
              fontSize: "18px",
              fontWeight: "600",
              color: "#1f2937",
              marginBottom: "12px",
              borderBottom: "1px solid #e5e7eb",
              paddingBottom: "8px",
            }}
          >
            Bill To:
          </h3>
          <p style={{ fontWeight: "600", color: "#1f2937" }}>
            {order.shippingAddress?.fullName || order.shippingAddress?.name}
          </p>
          <p style={{ fontSize: "14px", color: "#4b5563", marginTop: "4px" }}>
            {order.shippingAddress?.addressLine1}
          </p>
          {order.shippingAddress?.landmark && (
            <p style={{ fontSize: "14px", color: "#4b5563" }}>
              Landmark: {order.shippingAddress.landmark}
            </p>
          )}
          <p style={{ fontSize: "14px", color: "#4b5563" }}>
            {order.shippingAddress?.city}, {order.shippingAddress?.state} -{" "}
            {order.shippingAddress?.pincode}
          </p>
          <p style={{ fontSize: "14px", color: "#4b5563" }}>
            {order.shippingAddress?.country || "India"}
          </p>
          <p style={{ fontSize: "14px", color: "#4b5563", marginTop: "8px" }}>
            <span style={{ fontWeight: "600" }}>Phone:</span>{" "}
            {order.shippingAddress?.phone}
          </p>
          {order.shippingAddress?.alternatePhone && (
            <p style={{ fontSize: "14px", color: "#4b5563" }}>
              <span style={{ fontWeight: "600" }}>Alt. Phone:</span>{" "}
              {order.shippingAddress.alternatePhone}
            </p>
          )}
        </div>

        {/* Ship To */}
        <div>
          <h3
            style={{
              fontSize: "18px",
              fontWeight: "600",
              color: "#1f2937",
              marginBottom: "12px",
              borderBottom: "1px solid #e5e7eb",
              paddingBottom: "8px",
            }}
          >
            Ship To:
          </h3>
          <p style={{ fontWeight: "600", color: "#1f2937" }}>
            {order.shippingAddress?.fullName || order.shippingAddress?.name}
          </p>
          <p style={{ fontSize: "14px", color: "#4b5563", marginTop: "4px" }}>
            {order.shippingAddress?.addressLine1}
          </p>
          {order.shippingAddress?.landmark && (
            <p style={{ fontSize: "14px", color: "#4b5563" }}>
              Landmark: {order.shippingAddress.landmark}
            </p>
          )}
          <p style={{ fontSize: "14px", color: "#4b5563" }}>
            {order.shippingAddress?.city}, {order.shippingAddress?.state} -{" "}
            {order.shippingAddress?.pincode}
          </p>
          <p style={{ fontSize: "14px", color: "#4b5563" }}>
            {order.shippingAddress?.country || "India"}
          </p>
          {order.trackingId && (
            <p style={{ fontSize: "14px", color: "#4b5563", marginTop: "8px" }}>
              <span style={{ fontWeight: "600" }}>Tracking ID:</span>{" "}
              {order.trackingId}
            </p>
          )}
          {order.courierName && (
            <p style={{ fontSize: "14px", color: "#4b5563" }}>
              <span style={{ fontWeight: "600" }}>Courier:</span>{" "}
              {order.courierName}
            </p>
          )}
        </div>
      </div>

      {/* ITEMS TABLE */}
      <div style={{ marginBottom: "32px" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ backgroundColor: "#5a4a2e", color: "#ffffff" }}>
              <th
                style={{
                  textAlign: "left",
                  padding: "12px 16px",
                  fontWeight: "600",
                  fontSize: "14px",
                }}
              >
                #
              </th>
              <th
                style={{
                  textAlign: "left",
                  padding: "12px 16px",
                  fontWeight: "600",
                  fontSize: "14px",
                }}
              >
                Product Description
              </th>
              <th
                style={{
                  textAlign: "center",
                  padding: "12px 16px",
                  fontWeight: "600",
                  fontSize: "14px",
                }}
              >
                Qty
              </th>
              <th
                style={{
                  textAlign: "right",
                  padding: "12px 16px",
                  fontWeight: "600",
                  fontSize: "14px",
                }}
              >
                Unit Price
              </th>
              <th
                style={{
                  textAlign: "right",
                  padding: "12px 16px",
                  fontWeight: "600",
                  fontSize: "14px",
                }}
              >
                Total
              </th>
            </tr>
          </thead>
          <tbody>
            {order.items?.map((item, index) => {
              const product = item.product;
              const design = item.design;
              const color = item.color || design?.color;
              const size = item.size || design?.size;
              const productTitle =
                product?.title || design?.title || "Custom Product";

              return (
                <tr
                  key={index}
                  style={{ borderBottom: "1px solid #e5e7eb" }}
                >
                  <td
                    style={{
                      padding: "12px 16px",
                      fontSize: "14px",
                      color: "#4b5563",
                    }}
                  >
                    {index + 1}
                  </td>
                  <td style={{ padding: "12px 16px" }}>
                    <p
                      style={{
                        fontWeight: "600",
                        color: "#1f2937",
                        fontSize: "14px",
                      }}
                    >
                      {productTitle}
                    </p>
                    {(size?.name || color?.name) && (
                      <p
                        style={{
                          fontSize: "12px",
                          color: "#4b5563",
                          marginTop: "4px",
                        }}
                      >
                        {size?.name && `Size: ${size.name}`}
                        {size?.name && color?.name && " | "}
                        {color?.name && `Color: ${color.name}`}
                      </p>
                    )}
                    {item.sku && (
                      <p
                        style={{
                          fontSize: "12px",
                          color: "#6b7280",
                          marginTop: "4px",
                        }}
                      >
                        SKU: {item.sku}
                      </p>
                    )}
                  </td>
                  <td
                    style={{
                      padding: "12px 16px",
                      textAlign: "center",
                      fontSize: "14px",
                      color: "#4b5563",
                    }}
                  >
                    {item.quantity}
                  </td>
                  <td
                    style={{
                      padding: "12px 16px",
                      textAlign: "right",
                      fontSize: "14px",
                      color: "#4b5563",
                    }}
                  >
                    ₹{item.price?.toFixed(2)}
                  </td>
                  <td
                    style={{
                      padding: "12px 16px",
                      textAlign: "right",
                      fontWeight: "600",
                      fontSize: "14px",
                      color: "#1f2937",
                    }}
                  >
                    ₹{item.total?.toFixed(2)}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* SUMMARY */}
      <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: "32px" }}>
        <div style={{ width: "320px" }}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              padding: "8px 0",
              fontSize: "14px",
            }}
          >
            <span style={{ color: "#4b5563" }}>Subtotal:</span>
            <span style={{ fontWeight: "600", color: "#1f2937" }}>
              ₹{order.subtotal?.toFixed(2)}
            </span>
          </div>

          {order.discount > 0 && (
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                padding: "8px 0",
                fontSize: "14px",
              }}
            >
              <span style={{ color: "#4b5563" }}>Discount:</span>
              <span style={{ fontWeight: "600", color: "#dc2626" }}>
                - ₹{order.discount?.toFixed(2)}
              </span>
            </div>
          )}

          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              padding: "8px 0",
              fontSize: "14px",
            }}
          >
            <span style={{ color: "#4b5563" }}>Delivery Charge:</span>
            <span style={{ fontWeight: "600", color: "#1f2937" }}>
              {order.deliveryCharge > 0
                ? `₹${order.deliveryCharge?.toFixed(2)}`
                : "FREE"}
            </span>
          </div>

          {order.tax > 0 && (
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                padding: "8px 0",
                fontSize: "14px",
              }}
            >
              <span style={{ color: "#4b5563" }}>Tax (GST):</span>
              <span style={{ fontWeight: "600", color: "#1f2937" }}>
                ₹{order.tax?.toFixed(2)}
              </span>
            </div>
          )}

          <div style={{ borderTop: "2px solid #d1d5db", marginTop: "8px", paddingTop: "8px" }}>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                padding: "8px 0",
              }}
            >
              <span style={{ fontSize: "18px", fontWeight: "700", color: "#1f2937" }}>
                Total Amount:
              </span>
              <span style={{ fontSize: "18px", fontWeight: "700", color: "#5a4a2e" }}>
                ₹{order.totalAmount?.toFixed(2)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* PAYMENT INFO */}
      <div
        style={{
          backgroundColor: "#f9fafb",
          padding: "16px",
          borderRadius: "8px",
          marginBottom: "32px",
        }}
      >
        <h3
          style={{
            fontSize: "18px",
            fontWeight: "600",
            color: "#1f2937",
            marginBottom: "12px",
          }}
        >
          Payment Information
        </h3>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "16px",
            fontSize: "14px",
          }}
        >
          <div>
            <p style={{ color: "#4b5563" }}>
              <span style={{ fontWeight: "600" }}>Payment Method:</span>{" "}
              {order.paymentMethod?.toUpperCase()}
            </p>
            <p style={{ color: "#4b5563", marginTop: "4px" }}>
              <span style={{ fontWeight: "600" }}>Payment Status:</span>{" "}
              <span
                style={{
                  fontWeight: "600",
                  color: order.isPaid ? "#16a34a" : "#ea580c",
                }}
              >
                {order.isPaid ? "PAID" : order.paymentStatus?.toUpperCase()}
              </span>
            </p>
          </div>
          {order.razorpayPaymentId && (
            <div>
              <p style={{ color: "#4b5563" }}>
                <span style={{ fontWeight: "600" }}>Payment ID:</span>{" "}
                {order.razorpayPaymentId}
              </p>
              {order.paidAt && (
                <p style={{ color: "#4b5563", marginTop: "4px" }}>
                  <span style={{ fontWeight: "600" }}>Paid On:</span>{" "}
                  {formatDate(order.paidAt)}
                </p>
              )}
            </div>
          )}
        </div>
      </div>

      {/* FOOTER */}
      <div
        style={{
          borderTop: "2px solid #d1d5db",
          paddingTop: "24px",
          marginTop: "32px",
        }}
      >
        <div style={{ textAlign: "center", fontSize: "14px", color: "#4b5563" }}>
          <p style={{ fontWeight: "600", color: "#1f2937", marginBottom: "8px" }}>
            Thank you for shopping with Vasan Vastra!
          </p>
          <p>For any queries, please contact us at info@vasanwears.com.com</p>
          <p style={{ marginTop: "8px", fontSize: "12px", color: "#6b7280" }}>
            This is a computer-generated invoice and does not require a signature.
          </p>
        </div>
      </div>

      {/* TERMS & CONDITIONS */}
      <div
        style={{
          marginTop: "24px",
          fontSize: "12px",
          color: "#6b7280",
          borderTop: "1px solid #e5e7eb",
          paddingTop: "16px",
        }}
      >
        <h4 style={{ fontWeight: "600", color: "#374151", marginBottom: "8px" }}>
          Terms & Conditions:
        </h4>
        <ul style={{ listStyleType: "disc", paddingLeft: "20px", lineHeight: "1.6" }}>
          <li>All sales are final unless the product is defective or damaged.</li>
          <li>Returns and exchanges are subject to our return policy.</li>
          <li>Custom designed products are non-returnable.</li>
          <li>Please check the products upon delivery and report any issues within 48 hours.</li>
        </ul>
      </div>
    </div>
  );
};

export default React.forwardRef((props, ref) => (
  <Invoice {...props} ref={ref} />
));
