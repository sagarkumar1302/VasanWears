import React, { useState } from "react";
import { RiStarLine, RiDownloadLine, RiStarFill } from "@remixicon/react";
import { Link, useNavigate } from "react-router-dom";
const ordersData = [
  {
    id: 1,
    title: "Khusbu Traders 21 cm Glow in the Dark Stars Wall",
    image: "/images/htw2.jpg",
    price: 132,
    deliveredOn: "Oct 15",
    color: "Green",
    size: "21",
    address: "Haridas Chatterji Lane, Durga Bari, Gaya, Bihar - 823001",
    user: "Sourav",
    phone: "8083151022, 7667908935",
    payment: "Flipkart Wallet, UPI",
  },
  {
    id: 2,
    title: "Asian Tarzan-11 Sneakers",
    image: "/images/hiw1.jpeg",
    price: 671,
    deliveredOn: "Oct 14",
    color: "White, Blue",
    size: "9",
  },
];

const Orders = () => {
  const [activeOrder, setActiveOrder] = useState(ordersData[0]);
  const navigate = useNavigate();
  return (
    <div className="">
      <div className="mx-auto gap-6">
        <h3 className="text-xl font-semibold mb-4">Orders History</h3>

        {/* LEFT: ORDER LIST */}
        <div className="md:col-span-2 space-y-4">
          {ordersData.map((order) => (
            <div
              key={order.id}
              onClick={() => navigate(`${order.id}`)}
              className={`bg-white p-4 rounded-xl border cursor-pointer hover:shadow border-primary2/10`}
            >
              <div className="flex gap-4">
                <img
                  src={order.image}
                  alt=""
                  className="w-20 h-20 object-cover rounded"
                />

                <div className="flex gap-4 w-full md:flex-row flex-col">
                  <div className="flex-1">
                    <h3 className="font-medium text-sm product-title">{order.title}</h3>

                    <p className="text-xs text-gray-500 mt-1">
                      Color: {order.color} | Size: {order.size}
                    </p>

                    <p className="font-semibold mt-2">₹{order.price}</p>
                  </div>

                  <div className="text-sm md:text-right">
                    <p className="text-primary2  font-semibold">
                      Delivered on {order.deliveredOn}
                    </p>

                    <Link
                      to="/shop/1/premium-crewneck-sweatshirt#review"
                      onClick={(e) => e.stopPropagation()}
                      className="text-primary5 text-sm mt-2 flex items-center gap-1 z-30"
                    >
                      <RiStarFill size={15} /> Rate & Review Product
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* RIGHT: ORDER DETAILS */}
      </div>
    </div>
  );
};

export default Orders;
