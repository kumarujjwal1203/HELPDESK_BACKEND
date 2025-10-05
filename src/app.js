const express = require("express");
const cors = require("cors");
const morgan = require("morgan");

const authRoutes = require("./routes/auth");
const ticketRoutes = require("./routes/tickets");
const commentRoutes = require("./routes/comments");
const adminRoutes = require("./routes/admin");
const userRoutes = require("./routes/users");

const { errorHandler, notFound } = require("./middleware/errorHandler");

const app = express();

app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);

app.use(express.json());
app.use(morgan("dev"));

app.use("/api/auth", authRoutes);
app.use("/api/tickets", ticketRoutes);
app.use("/api/tickets", commentRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/users", userRoutes);

app.get("/", (req, res) => res.json({ ok: true, message: "HelpDesk API" }));

app.use(notFound);
app.use(errorHandler);

module.exports = app;
