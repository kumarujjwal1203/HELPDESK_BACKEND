const express = require("express");
const router = express.Router();
const { register, login, me } = require("../controllers/authController");
const { protect } = require("../middleware/auth");
const {
  registerValidator,
  loginValidator,
} = require("../middleware/validators");

router.post("/register", registerValidator, register);
router.post("/login", loginValidator, login);
router.get("/me", protect, me);

module.exports = router;
