import { useEffect, useRef, useState } from "react";
import {
  PlusIcon,
  PencilSquareIcon,
  TrashIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  PhotoIcon,
} from "@heroicons/react/24/outline";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import {
  getAllCategoriesWithSubCatApi,
  addCategoryApi,
  addSubCategoryApi,
  updateCategoryApi,
  deleteCategoryApi,
  updateSubCategoryApi,
  deleteSubCategoryApi,
} from "../../../utils/adminApi";

const AdminCategory = () => {
  const containerRef = useRef(null);

  const [categories, setCategories] = useState([]);
  const [openCategory, setOpenCategory] = useState(null);
  const [loading, setLoading] = useState(true);

  const [catForm, setCatForm] = useState({
    name: "",
    slug: "",
    image: null,
    published: true,
  });

  // Subcategory helpers
  const subRef = useRef({}); // container refs per category for height animation
  const subItemRefs = useRef({}); // refs for each subcategory item (for entry animation)
  const [subForms, setSubForms] = useState({}); // { [categoryId]: { name, slug, published } }
  const [subLoading, setSubLoading] = useState({});
  const [subSuccess, setSubSuccess] = useState({});

  // Edit Modal States
  const [editCatModal, setEditCatModal] = useState(null); // null or category id
  const [editCatForm, setEditCatForm] = useState({
    name: "",
    slug: "",
    image: null,
    published: true,
  });
  const [editCatLoading, setEditCatLoading] = useState(false);

  const [editSubModal, setEditSubModal] = useState(null); // null or { catId, subId }
  const [editSubForm, setEditSubForm] = useState({
    name: "",
    slug: "",
    published: true,
  });
  const [editSubLoading, setEditSubLoading] = useState(false);

  // Delete Confirmation States
  const [deleteCatConfirm, setDeleteCatConfirm] = useState(null);
  const [deleteSubConfirm, setDeleteSubConfirm] = useState(null);
  const [delCatLoading, setDelCatLoading] = useState(false);
  const [delSubLoading, setDelSubLoading] = useState(false);

  /* Animations */
  useGSAP(
    () => {
      gsap.from(".category-card", {
        opacity: 0,
        y: 20,
        stagger: 0.08,
        duration: 0.4,
        ease: "power2.out",
      });
    },
    { scope: containerRef, dependencies: [categories] }
  );

  /* Fetch Categories */
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await getAllCategoriesWithSubCatApi();
        setCategories(res.data || []);
      } catch (err) {
        console.error("Fetch categories error", err);
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  /* Add Category */
  const addCategory = async () => {
    if (!catForm.name || !catForm.slug) return;

    try {
      const formData = new FormData();
      formData.append("name", catForm.name);
      formData.append("slug", catForm.slug);
      formData.append("published", catForm.published);

      if (catForm.image) {
        formData.append("image", catForm.image);
      }

      const res = await addCategoryApi(formData);

      setCategories((prev) => [res.data, ...prev]);

      setCatForm({
        name: "",
        slug: "",
        image: null,
        published: true,
      });
    } catch (err) {
      console.error("Create category error", err);
    }
  };

  /* Toggle Subcategories */
  const toggleCategory = (id) => {
    setOpenCategory((prev) => (prev === id ? null : id));
  };

  /* Add Subcategory */
  const addSubCategory = async (categoryId) => {
    const form = subForms[categoryId] || {};
    if (!form.name || !form.slug) return;

    try {
      setSubLoading((s) => ({ ...s, [categoryId]: true }));

      const formData = new FormData();
      formData.append("name", form.name);
      formData.append("slug", form.slug);
      formData.append("published", form.published ?? true);

      if (form.image) {
        formData.append("image", form.image);
      }

      const res = await addSubCategoryApi(categoryId, formData);

      setCategories((prev) =>
        prev.map((c) =>
          c._id === categoryId
            ? { ...c, subCategories: [res.data, ...(c.subCategories || [])] }
            : c
        )
      );

      setSubForms((s) => ({
        ...s,
        [categoryId]: { name: "", slug: "", published: true, image: null },
      }));
    } finally {
      setSubLoading((s) => ({ ...s, [categoryId]: false }));
    }
  };
  /* Edit Category */
  const openEditCatModal = (cat) => {
    setEditCatForm({
      name: cat.name,
      slug: cat.slug,
      image: null, // user can select new image or keep existing
      published: cat.published,
    });
    setEditCatModal(cat._id);
  };

  const closeEditCatModal = () => {
    setEditCatModal(null);
    setEditCatForm({ name: "", slug: "", image: null, published: true });
  };

  const submitEditCategory = async () => {
    if (!editCatForm.name || !editCatForm.slug) return;

    try {
      setEditCatLoading(true);
      const formData = new FormData();
      formData.append("name", editCatForm.name);
      formData.append("slug", editCatForm.slug);
      formData.append("published", editCatForm.published);
      if (editCatForm.image) {
        formData.append("image", editCatForm.image);
      }

      const res = await updateCategoryApi(editCatModal, formData);

      setCategories((prev) =>
        prev.map((c) => (c._id === editCatModal ? res.data : c))
      );

      // Animate updated card
      setTimeout(() => {
        const el = document.querySelector(`[data-cat-id="${editCatModal}"]`);
        if (el) {
          gsap.to(el, {
            scale: 1.02,
            duration: 0.2,
            yoyo: true,
            repeat: 1,
            ease: "power2.inOut",
          });
        }
      }, 100);

      closeEditCatModal();
    } catch (err) {
      console.error("Update category error", err);
    } finally {
      setEditCatLoading(false);
    }
  };

  /* Delete Category */
  const handleDeleteCategory = async () => {
    if (!deleteCatConfirm) return;

    try {
      setDelCatLoading(true);
      await deleteCategoryApi(deleteCatConfirm);

      setCategories((prev) => prev.filter((c) => c._id !== deleteCatConfirm));

      setDeleteCatConfirm(null);
    } catch (err) {
      console.error("Delete category error", err);
    } finally {
      setDelCatLoading(false);
    }
  };

  /* Edit Subcategory */
  const openEditSubModal = (sub, catId) => {
    setEditSubForm({
      name: sub.name,
      slug: sub.slug,
      published: sub.published,
    });
    setEditSubModal({ catId, subId: sub._id });
  };

  const closeEditSubModal = () => {
    setEditSubModal(null);
    setEditSubForm({ name: "", slug: "", published: true });
  };

  const submitEditSubCategory = async () => {
    if (!editSubForm.name || !editSubForm.slug) return;

    const formData = new FormData();
    formData.append("name", editSubForm.name);
    formData.append("slug", editSubForm.slug);
    formData.append("published", editSubForm.published);

    if (editSubForm.image) {
      formData.append("image", editSubForm.image);
    }

    const res = await updateSubCategoryApi(editSubModal.subId, formData);

    setCategories((prev) =>
      prev.map((c) =>
        c._id === editSubModal.catId
          ? {
              ...c,
              subCategories: c.subCategories.map((s) =>
                s._id === editSubModal.subId ? res.data : s
              ),
            }
          : c
      )
    );

    closeEditSubModal();
  };

  /* Delete Subcategory */
  const handleDeleteSubCategory = async () => {
    if (!deleteSubConfirm) return;

    try {
      setDelSubLoading(true);
      await deleteSubCategoryApi(deleteSubConfirm.subId);

      setCategories((prev) =>
        prev.map((c) =>
          c._id === deleteSubConfirm.catId
            ? {
                ...c,
                subCategories: c.subCategories.filter(
                  (s) => s._id !== deleteSubConfirm.subId
                ),
              }
            : c
        )
      );

      setDeleteSubConfirm(null);
    } catch (err) {
      console.error("Delete subcategory error", err);
    } finally {
      setDelSubLoading(false);
    }
  };
  useEffect(() => {
    // collapse all first
    Object.keys(subRef.current).forEach((k) => {
      const el = subRef.current[k];
      if (!el) return;
      if (Number(k) || k) {
        // if this is not the open one, collapse
        if (k !== openCategory) {
          gsap.to(el, {
            height: 0,
            opacity: 0,
            duration: 0.25,
            ease: "power2.out",
          });
        }
      }
    });

    if (openCategory) {
      const el = subRef.current[openCategory];
      if (!el) return;
      // expand to exact scrollHeight then set to auto
      const h = el.scrollHeight;
      gsap.to(el, {
        height: h,
        opacity: 1,
        duration: 0.33,
        ease: "power2.out",
        onComplete: () => {
          el.style.height = "auto";
          // animate children
          gsap.from(el.querySelectorAll(".sub-item"), {
            y: 8,
            opacity: 0,
            stagger: 0.06,
            duration: 0.28,
            ease: "power2.out",
          });
        },
      });
    }
  }, [openCategory]);

  return (
    <div ref={containerRef} className="p-6 space-y-6">
      <h1 className="text-2xl font-semibold">Category Management</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* LEFT */}
        <div className="lg:col-span-2 bg-white rounded-lg shadow">
          <div className="border-b p-4 font-semibold">All Categories</div>

          {/* Loading */}
          {loading && (
            <p className="p-6 text-gray-500 text-sm">Loading categories...</p>
          )}

          {/* Empty State */}
          {!loading && categories.length === 0 && (
            <p className="p-6 text-gray-500 text-sm">
              No categories found. Create your first category ➕
            </p>
          )}

          {/* Category List */}
          {categories.map((cat) => (
            <div key={cat._id} className="category-card border-b">
              {/* Category Row */}
              <div
                data-cat-id={cat._id}
                className="flex justify-between items-center p-4 hover:bg-gray-50"
              >
                <div className="flex items-center gap-3">
                  <button onClick={() => toggleCategory(cat._id)}>
                    {openCategory === cat._id ? (
                      <ChevronUpIcon className="h-5 w-5" />
                    ) : (
                      <ChevronDownIcon className="h-5 w-5" />
                    )}
                  </button>

                  <img
                    src={cat.image}
                    alt={cat.name}
                    className="h-10 w-10 rounded object-cover bg-gray-100"
                  />

                  <div>
                    <p className="font-medium">{cat.name}</p>
                    <p className="text-xs text-gray-500">{cat.slug}</p>
                    <p className="text-xs text-gray-400">
                      By {cat.author?.name || "Admin"}
                    </p>
                  </div>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => openEditCatModal(cat)}
                    className="hover:text-indigo-700"
                  >
                    <PencilSquareIcon className="h-5 w-5 text-indigo-600" />
                  </button>
                  <button
                    onClick={() => setDeleteCatConfirm(cat._id)}
                    className="hover:text-red-700"
                  >
                    <TrashIcon className="h-5 w-5 text-red-500" />
                  </button>
                </div>
              </div>

              {/* Subcategories */}
              {openCategory === cat._id && (
                <div
                  ref={(el) => (subRef.current[cat._id] = el)}
                  className="overflow-hidden bg-gray-50 px-12"
                  style={{ height: 0, opacity: 0 }}
                >
                  <div className="py-4 space-y-3">
                    {/* Existing Subcategories */}
                    {cat.subCategories?.length === 0 ? (
                      <p className="text-xs text-gray-400">
                        No subcategories found
                      </p>
                    ) : (
                      cat.subCategories.map((sub) => (
                        <div
                          key={sub._id}
                          ref={(el) => (subItemRefs.current[sub._id] = el)}
                          className="flex justify-between bg-white p-3 rounded sub-item"
                        >
                          <div className="flex items-center gap-3">
                            <img
                              src={sub.image}
                              alt={sub.name}
                              className="h-8 w-8 rounded object-cover bg-gray-100"
                            />
                            <div>
                              <p className="text-sm font-medium">{sub.name}</p>
                              <p className="text-xs text-gray-400">
                                {sub.slug}
                              </p>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <button
                              onClick={() => openEditSubModal(sub, cat._id)}
                              className="hover:text-indigo-700"
                            >
                              <PencilSquareIcon className="h-4 w-4 text-indigo-600" />
                            </button>
                            <button
                              onClick={() =>
                                setDeleteSubConfirm({
                                  catId: cat._id,
                                  subId: sub._id,
                                })
                              }
                              className="hover:text-red-700"
                            >
                              <TrashIcon className="h-4 w-4 text-red-500" />
                            </button>
                          </div>
                        </div>
                      ))
                    )}

                    {/* Add Subcategory */}
                    <div className="bg-white p-3 rounded space-y-2 border">
                      <p className="text-xs font-semibold text-gray-600">
                        Add Subcategory
                      </p>
                      <label className="flex items-center gap-2 text-xs cursor-pointer">
                        <PhotoIcon className="h-4 w-4" />
                        Upload Image
                        <input
                          type="file"
                          hidden
                          onChange={(e) =>
                            setSubForms((prev) => ({
                              ...prev,
                              [cat._id]: {
                                ...prev[cat._id],
                                image: e.target.files[0],
                              },
                            }))
                          }
                        />
                      </label>

                      <input
                        placeholder="Subcategory Name"
                        value={subForms[cat._id]?.name || ""}
                        onChange={(e) =>
                          setSubForms((prev) => ({
                            ...prev,
                            [cat._id]: {
                              ...prev[cat._id],
                              name: e.target.value,
                            },
                          }))
                        }
                        className="border px-3 py-1 rounded w-full text-sm"
                      />

                      <input
                        placeholder="Slug"
                        value={subForms[cat._id]?.slug || ""}
                        onChange={(e) =>
                          setSubForms((prev) => ({
                            ...prev,
                            [cat._id]: {
                              ...prev[cat._id],
                              slug: e.target.value,
                            },
                          }))
                        }
                        className="border px-3 py-1 rounded w-full text-sm"
                      />

                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => addSubCategory(cat._id)}
                          disabled={subLoading[cat._id]}
                          className="bg-indigo-600 text-white px-3 py-1 rounded text-sm disabled:opacity-60"
                        >
                          {subLoading[cat._id]
                            ? "Adding..."
                            : "Add Subcategory"}
                        </button>

                        {subSuccess[cat._id] && (
                          <p className="text-sm text-green-600 font-medium">
                            Added ✓
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* RIGHT */}
        <div className="bg-white rounded-lg shadow p-4 space-y-3 h-fit">
          <h2 className="font-semibold flex items-center gap-2">
            <PlusIcon className="h-5 w-5" /> Add Category
          </h2>

          <input
            placeholder="Category Name"
            value={catForm.name}
            onChange={(e) => setCatForm({ ...catForm, name: e.target.value })}
            className="border px-3 py-2 rounded w-full"
          />

          <input
            placeholder="Slug"
            value={catForm.slug}
            onChange={(e) => setCatForm({ ...catForm, slug: e.target.value })}
            className="border px-3 py-2 rounded w-full"
          />

          <label className="flex items-center gap-2 text-sm cursor-pointer">
            <PhotoIcon className="h-5 w-5" />
            Upload Image
            <input
              type="file"
              hidden
              onChange={(e) =>
                setCatForm({ ...catForm, image: e.target.files[0] })
              }
            />
          </label>

          <button
            onClick={addCategory}
            className="bg-indigo-600 text-white py-2 rounded w-full hover:scale-[1.02] transition"
          >
            Create Category
          </button>
        </div>
      </div>

      {/* ============ EDIT CATEGORY MODAL ============ */}
      {editCatModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 w-96 max-h-screen overflow-y-auto">
            <h2 className="text-lg font-semibold mb-4">Edit Category</h2>

            <input
              placeholder="Category Name"
              value={editCatForm.name}
              onChange={(e) =>
                setEditCatForm({ ...editCatForm, name: e.target.value })
              }
              className="border px-3 py-2 rounded w-full mb-3 text-sm"
            />

            <input
              placeholder="Slug"
              value={editCatForm.slug}
              onChange={(e) =>
                setEditCatForm({ ...editCatForm, slug: e.target.value })
              }
              className="border px-3 py-2 rounded w-full mb-3 text-sm"
            />

            <label className="flex items-center gap-2 text-sm cursor-pointer mb-3">
              <PhotoIcon className="h-5 w-5" />
              {editCatForm.image ? "Change Image" : "Upload Image"}
              <input
                type="file"
                hidden
                onChange={(e) =>
                  setEditCatForm({
                    ...editCatForm,
                    image: e.target.files[0],
                  })
                }
              />
            </label>

            <label className="flex items-center gap-2 text-sm mb-4">
              <input
                type="checkbox"
                checked={editCatForm.published}
                onChange={(e) =>
                  setEditCatForm({
                    ...editCatForm,
                    published: e.target.checked,
                  })
                }
              />
              Published
            </label>

            <div className="flex gap-2">
              <button
                onClick={submitEditCategory}
                disabled={editCatLoading}
                className="bg-indigo-600 text-white px-4 py-2 rounded flex-1 text-sm disabled:opacity-60"
              >
                {editCatLoading ? "Saving..." : "Save Changes"}
              </button>
              <button
                onClick={closeEditCatModal}
                className="bg-gray-300 text-gray-800 px-4 py-2 rounded flex-1 text-sm hover:bg-gray-400"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ============ DELETE CATEGORY CONFIRMATION ============ */}
      {deleteCatConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 w-80">
            <h2 className="text-lg font-semibold mb-2">Delete Category?</h2>
            <p className="text-sm text-gray-600 mb-4">
              This action cannot be undone. All subcategories will also be
              deleted.
            </p>
            <div className="flex gap-2">
              <button
                onClick={handleDeleteCategory}
                disabled={delCatLoading}
                className="bg-red-600 text-white px-4 py-2 rounded flex-1 text-sm disabled:opacity-60"
              >
                {delCatLoading ? "Deleting..." : "Delete"}
              </button>
              <button
                onClick={() => setDeleteCatConfirm(null)}
                className="bg-gray-300 text-gray-800 px-4 py-2 rounded flex-1 text-sm hover:bg-gray-400"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ============ EDIT SUBCATEGORY MODAL ============ */}
      {editSubModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 w-96">
            <h2 className="text-lg font-semibold mb-4">Edit Subcategory</h2>
            <label className="flex items-center gap-2 text-sm mb-3 cursor-pointer">
              <PhotoIcon className="h-5 w-5" />
              Change Image
              <input
                type="file"
                hidden
                onChange={(e) =>
                  setEditSubForm({
                    ...editSubForm,
                    image: e.target.files[0],
                  })
                }
              />
            </label>

            <input
              placeholder="Subcategory Name"
              value={editSubForm.name}
              onChange={(e) =>
                setEditSubForm({ ...editSubForm, name: e.target.value })
              }
              className="border px-3 py-2 rounded w-full mb-3 text-sm"
            />

            <input
              placeholder="Slug"
              value={editSubForm.slug}
              onChange={(e) =>
                setEditSubForm({ ...editSubForm, slug: e.target.value })
              }
              className="border px-3 py-2 rounded w-full mb-3 text-sm"
            />

            <label className="flex items-center gap-2 text-sm mb-4">
              <input
                type="checkbox"
                checked={editSubForm.published}
                onChange={(e) =>
                  setEditSubForm({
                    ...editSubForm,
                    published: e.target.checked,
                  })
                }
              />
              Published
            </label>

            <div className="flex gap-2">
              <button
                onClick={submitEditSubCategory}
                disabled={editSubLoading}
                className="bg-indigo-600 text-white px-4 py-2 rounded flex-1 text-sm disabled:opacity-60"
              >
                {editSubLoading ? "Saving..." : "Save Changes"}
              </button>
              <button
                onClick={closeEditSubModal}
                className="bg-gray-300 text-gray-800 px-4 py-2 rounded flex-1 text-sm hover:bg-gray-400"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ============ DELETE SUBCATEGORY CONFIRMATION ============ */}
      {deleteSubConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 w-80">
            <h2 className="text-lg font-semibold mb-2">Delete Subcategory?</h2>
            <p className="text-sm text-gray-600 mb-4">
              This action cannot be undone.
            </p>
            <div className="flex gap-2">
              <button
                onClick={handleDeleteSubCategory}
                disabled={delSubLoading}
                className="bg-red-600 text-white px-4 py-2 rounded flex-1 text-sm disabled:opacity-60"
              >
                {delSubLoading ? "Deleting..." : "Delete"}
              </button>
              <button
                onClick={() => setDeleteSubConfirm(null)}
                className="bg-gray-300 text-gray-800 px-4 py-2 rounded flex-1 text-sm hover:bg-gray-400"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminCategory;
