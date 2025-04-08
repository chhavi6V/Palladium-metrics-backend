const express = require("express");
const fetchMetricsFromBlockchain = require("./metrics");
const updateMcrAndCcrInMongoDB = require("./botonix_multi_colletral_sec");

const router = express.Router();

router.get("/metrics", async (req, res) => {
  try {
    const metrics = await updateMcrAndCcrInMongoDB();
    res.json(metrics);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
