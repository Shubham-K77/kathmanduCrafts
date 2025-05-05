//Imports
import mongoose from "mongoose";
//Schema
const productSchema = mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "The name of the product is mandatory"],
    },
    desc: {
      type: String,
      required: [true, "The description of the product is mandatory"],
    },
    price: {
      type: Number,
      min: 0,
      required: [true, "The price of the product is mandatory"],
    },
    image: {
      type: String,
      required: [true, "The image of the product is mandatory"],
    },
    category: {
      type: String,
      required: [true, "The category of the product is mandatory"],
    },
    isFeatured: {
      type: Boolean,
      default: false,
    },
    stockQuantity: {
      type: Number,
      required: [true, "Must specify the quantity of the product"],
    },
  },
  { timestamps: true }
);
//model
const productModel = mongoose.model("product", productSchema);
//export
export default productModel;
