// // ✅ api/index.js
// const express = require("express");
// const serverless = require("serverless-http");
// const cors = require("cors");
// const router = require("../route");

// const app = express();
// app.use(cors());
// app.use(express.json());
// app.use("/api", router);

// module.exports.handler = serverless(app);

// api/metrics.js

const fetchMetricsFromBlockchain = require("../metrics");

module.exports = async (req, res) => {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  try {
    const metrics = await fetchMetricsFromBlockchain();
    return res.status(200).json(metrics);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};
