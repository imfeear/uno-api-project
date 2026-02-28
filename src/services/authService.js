const userRepo = require("../repositories/userRepository");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const tokenBlacklist = new Set();

function isBlank(v) {
  return v === undefined || v === null || (typeof v === "string" && v.trim() === "");
}

async function register({ username, email, password }) {
  if (isBlank(username) || isBlank(email) || isBlank(password)) {
    return { status: 400, error: "username, email and password are required" };
  }

  const byUsername = await userRepo.findByUsername(username);
  if (byUsername) return { status: 409, error: "User already exists" };

  const byEmail = await userRepo.findByEmail(email);
  if (byEmail) return { status: 409, error: "User already exists" };

  const passwordHash = await bcrypt.hash(password, 10);
  await userRepo.create({ username, email, passwordHash });

  return { status: 201, data: { message: "User registered successfully" } };
}

async function login({ username, password }) {
  if (isBlank(username) || isBlank(password)) {
    return { status: 400, error: "username and password are required" };
  }

  const user = await userRepo.findByUsername(username);
  if (!user) return { status: 401, error: "Invalid credentials" };

  const ok = await bcrypt.compare(password, user.passwordHash);
  if (!ok) return { status: 401, error: "Invalid credentials" };

  const secret = process.env.JWT_SECRET || "dev_secret";
  const access_token = jwt.sign({ userId: user.id }, secret, { expiresIn: "1h" });

  return { status: 200, data: { access_token } };
}

function logout({ access_token }) {
  if (isBlank(access_token)) {
    return { status: 400, error: "access_token is required" };
  }

  tokenBlacklist.add(access_token);
  return { status: 200, data: { message: "User logged out successfully" } };
}

function verifyToken(token) {
  if (isBlank(token)) return { error: "missing token" };
  if (tokenBlacklist.has(token)) return { error: "token invalidated" };

  try {
    const secret = process.env.JWT_SECRET || "dev_secret";
    const payload = jwt.verify(token, secret);
    return { payload };
  } catch (e) {
    return { error: "invalid token" };
  }
}

async function getProfileByToken(token) {
  if (isBlank(token)) return { status: 401, error: "Invalid token" };
  if (tokenBlacklist.has(token)) return { status: 401, error: "Invalid token" };

  try {
    const secret = process.env.JWT_SECRET || "dev_secret";
    const payload = jwt.verify(token, secret);

    const user = await userRepo.findById(payload.userId);
    if (!user) return { status: 404, error: "User not found" };

    return { status: 200, data: { username: user.username, email: user.email } };
  } catch (e) {
    return { status: 401, error: "Invalid token" };
  }
}

module.exports = {
  register,
  login,
  logout,
  verifyToken,
  getProfileByToken,

  // útil pra teste, se precisar limpar
  _tokenBlacklist: tokenBlacklist
};
