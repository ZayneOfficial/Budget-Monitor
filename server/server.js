const express = require("express");
const cors = require("cors");
const path = require("path");

const db = require("./db");

const transactionRoutes = require("./routes/transactionRoutes");
const authRoutes = require("./routes/authRoutes");
const { requireAuth } = require("./auth");

const app = express();

if (process.env.CLIENT_ORIGIN) {
    app.use(cors({ origin: process.env.CLIENT_ORIGIN }));
}

app.use(express.json({ limit: "10kb" }));
app.use("/api/auth", authRoutes);
app.use("/api/transactions", requireAuth, transactionRoutes);
app.get("/api/health", async (req, res) => {
    try {
        await db.ping();
        return res.json({ status: "ok" });
    } catch (error) {
        return res.status(503).json({ status: "unavailable" });
    }
});
app.use(express.static(path.join(__dirname, "../client")));

const PORT = process.env.PORT || 3000;

async function startServer() {
    try {
        await db.connect();
        app.listen(PORT, () => {
            console.log(`Budget Monitor listening on port ${PORT}`);
        });
    } catch (error) {
        console.error("Could not connect to the database:", error.message);
        await db.disconnect();
        process.exitCode = 1;
    }
}

startServer();