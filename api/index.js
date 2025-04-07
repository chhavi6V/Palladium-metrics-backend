// ✅ api/index.js
const express = require("express");
const serverless = require("serverless-http");
const cors = require("cors");
const router = require("../route");

const app = express();
app.use(cors());
app.use(express.json());
app.use("/api", router);

module.exports.handler = serverless(app);
