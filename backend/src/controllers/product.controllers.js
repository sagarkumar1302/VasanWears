// controllers/product.controller.js
import { asyncHandler } from "../utils/AsyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Product } from "../model/product.model.js";
import { SubCategory } from "../model/subcategory.model.js";
import { uploadToS3 } from "../utils/uploadToS3.js";

/**
 * Helper function to generate slug from text
 */
const generateSlug = (text) => {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '') // Remove special characters
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/-+/g, '-') // Replace multiple hyphens with single hyphen
    .replace(/^-+|-+$/g, ''); // Remove leading/trailing hyphens
};

/**
 * CREATE PRODUCT
 */
const createProduct = asyncHandler(async (req, res) => {
  const {
    title,
    slug: providedSlug,
    description,
    category,
    subCategory,
    variants,
    status,
    additionalInfo
  } = req.body;

  // Generate slug from title if not provided, or format the provided slug
  const slug = providedSlug ? generateSlug(providedSlug) : generateSlug(title);

  // ✅ PARSE COLORS & SIZES
  const colors = req.body.colors ? JSON.parse(req.body.colors) : [];
  const sizes = req.body.sizes ? JSON.parse(req.body.sizes) : [];
  if (!Array.isArray(colors) || !colors.length) {
    return res
      .status(400)
      .json(new ApiResponse(400, "At least one color is required"));
  }

  if (!Array.isArray(sizes) || !sizes.length) {
    return res
      .status(400)
      .json(new ApiResponse(400, "At least one size is required"));
  }


  /* ================= BASIC VALIDATION ================= */
  if (!title || !slug || !category) {
    return res.status(400).json(
      new ApiResponse(400, "Title, slug, category, colors and sizes are required")
    );
  }

  /* ================= DUPLICATE SLUG ================= */
  const exists = await Product.findOne({ slug });
  if (exists) {
    return res
      .status(409)
      .json(new ApiResponse(409, "Product with this slug already exists"));
  }

  /* ================= VALIDATE SUBCATEGORY ================= */
  if (subCategory) {
    const validSubCategory = await SubCategory.findOne({
      _id: subCategory,
      category,
    });

    if (!validSubCategory) {
      return res.status(400).json(
        new ApiResponse(400, "SubCategory does not belong to selected category")
      );
    }
  }

  /* ================= FILE EXTRACTION ================= */

  let featuredImageFile = null;
  let hoverImageFile = null;
  const productGalleryFiles = [];

  const designFilesBySide = {};
  for (const file of req.files || []) {
    if (file.fieldname === "featuredImage") featuredImageFile = file;
    if (file.fieldname === "hoverImage") hoverImageFile = file;
    if (file.fieldname === "gallery") productGalleryFiles.push(file);
    // if (file.fieldname === "designImages") designImageFiles.push(file);
  }

  if (!featuredImageFile || !hoverImageFile) {
    return res.status(400).json(
      new ApiResponse(400, "Featured image and hover image are required")
    );
  }

  /* ================= UPLOAD PRODUCT IMAGES ================= */

  const featuredImageUrl = await uploadToS3(
    featuredImageFile,
    "products/featured"
  );

  const hoverImageUrl = await uploadToS3(
    hoverImageFile,
    "products/hover"
  );

  const galleryMedia = [];
  for (const file of productGalleryFiles) {
    const url = await uploadToS3(file, "products/gallery");
    galleryMedia.push({
      url,
      type: file.mimetype.startsWith("video") ? "video" : "image",
    });
  }

  /* ================= DESIGN IMAGES ================= */

  /* ================= PARSE & FIX VARIANTS ================= */

  if (!variants) {
    return res
      .status(400)
      .json(new ApiResponse(400, "At least one variant is required"));
  }

  const parsedVariants = JSON.parse(variants);

  if (!parsedVariants.length) {
    return res
      .status(400)
      .json(new ApiResponse(400, "At least one variant is required"));
  }

  // Collect product-level attributes
  const productColors = new Set();
  const productSizes = new Set();

  parsedVariants.forEach((v) => {
    v.color = v.colorId;
    v.size = v.sizeId ?? null;

    delete v.colorId;
    delete v.sizeId;

    v.featuredImage = null;
    v.gallery = [];

    productColors.add(v.color);
    if (v.size) productSizes.add(v.size);
  });

  /* ================= VARIANT MEDIA ================= */

  for (const file of req.files || []) {
    if (file.fieldname.startsWith("variantFeatured_")) {
      const index = Number(file.fieldname.split("_")[1]);
      const url = await uploadToS3(
        file,
        `products/variants/${index}/featured`
      );
      parsedVariants[index].featuredImage = url;
    }

    if (file.fieldname.startsWith("variantGallery_")) {
      const index = Number(file.fieldname.split("_")[1]);
      const url = await uploadToS3(
        file,
        `products/variants/${index}/gallery`
      );

      parsedVariants[index].gallery.push({
        url,
        type: file.mimetype.startsWith("video") ? "video" : "image",
      });
    }
  }

  /* ================= VARIANT VALIDATION ================= */

  for (const variant of parsedVariants) {
    if (!variant.sku || !variant.regularPrice || variant.stock === undefined) {
      return res
        .status(400)
        .json(new ApiResponse(400, "Variant fields missing"));
    }

    if (!variant.featuredImage) {
      return res
        .status(400)
        .json(new ApiResponse(400, "Each variant must have a featured image"));
    }
  }
  const tags = req.body.tags ? JSON.parse(req.body.tags) : [];

  if (!Array.isArray(tags)) {
    return res
      .status(400)
      .json(new ApiResponse(400, "Tags must be an array"));
  }

  /* ================= CREDITS ================= */
  const credits = req.body.credits || null;

  /* ================= CREATE PRODUCT ================= */

  const product = await Product.create({
    title,
    slug,
    description,
    category,
    subCategory: subCategory || null,
    colors,
    sizes,
    tags,
    variants: parsedVariants,
    featuredImage: featuredImageUrl,
    hoverImage: hoverImageUrl,
    gallery: galleryMedia,
    status,
    credits,
    additionalInfo,
    author: req.adminuser._id,
  });

  res.status(201).json(
    new ApiResponse(201, "Product created successfully", product)
  );
});



/**
 * UPDATE PRODUCT
 */
const updateProduct = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const product = await Product.findById(id);
  if (!product) {
    return res
      .status(404)
      .json(new ApiResponse(404, "Product not found"));
  }

  const {
    title,
    slug: providedSlug,
    description,
    category,
    subCategory,
    variants,
    status,
    additionalInfo
  } = req.body;

  /* ================= BASIC FIELDS ================= */
  if (title) product.title = title;
  if (providedSlug) {
    product.slug = generateSlug(providedSlug);
  } else if (title && !providedSlug) {
    // Auto-generate slug from new title if slug not provided
    product.slug = generateSlug(title);
  }
  if (description) product.description = description;
  if (category) product.category = category;
  if (status) product.status = status;
  product.author = req.adminuser._id;

  /* ================= COLORS & SIZES ================= */
  if (req.body.colors) {
    const colors = JSON.parse(req.body.colors);
    if (!Array.isArray(colors) || !colors.length) {
      return res
        .status(400)
        .json(new ApiResponse(400, "At least one color is required"));
    }
    product.colors = colors;
  }

  if (req.body.sizes) {
    const sizes = JSON.parse(req.body.sizes);
    if (!Array.isArray(sizes) || !sizes.length) {
      return res
        .status(400)
        .json(new ApiResponse(400, "At least one size is required"));
    }
    product.sizes = sizes;
  }
  /* ================= TAGS ================= */
  if (req.body.tags) {
    const tags = JSON.parse(req.body.tags);

    if (!Array.isArray(tags)) {
      return res
        .status(400)
        .json(new ApiResponse(400, "Tags must be an array"));
    }

    product.tags = tags; // ✅ overwrite safely
  }

  /* ================= CREDITS ================= */
  if (req.body.credits !== undefined) {
    product.credits = req.body.credits || null;
  }

  /* ================= SUBCATEGORY VALIDATION ================= */
  if (subCategory) {
    const validSubCategory = await SubCategory.findOne({
      _id: subCategory,
      category: category || product.category,
    });

    if (!validSubCategory) {
      return res.status(400).json(
        new ApiResponse(400, "SubCategory does not belong to selected category")
      );
    }
    product.subCategory = subCategory;
  }

  /* ================= FILE EXTRACTION ================= */
  let featuredImageFile = null;
  let hoverImageFile = null;
  const galleryFiles = [];


  for (const file of req.files || []) {
    if (file.fieldname === "featuredImage") featuredImageFile = file;
    if (file.fieldname === "hoverImage") hoverImageFile = file;
    if (file.fieldname === "gallery") galleryFiles.push(file);
    
  }

  /* ================= IMAGE UPDATES ================= */
  if (featuredImageFile) {
    product.featuredImage = await uploadToS3(
      featuredImageFile,
      "products/featured"
    );
  }
  if(additionalInfo){
    product.additionalInfo = additionalInfo;
  }

  if (hoverImageFile) {
    product.hoverImage = await uploadToS3(
      hoverImageFile,
      "products/hover"
    );
  }

  if (galleryFiles.length) {
    const galleryMedia = [];
    for (const file of galleryFiles) {
      const url = await uploadToS3(file, "products/gallery");
      galleryMedia.push({
        url,
        type: file.mimetype.startsWith("video") ? "video" : "image",
      });
    }
    product.gallery = galleryMedia; // overwrite gallery
  }

  /* ================= DESIGN IMAGES ================= */
  /* ================= VARIANTS ================= */
  if (variants) {
    const parsedVariants = JSON.parse(variants);

    if (!parsedVariants.length) {
      return res
        .status(400)
        .json(new ApiResponse(400, "At least one variant is required"));
    }

    parsedVariants.forEach((v) => {
      v.color = v.colorId;
      v.size = v.sizeId ?? null;

      delete v.colorId;
      delete v.sizeId;

      if (!v.gallery) v.gallery = [];
      if (!v.featuredImage) v.featuredImage = null;
    });

    /* ===== Variant Media ===== */
    for (const file of req.files || []) {
      if (file.fieldname.startsWith("variantFeatured_")) {
        const index = Number(file.fieldname.split("_")[1]);
        const url = await uploadToS3(
          file,
          `products/variants/${index}/featured`
        );
        parsedVariants[index].featuredImage = url;
      }

      if (file.fieldname.startsWith("variantGallery_")) {
        const index = Number(file.fieldname.split("_")[1]);
        const url = await uploadToS3(
          file,
          `products/variants/${index}/gallery`
        );
        parsedVariants[index].gallery.push({
          url,
          type: file.mimetype.startsWith("video") ? "video" : "image",
        });
      }
    }

    /* ===== Variant Validation ===== */
    for (const variant of parsedVariants) {
      if (
        !variant.sku ||
        !variant.regularPrice ||
        variant.stock === undefined
      ) {
        return res
          .status(400)
          .json(new ApiResponse(400, "Variant fields missing"));
      }
    }

    product.variants = parsedVariants;
  }

  /* ================= SAVE ================= */
  await product.save();

  res.json(
    new ApiResponse(200, "Product updated successfully", product)
  );
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
const getProductById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const product = await Product.findById(id)
    .populate({
      path: "author",
      select: "fullName", // ✅ only fullName
    })
    .populate({
      path: "category",
      select: "name", // ✅ only name
    })
    .populate({
      path: "subCategory",
      select: "name", // ✅ only name
    })
    .populate({
      path: "credits",
      select: "fullName", // ✅ only name
    })
    .lean();

  if (!product) {
    return res
      .status(404)
      .json(new ApiResponse(404, "Product not found"));
  }
  res.status(200).json(
    new ApiResponse(200, "Product fetched successfully", product)
  );
});
const getProductBySlug = asyncHandler(async (req, res) => {
  const { slug } = req.params;

  const product = await Product.findOne({ slug })
    .populate({
      path: "author",
      select: "fullName", // ✅ only fullName
    })
    .populate({
      path: "category",
      select: "name", // ✅ only name
    })
    .populate({
      path: "subCategory",
      select: "name", // ✅ only name
    })
    .populate({
      path: "colors",
      select: "name hexCode", // ✅ only name and hexCode
    })
    .populate({
      path: "sizes",
      select: "name", // ✅ only name
    })
    .populate({
      path: "credits",
      select: "fullName", // ✅ only fullName
    })
    .lean();

  if (!product) {
    return res
      .status(404)
      .json(new ApiResponse(404, "Product not found"));
  }
  res.status(200).json(
    new ApiResponse(200, "Product fetched successfully", product)
  );
});


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
    .populate({
      path: "author",
      select: "fullName", // ✅ only fullName
    })
    .populate({
      path: "category",
      select: "name", // ✅ only name
    })
    .populate({
      path: "subCategory",
      select: "name", // ✅ only name
    })
    .sort({ createdAt: -1 })
    .lean();

  if (!products.length) {
    return res
      .status(404)
      .json(new ApiResponse(404, "No products found"));
  }

  res.status(200).json(
    new ApiResponse(200, "Products fetched successfully", products)
  );
});
const getAllProductsForWebsite = asyncHandler(async (req, res) => {
  const products = await Product.find({ status: "published" })
    .populate({
      path: "category",
      select: "name", // ✅ only name
    })
    .populate({
      path: "subCategory",
      select: "name", // ✅ only name
    })
    .populate({
      path: "credits",
      select: "fullName", // ✅ only fullName
    })
    .sort({ createdAt: -1 })
    .lean();

  if (!products.length) {
    return res
      .status(404)
      .json(new ApiResponse(404, "No products found"));
  }

  res.status(200).json(
    new ApiResponse(200, "Products fetched successfully", products)
  );
});


export { createProduct, updateProduct, deleteProduct, getAllProducts, getProductById, getProductBySlug, getAllProductsForWebsite };
