// router/general.js

const express = require("express");

// Since auth_users_helpers.js and booksdb.js live in the same /router folder,
// we require them with "./"
const { users, doesExist, isValid } = require("./auth_users.js");
let books = require("./booksdb.js");

const public_users = express.Router();

//
//  POST /register
//  Body: { "username": "...", "password": "..." }
//  Returns 200 on success, 409 if the user already exists, 400 if missing/invalid.
//
public_users.post("/register", (req, res) => {
  const { username, password } = req.body;

  // 1) Check both fields were provided
  if (!username || !password) {
    return res
        .status(400)
        .json({ message: "Username and password are required." });
  }

  // 2) Ensure username is alphanumeric (no spaces/special chars)
  if (!isValid(username)) {
    return res.status(400).json({
      message: "Invalid username format. Use letters and numbers only.",
    });
  }

  // 3) Check if that username already exists
  if (doesExist(username)) {
    return res.status(409).json({ message: "User already exists!" });
  }

  // 4) Otherwise, add to the in‐memory array
  users.push({ username, password });
  return res
      .status(200)
      .json({ message: "User successfully registered. Now you can login." });
});

//
//  Task 1: GET /
//  Return the entire `books` object, pretty‐printed as JSON.
//
public_users.get("/", (req, res) => {
  const prettyBooks = JSON.stringify(books, null, 4);
  res.header("Content-Type", "application/json");
  return res.status(200).send(prettyBooks);
});

//
//  Task 2: GET /isbn/:isbn
//  Look up a single book by its ISBN (the key in `books`).
//  Return 200 + book JSON if found, or 404 if not.
//
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

//
//  Task 3: GET /author/:author
//  Return an array of books whose `book.author.toLowerCase()` matches the requested author.
//  If none match, return 404 + message.
//
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

//
//  Task 4: GET /title/:title
//  Return an array of books whose `book.title.toLowerCase()` matches the requested title.
//  If none match, return 404 + message.
//
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

//
//  Task 5: GET /review/:isbn
//  Return the `reviews` object for that ISBN (even if it’s empty).
//  If there are no reviews, return a friendly message.
//  If the book doesn’t exist, return 404.
//
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

  // Convert { user1: "text1", user2: "text2" } into [ { user, reviewText }, … ]
  const reviewEntries = reviewKeys.map((username) => ({
    user: username,
    reviewText: reviewsObj[username],
  }));
  return res.status(200).json(reviewEntries);
});

module.exports.general = public_users;
