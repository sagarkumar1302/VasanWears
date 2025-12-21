// controllers/subcategory.controller.js
import { asyncHandler } from "../utils/AsyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import mongoose from "mongoose";
import { SubCategory } from "../model/subcategory.model.js";
import { Category } from "../model/category.model.js";

/**
 * CREATE SUBCATEGORY
 */
const createSubCategory = asyncHandler(async (req, res) => {
  const { name, slug, published } = req.body;
  const { categoryId } = req.params;

  if (!name || !slug || !categoryId) {
    return res
      .status(400)
      .json(new ApiResponse(400, "Name, slug and categoryId are required"));
  }

  // Validate category id
  if (!mongoose.Types.ObjectId.isValid(categoryId)) {
    return res
      .status(400)
      .json(new ApiResponse(400, "Invalid category id"));
  }

  // Ensure category exists
  const category = await Category.findById(categoryId);
  if (!category) {
    return res
      .status(404)
      .json(new ApiResponse(404, "Category not found"));
  }

  // Prevent duplicate slug
  const exists = await SubCategory.findOne({ slug });
  if (exists) {
    return res
      .status(409)
      .json(new ApiResponse(409, "SubCategory with this slug already exists"));
  }

  const subCategory = await SubCategory.create({
    name,
    slug,
    category: categoryId,
    published,
    author: req.adminuser._id, // ✅ author from token
  });

  res
    .status(201)
    .json(new ApiResponse(201, "SubCategory created successfully", subCategory));
});

/**
 * UPDATE SUBCATEGORY
 */
const updateSubCategory = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const subCategory = await SubCategory.findByIdAndUpdate(
    id,
    {
      ...req.body,
      author: req?.adminuser._id, // optional audit
    },
    { new: true, runValidators: true }
  );

  if (!subCategory) {
    return res
      .status(404)
      .json(new ApiResponse(404, "SubCategory not found"));
  }

  res.json(
    new ApiResponse(200, "SubCategory updated successfully", subCategory)
  );
});

/**
 * DELETE SUBCATEGORY
 */
const deleteSubCategory = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const subCategory = await SubCategory.findByIdAndDelete(id);

  if (!subCategory) {
    return res
      .status(404)
      .json(new ApiResponse(404, "SubCategory not found"));
  }

  res.json(new ApiResponse(200, "SubCategory deleted successfully"));
});

export { createSubCategory, updateSubCategory, deleteSubCategory };
