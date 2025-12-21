import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { dummyProducts } from "../data/dummyProducts";

const EditProduct = () => {
  const { productId } = useParams();
  const navigate = useNavigate();

  const product = dummyProducts.find((p) => p.id === Number(productId));
  const [form, setForm] = useState(product);

  if (!product) {
    return <p className="p-6">Product not found</p>;
  }

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  const handleSave = () => {
    alert("Product saved (dummy)");
    navigate("/admin/products");
  };

  return (
    <div className="p-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* LEFT: MAIN CONTENT */}
      <div className="lg:col-span-2 bg-white rounded-xl shadow p-5">
        <h1 className="text-xl font-semibold mb-4">
          Edit Product – {form.title}
        </h1>

        <div className="space-y-4">
          <input
            name="title"
            value={form.title}
            onChange={handleChange}
            className="w-full border p-2 rounded"
            placeholder="Product Title"
          />

          <textarea
            name="description"
            value={form.description}
            onChange={handleChange}
            rows="6"
            className="w-full border p-2 rounded"
            placeholder="Product Description"
          />

          <input
            name="price"
            type="number"
            value={form.price}
            onChange={handleChange}
            className="w-full border p-2 rounded"
            placeholder="Price"
          />
        </div>
      </div>

      {/* RIGHT: SIDEBAR (like WordPress) */}
      <div className="bg-white rounded-xl shadow p-5 space-y-4">
        <h2 className="font-semibold">Product Data</h2>

        <input
          name="stock"
          type="number"
          value={form.stock}
          onChange={handleChange}
          className="w-full border p-2 rounded"
          placeholder="Stock"
        />

        <select
          name="status"
          value={form.status}
          onChange={handleChange}
          className="w-full border p-2 rounded"
        >
          <option>Published</option>
          <option>Draft</option>
        </select>

        <button
          onClick={handleSave}
          className="w-full bg-primary5 text-white py-2 rounded"
        >
          Update Product
        </button>

        <button
          onClick={() => navigate("/admin/products")}
          className="w-full border py-2 rounded"
        >
          Cancel
        </button>
      </div>
    </div>
  );
};

export default EditProduct;
