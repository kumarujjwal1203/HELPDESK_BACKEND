const express = require("express");
const router = express.Router();
const { param } = require("express-validator");
const { protect } = require("../middleware/auth");
const { runValidation } = require("../middleware/validators");

const {
  getTicketTimeline,
  getGlobalTimeline,
} = require("../controllers/timelineController");

router.get(
  "/tickets/:id/timeline",
  protect,
  [param("id").isMongoId().withMessage("Invalid ticket id"), runValidation],
  getTicketTimeline
);

router.get("/timeline", protect, getGlobalTimeline);

module.exports = router;
