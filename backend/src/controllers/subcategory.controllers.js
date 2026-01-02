// controllers/subcategory.controller.js
import { asyncHandler } from "../utils/AsyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import mongoose from "mongoose";
import { SubCategory } from "../model/subcategory.model.js";
import { Category } from "../model/category.model.js";

/**
 * CREATE SUBCATEGORY
 */
import { uploadToS3 } from "../utils/uploadToS3.js";

const createSubCategory = asyncHandler(async (req, res) => {
  const { name, slug, published } = req.body;
  const { categoryId } = req.params;

  if (!name || !slug || !categoryId) {
    return res
      .status(400)
      .json(new ApiResponse(400, "Name, slug and categoryId are required"));
  }

  if (!mongoose.Types.ObjectId.isValid(categoryId)) {
    return res
      .status(400)
      .json(new ApiResponse(400, "Invalid category id"));
  }

  const category = await Category.findById(categoryId);
  if (!category) {
    return res
      .status(404)
      .json(new ApiResponse(404, "Category not found"));
  }

  const exists = await SubCategory.findOne({
    slug,
    category: categoryId,
  });

  if (exists) {
    return res.status(409).json(
      new ApiResponse(
        409,
        "SubCategory with this slug already exists in this category"
      )
    );
  }

  let imageUrl = null;

  // ✅ Upload image to S3 if provided
  if (req.file) {
    imageUrl = await uploadToS3(req.file, "subcategories");
  }

  const subCategory = await SubCategory.create({
    name,
    slug,
    image: imageUrl,
    category: categoryId,
    published,
    author: req.adminuser._id,
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

  let updateData = {
    ...req.body,
    author: req.adminuser._id,
  };

  // ✅ If new image uploaded, replace it
  if (req.file) {
    const imageUrl = await uploadToS3(req.file, "subcategories");
    updateData.image = imageUrl;
  }

  const subCategory = await SubCategory.findByIdAndUpdate(
    id,
    updateData,
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

const findSubCategoryById = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const subCategory = await SubCategory.findById(id);
  res.status(200).json(
    new ApiResponse(200, "SubCategory fetched successfully", subCategory)
  );
});
export { createSubCategory, updateSubCategory, deleteSubCategory, findSubCategoryById };
