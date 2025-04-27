//Imports:
import bcrypt from "bcryptjs";
import dotenv from "dotenv";
//Configuration:
dotenv.config();
const round = parseInt(process.env.ROUND) || 10;
//Hashing The Password:
const hashPassword = async (password) => {
  try {
    const salt = await bcrypt.genSalt(round);
    const hashed = await bcrypt.hash(password, salt);
    return hashed; //hashed password string
  } catch (error) {
    console.error(error);
    return null;
  }
};
//Checking The Password:
const checkPassword = async (password, hashedPassword) => {
  try {
    const check = await bcrypt.compare(password, hashedPassword);
    return check; //boolean
  } catch (error) {
    console.error(error);
    return false;
  }
};
//Exporting The Functions:
export { hashPassword, checkPassword };
