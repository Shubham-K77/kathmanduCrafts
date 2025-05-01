// Imports
import express from "express";
import userModel from "./users.Schema.js";
import { checkPassword, hashPassword } from "../../services/hash.js";
import sendMail from "../../services/mailer.js";
import generateOtp from "../../services/otpGenerate.js";
import { createToken, retrieveToken } from "../../services/jwtToken.js";
import checkToken from "../../middleware/checkToken.js";
import clearToken from "../../services/clearToken.js";
import generateLink from "../../services/linkGenerate.js";
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
  //Checking Whether User's Email Is Verified
  if (userExists.emailVerified === false || !userExists.emailVerified) {
    const error = new Error("The Email provided isn't verified!");
    res.status(400); //Bad-Request
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
// 4.Password Reset Request =>
userRouter.post("/resetRequest", async (req, res, next) => {
  try {
    const { email } = req.body;
    //Checking If Email Exists In The DB
    const userExists = await userModel.findOne({ email });
    if (!userExists) {
      const error = new Error("The user doesn't exists in the platform");
      res.status(404); //Not-Found
      return next(error);
    }
    //Get The OTP
    const resetOtp = generateOtp();
    //Get The Reset Link
    const resetLink = generateLink();
    //Update The DB
    const updateUser = await userModel
      .findByIdAndUpdate(
        userExists._id,
        {
          passwordReset: true,
          passwordResetOtp: resetOtp,
          passwordResetLink: resetLink,
        },
        { new: true }
      )
      .select("-password");
    //If Update Failed
    if (!updateUser) {
      const error = new Error("Unable to update the user information!");
      res.status(500); //Internal-Error
      return next(error);
    }
    //Send The ResetLink
    await sendMail(
      { type: "resetOtp", otpValue: resetOtp, link: resetLink },
      updateUser.email
    );
    res.status(200).send({
      message: "Reset credentials is sent to your email",
      code: 200,
      updateUser,
    });
  } catch (error) {
    error.message = "Internal Server Error!";
    res.status(500); //Internal-Error
    next(error); //Forward The Error To Middleware
  }
});
// 5.Reset The Password =>
userRouter.post("/resetPassword", async (req, res, next) => {
  try {
    const { link, email, password } = req.body;
    const userExists = await userModel.findOne({
      email,
      passwordResetLink: link,
    });
    if (!userExists) {
      const error = new Error("The user doesn't exist in the platform!");
      res.status(404); //Not-Found
      return next(error);
    }
    if (!userExists.passwordReset) {
      const error = new Error("User didn't requested for reset.");
      res.status(401); //Unauthorized
      return next(error);
    }
    //Hash The Password
    const hashedPassword = await hashPassword(password);
    //Update The User
    const updateUser = await userModel
      .findByIdAndUpdate(
        userExists._id,
        {
          password: hashedPassword,
          passwordReset: false,
          passwordResetOtp: null,
          passwordResetLink: "",
        },
        { new: true }
      )
      .select("-password");
    if (!updateUser) {
      const error = new Error("Unable to update the user information!");
      res.status(500); //Internal Error DB
      return next(error);
    }
    await sendMail({ type: "successfulReset" }, updateUser.email);
    res
      .status(200)
      .send({ message: "Successfully Updated!", code: 200, updateUser });
  } catch (error) {
    error.message = "Internal Server Error!";
    res.status(500);
    next(error);
  }
});

// [Put Request]

// [Patch Request]
userRouter.patch("/verifyEmail", async (req, res, next) => {
  try {
    const { email, emailOtp } = req.body;
    if (!emailOtp) {
      const error = new Error("There was no OTP received!");
      res.status(400); //Bad-Request
      return next(error);
    }
    const userExists = await userModel.findOne({ email }).select("-password");
    if (!userExists) {
      const error = new Error("The user doesn't exist in the platform!");
      res.status(400); //Bad-Request
      return next(error);
    }
    if (userExists.emailVerified === true) {
      const error = new Error("Provided email is already verified!");
      res.status(400); //Bad-Request
      return next(error);
    }
    if (emailOtp !== String(userExists.emailVerificationOtp)) {
      const error = new Error("The Otp provided was incorrect!");
      res.status(400); //Bad-Request
      return next(error);
    }
    const updatedUser = await userModel.findByIdAndUpdate(
      userExists._id,
      {
        emailVerified: true,
        emailVerificationOtp: null,
      },
      { new: true }
    );
    if (!updatedUser) {
      const error = new Error("Unable to update the user!");
      res.status(500);
      return next(error);
    }
    res
      .status(200)
      .send({ message: "Email Verified!", status: 200, updatedUser });
  } catch (error) {
    error.message = "Internal Server Error!";
    res.status(500); //Internal-Error
    next(error);
  }
});

// [Delete Request]

// Export
export default userRouter;
