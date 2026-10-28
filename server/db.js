const path = require("path");
const mongoose = require("mongoose");

require("dotenv").config({ path: path.join(__dirname, ".env") });

if (!process.env.MONGODB_URI) {
    throw new Error("Missing database setting: MONGODB_URI");
}

const transactionSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    name: { type: String, required: true, maxlength: 255 },
    category: { type: String, required: true, maxlength: 100 },
    amount: { type: Number, required: true, min: 0 },
    type: { type: String, required: true, enum: ["income", "expense"] },
    transaction_date: { type: String, required: true }
}, {
    versionKey: false
});

transactionSchema.index({ userId: 1, transaction_date: -1, _id: -1 });

const Transaction = mongoose.model("Transaction", transactionSchema);

const userSchema = new mongoose.Schema({
    name: { type: String, required: true, trim: true, maxlength: 100 },
    email: { type: String, required: true, lowercase: true, trim: true, maxlength: 254, unique: true },
    passwordHash: { type: String, required: true }
}, {
    timestamps: true,
    versionKey: false
});
const User = mongoose.model("User", userSchema);

async function dropLegacyUsernameIndex(collection = User.collection) {
    const indexes = await collection.indexes();
    const legacyIndex = indexes.find((index) => (
        index.name === "username_1"
        && index.unique === true
        && Object.keys(index.key || {}).length === 1
        && index.key.username === 1
    ));

    if (legacyIndex) {
        await collection.dropIndex(legacyIndex.name);
        console.info("Removed obsolete unique username index.");
    }
}

module.exports = {
    Transaction,
    User,
    dropLegacyUsernameIndex,
    connect: async () => {
        await mongoose.connect(process.env.MONGODB_URI);
        await Promise.all([Transaction.init(), User.init()]);
        await dropLegacyUsernameIndex();
    },
    ping: () => mongoose.connection.db.admin().ping(),
    disconnect: () => mongoose.disconnect(),
    isValidId: (id) => /^[a-f\d]{24}$/i.test(id)
};
