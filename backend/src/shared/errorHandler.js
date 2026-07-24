export default function errorHandler(err, req, res, next) {
  // defaults
  let statusCode = err.statusCode || 500;
  let message = err.message || "Internal Server Error";

  if (err?.name === "SequelizeUniqueConstraintError") {
    statusCode = 400;
    const field = err?.errors?.[0]?.path;
    message = field ? `${field} already in use` : "Unique constraint violation";
  } else if (
    err?.name === "TimeoutError" ||
    err?.name === "SequelizeConnectionAcquireTimeoutError" ||
    err?.parent?.name === "TimeoutError" ||
    err?.original?.name === "TimeoutError"
  ) {
    statusCode = 503;
    message = "Database is currently busy. Please try again in a moment.";
  }

  // log unexpected errors
  if (!err.isOperational && statusCode !== 503) {
    console.error("UNEXPECTED ERROR", err);
  }

  res.status(statusCode).json({
    status: err.status || "error",
    message,
  });
}
