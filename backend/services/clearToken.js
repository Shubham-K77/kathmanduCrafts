//Imports
import dotenv from "dotenv";
import redis from "../config/redisConfig.js";
import jwt from "jsonwebtoken";
//Config
dotenv.config();
const refreshTokenSecret = process.env.refreshTokenSecret;
//Middleware
const clearToken = async (req, res, next) => {
  try {
    const refreshToken = req.cookies.refreshToken;
    if (!refreshToken) {
      const error = new Error("No Refresh Token Was Found!");
      res.status(401); //Unauthorized
      return next(error);
    }
    const decoded = jwt.verify(refreshToken, refreshTokenSecret);
    const clear = await redis.del(`refresh_token: ${decoded.id}`);
    if (!clear) {
      const error = new Error("Not able to delete the redis data!");
      res.status(500); //Internal-Error
      return next(error);
    }
    return decoded;
  } catch (error) {
    console.error(error);
    if (error.name === "TokenExpiredError") {
      const err = new Error("The token is expired!");
      res.status(404); //Not-Found
      return next(err);
    } else if (error.name === "JsonWebTokenError") {
      const err = new Error("The token is invalid!");
      res.status(401); //Unauthorized
      return next(err);
    }
    const err = new Error("Unable To Retrieve Token!");
    res.status(500);
    next(err);
  }
};

export default clearToken;
