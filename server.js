require("dotenv").config();
require("express-async-errors");

require("./src/workers/slaWorker");

const http = require("http");
const app = require("./src/app");
const connectDB = require("./config/db");
const Ticket = require("./src/models/Ticket");

const PORT = process.env.PORT || 5000;

async function start() {
  try {
    await connectDB();
    const server = http.createServer(app);

    server.listen(PORT, () => {
      console.log(
        `Server running on http://localhost:${PORT} (env=${process.env.NODE_ENV})`
      );
    });

    setInterval(async () => {
      try {
        const now = new Date();
        const breached = await Ticket.updateMany(
          {
            slaDeadline: { $lt: now },
            slaBreached: false,
            status: { $nin: ["resolved", "closed"] },
          },
          {
            $set: { slaBreached: true },
            $push: {
              timeline: {
                actor: null,
                action: "sla_breached",
                meta: { note: "SLA deadline passed" },
                createdAt: new Date(),
              },
            },
          }
        );
        if (breached.matchedCount || breached.modifiedCount) {
          console.log(
            "SLA worker: updated breached tickets",
            breached.matchedCount || breached.modifiedCount
          );
        }
      } catch (err) {
        console.error("SLA worker error:", err);
      }
    }, 60 * 1000);

    process.on("SIGINT", () => {
      console.log("SIGINT received, shutting down");
      server.close(() => process.exit(0));
    });
  } catch (err) {
    console.error("Failed to start server", err);
    process.exit(1);
  }
}

start();
