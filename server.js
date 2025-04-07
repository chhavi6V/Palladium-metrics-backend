const express = require("express");
const cors = require("cors");
const { port } = require("./config");
const routes = require("./route");

const app = express();
app.use(cors());
app.use(express.json());
app.use("/api", routes);

app.listen(port, () => console.log(`🚀 Server running on http://localhost:${port}`));
