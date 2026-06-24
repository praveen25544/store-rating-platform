import { body, param, query, validationResult } from "express-validator";

const passwordPattern = /^(?=.*[A-Z])(?=.*[^A-Za-z0-9]).{8,16}$/;

export const validate = (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(422).json({
      message: "Please fix the highlighted fields.",
      errors: errors.array().map((error) => ({
        field: error.path,
        message: error.msg
      }))
    });
  }

  next();
};

export const nameRule = body("name")
  .trim()
  .isLength({ min: 20, max: 60 })
  .withMessage("Name must be 20 to 60 characters.");

export const emailRule = body("email")
  .trim()
  .isEmail()
  .withMessage("Enter a valid email address.")
  .normalizeEmail();

export const addressRule = body("address")
  .trim()
  .notEmpty()
  .withMessage("Address is required.")
  .isLength({ max: 400 })
  .withMessage("Address cannot exceed 400 characters.");

export const passwordRule = body("password")
  .matches(passwordPattern)
  .withMessage("Password must be 8-16 characters with one uppercase and one special character.");

export const loginPasswordRule = body("password")
  .notEmpty()
  .withMessage("Password is required.");

export const optionalOwnerRule = body("ownerId")
  .optional({ values: "falsy" })
  .isUUID()
  .withMessage("Owner must be a valid user.");

export const roleRule = body("role")
  .isIn(["ADMIN", "USER", "OWNER"])
  .withMessage("Role must be ADMIN, USER, or OWNER.");

export const ratingRule = body("value")
  .isInt({ min: 1, max: 5 })
  .withMessage("Rating must be between 1 and 5.");

export const idParamRule = param("id").isUUID().withMessage("Invalid id.");

export const commonFilterRules = [
  query("name").optional().trim(),
  query("email").optional().trim(),
  query("address").optional().trim(),
  query("role").optional().isIn(["ADMIN", "USER", "OWNER"]).withMessage("Invalid role filter."),
  query("sortOrder").optional().isIn(["asc", "desc"]).withMessage("Sort order must be asc or desc.")
];
