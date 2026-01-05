const getProductSummaryHtml = (items = []) => {
  if (!items.length) return "";

  const firstItem = items[0];

  const name =
    firstItem.itemType === "catalog"
      ? firstItem.product?.title
      : firstItem.design?.title || "Custom Product";

  const size =
    firstItem.itemType === "catalog"
      ? firstItem.size?.name
      : firstItem.design?.size?.name;

  const color =
    firstItem.itemType === "catalog"
      ? firstItem.color?.name
      : firstItem.design?.color?.name;

  const extraCount = items.length - 1;

  return `
    <div style="margin-top:12px;">
      <p style="margin:0;">
        <b>Item:</b> ${name}
      </p>
      ${
        size || color
          ? `<p style="margin:4px 0 0 0; color:#555;">
              ${size ? `Size: ${size}` : ""}
              ${size && color ? " | " : ""}
              ${color ? `Color: ${color}` : ""}
            </p>`
          : ""
      }
      ${
        extraCount > 0
          ? `<p style="margin:4px 0 0 0; color:#777;">
              + ${extraCount} more item(s)
            </p>`
          : ""
      }
    </div>
  `;
};

export const getOrderStatusEmailContent = ({ order, user, status }) => {
  const orderCard = `
    <div style="
      border:1px solid #e5e7eb;
      border-radius:8px;
      padding:16px;
      background:#ffffff;
      margin-top:16px;
    ">
      <p style="margin:0 0 8px 0;">
        <b>Order ID:</b> ${order._id}
      </p>

      <p style="margin:0 0 8px 0;">
        <b>Amount:</b>
        <span style="color:#0A3FFF; font-weight:600;">
          ₹${order.totalAmount}
        </span>
      </p>

      <p style="margin:0 0 8px 0;">
        <b>Payment Method:</b> ${order.paymentMethod}
      </p>
      ${getProductSummaryHtml(order.items)}
      ${
        order.estimatedDelivery
          ? `<p style="margin:0 0 8px 0;">
              <b>Delivery by:</b>
              ${new Date(order.estimatedDelivery).toDateString()}
            </p>`
          : ""
      }

      <hr style="border:none;border-top:1px solid #eee;margin:12px 0;" />

      <p style="margin:0 0 6px 0;">
        <b>Courier:</b> ${order.courierName || "—"}
      </p>

      <p style="margin:0;">
        <b>Tracking ID:</b> ${order.trackingId || "—"}
      </p>
    </div>
  `;

  /* ================= SHIPPED ================= */
  if (status === "SHIPPED") {
    return {
      user: {
        subject: "Your order is on the way 🚚 | VasanWears",
        title: `Hi ${user.fullName},`,
        message: `
          <p>Your order has been <b>shipped</b> and is on its way to you.</p>
          ${orderCard}
        `,
      },
      admin: {
        subject: "Order Shipped | VasanWears Admin",
        title: "Order Shipped 🚚",
        message: `
          <p>The following order has been shipped:</p>
          ${orderCard}
          <p><b>Customer:</b> ${user.fullName} (${user.email})</p>
        `,
      },
    };
  }

  /* ================= DELIVERED ================= */
  if (status === "DELIVERED") {
    return {
      user: {
        subject: "Order Delivered 🎉 | VasanWears",
        title: `Hi ${user.fullName},`,
        message: `
          <p>Your order has been <b>successfully delivered</b>.</p>
          ${orderCard}
          <p style="margin-top:16px;">
            We hope you love your purchase ❤️<br/>
            Thank you for shopping with <b>VasanWears</b>.
          </p>
        `,
      },
      admin: {
        subject: "Order Delivered | VasanWears Admin",
        title: "Order Delivered 🎉",
        message: `
          <p>The following order has been delivered:</p>
          ${orderCard}
          <p>
            <b>Customer:</b> ${user.fullName} (${user.email})<br/>
            <b>Delivered At:</b> ${new Date().toLocaleString("en-IN")}
          </p>
        `,
      },
    };
  }

  /* ================= CANCELLED ================= */
  if (status === "CANCELLED") {
    return {
      user: {
        subject: "Your order has been cancelled ❌ | VasanWears",
        title: `Hi ${user.fullName},`,
        message: `
          <p>
            Your order has been <b>cancelled</b>.
          </p>
          ${orderCard}
          ${
            order.cancellationReason
              ? `<p><b>Reason:</b> ${order.cancellationReason}</p>`
              : ""
          }
          <p>
            If any refund is applicable, it will be processed as per our policy.
          </p>
        `,
      },
      admin: {
        subject: "Order Cancelled | VasanWears Admin",
        title: "Order Cancelled ❌",
        message: `
          <p>The following order has been cancelled:</p>
          ${orderCard}
          <p>
            <b>Customer:</b> ${user.fullName} (${user.email})<br/>
            <b>Reason:</b> ${order.cancellationReason || "—"}
          </p>
        `,
      },
    };
  }

  /* ================= RETURNED ================= */
  if (status === "RETURNED") {
    return {
      user: {
        subject: "Return initiated for your order 🔄 | VasanWears",
        title: `Hi ${user.fullName},`,
        message: `
          <p>
            Your order has been <b>returned</b>.
          </p>
          ${orderCard}
          <p>
            Once the returned item is verified, any eligible refund will be processed.
          </p>
        `,
      },
      admin: {
        subject: "Order Returned | VasanWears Admin",
        title: "Order Returned 🔄",
        message: `
          <p>The following order has been returned:</p>
          ${orderCard}
          <p>
            <b>Customer:</b> ${user.fullName} (${user.email})<br/>
            <b>Returned At:</b> ${
              order.returnedAt
                ? new Date(order.returnedAt).toLocaleString("en-IN")
                : new Date().toLocaleString("en-IN")
            }
          </p>
        `,
      },
    };
  }

  return null;
};
