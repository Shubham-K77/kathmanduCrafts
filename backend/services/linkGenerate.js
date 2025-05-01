//Import Package:
import crypto from "crypto";
//Function:
const generateLink = () => {
  const link = crypto.randomBytes(16).toString("hex");
  return link;
};
//Export
export default generateLink;
