const { ethers } = require("ethers");

const { MongoClient } = require("mongodb");

//const abi1 = require("./Api3.json"); // API3 ABI

const abi2 = require("./fetchPrice_multi.json"); // fetchPrice ABI
const abi3 = require("./Trove_Manager_multi.json"); // VesselManager ABI

// Initialize the provider
const provider = new ethers.providers.JsonRpcProvider(
  "https://rpc.ankr.com/botanix_testnet"
);

// Define your contract addresses and their oracle types
const contracts = [
  {
    token: "wBTC",
    oracleAddress: "0x800755300090fFE065437fe12751910c96452aA4",
    contractAddress: "0x2Fef509fA966B614483B411f8cA3208C26da3c4b",// trove_manager
    abi: abi2, // fetchPrice
    assetaddress: "0x321f90864fb21cdcddD0D67FE5e4Cbc812eC9e64",
    oracleType: 1,
  },
  {
    token: "rovBTC",
    oracleAddress: "0x800755300090fFE065437fe12751910c96452aA4",
    contractAddress: "0x2Fef509fA966B614483B411f8cA3208C26da3c4b",// trove_manager
    abi: abi2, // fetchPrice
    assetaddress: "0xFE38CACa0D06EA8D42A88E3AE1535Aa34F592bC2",
    oracleType: 1,
  },
];

// MongoDB connection details
const mongoUrl ="mongodb://localhost:27017/";
const dbName = "protocol";

// MongoDB client instance
const client = new MongoClient(mongoUrl);

// Function to fetch price from Api3 oracle
async function fetchApi3Price(oracleAddress, assetaddress) {
  const contract = new ethers.Contract(oracleAddress, abi2, provider);
  const data = await contract.fetchPrice(assetaddress);


const test_price = data/10**18;
  
 //console.log("price_BTC",test_price);
   


 
  return test_price;
}


// Update metrics function
async function updateMetricsInMongoDB() {
  try {
    await client.connect();
    console.log("Connected to MongoDB");
    const db = client.db(dbName);
    const collection = db.collection("multi_metrics");

    const document = await collection.findOne();

    for (let i = 0; i < document.metrics.length; i++) {
      const metric = document.metrics[i];
      const contractInfo = contracts.find((c) => c.token === metric.token);

      if (contractInfo) {
        let price, adjustedPrice1;

        // Api3 price fetch
        price = await fetchApi3Price(contractInfo.oracleAddress,contractInfo.assetaddress);
        adjustedPrice1 = price;

       // console.log("price",adjustedPrice1);

        const vesselManager = new ethers.Contract(
          contractInfo.contractAddress,
          abi3,
          provider
        );

        // Fetch TCR using adjustedPrice
        const TCR = await vesselManager.getTCR(
            contractInfo.assetaddress,
            ethers.utils.parseUnits(price.toString(), 18) // Convert to string
          );
        let formattedTCR = ethers.utils.formatUnits(TCR, 18);
       // console.log("tcr",formattedTCR );

        // Fetch recovery mode status
        const recoveryMode = await vesselManager.checkRecoveryMode(
            contractInfo.assetaddress,
            ethers.utils.parseUnits(price.toString(), 18) // Convert to string
          );
       // console.log("recoverymode",recoveryMode);
    
        // Fetch borrow rate
        const borrowRate = await vesselManager.getBorrowingRate(
          contractInfo.assetaddress
        );
        const formattedBorrowRate = ethers.utils.formatUnits(borrowRate, 18);
       // console.log("borrowRate",formattedBorrowRate);

        // Fetch totalCollateral
        const totalCollateral = await vesselManager.getEntireSystemColl(
          contractInfo.assetaddress
        );

     

        const formattedTotalCollateral = ethers.utils.formatUnits(
          totalCollateral,
          18
        );
       // console.log("totalcoll",formattedTotalCollateral);

        // Fetch totalDebts
        const totalDebt = await vesselManager.getEntireSystemDebt(
          contractInfo.assetaddress
        );
        const formattedTotalDebt = ethers.utils.formatUnits(totalDebt, 18);

       // console.log("totalDebt", formattedTotalDebt);

        // Update the metric object with new data
        metric.price = parseFloat(adjustedPrice1);
        metric.TCR = parseFloat(formattedTCR).toFixed(4);
        metric.recoveryMode = recoveryMode;
        metric.borrowRate = parseFloat(formattedBorrowRate);
        metric.totalcoll = parseFloat(formattedTotalCollateral);
        metric.totaldebt = parseFloat(formattedTotalDebt);

        //console.log("price", metric.price);
      }
    }

    await collection.updateOne(
      { _id: document._id },
      { $set: { metrics: document.metrics } }
    );

    console.log("Metrics updated successfully.");
  } catch (err) {
    console.error("Error updating metrics in MongoDB", err);
  } finally {
    await client.close();
    console.log("MongoDB connection closed.");
    setTimeout(() => {
      updateMetricsInMongoDB();
    }, 5 * 60 * 1000);
  }
}

updateMetricsInMongoDB();

// Handle system signal events (for graceful shutdown)
process.on("SIGINT", async () => {
  console.log("SIGINT received.");
  await client.close();
  console.log("MongoDB connection closed due to app termination.");
  process.exit(0);
});

process.on("SIGTERM", async () => {
  console.log("SIGTERM received.");
  await client.close();
  console.log("MongoDB connection closed due to app termination.");
  process.exit(0);
});
