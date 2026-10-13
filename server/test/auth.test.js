const test = require("node:test");
const assert = require("node:assert/strict");

process.env.SESSION_SECRET = "test-only-session-secret-that-is-at-least-32-characters";
const { requireAuth, setSessionCookie } = require("../auth");

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

test("authentication rejects requests without a valid session", () => {
    const response = makeResponse();
    let nextCalled = false;

    requireAuth({ headers: {} }, response, () => {
        nextCalled = true;
    });

    assert.equal(response.statusCode, 401);
    assert.equal(response.body.error, "Please log in to continue.");
    assert.equal(nextCalled, false);
});

test("authentication accepts a signed session cookie and sets the user ID", () => {
    const userId = "65f1a24b7c8d9e0012345678";
    let cookie;
    const response = {
        cookie(name, value, options) {
            assert.equal(name, "budget_session");
            assert.equal(options.httpOnly, true);
            assert.equal(options.sameSite, "lax");
            cookie = value;
        }
    };
    setSessionCookie(response, userId);

    const request = { headers: { cookie: `budget_session=${cookie}` } };
    let nextCalled = false;
    requireAuth(request, makeResponse(), () => {
        nextCalled = true;
    });

    assert.equal(nextCalled, true);
    assert.equal(request.userId, userId);
});

test("authentication rejects a tampered session cookie", () => {
    const userId = "65f1a24b7c8d9e0012345678";
    let cookie;
    setSessionCookie({ cookie: (_name, value) => { cookie = value; } }, userId);

    const response = makeResponse();
    requireAuth({ headers: { cookie: `budget_session=${cookie}x` } }, response, () => {
        assert.fail("tampered session must not authenticate");
    });

    assert.equal(response.statusCode, 401);
});
