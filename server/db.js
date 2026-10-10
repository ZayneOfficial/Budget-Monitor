const path = require("path");
const mongoose = require("mongoose");

require("dotenv").config({ path: path.join(__dirname, ".env") });

if (!process.env.MONGODB_URI) {
    throw new Error("Missing database setting: MONGODB_URI");
}

const transactionSchema = new mongoose.Schema({
    name: { type: String, required: true, maxlength: 255 },
    category: { type: String, required: true, maxlength: 100 },
    amount: { type: Number, required: true, min: 0 },
    type: { type: String, required: true, enum: ["income", "expense"] },
    transaction_date: { type: String, required: true }
}, {
    versionKey: false
});

transactionSchema.index({ transaction_date: -1, _id: -1 });

const Transaction = mongoose.model("Transaction", transactionSchema);

module.exports = {
    Transaction,
    connect: () => mongoose.connect(process.env.MONGODB_URI),
    ping: () => mongoose.connection.db.admin().ping(),
    disconnect: () => mongoose.disconnect(),
    isValidId: (id) => /^[a-f\d]{24}$/i.test(id)
};
