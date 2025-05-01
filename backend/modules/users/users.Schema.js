//Importing Mongoose:
import mongoose from "mongoose";
//Creating The Schema:
const userSchema = mongoose.Schema(
  {
    email: {
      type: "String",
      required: [true, "Emails Are Important For The Credentials!"],
      unique: [true, "Emails Must Be Unique!"],
    },
    name: {
      type: "String",
      required: [true, "Names Are Important For The Credentials!"],
    },
    password: {
      type: "String",
      required: [true, "Passwords Are Important For The Credentials!"],
      minlength: [6, "Passwords Must Be 6 Characters Long!"],
    },
    emailVerified: {
      type: "Boolean",
      default: false,
    },
    emailVerificationOtp: {
      type: "Number",
      required: [true, "OTP Must Be Sent To The User For Authentication!"],
    },
    passwordReset: {
      type: "Boolean",
      default: false,
    },
    passwordResetOtp: {
      type: "Number",
    },
    passwordResetLink: {
      type: "String",
    },
    cartItems: [
      {
        quantity: {
          type: Number,
          default: 1,
        },
        product: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "product",
        },
      },
    ],
    role: {
      type: "String",
      enum: ["customer", "admin"],
      default: "customer",
    },
  },
  { timestamps: true }
);
//Export The Schema:
const userModel = mongoose.model("user", userSchema);
export default userModel;
