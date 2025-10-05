const Ticket = require("../models/Ticket");
const mongoose = require("mongoose");

exports.createTicket = async (req, res) => {
  try {
    if (!["user", "agent", "admin"].includes(req.user.role)) {
      return res
        .status(403)
        .json({ message: "Forbidden: cannot create ticket" });
    }

    const { title, description, priority, slaHours, assignedTo } = req.body;

    if (assignedTo && req.user.role === "user") {
      return res.status(403).json({ message: "Users cannot assign tickets" });
    }

    const ticket = new Ticket({
      title,
      description,
      requester: req.user.id,
      assignedTo: assignedTo || null,
      priority: priority || "medium",
      slaHours: slaHours || 24,
      timeline: [
        {
          actor: req.user.id,
          action: "created",
          meta: { title },
          createdAt: new Date(),
        },
      ],
    });

    await ticket.save();
    res.status(201).json({ ticket });
  } catch (error) {
    console.error("Create Ticket Error:", error);
    res.status(500).json({ message: "Server error while creating ticket" });
  }
};

exports.getTicketById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid ticket ID" });
    }

    const ticket = await Ticket.findById(id)
      .populate("requester", "name email role")
      .populate("assignedTo", "name email role")
      .populate("timeline.actor", "name email role");

    if (!ticket) {
      return res.status(404).json({ message: "Ticket not found" });
    }

    res.json(ticket);
  } catch (error) {
    console.error("Get Ticket Error:", error);
    res.status(500).json({ message: "Server error while fetching ticket" });
  }
};

exports.listTickets = async (req, res) => {
  try {
    let {
      limit = 10,
      offset = 0,
      search = "",
      status,
      assignedTo,
      breached,
    } = req.query;

    limit = parseInt(limit);
    offset = parseInt(offset);

    const query = {};

    if (req.user.role === "user") {
      query.requester = req.user.id;
    }

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
        { latestCommentText: { $regex: search, $options: "i" } },
      ];
    }

    if (status) query.status = status;

    if (assignedTo && mongoose.Types.ObjectId.isValid(assignedTo)) {
      query.assignedTo = assignedTo;
    }

    if (breached === "true") {
      const now = new Date();
      query.slaDeadline = { $lt: now };
    }

    const total = await Ticket.countDocuments(query);

    const tickets = await Ticket.find(query)
      .populate("requester assignedTo", "name email role")
      .sort({ createdAt: -1 })
      .skip(offset)
      .limit(limit);

    res.json({ total, count: tickets.length, tickets });
  } catch (err) {
    console.error("List Tickets Error:", err);
    res.status(500).json({ message: "Server error while listing tickets" });
  }
};

exports.patchTicket = async (req, res) => {
  try {
    const { id } = req.params;
    let incomingVersion = req.body.__v;

    if (!mongoose.Types.ObjectId.isValid(id))
      return res.status(400).json({ message: "Invalid ticket ID" });

    const updates = { ...req.body };
    delete updates.__v;

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({ message: "No fields to update" });
    }

    const ticket = await Ticket.findById(id);
    if (!ticket) return res.status(404).json({ message: "Ticket not found" });

    const allowedFieldsForUser = ["status", "description"];
    const allowedFieldsForAgent = [
      "status",
      "assignedTo",
      "priority",
      "description",
    ];
    const allowedFieldsForAdmin = [
      "status",
      "assignedTo",
      "priority",
      "description",
    ];

    let allowedFields = [];
    if (req.user.role === "user") allowedFields = allowedFieldsForUser;
    else if (req.user.role === "agent") allowedFields = allowedFieldsForAgent;
    else if (req.user.role === "admin") allowedFields = allowedFieldsForAdmin;

    const forbidden = Object.keys(updates).filter(
      (f) => !allowedFields.includes(f)
    );
    if (forbidden.length > 0) {
      return res
        .status(403)
        .json({ message: `You cannot update fields: ${forbidden.join(", ")}` });
    }

    if (
      req.user.role === "user" &&
      ticket.requester.toString() !== req.user.id
    ) {
      return res
        .status(403)
        .json({ message: "Users can update only their own tickets" });
    }

    const timelineEntry = {
      actor: req.user.id,
      action: "updated",
      meta: { changes: updates },
      createdAt: new Date(),
    };

    if (!incomingVersion) incomingVersion = ticket.__v;

    const query = { _id: id, __v: incomingVersion };
    const updateOp = {
      $set: updates,
      $inc: { __v: 1 },
      $push: { timeline: timelineEntry },
    };

    const updated = await Ticket.findOneAndUpdate(query, updateOp, {
      new: true,
    }).populate("requester assignedTo", "name email role");

    if (!updated) {
      return res.status(409).json({
        message:
          "Conflict: ticket was modified by someone else. Refresh and try again.",
      });
    }

    res.json({ ticket: updated });
  } catch (err) {
    console.error("Patch Ticket Error:", err);
    res.status(500).json({ message: "Server error while updating ticket" });
  }
};
