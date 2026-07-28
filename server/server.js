require("dotenv").config();
console.log(process.env);
console.log(process.env.DB_PASSWORD);

const express = require("express");
const cors = require("cors");

const db = require("./db");

const transactionRoutes = require("./routes/transactionRoutes");

const app = express();

app.use(cors());
app.use(express.json());
app.use("/api/transactions", transactionRoutes);

app.get("/", (req, res) => {
    res.send("Budget Monitor API is running!");
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
});