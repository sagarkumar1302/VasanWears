import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import toast from "react-hot-toast";
import {
  createProductApi,
  deleteProductApi,
  getProductBySlugApi,
  updateProductApi,
} from "../../../utils/productApi";
import { API, getAllCategoriesWithSubCatApi } from "../../../utils/adminApi";
const AddProduct = () => {
  const navigate = useNavigate();
  const { slug } = useParams();
  const [availableColors, setAvailableColors] = useState([]);
  const [availableSizes, setAvailableSizes] = useState([]);

  const [selectedColors, setSelectedColors] = useState([]);
  const [selectedSizes, setSelectedSizes] = useState([]);
  useEffect(() => {
    fetchAttributes();
  }, []);

  const fetchAttributes = async () => {
    const [colorsRes, sizesRes] = await Promise.all([
      API.get("/colors"),
      API.get("/sizes"),
    ]);

    setAvailableColors(colorsRes.data.data);
    setAvailableSizes(sizesRes.data.data);
  };

  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    title: "",
    slug: "",
    description: "",
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
    const updated = [...variants];
    updated[index][field] = value;
    setVariants(updated);
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

  /* ================= SUBMIT ================= */
  const [designImages, setDesignImages] = useState({
    front: null,
    back: null,
    left: null,
    right: null,
  });
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.title || !form.slug) {
      toast.error("Required fields are missing");
      return;
    }
    if (!designImages.front) {
      toast.error("Front design image is mandatory");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      if (!selectedCategory) {
        toast.error("Please select category and subcategory");
        return;
      }

      const formData = new FormData();
      const designMeta = [];

      Object.entries(designImages).forEach(([side, file]) => {
        if (file && file instanceof File) {
          formData.append("designImages", file);
          designMeta.push({ side });
        }
      });

      if (designMeta.length) {
        formData.append("designImagesMeta", JSON.stringify(designMeta));
      }

      // TEXT FIELDS
      formData.append("title", form.title);
      formData.append("slug", form.slug);
      formData.append("description", form.description);
      formData.append("category", selectedCategory);
      if (selectedSubCategory) {
        formData.append("subCategory", selectedSubCategory);
      }
      formData.append("status", form.status);

      // VARIANTS JSON (remove files)
      formData.append(
        "variants",
        JSON.stringify(
          variants.map(({ featuredImage, gallery, ...rest }) => rest)
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

    setSavedColors(selectedColors);
    setSavedSizes(selectedSizes);
    setAttributeSaved(true);

    toast.success("Attributes saved");
  };

  const handleDesignImageChange = (side, file) => {
    setDesignImages((prev) => ({
      ...prev,
      [side]: file,
    }));
  };

  const removeDesignImage = (side) => {
    setDesignImages((prev) => ({
      ...prev,
      [side]: null,
    }));
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
        status: p.status,
      });

      setSelectedCategory(p.category?._id);
      setSelectedSubCategory(p.subCategory?._id || null);

      setSelectedColors(p.colors || []);
      setSelectedSizes(p.sizes || []);
      setSavedColors(p.colors || []);
      setSavedSizes(p.sizes || []);

      setVariants(
        p.variants.map((v) => ({
          ...v,
          colorId: v.color,
          sizeId: v.size ?? null,
          featuredImage: v.featuredImage || null,
          gallery: v.gallery || [],
        }))
      );

      // set existing product media (urls/objects)
      setFeaturedImage(p.featuredImage || null);
      setHoverImage(p.hoverImage || null);
      setGallery(p.gallery || []);
      setProductId(p._id || null);

      // populate design images (backend uses `desginImage` field)
      const designMap = { front: null, back: null, left: null, right: null };
      const designArr = p.desginImage || p.designImage || p.designImages || [];
      if (Array.isArray(designArr)) {
        designArr.forEach((d) => {
          if (d && d.side) designMap[d.side] = d.url || d;
        });
      }
      setDesignImages(designMap);

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
        <div className="border p-4 rounded space-y-3">
          <h2 className="font-semibold">Design Images</h2>
          <p className="text-xs text-gray-500">
            Upload design images for each side (Front is mandatory)
          </p>

          <div className="grid grid-cols-2 gap-4">
            {["front", "back", "left", "right"].map((side) => (
              <div
                key={side}
                className="border rounded p-3 flex flex-col gap-2"
              >
                <p className="text-sm font-medium capitalize">
                  {side} {side === "front" && "(Required)"}
                </p>

                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) =>
                    handleDesignImageChange(side, e.target.files[0])
                  }
                />

                {designImages[side] && (
                  <div className="relative w-24 h-24">
                    <div className="w-24 h-24 overflow-hidden rounded">
                      {renderPreview(designImages[side])}
                    </div>
                    <button
                      type="button"
                      onClick={() => removeDesignImage(side)}
                      className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full px-2"
                    >
                      ✕
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

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

export default AddProduct;
