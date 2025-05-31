// router/general.js

const express = require("express");
const jwt = require("jsonwebtoken");

// Import the same helpers from auth_users.js
const {
  users,
  doesExist,
  isValid,
  authenticatedUser,
} = require("./auth_users.js");

const books = require("./booksdb.js");
const public_users = express.Router();
const JWT_SECRET = "fingerprint_customer";

/**
 * POST /register
 *   Public: register a new user.
 *   Body: { "username": "...", "password": "..." }
 */
public_users.post("/register", (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ message: "Username and password are required." });
  }
  if (!isValid(username)) {
    return res
        .status(400)
        .json({ message: "Invalid username format. Letters/digits only." });
  }
  if (doesExist(username)) {
    return res.status(409).json({ message: "User already exists!" });
  }
  users.push({ username, password });
  return res
      .status(200)
      .json({ message: "User successfully registered. Now you can login." });
});

/**
 * Task 1: GET /
 *   Lists all books as JSON.
 */
public_users.get("/", (req, res) => {
  const prettyBooks = JSON.stringify(books, null, 4);
  res.header("Content-Type", "application/json");
  return res.status(200).send(prettyBooks);
});

/**
 * Task 2: GET /isbn/:isbn
 *   Public: fetch book by ISBN.
 */
public_users.get("/isbn/:isbn", (req, res) => {
  const isbn = req.params.isbn;
  if (books[isbn]) {
    return res.status(200).json(books[isbn]);
  } else {
    return res
        .status(404)
        .json({ message: `Book with ISBN ${isbn} not found` });
  }
});

/**
 * Task 3: GET /author/:author
 *   Public: search by author.
 */
public_users.get("/author/:author", (req, res) => {
  const requestedAuthor = req.params.author.toLowerCase();
  const matchingBooks = [];
  Object.keys(books).forEach((isbn) => {
    const book = books[isbn];
    if (book.author.toLowerCase() === requestedAuthor) {
      matchingBooks.push({ isbn, ...book });
    }
  });
  if (matchingBooks.length > 0) {
    return res.status(200).json(matchingBooks);
  }
  return res
      .status(404)
      .json({ message: `No books found by author "${req.params.author}"` });
});

/**
 * Task 4: GET /title/:title
 *   Public: search by title.
 */
public_users.get("/title/:title", (req, res) => {
  const requestedTitle = req.params.title.toLowerCase();
  const matchingBooks = [];
  Object.keys(books).forEach((isbn) => {
    const book = books[isbn];
    if (book.title.toLowerCase() === requestedTitle) {
      matchingBooks.push({ isbn, ...book });
    }
  });
  if (matchingBooks.length > 0) {
    return res.status(200).json(matchingBooks);
  }
  return res
      .status(404)
      .json({ message: `No books found with title "${req.params.title}"` });
});

/**
 * Task 5: GET /review/:isbn
 *   Public: return reviews or “please review” message.
 */
public_users.get("/review/:isbn", (req, res) => {
  const isbn = req.params.isbn;
  const book = books[isbn];
  if (!book) {
    return res
        .status(404)
        .json({ message: `Book with ISBN ${isbn} not found` });
  }
  const reviewsObj = book.reviews || {};
  const reviewKeys = Object.keys(reviewsObj);
  if (reviewKeys.length === 0) {
    return res.status(200).json({
      message:
          "Please consider reviewing this book because there are no reviews yet.",
    });
  }
  const reviewEntries = reviewKeys.map((username) => ({
    user: username,
    reviewText: reviewsObj[username],
  }));
  return res.status(200).json(reviewEntries);
});

module.exports.general = public_users;
