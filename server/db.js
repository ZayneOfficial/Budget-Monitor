const path = require("path");
const mysql = require("mysql2");

require("dotenv").config({ path: path.join(__dirname, ".env") });

const requiredSettings = ["DB_HOST", "DB_USER", "DB_NAME"];
const missingSettings = requiredSettings.filter((setting) => !process.env[setting]);

if (missingSettings.length > 0) {
    throw new Error(`Missing database settings: ${missingSettings.join(", ")}`);
}

const connection = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD || "",
    database: process.env.DB_NAME,
    port: Number(process.env.DB_PORT || 3306),
    waitForConnections: true,
    connectionLimit: 10,
    ssl: process.env.DB_SSL === "true" ? { rejectUnauthorized: true } : undefined
});

module.exports = connection;