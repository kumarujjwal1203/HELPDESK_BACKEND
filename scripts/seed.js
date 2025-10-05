require("dotenv").config();
const connectDB = require("../config/db");
const User = require("../src/models/User");

async function seed() {
  await connectDB();
  const existing = await User.findOne({ email: "admin@example.com" });
  if (existing) {
    console.log("Admin already exists");
    process.exit(0);
  }
  const admin = new User({
    name: "Admin",
    email: "admin@example.com",
    password: "password123",
    role: "admin",
  });
  await admin.save();
  console.log("Created admin@example.com / password123");
  process.exit(0);
}
seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
