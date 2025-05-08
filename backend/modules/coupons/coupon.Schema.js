//Import
import mongoose from "mongoose";
//Schema
const couponSchema = mongoose.Schema(
  {
    code: {
      type: String,
      required: [true, "Coupon code must be provided!"],
      unique: [true, "Every coupon code must be unique!"],
    },
    discountRate: {
      type: Number,
      required: [true, "Coupon must specify a certain discount rate!"],
      min: 0,
      max: 100,
    },
    expiresIn: {
      type: Date,
      required: [true, "Must specify the expiring date for coupon!"],
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
      required: [true, "Coupon must be assigned to a user!"],
      unique: [
        true,
        "The userId must be unique, only a coupon is assigned to a user at once.",
      ],
    },
  },
  { timestamps: true }
);
//Export Model
const couponModel = mongoose.model("coupon", couponSchema);
export default couponModel;
