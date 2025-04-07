require("dotenv").config();

module.exports = {
  mongoUri: process.env.MONGO_URI,
  dbName: process.env.DB_NAME,
  rpcUrl: process.env.RPC_URL,
  port: process.env.PORT || 3000,
};
