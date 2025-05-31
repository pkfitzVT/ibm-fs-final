// auth_users.js

// 1) In-memory array of registered users.
//    Each element looks like { username: "alice", password: "wonderland" }.
let users = [];

/**
 * doesExist(username): boolean
 *   Returns true if ANY user in `users` already has exactly this username.
 */
const doesExist = (username) => {
  return users.some((u) => u.username === username);
};

/**
 * isValid(username): boolean
 *   Returns true if `username` is a non-empty, trimmed, alphanumeric string.
 *   (If you want to allow underscores/hyphens, adjust the regex accordingly.)
 */
const isValid = (username) => {
  if (typeof username !== "string") return false;
  const trimmed = username.trim();
  if (trimmed.length === 0) return false;
  // Allow only letters and digits (no spaces/special chars):
  return /^[a-zA-Z0-9]+$/.test(trimmed);
};

// 2) Export everything, so other files can do:
//       const { users, doesExist, isValid } = require("./auth_users.js");
module.exports = {
  users,
  doesExist,
  isValid,
};
