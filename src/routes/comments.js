const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/auth");
const { addComment } = require("../controllers/commentController");
const { addCommentValidator } = require("../middleware/validators");

router.post("/:id/comments", protect, addCommentValidator, addComment);

module.exports = router;
