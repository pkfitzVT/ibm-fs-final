// router/auth_users.js
const express = require("express");
const jwt = require("jsonwebtoken");
const session = require("express-session");
const books = require("./booksdb.js");

// In-memory users & helpers (same as before)
let users = [];
const doesExist = (username) => users.some((u) => u.username === username);
const isValid = (username) => {
  if (typeof username !== "string") return false;
  const t = username.trim();
  return t.length > 0 && /^[a-zA-Z0-9]+$/.test(t);
};
const authenticatedUser = (username, password) => {
  return users.some((u) => u.username === username && u.password === password);
};

const regd_users = express.Router();
const JWT_SECRET = "fingerprint_customer";

// ——— LOGIN (store username in session) ———
regd_users.post("/login", (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res
        .status(400)
        .json({ message: "Username and password are both required." });
  }
  if (!isValid(username)) {
    return res
        .status(400)
        .json({ message: "Invalid username format; letters/digits only." });
  }
  if (!authenticatedUser(username, password)) {
    return res.status(401).json({
      message:
          "Invalid username or password. If you don’t have an account, please register at `/register`.",
    });
  }

  // At this point, credentials are valid → generate JWT
  const payload = { username };
  const accessToken = jwt.sign(payload, JWT_SECRET, { expiresIn: "1h" });

  // **Store the username in the session** for future “add review” requests:
  req.session.username = username;

  return res
      .status(200)
      .json({ message: "User successfully logged in", accessToken });
});

// ——— Middleware to protect /auth/* routes ———
regd_users.use("/auth/*", (req, res, next) => {
  // If you want to require the JWT, you can keep your existing JWT‐check here.
  // But **the assignment hint** says “username (stored in the session),” so:
  if (!req.session.username) {
    return res
        .status(401)
        .json({ message: "You must be logged in to add or modify reviews." });
  }
  // (Optionally, also verify the token in Authorization header here.)
  next();
});

/**
 * Task 8: PUT /auth/review/:isbn
 *    - Username is read from req.session.username
 *    - Review text is read from the query string: req.query.review
 *    - If user already left a review for this ISBN, overwrite it
 *    - Otherwise, add it under book.reviews[username]
 *
 * Example request in Postman:
 *    PUT http://localhost:5000/customer/auth/review/1?review=Absolutely%20Loved%20It!
 *
 * Headers:
 *    (No extra headers needed for session; just make sure Postman “preserves cookies.”)
 *
 * Body:
 *    (empty, because we’re using req.query.review)
 */
regd_users.put("/auth/review/:isbn", (req, res) => {
  const isbn = req.params.isbn;
  const username = req.session.username; // set at login time

  // 1) Check if book exists
  const book = books[isbn];
  if (!book) {
    return res
        .status(404)
        .json({ message: `Book with ISBN ${isbn} not found.` });
  }

  // 2) Extract the “review” text from the query string
  const reviewText = req.query.review;
  if (!reviewText || typeof reviewText !== "string") {
    return res
        .status(400)
        .json({
          message:
              "Please provide your review text as a `?review=...` query parameter.",
        });
  }

  // 3) Add or modify the review
  if (!book.reviews) {
    book.reviews = {};
  }
  book.reviews[username] = reviewText.trim();

  // 4) Respond with the updated reviews
  return res.status(200).json({
    message: `Review added/updated for ISBN ${isbn} by user ${username}.`,
    reviews: book.reviews,
  });
});

module.exports.authenticated = regd_users;
module.exports.users = users;
module.exports.doesExist = doesExist;
module.exports.isValid = isValid;
module.exports.authenticatedUser = authenticatedUser;
