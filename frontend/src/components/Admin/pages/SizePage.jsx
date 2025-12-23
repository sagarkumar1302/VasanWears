import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";

import { createSizeApi, deleteSizeApi, getAllSizesApi, updateSizesApi } from "../../../utils/productApi";

const SizePage = () => {
  const [sizes, setSizes] = useState([]);
  const [name, setName] = useState("");
  const [editingId, setEditingId] = useState(null);

  /* ================= FETCH ================= */
  const fetchSizes = async () => {
    const res = await getAllSizesApi();
    setSizes(res.data);
  };

  useEffect(() => {
    fetchSizes();
  }, []);

  /* ================= HANDLERS ================= */
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name) return toast.error("Size required");

    try {
      if (editingId) {
        await updateSizesApi(editingId, { name });
        toast.success("Size updated");
      } else {
        await createSizeApi({ name });
        toast.success("Size created");
      }

      setName("");
      setEditingId(null);
      fetchSizes();
    } catch {
      toast.error("Operation failed");
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Delete this size?")) return;

    await deleteSizeApi(id);
    toast.success("Size deleted");
    fetchSizes();
  };

  /* ================= UI ================= */
  return (
    <div className="p-6 bg-white rounded-xl shadow">
      <h1 className="text-xl font-semibold mb-4">Sizes</h1>

      <form onSubmit={handleSubmit} className="flex gap-3 mb-6">
        <input
          placeholder="Size (S, M, L, XL)"
          className="border p-2 rounded w-48"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />

        <button className="bg-primary5 text-white px-4 rounded">
          {editingId ? "Update" : "Add"}
        </button>

        {editingId && (
          <button
            type="button"
            onClick={() => {
              setEditingId(null);
              setName("");
            }}
            className="border px-4 rounded"
          >
            Cancel
          </button>
        )}
      </form>

      <table className="w-full text-sm">
        <thead className="bg-gray-100">
          <tr>
            <th className="p-2 text-left">Size</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {sizes.map((size) => (
            <tr key={size._id} className="border-b">
              <td className="p-2">{size.name}</td>
              <td className="text-right space-x-2">
                <button
                  onClick={() => {
                    setEditingId(size._id);
                    setName(size.name);
                  }}
                  className="text-blue-600"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(size._id)}
                  className="text-red-600"
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default SizePage;
