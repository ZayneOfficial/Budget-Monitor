const express = require("express");
const cors = require("cors");
const path = require("path");

const db = require("./db");

const transactionRoutes = require("./routes/transactionRoutes");

const app = express();

if (process.env.CLIENT_ORIGIN) {
    app.use(cors({ origin: process.env.CLIENT_ORIGIN }));
}

app.use(express.json({ limit: "10kb" }));
app.use("/api/transactions", transactionRoutes);
app.get("/api/health", async (req, res) => {
    try {
        await db.promise().query("SELECT 1");
        return res.json({ status: "ok" });
    } catch (error) {
        return res.status(503).json({ status: "unavailable" });
    }
});
app.use(express.static(path.join(__dirname, "../client")));

const PORT = process.env.PORT || 3000;

async function startServer() {
    try {
        await db.promise().query("SELECT 1");
        app.listen(PORT, () => {
            console.log(`Budget Monitor listening on port ${PORT}`);
        });
    } catch (error) {
        console.error("Could not connect to the database:", error.message);
        await db.promise().end();
        process.exitCode = 1;
    }
}

startServer();