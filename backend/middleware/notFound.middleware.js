import ApiError from "../utils/apiError.js";

const notFound = (req, res, next) => {
  next(new ApiError(`Not Found - ${req.originalUrl}`, 404));
};

export default notFound;
