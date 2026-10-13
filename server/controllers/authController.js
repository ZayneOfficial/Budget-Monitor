const crypto = require("crypto");
const { promisify } = require("util");
const { User } = require("../db");
const { clearSessionCookie, setSessionCookie } = require("../auth");

const scrypt = promisify(crypto.scrypt);
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function serializeUser(user) {
    return {
        id: user._id.toString(),
        name: user.name,
        email: user.email
    };
}

async function hashPassword(password, salt = crypto.randomBytes(16).toString("hex")) {
    const derivedKey = await scrypt(password, salt, 64);
    return `${salt}:${derivedKey.toString("hex")}`;
}

async function verifyPassword(password, storedHash) {
    const [salt, hash] = storedHash.split(":");
    if (!salt || !/^[a-f\d]{128}$/i.test(hash || "")) {
        return false;
    }
    const expected = Buffer.from(hash, "hex");
    const actual = await scrypt(password, salt, expected.length);
    return crypto.timingSafeEqual(expected, actual);
}

exports.register = async (req, res) => {
    const body = req.body || {};
    const name = typeof body.name === "string" ? body.name.trim() : "";
    const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
    const password = typeof body.password === "string" ? body.password : "";

    if (!name || name.length > 100) {
        return res.status(400).json({ error: "Name is required and must be at most 100 characters." });
    }
    if (email.length > 254 || !EMAIL_PATTERN.test(email)) {
        return res.status(400).json({ error: "Enter a valid email address." });
    }
    if (password.length < 8 || password.length > 128) {
        return res.status(400).json({ error: "Password must be between 8 and 128 characters." });
    }

    try {
        const passwordHash = await hashPassword(password);
        const user = await User.create({ name, email, passwordHash });
        setSessionCookie(res, user._id.toString());
        return res.status(201).json({ user: serializeUser(user) });
    } catch (error) {
        if (error.code === 11000) {
            return res.status(409).json({ error: "An account with this email already exists." });
        }
        console.error("Account registration error:", error.message);
        return res.status(500).json({ error: "Your account could not be created." });
    }
};

exports.login = async (req, res) => {
    const body = req.body || {};
    const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
    const password = typeof body.password === "string" ? body.password : "";

    if (!email || email.length > 254 || !EMAIL_PATTERN.test(email) || !password || password.length > 128) {
        return res.status(400).json({ error: "Enter a valid email address and password." });
    }

    try {
        const user = await User.findOne({ email });
        if (!user || !(await verifyPassword(password, user.passwordHash))) {
            return res.status(401).json({ error: "Email or password is incorrect." });
        }
        setSessionCookie(res, user._id.toString());
        return res.json({ user: serializeUser(user) });
    } catch (error) {
        console.error("Account login error:", error.message);
        return res.status(500).json({ error: "You could not be signed in." });
    }
};

exports.currentUser = async (req, res) => {
    try {
        const user = await User.findById(req.userId).select("name email").lean();
        if (!user) {
            clearSessionCookie(res);
            return res.status(401).json({ error: "Please log in to continue." });
        }
        return res.json({ user: serializeUser(user) });
    } catch (error) {
        console.error("Account lookup error:", error.message);
        return res.status(500).json({ error: "Your account could not be loaded." });
    }
};

exports.logout = (req, res) => {
    clearSessionCookie(res);
    return res.json({ success: true });
};
