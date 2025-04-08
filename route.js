const express = require("express");
const fetchMetricsFromBlockchain = require("./metrics");
const updateMcrAndCcrInMongoDB = require("./botonix_multi_colletral_sec");
const fs = require("fs");
const path = require("path");

const router = express.Router();

// router.get("/metrics", async (req, res) => {
//   try {
//     const metrics = await updateMcrAndCcrInMongoDB();
//     res.json(metrics);
//   } catch (error) {
//     res.status(500).json({ error: error.message });
//   }
// });

router.get("/metrics", (req, res) => {
    // Since mockMetrics.json is in the root of the project
    const filePath = path.join(__dirname, "mockMetrics.json"); // Adjusted path
  
    fs.readFile(filePath, "utf8", (err, data) => {
      if (err) {
        console.error("❌ Error reading mock metrics file:", err);
        return res.status(500).json({ error: "Failed to load metrics" });
      }
  
      try {
        const parsed = JSON.parse(data);
        res.json(parsed); // No need to access `.metrics` since your JSON is an array
      } catch (parseErr) {
        console.error("❌ JSON parsing error:", parseErr);
        res.status(500).json({ error: "Invalid JSON format" });
      }
    });
  });

module.exports = router;
