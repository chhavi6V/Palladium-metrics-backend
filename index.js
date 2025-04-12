const express = require("express");
const cors = require("cors");
const { port } = require("./config");
const routes = require("./route");
const connectDB = require("./database");

const app = express();
app.use(cors());
app.use(express.json());
app.use("/protocol", routes);


connectDB().then(() => {
    app.listen(port, () =>
        console.log(`🚀 Server running on http://localhost:${port}`)
    );
}).catch((err) => {
    console.error("❌ Failed to connect to MongoDB at startup:", err);
    process.exit(1); // Exit if DB connection fails
});