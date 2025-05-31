// index.js

const express = require("express");
const session = require("express-session");

const app = express();
app.use(express.json());

// 1) Set up session on /customer (so req.session is available if you need it later)
app.use(
    "/customer",
    session({
        secret: "fingerprint_customer",
        resave: true,
        saveUninitialized: true,
    })
);

// 2) Mount “authenticated‐user” router under /customer
const authRouter = require("./router/auth_users.js").authenticated;
app.use("/customer", authRouter);

// 3) Mount “public” router at /
const publicRouter = require("./router/general.js").general;
app.use("/", publicRouter);

const PORT = 5000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
