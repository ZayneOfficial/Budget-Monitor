const { Transaction, isValidId } = require("../db");

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

    return { values: { name, category, amount, type, transaction_date: transactionDate } };
}

function serializeTransaction(transaction) {
    return {
        id: transaction._id.toString(),
        name: transaction.name,
        category: transaction.category,
        amount: transaction.amount,
        type: transaction.type,
        transaction_date: transaction.transaction_date
    };
}

function handleDatabaseError(res, error) {
    console.error("Transaction database error:", error.message);
    return res.status(500).json({ error: "The transaction could not be saved." });
}

exports.getTransactions = async (req, res) => {
    try {
        const transactions = await Transaction.find()
            .where({ userId: req.userId })
            .sort({ transaction_date: -1, _id: -1 })
            .lean();
        return res.json(transactions.map(serializeTransaction));
    } catch (error) {
        return handleDatabaseError(res, error);
    }
};

exports.addTransaction = async (req, res) => {
    const validation = validateTransaction(req.body);
    if (validation.error) {
        return res.status(400).json({ error: validation.error });
    }

    try {
        const transaction = await Transaction.create({ ...validation.values, userId: req.userId });
        return res.status(201).json({
            success: true,
            message: "Transaction added successfully.",
            id: transaction._id.toString()
        });
    } catch (error) {
        return handleDatabaseError(res, error);
    }
};

exports.updateTransaction = async (req, res) => {
    if (!isValidId(req.params.id)) {
        return res.status(400).json({ error: "A valid transaction ID is required." });
    }

    const validation = validateTransaction(req.body);
    if (validation.error) {
        return res.status(400).json({ error: validation.error });
    }

    try {
        const transaction = await Transaction.findOneAndUpdate(
            { _id: req.params.id, userId: req.userId },
            validation.values,
            { new: true, runValidators: true }
        );
        if (!transaction) {
            return res.status(404).json({ error: "Transaction not found." });
        }

        return res.json({ success: true, message: "Transaction updated successfully." });
    } catch (error) {
        return handleDatabaseError(res, error);
    }
};

exports.deleteTransaction = async (req, res) => {
    if (!isValidId(req.params.id)) {
        return res.status(400).json({ error: "A valid transaction ID is required." });
    }

    try {
        const transaction = await Transaction.findOneAndDelete({ _id: req.params.id, userId: req.userId });
        if (!transaction) {
            return res.status(404).json({ error: "Transaction not found." });
        }

        return res.json({ success: true, message: "Transaction deleted successfully." });
    } catch (error) {
        return handleDatabaseError(res, error);
    }
};