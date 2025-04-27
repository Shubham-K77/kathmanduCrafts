//Imports:
import mongoose from "mongoose";
import dotenv from "dotenv";
import express from "express";
import cors from "cors";
import router from "./routes/index.js";
import { notFound, errorHandler } from "./middleware/errorHandle.js";
import cookie from "cookie-parser";
//Configuration:
const app = express();
app.use(express.json());
app.use(cors());
app.use(cookie());
app.use("/", router);
app.use(notFound);
app.use(errorHandler);
dotenv.config();
//Environment Variables:
const dbUrl = process.env.mongoDbUrl;
const port = process.env.port;
//Setting Up:
app.listen(port, () => {
  const startServer = async () => {
    try {
      await mongoose.connect(dbUrl);
      console.log("Successfully Connected To DB!");
      console.log(`App is running on port: ${port}`);
      console.log(`URL: http://localhost:${port}`);
    } catch (error) {
      console.error(error);
    }
  };
  startServer();
});
