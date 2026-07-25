import { body } from "express-validator";

export const contentValidator = [
  body("title")
    .trim()
    .notEmpty()
    .withMessage("Title is required")
    .isLength({ max: 150 })
    .withMessage("Title cannot exceed 150 characters"),
  body("body").trim().notEmpty().withMessage("Body is required"),
  body("type")
    .trim()
    .notEmpty()
    .withMessage("Type/platform is required"),
  body("platform")
    .trim()
    .notEmpty()
    .withMessage("Platform is required"),
  body("status")
    .optional()
    .isIn(["scheduled", "draft", "published", "approval"])
    .withMessage("Invalid status value"),
  body("scheduledFor")
    .optional({ nullable: true })
    .isISO8601()
    .withMessage("Scheduled date must be a valid ISO8601 date string"),
  body("campaignId")
    .optional({ nullable: true })
    .isMongoId()
    .withMessage("Campaign ID must be a valid Mongo ID"),
];
