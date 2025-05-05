//Import
import express from "express";
import checkToken from "../../middleware/checkToken.js";
import checkRole from "../../middleware/checkRole.js";
import productModel from "../products/products.Schema.js";
import redis from "../../config/redisConfig.js";
import cloudinary from "../../config/cloudinaryConfig.js";
import updateCacheInfo from "../../services/updateCache.js";

//Config
const productRouter = express.Router();

//API Routes

// [Get Request]
// 1. Fetch All Products
productRouter.get("/", checkToken, checkRole, async (req, res, next) => {
  const products = await productModel.find({});
  if (!products) {
    const error = new Error("Unable to fetch the products info.");
    res.status(500);
    return next(error);
  }
  res.status(200).send({
    message: "Successfully retrieved the informations!",
    code: 200,
    products,
  });
});
// 2. Fetch Featured Products
productRouter.get("/featured", async (req, res, next) => {
  try {
    let featuredProducts = await redis.get("featured_products");
    //exists in redis
    if (featuredProducts) {
      return res.status(200).send({
        message: "Product information was retrieved!",
        code: 200,
        featuredProducts,
      });
    }
    //if not in redis, fetch from mongodb
    featuredProducts = await productModel.find({ isFeatured: true }).lean();
    if (!featuredProducts) {
      const error = new Error("No information was found in the platform");
      res.status(404);
      return next(error);
    }
    //store in redis for future access
    await redis.set("featured_products", JSON.stringify(featuredProducts));
    //response
    res.status(200).send({
      message: "Featured product information was retrieved",
      code: 200,
      featuredProducts,
    });
  } catch (error) {
    error.message = "Internal Server Error!";
    res.status(500);
    next(error);
  }
});
// 3. Recommended Products
productRouter.get("/recommend", async (req, res, next) => {
  try {
    // Aggregation Pipeline
    const products = await productModel.aggregate([
      {
        $sample: { size: 3 },
      },
      {
        $project: {
          _id: 1,
          name: 1,
          desc: 1,
          price: 1,
          image: 1,
        },
      },
    ]);
    if (!products) {
      const error = new Error("Unable to fetch the information!");
      res.status(500); //Internal Server Error
      return next(error);
    }
    res
      .status(200)
      .send({ message: "Products info obtained!", code: 200, products });
  } catch (error) {
    error.message = "Internal Server Error!";
    res.status(500);
    next(error);
  }
});
// 4. Category Info
productRouter.get("/category/:category", async (req, res, next) => {
  try {
    const { category } = req.params;
    if (!category || !category?.trim()) {
      const error = new Error("Must provide a category to search for.");
      res.status(400); //Bad-Request
      return next(error);
    }
    const categoryInfo = await productModel.find({ category });
    if (!categoryInfo) {
      const error = new Error("Unable to retrieve the post info");
      res.status(500);
      return next(error);
    }
    res
      .status(200)
      .send({ message: "Category info extracted!", code: 200, categoryInfo });
  } catch (error) {
    error.message = "Internal Server Error!";
    res.status(500);
    next(error);
  }
});

// [Post Request]
// 1. Create Product
productRouter.post("/create", checkToken, checkRole, async (req, res, next) => {
  try {
    const { name, desc, price, image, category } = req.body;
    if (
      !name?.trim() ||
      !desc?.trim() ||
      !price?.trim() ||
      !category?.trim() ||
      !image?.trim()
    ) {
      const error = new Error("The product information was missing.");
      res.status(400); //Bad-Request
      return next(error);
    }
    if (image) {
      const cloudinaryResponse = await cloudinary.uploader.upload(image, {
        folder: "products",
      });
    }
    const product = await productModel.create({
      name,
      desc,
      price,
      image: cloudinaryResponse?.secure_url
        ? cloudinaryResponse?.secure_url
        : "",
      category,
    });
    if (!product) {
      const error = new Error("The product wasn't stored in the database.");
      res.status(500);
      return next(error);
    }
    res
      .status(201)
      .send({ message: "Successfully created!", code: 201, product });
  } catch (error) {
    error.message = "Internal Server Error!";
    res.status(500);
    next(error);
  }
});

// [Patch Request]
// 1. Update The Featured Product
productRouter.patch(
  "/setFeatured/:productId",
  checkToken,
  checkRole,
  async (req, res, next) => {
    try {
      const { productId } = req.params;
      if (!productId || !productId?.trim()) {
        const error = new Error("Must provide the productId to search for.");
        res.status(400); //Bad-Request
        return next(error);
      }
      const productExists = await productModel.findById(productId);
      if (!productExists) {
        const error = new Error("The product info wasn't found.");
        res.status(404); //Not-Found
        return next(error);
      }
      const updateInfo = productExists.isFeatured
        ? await productModel.findByIdAndUpdate(
            productExists._id,
            {
              isFeatured: false,
            },
            { new: true }
          )
        : await productModel.findByIdAndUpdate(
            productExists._id,
            {
              isFeatured: true,
            },
            { new: true }
          );
      if (!updateInfo) {
        const error = new Error("Unable to update the info!");
        res.status(500);
        return next(error);
      }
      await updateCacheInfo();
      res.status(200).send({
        message: "Successfully updated into featured product!",
        code: 200,
        updateInfo,
      });
    } catch (error) {
      error.message = "Internal Server Error!";
      res.status(500);
      next(error);
    }
  }
);

// [Delete Request]
// 1. Delete Product
productRouter.delete(
  "/delete/:id",
  checkToken,
  checkRole,
  async (req, res, next) => {
    try {
      const { id } = req.params;
      const productExists = await productModel.findById(id);
      // check for the product
      if (!productExists) {
        const error = new Error("Product doesn't exist in the system.");
        res.status(404); //Not-Found
        return next(error);
      }
      // delete image from cloud
      if (productExists.image) {
        const publicId = productExists.image.split("/").pop().split(".")[0];
        try {
          await cloudinary.uploader.destroy(`products/${publicId}`);
        } catch (error) {
          error.message = "Unable to delete the image from the cloud!";
          res.status(500);
          next(error);
        }
      }
      // delete from db
      const deleteProduct = await productModel.findByIdAndDelete(id);
      // check of the info is deleted
      if (!deleteProduct) {
        const error = new Error("Product deletion failed!");
        res.status(500);
        return next(error);
      }
      res.status(200).send({
        message: "Product deleted successfully!",
        code: 200,
      });
    } catch (error) {
      error.message = "Internal Server Error!";
      res.status(500);
      next(error);
    }
  }
);

//Export
export default productRouter;
