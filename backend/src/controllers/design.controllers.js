import { Design } from "../model/design.model.js";
import { asyncHandler } from "../utils/AsyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { uploadBase64ToS3 } from "../utils/uploadToS3.js";

/**
 * CREATE DESIGN
 */
export const createDesign = asyncHandler(async (req, res) => {
  const { title, images, sellPrice, isPublic } = req.body;

  if (!title || !images || !sellPrice) {
    return res
      .status(400)
      .json(new ApiResponse(400, "Required fields missing"));
  }

  // At least one side image is required
  if (!images.front && !images.back) {
    return res
      .status(400)
      .json(new ApiResponse(400, "At least one side image is required"));
  }

  // Upload images (base64) to S3
  const uploadedImages = {};
  for (const key of Object.keys(images)) {
    if (images[key]) {
      uploadedImages[key] = await uploadBase64ToS3(images[key], "designs");
    }
  }

  const design = await Design.create({
    title,
    images: uploadedImages,
    sellPrice,
    isPublic,
    createdBy: req.user._id,
  });

  res.status(201).json(
    new ApiResponse(201, "Design created successfully", design)
  );
});

/**
 * LIKE / UNLIKE DESIGN
 */
export const toggleLikeDesign = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const design = await Design.findById(id);
  if (!design) {
    return res
      .status(404)
      .json(new ApiResponse(404, "Design not found"));
  }

  const userId = req.user._id;
  const alreadyLiked = design.likedBy.includes(userId);

  if (alreadyLiked) {
    design.likedBy.pull(userId);
    design.likesCount -= 1;
  } else {
    design.likedBy.push(userId);
    design.likesCount += 1;
  }

  await design.save();

  res.json(
    new ApiResponse(200, "Like status updated", {
      likesCount: design.likesCount,
      liked: !alreadyLiked,
    })
  );
});

/**
 * GET ALL PUBLIC DESIGNS
 */
export const getAllDesigns = asyncHandler(async (req, res) => {
  const designs = await Design.find({ isPublic: true })
    .populate("createdBy", "name email")
    .sort({ createdAt: -1 });

  res.json(
    new ApiResponse(200, "Designs fetched successfully", designs)
  );
});

/**
 * GET DESIGNS OF LOGGED-IN USER
 */
export const getMyDesigns = asyncHandler(async (req, res) => {
  const designs = await Design.find({ createdBy: req.user._id })
    .sort({ createdAt: -1 });

  res.json(
    new ApiResponse(200, "Your designs fetched successfully", designs)
  );
});

/**
 * UPDATE DESIGN (publish / unpublish)
 */
export const updateDesignVisibility = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { isPublic } = req.body;

  const design = await Design.findById(id);
  if (!design) {
    return res
      .status(404)
      .json(new ApiResponse(404, "Design not found"));
  }

  // only owner or admin
  if (design.createdBy.toString() !== req.user._id.toString()) {
    return res
      .status(403)
      .json(new ApiResponse(403, "Not authorized"));
  }

  design.isPublic = isPublic;
  await design.save();

  res.json(
    new ApiResponse(200, "Design updated successfully", design)
  );
});
