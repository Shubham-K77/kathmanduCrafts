//Imports:
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import redis from "../config/redisConfig.js";
//DotEnv:
dotenv.config();
const secret = process.env.jwtSecret;
const refreshTokenSecret = process.env.refreshTokenSecret;
//Middleware:
const checkToken = async (req, res, next) => {
  try {
    // Checking Access Token First
    const accessToken = req.cookies.token;
    if (accessToken) {
      try {
        const validToken = jwt.verify(accessToken, secret);
        return next();
      } catch (error) {
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
    }
    // Checking Refresh Token
    const refreshToken = req.cookies.refreshToken;
    if (!refreshToken) {
      const error = new Error("Refresh token is not found!");
      res.status(404); //Not-Found
      return next(error);
    }
    // Check Whether The Refresh Token Is Valid
    const decoded = jwt.verify(refreshToken, refreshTokenSecret);
    // Check Refresh Token From Redis
    const storedToken = await redis.get(`refresh_token: ${decoded.id}`);
    if (storedToken !== refreshToken) {
      const error = new Error("Invalid Refresh Token!");
      res.status(401); //unauthorized
      return next(error);
    }
    // Create New Access Token
    const token = jwt.sign({ id: decoded.id, email: decoded.email }, secret, {
      expiresIn: "15m",
    });
    res.cookie("token", token, {
      httpOnly: true,
      secure: false,
      sameSite: "strict",
      maxAge: 15 * 60 * 1000,
    });
    return next();
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
//Export:
export default checkToken;
