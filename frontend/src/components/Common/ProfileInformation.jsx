import React, { useState } from "react";
import { useAuthStore } from "../../store/useAuthStore";
import { RiEdit2Line, RiCheckLine, RiCloseLine } from "@remixicon/react";
import { updateProfileApi } from "../../utils/api"; // <-- use your API endpoint

const ProfileInformation = () => {
  const user = useAuthStore((state) => state.user);
  const setUser = useAuthStore((state) => state.setUser); // to update store after save

  const [editing, setEditing] = useState(false);

  // Local editable form
  const [form, setForm] = useState({
    firstName: user?.fullName?.split(" ")[0] || "",
    lastName: user?.fullName?.split(" ")[1] || "",
    gender: user?.gender || "",
    email: user?.email || "",
    phone: user?.phone || "",
  });

  const onChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const saveChanges = async () => {
    try {
      const updatedUser = await updateProfileApi(form);
      setUser(updatedUser.data); // update zustand user
      setEditing(false);
    } catch (error) {
      console.error(error);
    }
  };

  const cancelEdit = () => {
    setForm({
      firstName: user?.fullName?.split(" ")[0] || "",
      lastName: user?.fullName?.split(" ")[1] || "",
      gender: user?.gender || "",
      email: user?.email || "",
      phone: user?.phone || "",
    });
    setEditing(false);
  };

  return (
    <div className="space-y-10">
      {/* ===========================
          PERSONAL INFORMATION
      ============================ */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">Personal Information</h2>

          {editing ? (
            <div className="flex gap-3">
              <button
                onClick={saveChanges}
                className="py-2.5 px-8 rounded-xl font-semibold text-primary2 
             transition-all duration-300 btn-slide md:text-base text-sm flex items-center justify-center gap-1 cursor-pointer"
              >
                 Save
              </button>
              <button
                onClick={cancelEdit}
                className="py-2.5 px-8 rounded-xl font-semibold text-primary3 
             transition-all duration-300 btn-slide2 md:text-base text-sm flex items-center justify-center gap-1 cursor-pointer"
              >
                 Cancel
              </button>
            </div>
          ) : (
            <button
              onClick={() => setEditing(true)}
              className=" py-2.5 px-8 rounded-xl font-semibold text-primary2 
             transition-all duration-300 btn-slide md:text-base text-sm flex items-center justify-center gap-1 cursor-pointer"
            >
              <RiEdit2Line size={20} /> Edit
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* First Name */}
          <div>
            <input
              type="text"
              name="firstName"
              value={form.firstName}
              readOnly={!editing}
              onChange={onChange}
              className={`w-full border rounded-md px-3 py-2 ${
                editing ? "bg-white border-primary5" : "bg-gray-100"
              }`}
            />
          </div>

          {/* Last Name */}
          <div>
            <input
              type="text"
              name="lastName"
              value={form.lastName}
              readOnly={!editing}
              onChange={onChange}
              className={`w-full border rounded-md px-3 py-2 ${
                editing ? "bg-white border-primary5" : "bg-gray-100"
              }`}
            />
          </div>
        </div>

        {/* Gender */}
        <div className="mt-4">
          <p className="mb-1 font-medium">Your Gender</p>

          <div className="flex gap-5">
            <label className="flex items-center gap-2">
              <input
                type="radio"
                name="gender"
                value="male"
                checked={form.gender === "male"}
                disabled={!editing}
                onChange={onChange}
              />
              Male
            </label>

            <label className="flex items-center gap-2">
              <input
                type="radio"
                name="gender"
                value="female"
                checked={form.gender === "female"}
                disabled={!editing}
                onChange={onChange}
              />
              Female
            </label>
          </div>
        </div>
      </div>

      {/* ===========================
          EMAIL
      ============================ */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <h3 className="font-semibold">Email Address</h3>
        </div>

        <input
          type="email"
          name="email"
          value={form.email}
          readOnly={!editing}
          onChange={onChange}
          className={`w-full border rounded-md px-3 py-2 ${
            editing ? "bg-white border-primary5" : "bg-gray-100"
          }`}
        />
      </div>

      {/* ===========================
          PHONE
      ============================ */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <h3 className="font-semibold">Mobile Number</h3>
        </div>

        <input
          type="text"
          name="phone"
          value={form.phone}
          readOnly={!editing}
          onChange={onChange}
          className={`w-full border rounded-md px-3 py-2 ${
            editing ? "bg-white border-primary5" : "bg-gray-100"
          }`}
        />
      </div>
    </div>
  );
};

export default ProfileInformation;
