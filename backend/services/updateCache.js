import redis from "../config/redisConfig.js";
import productModel from "../modules/products/products.Schema.js";
const updateCacheInfo = async () => {
  try {
    const featuredProducts = await productModel
      .find({ isFeatured: true })
      .lean();
    await redis.set("featured_products", JSON.stringify(featuredProducts));
  } catch (error) {
    error.message = "Error In Update Cache Function!";
    console.error(error);
  }
};
export default updateCacheInfo;
