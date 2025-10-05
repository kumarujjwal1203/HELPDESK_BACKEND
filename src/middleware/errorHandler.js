exports.notFound = (req, res, next) => {
  res.status(404).json({ message: "Route not found" });
};

exports.errorHandler = (err, req, res, next) => {
  console.error(err);
  const statusCode = err.statusCode || 500;
  const message = err.message || "Internal Server Error";
  res
    .status(statusCode)
    .json({
      message,
      stack: process.env.NODE_ENV === "development" ? err.stack : undefined,
    });
};
