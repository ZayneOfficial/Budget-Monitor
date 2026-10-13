const crypto = require("crypto");

const COOKIE_NAME = "budget_session";
const SESSION_DURATION_SECONDS = 7 * 24 * 60 * 60;
const SESSION_SECRET = process.env.SESSION_SECRET;

if (!SESSION_SECRET || SESSION_SECRET.length < 32) {
    throw new Error("SESSION_SECRET must be set to a value at least 32 characters long.");
}

function sign(value) {
    return crypto.createHmac("sha256", SESSION_SECRET).update(value).digest("base64url");
}

function createSessionToken(userId) {
    const payload = Buffer.from(JSON.stringify({
        sub: userId,
        exp: Math.floor(Date.now() / 1000) + SESSION_DURATION_SECONDS
    })).toString("base64url");

    return `${payload}.${sign(payload)}`;
}

function getCookie(req, name) {
    const cookies = req.headers.cookie || "";
    for (const cookie of cookies.split(";")) {
        const separator = cookie.indexOf("=");
        if (separator < 0 || cookie.slice(0, separator).trim() !== name) {
            continue;
        }
        return cookie.slice(separator + 1).trim();
    }
    return "";
}

function verifySessionToken(token) {
    const [payload, signature, extra] = token.split(".");
    if (!payload || !signature || extra !== undefined) {
        return null;
    }

    const expected = Buffer.from(sign(payload));
    const provided = Buffer.from(signature);
    if (expected.length !== provided.length || !crypto.timingSafeEqual(expected, provided)) {
        return null;
    }

    try {
        const session = JSON.parse(Buffer.from(payload, "base64url").toString("utf8"));
        if (typeof session.sub !== "string" || !/^[a-f\d]{24}$/i.test(session.sub)
            || !Number.isInteger(session.exp) || session.exp <= Math.floor(Date.now() / 1000)) {
            return null;
        }
        return session;
    } catch {
        return null;
    }
}

function setSessionCookie(res, userId) {
    res.cookie(COOKIE_NAME, createSessionToken(userId), {
        httpOnly: true,
        sameSite: "lax",
        secure: process.env.NODE_ENV === "production",
        maxAge: SESSION_DURATION_SECONDS * 1000,
        path: "/"
    });
}

function clearSessionCookie(res) {
    res.clearCookie(COOKIE_NAME, {
        httpOnly: true,
        sameSite: "lax",
        secure: process.env.NODE_ENV === "production",
        path: "/"
    });
}

function requireAuth(req, res, next) {
    const session = verifySessionToken(getCookie(req, COOKIE_NAME));
    if (!session) {
        return res.status(401).json({ error: "Please log in to continue." });
    }
    req.userId = session.sub;
    return next();
}

module.exports = {
    COOKIE_NAME,
    SESSION_DURATION_SECONDS,
    clearSessionCookie,
    requireAuth,
    setSessionCookie
};
