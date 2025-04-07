const { MongoClient } = require("mongodb");
const { mongoUri, dbName } = require("./config");

const client = new MongoClient(mongoUri);

async function connectDB() {
  try {
    await client.connect();
    console.log("✅ Connected to MongoDB");
    return client.db(dbName);
  } catch (error) {
    console.error("❌ MongoDB Connection Error:", error);
    process.exit(1);
  }
}

module.exports = connectDB;
