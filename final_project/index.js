// index.js

const express = require("express");
const app = express();

// Middleware: automatically parse JSON bodies (i.e., req.body)
app.use(express.json());

// 1) Import and mount the “public” router at the root.
//    Any request to /register (POST), / (GET), etc. would come here.
//    (Right now, this router only has /register.)
const publicRouter = require("./router/general.js").general;
app.use("/", publicRouter);

// 2) Start the server on port 5000
const PORT = 5000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
