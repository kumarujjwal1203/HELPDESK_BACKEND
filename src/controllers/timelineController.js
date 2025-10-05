const Ticket = require("../models/Ticket");

exports.getTicketTimeline = async (req, res) => {
  try {
    const { id } = req.params;

    const ticket = await Ticket.findById(id)
      .populate("timeline.actor", "name email role")
      .lean();

    if (!ticket) return res.status(404).json({ message: "Ticket not found" });

    res.json({
      timeline: ticket.timeline.sort(
        (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
      ),
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

exports.getGlobalTimeline = async (req, res) => {
  try {
    if (req.user.role !== "admin")
      return res
        .status(403)
        .json({ message: "Only admin can access global timeline" });

    const tickets = await Ticket.find({})
      .populate("timeline.actor", "name email role")
      .lean();

    let allEvents = [];
    tickets.forEach((t) => {
      t.timeline.forEach((e) => {
        allEvents.push({ ticketId: t._id, ticketTitle: t.title, ...e });
      });
    });

    allEvents.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    res.json({ total: allEvents.length, timeline: allEvents });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};
