// controllers/product.controller.js
import { asyncHandler } from "../utils/AsyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Product } from "../model/product.model.js";

/**
 * CREATE PRODUCT
 */
const createProduct = asyncHandler(async (req, res) => {
  const {
    title,
    slug,
    productType,
    category,
    subCategory,
    regularPrice,
    salePrice,
    stock,
    variants,
    featuredImage,
    gallery,
    tags,
    metaTitle,
    metaDescription,
    published,
    description
  } = req.body;

  if (!title || !slug || !category) {
    return res
      .status(400)
      .json(new ApiResponse(400, "Title, slug and category are required"));
  }

  // Prevent duplicate slug
  const exists = await Product.findOne({ slug });
  if (exists) {
    return res
      .status(409)
      .json(new ApiResponse(409, "Product with this slug already exists"));
  }

  const product = await Product.create({
    title,
    slug,
    productType,
    category,
    subCategory,
    regularPrice,
    salePrice,
    stock,
    variants,
    featuredImage,
    gallery,
    tags,
    metaTitle,
    metaDescription,
    published,
    description,
    author: req.adminuser._id, // ✅ secure author
  });

  res
    .status(201)
    .json(new ApiResponse(201, "Product created successfully", product));
});

/**
 * UPDATE PRODUCT
 */
const updateProduct = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const product = await Product.findByIdAndUpdate(
    id,
    {
      ...req.body,
      author: req.adminuser._id, // optional audit trail
    },
    { new: true, runValidators: true }
  );

  if (!product) {
    return res
      .status(404)
      .json(new ApiResponse(404, "Product not found"));
  }

  res.json(new ApiResponse(200, "Product updated successfully", product));
});

/**
 * DELETE PRODUCT
 */
const deleteProduct = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const product = await Product.findByIdAndDelete(id);

  if (!product) {
    return res
      .status(404)
      .json(new ApiResponse(404, "Product not found"));
  }

  res.json(new ApiResponse(200, "Product deleted successfully"));
});

/**
 * GET ALL PRODUCTS (FILTER + PAGINATION)
 */
// const getAllProducts = asyncHandler(async (req, res) => {
//   const {
//     category,
//     subCategory,
//     minPrice,
//     maxPrice,
//     color,
//     size,
//     search,
//     page = 1,
//     limit = 10,
//   } = req.query;

//   const query = {};

//   if (category) query.category = category;
//   if (subCategory) query.subCategory = subCategory;

//   if (minPrice || maxPrice) {
//     query.$or = [
//       {
//         regularPrice: {
//           $gte: Number(minPrice) || 0,
//           $lte: Number(maxPrice) || 999999,
//         },
//       },
//       {
//         "variants.regularPrice": {
//           $gte: Number(minPrice) || 0,
//           $lte: Number(maxPrice) || 999999,
//         },
//       },
//     ];
//   }

//   if (color) query["variants.colors"] = color;
//   if (size) query["variants.sizes"] = size;

//   if (search) {
//     query.title = { $regex: search, $options: "i" };
//   }

//   const products = await Product.find(query)
//     .populate("category subCategory author")
//     .skip((page - 1) * limit)
//     .limit(Number(limit))
//     .sort({ createdAt: -1 });

//   const total = await Product.countDocuments(query);

//   res.json(
//     new ApiResponse(200, "Products fetched successfully", {
//       total,
//       page: Number(page),
//       limit: Number(limit),
//       products,
//     })
//   );
// });
const getAllProducts = asyncHandler(async (req, res) => {
  const products = await Product.find()
    .populate("category author")
    .sort({ createdAt: -1 });
  if (!products) {
    return res
      .status(404)
      .json(new ApiResponse(404, "No products found"));
  }
  res.json(
    new ApiResponse(200, "Products fetched successfully", products)
  );
});

export { createProduct, updateProduct, deleteProduct, getAllProducts };
