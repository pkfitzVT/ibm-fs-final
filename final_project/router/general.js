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
const axios = require("axios");


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
 * ───────────── Task 10 ─────────────
 * GET /axios/books
 *   Public: use Axios (async/await) to fetch GET http://localhost:5000/ (the same “list all books”)
 *   and then return it.
 *
 * Example in Postman: GET http://localhost:5000/axios/books
 *
 * Under the hood, this code is simply calling your own “GET /” route.
 */
public_users.get("/axios/books", async (req, res) => {
  try {
    // ── Change localhost:5000 to whatever host/port your server is running on ──
    const response = await axios.get("http://localhost:5000/");
    // Axios automatically parses the JSON, so response.data === the books object.
    return res.status(200).json(response.data);
  } catch (error) {
    console.error("Error fetching / via Axios:", error.message);
    return res
        .status(500)
        .json({ message: "Unable to fetch books via Axios." });
  }
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
 * ───────────── Task 11 ─────────────
 * GET /axios/isbn/:isbn
 *   Public: use Axios (async/await) to fetch GET http://localhost:5000/isbn/${isbn}
 *   and then return that single book’s JSON.
 *
 * Example in Postman: GET http://localhost:5000/axios/isbn/1
 *
 */
public_users.get("/axios/isbn/:isbn", async (req, res) => {
  const isbn = req.params.isbn;

  try {
    // 1) Call your own "GET /isbn/:isbn" endpoint via Axios
    //    (adjust host:port if needed)
    const response = await axios.get(`http://localhost:5000/isbn/${isbn}`);

    // 2) If that succeeds, response.data is exactly the book object
    return res.status(200).json(response.data);

  } catch (error) {
    // 3) If Axios got a 404 from the upstream "/isbn/:isbn", forward a 404
    if (error.response && error.response.status === 404) {
      return res.status(404).json({
        message: `Book with ISBN ${isbn} not found.`,
      });
    }

    // 4) Otherwise, it’s some other error (network failure, etc.)
    console.error("Error fetching /isbn/:isbn via Axios:", error.message);
    return res.status(500).json({
      message: "Unable to fetch book details via Axios.",
    });
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
 * ───────────── Task 12 ─────────────
 * GET /axios/author/:author
 *   Public: use Axios (async/await) to fetch GET http://localhost:5000/author/${author}
 *   and then return the JSON array of books for that author.
 *
 * Example in Postman: GET http://localhost:5000/axios/author/Unknown
 */
public_users.get("/axios/author/:author", async (req, res) => {
  const author = req.params.author;

  try {
    // 1) Call our own "GET /author/:author" endpoint via Axios.
    //    (Adjust host/port if your server uses something other than localhost:5000.)
    const response = await axios.get(`http://localhost:5000/author/${encodeURIComponent(author)}`);

    // 2) If the upstream request succeeds, response.data is the array of matching books.
    return res.status(200).json(response.data);

  } catch (error) {
    // 3) If Axios got a 404 from our own /author/:author, forward a 404 to the client.
    if (error.response && error.response.status === 404) {
      return res.status(404).json({
        message: `No books found by author "${author}".`
      });
    }

    // 4) Otherwise, some other network or server error occurred.
    console.error("Error fetching /author/:author via Axios:", error.message);
    return res.status(500).json({
      message: "Unable to fetch books by author via Axios."
    });
  }
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
 * ───────────── Task 13 ─────────────
 * GET /axios/title/:title
 *   Public: use Axios (async/await) to fetch GET http://localhost:5000/title/${title}
 *   and then return the JSON array of books matching that title.
 *
 * Example in Postman:
 *   GET http://localhost:5000/axios/title/Things%20Fall%20Apart
 */
public_users.get("/axios/title/:title", async (req, res) => {
  const title = req.params.title;

  try {
    // 1) Call our own "GET /title/:title" endpoint via Axios.
    //    (Adjust host/port if your server is running on something other than localhost:5000.)
    const response = await axios.get(
        `http://localhost:5000/title/${encodeURIComponent(title)}`
    );

    // 2) If the upstream request succeeds, response.data is the array of matching books.
    return res.status(200).json(response.data);
  } catch (error) {
    // 3) If Axios got a 404 from our own /title/:title, forward a 404 to the client.
    if (error.response && error.response.status === 404) {
      return res.status(404).json({
        message: `No books found with title "${title}".`,
      });
    }

    // 4) Otherwise, a network or server error occurred.
    console.error("Error fetching /title/:title via Axios:", error.message);
    return res.status(500).json({
      message: "Unable to fetch books by title via Axios.",
    });
  }
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
