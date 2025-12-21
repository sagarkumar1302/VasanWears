import React from "react";
import { useNavigate } from "react-router-dom";
import { dummyProducts } from "../data/dummyProducts";

const AdminProductList = () => {
  const navigate = useNavigate();

  return (
    <div className="p-6 bg-white rounded-xl shadow">
      <h1 className="text-2xl font-semibold mb-4">All Products</h1>

      <table className="w-full text-sm">
        <thead className="bg-gray-100">
          <tr>
            <th className="p-3 text-left">Product</th>
            <th>Price</th>
            <th>Stock</th>
            <th>Status</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {dummyProducts.map((product) => (
            <tr key={product.id} className="border-b">
              <td className="p-3 flex items-center gap-3">
                <img src={product.image} className="w-12 h-12 rounded" alt="" />
                <div>
                  <p className="font-medium">{product.title}</p>
                  <span className="text-xs text-gray-500">
                    {product.category}
                  </span>
                </div>
              </td>
              <td>₹{product.price}</td>
              <td>{product.stock}</td>
              <td>
                <span
                  className={`px-2 py-1 text-xs rounded ${
                    product.status === "Published"
                      ? "bg-green-100 text-green-700"
                      : "bg-yellow-100 text-yellow-700"
                  }`}
                >
                  {product.status}
                </span>
              </td>
              <td>
                <button
                  onClick={() =>
                    navigate(`/admin/products/${product.id}/edit`)
                  }
                  className="text-blue-600 hover:underline"
                >
                  Edit
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default AdminProductList;
