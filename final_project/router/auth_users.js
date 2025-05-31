// router/auth_users.js

const express = require("express");
const jwt = require("jsonwebtoken");
const books = require("./booksdb.js");

// ─── In‐Memory Store & Helpers ───
// We keep the exact same `users` array and helper functions we used in general.js:
let users = []; // ← This is the same array reference imported by general.js
const doesExist = (username) => {
  return users.some((u) => u.username === username);
};
const isValid = (username) => {
  if (typeof username !== "string") return false;
  const trimmed = username.trim();
  if (trimmed.length === 0) return false;
  return /^[a-zA-Z0-9]+$/.test(trimmed);
};
const authenticatedUser = (username, password) => {
  return users.some((u) => u.username === username && u.password === password);
};

// ─── “Authenticated” Router ───
const regd_users = express.Router();
const JWT_SECRET = "fingerprint_customer";

// POST /customer/login  (Task 7)
//   Expects { username, password }. Public: no token needed.
//   If valid, returns { message, accessToken }.
regd_users.post("/login", (req, res) => {
  const { username, password } = req.body;

  // 1) Fields required
  if (!username || !password) {
    return res
        .status(400)
        .json({ message: "Username and password are both required." });
  }

  // 2) Validate username format
  if (!isValid(username)) {
    return res
        .status(400)
        .json({ message: "Invalid username format. Use letters and numbers only." });
  }

  // 3) Check credentials
  if (!authenticatedUser(username, password)) {
    return res.status(401).json({
      message:
          "Invalid username or password. If you don’t have an account, please register at `/register`.",
    });
  }

  // 4) Generate JWT
  const payload = { username };
  const accessToken = jwt.sign(payload, JWT_SECRET, { expiresIn: "1h" });

  // 5) Return token (we do NOT store it in session here; clients keep it)
  return res
      .status(200)
      .json({ message: "User successfully logged in", accessToken });
});

/**
 * Middleware to protect any route that starts with /auth/.
 * Verifies Authorization: Bearer <token>.
 */
regd_users.use("/auth/*", (req, res, next) => {
  const authHeader = req.headers["authorization"];
  if (!authHeader) {
    return res.status(401).json({ message: "Missing Authorization header" });
  }
  const [scheme, token] = authHeader.split(" ");
  if (scheme !== "Bearer" || !token) {
    return res
        .status(401)
        .json({ message: "Authorization header must be in format: Bearer <token>" });
  }
  try {
    const payload = jwt.verify(token, JWT_SECRET);
    req.user = payload.username; // store the username for the handler
    next();
  } catch (err) {
    return res.status(401).json({ message: "Invalid or expired token" });
  }
});

/**
 * PUT /customer/auth/review/:isbn  (Task 8)
 *   Protected: requires a valid JWT in Authorization header.
 *   Body: { review: "..." }
 *   Adds/updates the review for that book under req.user.
 */
regd_users.put("/auth/review/:isbn", (req, res) => {
  const isbn = req.params.isbn;
  const book = books[isbn];
  if (!book) {
    return res.status(404).json({ message: `Book with ISBN ${isbn} not found.` });
  }
  const reviewText = req.body.review;
  if (!reviewText || typeof reviewText !== "string" || reviewText.trim().length === 0) {
    return res
        .status(400)
        .json({ message: "Please provide a non‐empty 'review' field in the JSON body." });
  }
  const reviewer = req.user;
  if (!book.reviews) {
    book.reviews = {};
  }
  book.reviews[reviewer] = reviewText.trim();
  return res.status(200).json({
    message: `Review added/updated for book ${isbn} by user ${reviewer}.`,
    reviews: book.reviews,
  });
});

// ─── Export ───
module.exports.authenticated = regd_users;
module.exports.users = users;
module.exports.doesExist = doesExist;
module.exports.isValid = isValid;
module.exports.authenticatedUser = authenticatedUser;
