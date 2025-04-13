const asyncHandler = (fn) => async (req, res, next) => {
  //the actual code to add extra catch block to address left out thrown errors to stop from app crashing
  try {
    await fn(req, res, next);
  } catch (error) {
    res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || "Internal Server Error",
    });
  }
};

export { asyncHandler };
