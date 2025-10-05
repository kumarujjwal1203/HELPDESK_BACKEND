const Ticket = require("../models/Ticket");

const checkSLABreaches = async () => {
  try {
    const now = new Date();

    const tickets = await Ticket.find({
      slaDeadline: { $lt: now },
      status: { $ne: "closed" },
      breached: { $ne: true },
    });

    for (let ticket of tickets) {
      ticket.breached = true;
      ticket.timeline.push({
        actor: "system",
        action: "sla_breached",
        meta: { message: "SLA breached!" },
        createdAt: now,
      });

      await ticket.save();
      console.log(`Ticket ${ticket._id} breached SLA.`);
    }
  } catch (err) {
    console.error("SLA Worker Error:", err);
  }
};

setInterval(checkSLABreaches, 60 * 1000);

module.exports = checkSLABreaches;
