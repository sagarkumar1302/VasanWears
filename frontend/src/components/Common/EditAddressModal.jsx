import React, { useState } from "react";
import { RiCloseLine, RiMapPinLine } from "@remixicon/react";

const EditAddressInline = ({ data, onCancel, onSave, onDelete }) => {
  const [form, setForm] = useState({ ...data });

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  return (
    <div className="bg-primary3/20 border-t p-6 border-primary2/10">
      <h3 className="font-semibold mb-4">EDIT ADDRESS</h3>

      {/* FORM */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <input
          name="name"
          value={form.name}
          onChange={handleChange}
          className="border px-3 py-2 rounded"
          placeholder="Name"
        />

        <input
          name="phone"
          value={form.phone}
          onChange={handleChange}
          className="border px-3 py-2 rounded"
          placeholder="Phone"
        />

        <textarea
          name="address"
          value={form.address}
          onChange={handleChange}
          className="border px-3 py-2 rounded col-span-2"
          placeholder="Address"
        />
      </div>

      {/* ADDRESS TYPE */}
      <div className="flex gap-6 mt-4">
        <label className="flex items-center gap-2">
          <input
            type="radio"
            checked={form.type === "HOME"}
            onChange={() => setForm({ ...form, type: "HOME" })}
          />
          Home
        </label>

        <label className="flex items-center gap-2">
          <input
            type="radio"
            checked={form.type === "WORK"}
            onChange={() => setForm({ ...form, type: "WORK" })}
          />
          Work
        </label>
      </div>

      {/* ACTION BUTTONS */}
      <div className="flex justify-between items-center mt-6">
        {/* DELETE */}
        <button
          onClick={() => onDelete(form.id)}
          className="bg-red-500 text-white font-medium hover:bg-red-600 cursor-pointer py-2 px-3 rounded-lg"
        >
          Delete Address
        </button>

        {/* RIGHT SIDE */}
        <div className="flex gap-4">
          <button onClick={onCancel} className="py-2.5 px-8 rounded-xl font-semibold text-primary2 
             transition-all duration-300 btn-slide md:text-base text-sm flex items-center justify-center gap-1 cursor-pointer">Cancel</button>

          <button
            onClick={() => onSave(form)}
            className="py-2.5 px-8 rounded-xl font-semibold text-primary3 
             transition-all duration-300 btn-slide2 md:text-base text-sm flex items-center justify-center gap-1 cursor-pointer"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditAddressInline;
