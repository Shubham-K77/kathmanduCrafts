//import
import { v2 as cloudinary } from "cloudinary";
import dotenv from "dotenv";
//config
dotenv.config();
const cloud_name = process.env.cloudinaryCloudName;
const api_key = process.env.cloudinaryApiKey;
const api_secret = process.env.cloudinaryApiSecret;
//Main Config
cloudinary.config({
  cloud_name,
  api_key,
  api_secret,
});
//export
export default cloudinary;
