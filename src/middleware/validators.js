const { body, param, query, validationResult } = require("express-validator");

const validate = (validations) => {
  return async (req, res, next) => {
    await Promise.all(validations.map((validation) => validation.run(req)));
    const errors = validationResult(req);
    if (errors.isEmpty()) return next();

    return res.status(400).json({ errors: errors.array() });
  };
};

const registerValidator = validate([
  body("name").notEmpty().withMessage("Name is required"),
  body("email").isEmail().withMessage("Valid email required"),
  body("password").isLength({ min: 6 }).withMessage("Password min 6 chars"),
  body("role")
    .optional()
    .isIn(["user", "agent", "admin"])
    .withMessage("Invalid role"),
]);

const loginValidator = validate([
  body("email").isEmail().withMessage("Valid email required"),
  body("password").notEmpty().withMessage("Password is required"),
]);

const createTicketValidator = validate([
  body("title").notEmpty().withMessage("Title is required"),
  body("description").optional().isString(),
  body("priority")
    .optional()
    .isIn(["low", "medium", "high"])
    .withMessage("Invalid priority"),
  body("slaHours")
    .optional()
    .isFloat({ gt: 0 })
    .withMessage("SLA hours must be > 0"),
  body("assignedTo")
    .optional()
    .isMongoId()
    .withMessage("Invalid assignedTo user id"),
]);

const patchTicketValidator = validate([
  body("title").optional().notEmpty().withMessage("Title cannot be empty"),
  body("description").optional().isString(),
  body("priority")
    .optional()
    .isIn(["low", "medium", "high"])
    .withMessage("Invalid priority"),
  body("status")
    .optional()
    .isIn(["open", "in-progress", "resolved", "closed"])
    .withMessage("Invalid status"),
  body("assignedTo")
    .optional()
    .isMongoId()
    .withMessage("Invalid assignedTo user id"),
  body("__v")
    .notEmpty()
    .withMessage("__v (version) required")
    .isInt()
    .withMessage("__v must be integer"),
]);

const addCommentValidator = validate([
  body("body").notEmpty().withMessage("Comment body is required"),
  body("parent")
    .optional()
    .isMongoId()
    .withMessage("Invalid parent comment id"),
]);

module.exports = {
  registerValidator,
  loginValidator,
  createTicketValidator,
  patchTicketValidator,
  addCommentValidator,
};
