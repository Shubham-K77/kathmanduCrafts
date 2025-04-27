//Imports and Config:
import crypto from "crypto";
import dotenv from "dotenv";
dotenv.config();
//Constants:
const min = parseInt(process.env.cryptoMin || "0");
const max = parseInt(process.env.cryptoMax || "999999");
const generateOtp = () => {
  const otp = crypto.randomInt(min, max);
  return otp;
};

export default generateOtp;
