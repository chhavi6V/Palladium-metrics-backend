const { ethers } = require("ethers");
const { MongoClient } = require("mongodb");
const { formatUnits } = ethers;

const AdminContract_abi1 = require("./AdminContract_multi.json"); // ABI for the contracts
const abi2 = require("./Trove_Manager_multi.json"); // ABI for the contracts
const { mongoUri, dbName } = require("./config");
// Initialize the provider
const provider = new ethers.JsonRpcProvider(
  "https://rpc.ankr.com/botanix_testnet"
);

// Define your contract addresses
const contracts = [
  {
    token: "wBTC",
    contractAddress: "0x36F40faDe724ECd183b6E93F2448de65207b08A2",//admin_contract_address
    abi: AdminContract_abi1,
    assetaddress: "0x321f90864fb21cdcddD0D67FE5e4Cbc812eC9e64",
  },
  {
    token: "rovBTC",
    contractAddress: "0x36F40faDe724ECd183b6E93F2448de65207b08A2",//admin_contract_address
    abi: AdminContract_abi1,
    assetaddress: "0xFE38CACa0D06EA8D42A88E3AE1535Aa34F592bC2",
  },
];


// MongoDB client instance
const client = new MongoClient(mongoUri);

async function updateMcrAndCcrInMongoDB() {
  try {
    await client.connect();
    console.log("Connected to MongoDB");
    const db = client.db(dbName);
    const collection = db.collection("metrics");

    // Get the document that contains the metrics array
    const document = await collection.findOne();

    // Iterate over each metric (collateral) and update MCR and CCR
    for (let i = 0; i < document.metrics.length; i++) {
      const metric = document.metrics[i];
      const contractInfo = contracts.find((c) => c.token === metric.token);

      if (contractInfo) {
        // Create contract instance
        const contractInstance = new ethers.Contract(
          contractInfo.contractAddress,
          contractInfo.abi,
          provider
        );

        console.log( "old",contractInfo.assetaddress)
        const contractInstance2 = new ethers.Contract(
          "0x2Fef509fA966B614483B411f8cA3208C26da3c4",
          abi2,
          provider
        );
        // Fetch MCR and CCR from the contract
        const MCR = await contractInstance.getMcr(contractInfo.assetaddress);
        const CCR = await contractInstance.getCcr(contractInfo.assetaddress);
        const minDebt = await contractInstance.getMinNetDebt(
          contractInfo.assetaddress
        );
        const LR = await contractInstance.getDebtTokenGasCompensation(
          contractInfo.assetaddress
        );
        const mintCap = await contractInstance.getMintCap(contractInfo.assetaddress);




        // const totalcollateral = await contractInstance2.getEntireSystemColl(
        //   contractInfo.assetaddress
        // );
        // const totaldebt = await contractInstance2.getEntireSystemDebt(
        //   contractInfo.assetaddress
        // );
        // Format MCR and CCR values
        const formattedMCR = formatUnits(MCR, 18);
        const formattedCCR = formatUnits(CCR, 18);
        const formattedminDebt = formatUnits(minDebt, 18);
        const formattedLR = formatUnits(LR, 18);
        const mint = parseFloat(formatUnits(mintCap, 18));
        //console.log("getMintcap",mint);

        // const formattedtotalcollateral = ethers.utils.formatUnits(
        //   totalcollateral,
        //   18
        // );

        // const formattedtotaldebt = ethers.utils.formatUnits(totaldebt, 18);

        // Update the metric object with new MCR and CCR values
        metric.MCR = parseFloat(formattedMCR);
        metric.CCR = parseFloat(formattedCCR);
        metric.minDebt = parseFloat(formattedminDebt);
        metric.LR = parseFloat(formattedLR);
        metric.maxMint = mint;
        // metric.totalcoll = parseFloat(formattedtotalcollateral);
        // metric.totaldebt = parseFloat(formattedtotaldebt);

        console.log(
          `Updated ${metric.token}: MCR = ${formattedMCR}, CCR = ${formattedCCR}, minDebt = ${formattedminDebt}, LR = ${formattedLR}`
        );
      }
    }

    // Update the document in MongoDB
    await collection.updateOne(
      { _id: document._id },
      { $set: { metrics: document.metrics } }
    );
    return document.metrics;
    //console.log("MCR and CCR updated successfully.");
  } catch (err) {
    console.error("Error updating MCR and CCR in MongoDB", err);
  } finally {
    await client.close();
    //console.log("MongoDB connection closed.");
    setTimeout(() => {
      updateMcrAndCcrInMongoDB();
    }, 30 * 60 * 1000); // Repeat every 30 minutes
  }
}

module.exports = updateMcrAndCcrInMongoDB;
// Start the update process
// updateMcrAndCcrInMongoDB();

// Handle system signal events (for graceful shutdown)
// process.on("SIGINT", async () => {
//   console.log("SIGINT received.");
//   await client.close();
//   console.log("MongoDB connection closed due to app termination.");
//   process.exit(0);
// });

// process.on("SIGTERM", async () => {
//   console.log("SIGTERM received.");
//   await client.close();
//   console.log("MongoDB connection closed due to app termination.");
//   process.exit(0);
// });
