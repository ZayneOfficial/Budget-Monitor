const test = require("node:test");
const assert = require("node:assert/strict");

process.env.MONGODB_URI ||= "mongodb://127.0.0.1:27017/budget_monitor_test";
process.env.SESSION_SECRET ||= "test-only-session-secret-that-is-at-least-32-characters";

const { User } = require("../db");
const authController = require("../controllers/authController");

test("the user schema declares one unique email index", () => {
    const emailIndexes = User.schema.indexes().filter(([fields, options]) => (
        fields.email === 1 && options.unique
    ));

    assert.equal(emailIndexes.length, 1);
});

function makeResponse() {
    return {
        statusCode: 200,
        body: null,
        status(code) {
            this.statusCode = code;
            return this;
        },
        json(body) {
            this.body = body;
            return this;
        }
    };
}

async function registerWithError(error) {
    const originalCreate = User.create;
    User.create = async () => {
        throw error;
    };

    try {
        const response = makeResponse();
        await authController.register({
            body: { name: "Test User", email: "unique@example.com", password: "password123" }
        }, response);
        return response;
    } finally {
        User.create = originalCreate;
    }
}

test("registration reports an email conflict only when the email index conflicts", async () => {
    const response = await registerWithError({
        code: 11000,
        keyPattern: { email: 1 }
    });

    assert.equal(response.statusCode, 409);
    assert.equal(response.body.error, "An account with this email already exists.");
});

test("registration does not report unrelated duplicate-key errors as email conflicts", async () => {
    const originalError = console.error;
    console.error = () => {};

    try {
        const response = await registerWithError({
            code: 11000,
            keyPattern: { name: 1 }
        });

        assert.equal(response.statusCode, 500);
        assert.equal(response.body.error, "Your account could not be created.");
    } finally {
        console.error = originalError;
    }
});
