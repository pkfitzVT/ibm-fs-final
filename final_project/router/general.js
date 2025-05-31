const express = require("express");
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();

public_users.post("/register", (req, res) => {
  // …still to be implemented…
  return res.status(300).json({ message: "Yet to be implemented" });
});

// Task 1: Get the list of all books
public_users.get("/", function (req, res) {
  // 1) Turn the `books` object into a 4‐space‐indented string:
  const prettyBooks = JSON.stringify(books, null, 4);

  // 2) Explicitly set Content-Type to application/json (optional but recommended):
  res.header("Content-Type", "application/json");

  // 3) Send the indented JSON back with HTTP 200
  return res.status(200).send(prettyBooks);
});

// Get book details based on ISBN
public_users.get("/isbn/:isbn", (req, res) => {
  // 1. Read the ISBN out of req.params
  const isbn = req.params.isbn;

  // 2. Look up that key in the `books` object
  if (books[isbn]) {
    // 3a. If it exists, return HTTP 200 with the book’s JSON
    return res.status(200).json(books[isbn]);
  } else {
    // 3b. If not, return 404 “not found”
    return res
        .status(404)
        .json({ message: `Book with ISBN ${isbn} not found` });
  }
});


// Get book details based on author
public_users.get("/author/:author", function (req, res) {
  // …to be implemented later…
  return res.status(300).json({ message: "Yet to be implemented" });
});

// Get all books based on title
public_users.get("/title/:title", function (req, res) {
  // …to be implemented later…
  return res.status(300).json({ message: "Yet to be implemented" });
});

// Get book review
public_users.get("/review/:isbn", function (req, res) {
  // …to be implemented later…
  return res.status(300).json({ message: "Yet to be implemented" });
});

module.exports.general = public_users;
