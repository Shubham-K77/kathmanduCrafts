//Imports
import express from "express";
import checkToken from "../../middleware/checkToken.js";
import productModel from "../products/products.Schema.js";
//Config
const cartRouter = express.Router();
//API Routes
// [Get Request]
// 1. Get The Cart Items
cartRouter.get("/", checkToken, async (req, res, next) => {
  try {
    await req.userInfo.populate("cartItems.product");
    const cartItems = req.userInfo.cartItems;
    res
      .status(200)
      .send({ message: "Cart info retrieved", code: 200, cartItems });
  } catch (error) {
    error.message = "Internal Server Error!";
    res.status(500);
    next(error);
  }
});

// [Post Request]
// 1. Add To Cart
cartRouter.post("/add/:id", checkToken, async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!id || !id?.trim()) {
      const error = new Error(
        "Must provide the productId info to complete the request"
      );
      res.status(400); //Bad-Request
      return next(error);
    }
    const user = req.userInfo;
    const productExists = await productModel.findById(id);
    if (!productExists) {
      const error = new Error("Unable to fetch the product information!");
      res.status(404); //Not-Found
      return next(error);
    }
    const existingItem = user.cartItems.find(
      (item) => item.product.toString() === id
    );
    if (existingItem) {
      //Check Against Stock Quantity
      if (existingItem.quantity + 1 > productExists.stockQuantity) {
        const error = new Error("Requested quantity exceeds available stock.");
        res.status(400); //Bad Request
        return next(error);
      }
      existingItem.quantity += 1;
    } else {
      // Check that initial quantity doesn't exceed stock
      if (1 > productExists.stockQuantity) {
        const error = new Error("Product is out of stock.");
        res.status(400); //Bad Request
        return next(error);
      }
      user.cartItems.push({ quantity: 1, product: id });
    }
    const updateUserInfo = await user.save();
    if (!updateUserInfo) {
      const error = new Error("Failed to update cart.");
      res.status(500);
      return next(error);
    }
    res.status(200).send({
      message: "Product is added to the cart.",
      code: 200,
      cart: user.cartItems,
    });
  } catch (error) {
    error.message = "Internal Server Error!";
    res.status(500);
    next(error);
  }
});

// [Update Request]
// 1. Update The Cart Quantity
cartRouter.put("/:id", checkToken, async (req, res, next) => {
  try {
    const { id } = req.params;
    const user = req.userInfo;
    if (!id || !id?.trim()) {
      const error = new Error("Must provide productId.");
      res.status(400); //Bad-Request
      return next(error);
    }
    const { quantity } = req.body;
    const productExists = await productModel.findById(id);
    if (!productExists) {
      const error = new Error("Product info wasn't found!");
      res.status(404); //Not-Found
      return next(error);
    }
    const existingItem = user.cartItems.find(
      (item) => item.product.toString() === id
    );
    if (existingItem) {
      if (quantity === 0 || quantity <= 0) {
        user.cartItems = user.cartItems.filter(
          (item) => item.product.toString() !== id
        );
        await user.save();
        return res.status(200).send({
          message: "The product is removed from cart!",
          code: 200,
          cart: user.cartItems,
        });
      }
      if (quantity > productExists.stockQuantity) {
        const error = new Error("Requested quantity exceeds stock.");
        res.status(400);
        return next(error);
      }
      existingItem.quantity = quantity;
      await user.save();
      return res.status(200).send({
        message: "The product is updated on the cart!",
        code: 200,
        cart: user.cartItems,
      });
    } else {
      const error = new Error("The product info wasn't found in the cart!");
      res.status(404);
      return next(error);
    }
  } catch (error) {
    error.message = "Internal Server Error!";
    res.status(500);
    next(error);
  }
});

// [Delete Request]
// 1. Delete Item or All The Items From Cart
cartRouter.delete("/", checkToken, async (req, res, next) => {
  try {
    const { id } = req.body;
    const user = req.userInfo;
    if (id && id.trim()) {
      const productExists = await productModel.findById(id);
      if (!productExists) {
        const error = new Error("The product info wasn't found.");
        res.status(404); //Not-Found
        return next(error);
      }
      user.cartItems = user.cartItems.filter(
        (item) => item.product.toString() !== id
      );
    } else {
      user.cartItems = [];
    }
    const updateUserInfo = await user.save();
    if (!updateUserInfo) {
      const error = new Error("Failed to update cart.");
      res.status(500);
      return next(error);
    }
    res.status(200).send({
      message: id && id.trim() ? "Product removed from cart!" : "Cart cleared!",
      code: 200,
      cart: user.cartItems,
    });
  } catch (error) {
    error.message = "Internal Server Error!";
    res.status(500);
    next(error);
  }
});

//Export
export default cartRouter;
