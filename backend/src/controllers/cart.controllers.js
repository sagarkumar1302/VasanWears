import { Cart } from "../model/cart.model.js";
import { Product } from "../model/product.model.js";
import { ApiResponse } from "../utils/ApiResponse.js";


/**
 * ADD / UPDATE CART ITEM
 */
const addToCart = async (req, res) => {
    try {
        const userId = req.user._id;
        const { productId, variantId, quantity } = req.body;

        if (!productId || !variantId || !quantity) {
            return res
                .status(400)
                .json(new ApiResponse(400, "Missing required fields"));
        }

        const product = await Product.findById(productId);
        if (!product) {
            return res
                .status(404)
                .json(new ApiResponse(404, "Product not found"));
        }

        const variant = product.variants.id(variantId);
        if (!variant) {
            return res
                .status(404)
                .json(new ApiResponse(404, "Variant not found"));
        }

        if (variant.stock < quantity) {
            return res
                .status(400)
                .json(new ApiResponse(400, "Insufficient stock"));
        }

        const price = variant.salePrice || variant.regularPrice;

        let cart = await Cart.findOne({ user: userId });
        if (!cart) {
            cart = await Cart.create({ user: userId, items: [] });
        }

        const existingItem = cart.items.find(
            (item) => item.variant.toString() === variantId
        );

        if (existingItem) {
            existingItem.quantity += quantity;
        } else {
            cart.items.push({
                product: productId,
                variant: variantId,
                color: variant.color,
                size: variant.size,
                sku: variant.sku,
                quantity,
                price,
            });
        }

        cart.subtotal = cart.items.reduce(
            (sum, item) => sum + item.price * item.quantity,
            0
        );

        await cart.save();

        return res
            .status(200)
            .json(new ApiResponse(200, "Item added to cart", cart));
    } catch (error) {
        return res
            .status(500)
            .json(new ApiResponse(500, error.message));
    }
};
const getCart = async (req, res) => {
    try {
        const cart = await Cart.findOne({ user: req.user._id })
            .populate("items.product")
            .populate("items.color")
            .populate("items.size");

        return res
            .status(200)
            .json(
                new ApiResponse(
                    200,
                    "Cart fetched successfully",
                    cart || { items: [] }
                )
            );
    } catch (error) {
        return res
            .status(500)
            .json(new ApiResponse(500, error.message));
    }
};
const removeFromCart = async (req, res) => {
    try {
        const { itemId } = req.params;

        const cart = await Cart.findOne({ user: req.user._id });
        if (!cart) return res.status(404).json(new ApiResponse(404, "Cart not found"));

        cart.items = cart.items.filter(
            (item) => item._id.toString() !== itemId
        );

        cart.subtotal = cart.items.reduce(
            (sum, item) => sum + item.price * item.quantity,
            0
        );

        await cart.save();

        res.status(200).json(new ApiResponse(200, "Item removed from cart", cart));
    } catch (error) {
        res.status(500).json(new ApiResponse(500, error.message));
    }
};

/**
 * CLEAR CART
 */
const clearCart = async (req, res) => {
    try {
        await Cart.findOneAndUpdate(
            { user: req.user._id },
            { items: [], subtotal: 0 }
        );

        res.status(200).json(new ApiResponse(200, "Cart cleared successfully"));
    } catch (error) {
        res.status(500).json(new ApiResponse(500, error.message));
    }
};
const updateCartItem = async (req, res) => {
    try {
        const { itemId } = req.params;
        const { quantity } = req.body;
        const cart = await Cart.findOne({ user: req.user._id });
        if (!cart) return res.status(404).json(new ApiResponse(404, "Cart not found"));
        const item = cart.items.id(itemId);
        if (!item) return res.status(404).json(new ApiResponse(404, "Item not found"));
        item.quantity = quantity;
        cart.subtotal = cart.items.reduce(
            (sum, item) => sum + item.price * item.quantity,
            0
        );
        await cart.save();
        res.status(200).json(new ApiResponse(200, "Item quantity updated successfully", cart));
    } catch (error) {
        res.status(500).json(new ApiResponse(500, error.message));
    }
};
export { addToCart, getCart, removeFromCart, clearCart, updateCartItem };