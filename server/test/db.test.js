const test = require("node:test");
const assert = require("node:assert/strict");

process.env.MONGODB_URI ||= "mongodb://127.0.0.1:27017/budget_monitor_test";
const { dropLegacyUsernameIndex } = require("../db");

test("database migration drops the obsolete unique username index", async () => {
    const droppedIndexes = [];
    const collection = {
        async indexes() {
            return [
                { name: "_id_", key: { _id: 1 }, unique: true },
                { name: "username_1", key: { username: 1 }, unique: true },
                { name: "email_1", key: { email: 1 }, unique: true }
            ];
        },
        async dropIndex(name) {
            droppedIndexes.push(name);
        }
    };

    await dropLegacyUsernameIndex(collection);

    assert.deepEqual(droppedIndexes, ["username_1"]);
});

test("database migration preserves unrelated and compound indexes", async () => {
    const droppedIndexes = [];
    const collection = {
        async indexes() {
            return [
                { name: "username_1", key: { username: 1 }, unique: false },
                { name: "username_email_1", key: { username: 1, email: 1 }, unique: true }
            ];
        },
        async dropIndex(name) {
            droppedIndexes.push(name);
        }
    };

    await dropLegacyUsernameIndex(collection);

    assert.deepEqual(droppedIndexes, []);
});
