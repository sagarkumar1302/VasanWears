import React, { useState } from "react";
import { useAuthStore } from "../../store/useAuthStore";
import { RiEdit2Line, RiCheckLine, RiCloseLine, RiCameraLine } from "@remixicon/react";
import { updateUserProfileApi } from "../../utils/userApi";
import toast from "react-hot-toast";
import default_female_avatar from "../../../public/images/female_default_avatar.png";
import default_male_avatar from "../../../public/images/male_default_avatar.png";

const ProfileInformation = () => {
  const user = useAuthStore((state) => state.user);
  const setUser = useAuthStore((state) => state.setUser);

  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(null);

  // Local editable form
  const [form, setForm] = useState({
    fullName: user?.fullName || "",
    gender: user?.gender || "male",
    email: user?.email || "",
    phoneNumber: user?.phoneNumber || "",
  });

  const onChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith("image/")) {
        toast.error("Please select an image file");
        return;
      }
      
      // Validate file size (5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast.error("Image size should be less than 5MB");
        return;
      }

      setAvatarFile(file);
      setAvatarPreview(URL.createObjectURL(file));
    }
  };

  const saveChanges = async () => {
    try {
      setLoading(true);
      
      const formData = new FormData();
      formData.append("fullName", form.fullName);
      formData.append("gender", form.gender);
      formData.append("phoneNumber", form.phoneNumber);
      
      if (avatarFile) {
        formData.append("avatar", avatarFile);
      }

      const response = await updateUserProfileApi(formData);
      setUser(response.data);
      
      toast.success("Profile updated successfully");
      setEditing(false);
      setAvatarFile(null);
      setAvatarPreview(null);
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.message || "Failed to update profile");
    } finally {
      setLoading(false);
    }
  };

  const cancelEdit = () => {
    setForm({
      fullName: user?.fullName || "",
      gender: user?.gender || "male",
      email: user?.email || "",
      phoneNumber: user?.phoneNumber || "",
    });
    setEditing(false);
    setAvatarFile(null);
    setAvatarPreview(null);
  };

  return (
    <div className="space-y-10">
      {/* ===========================
          AVATAR SECTION
      ============================ */}
      <div className="flex flex-col items-center">
        <div className="relative">
          <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-primary5">
            {avatarPreview ? (
              <img
                src={avatarPreview}
                alt="Avatar Preview"
                className="w-full h-full object-cover"
              />
            ) : user?.avatar ? (
              <img
                src={user.avatar}
                alt={user.fullName}
                className="w-full h-full object-cover"
              />
            ) : (
              <img
                src={
                  user?.gender === "male"
                    ? default_male_avatar
                    : default_female_avatar
                }
                alt={user?.fullName}
                className="w-full h-full object-cover object-top"
              />
            )}
          </div>
          
          {editing && (
            <label
              htmlFor="avatar-upload"
              className="absolute bottom-0 right-0 bg-primary5 text-white p-2 rounded-full cursor-pointer hover:bg-primary4 transition"
            >
              <RiCameraLine size={20} />
              <input
                id="avatar-upload"
                type="file"
                accept="image/*"
                onChange={handleAvatarChange}
                className="hidden"
              />
            </label>
          )}
        </div>
        {editing && (
          <p className="text-xs text-gray-500 mt-2">
            Click camera icon to change avatar
          </p>
        )}
      </div>

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
                disabled={loading}
                className="py-2.5 px-8 rounded-xl font-semibold text-primary2 
             transition-all duration-300 btn-slide md:text-base text-sm flex items-center justify-center gap-1 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? "Saving..." : "Save"}
              </button>
              <button
                onClick={cancelEdit}
                disabled={loading}
                className="py-2.5 px-8 rounded-xl font-semibold text-primary3 
             transition-all duration-300 btn-slide2 md:text-base text-sm flex items-center justify-center gap-1 cursor-pointer disabled:opacity-50"
              >
                Cancel
              </button>
            </div>
          ) : (
            <button
              onClick={() => setEditing(true)}
              className="py-2.5 px-8 rounded-xl font-semibold text-primary2 
             transition-all duration-300 btn-slide md:text-base text-sm flex items-center justify-center gap-1 cursor-pointer"
            >
              <RiEdit2Line size={20} /> Edit
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 gap-4">
          {/* Full Name */}
          <div>
            <label className="block mb-1 font-medium">Full Name</label>
            <input
              type="text"
              name="fullName"
              value={form.fullName}
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

            <label className="flex items-center gap-2">
              <input
                type="radio"
                name="gender"
                value="other"
                checked={form.gender === "other"}
                disabled={!editing}
                onChange={onChange}
              />
              Other
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
          readOnly
          className="w-full border rounded-md px-3 py-2 bg-gray-100 cursor-not-allowed"
        />
        <p className="text-xs text-gray-500 mt-1">Email cannot be changed</p>
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
          name="phoneNumber"
          value={form.phoneNumber}
          readOnly={!editing}
          onChange={onChange}
          placeholder="Enter 10-digit mobile number"
          maxLength={10}
          className={`w-full border rounded-md px-3 py-2 ${
            editing ? "bg-white border-primary5" : "bg-gray-100"
          }`}
        />
      </div>
    </div>
  );
};

export default ProfileInformation;
