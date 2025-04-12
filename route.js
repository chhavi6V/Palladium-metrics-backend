const express = require("express");
const updateMcrAndCcrInMongoDB = require("./botonix_multi_colletral_sec"); // This returns your data
const { MongoClient } = require("mongodb");

const router = express.Router();

const uri = "mongodb+srv://akshay:MYQmTfHcAKlFkHAu@events.s4laexk.mongodb.net/";
const client = new MongoClient(uri, { useUnifiedTopology: true });

router.post("/metrics2/update", async (req, res) => {
    try {
      const newData = await updateMcrAndCcrInMongoDB(); // This will fetch, update, and return
  
      res.status(200).json({ message: "metrics2 collection updated", data: newData });
    } catch (error) {
      console.error("Error updating metrics2:", error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  });
  

router.get("/metrics2", async (req, res) => {
  try {
    const db = client.db("protocol");
    const collection = db.collection("metrics2");

    const metrics = await collection.find({}).toArray();

    if (!metrics || metrics.length === 0) {
      return res.status(404).json({ message: "No metrics2 data found" });
    }

    res.json(metrics);
  } catch (error) {
    console.error("Error fetching metrics2:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

router.post("/metrics2/seed", async (req, res) => {
    try {
      const db = client.db("protocol");
      const collection = db.collection("metrics2");
  
      // Optional: clear existing data
      await collection.deleteMany({});
  
      const initialData = {
        metrics: [
          {
            token: "wBTC",
            price: 79123.52280466,
            TCR: "1.7072",
            recoveryMode: false,
            MCR: 1.1,
            CCR: 1.3,
            minDebt: 100,
            LR: 10,
            borrowRate: 0.025,
            totalcoll: 2550.80592500257,
            totaldebt: 118224490.085535,
            maxMint: 500000000
          },
          {
            token: "rovBTC",
            price: 79123.52280466,
            TCR: "2.2739",
            recoveryMode: false,
            MCR: 1.25,
            CCR: 1.5,
            minDebt: 100,
            LR: 10,
            borrowRate: 0.025,
            totalcoll: 81.22528946,
            totaldebt: 2826388.87353035,
            maxMint: 100000000
          }
        ]
      };
  
      const result = await collection.insertOne(initialData);
      res.status(201).json({ message: "Initial metrics2 data seeded", id: result.insertedId });
  
    } catch (error) {
      console.error("Error seeding metrics2 data:", error);
      res.status(500).json({ error: "Failed to seed data" });
    }
  });
  
  

module.exports = router;


// const express = require("express");
// const updateMcrAndCcrInMongoDB = require("./botonix_multi_colletral_sec");
// const { MongoClient } = require("mongodb");
// const router = express.Router();

// const uri = "mongodb+srv://akshay:MYQmTfHcAKlFkHAu@events.s4laexk.mongodb.net/"

// const client = new MongoClient(uri, { useUnifiedTopology: true });

// router.get("/metrics", async (req, res) => {
//     try {
//         const db = client.db("protocol");
//         const collection = db.collection("metrics");

//         const metrics = await collection.find({}).toArray();

//         if (!metrics || metrics.length === 0) {
//             return res.status(404).json({ message: "No metrics found" });
//         }

//         res.json(metrics);
//     } catch (error) {
//         console.error("Error fetching protocol metrics:", error);
//         res.status(500).json({ error: "Internal Server Error" });
//     }
// });


// router.post("/metrics2/update", async (req, res) => {
//     try {
//         const result = await updateMcrAndCcrInMongoDB(); // This updates metrics in DB
//         res.status(200).json({ message: "Metrics updated successfully", data: result });
//     } catch (error) {
//         console.error("Error updating metrics:", error);
//         res.status(500).json({ error: "Internal Server Error" });
//     }
// });


// module.exports = router;
