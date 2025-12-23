import { Size } from "../model/size.model.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/AsyncHandler.js";

/* ================= CREATE SIZE ================= */
const createSize = asyncHandler(async (req, res) => {
    const { name, published } = req.body;

    if (!name) {
        return res
            .status(400)
            .json(new ApiResponse(400, "Size name is required"));
    }

    const exists = await Size.findOne({ name });
    if (exists) {
        return res
            .status(409)
            .json(new ApiResponse(409, "Size already exists"));
    }

    const size = await Size.create({ name, published });

    res
        .status(201)
        .json(new ApiResponse(201, "Size created successfully", size));
});

/* ================= GET ALL SIZES ================= */
const getAllSizes = asyncHandler(async (req, res) => {
    const sizes = await Size.find().sort({ createdAt: -1 });

    res
        .status(200)
        .json(new ApiResponse(200, "Sizes fetched successfully", sizes));
});

/* ================= UPDATE SIZE ================= */
const updateSize = asyncHandler(async (req, res) => {
    const { sizeId } = req.params;
    const { name, published } = req.body;

    const size = await Size.findByIdAndUpdate(
        sizeId,
        { name, published },
        { new: true, runValidators: true }
    );

    if (!size) {
        return res
            .status(404)
            .json(new ApiResponse(404, "Size not found"));
    }

    res
        .status(200)
        .json(new ApiResponse(200, "Size updated successfully", size));
});

/* ================= DELETE SIZE ================= */
const deleteSize = asyncHandler(async (req, res) => {
    const { sizeId } = req.params;

    const size = await Size.findByIdAndDelete(sizeId);

    if (!size) {
        return res
            .status(404)
            .json(new ApiResponse(404, "Size not found"));
    }

    res
        .status(200)
        .json(new ApiResponse(200, "Size deleted successfully"));
});
export {
    createSize,
    getAllSizes,
    updateSize,
    deleteSize,
};
