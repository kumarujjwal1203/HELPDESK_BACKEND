const Comment = require("../models/Comment");
const Ticket = require("../models/Ticket");

exports.addComment = async (req, res) => {
  const { id } = req.params;
  const { body, parent } = req.body;

  if (!body) return res.status(400).json({ message: "Comment body required" });

  const ticket = await Ticket.findById(id);
  if (!ticket) return res.status(404).json({ message: "Ticket not found" });

  const comment = await Comment.create({
    ticket: id,
    author: req.user.id,
    parent: parent || null,
    body,
  });

  ticket.latestCommentText = body;
  ticket.timeline.push({
    actor: req.user.id,
    action: "comment_added",
    meta: { commentId: comment._id, parent: parent || null },
    createdAt: new Date(),
  });
  await ticket.save();

  res.status(201).json({ comment });
};
