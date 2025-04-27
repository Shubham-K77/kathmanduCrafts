//Imports and Config
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import redis from "../config/redisConfig.js";
dotenv.config();
//Token Creation Middleware
const secret = process.env.jwtSecret;
const refreshSecret = process.env.refreshTokenSecret;
const createToken = async (payload, req, res, next) => {
  try {
    if (!payload) {
      const error = new Error("The Payload Is Required!");
      res.status(400); //Bad-Request
      return next(error);
    }
    //Access Token
    const accessToken = jwt.sign(payload, secret, { expiresIn: "15m" });
    //Refresh Token
    const refreshToken = jwt.sign(payload, refreshSecret, { expiresIn: "7d" });
    //Store Refresh Token In Redis
    const refreshAccessToken = await redis.set(
      `refresh_token: ${payload.id}`,
      refreshToken,
      "EX",
      7 * 24 * 60 * 60 // 7 Days
    );
    //Invalid Storage
    if (!refreshAccessToken) {
      const error = new Error("Unable To Store In Redis!");
      res.status(500);
      return next(error);
    }
    //Store Access Token In Cookie
    res.cookie("token", accessToken, {
      httpOnly: true, // XSS Protection
      secure: false, // Development
      sameSite: "strict", // CSRF Protection
      maxAge: 15 * 60 * 1000, // 15min
    });
    //Store Refresh Token In Cookie
    res.cookie("refreshToken", refreshToken, {
      httpOnly: true, // XSS Protection
      secure: false, // Development
      sameSite: "strict", // CSRF Protection
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7day
    });
  } catch (error) {
    console.log(error);
    const err = new Error("Token Generation Failed!");
    res.status(500);
    next(err);
  }
};
const retrieveToken = (req) => {
  const refreshToken = req.cookies.refreshToken;
  const decoded = jwt.verify(refreshToken, refreshSecret);
  const userInfo = {
    id: decoded.id,
    email: decoded.email,
  };
  return userInfo;
};
//Export:
export { createToken, retrieveToken };
