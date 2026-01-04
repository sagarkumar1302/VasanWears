import { WishList } from "../model/wishlist.model.js";
import { ApiResponse } from "../utils/ApiResponse.js";

/**
 * TOGGLE WISHLIST (ADD / REMOVE)
 */
const toggleWishlist = async (req, res) => {
    try {
        const userId = req.user._id;
        const { productId } = req.body;

        if (!productId) {
            return res.status(400).json(new ApiResponse(400, "Product ID required"));
        }

        let wishlist = await WishList.findOne({ user: userId });

        if (!wishlist) {
            wishlist = await WishList.create({
                user: userId,
                items: [],
            });
        }

        const exists = wishlist.items.find(
            (item) =>
                item.product.toString() === productId
        );

        if (exists) {
            // remove
            wishlist.items = wishlist.items.filter(
                (item) => item.product.toString() !== productId
            );
        } else {
            // add
            wishlist.items.push({ product: productId });
        }

        await wishlist.save();

        return res
            .status(200)
            .json(new ApiResponse(200, "Wishlist updated", wishlist));
    } catch (error) {
        res.status(500).json(new ApiResponse(500, error.message));
    }
};

/**
 * GET USER WISHLIST
 */
const getWishlist = async (req, res) => {
    try {
        const wishlist = await WishList.findOne({ user: req.user._id })
            .populate("items.product")
            .lean();

        const productIds = wishlist
            ? wishlist.items.map((item) => item.product._id.toString())
            : [];

        return res.status(200).json(
            new ApiResponse(200, "Wishlist fetched", {
                productIds,
                items: wishlist?.items || [],
            })
        );
    } catch (error) {
        return res
            .status(500)
            .json(new ApiResponse(500, error.message));
    }
};



export { toggleWishlist, getWishlist };