const jwt = require("jsonwebtoken");
const User = require("../models/User");

const signToken = (user) => {
  return jwt.sign(
    { id: user._id, email: user.email, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: "7d" }
  );
};

exports.register = async (req, res) => {
  const { name, email, password, role } = req.body;
  if (!name || !email || !password) {
    return res
      .status(400)
      .json({ message: "name, email and password required" });
  }

  const existing = await User.findOne({ email });
  if (existing)
    return res.status(400).json({ message: "Email already in use" });

  const user = new User({ name, email, password, role });
  await user.save();

  const token = signToken(user);
  res.status(201).json({
    user: { id: user._id, name: user.name, email: user.email, role: user.role },
    token,
  });
};

exports.login = async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password)
    return res.status(400).json({ message: "email and password required" });

  const user = await User.findOne({ email });
  if (!user) return res.status(401).json({ message: "Invalid credentials" });

  const isMatch = await user.matchPassword(password);
  if (!isMatch) return res.status(401).json({ message: "Invalid credentials" });

  const token = signToken(user);
  res.json({
    user: { id: user._id, name: user.name, email: user.email, role: user.role },
    token,
  });
};

exports.me = async (req, res) => {
  const user = await User.findById(req.user.id).select("-password");
  res.json({ user });
};
