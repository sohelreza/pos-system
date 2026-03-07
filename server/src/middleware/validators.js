import { body, validationResult } from "express-validator";

export const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};

export const validateMenuItem = [
  body("name").notEmpty().withMessage("Name is required"),
  body("base_price")
    .notEmpty()
    .withMessage("Base price is required")
    .isDecimal()
    .withMessage("Base price must be a valid number"),
  body("category").optional(),
  handleValidationErrors,
];

export const validateOutlet = [
  body("name").notEmpty().withMessage("Outlet name is required"),
  body("address").optional(),
  handleValidationErrors,
];
