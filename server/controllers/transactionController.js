const db = require("../db");

function validateTransaction(body = {}) {
    const name = typeof body.name === "string" ? body.name.trim() : "";
    const category = typeof body.category === "string" ? body.category.trim() : "";
    const amount = Number(body.amount);
    const type = body.type;
    const transactionDate = body.transaction_date;

    if (!name || name.length > 255) {
        return { error: "Name is required and must be at most 255 characters." };
    }

    if (!category || category.length > 100) {
        return { error: "Category is required and must be at most 100 characters." };
    }

    if (!Number.isFinite(amount) || amount <= 0) {
        return { error: "Amount must be a number greater than zero." };
    }

    if (type !== "income" && type !== "expense") {
        return { error: "Type must be income or expense." };
    }

    if (typeof transactionDate !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(transactionDate)) {
        return { error: "A valid transaction date is required." };
    }

    const parsedDate = new Date(`${transactionDate}T00:00:00.000Z`);
    if (Number.isNaN(parsedDate.getTime()) || parsedDate.toISOString().slice(0, 10) !== transactionDate) {
        return { error: "A valid transaction date is required." };
    }

    return { values: [name, category, amount, type, transactionDate] };
}

function parseId(value) {
    const id = Number(value);
    return Number.isInteger(id) && id > 0 ? id : null;
}

function handleDatabaseError(res, error) {
    console.error("Transaction database error:", error.message);
    return res.status(500).json({ error: "The transaction could not be saved." });
}

exports.getTransactions = (req, res) => {
    db.query(
        "SELECT * FROM transactions ORDER BY transaction_date DESC, id DESC",
        (error, results) => {
            if (error) {
                return handleDatabaseError(res, error);
            }

            return res.json(results);
        }
    );
};

exports.addTransaction = (req, res) => {
    const validation = validateTransaction(req.body);
    if (validation.error) {
        return res.status(400).json({ error: validation.error });
    }

    db.query(
        `INSERT INTO transactions (name, category, amount, type, transaction_date)
         VALUES (?, ?, ?, ?, ?)`,
        validation.values,
        (error, result) => {
            if (error) {
                return handleDatabaseError(res, error);
            }

            return res.status(201).json({
                success: true,
                message: "Transaction added successfully.",
                id: result.insertId
            });
        }
    );
};

exports.updateTransaction = (req, res) => {
    const id = parseId(req.params.id);
    if (!id) {
        return res.status(400).json({ error: "A valid transaction ID is required." });
    }

    const validation = validateTransaction(req.body);
    if (validation.error) {
        return res.status(400).json({ error: validation.error });
    }

    db.query(
        `UPDATE transactions
         SET name = ?, category = ?, amount = ?, type = ?, transaction_date = ?
         WHERE id = ?`,
        [...validation.values, id],
        (error, result) => {
            if (error) {
                return handleDatabaseError(res, error);
            }
            if (result.affectedRows === 0) {
                return res.status(404).json({ error: "Transaction not found." });
            }

            return res.json({ success: true, message: "Transaction updated successfully." });
        }
    );
};

exports.deleteTransaction = (req, res) => {
    const id = parseId(req.params.id);
    if (!id) {
        return res.status(400).json({ error: "A valid transaction ID is required." });
    }

    db.query("DELETE FROM transactions WHERE id = ?", [id], (error, result) => {
        if (error) {
            return handleDatabaseError(res, error);
        }
        if (result.affectedRows === 0) {
            return res.status(404).json({ error: "Transaction not found." });
        }

        return res.json({ success: true, message: "Transaction deleted successfully." });
    });
};