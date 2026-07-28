const db = require("../db");

// Get all transactions
exports.getTransactions = (req, res) => {

    const sql = "SELECT * FROM transactions ORDER BY transaction_date DESC";

    db.query(sql, (err, results) => {

        if (err) {
            return res.status(500).json({
                success: false,
                error: err.message
            });
        }

        res.json(results);

    });

};


// Add a transaction
exports.addTransaction = (req, res) => {

    const {
        name,
        category,
        amount,
        type,
        transaction_date
    } = req.body;


    const sql = `
        INSERT INTO transactions
        (name, category, amount, type, transaction_date)
        VALUES (?, ?, ?, ?, ?)
    `;


    db.query(
        sql,
        [name, category, amount, type, transaction_date],
        (err, result) => {

            if (err) {
                return res.status(500).json({
                    success: false,
                    error: err.message
                });
            }


            res.status(201).json({
                success: true,
                message: "Transaction added successfully",
                id: result.insertId
            });

        }
    );

};


// Delete a transaction
exports.deleteTransaction = (req, res) => {

    const id = req.params.id;

    const sql = "DELETE FROM transactions WHERE id = ?";


    db.query(sql, [id], (err, result) => {

        if (err) {
            return res.status(500).json({
                success: false,
                error: err.message
            });
        }


        res.json({
            success: true,
            message: "Transaction deleted successfully"
        });

    });

};

// Update a transaction
exports.updateTransaction = (req, res) => {

    const id = req.params.id;

    const {
        name,
        category,
        amount,
        type,
        transaction_date
    } = req.body;

    const sql = `
        UPDATE transactions
        SET
            name = ?,
            category = ?,
            amount = ?,
            type = ?,
            transaction_date = ?
        WHERE id = ?
    `;

    db.query(
        sql,
        [name, category, amount, type, transaction_date, id],
        (err, result) => {

            if (err) {
                return res.status(500).json({
                    success: false,
                    error: err.message
                });
            }

            res.json({
                success: true,
                message: "Transaction updated successfully"
            });

        }
    );
};