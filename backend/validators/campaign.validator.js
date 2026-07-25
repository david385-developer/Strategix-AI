import { body } from "express-validator";

export const campaignValidator = [
  body("name")
    .trim()
    .notEmpty()
    .withMessage("Campaign name is required")
    .isLength({ max: 100 })
    .withMessage("Campaign name cannot exceed 100 characters"),
  body("goal").trim().notEmpty().withMessage("Campaign goal is required"),
  body("budget")
    .isNumeric()
    .withMessage("Budget must be a number")
    .custom((val) => val >= 0)
    .withMessage("Budget cannot be negative"),
  body("startDate")
    .notEmpty()
    .withMessage("Start date is required")
    .isISO8601()
    .withMessage("Start date must be a valid ISO8601 date string"),
  body("endDate")
    .notEmpty()
    .withMessage("End date is required")
    .isISO8601()
    .withMessage("End date must be a valid ISO8601 date string")
    .custom((endDate, { req }) => {
      if (new Date(endDate) < new Date(req.body.startDate)) {
        throw new Error("End date must be after the start date");
      }
      return true;
    }),
  body("channel")
    .isArray({ min: 1 })
    .withMessage("At least one marketing channel is required"),
  body("color")
    .optional()
    .isHexColor()
    .withMessage("Please provide a valid hex color code"),
];
