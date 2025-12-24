import { Color } from "../model/color.model.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/AsyncHandler.js";

/* ================= CREATE COLOR ================= */
const createColor = asyncHandler(async (req, res) => {
    const { name, hexCode, published } = req.body;

    if (!name || !hexCode) {
        return res
            .status(400)
            .json(new ApiResponse(400, "Name and hexCode are required"));
    }

    const exists = await Color.findOne({ name });
    if (exists) {
        return res
            .status(409)
            .json(new ApiResponse(409, "Color already exists"));
    }

    const color = await Color.create({ name, hexCode, published });

    res
        .status(201)
        .json(new ApiResponse(201, "Color created successfully", color));
});

/* ================= GET ALL COLORS ================= */
const getAllColors = asyncHandler(async (req, res) => {
    const colors = await Color.find().sort({ createdAt: -1 });

    res
        .status(200)
        .json(new ApiResponse(200, "Colors fetched successfully", colors));
});
const getAllColorsWebsite = asyncHandler(async (req, res) => {
    const colors = await Color.find({ published: true }).sort({ createdAt: -1 }).select('name hexCode');

    res
        .status(200)
        .json(new ApiResponse(200, "Colors fetched successfully", colors));
});

/* ================= UPDATE COLOR ================= */
const updateColor = asyncHandler(async (req, res) => {
    const { colorId } = req.params;
    const { name, hexCode, published } = req.body;

    const color = await Color.findByIdAndUpdate(
        colorId,
        { name, hexCode, published },
        { new: true, runValidators: true }
    );

    if (!color) {
        return res
            .status(404)
            .json(new ApiResponse(404, "Color not found"));
    }

    res
        .status(200)
        .json(new ApiResponse(200, "Color updated successfully", color));
});

/* ================= DELETE COLOR ================= */
const deleteColor = asyncHandler(async (req, res) => {
    const { colorId } = req.params;

    const color = await Color.findByIdAndDelete(colorId);

    if (!color) {
        return res
            .status(404)
            .json(new ApiResponse(404, "Color not found"));
    }

    res
        .status(200)
        .json(new ApiResponse(200, "Color deleted successfully"));
});

export {
    createColor,
    getAllColors,
    updateColor,
    deleteColor,
    getAllColorsWebsite
};