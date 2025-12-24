import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getAllProductsAdminApi } from "../../../utils/adminApi";

const AdminProductList = () => {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const res = await getAllProductsAdminApi();
      console.log("Res ", res);
      
      setProducts(res.data); // ✅ API structure
    } catch (error) {
      console.error("Failed to fetch products", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="p-6">Loading products...</div>;
  }

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
          {products?.map((product) => {
            // ✅ Handle variant/simple products
            const price =
               product.variants?.[0]?.salePrice ??
                  product.variants?.[0]?.regularPrice
                

            const stock =product.variants?.reduce(
                    (total, v) => total + (v.stock || 0),
                    0
                  )

            return (
              <tr key={product._id} className="border-b">
                {/* PRODUCT INFO */}
                <td className="p-3 flex items-center gap-3">
                  <img
                    src={product.featuredImage}
                    className="w-12 h-12 rounded object-cover"
                    alt={product.title}
                  />
                  <div>
                    <p className="font-medium">{product.title}</p>
                    <span className="text-xs text-gray-500">
                      {product.category?.name} / {product.subCategory?.name}
                    </span>
                  </div>
                </td>

                {/* PRICE */}
                <td>₹{price ?? "-"}</td>

                {/* STOCK */}
                <td>{stock ?? "-"}</td>

                {/* STATUS */}
                <td>
                  <span
                    className={`px-2 py-1 text-xs rounded ${
                      product.status === "published"
                        ? "bg-green-100 text-green-700"
                        : "bg-yellow-100 text-yellow-700"
                    }`}
                  >
                    {product.status}
                  </span>
                </td>

                {/* ACTION */}
                <td>
                  <button
                    onClick={() =>
                      navigate(`/admin/products/${product.slug}/edit`)
                    }
                    className="text-blue-600 hover:underline"
                  >
                    Edit
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default AdminProductList;
