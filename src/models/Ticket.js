const mongoose = require("mongoose");

const ticketSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: String,
    requester: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    status: {
      type: String,
      enum: ["open", "in_progress", "resolved", "closed"],
      default: "open",
    },
    priority: {
      type: String,
      enum: ["low", "medium", "high"],
      default: "medium",
    },
    slaHours: { type: Number, default: 24 },
    slaDeadline: { type: Date },
    breached: { type: Boolean, default: false },
    latestCommentText: { type: String },
    timeline: [
      {
        actor: String,
        action: String,
        meta: Object,
        createdAt: { type: Date, default: Date.now },
      },
    ],
  },
  { timestamps: true }
);

ticketSchema.pre("save", function (next) {
  if (!this.slaDeadline) {
    this.slaDeadline = new Date(Date.now() + this.slaHours * 60 * 60 * 1000);
  }
  next();
});

module.exports = mongoose.model("Ticket", ticketSchema);
