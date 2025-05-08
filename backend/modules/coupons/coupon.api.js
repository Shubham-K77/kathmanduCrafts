//Import
import express from "express";
import couponModel from "./coupon.Schema";
import checkToken from "../../middleware/checkToken.js";
//Config
const couponRouter = express.Router();
//Routes
// [Get Request]
//1. Fetch The Coupon {Depending Upon User And Coupon Status}
couponRouter.get("/", checkToken, async (req, res, next) => {
  try {
    const coupon = await couponModel.findOne({
      userId: req.userInfo.id,
      isActive: true,
    });
    if (!coupon) {
      const error = new Error("Unable to find the coupon!");
      res.status(404);
      return next(error);
    }
    res.status(200).send({
      message: "A coupon was found for the user!",
      status: 200,
      coupon,
    });
  } catch (error) {
    error.message = "Internal Server Error!";
    res.status(500);
    next(error);
  }
});
//2. Validate The Coupon
couponRouter.get("/verify", checkToken, async (req, res, next) => {
  try {
    const { code } = req.body;
    const couponExists = await couponModel.findOne({
      code,
      userId: req.userInfo.id,
      isActive: true,
    });
    if (!couponExists) {
      const error = new Error("Unable to find the coupon!");
      res.status(404);
      return next(error);
    }
    if (couponExists.expiresIn < new Date()) {
      couponExists.isActive = false;
      await couponExists.save();
      const error = new Error("Coupon has already expired!");
      res.status(400); //Bad-Request
      return next(error);
    }
    res.status(200).send({
      message: "Coupon is valid!",
      code: 200,
      Info: {
        couponCode: couponExists.code,
        discount: couponExists.discountRate,
      },
    });
  } catch (error) {
    error.message = "Internal Server Error!";
    res.status(500);
    next(error);
  }
});
//Export
export default couponRouter;
