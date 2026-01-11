import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import toast from "react-hot-toast";
import {
  createProductApi,
  deleteProductApi,
  getProductBySlugApi,
  updateProductApi,
  getAllColorsApi,
  getAllSizesApi
} from "../../../utils/productApi";

import {
  getAllUsersExceptAdminsApi,
  getAllCategoriesWithSubCatApi,
} from "../../../utils/adminApi";
import RichTextEditor from "../components/RichTextEditor";
const EditProduct = () => {
  const navigate = useNavigate();
  const { slug } = useParams();
  const [tags, setTags] = useState([]);
  const [tagInput, setTagInput] = useState("");
  const [editingIndex, setEditingIndex] = useState(null);
  const addTag = () => {
    const value = tagInput.trim().toLowerCase();
    if (!value) return;

    if (tags.includes(value)) {
      toast.error("Tag already exists");
      return;
    }

    setTags([...tags, value]);
    setTagInput("");
  };

  const removeTag = (index) => {
    setTags(tags.filter((_, i) => i !== index));
  };

  const startEditTag = (index) => {
    setEditingIndex(index);
    setTagInput(tags[index]);
  };

  const updateTag = () => {
    const value = tagInput.trim().toLowerCase();
    if (!value) return;

    const updated = [...tags];
    updated[editingIndex] = value;

    setTags(updated);
    setEditingIndex(null);
    setTagInput("");
  };

  const [availableColors, setAvailableColors] = useState([]);
  const [availableSizes, setAvailableSizes] = useState([]);
  const [users, setUsers] = useState([]);

  const [selectedColors, setSelectedColors] = useState([]);
  const [selectedSizes, setSelectedSizes] = useState([]);
  const [selectedCredit, setSelectedCredit] = useState("");
  useEffect(() => {
    fetchAttributes();
  }, []);

  const fetchAttributes = async () => {
    const [colorsRes, sizesRes, usersRes] = await Promise.all([
      getAllColorsApi(),
      getAllSizesApi(),
      getAllUsersExceptAdminsApi(),
    ]);

    setAvailableColors(colorsRes.data);
    setAvailableSizes(sizesRes.data);

    // Sort users by fullName and email
    console.log("Users ::",usersRes.data);
    
    const sortedUsers = (usersRes.data || []).sort((a, b) => {
      const nameCompare = a.fullName.localeCompare(b.fullName);
      if (nameCompare !== 0) return nameCompare;
      return a.email.localeCompare(b.email);
    });
    setUsers(sortedUsers);
  };

  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    title: "",
    slug: "",
    description: "",
    additionalInfo: "",
    category: "",
    subCategory: "",
    status: "published",
  });

  const [featuredImage, setFeaturedImage] = useState(null);
  const [hoverImage, setHoverImage] = useState(null);
  const [gallery, setGallery] = useState([]);

  const [variants, setVariants] = useState([]);
  const [attributeSaved, setAttributeSaved] = useState(false);

  const [savedColors, setSavedColors] = useState([]);
  const [savedSizes, setSavedSizes] = useState([]);
  const [productId, setProductId] = useState(null);

  /* ================= HANDLERS ================= */
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedSubCategory, setSelectedSubCategory] = useState(null);
  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const res = await getAllCategoriesWithSubCatApi();
      setCategories(res.data);
    } catch (error) {
      console.error("Failed to fetch categories", error);
    }
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleVariantChange = (index, field, value) => {
    setVariants((prev) =>
      prev.map((v, i) =>
        i === index
          ? {
              ...v,
              [field]: value,
              featuredImage:
                field === "featuredImage" ? value : v.featuredImage,
              gallery: field === "gallery" ? value : v.gallery,
            }
          : v
      )
    );
  };

  const addVariant = () => {
    if (!attributeSaved) {
      toast.error("Save attributes first");
      return;
    }

    setVariants([
      ...variants,
      {
        sku: "",
        colorId: "",
        sizeId: null,
        regularPrice: "",
        salePrice: "",
        stock: "",
        featuredImage: null,
        gallery: [],
      },
    ]);
  };

  const removeVariant = (index) => {
    setVariants(variants.filter((_, i) => i !== index));
  };

  const duplicateVariant = (index) => {
    const variantToDuplicate = variants[index];
    
    // Create a deep copy of the variant including file objects
    const duplicatedVariant = {
      sku: variantToDuplicate.sku,
      colorId: variantToDuplicate.colorId,
      sizeId: variantToDuplicate.sizeId,
      regularPrice: variantToDuplicate.regularPrice,
      salePrice: variantToDuplicate.salePrice,
      stock: variantToDuplicate.stock,
      featuredImage: variantToDuplicate.featuredImage, // Copy the file reference
      gallery: [...(variantToDuplicate.gallery || [])], // Copy the gallery array
    };

    setVariants([...variants, duplicatedVariant]);
    toast.success("Variant duplicated successfully");
  };

  /* ================= SUBMIT ================= */

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.title || !form.slug) {
      toast.error("Required fields are missing");
      return;
    }

    try {
      setLoading(true);
      if (!selectedCategory) {
        toast.error("Please select category and subcategory");
        return;
      }

      const formData = new FormData();

      // TEXT FIELDS
      formData.append("title", form.title);
      formData.append("slug", form.slug);
      formData.append("description", form.description);
      if (form.additionalInfo) {
        formData.append("additionalInfo", form.additionalInfo);
      }
      formData.append("category", selectedCategory);
      if (selectedSubCategory) {
        formData.append("subCategory", selectedSubCategory);
      }
      formData.append("status", form.status);

      // VARIANTS JSON (remove files)
      formData.append(
        "variants",
        JSON.stringify(
          variants.map((v) => ({
            sku: v.sku,
            colorId: v.colorId,
            sizeId: v.sizeId ?? null,
            regularPrice: v.regularPrice,
            salePrice: v.salePrice,
            stock: v.stock,
            featuredImage:
              typeof v.featuredImage === "string" ? v.featuredImage : null,
            gallery: (v.gallery || []).filter(
              (g) => typeof g === "object" && g.url
            ),
          }))
        )
      );

      // PRODUCT IMAGES (only append if user selected new File)
      if (featuredImage && featuredImage instanceof File) {
        formData.append("featuredImage", featuredImage);
      }
      if (hoverImage && hoverImage instanceof File) {
        formData.append("hoverImage", hoverImage);
      }

      gallery.forEach((file) => {
        if (file && file instanceof File) formData.append("gallery", file);
      });

      // VARIANT IMAGES
      variants.forEach((variant, index) => {
        if (variant.featuredImage && variant.featuredImage instanceof File) {
          formData.append(`variantFeatured_${index}`, variant.featuredImage);
        }

        (variant.gallery || []).forEach((file) => {
          if (file && file instanceof File)
            formData.append(`variantGallery_${index}`, file);
        });
      });
      formData.append("sizes", JSON.stringify(savedSizes));
      formData.append("colors", JSON.stringify(savedColors));
      formData.append("tags", JSON.stringify(tags));

      // Add credits field
      if (selectedCredit) {
        formData.append("credits", selectedCredit);
      }

      if (slug && productId) {
        await updateProductApi(productId, formData);
        toast.success("Product updated successfully");
        // navigate("/admin/products/all-products");
      } else {
        await createProductApi(formData);
        toast.success("Product created successfully");
        // navigate("/admin/products/all-products");
      }
    } catch (error) {
      console.error(error);
      toast.error("Failed to create product");
    } finally {
      setLoading(false);
    }
  };
  const generateVariants = () => {
    if (!attributeSaved) return;

    const newVariants = [];

    savedColors.forEach((colorId) => {
      newVariants.push({
        sku: "",
        colorId,
        sizeId: null, // ✅ Any Size (do NOT expand)
        regularPrice: "",
        salePrice: "",
        stock: "",
        featuredImage: null,
        gallery: [],
      });
    });
    if (slug) {
      toast.error("Variants already exist. Edit them instead.");
      return;
    }

    setVariants(newVariants);
  };

  const renderPreview = (file) => {
    if (!file) return null;

    // file can be a File, a url string, or an object { url, type }
    let url = null;
    let isVideo = false;

    if (typeof file === "string") {
      url = file;
      isVideo = /\.(mp4|webm|ogg)$/i.test(url);
    } else if (file.url) {
      url = file.url;
      isVideo = file.type === "video" || /\.(mp4|webm|ogg)$/i.test(url);
    } else {
      url = URL.createObjectURL(file);
      isVideo = file.type && file.type.startsWith("video");
    }

    return isVideo ? (
      <video src={url} className="w-16 h-16 rounded" />
    ) : (
      <img src={url} className="w-16 h-16 rounded object-cover" />
    );
  };
  const saveAttributes = () => {
    if (!selectedColors.length) {
      toast.error("Select at least one color");
      return;
    }

    setSavedColors([...new Set(selectedColors)]);
    setSavedSizes([...new Set(selectedSizes)]);

    setAttributeSaved(true);

    toast.success("Attributes saved");
  };

  const allColorIds = availableColors.map((c) => c._id);
  const allSizeIds = availableSizes.map((s) => s._id);
  const fetchProduct = async () => {
    try {
      const res = await getProductBySlugApi(slug);
      const p = res.data;

      setForm({
        title: p.title,
        slug: p.slug,
        description: p.description,
        additionalInfo: p.additionalInfo || "",
        status: p.status,
      });
      setTags(p.tags || []);

      setSelectedCategory(p.category?._id);
      setSelectedSubCategory(p.subCategory?._id || null);

      const colorIds = (p.colors || []).map((c) => c._id);
      const sizeIds = (p.sizes || []).map((s) => s._id);

      setSelectedColors(colorIds);
      setSelectedSizes(sizeIds);

      setSavedColors(colorIds);
      setSavedSizes(sizeIds);

      setVariants(
        p.variants.map((v) => ({
          ...v,
          colorId: typeof v.color === "object" ? v.color._id : String(v.color),

          sizeId: v.size
            ? typeof v.size === "object"
              ? v.size._id
              : String(v.size)
            : null,

          featuredImage: v.featuredImage || null,
          gallery: v.gallery || [],
        }))
      );

      // set existing product media (urls/objects)
      setFeaturedImage(p.featuredImage || null);
      setHoverImage(p.hoverImage || null);
      setGallery(p.gallery || []);
      setProductId(p._id || null);

      // Set credits if exists
      if (p.credits) {
        setSelectedCredit(
          typeof p.credits === "object" ? p.credits._id : p.credits
        );
      }

      setAttributeSaved(true);
    } catch (err) {
      toast.error("Failed to load product");
      navigate("/admin/products");
    }
  };
  const handleDelete = async () => {
    if (!productId) {
      toast.error("Product ID not found");
      return;
    }

    const confirmDelete = window.confirm(
      "Are you sure you want to delete this product? This action cannot be undone."
    );

    if (!confirmDelete) return;

    try {
      setLoading(true);
      await deleteProductApi(productId);

      toast.success("Product deleted successfully");
      navigate("/admin/products/all-products");
    } catch (error) {
      console.error(error);
      toast.error("Failed to delete product");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (slug) fetchProduct();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slug]);
  /* ================= UI ================= */

  return (
    <form
      onSubmit={handleSubmit}
      className="p-6 grid grid-cols-1 lg:grid-cols-3 gap-6"
    >
      {/* LEFT */}
      <div className="lg:col-span-2 bg-white rounded-xl shadow p-5 space-y-4">
        <h1 className="text-xl font-semibold">Add New Product</h1>

        <input
          name="title"
          value={form.title}
          onChange={handleChange}
          className="border p-2 rounded w-full"
          placeholder="Product Title"
        />

        <input
          name="slug"
          value={form.slug}
          onChange={handleChange}
          className="border p-2 rounded w-full"
          placeholder="Slug"
        />

        <textarea
          name="description"
          value={form.description}
          onChange={handleChange}
          rows="5"
          className="border p-2 rounded w-full"
          placeholder="Description"
        />

        <div className="space-y-1">
          <label className="text-sm font-medium text-gray-700">
            Additional Information (optional)
          </label>
          <p className="text-xs text-gray-500">
            Add extra details, specifications, or care instructions
          </p>
          <RichTextEditor
            value={form.additionalInfo}
            onChange={(html) => setForm({ ...form, additionalInfo: html })}
            placeholder="Enter additional information..."
          />
        </div>

        {/* PRODUCT FEATURED IMAGE */}
        <div className="space-y-1">
          <label className="text-sm font-medium text-gray-700">
            Featured Image
          </label>
          <p className="text-xs text-gray-500">
            Main image shown on product page & listings
          </p>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setFeaturedImage(e.target.files[0])}
          />
          {featuredImage && renderPreview(featuredImage)}
        </div>

        {/* PRODUCT HOVER IMAGE */}
        <div className="space-y-1">
          <label className="text-sm font-medium text-gray-700">
            Hover Image
          </label>
          <p className="text-xs text-gray-500">
            Image shown when user hovers on product card
          </p>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setHoverImage(e.target.files[0])}
          />
          {hoverImage && renderPreview(hoverImage)}
        </div>

        {/* PRODUCT GALLERY (IMAGES + VIDEO) */}
        <div className="space-y-1">
          <label className="text-sm font-medium text-gray-700">
            Product Gallery (Images / Video)
          </label>
          <p className="text-xs text-gray-500">
            You can upload multiple images and one short video
          </p>
          <input
            type="file"
            multiple
            accept="image/*,video/*"
            onChange={(e) => setGallery([...e.target.files])}
          />
          <div className="flex gap-2 flex-wrap">
            {gallery.map((file, i) => (
              <div key={i}>{renderPreview(file)}</div>
            ))}
          </div>
        </div>
        {/* DESIGN IMAGES */}

        {/* VARIANTS */}
        <div className="border p-4 rounded space-y-3">
          <h2 className="font-semibold">Product Attributes</h2>

          {/* COLORS */}
          <div>
            <p className="text-sm font-medium mb-1">Colors</p>
            <label className="flex items-center gap-2 mb-2 font-medium">
              <input
                type="checkbox"
                checked={selectedColors.length === allColorIds.length}
                onChange={(e) =>
                  setSelectedColors(e.target.checked ? allColorIds : [])
                }
              />
              Select All Colors
            </label>

            <div className="flex flex-wrap gap-2">
              {availableColors.map((color) => (
                <label key={color._id} className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={selectedColors.includes(color._id)}
                    onChange={() =>
                      setSelectedColors((prev) =>
                        prev.includes(color._id)
                          ? prev.filter((c) => c !== color._id)
                          : [...prev, color._id]
                      )
                    }
                  />
                  <span
                    className="w-4 h-4 rounded border"
                    style={{ background: color.hexCode }}
                  />
                  {color.name}
                </label>
              ))}
            </div>
          </div>

          {/* SIZES */}
          <div>
            <p className="text-sm font-medium mb-1">Sizes</p>
            <label className="flex items-center gap-2 mb-2 font-medium">
              <input
                type="checkbox"
                checked={selectedSizes.length === allSizeIds.length}
                onChange={(e) =>
                  setSelectedSizes(e.target.checked ? allSizeIds : [])
                }
              />
              Select All Sizes
            </label>

            <div className="flex flex-wrap gap-2">
              {availableSizes.map((size) => (
                <label key={size._id} className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={selectedSizes.includes(size._id)}
                    onChange={() =>
                      setSelectedSizes((prev) =>
                        prev.includes(size._id)
                          ? prev.filter((s) => s !== size._id)
                          : [...prev, size._id]
                      )
                    }
                  />
                  {size.name}
                </label>
              ))}
            </div>
          </div>

          <button
            type="button"
            onClick={saveAttributes}
            className="text-green-600 text-sm"
          >
            💾 Save Attributes
          </button>

          {attributeSaved && (
            <button
              type="button"
              onClick={generateVariants}
              className="text-blue-600 text-sm"
            >
              ⚡ Generate Variants
            </button>
          )}
        </div>

        <h2 className="font-semibold">Variants</h2>

        {variants.map((variant, index) => (
          <div key={index} className="border p-4 rounded space-y-2">
            <input
              placeholder="SKU"
              value={variant.sku}
              onChange={(e) =>
                handleVariantChange(index, "sku", e.target.value)
              }
              className="border p-2 w-full"
            />

            <select
              value={variant.colorId}
              onChange={(e) =>
                handleVariantChange(index, "colorId", e.target.value)
              }
              className="border p-2 w-full"
            >
              <option value="">Select Color</option>
              {availableColors
                .filter((c) => savedColors.includes(c._id))
                .map((c) => (
                  <option key={c._id} value={c._id}>
                    {c.name}
                  </option>
                ))}
            </select>

            <select
              value={variant.sizeId ?? "any"}
              onChange={(e) =>
                handleVariantChange(
                  index,
                  "sizeId",
                  e.target.value === "any" ? null : e.target.value
                )
              }
              className="border p-2 w-full"
            >
              <option value="any">Any Size</option>

              {availableSizes
                .filter((s) => savedSizes.includes(s._id))
                .map((s) => (
                  <option key={s._id} value={s._id}>
                    {s.name}
                  </option>
                ))}
            </select>

            <input
              type="number"
              placeholder="Regular Price"
              value={variant.regularPrice}
              onChange={(e) =>
                handleVariantChange(index, "regularPrice", e.target.value)
              }
              className="border p-2 w-full"
            />

            <input
              type="number"
              placeholder="Sale Price"
              value={variant.salePrice}
              onChange={(e) =>
                handleVariantChange(index, "salePrice", e.target.value)
              }
              className="border p-2 w-full"
            />

            <input
              type="number"
              placeholder="Stock"
              value={variant.stock}
              onChange={(e) =>
                handleVariantChange(index, "stock", e.target.value)
              }
              className="border p-2 w-full"
            />

            <div className="space-y-1">
              <label className="text-xs font-medium text-gray-700">
                Variant Featured Image
              </label>
              <p className="text-[11px] text-gray-500">
                Image for this color/size variant
              </p>
              <input
                type="file"
                accept="image/*"
                onChange={(e) =>
                  handleVariantChange(index, "featuredImage", e.target.files[0])
                }
              />
              {variant.featuredImage && renderPreview(variant.featuredImage)}
            </div>

            {/* VARIANT GALLERY */}
            <div className="space-y-1">
              <label className="text-xs font-medium text-gray-700">
                Variant Gallery (Images / Video)
              </label>
              <p className="text-[11px] text-gray-500">
                Optional images or one video for this variant
              </p>
              <input
                type="file"
                multiple
                accept="image/*,video/*"
                onChange={(e) =>
                  handleVariantChange(index, "gallery", [...e.target.files])
                }
              />
              <div className="flex gap-2 flex-wrap">
                {variant.gallery.map((file, i) => (
                  <div key={i}>{renderPreview(file)}</div>
                ))}
              </div>
            </div>

            {variants.length > 1 && (
              <button
                type="button"
                onClick={() => removeVariant(index)}
                className="text-red-600 text-sm"
              >
                Remove Variant
              </button>
            )}

            <button
              type="button"
              onClick={() => duplicateVariant(index)}
              className="text-green-600 text-sm ml-3"
            >
              📋 Duplicate Variant
            </button>
          </div>
        ))}

        <button type="button" onClick={addVariant} className="text-blue-600">
          + Add Variant
        </button>
      </div>

      {/* RIGHT */}
      <div className="bg-white rounded-xl shadow p-5 space-y-4">
        <h2 className="font-semibold">Product Data</h2>

        {/* PRODUCT CATEGORIES */}
        <div>
          <h3 className="font-medium mb-2">Product Categories</h3>

          <div className="border rounded p-3 max-h-64 overflow-y-auto space-y-2">
            {categories.map((cat) => (
              <div key={cat._id}>
                {/* PARENT CATEGORY */}
                <label className="flex items-center gap-2 font-medium">
                  <input
                    type="radio"
                    name="category"
                    checked={selectedCategory === cat._id}
                    onChange={() => {
                      setSelectedCategory(cat._id);
                      setSelectedSubCategory(null);
                    }}
                  />
                  {cat.name}
                </label>

                {/* SUBCATEGORIES */}
                {cat.subCategories?.length > 0 && (
                  <div className="ml-6 mt-1 space-y-1">
                    {cat.subCategories.map((sub) => (
                      <label
                        key={sub._id}
                        className="flex items-center gap-2 text-sm"
                      >
                        <input
                          type="radio"
                          name="subcategory"
                          checked={selectedSubCategory === sub._id}
                          onChange={() => {
                            setSelectedCategory(cat._id);
                            setSelectedSubCategory(sub._id);
                          }}
                        />
                        {sub.name}
                      </label>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
        {/* CREDITS */}
        <div className="border p-4 rounded space-y-3">
          <h3 className="font-medium">Design Credits</h3>
          <p className="text-xs text-gray-500">
            Select the designer who created this design. Defaults to
            "VasanWears" if none selected.
          </p>

          <select
            value={selectedCredit}
            onChange={(e) => setSelectedCredit(e.target.value)}
            className="border p-2 rounded w-full"
          >
            <option value="">VasanWears (Default)</option>
            {users.map((user) => (
              <option key={user._id} value={user._id}>
                {user.fullName} - {user.email}
              </option>
            ))}
          </select>

          {selectedCredit && (
            <div className="text-xs text-green-600">
              ✓ Credits assigned to{" "}
              {users.find((u) => u._id === selectedCredit)?.fullName}
            </div>
          )}
        </div>

        {/* TAGS */}
        <div className="border p-4 rounded space-y-3">
          <h3 className="font-medium">Product Tags</h3>
          <p className="text-xs text-gray-500">
            Press Enter to add tag (e.g. oversized, cotton)
          </p>

          <div className="flex gap-2">
            <input
              type="text"
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  editingIndex !== null ? updateTag() : addTag();
                }
              }}
              placeholder="Enter tag"
              className="border p-2 rounded w-full"
            />

            <button
              type="button"
              onClick={editingIndex !== null ? updateTag : addTag}
              className="px-4 bg-primary5 text-white rounded"
            >
              {editingIndex !== null ? "Update" : "Add"}
            </button>
          </div>

          {/* TAG LIST */}
          <div className="flex flex-wrap gap-2">
            {tags.map((tag, index) => (
              <span
                key={index}
                className="flex items-center gap-2 bg-primary3 px-3 py-1 rounded-full text-sm"
              >
                #{tag}
                <button
                  type="button"
                  onClick={() => startEditTag(index)}
                  className="text-blue-600 text-xs"
                >
                  ✏️
                </button>
                <button
                  type="button"
                  onClick={() => removeTag(index)}
                  className="text-red-600 text-xs"
                >
                  ✕
                </button>
              </span>
            ))}
          </div>
        </div>

        <select
          name="status"
          value={form.status}
          onChange={handleChange}
          className="border p-2 w-full"
        >
          <option value="published">Published</option>
          <option value="unpublished">Unpublished</option>
        </select>

        <button
          disabled={loading}
          className="w-full bg-primary5 text-white py-2 rounded"
        >
          {loading ? "Updating..." : "Update Product"}
        </button>

        <button
          type="button"
          onClick={() => navigate("/admin/products/all-products")}
          className="w-full border py-2 rounded"
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={handleDelete}
          className="w-full border py-2 rounded cursor-pointer"
        >
          Delete
        </button>
      </div>
    </form>
  );
};

export default EditProduct;
