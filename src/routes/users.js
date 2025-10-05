const express = require("express");
const router = express.Router();
const { protect, restrictTo } = require("../middleware/auth");
const { listUsers } = require("../controllers/userController");

router.get("/", protect, restrictTo("admin"), listUsers);

module.exports = router;
