import Redis from "ioredis";
import dotenv from "dotenv";
dotenv.config();
//Configuring Redis URL
const redis = new Redis(process.env.redisUrl);
export default redis;
