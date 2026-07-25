import { validationResult } from "express-validator";
import ApiResponse from "../utils/apiResponse.js";

const validateRequest = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return ApiResponse.error(
      res,
      "Validation validation failed",
      errors.array().map((err) => ({
        param: err.path,
        msg: err.msg,
      })),
      400
    );
  }
  next();
};

export default validateRequest;
