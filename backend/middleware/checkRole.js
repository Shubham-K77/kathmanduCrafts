//Middleware
const checkRole = async (req, res, next) => {
  try {
    if (req.userInfo && req.userInfo.role !== "admin") {
      const error = new Error("Restricted to admins only!");
      res.status(403); //Restricted
      return next(error);
    }
    return next();
  } catch (error) {
    error.message = "Internal Server Error!";
    res.status(500);
    next(error);
  }
};

export default checkRole;
