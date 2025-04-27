//Imports:
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
//DotEnv:
dotenv.config();
const secret = process.env.jwtSecret;
//Middleware:
const checkToken = (req, res, next) => {
  try {
    const token = req.cookies.token;
    if (!token) {
      const error = new Error("Restricted User Not Authenticated!");
      res.status(401); // Restricted
      return next(error);
    }
    const validUser = jwt.verify(token, secret);
    if (!validUser) {
      const error = new Error("The Token Received Was Invalid!");
      res.status(404); //Not-Found
      return next(error);
    }
    next();
  } catch (error) {
    console.error(error);
    if (error.name === "JsonWebTokenError") {
      const err = new Error("The Token is invalid!");
      res.status(401);
      return next(err);
    }
    if (error.name === "TokenExpiredError") {
      const err = new Error("The Token has expired!");
      res.status(401);
      return next(err);
    }
    const err = new Error("Unable To Retrieve Token!");
    res.status(500);
    next(err);
  }
};
//Export:
export default checkToken;
