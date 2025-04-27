// Imports
import express from "express";
import userModel from "./users.Schema.js";
import { checkPassword, hashPassword } from "../../services/hash.js";
import sendMail from "../../services/mailer.js";
import generateOtp from "../../services/otpGenerate.js";
import { createToken, retrieveToken } from "../../services/jwtToken.js";
import checkToken from "../../middleware/checkToken.js";
import clearToken from "../../services/clearToken.js";
// Configuring Router
const userRouter = express.Router();
// [Get Request]
// 1.Get All Data =>
userRouter.get("/", checkToken, (req, res, next) => {
  res.status(200).send({ message: "Welcome To Plaftorm!", status: 200 });
});
// 2.Get LoggedIn User Data =>
userRouter.get("/profile", checkToken, (req, res, next) => {
  const userInfo = retrieveToken(req);
  res
    .status(200)
    .send({ message: "LoggedIn User Info Fetched!", status: 200, userInfo });
});

// [Post Request]
// 1.Signup =>
userRouter.post("/signup", async (req, res, next) => {
  const { email, name, password } = req.body;
  if (!email?.trim() || !name?.trim() || !password?.trim()) {
    const error = new Error("Credentails Are Missing!");
    res.status(400); //Bad-Request
    return next(error);
  }
  const userExists = await userModel.findOne({ email });
  // Email Already Exists In DB
  if (userExists) {
    const error = new Error("User Already Exists In The Platform!");
    res.status(400); //Bad-Request
    return next(error);
  }
  // Get The Hashed Password and Email Auth OTP
  const hashedPassword = await hashPassword(password);
  const otp = generateOtp();
  const newUser = await userModel.create({
    email,
    name,
    password: hashedPassword,
    emailVerificationOtp: otp,
  });
  // Problem With User Creation
  if (!newUser) {
    const error = new Error("User Creation Failed! DB Error!");
    res.status(500); //Internal-Server Error
    return next(error);
  }
  // Send The User An Email About Registration & OTP For Verification
  await sendMail({ type: "register" }, email);
  await sendMail({ type: "verifyOtp", otpValue: otp }, email);
  // User Information
  const userInfo = {
    _id: newUser._id,
    email: newUser.password,
    name: newUser.name,
    role: newUser.role,
  };
  //Send Response To User
  res.status(201).send({
    message: "Please Verify Your Email To Login!",
    code: 201,
    status: "Success",
    userInfo,
  });
});
// 2.Login =>
userRouter.post("/login", async (req, res, next) => {
  const { email, password } = req.body;
  //Checking Whether The Credentials Are Entered
  if (!email?.trim() || !password?.trim()) {
    const error = new Error("Missing Credentials Information!");
    res.status(400); //Bad-Request
    return next(error);
  }
  //Checking The Email
  const userExists = await userModel.findOne({ email });
  if (!userExists) {
    const error = new Error("Credentials Are Incorrect!");
    res.status(404); //Not-Found
    return next(error);
  }
  //Checking The Password
  const isPasswordCorrect = await checkPassword(password, userExists.password);
  if (!isPasswordCorrect) {
    const error = new Error("Incorrect Password!");
    res.status(400); //Bad-Request
    return next(error);
  }
  //Token Generation Middleware
  await createToken(
    { id: userExists._id, email: userExists.email },
    req,
    res,
    next
  );
  //User Info
  const userInfo = {
    _id: userExists._id,
    email: userExists.email,
    name: userExists.name,
    role: userExists.role,
  };
  //Send The Response To User
  res.status(200).send({
    message: "Welcome To The Platform!",
    code: 200,
    status: "Success",
    userInfo,
  });
});
// 3.Logout =>
userRouter.post("/logout", checkToken, async (req, res, next) => {
  try {
    //Call Service Function
    const decoded = await clearToken(req, res, next);
    const userExists = await userModel.findOne({ _id: decoded.id });
    if (!userExists) {
      const error = new Error("User not found in the db!");
      res.status(404); //Not-Found
      return next(error);
    }
    res.clearCookie("token");
    res.clearCookie("refreshToken");
    res.status(200).send({ message: "Successfully logged out!", status: 200 });
  } catch (error) {
    const err = new Error("Internal Server Failed!");
    res.status(500); //Internal-Error
    next(err);
  }
});

// [Put Request]

// [Delete Request]

// Export
export default userRouter;
