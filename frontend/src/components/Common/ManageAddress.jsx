import React, { useState } from "react";
import { RiAddLine, RiMore2Fill } from "@remixicon/react";
import EditAddressInline from "./EditAddressModal";

const EMPTY_ADDRESS = {
  id: null,
  type: "HOME",
  name: "",
  phone: "",
  address: "",
};

const ManageAddress = () => {
  const [addresses, setAddresses] = useState([
    {
      id: 1,
      type: "WORK",
      name: "Sagar Kumar",
      phone: "8083151022",
      address:
        "Graphic Era Hill University Bhimtal Nanital Old Boys Hostel CG-3, Nainital Subdistrict, Bhimtaal, Uttarakhand - 263156",
    },
    {
      id: 2,
      type: "HOME",
      name: "Sagar Kumar",
      phone: "8083151022",
      address:
        "Haridas Lane Chatterji Durga Bari, Opp of Quasmia Madarsa, Durga Bari, Gaya, Bihar - 823001",
    },
  ]);

  const [editingId, setEditingId] = useState(null);

  const handleSave = (data) => {
    if (editingId === "new") {
      setAddresses((prev) => [
        ...prev,
        { ...data, id: Date.now() },
      ]);
    } else {
      setAddresses((prev) =>
        prev.map((a) => (a.id === data.id ? data : a))
      );
    }
    setEditingId(null);
  };

  const handleDelete = (id) => {
    setAddresses((prev) => prev.filter((a) => a.id !== id));
    setEditingId(null);
  };

  return (
    <div className="mx-auto">
      {/* HEADER */}
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-xl font-semibold">Manage Addresses</h3>

        <button
          onClick={() => setEditingId("new")}
          className="md:px-6 px-2 py-2 border rounded-xl border-primary1/50 cursor-pointer hover:bg-primary2 hover:text-white transition-all duration-500 hover:border-primary2 flex gap-3 items-center text-sm"
        >
          <RiAddLine /> <span>Add New Address</span>
        </button>
      </div>

      {/* ADD NEW ADDRESS INLINE */}
      {editingId === "new" && (
        <div className="border rounded-lg mb-4 overflow-hidden">
          <EditAddressInline
            data={EMPTY_ADDRESS}
            onCancel={() => setEditingId(null)}
            onSave={handleSave}
          />
        </div>
      )}

      {/* ADDRESS LIST */}
      <div className="space-y-4">
        {addresses.map((item) => (
          <div key={item.id} className="border rounded-xl overflow-hidden border-primary2/12">
            {/* Address Card */}
            <div className="p-4 relative">
              <span className="px-3 py-1 text-xs bg-primary1  rounded">
                {item.type}
              </span>

              <div className="flex justify-between mt-2">
                <p className="font-medium">{item.name}</p>
                <p>{item.phone}</p>
              </div>

              <p className="text-primary5 text-sm mt-1">{item.address}</p>

              <RiMore2Fill
                className="absolute right-4 top-4 cursor-pointer"
                onClick={() =>
                  setEditingId(editingId === item.id ? null : item.id)
                }
              />
            </div>

            {/* INLINE EDIT */}
            <div
              className={`transition-all duration-300 overflow-hidden ${
                editingId === item.id
                  ? "max-h-[900px] opacity-100"
                  : "max-h-0 opacity-0"
              }`}
            >
              <EditAddressInline
                data={item}
                onCancel={() => setEditingId(null)}
                onSave={handleSave}
                onDelete={handleDelete}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ManageAddress;
