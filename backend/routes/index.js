//Imports:
import express from "express";
import userRouter from "../modules/users/users.api.js";
import productRouter from "../modules/products/products.api.js";
import cartRouter from "../modules/carts/cart.api.js";
//Configuring Router:
const router = express.Router();
//Routing The URL Paths:
router.use("/api/v1/users", userRouter);
router.use("/api/v1/products", productRouter);
router.use("/api/v1/carts", cartRouter);
//Export Default:
export default router;
