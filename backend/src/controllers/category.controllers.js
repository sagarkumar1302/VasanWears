// controllers/category.controller.js
import { asyncHandler } from "../utils/AsyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Category } from "../model/category.model.js";

import { uploadToS3 } from "../utils/uploadToS3.js";

const createCategory = asyncHandler(async (req, res) => {
  const { name, slug, published } = req.body;

  if (!name || !slug) {
    return res.status(400).json(
      new ApiResponse(400, "Name and slug are required")
    );
  }

  const existingCategory = await Category.findOne({ slug });
  if (existingCategory) {
    return res.status(409).json(
      new ApiResponse(409, "Category with this slug already exists")
    );
  }

  let imageUrl = null;

  if (req.file) {
    imageUrl = await uploadToS3(req.file, "categories");
  }

  const category = await Category.create({
    name,
    slug,
    image: imageUrl,
    published,
    author: req.adminuser._id,
  });

  res.status(201).json(
    new ApiResponse(201, "Category created successfully", category)
  );
});


/**
 * UPDATE CATEGORY
 */
const updateCategory = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { name, slug, published } = req.body;

  const category = await Category.findById(id);

  if (!category) {
    return res
      .status(404)
      .json(new ApiResponse(404, "Category not found"));
  }

  // Optional: check slug conflict (only if slug is changing)
  if (slug && slug !== category.slug) {
    const slugExists = await Category.findOne({ slug });
    if (slugExists) {
      return res
        .status(409)
        .json(new ApiResponse(409, "Category with this slug already exists"));
    }
  }

  let imageUrl = category.image;

  // If new image uploaded → upload to S3
  if (req.file) {
    imageUrl = await uploadToS3(req.file, "categories");
  }

  category.name = name ?? category.name;
  category.slug = slug ?? category.slug;
  category.published = published ?? category.published;
  category.image = imageUrl;
  category.author = req.adminuser._id; // track last editor

  await category.save();

  res.status(200).json(
    new ApiResponse(200, "Category updated successfully", category)
  );
});
const getAllCategories = asyncHandler(async (req, res) => {
  const categories = await Category.find()
    .sort({ createdAt: -1 })
    // .populate("subCategories") // uncomment if subCategories are refs
    .lean();

  res.status(200).json(
    new ApiResponse(
      200,
      "Categories fetched successfully",
      categories
    )
  );
});

/**
 * DELETE CATEGORY
 */
const deleteCategory = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const category = await Category.findByIdAndDelete(id);

  if (!category) {
    return res
      .status(404)
      .json(new ApiResponse(404, "Category not found"));
  }

  res.json(new ApiResponse(200, "Category deleted successfully"));
});

const getAllCategoriesWithSub = asyncHandler(async (req, res) => {
  const categories = await Category.aggregate([
    // 1️⃣ Lookup subcategories
    {
      $lookup: {
        from: "subcategories",
        localField: "_id",
        foreignField: "category",
        as: "subCategories",
      },
    },

    // 2️⃣ Lookup author (user)
    {
      $lookup: {
        from: "users",
        localField: "author",
        foreignField: "_id",
        as: "author",
      },
    },

    // 3️⃣ Convert author array → object
    {
      $unwind: {
        path: "$author",
        preserveNullAndEmptyArrays: true,
      },
    },

    // 4️⃣ Shape final response
    {
      $project: {
        name: 1,
        slug: 1,
        image: 1,
        published: 1,
        createdAt: 1,
        subCategories: 1,

        // only what you want from author
        author: {
          _id: "$author._id",
          name: "$author.fullName",
          email: "$author.email", // optional
        },
      },
    },

    // 5️⃣ Sort
    {
      $sort: { createdAt: -1 },
    },
  ]);

  res.status(200).json(
    new ApiResponse(200, "Categories fetched successfully", categories)
  );
});

export { createCategory, updateCategory, deleteCategory, getAllCategories, getAllCategoriesWithSub };
