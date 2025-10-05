const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/auth");
const {
  createTicket,
  listTickets,
  patchTicket,
  getTicketById,
} = require("../controllers/ticketController");
const {
  createTicketValidator,
  patchTicketValidator,
} = require("../middleware/validators");

router.post("/", protect, createTicketValidator, createTicket);

router.get("/", protect, listTickets);

router.get("/:id", protect, getTicketById);

router.patch("/:id", protect, patchTicketValidator, patchTicket);

module.exports = router;
