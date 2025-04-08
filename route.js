const express = require("express");
const fetchMetricsFromBlockchain = require("./metrics");

const router = express.Router();

router.get("/metrics", async (req, res) => {
  try {
    const metrics = await fetchMetricsFromBlockchain();
    res.json(metrics);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;