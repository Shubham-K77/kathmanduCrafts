const notFound = () => {
  const error = new Error("The URL wasn't found!");
  res.status(404);
  next(error);
};

const errorHandler = (error, req, res, next) => {
  let message = error.message;
  let statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  if (error.name === "CastError" || error.name === "ValidationError") {
    statusCode = 400;
    message = "MongoDb Error!";
  }
  res.status(statusCode).send({ message, code: statusCode, status: "Error" });
};

export { notFound, errorHandler };
