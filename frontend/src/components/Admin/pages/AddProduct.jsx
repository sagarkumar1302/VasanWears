import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

const AddProduct = () => {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    title: "",
    description: "",
    price: "",
    stock: "",
    category: "",
    status: "Draft",
    image: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // Dummy validation
    if (!form.title || !form.price) {
      toast.error("Product title and price are required");
      return;
    }

    // Dummy API delay
    toast.loading("Creating product...");
    setTimeout(() => {
      toast.dismiss();
      toast.success("Product created successfully!");

      // Redirect to all products
      navigate("/admin/products");
    }, 1200);
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="p-6 grid grid-cols-1 lg:grid-cols-3 gap-6"
    >
      {/* LEFT SIDE (MAIN CONTENT) */}
      <div className="lg:col-span-2 bg-white rounded-xl shadow p-5">
        <h1 className="text-xl font-semibold mb-4">Add New Product</h1>

        <div className="space-y-4">
          <input
            type="text"
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
            type="number"
            name="price"
            value={form.price}
            onChange={handleChange}
            className="w-full border p-2 rounded"
            placeholder="Price (₹)"
          />

          <input
            type="text"
            name="category"
            value={form.category}
            onChange={handleChange}
            className="w-full border p-2 rounded"
            placeholder="Category (e.g. T-Shirts)"
          />
        </div>
      </div>

      {/* RIGHT SIDE (SIDEBAR LIKE WORDPRESS) */}
      <div className="bg-white rounded-xl shadow p-5 space-y-4">
        <h2 className="font-semibold">Product Data</h2>

        <input
          type="number"
          name="stock"
          value={form.stock}
          onChange={handleChange}
          className="w-full border p-2 rounded"
          placeholder="Stock Quantity"
        />

        <select
          name="status"
          value={form.status}
          onChange={handleChange}
          className="w-full border p-2 rounded"
        >
          <option value="Published">Published</option>
          <option value="Draft">Draft</option>
        </select>

        <input
          type="text"
          name="image"
          value={form.image}
          onChange={handleChange}
          className="w-full border p-2 rounded"
          placeholder="Image URL (dummy)"
        />

        <button
          type="submit"
          className="w-full bg-primary5 text-white py-2 rounded hover:bg-primary4"
        >
          Publish Product
        </button>

        <button
          type="button"
          onClick={() => navigate("/admin/products")}
          className="w-full border py-2 rounded"
        >
          Cancel
        </button>
      </div>
    </form>
  );
};

export default AddProduct;
