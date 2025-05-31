// index.js

const express = require("express");
const session = require("express-session");
const app = express();

app.use(express.json());

// 1) Any route under /customer/* can use session:
//    e.g. /customer/login, /customer/auth/review/:isbn
app.use(
    "/customer",
    session({
        secret: "fingerprint_customer",
        resave: true,
        saveUninitialized: true,
    })
);

// 2) Mount the “authenticated users” router HERE:
const authRouter = require("./router/auth_users.js").authenticated;
app.use("/customer", authRouter);

// 3) Mount your “general” router (public) at /
const publicRouter = require("./router/general.js").general;
app.use("/", publicRouter);

const PORT = 5000;
app.listen(PORT, () => console.log(`Server is running on port ${PORT}`));
