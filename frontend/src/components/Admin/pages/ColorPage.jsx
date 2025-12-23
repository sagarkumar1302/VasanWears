import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { createColorApi, deleteColorApi, getAllColorsApi, updateColorsApi } from "../../../utils/productApi";

 // axios instance

const ColorPage = () => {
  const [colors, setColors] = useState([]);
  const [form, setForm] = useState({
    name: "",
    hexCode: "#000000",
  });
  const [editingId, setEditingId] = useState(null);

  /* ================= FETCH COLORS ================= */
  const fetchColors = async () => {
    try {
      const res = await getAllColorsApi();
      setColors(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchColors();
  }, []);

  /* ================= HANDLERS ================= */
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.name || !form.hexCode) {
      toast.error("Name and color are required");
      return;
    }

    try {
      if (editingId) {
        await updateColorsApi(editingId, form);
        toast.success("Color updated");
      } else {
        await createColorApi(form);
        toast.success("Color created");
      }

      setForm({ name: "", hexCode: "#000000" });
      setEditingId(null);
      fetchColors();
    } catch {
      toast.error("Operation failed");
    }
  };

  const handleEdit = (color) => {
    setForm({ name: color.name, hexCode: color.hexCode });
    setEditingId(color._id);
  };

  const handleDelete = async (id) => {
    if (!confirm("Delete this color?")) return;

    try {
      await deleteColorApi(id);
      toast.success("Color deleted");
      fetchColors();
    } catch {
      toast.error("Delete failed");
    }
  };

  /* ================= UI ================= */
  return (
    <div className="p-6 bg-white rounded-xl shadow">
      <h1 className="text-xl font-semibold mb-4">Colors</h1>

      {/* CREATE / UPDATE */}
      <form onSubmit={handleSubmit} className="flex gap-3 mb-6">
        <input
          placeholder="Color name"
          className="border p-2 rounded w-48"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
        />

        <input
          type="color"
          value={form.hexCode}
          onChange={(e) => setForm({ ...form, hexCode: e.target.value })}
          className="w-12 h-10 p-1 border rounded"
        />

        <button className="bg-primary5 text-white px-4 rounded">
          {editingId ? "Update" : "Add"}
        </button>

        {editingId && (
          <button
            type="button"
            onClick={() => {
              setEditingId(null);
              setForm({ name: "", hexCode: "#000000" });
            }}
            className="border px-4 rounded"
          >
            Cancel
          </button>
        )}
      </form>

      {/* LIST */}
      <table className="w-full text-sm">
        <thead className="bg-gray-100">
          <tr>
            <th className="p-2 text-left">Color</th>
            <th>Preview</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {colors.map((color) => (
            <tr key={color._id} className="border-b">
              <td className="p-2">{color.name}</td>
              <td>
                <div
                  className="w-6 h-6 rounded border"
                  style={{ background: color.hexCode }}
                />
              </td>
              <td className="space-x-2 text-right">
                <button
                  onClick={() => handleEdit(color)}
                  className="text-blue-600"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(color._id)}
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

export default ColorPage;
