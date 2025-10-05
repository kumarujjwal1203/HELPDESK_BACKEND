const User = require("../models/User");

exports.listUsers = async (req, res) => {
  try {
    const users = await User.find({}, "_id name email role");
    res.json({ users });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};
