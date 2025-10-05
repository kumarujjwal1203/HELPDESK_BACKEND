const express = require("express");
const router = express.Router();
const { protect, restrictTo } = require("../middleware/auth");
const User = require("../models/User");

router.get("/users", protect, restrictTo("admin"), async (req, res) => {
  const users = await User.find().select("-password");
  res.json({ users });
});

module.exports = router;
