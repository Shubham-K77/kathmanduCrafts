//Imports:
import express from "express";
import userRouter from "../modules/users/users.api.js";
//Configuring Router:
const router = express.Router();
//Routing The URL Paths:
router.use("/api/v1/users", userRouter);
//Export Default:
export default router;
