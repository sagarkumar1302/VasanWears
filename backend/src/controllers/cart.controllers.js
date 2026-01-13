import { Cart } from "../model/cart.model.js";
import { Product } from "../model/product.model.js";
import { ApiResponse } from "../utils/ApiResponse.js";

const calculateSubtotal = (items) =>
  items.reduce((sum, item) => sum + item.price * item.quantity, 0);


  const addToCart = async (req, res) => {
  try {
    const userId = req.user._id;
    const {
      itemType,
      productId,
      colorId,
      sizeId,
      quantity,
      design,
      price,
      variantData, // Accept full variant data from frontend
    } = req.body;

    if (!itemType || !quantity || quantity < 1) {
      return res
        .status(400)
        .json(new ApiResponse(400, "Invalid cart data"));
    }

    let cart = await Cart.findOne({ user: userId });
    if (!cart) {
      cart = await Cart.create({ user: userId, items: [], subtotal: 0 });
    }

    /* =========================
       CATALOG PRODUCT
    ========================= */
    if (itemType === "catalog") {
      if (!productId || !colorId || !sizeId) {
        return res
          .status(400)
          .json(new ApiResponse(400, "Product, color & size required"));
      }

      const product = await Product.findById(productId);
      if (!product) {
        return res
          .status(404)
          .json(new ApiResponse(404, "Product not found"));
      }

      const variant = product.variants.find(
        (v) => v.color.toString() === colorId
      );

      if (!variant) {
        return res
          .status(404)
          .json(new ApiResponse(404, "Variant not found"));
      }

      const finalPrice = variant.salePrice ?? variant.regularPrice;

      const existingItem = cart.items.find(
        (i) =>
          i.itemType === "catalog" &&
          i.product?.toString() === productId &&
          i.color?.toString() === colorId &&
          i.size?.toString() === sizeId
      );

      if (existingItem) {
        if (variant.stock < existingItem.quantity + quantity) {
          return res
            .status(400)
            .json(new ApiResponse(400, "Insufficient stock"));
        }
        existingItem.quantity += quantity;
      } else {
        if (variant.stock < quantity) {
          return res
            .status(400)
            .json(new ApiResponse(400, "Insufficient stock"));
        }

        cart.items.push({
          itemType: "catalog",
          product: productId,
          variant: variant._id,
          color: colorId,
          size: sizeId,
          sku: variant.sku,
          quantity,
          price: finalPrice,
          variantData: variantData || {
            _id: variant._id,
            sku: variant.sku,
            images: variant.images,
            regularPrice: variant.regularPrice,
            salePrice: variant.salePrice,
            stock: variant.stock,
            color: variant.color,
            size: variant.size,
          },
        });
      }
    }

    /* =========================
       CUSTOM DESIGN PRODUCT
    ========================= */
    if (itemType === "custom") {
      console.log("Design: ",design);
      
      if (
        !design ||
        !design.designId ||
        !design.images ||
        !design.size ||
        !design.color ||
        !price
      ) {
        return res
          .status(400)
          .json(new ApiResponse(400, "Invalid custom design data"));
      }

      const existingCustom = cart.items.find(
        (i) =>
          i.itemType === "custom" &&
          i.design.designId.toString() === design.designId &&
          i.design.size?.name === design.size?.name &&
          i.design.color?.name === design.color?.name
      );

      if (existingCustom) {
        existingCustom.quantity += quantity;
      } else {
        cart.items.push({
          itemType: "custom",
          design,
          quantity,
          price,
        });
      }
    }

    cart.subtotal = calculateSubtotal(cart.items);
    await cart.save();

    res
      .status(200)
      .json(new ApiResponse(200, "Item added to cart", cart));
  } catch (error) {
    res.status(500).json(new ApiResponse(500, error.message));
  }
};


const getCart = async (req, res) => {
  try {
    const cart = await Cart.findOne({ user: req.user._id })
      .populate("items.product")
      .populate("items.color")
      .populate("items.size")
      .populate("items.design.designId");

    res.status(200).json(
      new ApiResponse(
        200,
        "Cart fetched successfully",
        cart || { items: [], subtotal: 0 }
      )
    );
  } catch (error) {
    res.status(500).json(new ApiResponse(500, error.message));
  }
};



const removeFromCart = async (req, res) => {
  try {
    const { itemId } = req.params;

    const cart = await Cart.findOne({ user: req.user._id });
    if (!cart) {
      return res.status(404).json(
        new ApiResponse(404, "Cart not found")
      );
    }

    const itemExists = cart.items.id(itemId);
    if (!itemExists) {
      return res.status(404).json(
        new ApiResponse(404, "Item not found")
      );
    }

    // ✅ CORRECT WAY
    cart.items.pull(itemId);

    cart.subtotal = calculateSubtotal(cart.items);
    await cart.save();

    return res.status(200).json(
      new ApiResponse(200, "Item removed from cart", cart)
    );
  } catch (error) {
    return res.status(500).json(
      new ApiResponse(500, error.message)
    );
  }
};




/**
 * CLEAR CART
 */
const clearCart = async (req, res) => {
  try {
    const cart = await Cart.findOneAndUpdate(
      { user: req.user._id },
      { items: [], subtotal: 0 },
      { new: true }
    );

    res
      .status(200)
      .json(
        new ApiResponse(200, "Cart cleared successfully", cart)
      );
  } catch (error) {
    res.status(500).json(new ApiResponse(500, error.message));
  }
};


const updateCartItem = async (req, res) => {
  try {
    const { itemId } = req.params;
    const { quantity } = req.body;

    if (!quantity || quantity < 1) {
      return res
        .status(400)
        .json(new ApiResponse(400, "Quantity must be at least 1"));
    }

    const cart = await Cart.findOne({ user: req.user._id });
    if (!cart) {
      return res
        .status(404)
        .json(new ApiResponse(404, "Cart not found"));
    }

    const item = cart.items.id(itemId);
    if (!item) {
      return res
        .status(404)
        .json(new ApiResponse(404, "Item not found"));
    }

    if (item.itemType === "catalog") {
      const product = await Product.findById(item.product);
      const variant = product?.variants?.id(item.variant);

      if (!variant || variant.stock < quantity) {
        return res
          .status(400)
          .json(new ApiResponse(400, "Insufficient stock"));
      }
    }

    item.quantity = quantity;
    cart.subtotal = calculateSubtotal(cart.items);

    await cart.save();

    res
      .status(200)
      .json(
        new ApiResponse(200, "Cart item updated successfully", cart)
      );
  } catch (error) {
    res.status(500).json(new ApiResponse(500, error.message));
  }
};




export { addToCart, getCart, removeFromCart, clearCart, updateCartItem };