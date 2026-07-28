const mysql = require("mysql2");

const connection = mysql.createConnection({
    host: "127.0.0.1",
    user: "root",
    password: process.env.DB_PASSWORD
    database: "budget_monitor",
    port: 3306
});

connection.connect((err) => {
    if (err) {
        console.error("❌ Database connection failed:", err);
        return;
    }

    console.log("✅ Connected to MySQL!");
});

module.exports = connection;